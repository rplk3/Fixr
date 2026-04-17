import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { registerUser } from "../services/authApi";

const SignUpScreen = ({ navigation }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name.trim()) newErrors.name = "Name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!emailRegex.test(email)) newErrors.email = "Invalid email format";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6) newErrors.password = "Must be at least 6 characters";
    if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearError = (field) => setErrors((e) => ({ ...e, [field]: null }));

  const handleSignUp = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      await registerUser(name.trim(), email.trim(), password);
      Alert.alert("Success", "Account created! Please login.", [
        { text: "OK", onPress: () => navigation.replace("Login") },
      ]);
    } catch (error) {
      Alert.alert("Registration Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.logo}>Fixr</Text>
        <Text style={styles.subtitle}>Create your account</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            placeholder="Enter your full name"
            placeholderTextColor="#999"
            value={name}
            onChangeText={(t) => { setName(t); clearError("name"); }}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            placeholder="Enter your email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={(t) => { setEmail(t); clearError("email"); }}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={[styles.input, errors.password && styles.inputError]}
            placeholder="Min 6 characters"
            placeholderTextColor="#999"
            value={password}
            onChangeText={(t) => { setPassword(t); clearError("password"); }}
            secureTextEntry
          />
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={[styles.input, errors.confirmPassword && styles.inputError]}
            placeholder="Re-enter password"
            placeholderTextColor="#999"
            value={confirmPassword}
            onChangeText={(t) => { setConfirmPassword(t); clearError("confirmPassword"); }}
            secureTextEntry
          />
          {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}

          <TouchableOpacity
            style={styles.signUpButton}
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.signUpButtonText}>Sign Up</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.loginLink}>
              Already have an account? <Text style={styles.loginBold}>Login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#135E4B",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  logo: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#A8D5BA",
    textAlign: "center",
    marginBottom: 36,
  },
  form: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#135E4B",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#F0F7F4",
    borderRadius: 12,
    padding: 14,
    marginBottom: 4,
    color: "#000",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  inputError: {
    borderColor: "#E74C3C",
  },
  errorText: {
    color: "#E74C3C",
    fontSize: 12,
    marginBottom: 10,
  },
  signUpButton: {
    backgroundColor: "#4CB572",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 16,
  },
  signUpButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
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
