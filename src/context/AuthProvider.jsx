import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import { apiClient } from "../api";
import {
  clearGuestData,
  getGuestUser,
  getGuestToken,
} from "../utils/guestUtils";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = async () => {
    try {
      // Call logout endpoint to clear refresh token cookie
      await apiClient.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
      // Continue with client-side logout even if server call fails
    } finally {
      // Clear client-side data
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      delete apiClient.defaults.headers.common["Authorization"];

      // Clear guest data as well
      clearGuestData();
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const storedToken = localStorage.getItem("accessToken");
      const storedUser = localStorage.getItem("user");

      // Check for regular user first
      if (storedToken && storedUser) {
        try {
          // Set token in Axios headers
          apiClient.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${storedToken}`;

          const response = await apiClient.get("/auth/me");
          setUser({ ...response.data, accessToken: storedToken });
          setIsLoading(false);
          return;
        } catch (error) {
          console.error("Failed to fetch user:", error);
          localStorage.removeItem("user");
          localStorage.removeItem("accessToken");
          setUser(null);
        }
      }

      // Check for guest user
      const guestUser = getGuestUser();
      const guestToken = getGuestToken();

      if (guestUser && guestToken) {
        // Set guest user in context
        setUser(guestUser);
        // Set authorization header for guest requests
        apiClient.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${guestToken}`;
      }

      setIsLoading(false);
    };

    fetchUser();
  }, []);

  const login = ({ accessToken, user }) => {
    const userData = {
      ...user,
      accessToken,
    };
    setUser(userData);
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("user", JSON.stringify(user));
    apiClient.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${accessToken}`;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        logout,
        isLoading,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
