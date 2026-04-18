import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const WelcomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Hero Section */}
      <View style={styles.hero}>
        <Text style={styles.logo}>Fixr</Text>
        <Text style={styles.heroEmoji}>🔧</Text>
      </View>

      {/* Content Card */}
      <View style={styles.card}>
        <Text style={styles.heading}>
          All the services you need, right at your fingertips
        </Text>
        <Text style={styles.subheading}>
          From cleaning to construction, plumbing to massage, we've got you
          covered
        </Text>

        <TouchableOpacity
          style={styles.signUpButton}
          onPress={() => navigation.navigate("SignUp")}
        >
          <Text style={styles.signUpText}>Sign Up</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.loginLink}>
            Already have an account? <Text style={styles.loginBold}>Login</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#135E4B",
  },
  hero: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 40,
  },
  logo: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  heroEmoji: {
    fontSize: 80,
  },
  card: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 28,
    paddingTop: 36,
    paddingBottom: 50,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#135E4B",
    textAlign: "center",
    marginBottom: 12,
  },
  subheading: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 20,
  },
  signUpButton: {
    backgroundColor: "#4CB572",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 18,
  },
  signUpText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  loginLink: {
    textAlign: "center",
    color: "#666",
    fontSize: 14,
  },
  loginBold: {
    color: "#4CB572",
    fontWeight: "bold",
  },
});
