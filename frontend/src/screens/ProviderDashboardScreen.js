import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image,
  FlatList, ActivityIndicator, Modal, TextInput, RefreshControl, ScrollView, Switch, Dimensions, Platform, StatusBar
} from "react-native";
import KeyboardAwareScrollView from "../components/KeyboardAwareScrollView";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { crossAlert } from "../utils/alert";
import { getMyServices, updateService, deleteService, createService, displayService } from "../services/serviceApi";
import { getProviderBookings, updateBookingStatus, getProviderEarnings, getProviderReviews } from "../services/bookingApi";
import { getCategories } from "../services/categoryApi";
import { getUser, setToken, setUser } from "../services/authApi";
import { IMAGE_BASE_URL } from "../config/api";

const { width } = Dimensions.get("window");
const SIDEBAR_W = width * 0.72;

const TABS = ["services", "bookings", "earnings", "reviews"];

const ProviderDashboardScreen = () => {
  const navigation = useNavigation();
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("services");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setLocalUser] = useState(null);

  // Earnings & Reviews
  const [earnings, setEarnings] = useState({ totalEarnings: 0, totalJobs: 0, monthly: [], perService: [] });
  const [reviewsData, setReviewsData] = useState({ reviews: [], averageRating: 0, totalReviews: 0 });

  // Booking filter
  const [bookingFilter, setBookingFilter] = useState("all");

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
      const [servicesData, bookingsData, catsData, earningsData, reviewsResult] = await Promise.all([
        getMyServices(),
        getProviderBookings(),
        getCategories(),
        getProviderEarnings().catch(() => ({ totalEarnings: 0, totalJobs: 0, monthly: [], perService: [] })),
        getProviderReviews().catch(() => ({ reviews: [], averageRating: 0, totalReviews: 0 })),
      ]);
      setServices(servicesData);
      setBookings(bookingsData);
      setCategories(catsData);
      setEarnings(earningsData);
      setReviewsData(reviewsResult);
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

  const handleDisplayService = async (serviceId) => {
    try {
      await displayService(serviceId);
      crossAlert("Success", "Service visibility updated.");
      fetchData();
    } catch (e) {
      crossAlert("Error", e.message);
    }
  };

  const handleCloneService = (item) => {
    if (services.length >= 3) {
      return crossAlert("Limit Reached", "You can only create a maximum of 3 services.");
    }
    crossAlert("Clone Service", `Create a copy of "${item.title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clone", onPress: async () => {
          try {
            await createService({
              title: `${item.title} (Copy)`,
              description: item.description,
              category: item.category,
              price: item.price,
              location: item.location,
              availability: true,
              image: item.image || "",
            });
            crossAlert("Success", "Service cloned successfully!");
            fetchData();
          } catch (e) { crossAlert("Error", e.message); }
        }
      }
    ]);
  };

  const filteredBookings = bookingFilter === "all"
    ? bookings
    : bookings.filter(b => b.status === bookingFilter);

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
      ) : (
        <View style={st.serviceImgPlaceholder}>
          <Ionicons name="construct-outline" size={36} color="#A8D5BA" />
        </View>
      )}
      <View style={st.serviceBody}>
        <View style={{ flex: 1 }}>
          {/* Title + Actions row */}
          <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>
            <Text style={st.serviceTitle} numberOfLines={1}>{item.title}</Text>
            <View style={{ flexDirection: "row", gap: 6, marginLeft: 8 }}>
              <TouchableOpacity style={st.editBtn} onPress={() => handleCloneService(item)}>
                <Ionicons name="copy-outline" size={18} color="#8B5CF6" />
              </TouchableOpacity>
              <TouchableOpacity style={st.editBtn} onPress={() => openEdit(item)}>
                <Ionicons name="create-outline" size={18} color="#3B82F6" />
              </TouchableOpacity>
              <TouchableOpacity style={st.deleteBtn} onPress={() => handleDelete(item._id, item.title)}>
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Category chip */}
          <View style={st.categoryChip}>
            <Ionicons name="pricetag-outline" size={11} color="#135E4B" />
            <Text style={st.categoryChipText}>{item.category}</Text>
          </View>

          {/* Price */}
          <View style={st.priceRow}>
            <Text style={st.priceLabel}>Rs.</Text>
            <Text style={st.priceValue}>{item.price?.toLocaleString()}</Text>
            <Text style={st.priceUnit}> / hr</Text>
          </View>

          {/* Location */}
          <View style={st.infoRowSmall}>
            <Ionicons name="location-outline" size={13} color="#888" />
            <Text style={st.infoTextSmall} numberOfLines={1}>{item.location}</Text>
          </View>

          {/* Description */}
          <Text style={st.serviceDesc} numberOfLines={2}>{item.description}</Text>

          {/* Status Badges & Action Buttons */}
          <View style={{ marginTop: 10, marginBottom: 4, gap: 8 }}>
            {item.status === 'pending' && (
              <View style={[st.statusBadge, { backgroundColor: '#FEF3C7', alignSelf: 'flex-start' }]}>
                <Ionicons name="time-outline" size={14} color="#B45309" />
                <Text style={[st.statusBadgeText, { color: '#B45309' }]}>Waiting for Admin Approval</Text>
              </View>
            )}
            {item.status === 'rejected' && (
              <View style={{ gap: 6 }}>
                <View style={[st.statusBadge, { backgroundColor: '#FEE2E2', alignSelf: 'flex-start' }]}>
                  <Ionicons name="close-circle-outline" size={14} color="#991B1B" />
                  <Text style={[st.statusBadgeText, { color: '#991B1B' }]}>Update Rejected</Text>
                </View>
                <Text style={{ fontSize: 12, color: '#991B1B', fontStyle: 'italic', marginBottom: 4 }}>Reason: {item.rejectionReason}</Text>
                <TouchableOpacity style={st.displayActionBtn} onPress={() => handleDisplayService(item._id)}>
                  <Text style={st.displayActionBtnText}>Display Old Service</Text>
                </TouchableOpacity>
              </View>
            )}
            {item.status === 'approved' && item.approvalActionRequired && (
              <View style={{ gap: 6 }}>
                <View style={[st.statusBadge, { backgroundColor: '#DBEAFE', alignSelf: 'flex-start' }]}>
                  <Ionicons name="checkmark-done-outline" size={14} color="#1E40AF" />
                  <Text style={[st.statusBadgeText, { color: '#1E40AF' }]}>Approved (Hidden)</Text>
                </View>
                <TouchableOpacity style={st.displayActionBtn} onPress={() => handleDisplayService(item._id)}>
                  <Text style={st.displayActionBtnText}>Approval received - Display now</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Availability toggle */}
          <View style={st.availabilityRow}>
            <View style={[st.availBadge, item.availability ? st.availBadgeOn : st.availBadgeOff]}>
              <View style={[st.availDot, { backgroundColor: item.availability ? "#16A34A" : "#DC2626" }]} />
              <Text style={[st.availText, { color: item.availability ? "#16A34A" : "#DC2626" }]}>
                {item.availability ? "Available" : "Unavailable"}
              </Text>
            </View>
            <Switch
              value={item.availability}
              onValueChange={() => handleToggleAvailability(item)}
              trackColor={{ false: "#ccc", true: "#4CB572" }}
              thumbColor={"#fff"}
            />
          </View>
        </View>
      </View>
    </View>
  );

  const statusConfig = {
    pending:         { label: "Pending Review",   bg: "#FEF9C3", color: "#92400E", icon: "time-outline" },
    pending_payment: { label: "Awaiting Payment", bg: "#FEF3C7", color: "#B45309", icon: "card-outline" },
    paid:            { label: "Payment Received", bg: "#D1FAE5", color: "#065F46", icon: "checkmark-circle-outline" },
    confirmed:       { label: "Confirmed",        bg: "#DBEAFE", color: "#1E40AF", icon: "checkmark-done-outline" },
    completed:       { label: "Completed",        bg: "#EDE9FE", color: "#5B21B6", icon: "ribbon-outline" },
    cancelled:       { label: "Cancelled",        bg: "#FEE2E2", color: "#991B1B", icon: "close-circle-outline" },
  };

  const renderBooking = ({ item }) => {
    const cfg = statusConfig[item.status] || { label: item.status?.toUpperCase() || "UNKNOWN", bg: "#F3F4F6", color: "#374151", icon: "ellipse-outline" };
    return (
      <View style={st.bookingCard}>
        {/* Top: service name + status badge */}
        <View style={st.bookingTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={st.bookingServiceName} numberOfLines={1}>{item.service?.title || "Service"}</Text>
            <Text style={st.bookingId}>#{item._id?.slice(-6)?.toUpperCase()}</Text>
          </View>
          <View style={[st.statusBadge, { backgroundColor: cfg.bg }]}>
            <Ionicons name={cfg.icon} size={12} color={cfg.color} />
            <Text style={[st.statusBadgeText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
        </View>

        <View style={st.bookingDivider} />

        {/* Customer info */}
        <View style={st.bookingInfoSection}>
          <View style={st.bookingInfoRow}>
            <View style={st.bookingInfoIcon}>
              <Ionicons name="person-outline" size={14} color="#135E4B" />
            </View>
            <View>
              <Text style={st.bookingInfoLabel}>Customer</Text>
              <Text style={st.bookingInfoValue}>{item.customer?.firstName} {item.customer?.lastName}</Text>
            </View>
          </View>
          <View style={st.bookingInfoRow}>
            <View style={st.bookingInfoIcon}>
              <Ionicons name="call-outline" size={14} color="#135E4B" />
            </View>
            <View>
              <Text style={st.bookingInfoLabel}>Phone</Text>
              <Text style={st.bookingInfoValue}>{item.phone || "Not provided"}</Text>
            </View>
          </View>
        </View>

        {/* Schedule details */}
        <View style={st.bookingScheduleBox}>
          <View style={st.bookingScheduleRow}>
            <Ionicons name="calendar-outline" size={14} color="#4CB572" />
            <Text style={st.bookingScheduleText}>{item.date}</Text>
            <View style={st.scheduleDot} />
            <Ionicons name="time-outline" size={14} color="#4CB572" />
            <Text style={st.bookingScheduleText}>{item.time}</Text>
          </View>
          <View style={st.bookingInfoRow}>
            <Ionicons name="location-outline" size={14} color="#4CB572" />
            <Text style={st.bookingLocationText} numberOfLines={2}>{item.location}</Text>
          </View>
        </View>

        {/* Notes */}
        {item.notes ? (
          <View style={st.notesBox}>
            <Ionicons name="document-text-outline" size={13} color="#6B7280" />
            <Text style={st.notesText}><Text style={{ fontWeight: "700" }}>Notes: </Text>{item.notes}</Text>
          </View>
        ) : null}

        {/* Actions */}
        {item.status === "pending" && (
          <View style={st.bookingActionRow}>
            <TouchableOpacity
              style={[st.actionBtn, { backgroundColor: "#FEE2E2", flex: 1, marginRight: 6 }]}
              onPress={() => handleBookingAction(item._id, "cancelled", "Reject")}
            >
              <Ionicons name="close-circle-outline" size={18} color="#DC2626" />
              <Text style={[st.actionBtnText, { color: "#DC2626" }]}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[st.actionBtn, { backgroundColor: "#D1FAE5", flex: 1, marginLeft: 6 }]}
              onPress={() => handleBookingAction(item._id, "pending_payment", "Accept")}
            >
              <Ionicons name="checkmark-circle-outline" size={18} color="#065F46" />
              <Text style={[st.actionBtnText, { color: "#065F46" }]}>Accept</Text>
            </TouchableOpacity>
          </View>
        )}
        {item.status === "paid" && (
          <TouchableOpacity
            style={[st.actionBtn, { backgroundColor: "#DBEAFE", marginTop: 10 }]}
            onPress={() => handleBookingAction(item._id, "completed", "Mark as Completed")}
          >
            <Ionicons name="checkmark-done-circle-outline" size={18} color="#1E40AF" />
            <Text style={[st.actionBtnText, { color: "#1E40AF" }]}>Mark as Completed</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

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
          <Text style={st.statLabel}>Services</Text>
        </View>
        <View style={st.statCard}>
          <Text style={st.statNumber}>{activeBookingsCount}</Text>
          <Text style={st.statLabel}>Active</Text>
        </View>
        <View style={st.statCard}>
          <Text style={[st.statNumber, { color: "#10B981" }]}>Rs.{earnings.totalEarnings?.toLocaleString() || 0}</Text>
          <Text style={st.statLabel}>Earned</Text>
        </View>
        <View style={st.statCard}>
          <Text style={[st.statNumber, { color: "#F59E0B" }]}>{reviewsData.averageRating || "—"}</Text>
          <Text style={st.statLabel}>Rating</Text>
        </View>
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={st.tabsContainer} contentContainerStyle={{ paddingHorizontal: 12 }}>
        {[
          { key: "services", label: "My Services" },
          { key: "bookings", label: "Bookings" },
          { key: "earnings", label: "Earnings" },
          { key: "reviews", label: "Reviews" },
        ].map(t => (
          <TouchableOpacity
            key={t.key}
            style={[st.tabBtn, activeTab === t.key && st.tabBtnActive]}
            onPress={() => setActiveTab(t.key)}
          >
            <Text style={[st.tabBtnText, activeTab === t.key && st.tabBtnTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

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
      ) : activeTab === "bookings" ? (
        <>
          <View style={st.sectionHeader}>
            <Text style={st.sectionTitle}>Booking Requests</Text>
          </View>
          {/* Booking Filter Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 44, marginBottom: 8 }} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
            {["all", "pending", "pending_payment", "paid", "completed", "cancelled"].map(f => (
              <TouchableOpacity
                key={f}
                style={[st.filterChip, bookingFilter === f && st.filterChipActive]}
                onPress={() => setBookingFilter(f)}
              >
                <Text style={[st.filterChipText, bookingFilter === f && st.filterChipTextActive]}>
                  {f === "all" ? "All" : f.replace("_", " ").toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {loading ? (
            <ActivityIndicator size="large" color="#135E4B" style={{ marginTop: 30 }} />
          ) : filteredBookings.length === 0 ? (
            <View style={st.emptyState}>
              <Ionicons name="calendar-outline" size={60} color="#135E4B" />
              <Text style={st.emptyTitle}>No bookings found</Text>
              <Text style={st.emptyDesc}>{bookingFilter === "all" ? "You have no bookings right now." : "No bookings with this status."}</Text>
            </View>
          ) : (
            <FlatList
              data={filteredBookings}
              keyExtractor={(item) => item._id}
              renderItem={renderBooking}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
              refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} />}
            />
          )}
        </>
      ) : activeTab === "earnings" ? (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} />}>
          {/* Summary Cards */}
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
            <View style={[st.earnCard, { flex: 1 }]}>  
              <Ionicons name="cash-outline" size={24} color="#10B981" />
              <Text style={st.earnCardValue}>Rs. {earnings.totalEarnings?.toLocaleString() || 0}</Text>
              <Text style={st.earnCardLabel}>Total Earnings</Text>
            </View>
            <View style={[st.earnCard, { flex: 1 }]}>
              <Ionicons name="briefcase-outline" size={24} color="#3B82F6" />
              <Text style={st.earnCardValue}>{earnings.totalJobs || 0}</Text>
              <Text style={st.earnCardLabel}>Completed Jobs</Text>
            </View>
          </View>

          {/* Monthly Breakdown */}
          <Text style={[st.sectionTitle, { marginBottom: 12 }]}>Monthly Breakdown</Text>
          {earnings.monthly?.length === 0 ? (
            <Text style={{ color: "#999", textAlign: "center", padding: 20 }}>No earnings data yet</Text>
          ) : (
            earnings.monthly?.map((m, i) => (
              <View key={m.month} style={st.monthRow}>
                <View style={{ flex: 1 }}>
                  <Text style={st.monthLabel}>{m.month}</Text>
                  <Text style={st.monthSub}>{m.jobs} job{m.jobs !== 1 ? "s" : ""}</Text>
                </View>
                <Text style={st.monthEarnings}>Rs. {m.earnings?.toLocaleString()}</Text>
                <View style={[st.monthBar, { width: Math.max(8, (m.earnings / (earnings.totalEarnings || 1)) * 80) }]} />
              </View>
            ))
          )}

          {/* Per-Service Breakdown */}
          {earnings.perService?.length > 0 && (
            <>
              <Text style={[st.sectionTitle, { marginTop: 20, marginBottom: 12 }]}>Earnings by Service</Text>
              {earnings.perService.map((s, i) => (
                <View key={s.serviceId} style={st.perServiceRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={st.perServiceTitle}>{s.title}</Text>
                    <Text style={st.perServiceSub}>{s.category} · {s.jobs} job{s.jobs !== 1 ? "s" : ""}</Text>
                  </View>
                  <Text style={st.perServiceEarnings}>Rs. {s.earnings?.toLocaleString()}</Text>
                </View>
              ))}
            </>
          )}
        </ScrollView>
      ) : activeTab === "reviews" ? (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} />}>
          {/* Rating Summary */}
          <View style={st.ratingSummary}>
            <Text style={st.ratingBig}>{reviewsData.averageRating || "0.0"}</Text>
            <View style={{ flexDirection: "row", marginVertical: 6 }}>
              {[1, 2, 3, 4, 5].map(s => (
                <Ionicons key={s} name={s <= Math.round(reviewsData.averageRating) ? "star" : "star-outline"} size={22} color="#F59E0B" />
              ))}
            </View>
            <Text style={st.ratingCount}>{reviewsData.totalReviews} review{reviewsData.totalReviews !== 1 ? "s" : ""}</Text>
          </View>

          {/* Review List */}
          {reviewsData.reviews?.length === 0 ? (
            <View style={st.emptyState}>
              <Ionicons name="chatbubbles-outline" size={60} color="#135E4B" />
              <Text style={st.emptyTitle}>No reviews yet</Text>
              <Text style={st.emptyDesc}>Customer reviews will appear here</Text>
            </View>
          ) : (
            reviewsData.reviews.map((r) => (
              <View key={r._id} style={st.reviewCard}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
                  <Text style={st.reviewerName}>{r.customer?.firstName} {r.customer?.lastName}</Text>
                  <View style={{ flexDirection: "row" }}>
                    {[1, 2, 3, 4, 5].map(s => (
                      <Ionicons key={s} name={s <= r.rating ? "star" : "star-outline"} size={14} color="#F59E0B" />
                    ))}
                  </View>
                </View>
                <Text style={st.reviewService}>{r.service?.title || "Service"}</Text>
                <Text style={st.reviewComment}>{r.comment}</Text>
                <Text style={st.reviewDate}>{new Date(r.createdAt).toLocaleDateString()}</Text>
              </View>
            ))
          )}
        </ScrollView>
      ) : null}

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={st.modalOverlay}>
          <KeyboardAwareScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }} enableOnAndroid={true} keyboardShouldPersistTaps="handled">
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

              <Text style={st.fieldLabel}>Price (Rs. per hour)</Text>
              <TextInput style={st.modalInput} placeholder="e.g. 1500" placeholderTextColor="#999" value={price} onChangeText={setPrice} keyboardType="numeric" />

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
          </KeyboardAwareScrollView>
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
                {user?.profileImage && (user.profileImage.startsWith("http") || user.profileImage.startsWith("/uploads")) ? (
                  <Image source={{ uri: user.profileImage.startsWith('/uploads') ? `${IMAGE_BASE_URL}${user.profileImage}` : user.profileImage }} style={{ width: 64, height: 64, borderRadius: 32 }} />
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
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 24) + 10 : 44,
    paddingBottom: 16,
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
    flex: 1, backgroundColor: "#fff", padding: 12, borderRadius: 14, alignItems: "center",
    elevation: 2, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 2 },
  },
  statNumber: { fontSize: 16, fontWeight: "bold", color: "#135E4B", marginBottom: 2 },
  statLabel: { fontSize: 11, color: "#666" },
  tabsContainer: {
    marginBottom: 16, backgroundColor: "#E0ECEB",
    borderRadius: 10, marginHorizontal: 16, padding: 4, maxHeight: 48,
  },
  tabBtn: { paddingVertical: 10, paddingHorizontal: 16, alignItems: "center", borderRadius: 8, marginRight: 2 },
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
  // ── Service Card ──
  serviceCard: {
    backgroundColor: "#fff", borderRadius: 16, marginBottom: 12, overflow: "hidden",
    elevation: 2, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
  },
  serviceImg: { width: "100%", height: 150, resizeMode: "cover" },
  serviceImgPlaceholder: {
    width: "100%", height: 80, backgroundColor: "#E8F5EF",
    alignItems: "center", justifyContent: "center",
  },
  serviceBody: { padding: 14 },
  serviceTitle: { fontSize: 16, fontWeight: "700", color: "#135E4B", flex: 1 },
  serviceDesc: { fontSize: 12, color: "#9CA3AF", marginTop: 6, lineHeight: 18 },
  editBtn: { padding: 7, backgroundColor: "#EBF5FF", borderRadius: 8 },
  deleteBtn: { backgroundColor: "#FEE2E2", padding: 6, borderRadius: 8 },
  displayActionBtn: {
    backgroundColor: "#135E4B",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 4,
  },
  displayActionBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  categoryChip: { flexDirection: "row", alignItems: "center", backgroundColor: "#E8F5EF", alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginBottom: 8 },
  categoryChipText: { fontSize: 11, color: "#135E4B", fontWeight: "600", marginLeft: 3 },
  priceRow: { flexDirection: "row", alignItems: "baseline", marginTop: 8 },
  priceLabel: { fontSize: 13, color: "#4CB572", fontWeight: "600" },
  priceValue: { fontSize: 20, fontWeight: "800", color: "#135E4B", marginLeft: 2 },
  priceUnit: { fontSize: 12, color: "#9CA3AF" },
  infoRowSmall: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  infoTextSmall: { fontSize: 12, color: "#9CA3AF", marginLeft: 4, flex: 1 },
  availabilityRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#F3F4F6" },
  availBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  availBadgeOn: { backgroundColor: "#D1FAE5" },
  availBadgeOff: { backgroundColor: "#FEE2E2" },
  availDot: { width: 7, height: 7, borderRadius: 4, marginRight: 5 },
  availText: { fontSize: 12, fontWeight: "700" },
  // ── Booking Card ──
  bookingCard: {
    backgroundColor: "#fff", borderRadius: 16, marginBottom: 12, padding: 16,
    elevation: 2, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
  },
  bookingTopRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  bookingServiceName: { fontSize: 16, fontWeight: "700", color: "#135E4B" },
  bookingId: { fontSize: 11, color: "#9CA3AF", marginTop: 2 },
  statusBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, marginLeft: 8 },
  statusBadgeText: { fontSize: 11, fontWeight: "700", marginLeft: 4 },
  bookingDivider: { height: 1, backgroundColor: "#F3F4F6", marginVertical: 12 },
  bookingInfoSection: { gap: 8, marginBottom: 10 },
  bookingInfoRow: { flexDirection: "row", alignItems: "center" },
  bookingInfoIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#E8F5EF", alignItems: "center", justifyContent: "center", marginRight: 10 },
  bookingInfoLabel: { fontSize: 11, color: "#9CA3AF", fontWeight: "500" },
  bookingInfoValue: { fontSize: 14, color: "#1F2937", fontWeight: "600" },
  bookingScheduleBox: { backgroundColor: "#F8FBF9", borderRadius: 10, padding: 10, gap: 6, marginBottom: 8 },
  bookingScheduleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  bookingScheduleText: { fontSize: 13, color: "#374151", fontWeight: "500" },
  scheduleDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: "#D1D5DB" },
  bookingLocationText: { fontSize: 13, color: "#374151", marginLeft: 6, flex: 1 },
  notesBox: { flexDirection: "row", alignItems: "flex-start", backgroundColor: "#FEF9C3", padding: 8, borderRadius: 8, marginBottom: 6, gap: 6 },
  notesText: { fontSize: 12, color: "#78350F", flex: 1 },
  bookingActionRow: { flexDirection: "row", marginTop: 10 },
  actionBtn: { flexDirection: "row", padding: 10, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  actionBtnText: { fontWeight: "700", marginLeft: 6, fontSize: 14 },
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
  overlayBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)" },
  sidebar: {
    position: "absolute", left: 0, top: 0, bottom: 0, width: SIDEBAR_W,
    backgroundColor: "#135E4B",
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 24) + 8 : 54,
    shadowColor: "#000", shadowOffset: { width: 4, height: 0 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 15,
  },
  sidebarProfile: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(168,213,186,0.2)",
    marginBottom: 4,
  },
  avatarCircle: {
    width: 66, height: 66, borderRadius: 33, backgroundColor: "rgba(76,181,114,0.25)",
    justifyContent: "center", alignItems: "center", marginBottom: 10,
    borderWidth: 2, borderColor: "rgba(168,213,186,0.5)",
  },
  profileName: { fontSize: 16, fontWeight: "bold", color: "#fff", marginBottom: 2 },
  profileEmail: { fontSize: 12, color: "#A8D5BA" },
  sidebarItem: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 11, paddingHorizontal: 16,
    marginHorizontal: 8, borderRadius: 10, marginTop: 2,
  },
  sidebarLabel: { fontSize: 15, color: "#fff", marginLeft: 12, fontWeight: "500" },
  sidebarDivider: { height: 1, backgroundColor: "rgba(168,213,186,0.2)", marginVertical: 6, marginHorizontal: 16 },
  // Booking Filter Chips
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: "#E0ECEB", marginRight: 2,
  },
  filterChipActive: { backgroundColor: "#135E4B" },
  filterChipText: { fontSize: 12, fontWeight: "600", color: "#555" },
  filterChipTextActive: { color: "#fff" },
  // Earnings
  earnCard: {
    backgroundColor: "#fff", borderRadius: 16, padding: 18, alignItems: "center",
    elevation: 2, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 2 },
  },
  earnCardValue: { fontSize: 20, fontWeight: "bold", color: "#135E4B", marginTop: 8 },
  earnCardLabel: { fontSize: 12, color: "#666", marginTop: 4 },
  monthRow: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#fff",
    borderRadius: 12, padding: 14, marginBottom: 8,
    elevation: 1, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 3,
  },
  monthLabel: { fontSize: 14, fontWeight: "700", color: "#135E4B" },
  monthSub: { fontSize: 11, color: "#999", marginTop: 2 },
  monthEarnings: { fontSize: 15, fontWeight: "bold", color: "#10B981", marginRight: 10 },
  monthBar: { height: 6, backgroundColor: "#10B981", borderRadius: 3 },
  perServiceRow: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#fff",
    borderRadius: 12, padding: 14, marginBottom: 8,
    elevation: 1, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 3,
  },
  perServiceTitle: { fontSize: 14, fontWeight: "700", color: "#135E4B" },
  perServiceSub: { fontSize: 11, color: "#999", marginTop: 2 },
  perServiceEarnings: { fontSize: 15, fontWeight: "bold", color: "#3B82F6" },
  // Reviews
  ratingSummary: {
    backgroundColor: "#fff", borderRadius: 16, padding: 24, alignItems: "center",
    marginBottom: 20, elevation: 2, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 4,
  },
  ratingBig: { fontSize: 48, fontWeight: "bold", color: "#135E4B" },
  ratingCount: { fontSize: 14, color: "#666" },
  reviewCard: {
    backgroundColor: "#fff", borderRadius: 14, padding: 16, marginBottom: 10,
    elevation: 1, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 3,
  },
  reviewerName: { fontSize: 14, fontWeight: "700", color: "#135E4B" },
  reviewService: { fontSize: 12, color: "#4CB572", fontWeight: "500", marginBottom: 6 },
  reviewComment: { fontSize: 13, color: "#555", lineHeight: 19 },
  reviewDate: { fontSize: 11, color: "#999", marginTop: 8, textAlign: "right" },
});
