import { getToken } from "./authApi";

const BASE_URL = "http://192.168.8.102:5000/api";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

// Dashboard stats
export const getAdminDashboard = async () => {
  const res = await fetch(`${BASE_URL}/admin/dashboard`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch dashboard");
  return data;
};

// Services
export const getAdminServices = async () => {
  const res = await fetch(`${BASE_URL}/admin/services`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch services");
  return data;
};

export const deleteAdminService = async (id) => {
  const res = await fetch(`${BASE_URL}/admin/services/${id}`, { method: "DELETE", headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to delete service");
  return data;
};

// Bookings
export const getAdminBookings = async () => {
  const res = await fetch(`${BASE_URL}/admin/bookings`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch bookings");
  return data;
};

// Providers
export const getAdminProviders = async () => {
  const res = await fetch(`${BASE_URL}/admin/providers`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch providers");
  return data;
};

export const updateProviderStatus = async (id, status) => {
  const res = await fetch(`${BASE_URL}/admin/providers/${id}/status`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to update provider");
  return data;
};

// Payments
export const getAdminPayments = async () => {
  const res = await fetch(`${BASE_URL}/admin/payments`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch payments");
  return data;
};

// Reviews
export const getAdminReviews = async () => {
  const res = await fetch(`${BASE_URL}/admin/reviews`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch reviews");
  return data;
};

export const deleteAdminReview = async (id) => {
  const res = await fetch(`${BASE_URL}/admin/reviews/${id}`, { method: "DELETE", headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to delete review");
  return data;
};

// Users
export const getAdminUsers = async () => {
  const res = await fetch(`${BASE_URL}/admin/users`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch users");
  return data;
};
