const BASE_URL = "http://192.168.56.1:5000/api";
const TOKEN = "PASTE_YOUR_JWT_TOKEN_HERE";

export const getAllServices = async () => {
  const response = await fetch(`${BASE_URL}/services`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch services");
  }

  return data;
};