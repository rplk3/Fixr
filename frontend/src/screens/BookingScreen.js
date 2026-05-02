import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TextInput, TouchableOpacity, Platform, Modal, FlatList
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { crossAlert } from "../utils/alert";
import { createBooking } from "../services/bookingApi";
import { getServiceReviews } from "../services/reviewApi";
import { getUser } from "../services/authApi";
import { WebDateInput, WebTimeInput } from "../components/WebInputs";

// Only import DateTimePicker on native platforms
let DateTimePicker = null;
if (Platform.OS !== "web") {
  DateTimePicker = require("@react-native-community/datetimepicker").default;
}

const BookingScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { service } = route.params;
  const user = getUser();

  // Date & Time state
  const [date, setDate] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  // Form state
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  // Reviews State
  const [reviews, setReviews] = useState([]);
  const [reviewsModalVisible, setReviewsModalVisible] = useState(false);

  // Minimum date = today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await getServiceReviews(service._id);
        setReviews(data);
      } catch (e) {
        console.log("Failed to fetch reviews", e);
      }
    };
    fetchReviews();
  }, [service._id]);

  // ── Date Picker Handler ──
  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === "ios");
    if (event.type === "dismissed") return;
    if (selectedDate) {
      const selected = new Date(selectedDate);
      selected.setHours(0, 0, 0, 0);
      if (selected < today) {
        crossAlert("Invalid Date", "You cannot select a past date. Please choose today or a future date.");
        return;
      }
      setDate(selectedDate);
    }
  };

  const validateTime = (selectedTime) => {
    if (date) {
      const now = new Date();
      const selDate = new Date(date);
      selDate.setHours(0, 0, 0, 0);
      const todayCopy = new Date();
      todayCopy.setHours(0, 0, 0, 0);

      if (selDate.getTime() === todayCopy.getTime()) {
        if (selectedTime.getHours() < now.getHours() ||
          (selectedTime.getHours() === now.getHours() && selectedTime.getMinutes() <= now.getMinutes())) {
          return false;
        }
      }
    }
    return true;
  };

  // ── Time Picker Handlers ──
  const onStartTimeChange = (event, selectedTime) => {
    setShowStartTimePicker(Platform.OS === "ios");
    if (event.type === "dismissed") return;
    if (selectedTime) {
      if (!validateTime(selectedTime)) {
        crossAlert("Invalid Time", "You cannot select a past time for today.");
        return;
      }
      setStartTime(selectedTime);
    }
  };

  const onEndTimeChange = (event, selectedTime) => {
    setShowEndTimePicker(Platform.OS === "ios");
    if (event.type === "dismissed") return;
    if (selectedTime) {
      if (!validateTime(selectedTime)) {
        crossAlert("Invalid Time", "You cannot select a past time for today.");
        return;
      }
      if (startTime && selectedTime <= startTime) {
        crossAlert("Invalid Time", "End time must be after start time.");
        return;
      }
      setEndTime(selectedTime);
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

  const formatTimeWeb = (t) => {
    if (!t) return "";
    return `${String(t.getHours()).padStart(2, "0")}:${String(t.getMinutes()).padStart(2, "0")}`;
  };

  // ── Validation & Submit ──
  const handleConfirm = async () => {
    if (!date) return crossAlert("Missing Date", "Please select a date for the service.");
    if (!startTime) return crossAlert("Missing Start Time", "Please select a start time.");
    if (!endTime) return crossAlert("Missing End Time", "Please select an end time.");
    if (!location.trim()) return crossAlert("Missing Location", "Please enter your address/location.");
    if (location.trim().length > 50) return crossAlert("Location Too Long", "Location must be 50 characters or less.");
    if (!phone.trim()) return crossAlert("Missing Phone", "Please enter your phone number.");
    if (!/^\d{10}$/.test(phone.trim())) return crossAlert("Invalid Phone", "Phone number must be exactly 10 digits (numbers only).");

    setLoading(true);
    try {
      const timeString = `${formatTime(startTime)} to ${formatTime(endTime)}`;
      await createBooking({
        serviceId: service._id,
        providerId: service.provider?._id || service.provider,
        date: formatDate(date),
        time: timeString,
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

  const renderReviewItem = ({ item }) => (
    <View style={s.reviewCard}>
      <View style={s.reviewHeader}>
        <View style={s.reviewAuthorRow}>
          <View style={s.avatarCircle}>
            <Text style={s.avatarInitial}>{item.customer?.firstName?.[0] || "U"}</Text>
          </View>
          <Text style={s.reviewerName}>{item.customer?.firstName} {item.customer?.lastName}</Text>
        </View>
        <View style={s.starRow}>
          <Ionicons name="star" size={14} color="#F59E0B" />
          <Text style={s.starText}>{item.rating}</Text>
        </View>
      </View>
      <Text style={s.reviewComment}>{item.comment}</Text>
    </View>
  );

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
        {Platform.OS === "web" ? (
          <WebDateInput
            value={date ? formatDate(date) : ""}
            min={formatDate(today)}
            onChange={(val) => {
              if (val) {
                const parts = val.split("-");
                const selected = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                selected.setHours(0, 0, 0, 0);
                if (selected < today) {
                  crossAlert("Invalid Date", "You cannot select a past date.");
                } else {
                  setDate(selected);
                }
              }
            }}
          />
        ) : (
          <>
            <TouchableOpacity style={s.pickerBtn} onPress={() => setShowDatePicker(true)}>
              <Ionicons name="calendar-outline" size={20} color="#135E4B" />
              <Text style={[s.pickerText, !date && s.placeholderText]}>
                {date ? formatDate(date) : "Select date"}
              </Text>
            </TouchableOpacity>
            {showDatePicker && DateTimePicker && (
              <DateTimePicker
                value={date || new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                minimumDate={today}
                onChange={onDateChange}
              />
            )}
          </>
        )}

        <View style={s.timeRow}>
          {/* Start Time Picker */}
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={s.label}>Start Time <Text style={s.required}>*</Text></Text>
            {Platform.OS === "web" ? (
              <WebTimeInput
                value={startTime ? formatTimeWeb(startTime) : ""}
                onChange={(val) => {
                  if (val) {
                    const [hours, minutes] = val.split(":");
                    const newTime = new Date();
                    newTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                    if (!validateTime(newTime)) {
                      crossAlert("Invalid Time", "You cannot select a past time for today.");
                      return;
                    }
                    setStartTime(newTime);
                  }
                }}
              />
            ) : (
              <>
                <TouchableOpacity style={s.pickerBtn} onPress={() => setShowStartTimePicker(true)}>
                  <Ionicons name="time-outline" size={20} color="#135E4B" />
                  <Text style={[s.pickerText, !startTime && s.placeholderText]}>
                    {startTime ? formatTime(startTime) : "Start"}
                  </Text>
                </TouchableOpacity>
                {showStartTimePicker && DateTimePicker && (
                  <DateTimePicker
                    value={startTime || new Date()}
                    mode="time"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={onStartTimeChange}
                  />
                )}
              </>
            )}
          </View>

          {/* End Time Picker */}
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={s.label}>End Time <Text style={s.required}>*</Text></Text>
            {Platform.OS === "web" ? (
              <WebTimeInput
                value={endTime ? formatTimeWeb(endTime) : ""}
                onChange={(val) => {
                  if (val) {
                    const [hours, minutes] = val.split(":");
                    const newTime = new Date();
                    newTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                    if (!validateTime(newTime)) {
                      crossAlert("Invalid Time", "You cannot select a past time for today.");
                      return;
                    }
                    if (startTime && newTime <= startTime) {
                      crossAlert("Invalid Time", "End time must be after start time.");
                      return;
                    }
                    setEndTime(newTime);
                  }
                }}
              />
            ) : (
              <>
                <TouchableOpacity style={s.pickerBtn} onPress={() => setShowEndTimePicker(true)}>
                  <Ionicons name="time-outline" size={20} color="#135E4B" />
                  <Text style={[s.pickerText, !endTime && s.placeholderText]}>
                    {endTime ? formatTime(endTime) : "End"}
                  </Text>
                </TouchableOpacity>
                {showEndTimePicker && DateTimePicker && (
                  <DateTimePicker
                    value={endTime || new Date()}
                    mode="time"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={onEndTimeChange}
                  />
                )}
              </>
            )}
          </View>
        </View>

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

        {/* Reviews Button */}
        <TouchableOpacity style={s.viewReviewsBtn} onPress={() => setReviewsModalVisible(true)}>
          <Ionicons name="star" size={20} color="#F59E0B" />
          <Text style={s.viewReviewsText}>View Reviews ({reviews.length})</Text>
        </TouchableOpacity>

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

      {/* Reviews Modal */}
      <Modal visible={reviewsModalVisible} transparent animationType="slide" onRequestClose={() => setReviewsModalVisible(false)}>
        <View style={s.modalOverlay}>
          <View style={s.modalContainer}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Service Reviews</Text>
              <TouchableOpacity onPress={() => setReviewsModalVisible(false)}>
                <Ionicons name="close" size={28} color="#666" />
              </TouchableOpacity>
            </View>
            
            {reviews.length === 0 ? (
              <View style={s.emptyReviews}>
                <Ionicons name="chatbubbles-outline" size={48} color="#ccc" />
                <Text style={s.emptyReviewsText}>No reviews yet for this service.</Text>
              </View>
            ) : (
              <FlatList
                data={reviews}
                keyExtractor={(item) => item._id}
                renderItem={renderReviewItem}
                contentContainerStyle={{ padding: 16 }}
              />
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default BookingScreen;

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#CCDCDB" },
  scroll: { padding: 16, paddingBottom: 40 },
  timeRow: { flexDirection: "row", justifyContent: "space-between" },
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
  // View Reviews Button
  viewReviewsBtn: {
    backgroundColor: "#E0ECEB", borderRadius: 14, paddingVertical: 14,
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    marginTop: 8, borderWidth: 1, borderColor: "#135E4B"
  },
  viewReviewsText: {
    color: "#135E4B", fontSize: 16, fontWeight: "bold", marginLeft: 8,
  },
  // Confirm Button
  confirmBtn: {
    backgroundColor: "#4CB572", borderRadius: 14, paddingVertical: 16,
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    marginTop: 16, elevation: 2, marginBottom: 20,
  },
  confirmBtnText: {
    color: "#fff", fontSize: 17, fontWeight: "bold", marginLeft: 8,
  },
  
  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContainer: { backgroundColor: "#F9FAFB", borderTopLeftRadius: 24, borderTopRightRadius: 24, height: "70%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, borderBottomWidth: 1, borderBottomColor: "#E5E7EB", backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: "#111827" },
  emptyReviews: { flex: 1, justifyContent: "center", alignItems: "center", padding: 40 },
  emptyReviewsText: { marginTop: 16, fontSize: 16, color: "#6B7280", textAlign: "center" },
  reviewCard: { backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 12, elevation: 1, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } },
  reviewHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  reviewAuthorRow: { flexDirection: "row", alignItems: "center" },
  avatarCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#E0ECEB", justifyContent: "center", alignItems: "center", marginRight: 10 },
  avatarInitial: { fontSize: 16, fontWeight: "bold", color: "#135E4B" },
  reviewerName: { fontSize: 15, fontWeight: "600", color: "#111827" },
  starRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#FEF3C7", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  starText: { fontSize: 13, fontWeight: "bold", color: "#B45309", marginLeft: 4 },
  reviewComment: { fontSize: 14, color: "#4B5563", lineHeight: 20 },
});
