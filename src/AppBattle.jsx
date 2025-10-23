// ===== LIBRARIES ===== //
import { Outlet } from "react-router-dom";

// ===== COMPONENTS ===== //
import { Toaster } from "@/components/ui/sonner";

export default function AppBattle() {
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
