import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  ActivityIndicator,
  Alert,
  Platform,
  Modal,
  FlatList,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import KeyboardAwareScrollView from "../components/KeyboardAwareScrollView";
import { applyProvider, uploadImage } from "../services/authApi";
import { getCategories } from "../services/categoryApi";
import { Ionicons } from "@expo/vector-icons";

const OnboardingScreen = ({ navigation }) => {
  const [details, setDetails] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    location: "",
    image: "",
    availability: true,
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [categories, setCategories] = useState([]);
  const [catModalVisible, setCatModalVisible] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  React.useEffect(() => {
    const fetchCats = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        console.log("Failed to load categories", err);
      }
    };
    fetchCats();
  }, []);

  const handleChange = (key, value) => {
    setDetails((prev) => ({ ...prev, [key]: value }));
    setErrorMsg("");
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Please allow access to your photo library.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      const fileName = (asset.fileName || asset.uri.split("/").pop() || "").toLowerCase();

      // Validate PNG only
      if (!fileName.endsWith(".png")) {
        setErrorMsg("Only PNG images are allowed.");
        return;
      }

      // Validate under 4MB
      if (asset.fileSize && asset.fileSize > 4 * 1024 * 1024) {
        setErrorMsg("Image must be under 4 MB.");
        return;
      }

      setErrorMsg("");
      setUploading(true);
      const cloudUrl = await uploadImage(asset.uri);
      setImagePreview(asset.uri);
      handleChange("image", cloudUrl);
    } catch (err) {
      setErrorMsg("Image upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!details.title.trim() || !details.description.trim() || !details.category.trim() || !details.price.trim() || !details.location.trim()) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    if (isNaN(details.price) || Number(details.price) < 0) {
      setErrorMsg("Please enter a valid price.");
      return;
    }

    try {
      setLoading(true);
      await applyProvider(details);
      Alert.alert("Success", "Your application has been submitted! You'll be notified once approved.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <KeyboardAwareScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      enableOnAndroid={true}
      keyboardShouldPersistTaps="handled"
    >
        <View style={styles.header}>
          <Text style={styles.greeting}>Become a Provider</Text>
          <Text style={styles.subText}>Tell us what services you offer</Text>
        </View>

        <View style={styles.formContainer}>
          {errorMsg ? <Text style={styles.errorBanner}>{errorMsg}</Text> : null}

          <Text style={styles.label}>Service Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Professional Plumbing Servcies"
            placeholderTextColor="#999"
            value={details.title}
            onChangeText={(text) => handleChange("title", text)}
          />

          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe what you do..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            value={details.description}
            onChangeText={(text) => handleChange("description", text)}
          />

          <Text style={styles.label}>Category *</Text>
          <TouchableOpacity 
            style={styles.pickerButton} 
            onPress={() => setCatModalVisible(true)}
          >
            <Text style={[styles.pickerButtonText, !details.category && { color: "#999" }]}>
              {details.category || "Select a Category"}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>

          <Text style={styles.label}>Price (Rs. per hour) *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 1500"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={details.price}
            onChangeText={(text) => handleChange("price", text)}
          />

          <Text style={styles.label}>Location *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Colombo 03"
            placeholderTextColor="#999"
            value={details.location}
            onChangeText={(text) => handleChange("location", text)}
          />

          <Text style={styles.label}>Profile Image (PNG, max 4 MB)</Text>
          <TouchableOpacity
            style={styles.imagePicker}
            onPress={pickImage}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color="#135E4B" />
            ) : imagePreview || details.image ? (
              <Image
                source={{ uri: imagePreview || details.image }}
                style={styles.imagePreview}
              />
            ) : (
              <View style={styles.imagePickerPlaceholder}>
                <Ionicons name="cloud-upload-outline" size={32} color="#135E4B" />
                <Text style={styles.imagePickerText}>Tap to upload PNG</Text>
              </View>
            )}
          </TouchableOpacity>
          {details.image ? (
            <TouchableOpacity
              onPress={() => { handleChange("image", ""); setImagePreview(null); }}
              style={styles.removeImageBtn}
            >
              <Ionicons name="close-circle" size={18} color="#EF4444" />
              <Text style={styles.removeImageText}>Remove Image</Text>
            </TouchableOpacity>
          ) : null}

          <View style={styles.switchContainer}>
            <Text style={styles.labelSwitch}>Currently Available for Work</Text>
            <Switch
              trackColor={{ false: "#ccc", true: "#A8D5BA" }}
              thumbColor={details.availability ? "#135E4B" : "#f4f3f4"}
              onValueChange={(val) => handleChange("availability", val)}
              value={details.availability}
            />
          </View>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Application</Text>
            )}
          </TouchableOpacity>
        </View>
    </KeyboardAwareScrollView>
      {/* Category Modal */}
      <Modal visible={catModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Category</Text>
            {categories.length === 0 ? (
              <Text style={{ textAlign: "center", color: "#666", padding: 20 }}>No categories available</Text>
            ) : (
              <FlatList
                data={categories}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => {
                      handleChange("category", item.name);
                      setCatModalVisible(false);
                    }}
                  >
                    <Text style={styles.modalItemText}>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
            )}
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setCatModalVisible(false)}>
              <Text style={styles.modalCloseBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#CCDCDB",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#135E4B",
  },
  subText: {
    fontSize: 15,
    color: "#4CB572",
    marginTop: 6,
  },
  formContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  errorBanner: {
    backgroundColor: "#F8D7DA",
    color: "#721C24",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    textAlign: "center",
    fontWeight: "bold",
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#135E4B",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#F0F7F4",
    borderRadius: 10,
    padding: 14,
    marginBottom: 15,
    color: "#000",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 5,
  },
  labelSwitch: {
    fontSize: 14,
    fontWeight: "600",
    color: "#135E4B",
  },
  submitButton: {
    backgroundColor: "#135E4B",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  pickerButton: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: "#F0F7F4", borderRadius: 10, padding: 14, marginBottom: 15,
    borderWidth: 1, borderColor: "#E0E0E0",
  },
  pickerButtonText: { fontSize: 14, color: "#000" },
  imagePicker: {
    backgroundColor: "#F0F7F4",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderStyle: "dashed",
    marginBottom: 10,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 140,
  },
  imagePickerPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
  },
  imagePickerText: {
    color: "#135E4B",
    marginTop: 8,
    fontSize: 14,
    fontWeight: "500",
  },
  imagePreview: {
    width: "100%",
    height: 180,
    borderRadius: 12,
  },
  removeImageBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    marginBottom: 15,
  },
  removeImageText: {
    color: "#EF4444",
    fontSize: 13,
    marginLeft: 4,
    fontWeight: "500",
  },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: "50%" },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: "#135E4B", marginBottom: 15, textAlign: "center" },
  modalItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: "#F0F0F0" },
  modalItemText: { fontSize: 16, color: "#333", textAlign: "center" },
  modalCloseBtn: { marginTop: 15, paddingVertical: 12, backgroundColor: "#E0E0E0", borderRadius: 10, alignItems: "center" },
  modalCloseBtnText: { fontWeight: "bold", color: "#333" },
});
