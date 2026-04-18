const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

export const apiRequest = async (endpoint, options = {}) => {
  const config = {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  };

  if (options.body && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_URL}${endpoint}`, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: "Request failed"
    }));
    throw new Error(errorData.message || "Request failed");
  }

  return response.json();
};

export const getAssetUrl = (relativePath = "") =>
  relativePath ? `${SERVER_URL}${relativePath}` : "";
