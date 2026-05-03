import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  FlatList, ActivityIndicator, Image, RefreshControl, Modal, TextInput, Platform, StatusBar
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { getMyBookings } from "../services/bookingApi";
import { createReview } from "../services/reviewApi";
import { crossAlert } from "../utils/alert";

const MyBookingsScreen = () => {
  const navigation = useNavigation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [feedbackServiceId, setFeedbackServiceId] = useState(null);
  const [feedbackBookingId, setFeedbackBookingId] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMyBookings();
      setBookings(data);
    } catch (e) {
      console.log("Error fetching bookings", e);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchBookings();
    });
    return unsubscribe;
  }, [navigation, fetchBookings]);

  const openFeedbackModal = (serviceId, bookingId) => {
    setFeedbackServiceId(serviceId);
    setFeedbackBookingId(bookingId);
    setRating(0);
    setComment("");
    setFeedbackModalVisible(true);
  };

  const submitFeedback = async () => {
    if (rating === 0) {
      return crossAlert("Error", "Please select a star rating.");
    }
    if (!comment.trim()) {
      return crossAlert("Error", "Please enter a comment.");
    }
    if (comment.trim().split(/\s+/).length > 50) {
      return crossAlert("Error", "Comment cannot exceed 50 words.");
    }

    setSubmittingFeedback(true);
    try {
      await createReview({
        serviceId: feedbackServiceId,
        bookingId: feedbackBookingId,
        rating,
        comment
      });
      crossAlert("Success", "Thank you for your feedback!");
      setFeedbackModalVisible(false);
      fetchBookings(); // Refresh bookings to update hasReviewed status
    } catch (e) {
      crossAlert("Error", e.message);
    }
    setSubmittingFeedback(false);
  };

  const statusConfig = {
    pending:         { label: "Pending Review",   bg: "#FEF9C3", color: "#92400E", icon: "time-outline" },
    pending_payment: { label: "Awaiting Payment", bg: "#FEF3C7", color: "#B45309", icon: "card-outline" },
    paid:            { label: "Payment Done",     bg: "#D1FAE5", color: "#065F46", icon: "checkmark-circle-outline" },
    confirmed:       { label: "Confirmed",        bg: "#DBEAFE", color: "#1E40AF", icon: "checkmark-done-outline" },
    completed:       { label: "Completed",        bg: "#EDE9FE", color: "#5B21B6", icon: "ribbon-outline" },
    cancelled:       { label: "Cancelled",        bg: "#FEE2E2", color: "#991B1B", icon: "close-circle-outline" },
  };

  const renderItem = ({ item }) => {
    const cfg = statusConfig[item.status] || { label: item.status?.toUpperCase() || "UNKNOWN", bg: "#F3F4F6", color: "#374151", icon: "ellipse-outline" };
    return (
      <View style={s.card}>
        {/* Top row: service name + status */}
        <View style={s.cardTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={s.serviceTitle} numberOfLines={1}>{item.service?.title || "Service"}</Text>
            <Text style={s.bookingId}>#{item._id?.slice(-6)?.toUpperCase()}</Text>
          </View>
          <View style={[s.statusBadge, { backgroundColor: cfg.bg }]}>
            <Ionicons name={cfg.icon} size={12} color={cfg.color} />
            <Text style={[s.statusBadgeText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
        </View>

        <View style={s.divider} />

        {/* Provider info */}
        <View style={s.infoRow}>
          <View style={s.infoIcon}><Ionicons name="person-outline" size={14} color="#135E4B" /></View>
          <View>
            <Text style={s.infoLabel}>Provider</Text>
            <Text style={s.infoValue}>{item.provider?.firstName} {item.provider?.lastName}</Text>
          </View>
        </View>

        {/* Schedule box */}
        <View style={s.scheduleBox}>
          <View style={s.scheduleRow}>
            <Ionicons name="calendar-outline" size={14} color="#4CB572" />
            <Text style={s.scheduleText}>{item.date}</Text>
            <View style={s.scheduleDot} />
            <Ionicons name="time-outline" size={14} color="#4CB572" />
            <Text style={s.scheduleText}>{item.time}</Text>
          </View>
        </View>

        {/* Price */}
        <View style={s.priceRow}>
          <Ionicons name="cash-outline" size={14} color="#6B7280" />
          <Text style={s.priceText}>Rs. {item.service?.price?.toLocaleString()} / hr</Text>
        </View>

        {/* Pay Now button */}
        {item.status === "pending_payment" && (
          <TouchableOpacity
            style={s.payBtn}
            onPress={() => navigation.navigate("Payment", { booking: item })}
          >
            <Ionicons name="card-outline" size={18} color="#fff" />
            <Text style={s.payBtnText}>Pay Now to Confirm</Text>
          </TouchableOpacity>
        )}

        {/* Feedback button */}
        {item.status === "completed" && (
          <TouchableOpacity
            style={[s.feedbackBtn, item.hasReviewed && s.feedbackBtnDisabled]}
            onPress={() => !item.hasReviewed && openFeedbackModal(item.service?._id, item._id)}
            disabled={item.hasReviewed}
          >
            <Ionicons name={item.hasReviewed ? "checkmark-circle-outline" : "star-outline"} size={18} color={item.hasReviewed ? "#9CA3AF" : "#135E4B"} />
            <Text style={[s.feedbackBtnText, item.hasReviewed && s.feedbackBtnTextDisabled]}>
              {item.hasReviewed ? "Feedback Given" : "Leave a Review"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 5 }}>
          <Ionicons name="arrow-back" size={24} color="#135E4B" />
        </TouchableOpacity>
        <Text style={s.screenTitle}>My Bookings</Text>
        <View style={{ width: 30 }} />
      </View>

      {loading && bookings.length === 0 ? (
        <ActivityIndicator size="large" color="#135E4B" style={{ marginTop: 40 }} />
      ) : bookings.length === 0 ? (
        <View style={s.empty}>
          <Ionicons name="calendar-outline" size={60} color="#ccc" />
          <Text style={s.emptyText}>No bookings found.</Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchBookings} />}
        />
      )}

      {/* Feedback Modal */}
      <Modal visible={feedbackModalVisible} transparent animationType="slide" onRequestClose={() => setFeedbackModalVisible(false)}>
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>Give Feedback</Text>
            
            <View style={s.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <Ionicons 
                    name={star <= rating ? "star" : "star-outline"} 
                    size={40} 
                    color={star <= rating ? "#F59E0B" : "#D1D5DB"} 
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={s.modalInput}
              placeholder="Write a comment (max 50 words)..."
              placeholderTextColor="#999"
              value={comment}
              onChangeText={setComment}
              multiline
              textAlignVertical="top"
            />
            <Text style={s.wordCount}>
              {comment.trim() ? comment.trim().split(/\s+/).length : 0} / 50 words
            </Text>

            <View style={s.modalBtns}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setFeedbackModalVisible(false)} disabled={submittingFeedback}>
                <Text style={s.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.saveBtn, submittingFeedback && { opacity: 0.6 }]} onPress={submitFeedback} disabled={submittingFeedback}>
                <Text style={s.saveBtnText}>{submittingFeedback ? "Submitting..." : "Submit"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default MyBookingsScreen;

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#CCDCDB" },
  topBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 24) + 10 : 16,
    paddingBottom: 14,
    backgroundColor: "#fff",
    borderBottomWidth: 1, borderBottomColor: "#E0E0E0"
  },
  screenTitle: { fontSize: 18, fontWeight: "bold", color: "#135E4B" },
  card: {
    backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 14,
    elevation: 2, shadowColor: "#000", shadowOpacity: 0.07, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
  },
  cardTopRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  serviceTitle: { fontSize: 16, fontWeight: "700", color: "#135E4B", flex: 1 },
  bookingId: { fontSize: 11, color: "#9CA3AF", marginTop: 2 },
  statusBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, marginLeft: 8 },
  statusBadgeText: { fontSize: 11, fontWeight: "700", marginLeft: 4 },
  divider: { height: 1, backgroundColor: "#F3F4F6", marginVertical: 12 },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  infoIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#E8F5EF", alignItems: "center", justifyContent: "center", marginRight: 10 },
  infoLabel: { fontSize: 11, color: "#9CA3AF", fontWeight: "500" },
  infoValue: { fontSize: 14, color: "#1F2937", fontWeight: "600" },
  scheduleBox: { backgroundColor: "#F8FBF9", borderRadius: 10, padding: 10, marginBottom: 10 },
  scheduleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  scheduleText: { fontSize: 13, color: "#374151", fontWeight: "500" },
  scheduleDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: "#D1D5DB" },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  priceText: { fontSize: 13, color: "#6B7280", fontWeight: "500" },
  payBtn: {
    backgroundColor: "#135E4B", padding: 13, borderRadius: 10, marginTop: 12,
    flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8,
  },
  payBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  feedbackBtn: {
    backgroundColor: "#E8F5EF", padding: 12, borderRadius: 10, marginTop: 10,
    flexDirection: "row", justifyContent: "center", alignItems: "center",
    borderWidth: 1.5, borderColor: "#4CB572", gap: 8,
  },
  feedbackBtnDisabled: { backgroundColor: "#F9FAFB", borderColor: "#E5E7EB" },
  feedbackBtnText: { color: "#135E4B", fontWeight: "700", fontSize: 14 },
  feedbackBtnTextDisabled: { color: "#9CA3AF" },
  empty: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 16, color: "#999", marginTop: 12 },
  
  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 20 },
  modalCard: { backgroundColor: "#fff", borderRadius: 18, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: "#135E4B", marginBottom: 16, textAlign: "center" },
  starsContainer: { flexDirection: "row", justifyContent: "center", marginBottom: 20, gap: 8 },
  modalInput: {
    backgroundColor: "#F0F7F4", borderRadius: 10, padding: 12, minHeight: 100,
    color: "#000", borderWidth: 1, borderColor: "#E0E0E0", fontSize: 15,
  },
  wordCount: { fontSize: 12, color: "#666", textAlign: "right", marginTop: 4, marginBottom: 16 },
  modalBtns: { flexDirection: "row", justifyContent: "flex-end", gap: 10 },
  cancelBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, backgroundColor: "#F3F4F6" },
  cancelBtnText: { color: "#666", fontWeight: "600" },
  saveBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, backgroundColor: "#4CB572" },
  saveBtnText: { color: "#fff", fontWeight: "bold" },
});
