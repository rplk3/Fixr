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
import { Ionicons } from "@expo/vector-icons";

const SignUpScreen = ({ navigation }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const formatPhoneDisplay = (digits) => {
    const d = digits.replace(/\D/g, "").slice(0, 9);
    if (d.length <= 3) return d;
    if (d.length <= 6) return `${d.slice(0, 3)} ${d.slice(3)}`;
    return `${d.slice(0, 3)} ${d.slice(3, 7)} ${d.slice(7)}`;
  };

  const handlePhoneChange = (text) => {
    const digits = text.replace(/\D/g, "").slice(0, 9);
    setPhone(digits);
    clearError("phone");
  };

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!lastName.trim()) newErrors.lastName = "Last name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!emailRegex.test(email)) newErrors.email = "Invalid email format";
    if (!phone.trim()) newErrors.phone = "Phone number is required";
    else if (phone.length !== 9) newErrors.phone = "Phone number must be exactly 9 digits";
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
      setApiError("");
      setSuccessMsg("");
      const fullPhone = `+94${phone}`;
      await registerUser(firstName.trim(), lastName.trim(), email.trim(), fullPhone, password);
      setSuccessMsg("Account created! Redirecting to login...");
      setTimeout(() => {
        navigation.replace("Login");
      }, 1500);
    } catch (error) {
      setApiError(error.message);
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
          {successMsg ? <Text style={styles.successBanner}>{successMsg}</Text> : null}
          {apiError ? <Text style={styles.errorBanner}>{apiError}</Text> : null}

          <Text style={styles.label}>First Name</Text>
          <TextInput
            style={[styles.input, errors.firstName && styles.inputError]}
            placeholder="Enter your first name"
            placeholderTextColor="#999"
            value={firstName}
            onChangeText={(t) => { setFirstName(t); clearError("firstName"); }}
          />
          {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}

          <Text style={styles.label}>Last Name</Text>
          <TextInput
            style={[styles.input, errors.lastName && styles.inputError]}
            placeholder="Enter your last name"
            placeholderTextColor="#999"
            value={lastName}
            onChangeText={(t) => { setLastName(t); clearError("lastName"); }}
          />
          {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}

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

          <Text style={styles.label}>Phone Number</Text>
          <View style={styles.phoneRow}>
            <View style={styles.phonePrefix}>
              <Text style={styles.phonePrefixText}>+94</Text>
            </View>
            <TextInput
              style={[styles.input, styles.phoneInput, errors.phone && styles.inputError]}
              placeholder="7XX XXX XXXX"
              placeholderTextColor="#999"
              value={formatPhoneDisplay(phone)}
              onChangeText={handlePhoneChange}
              keyboardType="phone-pad"
              maxLength={12}
            />
          </View>
          {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, styles.passwordInput, errors.password && styles.inputError]}
              placeholder="Min 6 characters"
              placeholderTextColor="#999"
              value={password}
              onChangeText={(t) => { setPassword(t); clearError("password"); }}
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

          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, styles.passwordInput, errors.confirmPassword && styles.inputError]}
              placeholder="Re-enter password"
              placeholderTextColor="#999"
              value={confirmPassword}
              onChangeText={(t) => { setConfirmPassword(t); clearError("confirmPassword"); }}
              secureTextEntry={!showConfirmPassword}
            />
             <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={24} color="#666" />
            </TouchableOpacity>
          </View>
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
  successBanner: {
    backgroundColor: '#D4EDDA',
    color: '#155724',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  errorBanner: {
    backgroundColor: '#F8D7DA',
    color: '#721C24',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: 'bold',
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
  phoneRow: {
    flexDirection: "row", alignItems: "center", marginBottom: 4,
  },
  phonePrefix: {
    backgroundColor: "#135E4B", paddingHorizontal: 14, paddingVertical: 14,
    borderTopLeftRadius: 12, borderBottomLeftRadius: 12, justifyContent: "center",
  },
  phonePrefixText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
  phoneInput: {
    flex: 1, marginBottom: 0, borderTopLeftRadius: 0, borderBottomLeftRadius: 0,
  },
});
