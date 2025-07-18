// Master for Player
// ===== LIBRARIES ===== //
import { Outlet } from "react-router-dom";

// ===== LAYOUTS ===== //
import Nav from "@/layouts/Nav";
import Footer from "@/layouts/Footer";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

// ===== COMPONENTS ===== //
import { MessageDisplay } from "./components/MessageDisplay";
import PageTitle from "@/layouts/PageTitle";
import { Toaster } from "@/components/ui/sonner";

export default function App() {
  return (
    <SidebarProvider key="player-sidebar">
      <div className="flex min-h-screen w-full">
        {/* ===== SIDEBAR NAVIGATION ===== */}
        <Nav />

        <div className="flex flex-col flex-1">
          {/* ===== SIDEBAR TOGGLE & MESSAGE DISPLAY ===== */}
          <div className="flex items-center gap-4 p-4 border-b sticky top-0 z-11 bg-background">
            <SidebarTrigger />
            <PageTitle />
            {/* <MessageDisplay /> */}
          </div>

          {/* ===== PAGE CONTENT (Outlet for route rendering) ===== */}
          {/* <main className="flex-1 w-full"> */}
          {/* <main className="flex-1 w-[100vw] overflow-x-hidden"> */}
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
