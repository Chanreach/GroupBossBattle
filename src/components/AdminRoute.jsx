import { useAuth } from '../context/useAuth';
import { Navigate, useLocation } from 'react-router-dom';

export const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication
  if (isLoading) {
    return <div className="flex items-center justify-center p-4">Loading...</div>;
  }

  // Redirect to auth if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Redirect to home if not admin
  if (user.role !== 'admin') {
    return <Navigate to="/error" replace />;
  }

  return children;
};

export default AdminRoute;