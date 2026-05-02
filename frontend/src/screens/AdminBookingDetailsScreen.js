import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { crossAlert } from "../utils/alert";
import { getAdminBookingById, updateAdminBookingStatus, deleteAdminBooking } from "../services/adminApi";

const AdminBookingDetailsScreen = ({ route, navigation }) => {
  const { bookingId } = route.params;
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchBooking = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminBookingById(bookingId);
      setBooking(data);
    } catch (e) {
      crossAlert("Error", e.message);
    }
    setLoading(false);
  }, [bookingId]);

  useEffect(() => { fetchBooking(); }, [fetchBooking]);

  const handleStatusUpdate = (newStatus) => {
    crossAlert(
      "Update Status",
      `Are you sure you want to mark this booking as ${newStatus}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Confirm",
          onPress: async () => {
            setActionLoading(true);
            try {
              await updateAdminBookingStatus(bookingId, newStatus);
              crossAlert("Success", `Booking marked as ${newStatus}.`);
              fetchBooking();
            } catch (e) {
              crossAlert("Error", e.message);
            }
            setActionLoading(false);
          },
        },
      ]
    );
  };

  const handleDelete = () => {
    crossAlert(
      "Delete Booking",
      "This action cannot be undone. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setActionLoading(true);
            try {
              await deleteAdminBooking(bookingId);
              crossAlert("Deleted", "Booking has been removed.");
              navigation.goBack();
            } catch (e) {
              crossAlert("Error", e.message);
            }
            setActionLoading(false);
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#135E4B" style={{ marginTop: 100 }} />
      </SafeAreaView>
    );
  }

  if (!booking) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#135E4B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Not Found</Text>
          <View style={{ width: 24 }} />
        </View>
      </SafeAreaView>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "completed": return "#10B981";
      case "cancelled": return "#EF4444";
      case "paid": return "#3B82F6";
      case "pending_payment": return "#F59E0B";
      default: return "#6B7280";
    }
  };

  const getPaymentStatusColor = (ps) => {
    if (ps === "paid") return "#10B981";
    if (ps === "failed") return "#EF4444";
    if (ps === "refunded") return "#8B5CF6";
    return "#F59E0B"; // pending
  };

  const statusColor = getStatusColor(booking.status);
  const paymentStatusColor = getPaymentStatusColor(booking.paymentStatus || "pending");

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#135E4B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchBooking} />}
      >
        <View style={[styles.statusBanner, { backgroundColor: statusColor + "20" }]}>
          <Ionicons 
            name={booking.status === "completed" ? "checkmark-circle" : booking.status === "cancelled" ? "close-circle" : "time"} 
            size={24} 
            color={statusColor} 
          />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {booking.status.replace("_", " ").toUpperCase()}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Service Information</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Service:</Text>
            <Text style={styles.metaValue}>{booking.service?.title}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Category:</Text>
            <Text style={styles.metaValue}>{booking.service?.category}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Scheduled Date:</Text>
            <Text style={styles.metaValue}>{booking.date}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Scheduled Time:</Text>
            <Text style={styles.metaValue}>{booking.time}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Location:</Text>
            <Text style={styles.metaValue}>{booking.location}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Booking Date:</Text>
            <Text style={styles.metaValue}>{new Date(booking.createdAt).toLocaleString()}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Payment Status:</Text>
            <Text style={[styles.metaValue, { color: paymentStatusColor, fontWeight: "700" }]}>
              {(booking.paymentStatus || "pending").toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Name:</Text>
            <Text style={styles.metaValue}>{booking.customer?.firstName} {booking.customer?.lastName}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Email:</Text>
            <Text style={styles.metaValue}>{booking.customer?.email}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Phone:</Text>
            <Text style={styles.metaValue}>{booking.phone || booking.customer?.phone || "N/A"}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Provider Information</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Name:</Text>
            <Text style={styles.metaValue}>{booking.provider?.firstName} {booking.provider?.lastName}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Email:</Text>
            <Text style={styles.metaValue}>{booking.provider?.email}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Additional Details</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Notes:</Text>
            <Text style={styles.metaValue}>{booking.notes || "No additional notes"}</Text>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Admin Actions</Text>
          {actionLoading ? (
            <ActivityIndicator size="large" color="#135E4B" style={{ marginVertical: 20 }} />
          ) : (
            <>
              {booking.status !== "completed" && booking.status !== "cancelled" && (
                <>
                  <TouchableOpacity 
                    style={[styles.actionBtn, { backgroundColor: "#10B981", marginBottom: 12 }]} 
                    onPress={() => handleStatusUpdate("completed")}
                  >
                    <Ionicons name="checkmark-done" size={20} color="#fff" />
                    <Text style={styles.actionBtnText}>Mark as Completed</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.actionBtn, { backgroundColor: "#EF4444", marginBottom: 12 }]} 
                    onPress={() => handleStatusUpdate("cancelled")}
                  >
                    <Ionicons name="close-circle-outline" size={20} color="#fff" />
                    <Text style={styles.actionBtnText}>Cancel Booking</Text>
                  </TouchableOpacity>
                </>
              )}
              
              <TouchableOpacity 
                style={[styles.actionBtn, { backgroundColor: "#4B5563" }]} 
                onPress={handleDelete}
              >
                <Ionicons name="trash-outline" size={20} color="#fff" />
                <Text style={styles.actionBtnText}>Delete Booking Record</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#CCDCDB" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#135E4B" },
  scroll: { padding: 16, paddingBottom: 40 },
  statusBanner: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 12, borderRadius: 12, marginBottom: 16 },
  statusText: { fontSize: 16, fontWeight: "bold", marginLeft: 8 },
  card: { backgroundColor: "#fff", borderRadius: 14, padding: 18, marginBottom: 16, elevation: 1 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#135E4B", marginBottom: 12 },
  metaRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  metaLabel: { fontSize: 14, color: "#666", flex: 1 },
  metaValue: { fontSize: 14, fontWeight: "500", color: "#333", flex: 2, textAlign: "right" },
  actionsContainer: { backgroundColor: "#fff", borderRadius: 14, padding: 18, marginBottom: 16 },
  actionBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 14, borderRadius: 10 },
  actionBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16, marginLeft: 8 },
});

export default AdminBookingDetailsScreen;
