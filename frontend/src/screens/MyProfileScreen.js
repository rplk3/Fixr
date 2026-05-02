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
  const [user, setUser] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const currentUser = getUser();
    if (currentUser) {
      setUser(currentUser);
      setFirstName(currentUser.firstName || "");
      setLastName(currentUser.lastName || "");
      setPhone(currentUser.phone || "");
      setProfileImage(currentUser.profileImage || "");
    }
  }, []);

  const pickImage = async () => {
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

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      crossAlert("Error", "First name and last name are required.");
      return;
    }
    
    setLoading(true);
    try {
      await updateProfile({ firstName, lastName, phone, profileImage });
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
          <View style={styles.imageContainer}>
            <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.profileImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="person" size={60} color="#ccc" />
                </View>
              )}
              <View style={styles.editIconContainer}>
                <Ionicons name="camera" size={16} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.label}>Email Address (Cannot be changed)</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={user?.email || ""}
              editable={false}
            />

            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Enter first name"
            />

            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Enter last name"
            />

            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
            />

            <TouchableOpacity 
              style={styles.saveBtn} 
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveBtnText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#CCDCDB" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#135E4B" },
  content: { padding: 20 },
  imageContainer: { alignItems: "center", marginBottom: 30 },
  imagePicker: { position: "relative" },
  profileImage: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: "#135E4B" },
  imagePlaceholder: {
    width: 120, height: 120, borderRadius: 60, backgroundColor: "#fff",
    alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: "#135E4B"
  },
  editIconContainer: {
    position: "absolute", bottom: 0, right: 0, backgroundColor: "#135E4B",
    width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: "#CCDCDB"
  },
  formContainer: { backgroundColor: "#fff", padding: 20, borderRadius: 16, elevation: 2 },
  label: { fontSize: 13, fontWeight: "bold", color: "#135E4B", marginBottom: 6 },
  input: {
    backgroundColor: "#F0F7F4", borderRadius: 10, padding: 14, marginBottom: 16,
    borderWidth: 1, borderColor: "#E0E0E0", fontSize: 15, color: "#333",
  },
  disabledInput: { backgroundColor: "#e9ecef", color: "#6c757d" },
  saveBtn: {
    backgroundColor: "#135E4B", paddingVertical: 14, borderRadius: 12,
    alignItems: "center", marginTop: 10,
  },
  saveBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});

export default MyProfileScreen;
