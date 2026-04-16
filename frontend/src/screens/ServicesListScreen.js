import { useNavigation } from "@react-navigation/native";
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import ServiceCard from "../components/ServiceCard";

const services = [
  {
    _id: "1",
    title: "Plumbing Repair",
    category: "Plumbing",
    price: 2500,
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952",
  },
  {
    _id: "2",
    title: "AC Service",
    category: "Appliance Repair",
    price: 4000,
    image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4",
  },
  {
    _id: "3",
    title: "House Cleaning",
    category: "Cleaning",
    price: 3000,
    image: "https://images.unsplash.com/photo-1585421514738-01798e348b17",
  },
  {
    _id: "4",
    title: "Electrical Repair",
    category: "Electrical",
    price: 3500,
    image: "https://images.unsplash.com/photo-1621905251918-48416bd8575a",
  },
];

const ServicesListScreen = () => {
  const navigation = useNavigation();

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
        <TouchableOpacity>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>

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
      />
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
});