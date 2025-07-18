import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth.jsx";
import { isGuestUser, getGuestToken } from "../utils/guestUtils";

export const BossPreviewAuthGuard = ({ children }) => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Don't do anything while auth is still loading
    if (isLoading) {
      return;
    }

    // Check if user is either authenticated or is a guest with valid token
    const hasValidAuthentication = user || (isGuestUser() && getGuestToken());

    // If no authentication, redirect to /auth with return URL
    if (!hasValidAuthentication) {
      const returnUrl = `${location.pathname}${location.search}`;
      navigate(`/auth?returnUrl=${encodeURIComponent(returnUrl)}`, { replace: true });
      return;
    }
  }, [user, isLoading, navigate, location]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Check if user is authenticated
  const hasValidAuthentication = user || (isGuestUser() && getGuestToken());

  // Render children only if authenticated
  return hasValidAuthentication ? children : null;
};
