import { useRoute, useNavigation } from "@react-navigation/native";
import React, { useState, useEffect } from "react";
import {
  View, Text, Image, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, StatusBar, Platform, ActivityIndicator, Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getServiceReviews } from "../services/reviewApi";
import { IMAGE_BASE_URL } from "../config/api";

const { width } = Dimensions.get("window");

const ServiceDetailsScreen = () => {
  const route      = useRoute();
  const navigation = useNavigation();
  const { service } = route.params;

  const [reviews, setReviews]               = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [showReviews, setShowReviews]       = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await getServiceReviews(service._id);
        setReviews(data);
      } catch (e) {
        console.log("Failed to fetch reviews", e);
      } finally {
        setLoadingReviews(false);
      }
    };
    fetchReviews();
  }, [service._id]);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const imageUri = service.image && service.image.trim() !== ""
    ? service.image.startsWith("/uploads")
      ? `${IMAGE_BASE_URL}${service.image}`
      : service.image
    : null;

  // ── Star renderer ──
  const renderStars = (rating) =>
    [1, 2, 3, 4, 5].map((i) => (
      <Ionicons
        key={i}
        name={i <= Math.round(rating) ? "star" : "star-outline"}
        size={14}
        color="#F59E0B"
        style={{ marginRight: 2 }}
      />
    ));

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1F6F5F" />

      {/* ── Sticky Header ── */}
      <View style={[
        styles.navBar,
        { paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 24) + 4 : 12 }
      ]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>{service.title}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* ── Hero Image ── */}
        <View style={styles.heroContainer}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.heroImage} resizeMode="cover" />
          ) : (
            <View style={styles.heroPlaceholder}>
              <Ionicons name="image-outline" size={56} color="#A8D5BA" />
              <Text style={styles.heroPlaceholderText}>No image available</Text>
            </View>
          )}
          {/* Category badge overlay */}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{service.category}</Text>
          </View>
        </View>

        {/* ── Content ── */}
        <View style={styles.content}>

          {/* Title + Price Row */}
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={2}>{service.title}</Text>
            <View style={styles.priceBox}>
              <Text style={styles.priceLabel}>From</Text>
              <Text style={styles.priceValue}>Rs. {service.price?.toLocaleString()}</Text>
            </View>
          </View>

          {/* Rating Summary */}
          <View style={styles.ratingBar}>
            <View style={styles.starsRow}>
              {avgRating ? renderStars(avgRating) : null}
              {loadingReviews
                ? <ActivityIndicator size="small" color="#2FA084" />
                : avgRating
                  ? <Text style={styles.ratingVal}>{avgRating} ({reviews.length} reviews)</Text>
                  : <Text style={styles.ratingEmpty}>No reviews yet</Text>
              }
            </View>
            {reviews.length > 0 && (
              <TouchableOpacity onPress={() => setShowReviews(!showReviews)} style={styles.reviewToggle}>
                <Text style={styles.reviewToggleText}>
                  {showReviews ? "Hide" : "See All"}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Info Cards Row */}
          <View style={styles.infoRow}>
            <View style={styles.infoCard}>
              <Ionicons name="location-outline" size={20} color="#2FA084" />
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue} numberOfLines={2}>{service.location || "Not specified"}</Text>
            </View>
            <View style={styles.infoCard}>
              <Ionicons name={service.availability ? "checkmark-circle-outline" : "close-circle-outline"} size={20} color={service.availability ? "#10B981" : "#EF4444"} />
              <Text style={styles.infoLabel}>Availability</Text>
              <Text style={[styles.infoValue, { color: service.availability ? "#10B981" : "#EF4444" }]}>
                {service.availability ? "Available" : "Unavailable"}
              </Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About This Service</Text>
            <Text style={styles.description}>
              {service.description || "Professional and reliable service. Book now to get the best experience."}
            </Text>
          </View>

          {/* Provider */}
          {service.provider && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Service Provider</Text>
              <View style={styles.providerCard}>
                <View style={styles.providerAvatar}>
                  <Ionicons name="person" size={26} color="#2FA084" />
                </View>
                <View style={styles.providerInfo}>
                  <Text style={styles.providerName}>
                    {service.provider?.firstName
                      ? `${service.provider.firstName} ${service.provider.lastName || ""}`
                      : "Service Provider"}
                  </Text>
                  <Text style={styles.providerSub}>Verified Provider</Text>
                </View>
                <Ionicons name="shield-checkmark-outline" size={18} color="#2FA084" />
              </View>
            </View>
          )}

          {/* Reviews */}
          {showReviews && reviews.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Customer Reviews</Text>
              {reviews.map((r) => (
                <View key={r._id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewAvatarRow}>
                      <View style={styles.reviewAvatar}>
                        <Text style={styles.reviewInitial}>
                          {r.customer?.firstName?.[0]?.toUpperCase() || "U"}
                        </Text>
                      </View>
                      <View>
                        <Text style={styles.reviewerName}>
                          {r.customer?.firstName} {r.customer?.lastName}
                        </Text>
                        <View style={styles.reviewStars}>{renderStars(r.rating)}</View>
                      </View>
                    </View>
                    <View style={styles.reviewBadge}>
                      <Ionicons name="star" size={11} color="#F59E0B" />
                      <Text style={styles.reviewBadgeText}>{r.rating}</Text>
                    </View>
                  </View>
                  <Text style={styles.reviewComment}>{r.comment}</Text>
                </View>
              ))}
            </View>
          )}
          {/* ── Scrollable Footer ── */}
          <View style={styles.scrollFooter}>
            <View style={styles.footerPrice}>
              <Text style={styles.footerPriceLabel}>Total</Text>
              <Text style={styles.footerPriceValue}>Rs. {service.price?.toLocaleString()}</Text>
            </View>
            <TouchableOpacity
              style={styles.bookBtn}
              onPress={() => navigation.navigate("Booking", { service })}
              activeOpacity={0.85}
            >
              <Ionicons name="calendar-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.bookBtnText}>Book Now</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ServiceDetailsScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },

  // ── Nav Bar ──
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1F6F5F",
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  navTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    marginHorizontal: 10,
  },

  // ── Hero ──
  heroContainer: {
    width: "100%",
    height: 240,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#EAF7F1",
    alignItems: "center",
    justifyContent: "center",
  },
  heroPlaceholderText: {
    marginTop: 8,
    color: "#6B7280",
    fontSize: 13,
  },
  categoryBadge: {
    position: "absolute",
    bottom: 14,
    left: 14,
    backgroundColor: "#1F6F5F",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  categoryBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  // ── Content ──
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  // ── Title Row ──
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  title: {
    flex: 1,
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    marginRight: 12,
    lineHeight: 28,
  },
  priceBox: {
    backgroundColor: "#EAF7F1",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "center",
    minWidth: 90,
  },
  priceLabel: {
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1F6F5F",
  },

  // ── Rating Bar ──
  ratingBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  starsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingVal: {
    fontSize: 13,
    color: "#4B5563",
    fontWeight: "600",
    marginLeft: 6,
  },
  ratingEmpty: {
    fontSize: 13,
    color: "#9CA3AF",
    marginLeft: 4,
  },
  reviewToggle: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: "#EAF7F1",
    borderRadius: 20,
  },
  reviewToggleText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1F6F5F",
  },

  // ── Divider ──
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginBottom: 18,
  },

  // ── Info Cards ──
  infoRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  infoCard: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    alignItems: "flex-start",
    gap: 4,
  },
  infoLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginTop: 4,
  },
  infoValue: {
    fontSize: 13,
    color: "#111827",
    fontWeight: "600",
  },

  // ── Section ──
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 22,
  },

  // ── Provider Card ──
  providerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  providerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EAF7F1",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  providerSub: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },

  // ── Reviews ──
  reviewCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  reviewAvatarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
  },
  reviewInitial: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1F6F5F",
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  reviewStars: {
    flexDirection: "row",
    marginTop: 3,
  },
  reviewBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 3,
  },
  reviewBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#B45309",
  },
  reviewComment: {
    fontSize: 13,
    color: "#4B5563",
    lineHeight: 20,
  },

  // ── Scrollable Footer ──
  scrollFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  footerPrice: {
    gap: 2,
  },
  footerPriceLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "500",
    textTransform: "uppercase",
  },
  footerPriceValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1F6F5F",
  },
  bookBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1F6F5F",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: "#1F6F5F",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  bookBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});