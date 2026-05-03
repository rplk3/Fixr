import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, RefreshControl, Modal, Dimensions
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Ionicons } from "@expo/vector-icons";
import { crossAlert } from "../utils/alert";
import { createComplaint, getMyComplaints } from "../services/complaintApi";

const CATEGORIES = ["Service Quality", "Provider Behavior", "Payment Issue", "Booking Issue", "App Issue", "Other"];
const PRIORITIES = ["low", "medium", "high"];

const ComplaintsScreen = ({ navigation }) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState(PRIORITIES[0]);
  const [contactEmail, setContactEmail] = useState("");

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMyComplaints();
      setComplaints(data);
    } catch (e) {
      crossAlert("Error", e.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchComplaints(); }, [fetchComplaints]);

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !contactEmail.trim()) {
      return crossAlert("Error", "Please fill in all fields.");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactEmail)) {
      return crossAlert("Error", "Please enter a valid email address.");
    }

    setSubmitting(true);
    try {
      await createComplaint({ title, category, description, priority, contactEmail });
      crossAlert("Success", "Your complaint has been submitted successfully.");
      setShowModal(false);
      setTitle("");
      setDescription("");
      setContactEmail("");
      setCategory(CATEGORIES[0]);
      setPriority(PRIORITIES[0]);
      fetchComplaints();
    } catch (e) {
      crossAlert("Error", e.message);
    }
    setSubmitting(false);
  };

  const getStatusColor = (status) => {
    return status === "resolved" ? "#10B981" : "#F59E0B";
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#135E4B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Complaints</Text>
        <View style={{ width: 24 }} />
      </View>

      <TouchableOpacity style={styles.newComplaintBtn} onPress={() => setShowModal(true)}>
        <Ionicons name="add-circle-outline" size={20} color="#fff" />
        <Text style={styles.newComplaintText}>Submit New Complaint</Text>
      </TouchableOpacity>

      <ScrollView 
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchComplaints} />}
      >
        {complaints.length === 0 && !loading ? (
          <View style={styles.emptyWrap}>
            <Ionicons name="document-text-outline" size={50} color="#999" />
            <Text style={styles.emptyText}>You haven't submitted any complaints.</Text>
          </View>
        ) : (
          complaints.map((c) => (
            <View key={c._id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{c.title}</Text>
                <View style={[styles.badge, { backgroundColor: getStatusColor(c.status) + "20" }]}>
                  <Text style={[styles.badgeText, { color: getStatusColor(c.status) }]}>
                    {c.status.toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text style={styles.cardCategory}>{c.category} · Priority: {c.priority}</Text>
              <Text style={styles.cardDesc} numberOfLines={3}>{c.description}</Text>
              <Text style={styles.cardDate}>{new Date(c.createdAt).toLocaleDateString()}</Text>
            </View>
          ))
        )}
      </ScrollView>

      {/* New Complaint Modal */}
      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalOverlay}>
          <KeyboardAwareScrollView contentContainerStyle={styles.modalScroll} enableOnAndroid={true} keyboardShouldPersistTaps="handled">
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Submit Complaint</Text>
                <TouchableOpacity onPress={() => setShowModal(false)}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Title</Text>
              <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Brief summary" />

              <Text style={styles.label}>Category</Text>
              <View style={styles.chipsWrap}>
                {CATEGORIES.map(cat => (
                  <TouchableOpacity key={cat} onPress={() => setCategory(cat)} style={[styles.chip, category === cat && styles.chipActive]}>
                    <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Description</Text>
              <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} placeholder="Please describe the issue in detail" multiline />

              <Text style={styles.label}>Priority</Text>
              <View style={styles.chipsWrap}>
                {PRIORITIES.map(pri => (
                  <TouchableOpacity key={pri} onPress={() => setPriority(pri)} style={[styles.chip, priority === pri && styles.chipActive]}>
                    <Text style={[styles.chipText, priority === pri && styles.chipTextActive]}>{pri.charAt(0).toUpperCase() + pri.slice(1)}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Contact Email</Text>
              <TextInput style={styles.input} value={contactEmail} onChangeText={setContactEmail} placeholder="Email for updates" keyboardType="email-address" autoCapitalize="none" />

              <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={submitting}>
                {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Submit Complaint</Text>}
              </TouchableOpacity>
            </View>
          </KeyboardAwareScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#CCDCDB" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#135E4B" },
  newComplaintBtn: { backgroundColor: "#135E4B", flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 12, marginHorizontal: 20, borderRadius: 10, marginTop: 10 },
  newComplaintText: { color: "#fff", fontWeight: "bold", marginLeft: 8, fontSize: 16 },
  scroll: { padding: 20, paddingBottom: 40 },
  emptyWrap: { alignItems: "center", marginTop: 50 },
  emptyText: { color: "#666", marginTop: 10, fontSize: 15 },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: "#135E4B", flex: 1, marginRight: 10 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 12, fontWeight: "bold" },
  cardCategory: { fontSize: 13, color: "#4CB572", marginBottom: 8, fontWeight: "600" },
  cardDesc: { fontSize: 14, color: "#555", lineHeight: 20 },
  cardDate: { fontSize: 12, color: "#999", marginTop: 12, textAlign: "right" },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalScroll: { flexGrow: 1, justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: "#135E4B" },
  label: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: "#F9FAFB", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 10, padding: 12, fontSize: 15, color: "#333" },
  textArea: { minHeight: 100, textAlignVertical: "top" },
  chipsWrap: { flexDirection: "row", flexWrap: "wrap" },
  chip: { backgroundColor: "#F3F4F6", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: "#E5E7EB" },
  chipActive: { backgroundColor: "#E8F5E9", borderColor: "#4CB572" },
  chipText: { color: "#4B5563", fontSize: 13 },
  chipTextActive: { color: "#135E4B", fontWeight: "bold" },
  submitBtn: { backgroundColor: "#135E4B", paddingVertical: 14, borderRadius: 10, alignItems: "center", marginTop: 24 },
  submitBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 }
});

export default ComplaintsScreen;
