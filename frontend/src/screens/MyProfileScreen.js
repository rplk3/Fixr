import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { getUser, updateProfile } from "../services/authApi";
import { crossAlert } from "../utils/alert";

const MyProfileScreen = ({ navigation }) => {
  const [user, setLocalUser] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const currentUser = getUser();
    if (currentUser) {
      setLocalUser(currentUser);
      setFirstName(currentUser.firstName || "");
      setLastName(currentUser.lastName || "");
      // Strip +94 prefix if stored with it, we display it separately
      const rawPhone = currentUser.phone || "";
      setPhone(rawPhone.startsWith("+94") ? rawPhone.slice(3).trim() : rawPhone);
      setProfileImage(currentUser.profileImage || "");
    }
  }, []);

  const formatPhoneDisplay = (digits) => {
    const d = digits.replace(/\D/g, "").slice(0, 9);
    if (d.length <= 3) return d;
    if (d.length <= 6) return `${d.slice(0, 3)} ${d.slice(3)}`;
    return `${d.slice(0, 3)} ${d.slice(3, 7)} ${d.slice(7)}`;
  };

  const handlePhoneChange = (text) => {
    const digits = text.replace(/\D/g, "").slice(0, 9);
    setPhone(digits);
  };

  const pickImage = async () => {
    if (!editing) return;
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      const base64Img = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setProfileImage(base64Img);
    }
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      crossAlert("Error", "First name and last name are required.");
      return;
    }
    if (phone.length > 0 && phone.length !== 9) {
      crossAlert("Error", "Phone number must be exactly 9 digits.");
      return;
    }

    setLoading(true);
    try {
      const fullPhone = phone ? `+94${phone}` : "";
      const result = await updateProfile({ firstName: firstName.trim(), lastName: lastName.trim(), phone: fullPhone, profileImage });
      setLocalUser(result.user);
      setEditing(false);
      crossAlert("Success", "Profile updated successfully!");
    } catch (error) {
      crossAlert("Error", error.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#135E4B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Profile</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Profile Image */}
          <View style={styles.imageContainer}>
            <TouchableOpacity onPress={pickImage} style={styles.imagePicker} disabled={!editing}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.profileImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="person" size={60} color="#ccc" />
                </View>
              )}
              {editing && (
                <View style={styles.editIconContainer}>
                  <Ionicons name="camera" size={16} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
            <Text style={styles.userName}>{user?.firstName || ""} {user?.lastName || ""}</Text>
            <Text style={styles.userEmail}>{user?.email || ""}</Text>
          </View>

          <View style={styles.formContainer}>
            {/* Email (always disabled) */}
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={user?.email || ""}
              editable={false}
            />

            {/* First Name */}
            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={[styles.input, !editing && styles.disabledInput]}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Enter first name"
              editable={editing}
            />

            {/* Last Name */}
            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={[styles.input, !editing && styles.disabledInput]}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Enter last name"
              editable={editing}
            />

            {/* Phone Number with +94 prefix */}
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.phoneRow}>
              <View style={styles.phonePrefix}>
                <Text style={styles.phonePrefixText}>+94</Text>
              </View>
              <TextInput
                style={[styles.input, styles.phoneInput, !editing && styles.disabledInput]}
                value={formatPhoneDisplay(phone)}
                onChangeText={handlePhoneChange}
                placeholder="7XX XXX XXXX"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                maxLength={12}
                editable={editing}
              />
            </View>

            {/* Buttons */}
            {!editing ? (
              <TouchableOpacity style={styles.editBtn} onPress={handleEdit}>
                <Ionicons name="create-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.editBtnText}>Edit Profile</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.saveBtnText}>Save Changes</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#CCDCDB" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#135E4B" },
  content: { padding: 20 },
  imageContainer: { alignItems: "center", marginBottom: 24 },
  imagePicker: { position: "relative" },
  profileImage: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: "#135E4B" },
  imagePlaceholder: {
    width: 120, height: 120, borderRadius: 60, backgroundColor: "#fff",
    alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: "#135E4B",
  },
  editIconContainer: {
    position: "absolute", bottom: 0, right: 0, backgroundColor: "#135E4B",
    width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: "#CCDCDB",
  },
  userName: { fontSize: 18, fontWeight: "bold", color: "#135E4B", marginTop: 10 },
  userEmail: { fontSize: 13, color: "#666", marginTop: 2 },
  formContainer: { backgroundColor: "#fff", padding: 20, borderRadius: 16, elevation: 2 },
  label: { fontSize: 13, fontWeight: "bold", color: "#135E4B", marginBottom: 6 },
  input: {
    backgroundColor: "#F0F7F4", borderRadius: 10, padding: 14, marginBottom: 16,
    borderWidth: 1, borderColor: "#E0E0E0", fontSize: 15, color: "#333",
  },
  disabledInput: { backgroundColor: "#e9ecef", color: "#6c757d" },
  phoneRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  phonePrefix: {
    backgroundColor: "#135E4B", paddingHorizontal: 14, paddingVertical: 14,
    borderTopLeftRadius: 10, borderBottomLeftRadius: 10, justifyContent: "center",
  },
  phonePrefixText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
  phoneInput: {
    flex: 1, marginBottom: 0, borderTopLeftRadius: 0, borderBottomLeftRadius: 0,
  },
  editBtn: {
    backgroundColor: "#3B82F6", paddingVertical: 14, borderRadius: 12,
    alignItems: "center", marginTop: 10, flexDirection: "row", justifyContent: "center",
  },
  editBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  saveBtn: {
    backgroundColor: "#135E4B", paddingVertical: 14, borderRadius: 12,
    alignItems: "center", marginTop: 10, flexDirection: "row", justifyContent: "center",
  },
  saveBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});

export default MyProfileScreen;
