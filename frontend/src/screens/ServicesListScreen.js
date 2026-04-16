import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import ServiceCard from "../components/ServiceCard";
import { getAllServices } from "../services/serviceApi";

const ServicesListScreen = () => {
  const navigation = useNavigation();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  useEffect(() => {
    fetchServices();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Find the best services</Text>
        <Text style={styles.subText}>Fixr helps you book trusted workers</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search services..."
          placeholderTextColor="#6b7280"
          style={styles.searchInput}
        />
      </View>

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
    </SafeAreaView>
  );
};

export default ServicesListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#CCDCDB",
    paddingHorizontal: 16,
  },
  header: {
    marginTop: 20,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#135E4B",
  },
  subText: {
    fontSize: 14,
    color: "#4CB572",
    marginTop: 6,
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 15,
    color: "#135E4B",
  },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#135E4B",
  },
  viewAll: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4CB572",
  },
  listContent: {
    paddingBottom: 20,
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginTop: 20,
    textAlign: "center",
  },
  emptyText: {
    color: "#135E4B",
    fontSize: 15,
    textAlign: "center",
    marginTop: 30,
  },
});