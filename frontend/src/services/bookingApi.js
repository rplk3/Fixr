import { getToken } from "./authApi";

import { API_BASE_URL as BASE_URL } from "../config/api";

export const createBooking = async (bookingData) => {
  const response = await fetch(`${BASE_URL}/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(bookingData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to create booking");
  return data;
};

export const getMyBookings = async () => {
  const response = await fetch(`${BASE_URL}/bookings/my`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch bookings");
  return data;
};

export const getProviderBookings = async () => {
  const response = await fetch(`${BASE_URL}/bookings/provider`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch bookings");
  return data;
};

export const updateBookingStatus = async (id, status) => {
  const response = await fetch(`${BASE_URL}/bookings/${id}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ status }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to update booking");
  return data;
};

export const createPayment = async (paymentData) => {
  const response = await fetch(`${BASE_URL}/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(paymentData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Payment failed");
  return data;
};
