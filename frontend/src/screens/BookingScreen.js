import React, { useState } from "react";
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TextInput, TouchableOpacity, Platform,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { crossAlert } from "../utils/alert";
import { createBooking } from "../services/bookingApi";
import { getUser } from "../services/authApi";

const BookingScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { service } = route.params;
  const user = getUser();

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [phone, setPhone] = useState(user?.phone || "");
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!date) return crossAlert("Missing Date", "Please enter the date for the service.");
    if (!time) return crossAlert("Missing Time", "Please enter a preferred time slot.");
    if (!location) return crossAlert("Missing Location", "Please enter your address/location.");

    setLoading(true);
    try {
      await createBooking({
        serviceId: service._id,
        providerId: service.provider?._id || service.provider,
        date,
        time,
        location,
        notes,
        phone,
      });
      crossAlert("Booking Requested", "Your booking has been requested successfully! The provider will confirm shortly.", [
        { text: "OK", onPress: () => navigation.navigate("Services") },
      ]);
    } catch (e) {
      crossAlert("Error", e.message);
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.scroll}>
        {/* Service Info Card */}
        <View style={s.serviceCard}>
          <View style={s.serviceIconWrap}>
            <Ionicons name="construct" size={28} color="#135E4B" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.serviceName}>{service.title}</Text>
            <Text style={s.providerName}>
              {service.provider?.firstName
                ? `${service.provider.firstName} ${service.provider.lastName || ""}`
                : "Service Provider"}
            </Text>
            <Text style={s.servicePrice}>LKR {service.price}</Text>
          </View>
        </View>

        {/* Booking Form */}
        <Text style={s.sectionTitle}>Booking Details</Text>

        <Text style={s.label}>Date *</Text>
        <TextInput
          style={s.input}
          placeholder="e.g. 2026-05-15"
          placeholderTextColor="#999"
          value={date}
          onChangeText={setDate}
        />

        <Text style={s.label}>Time *</Text>
        <TextInput
          style={s.input}
          placeholder="e.g. 10:00 AM - 12:00 PM"
          placeholderTextColor="#999"
          value={time}
          onChangeText={setTime}
        />

        <Text style={s.label}>Location / Address *</Text>
        <TextInput
          style={[s.input, { minHeight: 60, textAlignVertical: "top" }]}
          placeholder="Enter your full address"
          placeholderTextColor="#999"
          value={location}
          onChangeText={setLocation}
          multiline
        />

        <Text style={s.label}>Notes / Instructions</Text>
        <TextInput
          style={[s.input, { minHeight: 60, textAlignVertical: "top" }]}
          placeholder='e.g. "Bring tools", "Urgent", etc.'
          placeholderTextColor="#999"
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        <Text style={s.sectionTitle}>Contact Info</Text>

        <Text style={s.label}>Phone Number</Text>
        <TextInput
          style={s.input}
          placeholder="e.g. 077 123 4567"
          placeholderTextColor="#999"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        {/* Confirm Button */}
        <TouchableOpacity
          style={[s.confirmBtn, loading && { opacity: 0.6 }]}
          onPress={handleConfirm}
          disabled={loading}
        >
          <Ionicons name="checkmark-circle" size={22} color="#fff" />
          <Text style={s.confirmBtnText}>
            {loading ? "Submitting..." : "Confirm Booking"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default BookingScreen;

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#CCDCDB" },
  scroll: { padding: 16, paddingBottom: 40 },
  // Service Info Card
  serviceCard: {
    backgroundColor: "#fff", borderRadius: 16, padding: 18,
    flexDirection: "row", alignItems: "center", marginBottom: 20,
    elevation: 2, shadowColor: "#000", shadowOpacity: 0.08,
    shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
  },
  serviceIconWrap: {
    width: 52, height: 52, borderRadius: 14, backgroundColor: "#D1FAE5",
    alignItems: "center", justifyContent: "center", marginRight: 14,
  },
  serviceName: { fontSize: 18, fontWeight: "bold", color: "#135E4B" },
  providerName: { fontSize: 14, color: "#4CB572", marginTop: 2 },
  servicePrice: { fontSize: 16, fontWeight: "bold", color: "#135E4B", marginTop: 4 },
  // Form
  sectionTitle: {
    fontSize: 17, fontWeight: "bold", color: "#135E4B",
    marginBottom: 12, marginTop: 8,
  },
  label: { fontSize: 13, fontWeight: "600", color: "#135E4B", marginBottom: 4 },
  input: {
    backgroundColor: "#fff", borderRadius: 12, padding: 14,
    marginBottom: 14, fontSize: 15, color: "#000",
    borderWidth: 1, borderColor: "#E0E0E0",
  },
  // Confirm Button
  confirmBtn: {
    backgroundColor: "#4CB572", borderRadius: 14, paddingVertical: 16,
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    marginTop: 10, elevation: 2,
  },
  confirmBtnText: {
    color: "#fff", fontSize: 17, fontWeight: "bold", marginLeft: 8,
  },
});
