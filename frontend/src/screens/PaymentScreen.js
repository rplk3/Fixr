import React, { useState, useMemo } from "react";
import {
  View, Text, StyleSheet, SafeAreaView,
  TextInput, TouchableOpacity, ActivityIndicator, Platform
} from "react-native";
import KeyboardAwareScrollView from "../components/KeyboardAwareScrollView";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { crossAlert } from "../utils/alert";
import { createPayment } from "../services/bookingApi";

const PaymentScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { booking } = route.params;

  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState(""); // stored as raw digits
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [loading, setLoading] = useState(false);

  // Track touched fields to show errors only after user interacts
  const [touched, setTouched] = useState({});

  // ── Formatters ────────────────────────────────────────────
  const handleCardNameChange = (text) => {
    const formatted = text.replace(/[^a-zA-Z\s]/g, "").slice(0, 26);
    setCardName(formatted);
  };

  const handleCardNumberChange = (text) => {
    const digits = text.replace(/[^0-9]/g, "").slice(0, 16);
    setCardNumber(digits);
  };

  // Display card number with spaces: "1234 5678 9012 3456"
  const displayCardNumber = cardNumber
    .replace(/(.{4})/g, "$1 ")
    .trim();

  const handleExpiryChange = (text) => {
    const digits = text.replace(/[^0-9]/g, "").slice(0, 4);
    if (digits.length >= 3) {
      setExpiry(`${digits.slice(0, 2)}/${digits.slice(2)}`);
    } else {
      setExpiry(digits);
    }
  };

  const handleCvvChange = (text) => {
    const formatted = text.replace(/[^0-9]/g, "").slice(0, 3);
    setCvv(formatted);
  };

  // ── Validation ────────────────────────────────────────────
  const errors = useMemo(() => {
    const e = {};

    if (!cardName.trim() || cardName.trim().length < 3) {
      e.cardName = "Cardholder name must be at least 3 characters.";
    }

    if (!cardNumber) {
      e.cardNumber = "Card number is required.";
    } else if (cardNumber.length !== 16) {
      e.cardNumber = "Card number must be exactly 16 digits.";
    }

    if (!expiry) {
      e.expiry = "Expiry date is required.";
    } else if (expiry.length < 5) {
      e.expiry = "Enter expiry in MM/YY format.";
    } else {
      const [monthStr, yearStr] = expiry.split("/");
      const month = parseInt(monthStr, 10);
      const year = parseInt(`20${yearStr}`, 10);
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      if (month < 1 || month > 12) {
        e.expiry = "Month must be between 01 and 12.";
      } else if (year < currentYear || (year === currentYear && month < currentMonth)) {
        e.expiry = "Card has expired. Enter a future date.";
      }
    }

    if (!cvv) {
      e.cvv = "CVV is required.";
    } else if (cvv.length !== 3) {
      e.cvv = "CVV must be 3 digits.";
    }

    return e;
  }, [cardName, cardNumber, expiry, cvv]);

  const isValid = Object.keys(errors).length === 0;

  const markTouched = (field) => setTouched((t) => ({ ...t, [field]: true }));

  // ── Submit ────────────────────────────────────────────────
  const handleConfirm = async () => {
    // Mark all fields touched to show all errors
    setTouched({ cardName: true, cardNumber: true, expiry: true, cvv: true });

    if (!isValid) {
      crossAlert("Validation Error", "Please fix the errors below before submitting.");
      return;
    }

    setLoading(true);
    try {
      await createPayment({
        bookingId: booking._id,
        amount: booking.service.price,
        paymentMethod: "card",
        cardHolderName: cardName.trim(),
        cardLastFour: cardNumber.slice(-4),
      });
      crossAlert("Payment Successful", "Your payment has been processed successfully.", [
        { text: "OK", onPress: () => navigation.navigate("Services") },
      ]);
    } catch (error) {
      crossAlert("Payment Failed", error.message || "Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  // ── Helper: input style with error ───────────────────────
  const inputStyle = (field) => [
    s.input,
    touched[field] && errors[field] ? s.inputError : null,
  ];

  return (
    <SafeAreaView style={s.container}>
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 5 }}>
          <Ionicons name="arrow-back" size={24} color="#135E4B" />
        </TouchableOpacity>
        <Text style={s.screenTitle}>Payment</Text>
        <View style={{ width: 30 }} />
      </View>

      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
        keyboardShouldPersistTaps="handled"
      >
          {/* Booking Summary */}
          <View style={s.summaryCard}>
            <Text style={s.summaryTitle}>Booking Summary</Text>
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
              <Text style={[s.label, { fontSize: 15, color: "#135E4B", fontWeight: "700" }]}>Total:</Text>
              <Text style={[s.value, { fontSize: 18, color: "#135E4B" }]}>LKR {booking.service.price}</Text>
            </View>
          </View>

          {/* Payment Method */}
          <Text style={s.sectionTitle}>Payment Details</Text>
          <View style={s.methodContainer}>
            <View style={[s.methodBtn, s.methodBtnActive]}>
              <Ionicons name="card" size={20} color="#135E4B" />
              <Text style={s.methodText}>Credit / Debit Card</Text>
            </View>
          </View>

          {/* Cardholder Name */}
          <Text style={s.inputLabel}>Cardholder Name</Text>
          <TextInput
            style={inputStyle("cardName")}
            placeholder="e.g. John Doe"
            placeholderTextColor="#999"
            value={cardName}
            onChangeText={handleCardNameChange}
            onBlur={() => markTouched("cardName")}
            maxLength={26}
          />
          {touched.cardName && errors.cardName ? (
            <Text style={s.errorText}>{errors.cardName}</Text>
          ) : null}

          {/* Card Number */}
          <Text style={s.inputLabel}>Card Number <Text style={s.hint}>(16 digits)</Text></Text>
          <View style={[s.inputWrapper, touched.cardNumber && errors.cardNumber ? s.inputWrapperError : null]}>
            <Ionicons name="card-outline" size={20} color="#999" style={s.inputIcon} />
            <TextInput
              style={{ flex: 1, fontSize: 16, color: "#000", paddingVertical: 14, paddingRight: 14, letterSpacing: 2 }}
              placeholder="0000 0000 0000 0000"
              placeholderTextColor="#999"
              value={displayCardNumber}
              onChangeText={handleCardNumberChange}
              onBlur={() => markTouched("cardNumber")}
              keyboardType="number-pad"
              maxLength={19} // 16 digits + 3 spaces
            />
          </View>
          {touched.cardNumber && errors.cardNumber ? (
            <Text style={s.errorText}>{errors.cardNumber}</Text>
          ) : null}

          {/* Expiry & CVV */}
          <View style={s.halfRow}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={s.inputLabel}>Expiry Date <Text style={s.hint}>(MM/YY)</Text></Text>
              <TextInput
                style={inputStyle("expiry")}
                placeholder="MM/YY"
                placeholderTextColor="#999"
                value={expiry}
                onChangeText={handleExpiryChange}
                onBlur={() => markTouched("expiry")}
                keyboardType="number-pad"
                maxLength={5}
              />
              {touched.expiry && errors.expiry ? (
                <Text style={s.errorText}>{errors.expiry}</Text>
              ) : null}
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={s.inputLabel}>CVV <Text style={s.hint}>(3 digits)</Text></Text>
              <TextInput
                style={inputStyle("cvv")}
                placeholder="123"
                placeholderTextColor="#999"
                value={cvv}
                onChangeText={handleCvvChange}
                onBlur={() => markTouched("cvv")}
                keyboardType="number-pad"
                secureTextEntry
                maxLength={3}
              />
              {touched.cvv && errors.cvv ? (
                <Text style={s.errorText}>{errors.cvv}</Text>
              ) : null}
            </View>
          </View>

          {/* Secure Notice */}
          <View style={s.secureRow}>
            <Ionicons name="shield-checkmark" size={14} color="#10B981" />
            <Text style={s.secureText}>Your payment info is secured with 256-bit encryption</Text>
          </View>

          {/* Pay Button */}
          <TouchableOpacity
            style={[s.confirmBtn, (!isValid || loading) && s.confirmBtnDisabled]}
            onPress={handleConfirm}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="lock-closed" size={18} color="#fff" style={{ marginRight: 8 }} />
                <Text style={s.confirmBtnText}>Pay Now — LKR {booking.service.price}</Text>
              </>
            )}
          </TouchableOpacity>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default PaymentScreen;

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#CCDCDB" },
  topBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 14, backgroundColor: "#fff",
    borderBottomWidth: 1, borderBottomColor: "#E0E0E0",
  },
  screenTitle: { fontSize: 18, fontWeight: "bold", color: "#135E4B" },
  scroll: { padding: 16, paddingBottom: 50 },

  summaryCard: {
    backgroundColor: "#fff", borderRadius: 16, padding: 20, marginBottom: 24,
    elevation: 3, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
  },
  summaryTitle: { fontSize: 15, fontWeight: "700", color: "#888", marginBottom: 14 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  divider: { height: 1, backgroundColor: "#F0F0F0", marginVertical: 10 },
  label: { fontSize: 14, color: "#666" },
  value: { fontSize: 14, fontWeight: "600", color: "#333" },

  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#135E4B", marginBottom: 14 },

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
    backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 4,
    fontSize: 15, color: "#000", borderWidth: 1.5, borderColor: "#E0E0E0",
  },
  inputError: { borderColor: "#EF4444" },
  inputWrapper: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#fff",
    borderRadius: 12, borderWidth: 1.5, borderColor: "#E0E0E0", marginBottom: 4,
  },
  inputWrapperError: { borderColor: "#EF4444" },
  inputIcon: { paddingLeft: 14 },
  halfRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },

  errorText: { fontSize: 12, color: "#EF4444", marginBottom: 10, marginTop: 2 },

  secureRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 12, marginBottom: 4 },
  secureText: { fontSize: 12, color: "#10B981", marginLeft: 6 },

  confirmBtn: {
    backgroundColor: "#135E4B", borderRadius: 14, paddingVertical: 16,
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    marginTop: 20, elevation: 3,
  },
  confirmBtnDisabled: { backgroundColor: "#9CA3AF" },
  confirmBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
