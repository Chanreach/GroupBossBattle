// ===== COMPONENTS ===== //
import Footer from "@/layouts/Footer";
import Error from "./pages/Error";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";

export default function App() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
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
