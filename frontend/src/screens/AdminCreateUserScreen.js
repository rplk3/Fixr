import React, { useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { createAdminUser } from "../services/adminApi";
import { crossAlert } from "../utils/alert";

const AdminCreateUserScreen = ({ navigation }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [roles, setRoles] = useState(["customer"]);
  const [providerStatus, setProviderStatus] = useState("none");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!lastName.trim()) newErrors.lastName = "Last name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Invalid email format";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (phone && phone.trim().length < 9) newErrors.phone = "Invalid phone number";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validate()) return;
    
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
      crossAlert("Success", "User created successfully");
      navigation.goBack();
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

  const Checkbox = ({ label, value, selectedValue, onToggle }) => (
    <TouchableOpacity style={styles.radioOption} onPress={() => onToggle(value)}>
      <View style={[styles.checkboxSquare, selectedValue.includes(value) && styles.checkboxSquareSelected]}>
        {selectedValue.includes(value) && <Ionicons name="checkmark" size={14} color="#fff" />}
      </View>
      <Text style={styles.radioLabel}>{label}</Text>
    </TouchableOpacity>
  );

  const RadioOption = ({ label, value, selectedValue, onSelect }) => (
    <TouchableOpacity style={styles.radioOption} onPress={() => onSelect(value)}>
      <View style={[styles.radioCircle, selectedValue === value && styles.radioCircleSelected]} />
      <Text style={styles.radioLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create New User</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <Text style={styles.label}>First Name *</Text>
          <TextInput
            style={[styles.input, errors.firstName && styles.inputError]}
            value={firstName}
            onChangeText={t => { setFirstName(t); setErrors(e => ({...e, firstName: null})) }}
          />
          {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}

          <Text style={styles.label}>Last Name *</Text>
          <TextInput
            style={[styles.input, errors.lastName && styles.inputError]}
            value={lastName}
            onChangeText={t => { setLastName(t); setErrors(e => ({...e, lastName: null})) }}
          />
          {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}

          <Text style={styles.label}>Email Address *</Text>
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            value={email}
            onChangeText={t => { setEmail(t); setErrors(e => ({...e, email: null})) }}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={[styles.input, errors.phone && styles.inputError]}
            value={phone}
            onChangeText={t => { setPhone(t); setErrors(e => ({...e, phone: null})) }}
            keyboardType="phone-pad"
            placeholder="e.g. +947XXXXXXXX"
          />
          {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

          <Text style={styles.label}>Password *</Text>
          <TextInput
            style={[styles.input, errors.password && styles.inputError]}
            value={password}
            onChangeText={t => { setPassword(t); setErrors(e => ({...e, password: null})) }}
            secureTextEntry
          />
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
        </View>

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Account & Roles</Text>
          
          <Text style={styles.label}>Roles</Text>
          <View style={styles.radioGroup}>
            <Checkbox label="Customer" value="customer" selectedValue={roles} onToggle={toggleRole} />
            <Checkbox label="Provider" value="provider" selectedValue={roles} onToggle={toggleRole} />
            <Checkbox label="Admin" value="admin" selectedValue={roles} onToggle={toggleRole} />
          </View>

          <Text style={[styles.label, { marginTop: 20 }]}>Provider Status</Text>
          <View style={styles.radioGroupVertical}>
            <RadioOption label="None" value="none" selectedValue={providerStatus} onSelect={setProviderStatus} />
            <RadioOption label="Pending" value="pending" selectedValue={providerStatus} onSelect={setProviderStatus} />
            <RadioOption label="Approved" value="approved" selectedValue={providerStatus} onSelect={setProviderStatus} />
          </View>

          <Text style={[styles.label, { marginTop: 20 }]}>Account Status</Text>
          <View style={styles.radioGroup}>
            <RadioOption label="Active" value={true} selectedValue={isActive} onSelect={setIsActive} />
            <RadioOption label="Suspended" value={false} selectedValue={isActive} onSelect={setIsActive} />
          </View>
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleCreate} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Create User</Text>}
        </TouchableOpacity>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminCreateUserScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F1F5F0" },
  header: { 
    backgroundColor: "#135E4B", flexDirection: "row", alignItems: "center", 
    justifyContent: "space-between", paddingTop: 44, paddingBottom: 16, paddingHorizontal: 16 
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#fff" },
  content: { padding: 16 },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#1f2937", marginBottom: 16 },
  label: { fontSize: 13, fontWeight: "600", color: "#4b5563", marginBottom: 6 },
  input: {
    backgroundColor: "#f9fafb", borderWidth: 1, borderColor: "#d1d5db",
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: "#1f2937", marginBottom: 12,
  },
  inputError: { borderColor: "#ef4444", backgroundColor: "#fef2f2" },
  errorText: { color: "#ef4444", fontSize: 12, marginTop: -8, marginBottom: 12 },
  radioGroup: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 16 },
  radioGroupVertical: { gap: 12 },
  radioOption: { flexDirection: "row", alignItems: "center" },
  radioCircle: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: "#d1d5db", marginRight: 10 },
  radioCircleSelected: { borderColor: "#135E4B", backgroundColor: "#135E4B", borderWidth: 6 },
  checkboxSquare: { width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: "#d1d5db", marginRight: 10, alignItems: "center", justifyContent: "center" },
  checkboxSquareSelected: { borderColor: "#135E4B", backgroundColor: "#135E4B" },
  radioLabel: { fontSize: 15, color: "#4b5563" },
  saveBtn: { backgroundColor: "#135E4B", paddingVertical: 16, borderRadius: 12, alignItems: "center" },
  saveBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
