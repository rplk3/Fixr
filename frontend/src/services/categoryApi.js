import { getToken } from "./authApi";

const BASE_URL = "http://192.168.8.102:5000/api";

export const getCategories = async () => {
  const response = await fetch(`${BASE_URL}/categories`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch categories");
  return data;
};

export const createCategory = async (name) => {
  const response = await fetch(`${BASE_URL}/categories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ name }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to create category");
  return data;
};

export const updateCategory = async (id, name) => {
  const response = await fetch(`${BASE_URL}/categories/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ name }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to update category");
  return data;
};

export const deleteCategory = async (id) => {
  const response = await fetch(`${BASE_URL}/categories/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to delete category");
  return data;
};
