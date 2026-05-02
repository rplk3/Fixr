import { getToken } from "./authApi";

const BASE_URL = "http://192.168.8.102:5000/api";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

export const createComplaint = async (payload) => {
  const res = await fetch(`${BASE_URL}/complaints`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to submit complaint");
  return data;
};

export const getMyComplaints = async () => {
  const res = await fetch(`${BASE_URL}/complaints/my`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch complaints");
  return data;
};

export const getAdminComplaints = async () => {
  const res = await fetch(`${BASE_URL}/complaints`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch complaints");
  return data;
};

export const getAdminComplaintById = async (id) => {
  const res = await fetch(`${BASE_URL}/complaints/${id}`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch complaint");
  return data;
};

export const updateComplaintStatus = async (id, status) => {
  const res = await fetch(`${BASE_URL}/complaints/${id}/status`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to update status");
  return data;
};

export const deleteAdminComplaint = async (id) => {
  const res = await fetch(`${BASE_URL}/complaints/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to delete complaint");
  return data;
};
