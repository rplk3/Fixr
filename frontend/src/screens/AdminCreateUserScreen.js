import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, ActivityIndicator, Dimensions } from "react-native";
import KeyboardAwareScrollView from "../components/KeyboardAwareScrollView";
import { Ionicons } from "@expo/vector-icons";
import { createAdminUser } from "../services/adminApi";
import { crossAlert } from "../utils/alert";

const { width } = Dimensions.get("window");

// ── Reusable Components (outside to prevent re-mount) ──────
const InputField = ({ label, icon, value, onChangeText, onBlur, error, isTouched, placeholder, keyboardType, secureTextEntry, maxLength, rightIcon }) => (
  <View style={{ marginBottom: 16 }}>
    <Text style={st.fieldLabel}>{label}</Text>
    <View style={[st.inputWrapper, isTouched && error ? st.inputWrapperError : null]}>
      <Ionicons name={icon} size={18} color={isTouched && error ? "#EF4444" : "#94A3B8"} style={{ marginRight: 10 }} />
      <TextInput
        style={st.inputInner}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        placeholder={placeholder}
        placeholderTextColor="#CBD5E1"
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        maxLength={maxLength}
        autoCapitalize="none"
      />
      {rightIcon || null}
    </View>
    {isTouched && error ? <Text style={st.errorText}>{error}</Text> : null}
  </View>
);

const RoleChip = ({ label, value, icon, selected, onToggle }) => (
  <TouchableOpacity style={[st.chipBtn, selected && st.chipBtnActive]} onPress={() => onToggle(value)} activeOpacity={0.7}>
    <Ionicons name={icon} size={16} color={selected ? "#fff" : "#64748B"} />
    <Text style={[st.chipBtnText, selected && st.chipBtnTextActive]}>{label}</Text>
  </TouchableOpacity>
);

const RadioPill = ({ label, value, selectedValue, onSelect, color }) => (
  <TouchableOpacity
    style={[st.radioPill, selectedValue === value && { backgroundColor: color + "15", borderColor: color }]}
    onPress={() => onSelect(value)}
    activeOpacity={0.7}
  >
    <View style={[st.radioDot, selectedValue === value && { backgroundColor: color, borderColor: color }]} />
    <Text style={[st.radioPillText, selectedValue === value && { color }]}>{label}</Text>
  </TouchableOpacity>
);

const AdminCreateUserScreen = ({ navigation }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+94");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [roles, setRoles] = useState(["customer"]);
  const [providerStatus, setProviderStatus] = useState("none");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});

  // ── Input Formatters ─────────────────────────────────────
  const handleFirstName = (t) => {
    // Only allow letters and spaces
    setFirstName(t.replace(/[^a-zA-Z\s]/g, ""));
  };

  const handleLastName = (t) => {
    // Only allow letters and spaces
    setLastName(t.replace(/[^a-zA-Z\s]/g, ""));
  };

  const handlePhone = (displayText) => {
    // Strip the display space: "+94 " -> "+94"
    const raw = displayText.replace(/\s/g, "");
    if (!raw.startsWith("+94")) return;
    const afterPrefix = raw.slice(3).replace(/[^0-9]/g, "").slice(0, 9);
    setPhone("+94" + afterPrefix);
  };

  // Display phone with space after +94
  const displayPhone = phone.length > 3 ? "+94 " + phone.slice(3) : phone;

  // ── Validation ───────────────────────────────────────────
  const errors = useMemo(() => {
    const e = {};

    if (!firstName.trim()) e.firstName = "First name is required.";
    else if (firstName.trim().length < 2) e.firstName = "Must be at least 2 characters.";

    if (!lastName.trim()) e.lastName = "Last name is required.";
    else if (lastName.trim().length < 2) e.lastName = "Must be at least 2 characters.";

    if (!email.trim()) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = "Invalid email format.";

    // Phone: if digits entered, must be exactly 9
    if (phone.length > 3) {
      const digits = phone.slice(3).replace(/\s/g, "");
      if (digits.length < 9) e.phone = "Enter 9 digits after +94.";
    }

    if (!password) e.password = "Password is required.";
    else if (password.length < 6) e.password = "Must be at least 6 characters.";

    return e;
  }, [firstName, lastName, email, phone, password]);

  const isValid = Object.keys(errors).length === 0;
  const markTouched = (field) => setTouched((t) => ({ ...t, [field]: true }));

  const handleCreate = async () => {
    // Mark all fields touched
    setTouched({ firstName: true, lastName: true, email: true, phone: true, password: true });

    if (!isValid) {
      crossAlert("Validation Error", "Please fix the highlighted errors.");
      return;
    }

    try {
      setLoading(true);
      await createAdminUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
        roles,
        providerStatus,
        isActive
      });
      crossAlert("Success", "User created successfully!", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    } catch (e) {
      crossAlert("Error", e.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = (role) => {
    if (roles.includes(role)) {
      setRoles(roles.filter(r => r !== role));
    } else {
      setRoles([...roles, role]);
    }
  };


  return (
    <SafeAreaView style={st.container}>
      {/* Header */}
      <View style={st.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={st.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={st.headerTitle}>Create New User</Text>
          <Text style={st.headerSub}>Add a new user to the system</Text>
        </View>
      </View>

      <KeyboardAwareScrollView contentContainerStyle={st.content} enableOnAndroid={true} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Basic Information Card */}
        <View style={st.card}>
          <View style={st.cardHeader}>
            <View style={st.cardIconWrap}>
              <Ionicons name="person-outline" size={18} color="#135E4B" />
            </View>
            <Text style={st.cardTitle}>Basic Information</Text>
          </View>

          <InputField
            label="First Name *"
            icon="person-outline"
            value={firstName}
            onChangeText={handleFirstName}
            onBlur={() => markTouched("firstName")}
            error={errors.firstName}
            isTouched={touched.firstName}
            placeholder="John"
            maxLength={30}
          />

          <InputField
            label="Last Name *"
            icon="person-outline"
            value={lastName}
            onChangeText={handleLastName}
            onBlur={() => markTouched("lastName")}
            error={errors.lastName}
            isTouched={touched.lastName}
            placeholder="Doe"
            maxLength={30}
          />

          <InputField
            label="Email Address *"
            icon="mail-outline"
            value={email}
            onChangeText={(t) => setEmail(t)}
            onBlur={() => markTouched("email")}
            error={errors.email}
            isTouched={touched.email}
            placeholder="john@example.com"
            keyboardType="email-address"
          />

          <InputField
            label="Phone Number"
            icon="call-outline"
            value={displayPhone}
            onChangeText={handlePhone}
            onBlur={() => markTouched("phone")}
            error={errors.phone}
            isTouched={touched.phone}
            placeholder="+94 XXXXXXXXX"
            keyboardType="phone-pad"
            maxLength={13}
          />

          <InputField
            label="Password *"
            icon="lock-closed-outline"
            value={password}
            onChangeText={(t) => setPassword(t)}
            onBlur={() => markTouched("password")}
            error={errors.password}
            isTouched={touched.password}
            placeholder="Min. 6 characters"
            secureTextEntry={!showPassword}
            rightIcon={
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#94A3B8" />
              </TouchableOpacity>
            }
          />
        </View>

        {/* Roles & Status Card */}
        <View style={st.card}>
          <View style={st.cardHeader}>
            <View style={[st.cardIconWrap, { backgroundColor: "#3B82F615" }]}>
              <Ionicons name="shield-checkmark-outline" size={18} color="#3B82F6" />
            </View>
            <Text style={st.cardTitle}>Roles & Status</Text>
          </View>

          <Text style={st.fieldLabel}>Assign Roles</Text>
          <View style={st.chipRow}>
            <RoleChip label="Customer" value="customer" icon="person-outline" selected={roles.includes("customer")} onToggle={toggleRole} />
            <RoleChip label="Provider" value="provider" icon="construct-outline" selected={roles.includes("provider")} onToggle={toggleRole} />
            <RoleChip label="Admin" value="admin" icon="shield-checkmark-outline" selected={roles.includes("admin")} onToggle={toggleRole} />
          </View>

          <Text style={[st.fieldLabel, { marginTop: 20 }]}>Provider Status</Text>
          <View style={st.pillRow}>
            <RadioPill label="None" value="none" selectedValue={providerStatus} onSelect={setProviderStatus} color="#6B7280" />
            <RadioPill label="Pending" value="pending" selectedValue={providerStatus} onSelect={setProviderStatus} color="#F59E0B" />
            <RadioPill label="Approved" value="approved" selectedValue={providerStatus} onSelect={setProviderStatus} color="#10B981" />
          </View>

          <Text style={[st.fieldLabel, { marginTop: 20 }]}>Account Status</Text>
          <View style={st.pillRow}>
            <RadioPill label="Active" value={true} selectedValue={isActive} onSelect={setIsActive} color="#10B981" />
            <RadioPill label="Suspended" value={false} selectedValue={isActive} onSelect={setIsActive} color="#EF4444" />
          </View>
        </View>

        {/* Create Button */}
        <TouchableOpacity style={[st.createBtn, !isValid && { opacity: 0.6 }]} onPress={handleCreate} disabled={loading} activeOpacity={0.8}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="person-add-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={st.createBtnText}>Create User</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default AdminCreateUserScreen;

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F1F5F0" },
  header: {
    backgroundColor: "#135E4B", flexDirection: "row", alignItems: "center",
    paddingTop: 44, paddingBottom: 16, paddingHorizontal: 16,
  },
  backBtn: { padding: 4, marginRight: 12 },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#fff" },
  headerSub: { fontSize: 12, color: "#A8D5BA", marginTop: 2 },
  content: { padding: 16 },

  // Card
  card: {
    backgroundColor: "#fff", borderRadius: 16, padding: 20, marginBottom: 16,
    elevation: 2, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  cardIconWrap: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: "#135E4B15",
    alignItems: "center", justifyContent: "center", marginRight: 12,
  },
  cardTitle: { fontSize: 17, fontWeight: "bold", color: "#1F2937" },

  // Input Fields
  fieldLabel: { fontSize: 12, fontWeight: "700", color: "#64748B", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.3 },
  inputWrapper: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#F8FAFC",
    borderWidth: 1.5, borderColor: "#E2E8F0", borderRadius: 12, paddingHorizontal: 14, height: 48,
  },
  inputWrapperError: { borderColor: "#EF4444", backgroundColor: "#FEF2F2" },
  inputInner: { flex: 1, fontSize: 15, color: "#1F2937" },
  errorText: { color: "#EF4444", fontSize: 11, fontWeight: "600", marginTop: 4 },

  // Role Chips
  chipRow: { flexDirection: "row", flexWrap: "wrap" },
  chipBtn: {
    flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 12, backgroundColor: "#F1F5F9", borderWidth: 1.5, borderColor: "#E2E8F0", marginRight: 10, marginBottom: 8,
  },
  chipBtnActive: { backgroundColor: "#135E4B", borderColor: "#135E4B" },
  chipBtnText: { fontSize: 14, color: "#64748B", fontWeight: "600", marginLeft: 8 },
  chipBtnTextActive: { color: "#fff" },

  // Radio Pills
  pillRow: { flexDirection: "row", flexWrap: "wrap" },
  radioPill: {
    flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, backgroundColor: "#F8FAFC", borderWidth: 1.5, borderColor: "#E2E8F0", marginRight: 10, marginBottom: 8,
  },
  radioDot: { width: 10, height: 10, borderRadius: 5, borderWidth: 2, borderColor: "#CBD5E1", marginRight: 8 },
  radioPillText: { fontSize: 13, color: "#64748B", fontWeight: "600" },

  // Create Button
  createBtn: {
    backgroundColor: "#135E4B", paddingVertical: 16, borderRadius: 14, alignItems: "center",
    elevation: 3, shadowColor: "#135E4B", shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
  },
  createBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
