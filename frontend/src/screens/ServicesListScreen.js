import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, FlatList, SafeAreaView, TextInput,
  TouchableOpacity, ActivityIndicator, Alert, Modal, Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import ServiceCard from "../components/ServiceCard";
import { getAllServices } from "../services/serviceApi";
import { getUser, setToken, setUser } from "../services/authApi";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const SIDEBAR_W = width * 0.72;

const ServicesListScreen = () => {
  const navigation = useNavigation();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [providerStatus, setProviderStatus] = useState("none");
  const [hasProviderRole, setHasProviderRole] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setLocalUser] = useState(null);

  useEffect(() => {
    const u = getUser();
    if (u) {
      setLocalUser(u);
      setProviderStatus(u.providerStatus || "none");
      setHasProviderRole(u.roles?.includes("provider"));
    }
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAllServices();
      setServices(data);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyProvider = () => {
    navigation.navigate("Onboarding");
  };

  const handleSwitchProvider = () => {
    setSidebarOpen(false);
    Alert.alert(
      "Switch Mode",
      "Are you sure you want to switch to Provider Mode?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Yes, Switch", onPress: () => navigation.replace("ProviderDashboard") },
      ]
    );
  };

  const handleSignOut = () => {
    setSidebarOpen(false);
    Alert.alert(
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
  };

  const handleMyProfile = () => {
    setSidebarOpen(false);
    Alert.alert("My Profile", `Name: ${user?.firstName || ""} ${user?.lastName || ""}\nEmail: ${user?.email || ""}\nRoles: ${(user?.roles || []).join(", ")}\nProvider Status: ${user?.providerStatus || "none"}`, [{ text: "OK" }]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with hamburger */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setSidebarOpen(true)} style={styles.menuBtn}>
          <Ionicons name="menu" size={28} color="#135E4B" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.greeting}>Find the best services</Text>
          <Text style={styles.subText}>Fixr helps you book trusted workers</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search services..."
          placeholderTextColor="#6b7280"
          style={styles.searchInput}
        />
      </View>

      {providerStatus === "none" && !hasProviderRole && (
        <TouchableOpacity style={styles.providerButton} onPress={handleApplyProvider}>
          <Text style={styles.providerButtonText}>🚀 Become a Service Provider</Text>
        </TouchableOpacity>
      )}

      {providerStatus === "pending" && (
        <View style={styles.pendingBanner}>
          <Text style={styles.pendingText}>⏳ Provider application pending approval</Text>
        </View>
      )}

      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Popular Services</Text>
        <TouchableOpacity onPress={fetchServices}>
          <Text style={styles.viewAll}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#4CB572" style={{ marginTop: 30 }} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <FlatList
          data={services}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <ServiceCard
              service={item}
              onPress={() => navigation.navigate("Details", { service: item })}
            />
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No services available</Text>
          }
        />
      )}

      {/* Sidebar Modal */}
      <Modal visible={sidebarOpen} transparent animationType="fade" onRequestClose={() => setSidebarOpen(false)}>
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.overlayBg} activeOpacity={1} onPress={() => setSidebarOpen(false)} />
          <View style={styles.sidebar}>
            {/* Profile Section */}
            <View style={styles.sidebarProfile}>
              <View style={styles.avatarCircle}>
                <Ionicons name="person" size={36} color="#fff" />
              </View>
              <Text style={styles.profileName}>{user?.firstName || "User"} {user?.lastName || ""}</Text>
              <Text style={styles.profileEmail}>{user?.email || ""}</Text>
            </View>

            {/* Menu Items */}
            <TouchableOpacity style={styles.sidebarItem} onPress={handleMyProfile}>
              <Ionicons name="person-circle-outline" size={22} color="#A8D5BA" />
              <Text style={styles.sidebarLabel}>My Profile</Text>
            </TouchableOpacity>

            {hasProviderRole && (
              <TouchableOpacity style={styles.sidebarItem} onPress={handleSwitchProvider}>
                <Ionicons name="swap-horizontal-outline" size={22} color="#A8D5BA" />
                <Text style={styles.sidebarLabel}>Provider Mode</Text>
              </TouchableOpacity>
            )}

            {providerStatus === "none" && !hasProviderRole && (
              <TouchableOpacity style={styles.sidebarItem} onPress={() => { setSidebarOpen(false); handleApplyProvider(); }}>
                <Ionicons name="rocket-outline" size={22} color="#A8D5BA" />
                <Text style={styles.sidebarLabel}>Become a Provider</Text>
              </TouchableOpacity>
            )}

            <View style={styles.sidebarDivider} />

            <TouchableOpacity style={styles.sidebarItem} onPress={handleSignOut}>
              <Ionicons name="log-out-outline" size={22} color="#FF6B6B" />
              <Text style={[styles.sidebarLabel, { color: "#FF6B6B" }]}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ServicesListScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#CCDCDB", paddingHorizontal: 16 },
  header: { marginTop: 20, marginBottom: 20, flexDirection: "row", alignItems: "center" },
  menuBtn: { marginRight: 12, padding: 4 },
  greeting: { fontSize: 24, fontWeight: "bold", color: "#135E4B" },
  subText: { fontSize: 14, color: "#4CB572", marginTop: 4 },
  headerTextContainer: { flex: 1 },
  searchContainer: { marginBottom: 12 },
  searchInput: {
    backgroundColor: "#FFFFFF", borderRadius: 12, paddingHorizontal: 15,
    paddingVertical: 12, fontSize: 15, color: "#135E4B",
  },
  providerButton: {
    backgroundColor: "#135E4B", paddingVertical: 14, borderRadius: 12,
    alignItems: "center", marginBottom: 12,
  },
  providerButtonText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
  pendingBanner: {
    backgroundColor: "#FFF3CD", paddingVertical: 10, paddingHorizontal: 14,
    borderRadius: 10, marginBottom: 12,
  },
  pendingText: { color: "#856404", fontSize: 13, textAlign: "center", fontWeight: "600" },
  sectionRow: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 15,
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#135E4B" },
  viewAll: { fontSize: 14, fontWeight: "600", color: "#4CB572" },
  listContent: { paddingBottom: 20 },
  errorText: { color: "red", fontSize: 14, marginTop: 20, textAlign: "center" },
  emptyText: { color: "#135E4B", fontSize: 15, textAlign: "center", marginTop: 30 },
  // Sidebar
  overlay: { flex: 1, flexDirection: "row" },
  overlayBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  sidebar: {
    position: "absolute", left: 0, top: 0, bottom: 0, width: SIDEBAR_W,
    backgroundColor: "#135E4B", paddingTop: 50,
  },
  sidebarProfile: {
    alignItems: "center", paddingVertical: 24, borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.15)", marginBottom: 10,
  },
  avatarCircle: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center", justifyContent: "center", marginBottom: 10,
  },
  profileName: { fontSize: 18, fontWeight: "bold", color: "#fff" },
  profileEmail: { fontSize: 13, color: "#A8D5BA", marginTop: 4 },
  sidebarItem: {
    flexDirection: "row", alignItems: "center", paddingVertical: 15, paddingHorizontal: 24,
  },
  sidebarLabel: { fontSize: 16, color: "#A8D5BA", marginLeft: 14, fontWeight: "600" },
  sidebarDivider: {
    height: 1, backgroundColor: "rgba(255,255,255,0.15)", marginVertical: 10, marginHorizontal: 20,
  },
});