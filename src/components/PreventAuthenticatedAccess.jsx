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
    const role = auth?.user?.role;
    const isPrivilegedUser =
      role === "superadmin" || role === "admin" || role === "host";

    if (isPrivilegedUser && viewAsPlayer) {
      if (window.location.pathname === "/auth") {
        return <Navigate to="/" replace />;
      }
      return children;
    }

    const redirectPath = isPrivilegedUser ? "/manage/events" : "/";
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export { PreventAuthenticatedAccess };
