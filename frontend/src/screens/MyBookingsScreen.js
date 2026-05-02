import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  FlatList, ActivityIndicator, Image, RefreshControl, Modal, TextInput
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

  const openFeedbackModal = (serviceId) => {
    setFeedbackServiceId(serviceId);
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
        rating,
        comment
      });
      crossAlert("Success", "Thank you for your feedback!");
      setFeedbackModalVisible(false);
    } catch (e) {
      crossAlert("Error", e.message);
    }
    setSubmittingFeedback(false);
  };

  const renderItem = ({ item }) => {
    return (
      <View style={s.card}>
        <View style={s.header}>
          <Text style={s.serviceTitle}>{item.service?.title || "Service"}</Text>
          <View style={[s.badge, s[`badge_${item.status}`]]}>
            <Text style={s.badgeText}>
              {item.status === "paid" ? "PAYMENT SUCCESSFUL" : 
               item.status === "pending_payment" ? "PENDING PAYMENT" : 
               item.status.toUpperCase()}
            </Text>
          </View>
        </View>

        <Text style={s.providerText}>
          Provider: {item.provider?.firstName} {item.provider?.lastName}
        </Text>
        
        <View style={s.row}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={s.infoText}>{item.date}</Text>
        </View>
        <View style={s.row}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={s.infoText}>{item.time}</Text>
        </View>
        <View style={s.row}>
          <Ionicons name="cash-outline" size={16} color="#666" />
          <Text style={s.infoText}>LKR {item.service?.price}</Text>
        </View>

        {item.status === "pending_payment" && (
          <TouchableOpacity
            style={s.payBtn}
            onPress={() => navigation.navigate("Payment", { booking: item })}
          >
            <Ionicons name="card-outline" size={20} color="#fff" />
            <Text style={s.payBtnText}>Pay Now to get the service</Text>
          </TouchableOpacity>
        )}

        {item.status === "completed" && (
          <TouchableOpacity
            style={s.feedbackBtn}
            onPress={() => openFeedbackModal(item.service?._id)}
          >
            <Ionicons name="star-outline" size={20} color="#135E4B" />
            <Text style={s.feedbackBtnText}>Give Feedback</Text>
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
    paddingHorizontal: 16, paddingVertical: 14, backgroundColor: "#fff",
    borderBottomWidth: 1, borderBottomColor: "#E0E0E0"
  },
  screenTitle: { fontSize: 18, fontWeight: "bold", color: "#135E4B" },
  card: {
    backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 16,
    elevation: 2, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 },
  },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  serviceTitle: { fontSize: 18, fontWeight: "bold", color: "#135E4B" },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badge_pending: { backgroundColor: "#FEF3C7" },
  badge_pending_payment: { backgroundColor: "#FEF3C7" },
  badge_paid: { backgroundColor: "#D1FAE5" },
  badge_confirmed: { backgroundColor: "#D1FAE5" },
  badge_completed: { backgroundColor: "#DBEAFE" },
  badge_cancelled: { backgroundColor: "#FEE2E2" },
  badgeText: { fontSize: 11, fontWeight: "bold", color: "#333" },
  providerText: { fontSize: 14, color: "#4CB572", marginBottom: 12, fontWeight: "500" },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  infoText: { fontSize: 14, color: "#666", marginLeft: 8 },
  payBtn: {
    backgroundColor: "#135E4B", padding: 12, borderRadius: 8, marginTop: 12,
    flexDirection: "row", justifyContent: "center", alignItems: "center"
  },
  payBtnText: { color: "#fff", fontWeight: "bold", fontSize: 15, marginLeft: 8 },
  feedbackBtn: {
    backgroundColor: "#E0ECEB", padding: 12, borderRadius: 8, marginTop: 12,
    flexDirection: "row", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#135E4B"
  },
  feedbackBtnText: { color: "#135E4B", fontWeight: "bold", fontSize: 15, marginLeft: 8 },
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
