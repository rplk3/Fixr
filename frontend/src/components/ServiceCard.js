import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import colors from "../constants/colors";

const ServiceCard = ({ service, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image
        source={{
          uri:
            service.image ||
            "https://via.placeholder.com/150",
        }}
        style={styles.image}
      />

      <View style={styles.content}>
        <Text style={styles.title}>{service.title}</Text>

        <Text style={styles.category}>{service.category}</Text>

        <View style={styles.row}>
          <Text style={styles.rating}>⭐ 4.5</Text>
          <Text style={styles.price}>Rs. {service.price}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ServiceCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 15,
    overflow: "hidden",
    elevation: 3,
  },
  image: {
    width: "100%",
    height: 140,
  },
  content: {
    padding: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#135E4B",
  },
  category: {
    fontSize: 13,
    color: "#4CB572",
    marginVertical: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  rating: {
    fontSize: 12,
    color: "#135E4B",
  },
  price: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#4CB572",
  },
});