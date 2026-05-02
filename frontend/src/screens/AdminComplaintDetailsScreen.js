import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { crossAlert } from "../utils/alert";
import { getAdminComplaintById, updateComplaintStatus, deleteAdminComplaint } from "../services/complaintApi";

const AdminComplaintDetailsScreen = ({ route, navigation }) => {
  const { complaintId } = route.params;
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchComplaint = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminComplaintById(complaintId);
      setComplaint(data);
    } catch (e) {
      crossAlert("Error", e.message);
    }
    setLoading(false);
  }, [complaintId]);

  useEffect(() => { fetchComplaint(); }, [fetchComplaint]);

  const handleStatusUpdate = (newStatus) => {
    crossAlert(
      "Update Status",
      `Are you sure you want to mark this complaint as ${newStatus}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Confirm",
          onPress: async () => {
            setActionLoading(true);
            try {
              await updateComplaintStatus(complaintId, newStatus);
              crossAlert("Success", `Complaint marked as ${newStatus}.`);
              fetchComplaint();
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
      "Delete Complaint",
      "This action cannot be undone. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setActionLoading(true);
            try {
              await deleteAdminComplaint(complaintId);
              crossAlert("Deleted", "Complaint has been removed.");
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

  if (!complaint) {
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

  const isResolved = complaint.status === "resolved";

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#135E4B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Complaint Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchComplaint} />}
      >
        <View style={[styles.statusBanner, { backgroundColor: isResolved ? "#D1FAE5" : "#FEF3C7" }]}>
          <Ionicons 
            name={isResolved ? "checkmark-circle" : "time"} 
            size={24} 
            color={isResolved ? "#065F46" : "#92400E"} 
          />
          <Text style={[styles.statusText, { color: isResolved ? "#065F46" : "#92400E" }]}>
            {complaint.status.toUpperCase()}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{complaint.title}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Category:</Text>
            <Text style={styles.metaValue}>{complaint.category}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Priority:</Text>
            <Text style={styles.metaValue}>{complaint.priority.toUpperCase()}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Submitted:</Text>
            <Text style={styles.metaValue}>{new Date(complaint.createdAt).toLocaleString()}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Name:</Text>
            <Text style={styles.metaValue}>{complaint.user?.firstName} {complaint.user?.lastName}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Account Email:</Text>
            <Text style={styles.metaValue}>{complaint.user?.email}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Contact Email:</Text>
            <Text style={styles.metaValue}>{complaint.contactEmail}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{complaint.description}</Text>
        </View>

        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Admin Actions</Text>
          {actionLoading ? (
            <ActivityIndicator size="large" color="#135E4B" style={{ marginVertical: 20 }} />
          ) : (
            <>
              {!isResolved && (
                <TouchableOpacity 
                  style={[styles.actionBtn, { backgroundColor: "#10B981" }]} 
                  onPress={() => handleStatusUpdate("resolved")}
                >
                  <Ionicons name="checkmark-done" size={20} color="#fff" />
                  <Text style={styles.actionBtnText}>Mark as Resolved</Text>
                </TouchableOpacity>
              )}
              {isResolved && (
                <TouchableOpacity 
                  style={[styles.actionBtn, { backgroundColor: "#F59E0B", marginBottom: 16 }]} 
                  onPress={() => handleStatusUpdate("pending")}
                >
                  <Ionicons name="time-outline" size={20} color="#fff" />
                  <Text style={styles.actionBtnText}>Reopen Complaint</Text>
                </TouchableOpacity>
              )}
              {isResolved && (
                <TouchableOpacity 
                  style={[styles.actionBtn, { backgroundColor: "#EF4444" }]} 
                  onPress={handleDelete}
                >
                  <Ionicons name="trash-outline" size={20} color="#fff" />
                  <Text style={styles.actionBtnText}>Delete Complaint</Text>
                </TouchableOpacity>
              )}
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
  cardTitle: { fontSize: 18, fontWeight: "bold", color: "#135E4B", marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#135E4B", marginBottom: 12 },
  metaRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  metaLabel: { fontSize: 14, color: "#666", flex: 1 },
  metaValue: { fontSize: 14, fontWeight: "500", color: "#333", flex: 2, textAlign: "right" },
  description: { fontSize: 15, color: "#444", lineHeight: 22 },
  actionsContainer: { backgroundColor: "#fff", borderRadius: 14, padding: 18, marginBottom: 16 },
  actionBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 14, borderRadius: 10 },
  actionBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16, marginLeft: 8 },
});

export default AdminComplaintDetailsScreen;
