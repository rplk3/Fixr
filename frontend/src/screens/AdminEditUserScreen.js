import React, { useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { updateAdminUser } from "../services/adminApi";
import { crossAlert } from "../utils/alert";

const AdminEditUserScreen = ({ route, navigation }) => {
  const { user } = route.params;
  
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone || "");
  const [providerStatus, setProviderStatus] = useState(user.providerStatus);
  const [isActive, setIsActive] = useState(user.isActive);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!lastName.trim()) newErrors.lastName = "Last name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Invalid email format";
    if (phone && phone.trim().length < 9) newErrors.phone = "Invalid phone number";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    
    try {
      setLoading(true);
      await updateAdminUser(user._id, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        providerStatus,
        isActive
      });
      crossAlert("Success", "User details updated successfully");
      navigation.goBack();
    } catch (e) {
      crossAlert("Error", e.message);
    } finally {
      setLoading(false);
    }
  };

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
        <Text style={styles.headerTitle}>Edit User</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <Text style={styles.label}>First Name</Text>
          <TextInput
            style={[styles.input, errors.firstName && styles.inputError]}
            value={firstName}
            onChangeText={t => { setFirstName(t); setErrors(e => ({...e, firstName: null})) }}
          />
          {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}

          <Text style={styles.label}>Last Name</Text>
          <TextInput
            style={[styles.input, errors.lastName && styles.inputError]}
            value={lastName}
            onChangeText={t => { setLastName(t); setErrors(e => ({...e, lastName: null})) }}
          />
          {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}

          <Text style={styles.label}>Email Address</Text>
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
          />
          {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
        </View>

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Account Status</Text>
          
          <Text style={styles.label}>Is Active?</Text>
          <View style={styles.radioGroup}>
            <RadioOption label="Active" value={true} selectedValue={isActive} onSelect={setIsActive} />
            <RadioOption label="Suspended" value={false} selectedValue={isActive} onSelect={setIsActive} />
          </View>

          <Text style={[styles.label, { marginTop: 20 }]}>Provider Status</Text>
          <View style={styles.radioGroupVertical}>
            <RadioOption label="None" value="none" selectedValue={providerStatus} onSelect={setProviderStatus} />
            <RadioOption label="Pending" value="pending" selectedValue={providerStatus} onSelect={setProviderStatus} />
            <RadioOption label="Approved" value="approved" selectedValue={providerStatus} onSelect={setProviderStatus} />
            <RadioOption label="Rejected" value="rejected" selectedValue={providerStatus} onSelect={setProviderStatus} />
          </View>
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
        </TouchableOpacity>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminEditUserScreen;

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
  radioGroup: { flexDirection: "row", alignItems: "center", gap: 20 },
  radioGroupVertical: { gap: 12 },
  radioOption: { flexDirection: "row", alignItems: "center" },
  radioCircle: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: "#d1d5db", marginRight: 10 },
  radioCircleSelected: { borderColor: "#135E4B", backgroundColor: "#135E4B", borderWidth: 6 },
  radioLabel: { fontSize: 15, color: "#4b5563" },
  saveBtn: { backgroundColor: "#135E4B", paddingVertical: 16, borderRadius: 12, alignItems: "center" },
  saveBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
