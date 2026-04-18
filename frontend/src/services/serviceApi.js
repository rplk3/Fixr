const BASE_URL = "http://192.168.8.106:5000/api";

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
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify(serviceData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create service");
  }

  return data;
};