import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  FlatList, ActivityIndicator, Alert, Modal, TextInput, RefreshControl, ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { getMyServices, updateService, deleteService, createService } from "../services/serviceApi";

const FIELDS = ["title", "description", "category", "price", "location"];

const ProviderDashboardScreen = () => {
  const navigation = useNavigation();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" | "edit"
  const [editId, setEditId] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");

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

  const resetForm = () => {
    setTitle(""); setDescription(""); setCategory(""); setPrice(""); setLocation("");
  };

  const openAdd = () => {
    resetForm();
    setModalMode("add");
    setEditId(null);
    setModalVisible(true);
  };

  const openEdit = (item) => {
    setTitle(item.title);
    setDescription(item.description);
    setCategory(item.category);
    setPrice(String(item.price));
    setLocation(item.location);
    setModalMode("edit");
    setEditId(item._id);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!title || !description || !category || !price || !location) {
      return Alert.alert("Missing Fields", "Please fill in all fields before saving.");
    }
    if (isNaN(Number(price)) || Number(price) <= 0) {
      return Alert.alert("Invalid Price", "Please enter a valid price greater than 0.");
    }
    try {
      const payload = { title, description, category, price: Number(price), location, availability: true };
      if (modalMode === "edit") {
        await updateService(editId, payload);
        Alert.alert("Success", "Service updated successfully!");
      } else {
        await createService({ ...payload, image: "" });
        Alert.alert("Success", "Service created successfully!");
      }
      setModalVisible(false);
      fetchMyServices();
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  const handleDelete = (id, serviceTitle) => {
    Alert.alert(
      "Delete Service",
      `Are you sure you want to delete "${serviceTitle}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete", style: "destructive",
          onPress: async () => {
            try {
              await deleteService(id);
              Alert.alert("Deleted", "Service has been removed.");
              fetchMyServices();
            } catch (e) { Alert.alert("Error", e.message); }
          },
        },
      ]
    );
  };

  const handleSwitchToCustomer = () => {
    Alert.alert(
      "Switch Mode",
      "Are you sure you want to switch to Customer Mode?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Yes, Switch", onPress: () => navigation.replace("Services") },
      ]
    );
  };

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
        <TouchableOpacity style={st.deleteBtn} onPress={() => handleDelete(item._id, item.title)}>
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
        <TouchableOpacity style={st.switchButton} onPress={handleSwitchToCustomer}>
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

      {/* Add/Edit Modal — individual state fields so typing doesn't remount */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={st.modalOverlay}>
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}>
            <View style={st.modalCard}>
              <Text style={st.modalTitle}>{modalMode === "edit" ? "Edit Service" : "Add New Service"}</Text>

              <Text style={st.fieldLabel}>Title</Text>
              <TextInput style={st.modalInput} placeholder="Service title" placeholderTextColor="#999" value={title} onChangeText={setTitle} />

              <Text style={st.fieldLabel}>Description</Text>
              <TextInput style={[st.modalInput, { minHeight: 70, textAlignVertical: "top" }]} placeholder="Describe your service" placeholderTextColor="#999" value={description} onChangeText={setDescription} multiline />

              <Text style={st.fieldLabel}>Category</Text>
              <TextInput style={st.modalInput} placeholder="e.g. Plumbing, Electrical" placeholderTextColor="#999" value={category} onChangeText={setCategory} />

              <Text style={st.fieldLabel}>Price (LKR)</Text>
              <TextInput style={st.modalInput} placeholder="0" placeholderTextColor="#999" value={price} onChangeText={setPrice} keyboardType="numeric" />

              <Text style={st.fieldLabel}>Location</Text>
              <TextInput style={st.modalInput} placeholder="City or area" placeholderTextColor="#999" value={location} onChangeText={setLocation} />

              <View style={st.modalBtns}>
                <TouchableOpacity style={st.cancelBtn} onPress={() => setModalVisible(false)}>
                  <Text style={st.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={st.saveBtn} onPress={handleSave}>
                  <Text style={st.saveBtnText}>{modalMode === "edit" ? "Update" : "Create"}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
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
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)" },
  modalCard: { backgroundColor: "#fff", borderRadius: 18, padding: 24, margin: 24 },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: "#135E4B", marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: "600", color: "#135E4B", marginBottom: 4 },
  modalInput: {
    backgroundColor: "#F0F7F4", borderRadius: 10, padding: 12, marginBottom: 12,
    color: "#000", borderWidth: 1, borderColor: "#E0E0E0", fontSize: 15,
  },
  modalBtns: { flexDirection: "row", justifyContent: "flex-end", marginTop: 10, gap: 10 },
  cancelBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, backgroundColor: "#F3F4F6" },
  cancelBtnText: { color: "#666", fontWeight: "600" },
  saveBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, backgroundColor: "#4CB572" },
  saveBtnText: { color: "#fff", fontWeight: "bold" },
});
