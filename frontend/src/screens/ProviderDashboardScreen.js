import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image,
  FlatList, ActivityIndicator, Modal, TextInput, RefreshControl, ScrollView, Switch, Dimensions
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { crossAlert } from "../utils/alert";
import { getMyServices, updateService, deleteService, createService } from "../services/serviceApi";
import { getProviderBookings, updateBookingStatus } from "../services/bookingApi";
import { getCategories } from "../services/categoryApi";
import { getUser, setToken, setUser } from "../services/authApi";

const { width } = Dimensions.get("window");
const SIDEBAR_W = width * 0.72;

const ProviderDashboardScreen = () => {
  const navigation = useNavigation();
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("services"); // "services" or "bookings"
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setLocalUser] = useState(null);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [editId, setEditId] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [imageUri, setImageUri] = useState("");

  const [categories, setCategories] = useState([]);
  const [catModalVisible, setCatModalVisible] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [servicesData, bookingsData, catsData] = await Promise.all([
        getMyServices(),
        getProviderBookings(),
        getCategories()
      ]);
      setServices(servicesData);
      setBookings(bookingsData);
      setCategories(catsData);
    } catch (e) {
      crossAlert("Error", e.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => { 
    const u = getUser();
    if (u) setLocalUser(u);
    fetchData(); 
  }, [fetchData]);

  const activeBookingsCount = bookings.filter(b => b.status === "pending" || b.status === "confirmed").length;

  const resetForm = () => {
    setTitle(""); setDescription(""); setCategory(""); setPrice(""); setLocation(""); setImageUri("");
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
    setImageUri(item.image || "");
    setModalMode("edit");
    setEditId(item._id);
    setModalVisible(true);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      return crossAlert("Permission Required", "Please allow access to your photo library to upload images.");
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.5,
      base64: true,
    });
    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];
      const base64Uri = `data:image/jpeg;base64,${asset.base64}`;
      setImageUri(base64Uri);
    }
  };

  const handleSave = async () => {
    if (!title || !description || !category || !price || !location) {
      return crossAlert("Missing Fields", "Please fill in all fields before saving.");
    }
    if (isNaN(Number(price)) || Number(price) <= 0) {
      return crossAlert("Invalid Price", "Please enter a valid price greater than 0.");
    }
    try {
      const payload = { title, description, category, price: Number(price), location, availability: true, image: imageUri };
      if (modalMode === "edit") {
        await updateService(editId, payload);
        crossAlert("Success", "Service updated successfully!");
      } else {
        await createService(payload);
        crossAlert("Success", "Service created successfully!");
      }
      setModalVisible(false);
      fetchData();
    } catch (e) {
      crossAlert("Error", e.message);
    }
  };

  const handleDelete = (id, serviceTitle) => {
    crossAlert(
      "Delete Service",
      `Are you sure you want to delete "${serviceTitle}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete", style: "destructive",
          onPress: async () => {
            try {
              await deleteService(id);
              crossAlert("Deleted", "Service has been removed.");
              fetchData();
            } catch (e) { crossAlert("Error", e.message); }
          },
        },
      ]
    );
  };

  const handleBookingAction = (id, status, actionName) => {
    crossAlert(
      `${actionName} Booking`,
      `Are you sure you want to ${actionName.toLowerCase()} this booking?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes",
          onPress: async () => {
            try {
              await updateBookingStatus(id, status);
              crossAlert("Success", `Booking has been ${status}.`);
              fetchData();
            } catch (e) {
              crossAlert("Error", e.message);
            }
          }
        }
      ]
    )
  };

  const handleToggleAvailability = async (service) => {
    try {
      await updateService(service._id, { availability: !service.availability });
      crossAlert("Success", `Service marked as ${!service.availability ? 'Available' : 'Unavailable'}`);
      fetchData();
    } catch (e) {
      crossAlert("Error", e.message);
    }
  };

  const handleSwitchToCustomer = () => {
    setSidebarOpen(false);
    setTimeout(() => {
      crossAlert(
        "Switch Mode",
        "Are you sure you want to switch to Customer Mode?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Yes, Switch", onPress: () => navigation.replace("Services") },
        ]
      );
    }, 400);
  };

  const handleSignOut = () => {
    setSidebarOpen(false);
    setTimeout(() => {
      crossAlert(
        "Sign Out",
        "Are you sure you want to sign out?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Sign Out", style: "destructive",
            onPress: () => {
              setToken(null);
              setUser(null);
              navigation.replace("Login");
            },
          },
        ]
      );
    }, 400);
  };

  const renderService = ({ item }) => (
    <View style={st.serviceCard}>
      {item.image ? (
        <Image source={{ uri: item.image }} style={st.serviceImg} />
      ) : null}
      <View style={st.serviceBody}>
        <View style={{ flex: 1 }}>
          <Text style={st.serviceTitle}>{item.title}</Text>
          <Text style={st.serviceSub}>{item.category} · LKR {item.price}</Text>
          <Text style={st.serviceSub}>{item.location}</Text>
          <Text style={st.serviceDesc} numberOfLines={2}>{item.description}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
            <View style={[st.badge, item.availability ? st.badgeGreen : st.badgeRed, { marginRight: 10, marginTop: 0 }]}>
              <Text style={st.badgeText}>{item.availability ? "AVAILABLE" : "UNAVAILABLE"}</Text>
            </View>
            <Switch
              value={item.availability}
              onValueChange={() => handleToggleAvailability(item)}
              trackColor={{ false: "#ccc", true: "#4CB572" }}
              thumbColor={"#fff"}
            />
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
    </View>
  );

  const renderBooking = ({ item }) => (
    <View style={st.serviceCard}>
      <View style={st.serviceBody}>
        <View style={{ flex: 1 }}>
          <View style={st.bookingHeader}>
            <Text style={st.serviceTitle}>{item.service?.title || "Service"}</Text>
            <View style={[st.badge, st[`badge_${item.status}`]]}>
              <Text style={st.badgeText}>
                {item.status === "paid" ? "PAYMENT RECEIVED" : 
                 item.status === "pending_payment" ? "PENDING PAYMENT" : 
                 item.status.toUpperCase()}
              </Text>
            </View>
          </View>
          
          <Text style={st.serviceSub}>
            Customer: {item.customer?.firstName} {item.customer?.lastName}
          </Text>
          <Text style={st.serviceDesc}>
            <Ionicons name="call-outline" size={12} /> {item.phone || "N/A"}
          </Text>
          
          <View style={{ marginTop: 8 }}>
            <View style={st.row}>
              <Ionicons name="calendar-outline" size={14} color="#666" />
              <Text style={st.infoText}>{item.date}</Text>
            </View>
            <View style={st.row}>
              <Ionicons name="time-outline" size={14} color="#666" />
              <Text style={st.infoText}>{item.time}</Text>
            </View>
            <View style={st.row}>
              <Ionicons name="location-outline" size={14} color="#666" />
              <Text style={st.infoText}>{item.location}</Text>
            </View>
          </View>

          {item.notes ? (
            <Text style={st.notesBox}><Text style={{fontWeight: 'bold'}}>Notes:</Text> {item.notes}</Text>
          ) : null}
          
          {item.status === "pending" && (
            <View style={st.bookingActionRow}>
              <TouchableOpacity 
                style={[st.actionBtn, { backgroundColor: "#EF4444", flex: 1, marginRight: 6 }]} 
                onPress={() => handleBookingAction(item._id, "cancelled", "Reject")}
              >
                <Ionicons name="close-circle-outline" size={18} color="#fff" />
                <Text style={st.actionBtnText}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[st.actionBtn, { backgroundColor: "#4CB572", flex: 1, marginLeft: 6 }]} 
                onPress={() => handleBookingAction(item._id, "pending_payment", "Accept")}
              >
                <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                <Text style={st.actionBtnText}>Accept</Text>
              </TouchableOpacity>
            </View>
          )}

          {item.status === "paid" && (
            <View style={st.bookingActionRow}>
              <TouchableOpacity 
                style={[st.actionBtn, { backgroundColor: "#3B82F6", flex: 1 }]} 
                onPress={() => handleBookingAction(item._id, "completed", "Mark as Completed")}
              >
                <Ionicons name="checkmark-done-circle-outline" size={18} color="#fff" />
                <Text style={st.actionBtnText}>Mark Completed</Text>
              </TouchableOpacity>
            </View>
          )}

        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={st.container}>
      {/* Header */}
      <View style={st.header}>
        <TouchableOpacity onPress={() => setSidebarOpen(true)} style={{ marginRight: 12, padding: 4 }}>
          <Ionicons name="menu" size={28} color="#135E4B" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={st.greeting}>Provider Dashboard</Text>
          <Text style={st.subText}>Manage your services & bookings</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={st.statsRow}>
        <View style={st.statCard}>
          <Text style={st.statNumber}>{services.length}</Text>
          <Text style={st.statLabel}>My Services</Text>
        </View>
        <View style={st.statCard}>
          <Text style={st.statNumber}>{activeBookingsCount}</Text>
          <Text style={st.statLabel}>Active Bookings</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={st.tabsContainer}>
        <TouchableOpacity 
          style={[st.tabBtn, activeTab === "services" && st.tabBtnActive]}
          onPress={() => setActiveTab("services")}
        >
          <Text style={[st.tabBtnText, activeTab === "services" && st.tabBtnTextActive]}>My Services</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[st.tabBtn, activeTab === "bookings" && st.tabBtnActive]}
          onPress={() => setActiveTab("bookings")}
        >
          <Text style={[st.tabBtnText, activeTab === "bookings" && st.tabBtnTextActive]}>Bookings Requests</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === "services" ? (
        <>
          <View style={st.sectionHeader}>
            <Text style={st.sectionTitle}>My Services</Text>
            <TouchableOpacity 
              style={[st.addBtn, services.length >= 3 && { backgroundColor: '#999' }]} 
              onPress={() => {
                if (services.length >= 3) {
                  crossAlert("Limit Reached", "You can only create a maximum of 3 services.");
                } else {
                  openAdd();
                }
              }}
            >
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
              refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} />}
            />
          )}
        </>
      ) : (
        <>
          <View style={st.sectionHeader}>
            <Text style={st.sectionTitle}>Booking Requests</Text>
          </View>
          {loading ? (
            <ActivityIndicator size="large" color="#135E4B" style={{ marginTop: 30 }} />
          ) : bookings.length === 0 ? (
            <View style={st.emptyState}>
              <Ionicons name="calendar-outline" size={60} color="#135E4B" />
              <Text style={st.emptyTitle}>No booking requests</Text>
              <Text style={st.emptyDesc}>You have no bookings right now.</Text>
            </View>
          ) : (
            <FlatList
              data={bookings}
              keyExtractor={(item) => item._id}
              renderItem={renderBooking}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
              refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} />}
            />
          )}
        </>
      )}

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={st.modalOverlay}>
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}>
            <View style={st.modalCard}>
              <Text style={st.modalTitle}>{modalMode === "edit" ? "Edit Service" : "Add New Service"}</Text>

              {/* Image Picker */}
              <Text style={st.fieldLabel}>Service Image</Text>
              <TouchableOpacity style={st.imagePickerBtn} onPress={pickImage}>
                {imageUri ? (
                  <Image source={{ uri: imageUri }} style={st.imagePreview} />
                ) : (
                  <View style={st.imagePickerPlaceholder}>
                    <Ionicons name="camera-outline" size={32} color="#999" />
                    <Text style={st.imagePickerText}>Tap to upload image</Text>
                  </View>
                )}
              </TouchableOpacity>

              <Text style={st.fieldLabel}>Title</Text>
              <TextInput style={st.modalInput} placeholder="Service title" placeholderTextColor="#999" value={title} onChangeText={setTitle} />

              <Text style={st.fieldLabel}>Description</Text>
              <TextInput style={[st.modalInput, { minHeight: 70, textAlignVertical: "top" }]} placeholder="Describe your service" placeholderTextColor="#999" value={description} onChangeText={setDescription} multiline />

              <Text style={st.fieldLabel}>Category</Text>
              <TouchableOpacity 
                style={st.pickerButton} 
                onPress={() => setCatModalVisible(true)}
              >
                <Text style={[st.pickerButtonText, !category && { color: "#999" }]}>
                  {category || "Select a Category"}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>

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

      {/* Sidebar Modal */}
      <Modal visible={sidebarOpen} transparent animationType="fade" onRequestClose={() => setSidebarOpen(false)}>
        <View style={st.overlay}>
          <TouchableOpacity style={st.overlayBg} activeOpacity={1} onPress={() => setSidebarOpen(false)} />
          <View style={st.sidebar}>
            {/* Profile Section */}
            <View style={st.sidebarProfile}>
              <View style={st.avatarCircle}>
                {user?.profileImage ? (
                  <Image source={{ uri: user.profileImage.startsWith('/uploads') ? `http://192.168.8.102:5000${user.profileImage}` : user.profileImage }} style={{ width: 64, height: 64, borderRadius: 32 }} />
                ) : (
                  <Ionicons name="person" size={36} color="#fff" />
                )}
              </View>
              <Text style={st.profileName}>{user?.firstName || "User"} {user?.lastName || ""}</Text>
              <Text style={st.profileEmail}>{user?.email || ""}</Text>
            </View>

            {/* Menu Items */}
            <TouchableOpacity style={st.sidebarItem} onPress={() => { setSidebarOpen(false); navigation.navigate("MyProfile"); }}>
              <Ionicons name="person-circle-outline" size={22} color="#A8D5BA" />
              <Text style={st.sidebarLabel}>My Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity style={st.sidebarItem} onPress={() => { setSidebarOpen(false); navigation.navigate("MyBookings"); }}>
              <Ionicons name="calendar-outline" size={22} color="#A8D5BA" />
              <Text style={st.sidebarLabel}>My Bookings (As Customer)</Text>
            </TouchableOpacity>

            <TouchableOpacity style={st.sidebarItem} onPress={handleSwitchToCustomer}>
              <Ionicons name="swap-horizontal-outline" size={22} color="#A8D5BA" />
              <Text style={st.sidebarLabel}>Customer Mode</Text>
            </TouchableOpacity>

            <View style={st.sidebarDivider} />

            <TouchableOpacity style={st.sidebarItem} onPress={handleSignOut}>
              <Ionicons name="log-out-outline" size={22} color="#FF6B6B" />
              <Text style={[st.sidebarLabel, { color: "#FF6B6B" }]}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Category Modal */}
      <Modal visible={catModalVisible} transparent animationType="slide">
        <View style={st.catModalOverlay}>
          <View style={st.catModalContent}>
            <Text style={st.catModalTitle}>Select Category</Text>
            {categories.length === 0 ? (
              <Text style={{ textAlign: "center", color: "#666", padding: 20 }}>No categories available</Text>
            ) : (
              <FlatList
                data={categories}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={st.catModalItem}
                    onPress={() => {
                      setCategory(item.name);
                      setCatModalVisible(false);
                    }}
                  >
                    <Text style={st.catModalItemText}>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
            )}
            <TouchableOpacity style={st.catModalCloseBtn} onPress={() => setCatModalVisible(false)}>
              <Text style={st.catModalCloseBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
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
  tabsContainer: {
    flexDirection: "row", marginHorizontal: 16, marginBottom: 16, backgroundColor: "#E0ECEB",
    borderRadius: 10, padding: 4
  },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 8 },
  tabBtnActive: { backgroundColor: "#fff", elevation: 1 },
  tabBtnText: { fontSize: 14, fontWeight: "600", color: "#666" },
  tabBtnTextActive: { color: "#135E4B" },
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
    backgroundColor: "#fff", borderRadius: 14, marginBottom: 10, overflow: "hidden",
    elevation: 1, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 3, shadowOffset: { width: 0, height: 1 },
  },
  serviceImg: { width: "100%", height: 140, resizeMode: "cover" },
  serviceBody: { padding: 16, flexDirection: "row", alignItems: "flex-start" },
  serviceTitle: { fontSize: 16, fontWeight: "bold", color: "#135E4B" },
  serviceSub: { fontSize: 13, color: "#666", marginTop: 2 },
  serviceDesc: { fontSize: 12, color: "#999", marginTop: 4 },
  serviceActions: { marginLeft: 10, alignItems: "center", gap: 8 },
  editBtn: { padding: 8, backgroundColor: "#EBF5FF", borderRadius: 8 },
  deleteBtn: { padding: 8, backgroundColor: "#FEE2E2", borderRadius: 8 },
  badge: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginTop: 6 },
  badgeGreen: { backgroundColor: "#D1FAE5" },
  badgeRed: { backgroundColor: "#FEE2E2" },
  badge_pending: { backgroundColor: "#FEF3C7" },
  badge_pending_payment: { backgroundColor: "#FEF3C7" },
  badge_paid: { backgroundColor: "#D1FAE5" },
  badge_confirmed: { backgroundColor: "#D1FAE5" },
  badge_completed: { backgroundColor: "#DBEAFE" },
  badge_cancelled: { backgroundColor: "#FEE2E2" },
  badgeText: { fontSize: 10, fontWeight: "bold", color: "#333" },
  bookingHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  infoText: { fontSize: 13, color: "#666", marginLeft: 6 },
  notesBox: { backgroundColor: "#F9FAFB", padding: 10, borderRadius: 8, marginTop: 8, fontSize: 13, color: "#555" },
  bookingActionRow: { flexDirection: "row", marginTop: 14 },
  actionBtn: { flexDirection: "row", padding: 10, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  actionBtnText: { color: "#fff", fontWeight: "bold", marginLeft: 6, fontSize: 14 },
  emptyState: { backgroundColor: "#fff", borderRadius: 16, padding: 40, alignItems: "center", margin: 16 },
  emptyTitle: { fontSize: 18, fontWeight: "bold", color: "#333", marginTop: 16 },
  emptyDesc: { fontSize: 14, color: "#666", marginTop: 8, textAlign: "center", paddingHorizontal: 20 },
  pickerButton: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: "#F8FBF9", borderRadius: 10, padding: 14, marginBottom: 16,
    borderWidth: 1, borderColor: "#E0E0E0",
  },
  pickerButtonText: { fontSize: 15, color: "#000" },
  catModalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  catModalContent: { backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: "50%" },
  catModalTitle: { fontSize: 18, fontWeight: "bold", color: "#135E4B", marginBottom: 15, textAlign: "center" },
  catModalItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: "#F0F0F0" },
  catModalItemText: { fontSize: 16, color: "#333", textAlign: "center" },
  catModalCloseBtn: { marginTop: 15, paddingVertical: 12, backgroundColor: "#E0E0E0", borderRadius: 10, alignItems: "center" },
  catModalCloseBtnText: { fontWeight: "bold", color: "#333" },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)" },
  modalCard: { backgroundColor: "#fff", borderRadius: 18, padding: 24, margin: 24 },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: "#135E4B", marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: "600", color: "#135E4B", marginBottom: 4 },
  modalInput: {
    backgroundColor: "#F0F7F4", borderRadius: 10, padding: 12, marginBottom: 12,
    color: "#000", borderWidth: 1, borderColor: "#E0E0E0", fontSize: 15,
  },
  // Image picker
  imagePickerBtn: { marginBottom: 14, borderRadius: 12, overflow: "hidden" },
  imagePreview: { width: "100%", height: 140, borderRadius: 12 },
  imagePickerPlaceholder: {
    width: "100%", height: 120, borderRadius: 12, borderWidth: 2, borderStyle: "dashed",
    borderColor: "#ccc", backgroundColor: "#F0F7F4",
    alignItems: "center", justifyContent: "center",
  },
  imagePickerText: { fontSize: 13, color: "#999", marginTop: 6 },
  modalBtns: { flexDirection: "row", justifyContent: "flex-end", marginTop: 10, gap: 10 },
  cancelBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, backgroundColor: "#F3F4F6" },
  cancelBtnText: { color: "#666", fontWeight: "600" },
  saveBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, backgroundColor: "#4CB572" },
  saveBtnText: { color: "#fff", fontWeight: "bold" },
  // Sidebar
  overlay: { flex: 1, flexDirection: "row" },
  overlayBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  sidebar: {
    position: "absolute", left: 0, top: 0, bottom: 0, width: SIDEBAR_W,
    backgroundColor: "#135E4B", paddingVertical: 50, paddingHorizontal: 20,
    shadowColor: "#000", shadowOffset: { width: 4, height: 0 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 15,
  },
  sidebarProfile: { alignItems: "center", marginBottom: 40 },
  avatarCircle: {
    width: 70, height: 70, borderRadius: 35, backgroundColor: "#4CB572",
    justifyContent: "center", alignItems: "center", marginBottom: 12, borderWidth: 2, borderColor: "#A8D5BA",
  },
  profileName: { fontSize: 18, fontWeight: "bold", color: "#fff", marginBottom: 4 },
  profileEmail: { fontSize: 13, color: "#A8D5BA" },
  sidebarItem: { flexDirection: "row", alignItems: "center", paddingVertical: 14, marginBottom: 8 },
  sidebarLabel: { fontSize: 16, color: "#fff", marginLeft: 14, fontWeight: "500" },
  sidebarDivider: { height: 1, backgroundColor: "rgba(168,213,186,0.3)", marginVertical: 20 },
});
