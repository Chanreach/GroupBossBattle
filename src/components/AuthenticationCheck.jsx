import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth.jsx";
import Loading from "../pages/Loading.jsx";

export const AuthenticationCheck = ({ children }) => {
  const { auth, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Loading />;
  }

  if (!auth) {
    const returnUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/auth?returnUrl=${returnUrl}`} replace />;
  }

  return children;
};
