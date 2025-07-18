// ===== LIBRARIES ===== //
import { Outlet, useNavigate, useLocation } from "react-router-dom";

// ===== COMPONENTS ===== //
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import Footer from "@/layouts/Footer";
import NavLanding from "@/layouts/NavLanding";
import { Toaster } from "@/components/ui/sonner";

// ===== STYLES ===== //
import "@/index.css";

const AppLanding = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        {/* ===== SIDEBAR NAVIGATION ===== */}
        <NavLanding />

        {/* ===== MAIN CONTENT ===== */}
        <div className="flex flex-1 flex-col">
          {/* Sidebar Trigger for mobile */}
          <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
            <SidebarTrigger className="-ml-1" />
          </header>

          <main className="flex-1">
            {/* Always render outlet content for all routes */}
            <Outlet />
          </main>

          {/* ===== FOOTER ===== */}
          <Footer />
        </div>
      </div>
      <Toaster position="top-center" />
    </SidebarProvider>
  );
};

export default AppLanding;
