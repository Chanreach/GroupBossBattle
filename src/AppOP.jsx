// Master for OP (Host and Admin)
// ===== LIBRARIES ===== //
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";

// ===== LAYOUTS ===== //
import NavOP from "@/layouts/NavOP";
import Footer from "@/layouts/Footer";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

// ===== COMPONENTS ===== //
import { MessageDisplay } from "./components/MessageDisplay";
import PageTitle from "@/layouts/PageTitle";
import { Toaster } from "@/components/ui/sonner";
// import { useAuth } from "./context/useAuth";
// import { setupInterceptors } from "./api";

export default function App() {
  const navigate = useNavigate();
  
  // ===== AUTHENTICATION INTERCEPTORS ===== //
  // const auth = useAuth();
  // useEffect(() => {
  //   setupInterceptors(auth, navigate);
  // }, [auth, navigate]);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        {/* ===== SIDEBAR NAVIGATION ===== */}
        <NavOP />

        <div className="flex flex-col flex-1">
          {/* ===== SIDEBAR TOGGLE & PAGE TITLE ===== */}
          <div className="flex items-center gap-4 p-4 border-b sticky top-0 z-11 bg-background">
            <SidebarTrigger />
            <PageTitle />
          </div>

          {/* ===== MESSAGE DISPLAY ===== */}
          <MessageDisplay />

          {/* ===== PAGE CONTENT (Outlet for route rendering) ===== */}
          <main className="flex-1 w-full overflow-x-hidden">
            <Outlet />
          </main>

          {/* ===== FOOTER ===== */}
          <Footer />
        </div>
      </div>
      <Toaster position="top-center" />
    </SidebarProvider>
  );
}