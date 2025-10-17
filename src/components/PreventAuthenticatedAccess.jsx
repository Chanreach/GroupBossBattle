import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth.jsx";
import Loading from "../pages/Loading.jsx";

const PreventAuthenticatedAccess = ({ children }) => {
  const { auth, isLoading } = useAuth();

  if (isLoading) {
    return <Loading />;
  }

  if (auth) {
    const viewAsPlayer = localStorage.getItem("viewAsPlayer");
    const isPrivileged =
      auth.role === "superadmin" ||
      auth.role === "admin" ||
      auth.role === "host";

    if (isPrivileged && viewAsPlayer) {
      if (window.location.pathname === "/auth") {
        return <Navigate to="/" replace />;
      }
      return children;
    }

    const redirectPath = isPrivileged ? "/host/events/view" : "/";
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export { PreventAuthenticatedAccess };
