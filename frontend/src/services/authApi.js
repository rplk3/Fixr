import { API_BASE_URL as BASE_URL, IMAGE_BASE_URL } from "../config/api";
import { Platform } from "react-native";

// In-memory token storage
let authToken = null;
let currentUser = null;

export const setToken = (token) => { authToken = token; };
export const getToken = () => authToken;
export const setUser = (user) => { currentUser = user; };
export const getUser = () => currentUser;

export const loginUser = async (email, password) => {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Login failed");
  // Store token and user
  authToken = data.token;
  currentUser = data.user;
  return data;
};

export const registerUser = async (firstName, lastName, email, phone, password) => {
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ firstName, lastName, email, phone, password }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Registration failed");
  return data;
};

export const applyProvider = async (details) => {
  const response = await fetch(`${BASE_URL}/auth/apply-provider`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(details),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Application failed");
  // Update local user
  if (currentUser) currentUser.providerStatus = 'pending';
  return data;
};

export const updateProfile = async (profileData) => {
  const response = await fetch(`${BASE_URL}/auth/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(profileData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to update profile");
  currentUser = data.user;
  return data;
};

export const uploadImage = async (imageUri) => {
  const formData = new FormData();
  const filename = imageUri.split('/').pop() || 'image.jpg';
  const match = /\.(\w+)$/.exec(filename);
  let ext = match ? match[1].toLowerCase() : 'jpeg';
  if (ext === 'jpg') ext = 'jpeg';
  const type = `image/${ext}`;

  if (Platform.OS === 'web') {
    const r = await fetch(imageUri);
    const blob = await r.blob();
    formData.append('image', blob, filename);
  } else {
    formData.append('image', { uri: imageUri, name: filename, type });
  }

  const res = await fetch(`${BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const text = await res.text();
  if (!res.ok) {
    let errMsg = "Image upload failed";
    try {
      const err = JSON.parse(text);
      errMsg = err.message || errMsg;
    } catch {
      errMsg = `Upload error: ${res.status} - ${text.slice(0, 50)}`;
    }
    throw new Error(errMsg);
  }
  return text;
};
