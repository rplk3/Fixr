import React, { useState, useCallback } from "react";
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList,
  ActivityIndicator, RefreshControl, Dimensions, ScrollView
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getAdminUsers } from "../services/adminApi";
import { useFocusEffect } from "@react-navigation/native";

const { width } = Dimensions.get("window");

const AdminUsersScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getAdminUsers();
      setUsers(data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadUsers();
    }, [])
  );

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
  if (filterRole !== "all") {
    filtered = filtered.filter(u => u.roles?.includes(filterRole));
  }
  if (filterStatus === "suspended") {
    filtered = filtered.filter(u => !u.isActive);
  } else if (filterStatus === "active") {
    filtered = filtered.filter(u => u.isActive);
  } else if (filterStatus === "pendingProvider") {
    filtered = filtered.filter(u => u.providerStatus === "pending");
  }

  const renderStatCard = (title, val, color) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statVal}>{val}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Management</Text>
        <TouchableOpacity onPress={() => navigation.navigate("AdminCreateUser")} style={styles.addBtn}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
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
          keyExtractor={item => item.title}
          renderItem={({ item }) => renderStatCard(item.title, item.val, item.color)}
        />
      </View>

      <View style={styles.filters}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {["all", "customer", "provider", "admin"].map(role => (
            <TouchableOpacity 
              key={role} 
              style={[styles.filterChip, filterRole === role && styles.filterChipActive]}
              onPress={() => setFilterRole(role)}
            >
              <Text style={[styles.filterText, filterRole === role && styles.filterTextActive]}>
                {role.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
          <View style={styles.filterDivider} />
          {["all", "active", "suspended", "pendingProvider"].map(status => (
            <TouchableOpacity 
              key={status} 
              style={[styles.filterChip, filterStatus === status && styles.filterChipActive]}
              onPress={() => setFilterStatus(status)}
            >
              <Text style={[styles.filterText, filterStatus === status && styles.filterTextActive]}>
                {status.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#135E4B" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={loadUsers} />}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.userCard}
              onPress={() => navigation.navigate("AdminUserDetails", { userId: item._id })}
            >
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.userName}>{item.firstName} {item.lastName}</Text>
                  <Text style={styles.userEmail}>{item.email}</Text>
                  {item.phone ? <Text style={styles.userPhone}>{item.phone}</Text> : null}
                </View>
                <View style={[styles.statusBadge, { backgroundColor: item.isActive ? "#10B98120" : "#EF444420" }]}>
                  <Text style={[styles.statusText, { color: item.isActive ? "#10B981" : "#EF4444" }]}>
                    {item.isActive ? "ACTIVE" : "SUSPENDED"}
                  </Text>
                </View>
              </View>

              <View style={styles.rolesRow}>
                {item.roles?.map(r => (
                  <View key={r} style={styles.roleBadge}>
                    <Text style={styles.roleText}>{r}</Text>
                  </View>
                ))}
                {item.providerStatus && item.providerStatus !== "none" && (
                  <View style={[styles.roleBadge, { backgroundColor: "#F59E0B20" }]}>
                    <Text style={[styles.roleText, { color: "#D97706" }]}>Prov: {item.providerStatus}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No users found</Text>}
        />
      )}
    </SafeAreaView>
  );
};

export default AdminUsersScreen;

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
  addBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#fff" },
  statsContainer: {
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#e5e7eb"
  },
  statCard: {
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    marginHorizontal: 8,
    width: width * 0.3,
  },
  statVal: { fontSize: 18, fontWeight: "bold", color: "#1f2937" },
  statTitle: { fontSize: 12, color: "#6b7280", marginTop: 4 },
  filters: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: "#fff",
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    marginHorizontal: 4,
  },
  filterChipActive: { backgroundColor: "#135E4B" },
  filterText: { fontSize: 12, fontWeight: "600", color: "#4b5563" },
  filterTextActive: { color: "#fff" },
  filterDivider: { width: 1, backgroundColor: "#d1d5db", marginHorizontal: 8, height: 24, alignSelf: "center" },
  userCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  userName: { fontSize: 16, fontWeight: "bold", color: "#1f2937" },
  userEmail: { fontSize: 14, color: "#6b7280", marginTop: 2 },
  userPhone: { fontSize: 13, color: "#9ca3af", marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: "bold" },
  rolesRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  roleBadge: { backgroundColor: "#f3f4f6", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  roleText: { fontSize: 12, color: "#4b5563", fontWeight: "500", textTransform: "capitalize" },
  emptyText: { textAlign: "center", color: "#6b7280", marginTop: 40, fontSize: 16 },
});
