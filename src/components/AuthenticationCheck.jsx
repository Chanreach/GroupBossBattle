import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth.jsx";
import { isGuestUser } from "../utils/guestUtils";
import Loading from "../pages/Loading.jsx";

export const AuthenticationCheck = ({ children }) => {
  const { user, isLoading } = useAuth();

  // Wait for authentication to load before making decisions
  if (isLoading) {
    return <Loading />;
  }

  // Check if user is either authenticated or is a guest
  const hasAuthentication = user || isGuestUser();

  // If no authentication (neither regular user nor guest), redirect to landing page
  return hasAuthentication ? children : <Navigate to="/landing" replace />;
};
