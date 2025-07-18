// Battle App Layout - No Sidebar/Navigation for immersive game experience
// ===== LIBRARIES ===== //
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";

// ===== COMPONENTS ===== //
import { MessageDisplay } from "./components/MessageDisplay";
import { Toaster } from "@/components/ui/sonner";
// import { useAuth } from "./context/useAuth";
// import { setupInterceptors } from "./api";

export default function AppBattle() {
  const navigate = useNavigate();
  
  // ===== AUTHENTICATION INTERCEPTORS ===== //
  // const auth = useAuth();
  // useEffect(() => {
  //   setupInterceptors(auth, navigate);
  // }, [auth, navigate]);

  return (
    <div className="min-h-screen w-full bg-background">
      {/* ===== FULL SCREEN BATTLE CONTENT ===== */}
      <main className="min-h-screen w-full">
        <Outlet />
      </main>
      
      {/* ===== TOASTER FOR NOTIFICATIONS ===== */}
      <Toaster position="top-center" />
    </div>
  );
}
