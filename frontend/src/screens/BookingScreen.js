import React, { useState } from "react";
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TextInput, TouchableOpacity, Platform,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { crossAlert } from "../utils/alert";
import { createBooking } from "../services/bookingApi";
import { getUser } from "../services/authApi";

const BookingScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { service } = route.params;
  const user = getUser();

  // Date & Time state
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Form state
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  // Minimum date = today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // ── Date Picker Handler ──
  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === "ios"); // keep open on iOS
    if (event.type === "dismissed") return;
    if (selectedDate) {
      // Check if date is in the past
      const selected = new Date(selectedDate);
      selected.setHours(0, 0, 0, 0);
      if (selected < today) {
        crossAlert("Invalid Date", "You cannot select a past date. Please choose today or a future date.");
        return;
      }
      setDate(selectedDate);
    }
  };

  // ── Time Picker Handler ──
  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(Platform.OS === "ios"); // keep open on iOS
    if (event.type === "dismissed") return;
    if (selectedTime) {
      // If selected date is today, check if time is in the past
      if (date) {
        const now = new Date();
        const selDate = new Date(date);
        selDate.setHours(0, 0, 0, 0);
        const todayCopy = new Date();
        todayCopy.setHours(0, 0, 0, 0);

        if (selDate.getTime() === todayCopy.getTime()) {
          // Same day — check time
          if (selectedTime.getHours() < now.getHours() ||
            (selectedTime.getHours() === now.getHours() && selectedTime.getMinutes() <= now.getMinutes())) {
            crossAlert("Invalid Time", "You cannot select a past time for today. Please choose a later time.");
            return;
          }
        }
      }
      setTime(selectedTime);
    }
  };

  // ── Format helpers ──
  const formatDate = (d) => {
    if (!d) return "";
    const day = String(d.getDate()).padStart(2, "0");
    const mon = String(d.getMonth() + 1).padStart(2, "0");
    return `${d.getFullYear()}-${mon}-${day}`;
  };

  const formatTime = (t) => {
    if (!t) return "";
    let h = t.getHours();
    const m = String(t.getMinutes()).padStart(2, "0");
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${m} ${ampm}`;
  };

  // ── Validation & Submit ──
  const handleConfirm = async () => {
    if (!date) return crossAlert("Missing Date", "Please select a date for the service.");
    if (!time) return crossAlert("Missing Time", "Please select a preferred time slot.");
    if (!location.trim()) return crossAlert("Missing Location", "Please enter your address/location.");
    if (location.trim().length > 50) return crossAlert("Location Too Long", "Location must be 50 characters or less.");
    if (!phone.trim()) return crossAlert("Missing Phone", "Please enter your phone number.");
    if (!/^\d{10}$/.test(phone.trim())) return crossAlert("Invalid Phone", "Phone number must be exactly 10 digits (numbers only).");

    setLoading(true);
    try {
      await createBooking({
        serviceId: service._id,
        providerId: service.provider?._id || service.provider,
        date: formatDate(date),
        time: formatTime(time),
        location: location.trim(),
        notes: notes.trim(),
        phone: phone.trim(),
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

        {/* ── Booking Details ── */}
        <Text style={s.sectionTitle}>Booking Details</Text>

        {/* Date Picker */}
        <Text style={s.label}>Date <Text style={s.required}>*</Text></Text>
        <TouchableOpacity style={s.pickerBtn} onPress={() => setShowDatePicker(true)}>
          <Ionicons name="calendar-outline" size={20} color="#135E4B" />
          <Text style={[s.pickerText, !date && s.placeholderText]}>
            {date ? formatDate(date) : "Select date"}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={date || new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            minimumDate={today}
            onChange={onDateChange}
          />
        )}

        {/* Time Picker */}
        <Text style={s.label}>Time <Text style={s.required}>*</Text></Text>
        <TouchableOpacity style={s.pickerBtn} onPress={() => setShowTimePicker(true)}>
          <Ionicons name="time-outline" size={20} color="#135E4B" />
          <Text style={[s.pickerText, !time && s.placeholderText]}>
            {time ? formatTime(time) : "Select time"}
          </Text>
        </TouchableOpacity>
        {showTimePicker && (
          <DateTimePicker
            value={time || new Date()}
            mode="time"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onTimeChange}
          />
        )}

        {/* Location */}
        <Text style={s.label}>Location / Address <Text style={s.required}>*</Text></Text>
        <TextInput
          style={[s.input, { minHeight: 60, textAlignVertical: "top" }]}
          placeholder="Enter your full address (max 50 chars)"
          placeholderTextColor="#999"
          value={location}
          onChangeText={(t) => setLocation(t.slice(0, 50))}
          multiline
          maxLength={50}
        />
        <Text style={s.charCount}>{location.length}/50</Text>

        {/* Notes */}
        <Text style={s.label}>Notes / Instructions <Text style={s.optional}>(optional)</Text></Text>
        <TextInput
          style={[s.input, { minHeight: 60, textAlignVertical: "top" }]}
          placeholder='e.g. "Bring tools", "Urgent", etc.'
          placeholderTextColor="#999"
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        {/* ── Contact Info ── */}
        <Text style={s.sectionTitle}>Contact Info</Text>

        <Text style={s.label}>Phone Number <Text style={s.required}>*</Text></Text>
        <TextInput
          style={s.input}
          placeholder="e.g. 0771234567 (10 digits)"
          placeholderTextColor="#999"
          value={phone}
          onChangeText={(t) => setPhone(t.replace(/[^0-9]/g, "").slice(0, 10))}
          keyboardType="phone-pad"
          maxLength={10}
        />
        {phone.length > 0 && phone.length < 10 && (
          <Text style={s.validationHint}>Phone must be 10 digits ({phone.length}/10)</Text>
        )}

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
  required: { color: "#EF4444", fontSize: 13 },
  optional: { color: "#999", fontWeight: "400", fontSize: 12 },
  input: {
    backgroundColor: "#fff", borderRadius: 12, padding: 14,
    marginBottom: 4, fontSize: 15, color: "#000",
    borderWidth: 1, borderColor: "#E0E0E0",
  },
  charCount: { fontSize: 11, color: "#999", textAlign: "right", marginBottom: 10 },
  validationHint: { fontSize: 12, color: "#EF4444", marginBottom: 10, marginTop: 2 },
  // Picker button
  pickerBtn: {
    backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 14,
    flexDirection: "row", alignItems: "center",
    borderWidth: 1, borderColor: "#E0E0E0",
  },
  pickerText: { fontSize: 15, color: "#000", marginLeft: 10 },
  placeholderText: { color: "#999" },
  // Confirm Button
  confirmBtn: {
    backgroundColor: "#4CB572", borderRadius: 14, paddingVertical: 16,
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    marginTop: 16, elevation: 2,
  },
  confirmBtnText: {
    color: "#fff", fontSize: 17, fontWeight: "bold", marginLeft: 8,
  },
});
