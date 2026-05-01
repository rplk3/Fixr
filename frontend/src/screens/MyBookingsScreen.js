import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  FlatList, ActivityIndicator, Image, RefreshControl
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { getMyBookings } from "../services/bookingApi";

const MyBookingsScreen = () => {
  const navigation = useNavigation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMyBookings();
      setBookings(data);
    } catch (e) {
      console.log("Error fetching bookings", e);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchBookings();
    });
    return unsubscribe;
  }, [navigation, fetchBookings]);

  const renderItem = ({ item }) => {
    return (
      <View style={s.card}>
        <View style={s.header}>
          <Text style={s.serviceTitle}>{item.service?.title || "Service"}</Text>
          <View style={[s.badge, s[`badge_${item.status}`]]}>
            <Text style={s.badgeText}>{item.status.toUpperCase()}</Text>
          </View>
        </View>

        <Text style={s.providerText}>
          Provider: {item.provider?.firstName} {item.provider?.lastName}
        </Text>
        
        <View style={s.row}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={s.infoText}>{item.date}</Text>
        </View>
        <View style={s.row}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={s.infoText}>{item.time}</Text>
        </View>
        <View style={s.row}>
          <Ionicons name="cash-outline" size={16} color="#666" />
          <Text style={s.infoText}>LKR {item.service?.price}</Text>
        </View>

        {item.status === "confirmed" && (
          <TouchableOpacity
            style={s.payBtn}
            onPress={() => navigation.navigate("Payment", { booking: item })}
          >
            <Ionicons name="card-outline" size={20} color="#fff" />
            <Text style={s.payBtnText}>Pay Now to get the service</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 5 }}>
          <Ionicons name="arrow-back" size={24} color="#135E4B" />
        </TouchableOpacity>
        <Text style={s.screenTitle}>My Bookings</Text>
        <View style={{ width: 30 }} />
      </View>

      {loading && bookings.length === 0 ? (
        <ActivityIndicator size="large" color="#135E4B" style={{ marginTop: 40 }} />
      ) : bookings.length === 0 ? (
        <View style={s.empty}>
          <Ionicons name="calendar-outline" size={60} color="#ccc" />
          <Text style={s.emptyText}>No bookings found.</Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchBookings} />}
        />
      )}
    </SafeAreaView>
  );
};

export default MyBookingsScreen;

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#CCDCDB" },
  topBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 14, backgroundColor: "#fff",
    borderBottomWidth: 1, borderBottomColor: "#E0E0E0"
  },
  screenTitle: { fontSize: 18, fontWeight: "bold", color: "#135E4B" },
  card: {
    backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 16,
    elevation: 2, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 },
  },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  serviceTitle: { fontSize: 18, fontWeight: "bold", color: "#135E4B" },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badge_pending: { backgroundColor: "#FEF3C7" },
  badge_confirmed: { backgroundColor: "#D1FAE5" },
  badge_completed: { backgroundColor: "#DBEAFE" },
  badge_cancelled: { backgroundColor: "#FEE2E2" },
  badgeText: { fontSize: 11, fontWeight: "bold", color: "#333" },
  providerText: { fontSize: 14, color: "#4CB572", marginBottom: 12, fontWeight: "500" },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  infoText: { fontSize: 14, color: "#666", marginLeft: 8 },
  payBtn: {
    backgroundColor: "#135E4B", padding: 12, borderRadius: 8, marginTop: 12,
    flexDirection: "row", justifyContent: "center", alignItems: "center"
  },
  payBtnText: { color: "#fff", fontWeight: "bold", fontSize: 15, marginLeft: 8 },
  empty: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 16, color: "#999", marginTop: 12 }
});
