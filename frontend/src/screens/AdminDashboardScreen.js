import React, { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView,
  ActivityIndicator, FlatList, Modal, Dimensions, RefreshControl,
} from "react-native";
import { crossAlert } from "../utils/alert";
import { Ionicons } from "@expo/vector-icons";
import {
  getAdminDashboard, getAdminServices, deleteAdminService, updateAdminService,
  getAdminBookings, getAdminProviders, updateProviderStatus, deleteAdminProvider,
  getAdminPayments, getAdminReviews, deleteAdminReview,
} from "../services/adminApi";
import { getAdminComplaints } from "../services/complaintApi";
import { setToken, setUser } from "../services/authApi";
import { getCategories, createCategory, updateCategory, deleteCategory } from "../services/categoryApi";
import { TextInput } from "react-native";

const { width } = Dimensions.get("window");
const SIDEBAR_W = width * 0.7;

const MENU = [
  { key: "dashboard", label: "Dashboard", icon: "grid-outline" },
  { key: "services", label: "Services", icon: "construct-outline" },
  { key: "bookings", label: "Bookings", icon: "calendar-outline" },
  { key: "payments", label: "Payments", icon: "card-outline" },
  { key: "feedbacks", label: "Feedbacks", icon: "chatbubbles-outline" },
  { key: "media", label: "Media", icon: "images-outline" },
];

const SUBTITLES = {
  dashboard: "Overview",
  services: "Service Management",
  bookings: "Appointments",
  payments: "Financial Records",
  feedbacks: "Reviews & Support",
  media: "Images",
};

// ─── Dashboard Cards ───
const DashboardPage = ({ stats, loading, onRefresh, navigation }) => {
  const cards = [
    { label: "Total Users", value: stats.totalUsers, icon: "people", color: "#3B82F6" },
    { label: "Total Providers", value: stats.totalProviders, icon: "briefcase", color: "#8B5CF6" },
    { label: "Pending Providers", value: stats.pendingProviders, icon: "hourglass", color: "#F59E0B" },
    { label: "Total Services", value: stats.totalServices, icon: "construct", color: "#10B981" },
    { label: "Total Bookings", value: stats.totalBookings, icon: "calendar", color: "#EC4899" },
    { label: "Total Reviews", value: stats.totalReviews, icon: "star", color: "#6366F1" },
    { label: "Total Complaints", value: stats.totalComplaints, icon: "warning", color: "#EF4444" },
  ];
  if (loading) return <ActivityIndicator size="large" color="#135E4B" style={{ marginTop: 40 }} />;
  return (
    <ScrollView contentContainerStyle={s.cardsWrap} refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}>
      {cards.map((c) => (
        <View key={c.label} style={[s.card, { borderLeftColor: c.color }]}>  
          <View style={[s.cardIcon, { backgroundColor: c.color + "20" }]}>
            <Ionicons name={c.icon} size={22} color={c.color} />
          </View>
          <Text style={s.cardVal}>{c.value ?? 0}</Text>
          <Text style={s.cardLabel}>{c.label}</Text>
        </View>
      ))}

      <TouchableOpacity 
        style={[s.manageUsersBtn, { width: "100%", marginTop: 10 }]}
        onPress={() => navigation.navigate("AdminUsers")}
      >
        <Ionicons name="people-outline" size={24} color="#fff" style={{ marginRight: 10 }} />
        <Text style={s.manageUsersText}>Manage Users</Text>
      </TouchableOpacity>
        <Ionicons name="people-outline" size={24} color="#fff" style={{ marginRight: 10 }} />
        <Text style={s.manageUsersText}>Manage Users</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// ─── Generic List Page ───
const ListPage = ({ data, loading, onRefresh, renderItem, emptyMsg }) => {
  if (loading) return <ActivityIndicator size="large" color="#135E4B" style={{ marginTop: 40 }} />;
  if (!data || data.length === 0)
    return (
      <ScrollView contentContainerStyle={s.emptyWrap} refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}>
        <Ionicons name="folder-open-outline" size={50} color="#999" />
        <Text style={s.emptyText}>{emptyMsg || "No records found"}</Text>
      </ScrollView>
    );
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item._id || Math.random().toString()}
      renderItem={renderItem}
      contentContainerStyle={{ padding: 16 }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}
    />
  );
};

// ─── Main Screen ───
const AdminDashboardScreen = ({ navigation }) => {
  const [page, setPage] = useState("dashboard");
  const [serviceTab, setServiceTab] = useState("services"); // "services" or "categories"
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({});
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [providers, setProviders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [feedbackTab, setFeedbackTab] = useState("reviews"); // "reviews" or "complaints"
  
  // Booking Filters
  const [bookingStatusFilter, setBookingStatusFilter] = useState("all");
  const [bookingPaymentFilter, setBookingPaymentFilter] = useState("all");

  // Category Modal
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCatId, setEditingCatId] = useState(null);
  const [catName, setCatName] = useState("");

  // Service Edit Modal
  const [svcEditOpen, setSvcEditOpen] = useState(false);
  const [editSvc, setEditSvc] = useState(null);
  const [svcTitle, setSvcTitle] = useState("");
  const [svcDesc, setSvcDesc] = useState("");
  const [svcCategory, setSvcCategory] = useState("");
  const [svcPrice, setSvcPrice] = useState("");
  const [svcLocation, setSvcLocation] = useState("");

  const load = useCallback(async (p) => {
    setLoading(true);
    try {
      if (p === "dashboard") setStats(await getAdminDashboard());
      else if (p === "services") {
        setServices(await getAdminServices());
        setCategories(await getCategories());
      }
      else if (p === "bookings") setBookings(await getAdminBookings());
      else if (p === "providers") setProviders(await getAdminProviders());
      else if (p === "payments") setPayments(await getAdminPayments());
      else if (p === "feedbacks") {
        setReviews(await getAdminReviews());
        setComplaints(await getAdminComplaints());
      }
    } catch (e) {
      crossAlert("Error", e.message);
    }
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(page);
    }, [page, load])
  );

  const selectPage = (key) => { setPage(key); setSidebarOpen(false); };

  const handleLogout = () => {
    crossAlert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: () => { setToken(null); setUser(null); navigation.replace("Login"); } },
    ]);
  };

  const handleDeleteService = (id) => {
    crossAlert("Delete", "Delete this service?", [
      { text: "Cancel" },
      { text: "Delete", style: "destructive", onPress: async () => { await deleteAdminService(id); load("services"); } },
    ]);
  };

  const openEditService = (item) => {
    setEditSvc(item);
    setSvcTitle(item.title || "");
    setSvcDesc(item.description || "");
    setSvcCategory(item.category || "");
    setSvcPrice(String(item.price || ""));
    setSvcLocation(item.location || "");
    setSvcEditOpen(true);
  };

  const handleSaveService = async () => {
    if (!svcTitle.trim() || !svcPrice.trim()) return crossAlert("Error", "Title and price are required");
    try {
      await updateAdminService(editSvc._id, {
        title: svcTitle.trim(),
        description: svcDesc.trim(),
        category: svcCategory.trim(),
        price: Number(svcPrice),
        location: svcLocation.trim(),
      });
      setSvcEditOpen(false);
      crossAlert("Success", "Service updated!");
      load("services");
    } catch (e) {
      crossAlert("Error", e.message);
    }
  };

  const handleProviderAction = async (id, status) => {
    try { await updateProviderStatus(id, status); load("providers"); }
    catch (e) { crossAlert("Error", e.message); }
  };

  const handleDeleteReview = (id) => {
    crossAlert("Delete", "Delete this review?", [
      { text: "Cancel" },
      { text: "Delete", style: "destructive", onPress: async () => { await deleteAdminReview(id); load("feedbacks"); } },
    ]);
  };

  const handleDeleteProvider = (id) => {
    crossAlert("Delete Provider", "This will remove the provider profile and revoke their provider role. Continue?", [
      { text: "Cancel" },
      { text: "Delete", style: "destructive", onPress: async () => { try { await deleteAdminProvider(id); load("providers"); } catch (e) { crossAlert("Error", e.message); } } },
    ]);
  };

  const handleSaveCategory = async () => {
    if (!catName.trim()) return crossAlert("Error", "Category name is required");
    try {
      if (editingCatId) {
        await updateCategory(editingCatId, catName.trim());
      } else {
        await createCategory(catName.trim());
      }
      setCatModalOpen(false);
      const catData = await getCategories();
      setCategories(catData);
    } catch (e) {
      crossAlert("Error", e.message);
    }
  };

  const handleDeleteCategory = (id) => {
    crossAlert("Delete", "Delete this category?", [
      { text: "Cancel" },
      { text: "Delete", style: "destructive", onPress: async () => { try { await deleteCategory(id); const catData = await getCategories(); setCategories(catData); } catch (e) { crossAlert("Error", e.message); } } },
    ]);
  };

  // ─── Render Page Content ───
  const renderContent = () => {
    switch (page) {
      case "dashboard":
        return <DashboardPage stats={stats} loading={loading} onRefresh={() => load("dashboard")} navigation={navigation} />;
      case "services":
        return (
          <View style={{ flex: 1 }}>
            <View style={s.tabRow}>
              <TouchableOpacity onPress={() => setServiceTab("services")} style={[s.subTab, serviceTab === "services" && s.subTabActive]}>
                <Text style={[s.subTabText, serviceTab === "services" && s.subTabTextActive]}>All Services</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setServiceTab("categories")} style={[s.subTab, serviceTab === "categories" && s.subTabActive]}>
                <Text style={[s.subTabText, serviceTab === "categories" && s.subTabTextActive]}>Categories</Text>
              </TouchableOpacity>
            </View>

            {serviceTab === "services" ? (
              <ListPage data={services} loading={loading} onRefresh={() => load("services")} emptyMsg="No services yet"
                renderItem={({ item }) => (
                  <View style={s.listItem}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.listTitle}>{item.title}</Text>
                      <Text style={s.listSub}>{item.category} · LKR {item.price}</Text>
                      <Text style={s.listSub}>{item.location}</Text>
                    </View>
                    <TouchableOpacity onPress={() => openEditService(item)} style={s.editBtn}>
                      <Ionicons name="create-outline" size={20} color="#3B82F6" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteService(item._id)} style={s.delBtn}>
                      <Ionicons name="trash-outline" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                )}
              />
            ) : (
              <View style={{ flex: 1 }}>
                <TouchableOpacity 
                  style={s.addCatBtn} 
                  onPress={() => { setEditingCatId(null); setCatName(""); setCatModalOpen(true); }}
                >
                  <Ionicons name="add" size={20} color="#fff" />
                  <Text style={s.addCatBtnText}>Add Category</Text>
                </TouchableOpacity>
                <ListPage data={categories} loading={loading} onRefresh={() => load("services")} emptyMsg="No categories yet"
                  renderItem={({ item }) => (
                    <View style={s.listItem}>
                      <View style={{ flex: 1 }}>
                        <Text style={s.listTitle}>{item.name}</Text>
                      </View>
                      <TouchableOpacity onPress={() => { setEditingCatId(item._id); setCatName(item.name); setCatModalOpen(true); }} style={s.editBtn}>
                        <Ionicons name="pencil-outline" size={20} color="#3B82F6" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDeleteCategory(item._id)} style={s.delBtn}>
                        <Ionicons name="trash-outline" size={20} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  )}
                />
              </View>
            )}
          </View>
        );
      case "bookings": {
        const filteredBookings = bookings.filter(b => {
          const bStatus = b.status || "pending";
          const paymentStatus = b.paymentStatus || ((bStatus === "paid" || bStatus === "completed") ? "paid" : "pending");
          const statusMatch = bookingStatusFilter === "all" || bStatus === bookingStatusFilter;
          const paymentMatch = bookingPaymentFilter === "all" || paymentStatus === bookingPaymentFilter;
          return statusMatch && paymentMatch;
        });

        return (
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", gap: 10, marginBottom: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>Status Filter</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  {["all", "pending", "pending_payment", "paid", "completed", "cancelled"].map(status => (
                    <TouchableOpacity
                      key={status}
                      style={[s.subTab, bookingStatusFilter === status && s.subTabActive, { paddingVertical: 6, paddingHorizontal: 12 }]}
                      onPress={() => setBookingStatusFilter(status)}
                    >
                      <Text style={[s.subTabText, bookingStatusFilter === status && s.subTabTextActive, { fontSize: 13 }]}>
                        {status.replace("_", " ").toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>Payment Filter</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  {["all", "pending", "paid", "failed", "refunded"].map(pStatus => (
                    <TouchableOpacity
                      key={pStatus}
                      style={[s.subTab, bookingPaymentFilter === pStatus && s.subTabActive, { paddingVertical: 6, paddingHorizontal: 12 }]}
                      onPress={() => setBookingPaymentFilter(pStatus)}
                    >
                      <Text style={[s.subTabText, bookingPaymentFilter === pStatus && s.subTabTextActive, { fontSize: 13 }]}>
                        {pStatus.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <ListPage data={filteredBookings} loading={loading} onRefresh={() => load("bookings")} emptyMsg="No bookings found"
              renderItem={({ item }) => {
                const bStatus = item.status || "pending";
                const pStatus = item.paymentStatus || ((bStatus === "paid" || bStatus === "completed") ? "paid" : "pending");
                
                const getPColor = (ps) => {
                  if (ps === "paid") return s.badgeGreen;
                  if (ps === "failed") return s.badgeRed;
                  if (ps === "refunded") return { backgroundColor: "#8B5CF6" };
                  return s.badgeYellow;
                };
                
                return (
                  <TouchableOpacity 
                    style={[s.listItem, { paddingVertical: 16 }]}
                    onPress={() => navigation.navigate("AdminBookingDetails", { bookingId: item._id })}
                  >
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                        <Text style={[s.listTitle, { flex: 1, marginRight: 8 }]} numberOfLines={1}>
                          {item.service?.title || "Unknown Service"}
                        </Text>
                        <Text style={{ fontSize: 12, color: "#6B7280" }}>{item.date} {item.time}</Text>
                      </View>
                      
                      <View style={{ flexDirection: "row", marginBottom: 6 }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 12, color: "#6B7280" }}>Customer</Text>
                          <Text style={{ fontSize: 14, color: "#374151", fontWeight: "500" }}>
                            {item.customer?.firstName} {item.customer?.lastName}
                          </Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 12, color: "#6B7280" }}>Provider</Text>
                          <Text style={{ fontSize: 14, color: "#374151", fontWeight: "500" }}>
                            {item.provider?.firstName} {item.provider?.lastName}
                          </Text>
                        </View>
                      </View>

                      <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
                        <View style={[s.badge, bStatus === "completed" ? s.badgeGreen : bStatus === "cancelled" ? s.badgeRed : s.badgeYellow, { marginRight: 8, marginTop: 0 }]}>
                          <Text style={s.badgeText}>{bStatus.replace("_", " ").toUpperCase()}</Text>
                        </View>
                        <View style={[s.badge, getPColor(pStatus), { marginTop: 0 }]}>
                          <Text style={s.badgeText}>{pStatus.toUpperCase()} PAY</Text>
                        </View>
                      </View>
                    </View>
                    
                    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" style={{ alignSelf: "center", marginLeft: 10 }} />
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        );
      }
      case "providers":
        return (
          <ListPage data={providers} loading={loading} onRefresh={() => load("providers")} emptyMsg="No provider applications"
            renderItem={({ item }) => {
              const u = item.user || {};
              const status = u.providerStatus || "pending";
              return (
                <View style={s.listItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.listTitle}>{item.title}</Text>
                    <Text style={s.listSub}>{u.firstName} {u.lastName} · {u.email}</Text>
                    <Text style={s.listSub}>{item.category} · LKR {item.price}</Text>
                    <View style={[s.badge, status === "approved" ? s.badgeGreen : status === "rejected" ? s.badgeRed : s.badgeYellow]}>
                      <Text style={s.badgeText}>{status.toUpperCase()}</Text>
                    </View>
                  </View>
                  {status === "pending" && (
                    <View style={{ alignItems: "center" }}>
                      <TouchableOpacity style={[s.actionBtn, { backgroundColor: "#10B981" }]} onPress={() => handleProviderAction(item._id, "approved")}>
                        <Ionicons name="checkmark" size={18} color="#fff" />
                      </TouchableOpacity>
                      <TouchableOpacity style={[s.actionBtn, { backgroundColor: "#EF4444", marginTop: 6 }]} onPress={() => handleProviderAction(item._id, "rejected")}>
                        <Ionicons name="close" size={18} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  )}
                  <TouchableOpacity onPress={() => handleDeleteProvider(item._id)} style={s.delBtn}>
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              );
            }}
          />
        );
      case "payments":
        return (
          <ListPage data={payments} loading={loading} onRefresh={() => load("payments")} emptyMsg="No payment records"
            renderItem={({ item }) => {
              const cust = item.customer;
              const ps = item.status;
              const statusColor = ps === "paid" ? "#10B981" : ps === "failed" ? "#EF4444" : ps === "refunded" ? "#8B5CF6" : ps === "pending" ? "#F59E0B" : "#6B7280";
              return (
                <TouchableOpacity
                  style={s.listItem}
                  onPress={() => navigation.navigate("AdminPaymentDetails", { paymentId: item._id })}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={s.listTitle}>LKR {(item.amount || 0).toLocaleString()}</Text>
                    <Text style={s.listSub}>
                      {cust ? `${cust.firstName} ${cust.lastName}` : "Unknown"} · {item.paymentMethod || "card"}
                    </Text>
                    <Text style={s.listSub}>****{item.cardLastFour || "----"} · {new Date(item.createdAt).toLocaleDateString()}</Text>
                    <View style={[s.badge, { backgroundColor: statusColor + "20" }]}>
                      <Text style={[s.badgeText, { color: statusColor }]}>{(item.status || "N/A").toUpperCase()}</Text>
                    </View>
                  </View>
                  <View style={{ alignItems: "center" }}>
                    <Ionicons name="chevron-forward" size={20} color="#999" />
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        );
      case "feedbacks":
        return (
          <View style={{ flex: 1 }}>
            <View style={s.tabRow}>
              <TouchableOpacity onPress={() => setFeedbackTab("reviews")} style={[s.subTab, feedbackTab === "reviews" && s.subTabActive]}>
                <Text style={[s.subTabText, feedbackTab === "reviews" && s.subTabTextActive]}>Reviews</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setFeedbackTab("complaints")} style={[s.subTab, feedbackTab === "complaints" && s.subTabActive]}>
                <Text style={[s.subTabText, feedbackTab === "complaints" && s.subTabTextActive]}>Complaints</Text>
              </TouchableOpacity>
            </View>

            {feedbackTab === "reviews" ? (
              <ListPage data={reviews} loading={loading} onRefresh={() => load("feedbacks")} emptyMsg="No reviews yet"
                renderItem={({ item }) => (
                  <View style={s.listItem}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.listTitle}>Rating: {"⭐".repeat(item.rating || 0)}</Text>
                      <Text style={s.listSub}>{item.comment || "No comment"}</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleDeleteReview(item._id)} style={s.delBtn}>
                      <Ionicons name="trash-outline" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                )}
              />
            ) : (
              <ListPage data={complaints} loading={loading} onRefresh={() => load("feedbacks")} emptyMsg="No complaints yet"
                renderItem={({ item }) => {
                  const statusColor = item.status === "resolved" ? "#10B981" : "#F59E0B";
                  return (
                    <TouchableOpacity
                      style={s.listItem}
                      onPress={() => navigation.navigate("AdminComplaintDetails", { complaintId: item._id })}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={s.listTitle}>{item.title}</Text>
                        <Text style={s.listSub}>{item.user?.firstName} {item.user?.lastName} · {item.category}</Text>
                        <View style={[s.badge, { backgroundColor: statusColor + "20" }]}>
                          <Text style={[s.badgeText, { color: statusColor }]}>{(item.status || "N/A").toUpperCase()}</Text>
                        </View>
                      </View>
                      <View style={{ alignItems: "center" }}>
                        <Ionicons name="chevron-forward" size={20} color="#999" />
                      </View>
                    </TouchableOpacity>
                  );
                }}
              />
            )}
          </View>
        );
      case "media":
        return (
          <ScrollView contentContainerStyle={s.emptyWrap}>
            <Ionicons name="images-outline" size={50} color="#999" />
            <Text style={s.emptyText}>Media management coming soon</Text>
          </ScrollView>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => setSidebarOpen(true)} style={s.menuBtn}>
          <Ionicons name="menu" size={26} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>{MENU.find((m) => m.key === page)?.label}</Text>
          <Text style={s.headerSub}>{SUBTITLES[page]}</Text>
        </View>
      </View>

      {/* Content */}
      {renderContent()}

      {/* Sidebar Modal */}
      <Modal visible={sidebarOpen} transparent animationType="fade" onRequestClose={() => setSidebarOpen(false)}>
        <View style={s.overlay}>
          <TouchableOpacity style={s.overlayBg} activeOpacity={1} onPress={() => setSidebarOpen(false)} />
          <View style={s.sidebar}>
            <View style={s.sidebarHeader}>
              <Text style={s.sidebarLogo}>Fixr</Text>
              <Text style={s.sidebarRole}>Admin Panel</Text>
            </View>
            {MENU.map((m) => (
              <TouchableOpacity key={m.key} style={[s.sidebarItem, page === m.key && s.sidebarItemActive]} onPress={() => selectPage(m.key)}>
                <Ionicons name={m.icon} size={20} color={page === m.key ? "#fff" : "#A8D5BA"} />
                <Text style={[s.sidebarLabel, page === m.key && s.sidebarLabelActive]}>{m.label}</Text>
                {m.key === "services" && <Text style={s.sidebarHint}>Service Management</Text>}
                {m.key === "bookings" && <Text style={s.sidebarHint}>Appointments</Text>}
                {m.key === "payments" && <Text style={s.sidebarHint}>Financial Records</Text>}
                {m.key === "feedbacks" && <Text style={s.sidebarHint}>Reviews & Support</Text>}
                {m.key === "media" && <Text style={s.sidebarHint}>Images</Text>}
              </TouchableOpacity>
            ))}

            <View style={{ height: 1, backgroundColor: "rgba(255,255,255,0.15)", marginVertical: 16, marginHorizontal: 10 }} />

            <TouchableOpacity style={s.sidebarItem} onPress={() => { setSidebarOpen(false); setTimeout(handleLogout, 400); }}>
              <Ionicons name="log-out-outline" size={20} color="#FF6B6B" />
              <Text style={[s.sidebarLabel, { color: "#FF6B6B" }]}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Category Modal */}
      <Modal visible={catModalOpen} transparent animationType="fade" onRequestClose={() => setCatModalOpen(false)}>
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>{editingCatId ? "Edit Category" : "Add Category"}</Text>
            <TextInput
              style={s.modalInput}
              placeholder="Category Name"
              value={catName}
              onChangeText={setCatName}
            />
            <View style={s.modalActions}>
              <TouchableOpacity onPress={() => setCatModalOpen(false)} style={[s.modalBtn, { backgroundColor: "#ccc" }]}>
                <Text style={s.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSaveCategory} style={[s.modalBtn, { backgroundColor: "#135E4B" }]}>
                <Text style={s.modalBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Service Edit Modal */}
      <Modal visible={svcEditOpen} transparent animationType="fade" onRequestClose={() => setSvcEditOpen(false)}>
        <View style={s.modalOverlay}>
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}>
            <View style={s.modalBox}>
              <Text style={s.modalTitle}>Edit Service</Text>

              <Text style={s.fieldLabel}>Title</Text>
              <TextInput style={s.modalInput} placeholder="Service title" value={svcTitle} onChangeText={setSvcTitle} />

              <Text style={s.fieldLabel}>Description</Text>
              <TextInput style={[s.modalInput, { minHeight: 70, textAlignVertical: "top" }]} placeholder="Description" value={svcDesc} onChangeText={setSvcDesc} multiline />

              <Text style={s.fieldLabel}>Category</Text>
              <TextInput style={s.modalInput} placeholder="Category" value={svcCategory} onChangeText={setSvcCategory} />

              <Text style={s.fieldLabel}>Price (LKR)</Text>
              <TextInput style={s.modalInput} placeholder="0" value={svcPrice} onChangeText={setSvcPrice} keyboardType="numeric" />

              <Text style={s.fieldLabel}>Location</Text>
              <TextInput style={s.modalInput} placeholder="City or area" value={svcLocation} onChangeText={setSvcLocation} />

              <View style={s.modalActions}>
                <TouchableOpacity onPress={() => setSvcEditOpen(false)} style={[s.modalBtn, { backgroundColor: "#ccc" }]}>
                  <Text style={s.modalBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSaveService} style={[s.modalBtn, { backgroundColor: "#135E4B" }]}>
                  <Text style={s.modalBtnText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default AdminDashboardScreen;

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F1F5F0" },
  manageUsersBtn: {
    backgroundColor: "#135E4B",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  manageUsersText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  // Header
  header: { backgroundColor: "#135E4B", flexDirection: "row", alignItems: "center", paddingTop: 44, paddingBottom: 16, paddingHorizontal: 16 },
  menuBtn: { marginRight: 14 },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#fff" },
  headerSub: { fontSize: 12, color: "#A8D5BA", marginTop: 2 },
  logoutBtn: { marginLeft: "auto" },
  // Dashboard cards
  cardsWrap: { flexDirection: "row", flexWrap: "wrap", padding: 12 },
  card: { backgroundColor: "#fff", borderRadius: 14, padding: 16, margin: 6, width: (width - 48) / 2, borderLeftWidth: 4, elevation: 2, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  cardIcon: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center", marginBottom: 10 },
  cardVal: { fontSize: 26, fontWeight: "bold", color: "#135E4B" },
  cardLabel: { fontSize: 12, color: "#666", marginTop: 4 },
  // List items
  listItem: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 10, flexDirection: "row", alignItems: "center", elevation: 1, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } },
  listTitle: { fontSize: 15, fontWeight: "bold", color: "#135E4B" },
  listSub: { fontSize: 13, color: "#666", marginTop: 2 },
  delBtn: { padding: 8 },
  actionBtn: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  badge: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8, marginTop: 6 },
  badgeGreen: { backgroundColor: "#D1FAE5" },
  badgeYellow: { backgroundColor: "#FEF3C7" },
  badgeRed: { backgroundColor: "#FEE2E2" },
  badgeText: { fontSize: 11, fontWeight: "bold", color: "#333" },
  // Empty
  emptyWrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40 },
  emptyText: { fontSize: 15, color: "#999", marginTop: 12 },
  // Sidebar overlay
  overlay: { flex: 1, flexDirection: "row" },
  overlayBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  sidebar: { position: "absolute", left: 0, top: 0, bottom: 0, width: SIDEBAR_W, backgroundColor: "#135E4B", paddingTop: 50 },
  sidebarHeader: { paddingHorizontal: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.15)", marginBottom: 8 },
  sidebarLogo: { fontSize: 28, fontWeight: "bold", color: "#fff" },
  sidebarRole: { fontSize: 13, color: "#A8D5BA", marginTop: 4 },
  sidebarItem: { flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 20, flexWrap: "wrap" },
  sidebarItemActive: { backgroundColor: "rgba(255,255,255,0.15)", borderLeftWidth: 3, borderLeftColor: "#4CB572" },
  sidebarLabel: { fontSize: 15, color: "#A8D5BA", marginLeft: 14, fontWeight: "600" },
  sidebarLabelActive: { color: "#fff" },
  sidebarHint: { width: "100%", fontSize: 11, color: "rgba(168,213,186,0.6)", marginLeft: 34, marginTop: 2 },
  tabRow: { flexDirection: "row", backgroundColor: "#fff", paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: "#E0E0E0" },
  subTab: { paddingVertical: 12, marginRight: 20, borderBottomWidth: 2, borderBottomColor: "transparent" },
  subTabActive: { borderBottomColor: "#135E4B" },
  subTabText: { fontSize: 14, color: "#666", fontWeight: "600" },
  subTabTextActive: { color: "#135E4B" },
  addCatBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "#135E4B", alignSelf: "flex-end", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, margin: 16, marginBottom: 0 },
  addCatBtnText: { color: "#fff", fontWeight: "bold", marginLeft: 6 },
  editBtn: { padding: 8, marginRight: 4 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 20 },
  modalBox: { backgroundColor: "#fff", width: "100%", borderRadius: 12, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: "#135E4B", marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: "600", color: "#135E4B", marginBottom: 4 },
  modalInput: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 12 },
  modalActions: { flexDirection: "row", justifyContent: "flex-end" },
  modalBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, marginLeft: 10 },
  modalBtnText: { color: "#fff", fontWeight: "bold" },
});
