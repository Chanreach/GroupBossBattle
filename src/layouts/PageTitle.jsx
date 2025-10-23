// ===== LIBRARIES ===== //
import { useLocation } from "react-router-dom";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/useTheme";

// ===== PAGE TITLE COMPONENT ===== //
export function PageTitle({
  className = "text-lg font-semibold text-foreground",
}) {
  const location = useLocation();
  const { colorScheme, toggleColorScheme } = useTheme();

  // Function to get page title from pathname
  const getPageTitle = (pathname) => {
    const routes = {
      "/": "Home",
      "/landing": "Landing",
      "/about": "About",
      "/badges": "Badges",
      "/leaderboard": "Leaderboard",
      "/qr": "QR",
      "/event-bosses": "Event Bosses",
      "/boss-preview": "Boss Preview",
      "/boss-battle": "Boss Battle",
      "/player/join": "Joining Battle",
      "/boss-preview/join": "Joining Battle",
      "/profile": "Profile",
      "/authentication": "Authentication",
    };

    // Handle nested routes
    if (pathname.includes("/boss-battle")) return "Boss Battle";
    if (pathname.includes("/authentication")) return "Authentication";
    if (pathname.includes("/admin")) return "Admin Panel";
    if (pathname.includes("/manage/events")) return "Events";
    if (pathname.includes("/manage/events/assign_boss")) return "Events";
    if (pathname.includes("/manage/events/:eventId/assign-boss")) return "Events";
    if (pathname.includes("/manage/events/player_badges")) return "Bosses";
    if (pathname.includes("/manage/events/player_badges/edit")) return "Bosses";
    if (pathname.includes("/manage/events/leaderboard")) return "Bosses";
    if (pathname.includes("/manage/bosses/view")) return "Bosses";
    if (pathname.includes("/manage/bosses/create")) return "Bosses";
    if (pathname.includes("/manage/bosses/edit")) return "Bosses";
    if (pathname.includes("/manage/questionbank")) return "Question Bank";
    if (pathname.includes("/manage/categories")) return "Question Bank";
    if (pathname.includes("/manage/questions")) return "Question Bank";
    if (pathname.includes("/manage/profile")) return "Profile";
    if (pathname.includes("/manage")) return "Host Panel";
    if (pathname.includes("/leaderboard")) return "Leaderboard";

    return routes[pathname] || "UniRAID";
  };

  return (
    <div className="flex justify-content-between items-center gap-2 w-full">

      {/* PAGE TITLE */}
      <h1 className={className}>{getPageTitle(location.pathname)}</h1>

      {/* THEME TOGGLE BUTTON */}
      <div className="ml-auto flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleColorScheme}
          title={`Switch to ${colorScheme === "light" ? "dark" : "light"} mode`}
          aria-label={`Switch to ${
            colorScheme === "light" ? "dark" : "light"
          } mode`}
        >
          {colorScheme === "light" ? (
            <Moon className="!h-5 !w-5" />
          ) : (
            <Sun className="!h-5 !w-5" />
          )}
        </Button>
      </div>

    </div>
  );
}

export default PageTitle;
