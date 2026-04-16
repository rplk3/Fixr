const BASE_URL = "http://192.168.8.106:5000/api";

export const loginUser = async (email, password) => {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Login failed");
  }

  return data; // { token, user: { id, email, role } }
};
