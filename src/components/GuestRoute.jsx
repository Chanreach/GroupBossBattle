import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth.jsx";

export const GuestRoute = ({ children }) => {
    const { user } = useAuth();

    return !user ? children : <Navigate to="/" />;
}