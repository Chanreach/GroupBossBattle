import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth.jsx";
import { isGuestUser } from "../utils/guestUtils";
import Loading from "../pages/Loading.jsx";

export const AuthenticationCheck = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Wait for authentication to load before making decisions
  if (isLoading) {
    return <Loading />;
  }

  // Check if user is either authenticated or is a guest
  const hasAuthentication = user || isGuestUser();

  // If no authentication (neither regular user nor guest), redirect to auth page with return URL
  if (!hasAuthentication) {
    const returnUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/auth?returnUrl=${returnUrl}`} replace />;
  }

  return children;
};
