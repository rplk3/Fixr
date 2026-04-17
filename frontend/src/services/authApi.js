const BASE_URL = "http://192.168.8.106:5000/api";

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

export const registerUser = async (name, email, password) => {
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Registration failed");
  return data;
};

export const applyProvider = async () => {
  const response = await fetch(`${BASE_URL}/auth/apply-provider`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Application failed");
  // Update local user
  if (currentUser) currentUser.providerStatus = 'pending';
  return data;
};
