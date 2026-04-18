import React from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const ProviderDashboardScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Provider Dashboard</Text>
          <Text style={styles.subText}>Manage your services & bookings</Text>
        </View>
        <TouchableOpacity
          style={styles.switchButton}
          onPress={() => navigation.replace("Services")}
        >
          <Ionicons name="swap-horizontal" size={20} color="#fff" />
          <Text style={styles.switchButtonText}>Customer Mode</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Active Bookings</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>LKR 0</Text>
            <Text style={styles.statLabel}>Total Earnings</Text>
          </View>
        </View>

        <View style={styles.emptyState}>
          <Ionicons name="folder-open-outline" size={60} color="#135E4B" />
          <Text style={styles.emptyTitle}>No active requests yet</Text>
          <Text style={styles.emptyDesc}>
            Your services are live. Customers will contact you soon!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProviderDashboardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#CCDCDB",
  },
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  greeting: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#135E4B",
  },
  subText: {
    fontSize: 13,
    color: "#4CB572",
    marginTop: 4,
  },
  switchButton: {
    flexDirection: "row",
    backgroundColor: "#135E4B",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  switchButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
    marginLeft: 6,
  },
  content: {
    padding: 20,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: "#fff",
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    marginHorizontal: 5,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#135E4B",
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 13,
    color: "#666",
  },
  emptyState: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
    marginTop: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#135E4B",
    marginTop: 15,
  },
  emptyDesc: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 10,
    lineHeight: 20,
  },
});
