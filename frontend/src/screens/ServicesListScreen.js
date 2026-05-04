import React, { useEffect, useState, useCallback } from "react";
import {
  View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity,
  ActivityIndicator, Modal, Dimensions, Image, FlatList, ScrollView,
  StatusBar, Platform,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { crossAlert } from "../utils/alert";
import { getAllServices } from "../services/serviceApi";
import { getCategories } from "../services/categoryApi";
import { getUser, setToken, setUser } from "../services/authApi";
import { IMAGE_BASE_URL } from "../config/api";
import CategoryChip from "../components/CategoryChip";
import FeaturedServiceCard from "../components/FeaturedServiceCard";

const { width } = Dimensions.get("window");
const SIDEBAR_W = width * 0.72;

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

// ─── Main Screen ────────────────────────────────────────────────────────────
const ServicesListScreen = () => {
  const navigation = useNavigation();

  const [services, setServices]           = useState([]);
  const [categories, setCategories]       = useState([]);
  const [loading, setLoading]             = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchQuery, setSearchQuery]     = useState("");
  const [providerStatus, setProviderStatus] = useState("none");
  const [hasProviderRole, setHasProviderRole] = useState(false);
  const [sidebarOpen, setSidebarOpen]     = useState(false);
  const [user, setLocalUser]              = useState(null);

  // ── Data Load ──
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [svcData, catData] = await Promise.all([
        getAllServices(),
        getCategories(),
      ]);
      setServices(svcData);
      setCategories([{ _id: "all", name: "All" }, ...catData]);
    } catch (err) {
      crossAlert("Error", err.message || "Failed to load services");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const u = getUser();
    if (u) {
      setLocalUser(u);
      setProviderStatus(u.providerStatus || "none");
      setHasProviderRole(u.roles?.includes("provider"));
    }
    loadData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const u = getUser();
      if (u) {
        setLocalUser(u);
        setProviderStatus(u.providerStatus || "none");
        setHasProviderRole(u.roles?.includes("provider"));
      }
    }, [])
  );

  // ── Filtered Services ──
  const displayedServices = services.filter((s) => {
    const matchCat =
      !activeCategory || activeCategory === "all"
        ? true
        : s.category?.toLowerCase() === activeCategory.toLowerCase();
    const matchSearch = searchQuery.trim()
      ? s.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.category?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchCat && matchSearch;
  });

  // ── Sidebar Handlers ──
  const handleApplyProvider = () => navigation.navigate("Onboarding");

  const handleSwitchProvider = () => {
    setSidebarOpen(false);
    setTimeout(() =>
      crossAlert("Switch Mode", "Switch to Provider Mode?", [
        { text: "Cancel", style: "cancel" },
        { text: "Yes, Switch", onPress: () => navigation.replace("ProviderDashboard") },
      ]), 400);
  };

  const handleSignOut = () => {
    setSidebarOpen(false);
    setTimeout(() =>
      crossAlert("Sign Out", "Are you sure you want to sign out?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out", style: "destructive",
          onPress: () => { setToken(null); setUser(null); navigation.replace("Login"); },
        },
      ]), 400);
  };

  const handleMyProfile = () => {
    setSidebarOpen(false);
    setTimeout(() => navigation.navigate("MyProfile"), 400);
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 24) + 8 : 14 }]}>
        <TouchableOpacity onPress={() => setSidebarOpen(true)} style={styles.iconBtn}>
          <Ionicons name="menu-outline" size={26} color="#1F6F5F" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.greeting}>{getGreeting()},</Text>
          <Text style={styles.userName} numberOfLines={1}>
            {user?.firstName ? `${user.firstName} ${user.lastName || ""}` : "Welcome"}
          </Text>
        </View>

        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="notifications-outline" size={24} color="#1F6F5F" />
        </TouchableOpacity>
      </View>

      {/* ── Scrollable Body ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* ── Search Bar ── */}
        <View style={styles.searchWrapper}>
          <Ionicons name="search-outline" size={18} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            placeholder="Find any services..."
            placeholderTextColor="#9CA3AF"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
        </View>

        {/* ── Promo Banner ── */}
        {providerStatus === "none" && !hasProviderRole && (
          <View style={styles.banner}>
            {/* Decorative circles */}
            <View style={styles.bannerCircle1} />
            <View style={styles.bannerCircle2} />

            {/* Left Text Content */}
            <View style={styles.bannerLeft}>
              <Text style={styles.bannerTitle}>Become a{"\n"}service provider!</Text>
              <Text style={styles.bannerSub}>Earn money using your skills</Text>
              <TouchableOpacity style={styles.bannerBtn} onPress={handleApplyProvider}>
                <Text style={styles.bannerBtnText}>Apply Now</Text>
                <Ionicons name="arrow-forward" size={14} color="#1F6F5F" />
              </TouchableOpacity>
            </View>

            {/* Right Human Image */}
            <Image
              source={require("../assets/banner_worker.png")}
              style={styles.bannerImage}
              resizeMode="contain"
            />
          </View>
        )}

        {/* Pending Banner */}
        {providerStatus === "pending" && (
          <View style={styles.pendingBanner}>
            <Ionicons name="time-outline" size={18} color="#92400E" />
            <Text style={styles.pendingText}>
              Your provider application is under review
            </Text>
          </View>
        )}

        {/* ── Categories ── */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Browse by Category</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {categories.length > 0 && (
          <FlatList
            data={categories}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.categoryList}
            renderItem={({ item }) => (
              <CategoryChip
                label={item.name}
                active={
                  item._id === "all"
                    ? !activeCategory || activeCategory === "all"
                    : activeCategory === item.name
                }
                onPress={() =>
                  setActiveCategory(
                    item._id === "all" ? "all" : item.name
                  )
                }
              />
            )}
          />
        )}

        {/* ── Top Rated Section ── */}
        <View style={[styles.sectionRow, { marginTop: 24 }]}>
          <Text style={styles.sectionTitle}>Top Rated</Text>
          <TouchableOpacity onPress={loadData}>
            <Text style={styles.viewAll}>Refresh</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#2FA084"
            style={{ marginTop: 24, marginBottom: 40 }}
          />
        ) : displayedServices.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="search-outline" size={44} color="#D1FAE5" />
            <Text style={styles.emptyText}>No services found</Text>
          </View>
        ) : (
          <FlatList
            data={displayedServices}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.verticalList}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <FeaturedServiceCard
                service={item}
                onPress={() => navigation.navigate("Details", { service: item })}
              />
            )}
          />
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* ══════════════════════════════════════════════════════════════
          SIDEBAR MODAL
      ══════════════════════════════════════════════════════════════ */}
      <Modal
        visible={sidebarOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setSidebarOpen(false)}
      >
        <View style={styles.overlay}>
          <TouchableOpacity
            style={styles.overlayBg}
            activeOpacity={1}
            onPress={() => setSidebarOpen(false)}
          />
          <View style={styles.sidebar}>
            {/* Profile */}
            <View style={styles.sidebarProfile}>
              <View style={styles.avatarCircle}>
                {user?.profileImage && (user.profileImage.startsWith("http") || user.profileImage.startsWith("/uploads")) ? (
                  <Image
                    source={{
                      uri: user.profileImage.startsWith("/uploads")
                        ? `${IMAGE_BASE_URL}${user.profileImage}`
                        : user.profileImage,
                    }}
                    style={{ width: 64, height: 64, borderRadius: 32 }}
                  />
                ) : (
                  <Ionicons name="person" size={34} color="#fff" />
                )}
              </View>
              <Text style={styles.profileName}>
                {user?.firstName || "User"} {user?.lastName || ""}
              </Text>
              <Text style={styles.profileEmail}>{user?.email || ""}</Text>
            </View>

            {/* Menu Items */}
            <SidebarItem icon="person-circle-outline" label="My Profile"    onPress={handleMyProfile} />
            <SidebarItem icon="calendar-outline"      label="My Bookings"   onPress={() => { setSidebarOpen(false); navigation.navigate("MyBookings"); }} />
            <SidebarItem icon="warning-outline"       label="Complaints"    onPress={() => { setSidebarOpen(false); navigation.navigate("Complaints"); }} />

            {hasProviderRole && (
              <SidebarItem icon="swap-horizontal-outline" label="Provider Mode" onPress={handleSwitchProvider} />
            )}

            {providerStatus === "none" && !hasProviderRole && (
              <SidebarItem icon="rocket-outline" label="Become a Provider" onPress={() => { setSidebarOpen(false); handleApplyProvider(); }} />
            )}

            <View style={styles.sidebarDivider} />

            <SidebarItem icon="log-out-outline" label="Sign Out" onPress={handleSignOut} danger />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// ─── Sidebar Item ────────────────────────────────────────────────────────────
const SidebarItem = ({ icon, label, onPress, danger }) => (
  <TouchableOpacity style={styles.sidebarItem} onPress={onPress}>
    <Ionicons name={icon} size={22} color={danger ? "#FF6B6B" : "#A8D5BA"} />
    <Text style={[styles.sidebarLabel, danger && { color: "#FF6B6B" }]}>{label}</Text>
  </TouchableOpacity>
);

export default ServicesListScreen;

// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },

  // ── Header ──
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 8,
    backgroundColor: "#fff",
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#F0FAF5",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    paddingHorizontal: 12,
  },
  greeting: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  userName: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
  },

  // ── Scroll ──
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },

  // ── Search ──
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#111827",
    paddingVertical: 0,
  },

  // ── Promo Banner ──
  banner: {
    backgroundColor: "#1F6F5F",
    borderRadius: 22,
    height: 148,
    flexDirection: "row",
    overflow: "hidden",
    marginBottom: 26,
    position: "relative",
  },
  bannerCircle1: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(111,207,151,0.15)",
    top: -40,
    right: 60,
  },
  bannerCircle2: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(47,160,132,0.2)",
    bottom: -20,
    right: 120,
  },
  bannerLeft: {
    flex: 1,
    paddingLeft: 22,
    paddingTop: 22,
    paddingRight: 8,
    zIndex: 2,
  },
  bannerTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#fff",
    lineHeight: 23,
    marginBottom: 4,
  },
  bannerSub: {
    fontSize: 12,
    color: "#A8D5BA",
    marginBottom: 14,
  },
  bannerBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 5,
  },
  bannerBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1F6F5F",
    marginRight: 4,
  },
  bannerImage: {
    width: 120,
    height: 148,
    alignSelf: "flex-end",
    zIndex: 2,
  },

  // ── Pending Banner ──
  pendingBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 20,
    gap: 10,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  pendingText: {
    fontSize: 13,
    color: "#92400E",
    fontWeight: "600",
    flex: 1,
  },

  // ── Section Row ──
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  viewAll: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2FA084",
  },

  // ── Categories ──
  categoryList: {
    paddingRight: 8,
    paddingBottom: 4,
  },

  // ── Vertical List ──
  verticalList: {
    paddingBottom: 24,
  },

  // ── Empty ──
  emptyBox: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 15,
    color: "#9CA3AF",
    marginTop: 12,
    fontWeight: "500",
  },

  // ══ Sidebar ══
  overlay: {
    flex: 1,
    flexDirection: "row",
  },
  overlayBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sidebar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: SIDEBAR_W,
    backgroundColor: "#1F6F5F",
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 24) + 8 : 54,
  },
  sidebarProfile: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.12)",
    marginBottom: 4,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  profileName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
  },
  profileEmail: {
    fontSize: 12,
    color: "rgba(168,213,186,0.9)",
    marginTop: 3,
  },
  sidebarItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 8,
    borderRadius: 10,
    marginTop: 2,
  },
  sidebarLabel: {
    fontSize: 15,
    color: "#fff",
    marginLeft: 14,
    fontWeight: "500",
  },
  sidebarDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
    marginVertical: 6,
    marginHorizontal: 20,
  },
});