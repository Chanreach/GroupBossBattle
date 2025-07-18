import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth.jsx";
import { isGuestUser, getGuestToken } from "../utils/guestUtils.js";

/**
 * Component that prevents authenticated users (both regular users and guests)
 * from accessing the authentication page
 */
const PreventAuthenticatedAccess = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Show loading while checking authentication state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated as a regular user
  if (isAuthenticated && user) {
    const redirectPath = user.role === 'admin' ? '/host/events/view' : '/';
    return <Navigate to={redirectPath} replace />;
  }

  // Check if user is authenticated as a guest
  const hasGuestAuth = isGuestUser() && getGuestToken();
  if (hasGuestAuth) {
    return <Navigate to="/player/home" replace />;
  }

  // User is not authenticated, allow access to auth page
  return children;
};

export default PreventAuthenticatedAccess;
