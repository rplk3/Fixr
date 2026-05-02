import { useRoute, useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getServiceReviews } from "../services/reviewApi";

const ServiceDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { service } = route.params;

  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [showReviews, setShowReviews] = useState(false);

  React.useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await getServiceReviews(service._id);
        setReviews(data);
      } catch (error) {
        console.log("Failed to fetch reviews", error);
      } finally {
        setLoadingReviews(false);
      }
    };
    fetchReviews();
  }, [service._id]);

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const renderReviewItem = ({ item }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewAuthorRow}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>{item.customer?.firstName?.[0] || "U"}</Text>
          </View>
          <Text style={styles.reviewerName}>{item.customer?.firstName} {item.customer?.lastName}</Text>
        </View>
        <View style={styles.starRow}>
          <Ionicons name="star" size={14} color="#F59E0B" />
          <Text style={styles.starText}>{item.rating}</Text>
        </View>
      </View>
      <Text style={styles.reviewComment}>{item.comment}</Text>
    </View>
  );

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
          <View style={styles.ratingRow}>
            {loadingReviews ? (
              <ActivityIndicator size="small" color="#135E4B" />
            ) : reviews.length > 0 ? (
              <Text style={styles.rating}>⭐ {averageRating} ({reviews.length} reviews)</Text>
            ) : (
              <Text style={styles.rating}>No reviews yet</Text>
            )}

            {reviews.length > 0 && (
              <TouchableOpacity 
                style={styles.toggleReviewsBtn} 
                onPress={() => setShowReviews(!showReviews)}
              >
                <Text style={styles.toggleReviewsText}>
                  {showReviews ? "Close ratings" : "View ratings"}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {showReviews && (
            <View style={styles.reviewsListContainer}>
              {reviews.map((r) => (
                <React.Fragment key={r._id}>
                  {renderReviewItem({ item: r })}
                </React.Fragment>
              ))}
            </View>
          )}
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
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toggleReviewsBtn: {
    backgroundColor: "#E0ECEB",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  toggleReviewsText: {
    color: "#135E4B",
    fontWeight: "bold",
    fontSize: 13,
  },
  reviewsListContainer: {
    marginTop: 12,
  },
  reviewCard: { 
    backgroundColor: "#F9FAFB", borderRadius: 12, padding: 12, marginBottom: 8,
    borderWidth: 1, borderColor: "#E5E7EB"
  },
  reviewHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  reviewAuthorRow: { flexDirection: "row", alignItems: "center" },
  avatarCircle: { width: 30, height: 30, borderRadius: 15, backgroundColor: "#D1FAE5", justifyContent: "center", alignItems: "center", marginRight: 8 },
  avatarInitial: { fontSize: 14, fontWeight: "bold", color: "#135E4B" },
  reviewerName: { fontSize: 14, fontWeight: "600", color: "#111827" },
  starRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#FEF3C7", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  starText: { fontSize: 12, fontWeight: "bold", color: "#B45309", marginLeft: 4 },
  reviewComment: { fontSize: 13, color: "#4B5563", lineHeight: 18 },
});