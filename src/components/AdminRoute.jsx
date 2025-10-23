import { useAuth } from "../context/useAuth";
import { Navigate, useLocation } from "react-router-dom";
import Loading from "../pages/Loading.jsx";

export const AdminRoute = ({ children }) => {
  const { auth, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Loading />;
  }

  if (!auth || !auth.user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (auth.user.role !== "superadmin" && auth.user.role !== "admin") {
    return <Navigate to="/error" replace />;
  }

  return children;
};

export default AdminRoute;
