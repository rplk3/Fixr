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
  getAdminPayments, getAdminReviews, deleteAdminReview, getPendingServices, approveServiceUpdate, rejectServiceUpdate, getAdminUsers,
} from "../services/adminApi";
import { getAdminComplaints } from "../services/complaintApi";
import { setToken, setUser } from "../services/authApi";
import { getCategories, createCategory, updateCategory, deleteCategory } from "../services/categoryApi";
import { TextInput } from "react-native";

const { width } = Dimensions.get("window");
const SIDEBAR_W = width * 0.7;

const MENU = [
  { key: "dashboard", label: "Dashboard", icon: "grid-outline" },
  { key: "users", label: "Manage Users", icon: "people-outline" },
  { key: "services", label: "Services", icon: "construct-outline" },
  { key: "bookings", label: "Bookings", icon: "calendar-outline" },
  { key: "payments", label: "Payments", icon: "card-outline" },
  { key: "feedbacks", label: "Feedbacks", icon: "chatbubbles-outline" },
];

const SUBTITLES = {
  dashboard: "Overview",
  users: "User Administration",
  services: "Service Management",
  bookings: "Appointments",
  payments: "Financial Records",
  feedbacks: "Reviews & Support",
};

// ─── Dashboard Cards ───
const DashboardPage = ({ stats, loading, onRefresh, selectPage }) => {
  const cards = [
    { label: "Total Users", value: stats.totalUsers, icon: "people", color: "#3B82F6" },
    { label: "Providers", value: stats.totalProviders, icon: "briefcase", color: "#8B5CF6" },
    { label: "Services", value: stats.totalServices, icon: "construct", color: "#10B981" },
    { label: "Bookings", value: stats.totalBookings, icon: "calendar", color: "#EC4899" },
    { label: "Payments", value: stats.totalPayments || 0, icon: "card", color: "#14B8A6" },
    { label: "Complaints", value: stats.totalComplaints, icon: "warning", color: "#EF4444" },
  ];

  const quickActions = [
    { key: "users", label: "Manage Users", icon: "people-outline", color: "#3B82F6" },
    { key: "services", label: "Manage Services", icon: "construct-outline", color: "#10B981" },
    { key: "bookings", label: "Manage Bookings", icon: "calendar-outline", color: "#EC4899" },
    { key: "payments", label: "Manage Payments", icon: "card-outline", color: "#14B8A6" },
    { key: "feedbacks", label: "Feedbacks & Complaints", icon: "chatbubbles-outline", color: "#F59E0B" },
  ];

  return (
    <ScrollView contentContainerStyle={s.dashScroll} refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}>
      {/* Summary Cards Grid */}
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>System Metrics</Text>
      </View>
      <View style={s.cardsGrid}>
        {cards.map((c) => (
          <View key={c.label} style={[s.dashCard]}>
            <View style={s.dashCardTop}>
              <View style={[s.cardIcon, { backgroundColor: c.color + "1A" }]}>
                <Ionicons name={c.icon} size={20} color={c.color} />
              </View>
              <Text style={s.cardVal}>{c.value ?? 0}</Text>
            </View>
            <Text style={s.cardLabel}>{c.label}</Text>
          </View>
        ))}
      </View>

      {/* Quick Action Grid */}
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>Quick Actions</Text>
      </View>
      <View style={s.actionGrid}>
        {quickActions.map((a) => (
          <TouchableOpacity key={a.key} style={s.actionBtn} onPress={() => selectPage(a.key)} activeOpacity={0.7}>
            <View style={[s.actionIconWrap, { backgroundColor: a.color + "10" }]}>
              <Ionicons name={a.icon} size={24} color={a.color} />
            </View>
            <Text style={s.actionLabel}>{a.label}</Text>
            <Ionicons name="chevron-forward" size={16} color="#CBD5E1" style={s.actionArrow} />
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

// ─── Users Page ───
const UsersPage = ({ users, loading, onRefresh, navigation }) => {
  const [filterRole, setFilterRole] = React.useState("all");
  const [filterStatus, setFilterStatus] = React.useState("all");

  const stats = {
    total: users.length,
    customers: users.filter(u => u.roles?.includes("customer") && !u.roles?.includes("provider") && !u.roles?.includes("admin")).length,
    providers: users.filter(u => u.roles?.includes("provider")).length,
    admins: users.filter(u => u.roles?.includes("admin")).length,
    pendingProviders: users.filter(u => u.providerStatus === "pending").length,
    active: users.filter(u => u.isActive).length,
    suspended: users.filter(u => !u.isActive).length,
  };

  let filtered = users;
  if (filterRole !== "all") filtered = filtered.filter(u => u.roles?.includes(filterRole));
  if (filterStatus === "suspended") filtered = filtered.filter(u => !u.isActive);
  else if (filterStatus === "active") filtered = filtered.filter(u => u.isActive);
  else if (filterStatus === "pendingProvider") filtered = filtered.filter(u => u.providerStatus === "pending");

  const renderStatCard = (title, val, color) => (
    <View style={[s.statCard, { borderLeftColor: color }]}>
      <Text style={s.statVal}>{val}</Text>
      <Text style={s.statTitle}>{title}</Text>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <View style={s.statsContainer}>
        <Text style={[s.sectionTitle, { marginHorizontal: 16, marginBottom: 12 }]}>User Overview</Text>
        <FlatList
          data={[
            { title: "Total Users", val: stats.total, color: "#3B82F6" },
            { title: "Active", val: stats.active, color: "#10B981" },
            { title: "Suspended", val: stats.suspended, color: "#EF4444" },
            { title: "Customers", val: stats.customers, color: "#8B5CF6" },
            { title: "Providers", val: stats.providers, color: "#F59E0B" },
            { title: "Pending Prov.", val: stats.pendingProviders, color: "#EC4899" },
            { title: "Admins", val: stats.admins, color: "#6366F1" },
          ]}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          keyExtractor={item => item.title}
          renderItem={({ item }) => renderStatCard(item.title, item.val, item.color)}
        />
      </View>
      <View style={s.filters}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {["all", "customer", "provider", "admin"].map(role => (
            <TouchableOpacity key={role} style={[s.filterChip, filterRole === role && s.filterChipActive]} onPress={() => setFilterRole(role)}>
              <Text style={[s.filterText, filterRole === role && s.filterTextActive]}>{role.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
          <View style={s.filterDivider} />
          {["all", "active", "suspended", "pendingProvider"].map(status => (
            <TouchableOpacity key={status} style={[s.filterChip, filterStatus === status && s.filterChipActive]} onPress={() => setFilterStatus(status)}>
              <Text style={[s.filterText, filterStatus === status && s.filterTextActive]}>{status.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <ListPage data={filtered} loading={loading} onRefresh={onRefresh} emptyMsg="No users found"
        renderItem={({ item }) => (
          <TouchableOpacity style={s.userCard} onPress={() => navigation.navigate("AdminUserDetails", { userId: item._id })} activeOpacity={0.7}>
            <View style={s.userCardInner}>
              <View style={s.userAvatar}>
                <Text style={s.userAvatarText}>{(item.firstName?.charAt(0) || "U").toUpperCase()}</Text>
              </View>
              
              <View style={s.userInfo}>
                <Text style={s.userName}>{item.firstName} {item.lastName}</Text>
                <Text style={s.userEmail}>{item.email}</Text>
                {item.phone ? <Text style={s.userPhone}>{item.phone}</Text> : null}
                
                <View style={s.rolesRow}>
                  {item.roles?.map(r => (
                    <View key={r} style={s.roleBadge}><Text style={s.roleText}>{r.toUpperCase()}</Text></View>
                  ))}
                  {item.providerStatus && item.providerStatus !== "none" && (
                    <View style={[s.roleBadge, { backgroundColor: "#F59E0B20" }]}><Text style={[s.roleText, { color: "#D97706" }]}>PROV: {item.providerStatus.toUpperCase()}</Text></View>
                  )}
                </View>
              </View>

              <View style={s.userActions}>
                <View style={[s.badge, { backgroundColor: item.isActive ? "#10B98120" : "#EF444420", marginTop: 0 }]}>
                  <Text style={[s.badgeText, { color: item.isActive ? "#10B981" : "#EF4444" }]}>{item.isActive ? "ACTIVE" : "SUSP"}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#CBD5E1" style={{ marginTop: 16 }} />
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
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
  const [pendingServices, setPendingServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
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

  // Rejection Modal
  const [rejModalOpen, setRejModalOpen] = useState(false);
  const [rejSvcId, setRejSvcId] = useState(null);
  const [rejReason, setRejReason] = useState("");

  const load = useCallback(async (p) => {
    setLoading(true);
    try {
      if (p === "dashboard") setStats(await getAdminDashboard());
      else if (p === "users") setUsers(await getAdminUsers());
      else if (p === "services") {
        setServices(await getAdminServices());
        setPendingServices(await getPendingServices());
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

  const selectPage = (key) => { 
    setPage(key); 
    setSidebarOpen(false); 
  };

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

  const handleApproveService = async (id) => {
    try {
      await approveServiceUpdate(id);
      crossAlert("Success", "Service update approved");
      load("services");
    } catch (e) {
      crossAlert("Error", e.message);
    }
  };

  const submitRejection = async () => {
    if (!rejReason.trim()) return crossAlert("Error", "Please provide a reason");
    try {
      await rejectServiceUpdate(rejSvcId, rejReason.trim());
      setRejModalOpen(false);
      crossAlert("Success", "Service update rejected");
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
        return <DashboardPage stats={stats} loading={loading} onRefresh={() => load("dashboard")} selectPage={selectPage} />;
      case "users":
        return <UsersPage users={users} loading={loading} onRefresh={() => load("users")} navigation={navigation} />;
      case "services":
        return (
          <View style={{ flex: 1 }}>
            <View style={s.tabRow}>
              <TouchableOpacity onPress={() => setServiceTab("services")} style={[s.subTab, serviceTab === "services" && s.subTabActive]}>
                <Text style={[s.subTabText, serviceTab === "services" && s.subTabTextActive]}>All Services</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setServiceTab("pending")} style={[s.subTab, serviceTab === "pending" && s.subTabActive]}>
                <Text style={[s.subTabText, serviceTab === "pending" && s.subTabTextActive]}>Pending</Text>
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
            ) : serviceTab === "pending" ? (
              <ListPage data={pendingServices} loading={loading} onRefresh={() => load("services")} emptyMsg="No pending updates"
                renderItem={({ item }) => (
                  <View style={s.listItem}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.listTitle}>{item.pendingEdits?.title || item.title}</Text>
                      <Text style={s.listSub}>Original: {item.title}</Text>
                      {item.pendingEdits && (
                        <Text style={{ fontSize: 12, color: "#D97706", marginTop: 4 }}>
                          Proposed Changes: {Object.keys(item.pendingEdits).join(", ")}
                        </Text>
                      )}
                      <Text style={[s.listSub, { marginTop: 4 }]}>Provider ID: {item.provider?.firstName || item.provider}</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleApproveService(item._id)} style={[s.editBtn, { backgroundColor: "#D1FAE5" }]}>
                      <Ionicons name="checkmark-outline" size={20} color="#059669" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => { setRejSvcId(item._id); setRejReason(""); setRejModalOpen(true); }} style={s.delBtn}>
                      <Ionicons name="close-outline" size={20} color="#EF4444" />
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
        {page === "users" && (
          <TouchableOpacity onPress={() => navigation.navigate("AdminCreateUser")} style={{ padding: 8 }}>
            <Ionicons name="person-add" size={24} color="#fff" />
          </TouchableOpacity>
        )}
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
                {m.key === "users" && <Text style={s.sidebarHint}>User Administration</Text>}
                {m.key === "services" && <Text style={s.sidebarHint}>Service Management</Text>}
                {m.key === "bookings" && <Text style={s.sidebarHint}>Appointments</Text>}
                {m.key === "payments" && <Text style={s.sidebarHint}>Financial Records</Text>}
                {m.key === "feedbacks" && <Text style={s.sidebarHint}>Reviews & Support</Text>}
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

              <Text style={s.fieldLabel}>Price (Rs. per hour)</Text>
              <TextInput style={s.modalInput} placeholder="e.g. 1500" value={svcPrice} onChangeText={setSvcPrice} keyboardType="numeric" />

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

      {/* Rejection Modal */}
      <Modal visible={rejModalOpen} transparent animationType="fade" onRequestClose={() => setRejModalOpen(false)}>
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>Reject Update</Text>
            <Text style={s.fieldLabel}>Rejection Reason</Text>
            <TextInput 
              style={[s.modalInput, { minHeight: 70, textAlignVertical: "top" }]} 
              placeholder="Why is this update rejected?" 
              value={rejReason} 
              onChangeText={setRejReason} 
              multiline 
            />
            <View style={s.modalActions}>
              <TouchableOpacity onPress={() => setRejModalOpen(false)} style={[s.modalBtn, { backgroundColor: "#ccc" }]}>
                <Text style={s.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={submitRejection} style={[s.modalBtn, { backgroundColor: "#EF4444" }]}>
                <Text style={s.modalBtnText}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default AdminDashboardScreen;

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F1F5F0" },

  // Header
  header: { backgroundColor: "#135E4B", flexDirection: "row", alignItems: "center", paddingTop: 44, paddingBottom: 16, paddingHorizontal: 16 },
  menuBtn: { marginRight: 14 },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#fff" },
  headerSub: { fontSize: 12, color: "#A8D5BA", marginTop: 2 },
  logoutBtn: { marginLeft: "auto" },
  // Dashboard cards
  dashScroll: { padding: 16, paddingBottom: 40 },
  sectionHeader: { marginBottom: 12, marginTop: 10 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#111827" },
  cardsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 24 },
  dashCard: { 
    width: (width - 44) / 2, backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 12,
    elevation: 3, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
  },
  dashCardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  cardIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  cardVal: { fontSize: 24, fontWeight: "bold", color: "#111827", alignSelf: "center" },
  cardLabel: { fontSize: 13, color: "#6B7280", fontWeight: "600" },
  actionGrid: { marginBottom: 20 },
  actionIconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", marginRight: 16 },
  actionLabel: { flex: 1, fontSize: 16, fontWeight: "600", color: "#1F2937" },
  actionArrow: { marginLeft: 10 },
  // List items
  listItem: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 10, flexDirection: "row", alignItems: "center", elevation: 1, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } },
  listTitle: { fontSize: 15, fontWeight: "bold", color: "#135E4B" },
  listSub: { fontSize: 13, color: "#666", marginTop: 2 },
  delBtn: { padding: 8 },
  actionBtn: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#fff", padding: 16, borderRadius: 16, marginBottom: 10,
    elevation: 2, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
  },
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
  // Users Page Styles
  statsContainer: { paddingVertical: 16, backgroundColor: "#fff", borderBottomWidth: 1, borderColor: "#E5E7EB" },
  statCard: { backgroundColor: "#F9FAFB", padding: 14, borderRadius: 12, borderLeftWidth: 4, marginRight: 12, width: width * 0.35, elevation: 1, shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } },
  statVal: { fontSize: 22, fontWeight: "bold", color: "#1F2937" },
  statTitle: { fontSize: 12, color: "#6B7280", marginTop: 4, fontWeight: "600" },
  filters: { padding: 12, paddingHorizontal: 16, backgroundColor: "#F8FAFC", borderBottomWidth: 1, borderColor: "#E5E7EB" },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: "#fff", marginRight: 8, borderWidth: 1, borderColor: "#E2E8F0" },
  filterChipActive: { backgroundColor: "#135E4B", borderColor: "#135E4B" },
  filterText: { fontSize: 12, color: "#475569", fontWeight: "bold" },
  filterTextActive: { color: "#fff" },
  filterDivider: { width: 1, backgroundColor: "#CBD5E1", marginHorizontal: 8, height: 24, alignSelf: "center" },
  userCard: { backgroundColor: "#fff", borderRadius: 16, marginBottom: 12, elevation: 2, marginHorizontal: 16, marginTop: 10, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
  userCardInner: { flexDirection: "row", padding: 16 },
  userAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#135E4B15", alignItems: "center", justifyContent: "center", marginRight: 16 },
  userAvatarText: { fontSize: 20, fontWeight: "bold", color: "#135E4B" },
  userInfo: { flex: 1 },
  userActions: { alignItems: "flex-end", justifyContent: "space-between" },
  userName: { fontSize: 16, fontWeight: "bold", color: "#1F2937" },
  userEmail: { fontSize: 13, color: "#64748B", marginTop: 2 },
  userPhone: { fontSize: 13, color: "#94A3B8", marginTop: 2 },
  rolesRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 },
  roleBadge: { backgroundColor: "#135E4B15", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  roleText: { fontSize: 10, color: "#135E4B", fontWeight: "bold" },
});
