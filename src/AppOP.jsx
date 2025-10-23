// ===== LIBRARIES ===== //
import { Outlet } from "react-router-dom";

// ===== COMPONENTS ===== //
import NavOP from "@/layouts/NavOP";
import Footer from "@/layouts/Footer";
import PageTitle from "@/layouts/PageTitle";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";

export default function App() {
  return (
    <SidebarProvider key="host-sidebar">
      <div className="flex min-h-screen w-full">
        {/* ===== SIDEBAR NAVIGATION ===== */}
        <NavOP />

        <div className="flex flex-col flex-1">
          {/* ===== SIDEBAR TOGGLE & PAGE TITLE ===== */}
          <div className="flex items-center gap-4 p-4 border-b sticky top-0 z-11 bg-background">
            <SidebarTrigger />
            <PageTitle />
          </div>

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
