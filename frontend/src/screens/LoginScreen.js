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
import { loginUser } from "../services/authApi";
import { Ionicons } from "@expo/vector-icons";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) newErrors.email = "Email is required";
    else if (!emailRegex.test(email)) newErrors.email = "Invalid email format";

    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6) newErrors.password = "Password must be at least 6 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      const data = await loginUser(email.trim(), password);
      // Navigate to services list (role checking happens there)
      navigation.replace("Services");
    } catch (error) {
      Alert.alert("Login Failed", error.message);
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
        <Text style={styles.subtitle}>Welcome back</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            placeholder="Enter your email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={(t) => { setEmail(t); setErrors((e) => ({ ...e, email: null })); }}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, styles.passwordInput, errors.password && styles.inputError]}
              placeholder="Enter your password"
              placeholderTextColor="#999"
              value={password}
              onChangeText={(t) => { setPassword(t); setErrors((e) => ({ ...e, password: null })); }}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color="#666" />
            </TouchableOpacity>
          </View>
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
            <Text style={styles.signUpLink}>
              Don't have an account? <Text style={styles.signUpBold}>Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

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
  passwordContainer: {
    position: 'relative',
    justifyContent: 'center',
    marginBottom: 4,
  },
  passwordInput: {
    marginBottom: 0,
    paddingRight: 50,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: 14,
  },
  errorText: {
    color: "#E74C3C",
    fontSize: 12,
    marginBottom: 10,
  },
  loginButton: {
    backgroundColor: "#4CB572",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 16,
  },
  loginButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  signUpLink: {
    textAlign: "center",
    color: "#666",
    fontSize: 14,
  },
  signUpBold: {
    color: "#4CB572",
    fontWeight: "bold",
  },
});