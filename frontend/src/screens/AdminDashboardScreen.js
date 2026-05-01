import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView,
  ActivityIndicator, FlatList, Alert, Modal, Dimensions, RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  getAdminDashboard, getAdminServices, deleteAdminService,
  getAdminBookings, getAdminProviders, updateProviderStatus, deleteAdminProvider,
  getAdminPayments, getAdminReviews, deleteAdminReview,
} from "../services/adminApi";

const { width } = Dimensions.get("window");
const SIDEBAR_W = width * 0.7;

const MENU = [
  { key: "dashboard", label: "Dashboard", icon: "grid-outline" },
  { key: "services", label: "Services", icon: "construct-outline" },
  { key: "bookings", label: "Bookings", icon: "calendar-outline" },
  { key: "providers", label: "Providers", icon: "people-outline" },
  { key: "payments", label: "Payments", icon: "card-outline" },
  { key: "feedbacks", label: "Feedbacks", icon: "chatbubbles-outline" },
  { key: "media", label: "Media", icon: "images-outline" },
];

const SUBTITLES = {
  dashboard: "Overview",
  services: "Category Management",
  bookings: "Appointments",
  providers: "Worker Profiles",
  payments: "Financial Records",
  feedbacks: "Reviews & Support",
  media: "Images",
};

// ─── Dashboard Cards ───
const DashboardPage = ({ stats, loading, onRefresh }) => {
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({});
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [providers, setProviders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [reviews, setReviews] = useState([]);

  const load = useCallback(async (p) => {
    setLoading(true);
    try {
      if (p === "dashboard") setStats(await getAdminDashboard());
      else if (p === "services") setServices(await getAdminServices());
      else if (p === "bookings") setBookings(await getAdminBookings());
      else if (p === "providers") setProviders(await getAdminProviders());
      else if (p === "payments") setPayments(await getAdminPayments());
      else if (p === "feedbacks") setReviews(await getAdminReviews());
    } catch (e) {
      Alert.alert("Error", e.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(page); }, [page]);

  const selectPage = (key) => { setPage(key); setSidebarOpen(false); };

  const handleDeleteService = (id) => {
    Alert.alert("Delete", "Delete this service?", [
      { text: "Cancel" },
      { text: "Delete", style: "destructive", onPress: async () => { await deleteAdminService(id); load("services"); } },
    ]);
  };

  const handleProviderAction = async (id, status) => {
    try { await updateProviderStatus(id, status); load("providers"); }
    catch (e) { Alert.alert("Error", e.message); }
  };

  const handleDeleteReview = (id) => {
    Alert.alert("Delete", "Delete this review?", [
      { text: "Cancel" },
      { text: "Delete", style: "destructive", onPress: async () => { await deleteAdminReview(id); load("feedbacks"); } },
    ]);
  };

  const handleDeleteProvider = (id) => {
    Alert.alert("Delete Provider", "This will remove the provider profile and revoke their provider role. Continue?", [
      { text: "Cancel" },
      { text: "Delete", style: "destructive", onPress: async () => { try { await deleteAdminProvider(id); load("providers"); } catch (e) { Alert.alert("Error", e.message); } } },
    ]);
  };

  // ─── Render Page Content ───
  const renderContent = () => {
    switch (page) {
      case "dashboard":
        return <DashboardPage stats={stats} loading={loading} onRefresh={() => load("dashboard")} />;
      case "services":
        return (
          <ListPage data={services} loading={loading} onRefresh={() => load("services")} emptyMsg="No services yet"
            renderItem={({ item }) => (
              <View style={s.listItem}>
                <View style={{ flex: 1 }}>
                  <Text style={s.listTitle}>{item.title}</Text>
                  <Text style={s.listSub}>{item.category} · LKR {item.price}</Text>
                  <Text style={s.listSub}>{item.location}</Text>
                </View>
                <TouchableOpacity onPress={() => handleDeleteService(item._id)} style={s.delBtn}>
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            )}
          />
        );
      case "bookings":
        return (
          <ListPage data={bookings} loading={loading} onRefresh={() => load("bookings")} emptyMsg="No bookings yet"
            renderItem={({ item }) => (
              <View style={s.listItem}>
                <Text style={s.listTitle}>Booking #{(item._id || "").slice(-6)}</Text>
                <Text style={s.listSub}>{item.status || "N/A"}</Text>
              </View>
            )}
          />
        );
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
            renderItem={({ item }) => (
              <View style={s.listItem}>
                <Text style={s.listTitle}>Payment #{(item._id || "").slice(-6)}</Text>
                <Text style={s.listSub}>LKR {item.amount || 0} · {item.status || "N/A"}</Text>
              </View>
            )}
          />
        );
      case "feedbacks":
        return (
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
        <View>
          <Text style={s.headerTitle}>{MENU.find((m) => m.key === page)?.label}</Text>
          <Text style={s.headerSub}>{SUBTITLES[page]}</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.replace("Login")} style={s.logoutBtn}>
          <Ionicons name="log-out-outline" size={22} color="#fff" />
        </TouchableOpacity>
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
                {m.key === "services" && <Text style={s.sidebarHint}>Category Management</Text>}
                {m.key === "bookings" && <Text style={s.sidebarHint}>Appointments</Text>}
                {m.key === "providers" && <Text style={s.sidebarHint}>Worker Profiles</Text>}
                {m.key === "payments" && <Text style={s.sidebarHint}>Financial Records</Text>}
                {m.key === "feedbacks" && <Text style={s.sidebarHint}>Reviews & Support</Text>}
                {m.key === "media" && <Text style={s.sidebarHint}>Images</Text>}
              </TouchableOpacity>
            ))}
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
});
