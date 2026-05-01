import { getToken } from "./authApi";

const BASE_URL = "http://192.168.8.102:5000/api";

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
