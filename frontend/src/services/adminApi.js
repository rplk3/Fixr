import { getToken } from "./authApi";

import { API_BASE_URL as BASE_URL } from "../config/api";

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

export const getAdminBookingById = async (id) => {
  const res = await fetch(`${BASE_URL}/admin/bookings/${id}`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch booking");
  return data;
};

export const updateAdminBookingStatus = async (id, status) => {
  const res = await fetch(`${BASE_URL}/admin/bookings/${id}/status`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to update booking status");
  return data;
};

export const deleteAdminBooking = async (id) => {
  const res = await fetch(`${BASE_URL}/admin/bookings/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to delete booking");
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

export const getAdminUserById = async (id) => {
  const res = await fetch(`${BASE_URL}/admin/users/${id}`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch user");
  return data;
};

export const createAdminUser = async (userData) => {
  const res = await fetch(`${BASE_URL}/admin/users`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(userData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to create user");
  return data;
};

export const updateAdminUser = async (id, userData) => {
  const res = await fetch(`${BASE_URL}/admin/users/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(userData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to update user");
  return data;
};

export const deleteAdminUser = async (id) => {
  const res = await fetch(`${BASE_URL}/admin/users/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to delete user");
  return data;
};
