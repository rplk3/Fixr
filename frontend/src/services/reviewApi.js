import { getToken } from "./authApi";

const BASE_URL = "http://192.168.8.102:5000/api";

export const createReview = async (reviewData) => {
  const response = await fetch(`${BASE_URL}/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(reviewData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to submit review");
  return data;
};

export const getServiceReviews = async (serviceId) => {
  const response = await fetch(`${BASE_URL}/reviews/service/${serviceId}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch reviews");
  return data;
};
