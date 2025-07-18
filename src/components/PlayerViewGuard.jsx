import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth.jsx";

/**
 * Component that handles the redirect logic for host/admin users
 * who want to view the player interface
 */
export const PlayerViewGuard = ({ children }) => {
  const { user, isLoading } = useAuth();
  const [localStorageChecked, setLocalStorageChecked] = useState(false);

  useEffect(() => {
    // Small delay to ensure localStorage is properly read
    const timeoutId = setTimeout(() => {
      // If user is viewing as player, set a timeout to clear the flag after 30 minutes
      const viewAsPlayer = localStorage.getItem("viewAsPlayer");
      if (viewAsPlayer) {
        // Set timestamp when flag was set
        const timestamp = localStorage.getItem("viewAsPlayerTimestamp");
        if (!timestamp) {
          localStorage.setItem("viewAsPlayerTimestamp", Date.now().toString());
        } else {
          // Check if it's been more than 30 minutes (1800000 ms)
          const now = Date.now();
          const flagTime = parseInt(timestamp, 10);
          if (now - flagTime > 1800000) {
            localStorage.removeItem("viewAsPlayer");
            localStorage.removeItem("viewAsPlayerTimestamp");
          }
        }
      }
      setLocalStorageChecked(true);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, []);

  // Wait for authentication to load and localStorage to be checked
  if (isLoading || !localStorageChecked) {
    return <div>Loading...</div>;
  }

  // If user is host/admin and hasn't explicitly chosen to view as player,
  // redirect to management panel
  if (user && (user.role === "admin" || user.role === "host")) {
    const viewAsPlayer = localStorage.getItem("viewAsPlayer");

    // If they haven't explicitly chosen to view as player, redirect to management
    if (!viewAsPlayer) {
      return <Navigate to="/host/events/view" replace />;
    }
  }

  return children;
};
