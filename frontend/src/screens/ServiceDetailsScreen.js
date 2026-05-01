import { useRoute, useNavigation } from "@react-navigation/native";
import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const ServiceDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { service } = route.params;

  return (
    <ScrollView style={styles.container}>
      {service.image ? (
        <Image source={{ uri: service.image }} style={styles.image} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Ionicons name="image-outline" size={60} color="#999" />
          <Text style={styles.noImageText}>No image available</Text>
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.title}>{service.title}</Text>

        <Text style={styles.category}>{service.category}</Text>

        <Text style={styles.price}>LKR {service.price}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>
            {service.description ||
              "This service provides professional and reliable solutions for your needs. Book now to get the best experience."}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <Text style={styles.description}>{service.location || "Not specified"}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ratings</Text>
          <Text style={styles.rating}>⭐ 4.5 (120 reviews)</Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Booking", { service })}
        >
          <Ionicons name="calendar-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.buttonText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default ServiceDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#CCDCDB",
  },
  image: {
    width: "100%",
    height: 220,
  },
  imagePlaceholder: {
    width: "100%",
    height: 220,
    backgroundColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
  },
  noImageText: {
    fontSize: 13,
    color: "#999",
    marginTop: 6,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#135E4B",
  },
  category: {
    fontSize: 14,
    color: "#4CB572",
    marginTop: 4,
  },
  price: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#135E4B",
    marginTop: 10,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#135E4B",
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  rating: {
    fontSize: 14,
    color: "#135E4B",
  },
  button: {
    backgroundColor: "#4CB572",
    padding: 15,
    borderRadius: 12,
    marginTop: 30,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});