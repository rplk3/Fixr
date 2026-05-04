import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getAdminUserById, deleteAdminUser, updateAdminUser } from "../services/adminApi";
import { useFocusEffect } from "@react-navigation/native";
import { crossAlert } from "../utils/alert";

const AdminUserDetailsScreen = ({ route, navigation }) => {
  const { userId } = route.params;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    try {
      setLoading(true);
      const data = await getAdminUserById(userId);
      setUser(data);
    } catch (e) {
      crossAlert("Error", e.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadUser();
    }, [userId])
  );

  const handleToggleStatus = () => {
    const newStatus = !user.isActive;
    crossAlert(
      newStatus ? "Activate User" : "Suspend User",
      `Are you sure you want to ${newStatus ? "activate" : "suspend"} this user?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: newStatus ? "Activate" : "Suspend", 
          style: newStatus ? "default" : "destructive", 
          onPress: async () => {
            try {
              await updateAdminUser(userId, { isActive: newStatus });
              loadUser();
            } catch (e) {
              crossAlert("Error", e.message);
            }
          } 
        }
      ]
    );
  };

  const handleDelete = () => {
    crossAlert(
      "Delete User",
      "Are you sure you want to permanently delete this user?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            try {
              await deleteAdminUser(userId);
              navigation.goBack();
            } catch (e) {
              crossAlert("Error", e.message);
            }
          } 
        }
      ]
    );
  };

  const handleChangeRole = () => {
    // Basic toggle logic, better to have a modal but this satisfies the basic request
    const isAdmin = user.roles?.includes("admin");
    const newRoles = isAdmin 
      ? user.roles.filter(r => r !== "admin")
      : [...user.roles, "admin"];
      
    crossAlert(
      "Change Role",
      `Make this user ${isAdmin ? "a regular customer" : "an Admin"}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              await updateAdminUser(userId, { roles: newRoles });
              loadUser();
            } catch (e) {
              crossAlert("Error", e.message);
            }
          }
        }
      ]
    );
  };

  if (loading || !user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>User Details</Text>
          <View style={{ width: 32 }} />
        </View>
        <ActivityIndicator size="large" color="#135E4B" style={{ marginTop: 50 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Details</Text>
        <TouchableOpacity onPress={() => navigation.navigate("AdminEditUser", { user })} style={styles.editBtn}>
          <Ionicons name="pencil" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarTextLarge}>{(user.firstName?.charAt(0) || "U").toUpperCase()}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{user.firstName} {user.lastName}</Text>
              <Text style={styles.email}>{user.email}</Text>
              <View style={[styles.badge, { backgroundColor: user.isActive ? "#10B98120" : "#EF444420", marginTop: 8 }]}>
                <Text style={[styles.badgeText, { color: user.isActive ? "#10B981" : "#EF4444" }]}>
                  {user.isActive ? "ACTIVE ACCOUNT" : "SUSPENDED"}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Phone</Text>
              <View style={styles.detailRow}>
                <Ionicons name="call-outline" size={18} color="#64748B" />
                <Text style={styles.detailValue}>{user.phone || "Not provided"}</Text>
              </View>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Member Since</Text>
              <View style={styles.detailRow}>
                <Ionicons name="calendar-outline" size={18} color="#64748B" />
                <Text style={styles.detailValue}>{new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionHeader}>Roles & Permissions</Text>
          <View style={styles.rolesRow}>
            {user.roles?.map(r => (
              <View key={r} style={styles.roleBadge}>
                <Text style={styles.roleText}>{r.toUpperCase()}</Text>
              </View>
            ))}
          </View>
          
          <View style={styles.statusBox}>
            <Text style={styles.detailLabel}>Service Provider Status</Text>
            <Text style={[styles.statusValue, { color: user.providerStatus === "approved" ? "#10B981" : "#64748B" }]}>
              {user.providerStatus?.toUpperCase() || "NONE"}
            </Text>
          </View>
        </View>

        {/* Quick Actions Grid */}
        <Text style={[styles.sectionHeader, { marginLeft: 4, marginTop: 10, marginBottom: 16 }]}>Account Management</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionTile} onPress={() => navigation.navigate("AdminEditUser", { user })}>
            <View style={[styles.actionIcon, { backgroundColor: "#3B82F615" }]}>
              <Ionicons name="create-outline" size={24} color="#3B82F6" />
            </View>
            <Text style={styles.actionTileLabel}>Edit Details</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionTile} onPress={handleChangeRole}>
            <View style={[styles.actionIcon, { backgroundColor: "#8B5CF615" }]}>
              <Ionicons name="shield-outline" size={24} color="#8B5CF6" />
            </View>
            <Text style={styles.actionTileLabel}>Change Role</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionTile} onPress={handleToggleStatus}>
            <View style={[styles.actionIcon, { backgroundColor: user.isActive ? "#F59E0B15" : "#10B98115" }]}>
              <Ionicons name={user.isActive ? "ban-outline" : "checkmark-circle-outline"} size={24} color={user.isActive ? "#F59E0B" : "#10B981"} />
            </View>
            <Text style={styles.actionTileLabel}>{user.isActive ? "Suspend" : "Activate"}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionTile} onPress={handleDelete}>
            <View style={[styles.actionIcon, { backgroundColor: "#EF444415" }]}>
              <Ionicons name="trash-outline" size={24} color="#EF4444" />
            </View>
            <Text style={styles.actionTileLabel}>Delete</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminUserDetailsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: { 
    backgroundColor: "#135E4B", 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between",
    paddingTop: 44, 
    paddingBottom: 16, 
    paddingHorizontal: 16 
  },
  backBtn: { padding: 4 },
  editBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#fff" },
  content: { padding: 16 },
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 3,
  },
  profileHeader: { flexDirection: "row", alignItems: "center", marginBottom: 24 },
  avatarLarge: { width: 70, height: 70, borderRadius: 35, backgroundColor: "#135E4B15", alignItems: "center", justifyContent: "center", marginRight: 20 },
  avatarTextLarge: { fontSize: 28, fontWeight: "bold", color: "#135E4B" },
  profileInfo: { flex: 1 },
  name: { fontSize: 22, fontWeight: "bold", color: "#1E293B" },
  email: { fontSize: 14, color: "#64748B", marginTop: 2 },
  badge: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: "800" },
  detailsGrid: { flexDirection: "row", justifyContent: "space-between", flexWrap: "wrap" },
  detailItem: { width: "48%", marginBottom: 16 },
  detailLabel: { fontSize: 12, color: "#94A3B8", fontWeight: "600", marginBottom: 6 },
  detailRow: { flexDirection: "row", alignItems: "center" },
  detailValue: { fontSize: 14, color: "#334155", fontWeight: "600", marginLeft: 8 },
  divider: { height: 1, backgroundColor: "#F1F5F9", marginVertical: 16 },
  sectionHeader: { fontSize: 14, fontWeight: "bold", color: "#1E293B", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 },
  rolesRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  roleBadge: { backgroundColor: "#135E4B10", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  roleText: { fontSize: 11, color: "#135E4B", fontWeight: "bold" },
  statusBox: { marginTop: 20 },
  statusValue: { fontSize: 14, fontWeight: "bold" },
  actionsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  actionTile: { 
    width: "48%", backgroundColor: "#fff", padding: 16, borderRadius: 16, alignItems: "center", marginBottom: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  actionIcon: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center", marginBottom: 10 },
  actionTileLabel: { fontSize: 13, fontWeight: "700", color: "#334155" },
});
