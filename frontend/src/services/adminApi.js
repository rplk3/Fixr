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

export const updateAdminService = async (id, payload) => {
  const res = await fetch(`${BASE_URL}/admin/services/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to update service");
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

export const deleteAdminProvider = async (id) => {
  const res = await fetch(`${BASE_URL}/admin/providers/${id}`, { method: "DELETE", headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to delete provider");
  return data;
};

// Payments
export const getAdminPayments = async () => {
  const res = await fetch(`${BASE_URL}/admin/payments`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch payments");
  return data;
};

export const getAdminPaymentById = async (id) => {
  const res = await fetch(`${BASE_URL}/admin/payments/${id}`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch payment");
  return data;
};

export const updateAdminPaymentStatus = async (id, status, notes) => {
  const res = await fetch(`${BASE_URL}/admin/payments/${id}/status`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ status, notes }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to update payment");
  return data;
};

export const deleteAdminPayment = async (id) => {
  const res = await fetch(`${BASE_URL}/admin/payments/${id}`, { method: "DELETE", headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to delete payment");
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
