import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView,
  FlatList, ActivityIndicator, Alert, Modal, TextInput, RefreshControl,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { getMyServices, updateService, deleteService, createService } from "../services/serviceApi";

const ProviderDashboardScreen = () => {
  const navigation = useNavigation();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", category: "", price: "", location: "" });

  const fetchMyServices = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMyServices();
      setServices(data);
    } catch (e) {
      Alert.alert("Error", e.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchMyServices(); }, []);

  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      title: item.title, description: item.description,
      category: item.category, price: String(item.price), location: item.location,
    });
    setEditModal(true);
  };

  const openAdd = () => {
    setForm({ title: "", description: "", category: "", price: "", location: "" });
    setAddModal(true);
  };

  const handleSaveEdit = async () => {
    if (!form.title || !form.description || !form.category || !form.price || !form.location) {
      return Alert.alert("Error", "All fields are required");
    }
    try {
      await updateService(editItem._id, { ...form, price: Number(form.price), availability: true });
      setEditModal(false);
      fetchMyServices();
      Alert.alert("Success", "Service updated!");
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  const handleAdd = async () => {
    if (!form.title || !form.description || !form.category || !form.price || !form.location) {
      return Alert.alert("Error", "All fields are required");
    }
    try {
      await createService({ ...form, price: Number(form.price), availability: true, image: "" });
      setAddModal(false);
      fetchMyServices();
      Alert.alert("Success", "Service created!");
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  const handleDelete = (id) => {
    Alert.alert("Delete", "Are you sure you want to delete this service?", [
      { text: "Cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          try { await deleteService(id); fetchMyServices(); }
          catch (e) { Alert.alert("Error", e.message); }
        },
      },
    ]);
  };

  const FormModal = ({ visible, onClose, onSave, title }) => (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={st.modalOverlay}>
        <View style={st.modalCard}>
          <Text style={st.modalTitle}>{title}</Text>
          {["title", "description", "category", "price", "location"].map((key) => (
            <TextInput
              key={key}
              style={st.modalInput}
              placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
              placeholderTextColor="#999"
              value={form[key]}
              onChangeText={(v) => setForm((f) => ({ ...f, [key]: v }))}
              keyboardType={key === "price" ? "numeric" : "default"}
              multiline={key === "description"}
            />
          ))}
          <View style={st.modalBtns}>
            <TouchableOpacity style={st.cancelBtn} onPress={onClose}>
              <Text style={st.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={st.saveBtn} onPress={onSave}>
              <Text style={st.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderService = ({ item }) => (
    <View style={st.serviceCard}>
      <View style={{ flex: 1 }}>
        <Text style={st.serviceTitle}>{item.title}</Text>
        <Text style={st.serviceSub}>{item.category} · LKR {item.price}</Text>
        <Text style={st.serviceSub}>{item.location}</Text>
        <Text style={st.serviceDesc} numberOfLines={2}>{item.description}</Text>
        <View style={[st.badge, item.availability ? st.badgeGreen : st.badgeRed]}>
          <Text style={st.badgeText}>{item.availability ? "AVAILABLE" : "UNAVAILABLE"}</Text>
        </View>
      </View>
      <View style={st.serviceActions}>
        <TouchableOpacity style={st.editBtn} onPress={() => openEdit(item)}>
          <Ionicons name="create-outline" size={20} color="#3B82F6" />
        </TouchableOpacity>
        <TouchableOpacity style={st.deleteBtn} onPress={() => handleDelete(item._id)}>
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={st.container}>
      {/* Header */}
      <View style={st.header}>
        <View>
          <Text style={st.greeting}>Provider Dashboard</Text>
          <Text style={st.subText}>Manage your services & bookings</Text>
        </View>
        <TouchableOpacity style={st.switchButton} onPress={() => navigation.replace("Services")}>
          <Ionicons name="swap-horizontal" size={20} color="#fff" />
          <Text style={st.switchButtonText}>Customer Mode</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={st.statsRow}>
        <View style={st.statCard}>
          <Text style={st.statNumber}>{services.length}</Text>
          <Text style={st.statLabel}>My Services</Text>
        </View>
        <View style={st.statCard}>
          <Text style={st.statNumber}>0</Text>
          <Text style={st.statLabel}>Active Bookings</Text>
        </View>
      </View>

      {/* My Services Section */}
      <View style={st.sectionHeader}>
        <Text style={st.sectionTitle}>My Services</Text>
        <TouchableOpacity style={st.addBtn} onPress={openAdd}>
          <Ionicons name="add-circle" size={20} color="#fff" />
          <Text style={st.addBtnText}>Add Service</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#135E4B" style={{ marginTop: 30 }} />
      ) : services.length === 0 ? (
        <View style={st.emptyState}>
          <Ionicons name="folder-open-outline" size={60} color="#135E4B" />
          <Text style={st.emptyTitle}>No services yet</Text>
          <Text style={st.emptyDesc}>Tap "Add Service" to create your first listing</Text>
        </View>
      ) : (
        <FlatList
          data={services}
          keyExtractor={(item) => item._id}
          renderItem={renderService}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchMyServices} />}
        />
      )}

      {/* Edit Modal */}
      <FormModal visible={editModal} onClose={() => setEditModal(false)} onSave={handleSaveEdit} title="Edit Service" />
      {/* Add Modal */}
      <FormModal visible={addModal} onClose={() => setAddModal(false)} onSave={handleAdd} title="Add New Service" />
    </SafeAreaView>
  );
};

export default ProviderDashboardScreen;

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#CCDCDB" },
  header: {
    backgroundColor: "#fff", paddingHorizontal: 20, paddingTop: 44, paddingBottom: 16,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    borderBottomWidth: 1, borderBottomColor: "#E0E0E0",
  },
  greeting: { fontSize: 22, fontWeight: "bold", color: "#135E4B" },
  subText: { fontSize: 13, color: "#4CB572", marginTop: 4 },
  switchButton: {
    flexDirection: "row", backgroundColor: "#135E4B", paddingHorizontal: 12,
    paddingVertical: 8, borderRadius: 8, alignItems: "center",
  },
  switchButtonText: { color: "#fff", fontWeight: "bold", fontSize: 13, marginLeft: 6 },
  statsRow: { flexDirection: "row", padding: 16, gap: 10 },
  statCard: {
    flex: 1, backgroundColor: "#fff", padding: 18, borderRadius: 14, alignItems: "center",
    elevation: 2, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 2 },
  },
  statNumber: { fontSize: 24, fontWeight: "bold", color: "#135E4B", marginBottom: 4 },
  statLabel: { fontSize: 13, color: "#666" },
  sectionHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 16, marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#135E4B" },
  addBtn: {
    flexDirection: "row", backgroundColor: "#4CB572", paddingHorizontal: 14,
    paddingVertical: 8, borderRadius: 8, alignItems: "center",
  },
  addBtnText: { color: "#fff", fontWeight: "bold", fontSize: 13, marginLeft: 6 },
  serviceCard: {
    backgroundColor: "#fff", borderRadius: 14, padding: 16, marginBottom: 10,
    flexDirection: "row", alignItems: "flex-start",
    elevation: 1, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 3, shadowOffset: { width: 0, height: 1 },
  },
  serviceTitle: { fontSize: 16, fontWeight: "bold", color: "#135E4B" },
  serviceSub: { fontSize: 13, color: "#666", marginTop: 2 },
  serviceDesc: { fontSize: 12, color: "#999", marginTop: 4 },
  serviceActions: { marginLeft: 10, alignItems: "center", gap: 8 },
  editBtn: { padding: 8, backgroundColor: "#EBF5FF", borderRadius: 8 },
  deleteBtn: { padding: 8, backgroundColor: "#FEE2E2", borderRadius: 8 },
  badge: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginTop: 6 },
  badgeGreen: { backgroundColor: "#D1FAE5" },
  badgeRed: { backgroundColor: "#FEE2E2" },
  badgeText: { fontSize: 10, fontWeight: "bold", color: "#333" },
  emptyState: { backgroundColor: "#fff", borderRadius: 16, padding: 40, alignItems: "center", margin: 16 },
  emptyTitle: { fontSize: 18, fontWeight: "bold", color: "#135E4B", marginTop: 15 },
  emptyDesc: { fontSize: 14, color: "#666", textAlign: "center", marginTop: 10, lineHeight: 20 },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 24 },
  modalCard: { backgroundColor: "#fff", borderRadius: 18, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: "#135E4B", marginBottom: 16 },
  modalInput: {
    backgroundColor: "#F0F7F4", borderRadius: 10, padding: 12, marginBottom: 10,
    color: "#000", borderWidth: 1, borderColor: "#E0E0E0",
  },
  modalBtns: { flexDirection: "row", justifyContent: "flex-end", marginTop: 10, gap: 10 },
  cancelBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, backgroundColor: "#F3F4F6" },
  cancelBtnText: { color: "#666", fontWeight: "600" },
  saveBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, backgroundColor: "#4CB572" },
  saveBtnText: { color: "#fff", fontWeight: "bold" },
});
