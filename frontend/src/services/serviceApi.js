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