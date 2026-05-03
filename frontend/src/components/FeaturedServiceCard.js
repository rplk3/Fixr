import React from "react";
import {
  TouchableOpacity, Text, View, Image, StyleSheet, Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { IMAGE_BASE_URL } from "../config/api";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - 40; // full width minus horizontal padding

const FeaturedServiceCard = ({ service, onPress }) => {
  const imageUri =
    service.image && service.image.trim() !== ""
      ? service.image.startsWith("/uploads")
        ? `${IMAGE_BASE_URL}${service.image}`
        : service.image
      : "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400";

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.88}>
      {/* Image */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
        {/* Category badge overlay */}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText} numberOfLines={1}>
            {service.category}
          </Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{service.title}</Text>

        <View style={styles.providerRow}>
          <Ionicons name="person-circle-outline" size={14} color="#6B7280" />
          <Text style={styles.providerText} numberOfLines={1}>
            {service.provider?.firstName
              ? `${service.provider.firstName} ${service.provider.lastName || ""}`
              : "Service Provider"}
          </Text>
        </View>

        <View style={styles.footerRow}>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={13} color="#F59E0B" />
            <Text style={styles.ratingText}>4.8</Text>
          </View>
          <Text style={styles.price}>Rs. {service.price?.toLocaleString()}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default FeaturedServiceCard;

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: "#fff",
    borderRadius: 18,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#1F6F5F",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 10,
    elevation: 4,
  },
  imageContainer: {
    width: "100%",
    height: 180,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  categoryBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#1F6F5F",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  categoryText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 5,
    lineHeight: 20,
  },
  providerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 4,
  },
  providerText: {
    fontSize: 11,
    color: "#6B7280",
    marginLeft: 3,
    flex: 1,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1F2937",
    marginLeft: 3,
  },
  price: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1F6F5F",
  },
});
