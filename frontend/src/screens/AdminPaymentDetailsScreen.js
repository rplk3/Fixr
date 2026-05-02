import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { crossAlert } from "../utils/alert";
import { getAdminPaymentById, updateAdminPaymentStatus, deleteAdminPayment } from "../services/adminApi";

const STATUS_COLORS = {
  success: { bg: "#D1FAE5", text: "#065F46" },
  failed: { bg: "#FEE2E2", text: "#991B1B" },
  refunded: { bg: "#DBEAFE", text: "#1E40AF" },
  cancelled: { bg: "#F3F4F6", text: "#374151" },
};

const AdminPaymentDetailsScreen = ({ route, navigation }) => {
  const { paymentId } = route.params;
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPayment = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminPaymentById(paymentId);
      setPayment(data);
    } catch (e) {
      crossAlert("Error", e.message);
    }
    setLoading(false);
  }, [paymentId]);

  useEffect(() => { fetchPayment(); }, [fetchPayment]);

  const handleStatusUpdate = (newStatus, label) => {
    crossAlert(
      `${label}`,
      `Are you sure you want to mark this payment as "${newStatus}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Confirm",
          onPress: async () => {
            setActionLoading(true);
            try {
              await updateAdminPaymentStatus(paymentId, newStatus);
              crossAlert("Success", `Payment marked as ${newStatus}.`);
              fetchPayment();
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
      "Delete Payment",
      "This action cannot be undone. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setActionLoading(true);
            try {
              await deleteAdminPayment(paymentId);
              crossAlert("Deleted", "Payment record has been removed.");
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

  const fmt = (d) => d ? new Date(d).toLocaleString() : "N/A";
  const p = payment;
  const booking = p?.booking;
  const customer = p?.customer;
  const provider = booking?.provider;
  const service = booking?.service;
  const sc = STATUS_COLORS[p?.status] || STATUS_COLORS.cancelled;

  if (loading) {
    return (
      <SafeAreaView style={st.container}>
        <ActivityIndicator size="large" color="#135E4B" style={{ marginTop: 100 }} />
      </SafeAreaView>
    );
  }

  if (!payment) {
    return (
      <SafeAreaView style={st.container}>
        <View style={st.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={st.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#135E4B" />
          </TouchableOpacity>
          <Text style={st.headerTitle}>Payment Not Found</Text>
          <View style={{ width: 24 }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={st.container}>
      {/* Header */}
      <View style={st.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={st.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#135E4B" />
        </TouchableOpacity>
        <Text style={st.headerTitle}>Payment Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={st.scroll}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchPayment} />}
      >
        {/* Status Banner */}
        <View style={[st.statusBanner, { backgroundColor: sc.bg }]}>
          <Ionicons
            name={p.status === "success" ? "checkmark-circle" : p.status === "failed" ? "close-circle" : p.status === "refunded" ? "arrow-undo-circle" : "ban"}
            size={28}
            color={sc.text}
          />
          <Text style={[st.statusText, { color: sc.text }]}>{(p.status || "").toUpperCase()}</Text>
        </View>

        {/* Amount Card */}
        <View style={st.amountCard}>
          <Text style={st.amountLabel}>Amount</Text>
          <Text style={st.amountValue}>LKR {(p.amount || 0).toLocaleString()}</Text>
          <Text style={st.amountSub}>{p.paymentMethod === "card" ? "💳 Card" : p.paymentMethod} · ****{p.cardLastFour || "----"}</Text>
        </View>

        {/* Transaction Info */}
        <View style={st.card}>
          <Text style={st.cardTitle}>Transaction Info</Text>
          <InfoRow label="Transaction ID" value={p._id} />
          <InfoRow label="Card Holder" value={p.cardHolderName || "N/A"} />
          <InfoRow label="Payment Method" value={p.paymentMethod || "card"} />
          <InfoRow label="Paid At" value={fmt(p.paidAt)} />
          <InfoRow label="Created" value={fmt(p.createdAt)} />
        </View>

        {/* Customer Info */}
        <View style={st.card}>
          <Text style={st.cardTitle}>Customer</Text>
          <InfoRow label="Name" value={customer ? `${customer.firstName} ${customer.lastName}` : "N/A"} />
          <InfoRow label="Email" value={customer?.email || "N/A"} />
        </View>

        {/* Provider Info */}
        <View style={st.card}>
          <Text style={st.cardTitle}>Provider</Text>
          <InfoRow label="Name" value={provider ? `${provider.firstName} ${provider.lastName}` : "N/A"} />
          <InfoRow label="Email" value={provider?.email || "N/A"} />
        </View>

        {/* Service & Booking */}
        <View style={st.card}>
          <Text style={st.cardTitle}>Service & Booking</Text>
          <InfoRow label="Service" value={service?.title || "N/A"} />
          <InfoRow label="Category" value={service?.category || "N/A"} />
          <InfoRow label="Booking Status" value={booking?.status?.toUpperCase() || "N/A"} />
          <InfoRow label="Booking Date" value={booking?.date || "N/A"} />
          <InfoRow label="Booking Time" value={booking?.time || "N/A"} />
        </View>

        {/* Notes */}
        {p.notes ? (
          <View style={st.card}>
            <Text style={st.cardTitle}>Notes</Text>
            <Text style={st.notes}>{p.notes}</Text>
          </View>
        ) : null}

        {/* Action Buttons */}
        <View style={st.actionsSection}>
          <Text style={st.cardTitle}>Actions</Text>

          {actionLoading ? (
            <ActivityIndicator size="large" color="#135E4B" style={{ marginVertical: 20 }} />
          ) : (
            <>
              {p.status !== "success" && (
                <TouchableOpacity style={[st.actionBtn, { backgroundColor: "#10B981" }]} onPress={() => handleStatusUpdate("success", "Mark as Paid")}>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                  <Text style={st.actionBtnText}>Mark as Paid</Text>
                </TouchableOpacity>
              )}
              {p.status !== "failed" && (
                <TouchableOpacity style={[st.actionBtn, { backgroundColor: "#EF4444" }]} onPress={() => handleStatusUpdate("failed", "Mark as Failed")}>
                  <Ionicons name="close-circle-outline" size={20} color="#fff" />
                  <Text style={st.actionBtnText}>Mark as Failed</Text>
                </TouchableOpacity>
              )}
              {p.status !== "refunded" && (
                <TouchableOpacity style={[st.actionBtn, { backgroundColor: "#3B82F6" }]} onPress={() => handleStatusUpdate("refunded", "Mark as Refunded")}>
                  <Ionicons name="arrow-undo-circle-outline" size={20} color="#fff" />
                  <Text style={st.actionBtnText}>Mark as Refunded</Text>
                </TouchableOpacity>
              )}
              {p.status !== "cancelled" && (
                <TouchableOpacity style={[st.actionBtn, { backgroundColor: "#6B7280" }]} onPress={() => handleStatusUpdate("cancelled", "Cancel Payment")}>
                  <Ionicons name="ban-outline" size={20} color="#fff" />
                  <Text style={st.actionBtnText}>Cancel Payment</Text>
                </TouchableOpacity>
              )}
              <View style={st.divider} />
              <TouchableOpacity style={[st.actionBtn, { backgroundColor: "#DC2626" }]} onPress={handleDelete}>
                <Ionicons name="trash-outline" size={20} color="#fff" />
                <Text style={st.actionBtnText}>Delete Payment Record</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const InfoRow = ({ label, value }) => (
  <View style={st.infoRow}>
    <Text style={st.infoLabel}>{label}</Text>
    <Text style={st.infoValue} numberOfLines={2}>{value}</Text>
  </View>
);

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#CCDCDB" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#135E4B" },
  scroll: { padding: 16, paddingBottom: 40 },
  statusBanner: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    paddingVertical: 14, borderRadius: 14, marginBottom: 16,
  },
  statusText: { fontSize: 18, fontWeight: "bold", marginLeft: 10 },
  amountCard: {
    backgroundColor: "#135E4B", borderRadius: 16, padding: 24, alignItems: "center", marginBottom: 16,
  },
  amountLabel: { fontSize: 13, color: "#A8D5BA", marginBottom: 4 },
  amountValue: { fontSize: 32, fontWeight: "bold", color: "#fff" },
  amountSub: { fontSize: 14, color: "#A8D5BA", marginTop: 8 },
  card: {
    backgroundColor: "#fff", borderRadius: 14, padding: 18, marginBottom: 12,
    elevation: 1, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 3, shadowOffset: { width: 0, height: 1 },
  },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: "#135E4B", marginBottom: 12 },
  infoRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start",
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#F0F0F0",
  },
  infoLabel: { fontSize: 13, color: "#666", flex: 1 },
  infoValue: { fontSize: 13, fontWeight: "600", color: "#333", flex: 1.5, textAlign: "right" },
  notes: { fontSize: 14, color: "#555", lineHeight: 20 },
  actionsSection: {
    backgroundColor: "#fff", borderRadius: 14, padding: 18, marginBottom: 12,
  },
  actionBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    paddingVertical: 14, borderRadius: 10, marginBottom: 10,
  },
  actionBtnText: { color: "#fff", fontWeight: "bold", fontSize: 15, marginLeft: 8 },
  divider: { height: 1, backgroundColor: "#E0E0E0", marginVertical: 10 },
});

export default AdminPaymentDetailsScreen;
