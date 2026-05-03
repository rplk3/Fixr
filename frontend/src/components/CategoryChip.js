import React from "react";
import { TouchableOpacity, Text, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const ICON_MAP = {
  all:         "apps-outline",
  cleaning:    "sparkles-outline",
  plumbing:    "water-outline",
  electrical:  "flash-outline",
  carpentry:   "hammer-outline",
  painting:    "color-palette-outline",
  gardening:   "leaf-outline",
  moving:      "car-outline",
  hvac:        "thermometer-outline",
  repair:      "construct-outline",
  roofing:     "home-outline",
  pest:        "bug-outline",
  security:    "shield-outline",
  appliance:   "settings-outline",
  interior:    "brush-outline",
  events:      "calendar-outline",
  massage:     "hand-left-outline",
  teacher:     "school-outline",
  more:        "grid-outline",
};

const getIcon = (name = "") => {
  const key = name.toLowerCase().split(" ")[0];
  return ICON_MAP[key] || "construct-outline";
};

const CategoryChip = ({ label, active, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.75}
    style={[styles.chip, active && styles.chipActive]}
  >
    <View style={[styles.iconBox, active && styles.iconBoxActive]}>
      <Ionicons
        name={getIcon(label)}
        size={22}
        color={active ? "#fff" : "#2FA084"}
      />
    </View>
    <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>
      {label}
    </Text>
  </TouchableOpacity>
);

export default CategoryChip;

const styles = StyleSheet.create({
  chip: {
    alignItems: "center",
    marginRight: 14,
    width: 72,
  },
  chipActive: {},
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#EAF7F1",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "#D1EFE3",
  },
  iconBoxActive: {
    backgroundColor: "#1F6F5F",
    borderColor: "#1F6F5F",
  },
  label: {
    fontSize: 11,
    color: "#4B5563",
    fontWeight: "600",
    textAlign: "center",
  },
  labelActive: {
    color: "#1F6F5F",
  },
});
