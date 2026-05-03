import { getToken } from "./authApi";

import { API_BASE_URL as BASE_URL } from "../config/api";

export const getAllServices = async () => {
  const response = await fetch(`${BASE_URL}/services`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch services");
  }

  return data;
};

export const createService = async (serviceData) => {
  const response = await fetch(`${BASE_URL}/services`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(serviceData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create service");
  }

  return data;
};

export const getMyServices = async () => {
  const response = await fetch(`${BASE_URL}/services/my`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch your services");
  return data;
};

export const updateService = async (id, serviceData) => {
  const response = await fetch(`${BASE_URL}/services/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(serviceData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to update service");
  return data;
};

export const deleteService = async (id) => {
  const response = await fetch(`${BASE_URL}/services/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to delete service");
  return data;
};