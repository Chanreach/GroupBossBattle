import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth.jsx";
import Loading from "../pages/Loading.jsx";

export const PlayerViewGuard = ({ children }) => {
  const { auth, isLoading } = useAuth();

  if (isLoading) {
    return <Loading />;
  }

  if (!auth) {
    return <Navigate to="/auth" replace />;
  }
  
  const role = auth?.user?.role;
  const isPrivilegedUser =
    auth && (role === "superadmin" || role === "admin" || role === "host");

  if (isPrivilegedUser) {
    const viewAsPlayer = localStorage.getItem("viewAsPlayer");
    if (!viewAsPlayer) {
      return <Navigate to="/manage/events" replace />;
    }
  }

  return children;
};
