import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth.jsx";
import PropTypes from "prop-types";

export const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="text-center">Loading...</div>;
  }
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  if (
    allowedRoles.length > 0 &&
    (!user.role || !allowedRoles.includes(user.role))
  ) {
    return <Navigate to="/error" replace />;
  }

  return <Outlet />;
};

ProtectedRoute.propTypes = {
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
};