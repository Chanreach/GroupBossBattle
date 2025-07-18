// Master to show Error 404 Page
// ===== LIBRARIES ===== //
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";

// ===== LAYOUTS ===== //
// import Nav from "@/layouts/Nav";
import Footer from "@/layouts/Footer";
import Error from "./pages/Error";
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
        {/* <Nav /> */}

        <div className="flex flex-col flex-1">
          {/* ===== SIDEBAR TOGGLE & MESSAGE DISPLAY ===== */}
          <div className="flex items-center gap-4 p-4 border-b">

          </div>

          {/* ===== PAGE CONTENT (Always show Error) ===== */}
          <main className="flex-1 w-full">
            <Error />
          </main>

          {/* ===== FOOTER ===== */}
          <Footer />
        </div>
      </div>
      <Toaster position="top-center" />
    </SidebarProvider>
  );
}
