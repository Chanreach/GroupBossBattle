import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import { apiClient } from "../api/apiClient";

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = ({ user, token, type = "user" }) => {
    const authData = { user, token, type };
    setAuth(authData);
    localStorage.setItem("auth", JSON.stringify(authData));
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  };

  const logout = async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setAuth(null);
      localStorage.removeItem("auth");
      delete apiClient.defaults.headers.common["Authorization"];
    }
  };

  useEffect(() => {
    const fetchAuth = async () => {
      const storedAuth = JSON.parse(localStorage.getItem("auth"));
      if (!storedAuth) {
        setIsLoading(false);
        return;
      }

      const { token } = storedAuth;
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      try {
        const response = await apiClient.get("/auth/me");
        setAuth({ user: response.data.user, token, type: response.data.type });
      } catch (error) {
        console.error("Session invalid:", error);
        localStorage.removeItem("auth");
        setAuth(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuth();
  }, []);

  useEffect(() => {
    if (!auth) return;

    const interval = setInterval(async () => {
      try {
        await apiClient.get("/auth/me");
      } catch (error) {
        console.warn("Auth check failed:", error);
        if (error.response?.status === 401) {
          console.warn("Session expired. Logging out...");
          logout();
        }
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [auth]);

  return (
    <AuthContext.Provider
      value={{
        auth,
        setAuth,
        login,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
