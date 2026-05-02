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
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.name}>{user.firstName} {user.lastName}</Text>
              <Text style={styles.email}>{user.email}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: user.isActive ? "#10B98120" : "#EF444420" }]}>
              <Text style={[styles.badgeText, { color: user.isActive ? "#10B981" : "#EF4444" }]}>
                {user.isActive ? "ACTIVE" : "SUSPENDED"}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={20} color="#6b7280" />
            <Text style={styles.infoText}>{user.phone || "No phone number"}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color="#6b7280" />
            <Text style={styles.infoText}>Joined: {new Date(user.createdAt).toLocaleDateString()}</Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Roles & Status</Text>
          <View style={styles.rolesRow}>
            {user.roles?.map(r => (
              <View key={r} style={styles.roleBadge}>
                <Text style={styles.roleText}>{r}</Text>
              </View>
            ))}
          </View>
          
          <View style={{ marginTop: 12 }}>
            <Text style={styles.subLabel}>Provider Status</Text>
            <Text style={styles.subValue}>{user.providerStatus?.toUpperCase()}</Text>
          </View>

        </View>

        <View style={styles.actionsBox}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate("AdminEditUser", { user })}>
            <Ionicons name="create-outline" size={22} color="#3B82F6" />
            <Text style={[styles.actionText, { color: "#3B82F6" }]}>Edit User</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={handleChangeRole}>
            <Ionicons name="shield-outline" size={22} color="#8B5CF6" />
            <Text style={[styles.actionText, { color: "#8B5CF6" }]}>Change Role</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={handleToggleStatus}>
            <Ionicons name={user.isActive ? "ban-outline" : "checkmark-circle-outline"} size={22} color={user.isActive ? "#F59E0B" : "#10B981"} />
            <Text style={[styles.actionText, { color: user.isActive ? "#F59E0B" : "#10B981" }]}>
              {user.isActive ? "Suspend User" : "Activate User"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionBtn, { borderBottomWidth: 0 }]} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={22} color="#EF4444" />
            <Text style={[styles.actionText, { color: "#EF4444" }]}>Delete User</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminUserDetailsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F1F5F0" },
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
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#fff" },
  content: { padding: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  name: { fontSize: 22, fontWeight: "bold", color: "#1f2937" },
  email: { fontSize: 15, color: "#6b7280", marginTop: 4 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 12, fontWeight: "bold" },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  infoText: { fontSize: 15, color: "#4b5563", marginLeft: 12 },
  divider: { height: 1, backgroundColor: "#e5e7eb", marginVertical: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#1f2937", marginBottom: 12 },
  rolesRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  roleBadge: { backgroundColor: "#135E4B20", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  roleText: { fontSize: 13, color: "#135E4B", fontWeight: "600", textTransform: "capitalize" },
  subLabel: { fontSize: 13, color: "#6b7280", marginBottom: 4 },
  subValue: { fontSize: 15, color: "#1f2937", fontWeight: "600" },
  actionsBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  actionBtn: { flexDirection: "row", alignItems: "center", paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
  actionText: { fontSize: 16, fontWeight: "600", marginLeft: 12 },
});
