import { createContext, useEffect, useState } from "react";
import { apiRequest } from "../api/client.js";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = async () => {
    try {
      const response = await apiRequest("/auth/me");
      setAdmin(response.isAuthenticated ? response.admin : null);
    } catch (_error) {
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  const login = async (email, password) => {
    const response = await apiRequest("/auth/login", {
      method: "POST",
      body: { email, password }
    });
    setAdmin(response.admin);
    return response;
  };

  const logout = async () => {
    await apiRequest("/auth/logout", { method: "POST" });
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
};
