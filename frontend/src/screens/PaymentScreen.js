import React, { useState } from "react";
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { crossAlert } from "../utils/alert";
import { createPayment } from "../services/bookingApi";

const PaymentScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { booking } = route.params;

  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCardNameChange = (text) => {
    // Only letters and spaces, max 20 chars
    const formatted = text.replace(/[^a-zA-Z\s]/g, "").slice(0, 20);
    setCardName(formatted);
  };

  const handleCardNumberChange = (text) => {
    // Only numbers, max 16 digits
    const formatted = text.replace(/[^0-9]/g, "").slice(0, 16);
    setCardNumber(formatted);
  };

  const handleExpiryChange = (text) => {
    // MM/YY format
    let formatted = text.replace(/[^0-9]/g, "").slice(0, 4);
    if (formatted.length >= 3) {
      formatted = `${formatted.slice(0, 2)}/${formatted.slice(2)}`;
    }
    setExpiry(formatted);
  };

  const handleCvvChange = (text) => {
    // Only numbers, max 3 digits
    const formatted = text.replace(/[^0-9]/g, "").slice(0, 3);
    setCvv(formatted);
  };

  const validateExpiry = (exp) => {
    if (exp.length !== 5) return false;
    const [monthStr, yearStr] = exp.split("/");
    const month = parseInt(monthStr, 10);
    const year = parseInt(`20${yearStr}`, 10);
    
    if (month < 1 || month > 12) return false;
    
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-12
    
    if (year < currentYear) return false;
    if (year === currentYear && month < currentMonth) return false;
    if (year > currentYear + 20) return false; // Basic sanity check
    
    return true;
  };

  const handleConfirm = async () => {
    if (!cardName.trim() || cardName.length < 3) {
      return crossAlert("Invalid Name", "Please enter a valid cardholder name.");
    }
    if (cardNumber.length !== 16) {
      return crossAlert("Invalid Card", "Card number must be 16 digits.");
    }
    if (!validateExpiry(expiry)) {
      return crossAlert("Invalid Expiry", "Please enter a valid future expiry date (MM/YY).");
    }
    if (cvv.length !== 3) {
      return crossAlert("Invalid CVV", "CVV must be 3 digits.");
    }

    setLoading(true);
    try {
      await createPayment({
        bookingId: booking._id,
        amount: booking.service.price,
        paymentMethod: paymentMethod,
        cardHolderName: cardName.trim(),
        cardLastFour: cardNumber.slice(-4)
      });
      
      crossAlert("Payment Successful", "Your payment has been processed successfully.", [
        { text: "OK", onPress: () => navigation.navigate("Services") }
      ]);
    } catch (error) {
      crossAlert("Payment Failed", error.message || "Something went wrong.");
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 5 }}>
          <Ionicons name="arrow-back" size={24} color="#135E4B" />
        </TouchableOpacity>
        <Text style={s.screenTitle}>Payment</Text>
        <View style={{ width: 30 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
      <ScrollView contentContainerStyle={s.scroll}>
        {/* Booking Details Card */}
        <View style={s.detailsCard}>
          <Text style={s.cardTitle}>Booking Summary</Text>
          
          <View style={s.row}>
            <Text style={s.label}>Booking ID:</Text>
            <Text style={s.value}>{booking._id.slice(-8).toUpperCase()}</Text>
          </View>
          <View style={s.divider} />
          
          <View style={s.row}>
            <Text style={s.label}>Service:</Text>
            <Text style={s.value}>{booking.service.title}</Text>
          </View>
          <View style={s.divider} />
          
          <View style={s.row}>
            <Text style={s.label}>Provider:</Text>
            <Text style={s.value}>{booking.provider.firstName} {booking.provider.lastName}</Text>
          </View>
          <View style={s.divider} />
          
          <View style={s.row}>
            <Text style={[s.label, { fontSize: 16, color: "#135E4B" }]}>Total Amount:</Text>
            <Text style={[s.value, { fontSize: 18, fontWeight: "bold", color: "#135E4B" }]}>
              LKR {booking.service.price}
            </Text>
          </View>
        </View>

        {/* Payment Form */}
        <Text style={s.sectionTitle}>Payment Details</Text>

        <Text style={s.inputLabel}>Payment Method</Text>
        <View style={s.methodContainer}>
          <TouchableOpacity style={[s.methodBtn, s.methodBtnActive]}>
            <Ionicons name="card" size={20} color="#135E4B" />
            <Text style={s.methodText}>Credit / Debit Card</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.inputLabel}>Cardholder Name <Text style={s.hint}>(letters only, max 20)</Text></Text>
        <TextInput
          style={s.input}
          placeholder="e.g. John Doe"
          placeholderTextColor="#999"
          value={cardName}
          onChangeText={handleCardNameChange}
          maxLength={20}
        />

        <Text style={s.inputLabel}>Card Number <Text style={s.hint}>(16 digits)</Text></Text>
        <View style={s.inputWrapper}>
          <Ionicons name="card-outline" size={20} color="#999" style={s.inputIcon} />
          <TextInput
            style={[s.input, { flex: 1, marginBottom: 0, borderWidth: 0 }]}
            placeholder="0000 0000 0000 0000"
            placeholderTextColor="#999"
            value={cardNumber}
            onChangeText={handleCardNumberChange}
            keyboardType="number-pad"
            maxLength={16}
          />
        </View>

        <View style={s.halfRow}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={s.inputLabel}>Expiry Date <Text style={s.hint}>(MM/YY)</Text></Text>
            <TextInput
              style={s.input}
              placeholder="MM/YY"
              placeholderTextColor="#999"
              value={expiry}
              onChangeText={handleExpiryChange}
              keyboardType="number-pad"
              maxLength={5}
            />
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={s.inputLabel}>CVV <Text style={s.hint}>(3 digits)</Text></Text>
            <TextInput
              style={s.input}
              placeholder="123"
              placeholderTextColor="#999"
              value={cvv}
              onChangeText={handleCvvChange}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={3}
            />
          </View>
        </View>

        <TouchableOpacity 
          style={[s.confirmBtn, loading && { opacity: 0.7 }]}
          onPress={handleConfirm}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="lock-closed" size={18} color="#fff" style={{ marginRight: 8 }} />
              <Text style={s.confirmBtnText}>Pay LKR {booking.service.price}</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PaymentScreen;

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#CCDCDB" },
  topBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 14, backgroundColor: "#fff",
    borderBottomWidth: 1, borderBottomColor: "#E0E0E0"
  },
  screenTitle: { fontSize: 18, fontWeight: "bold", color: "#135E4B" },
  scroll: { padding: 16, paddingBottom: 40 },
  detailsCard: {
    backgroundColor: "#fff", borderRadius: 16, padding: 20, marginBottom: 24,
    elevation: 3, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 5, shadowOffset: { width: 0, height: 2 },
  },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: "#666", marginBottom: 16 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  divider: { height: 1, backgroundColor: "#F0F0F0", marginVertical: 12 },
  label: { fontSize: 14, color: "#666" },
  value: { fontSize: 14, fontWeight: "600", color: "#333" },
  
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#135E4B", marginBottom: 16 },
  
  methodContainer: { flexDirection: "row", marginBottom: 20 },
  methodBtn: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#fff",
    paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, borderWidth: 1, borderColor: "#E0E0E0",
  },
  methodBtnActive: { borderColor: "#135E4B", backgroundColor: "#E8F5E9" },
  methodText: { marginLeft: 8, fontSize: 15, fontWeight: "600", color: "#135E4B" },
  
  inputLabel: { fontSize: 13, fontWeight: "600", color: "#135E4B", marginBottom: 6 },
  hint: { fontSize: 11, color: "#999", fontWeight: "normal" },
  input: {
    backgroundColor: "#fff", borderRadius: 12, padding: 14,
    marginBottom: 16, fontSize: 15, color: "#000",
    borderWidth: 1, borderColor: "#E0E0E0",
  },
  inputWrapper: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#fff",
    borderRadius: 12, borderWidth: 1, borderColor: "#E0E0E0", marginBottom: 16,
  },
  inputIcon: { paddingLeft: 14 },
  halfRow: { flexDirection: "row", justifyContent: "space-between" },
  
  confirmBtn: {
    backgroundColor: "#4CB572", borderRadius: 14, paddingVertical: 16,
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    marginTop: 20, elevation: 2,
  },
  confirmBtnText: { color: "#fff", fontSize: 17, fontWeight: "bold" },
});
