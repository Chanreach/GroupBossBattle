// ===== LIBRARIES ===== //
import { useCallback, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

// ===== COMPONENTS ===== //
import {
  Calendar,
  Sword,
  BookOpen,
  Home,
  Moon,
  Sun,
  User,
  LogOut,
  BarChart3,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

// ===== HOOKS ===== //
import { useTheme } from "@/context/useTheme";
import { useAuth } from "@/context/useAuth";

// ===== NAVIGATION DATA ===== //
const mainNavItems = [
  {
    title: "Events",
    url: "/manage/events",
    icon: Calendar,
  },
  {
    title: "Bosses",
    url: "/manage/bosses",
    icon: Sword,
  },
  {
    title: "Question Bank",
    url: "/manage/questionbank/categories",
    icon: BookOpen,
  },
  {
    title: "All Time Leaderboard",
    url: "/manage/all_leaderboard",
    icon: BarChart3,
  },
  {
    title: "User Management",
    url: "/manage/users",
    icon: User,
  },
];

// Mock host user data
const mockHostUser = {
  name: "Host",
  email: "host@gmail.com",
  avatar: null,
};

const NavOP = (props) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { colorScheme, toggleColorScheme } = useTheme();
  const { auth, logout } = useAuth();

  // Use authenticated user or fallback to mock user
  const user = auth.user || mockHostUser;

  // Filter navigation items based on user role
  const filteredNavItems = mainNavItems.filter((item) => {
    // Only show User Management for admin users
    if (item.title === "User Management") {
      return user.role === "superadmin" || user.role === "admin";
    }
    return true;
  });

  const handleLogout = useCallback(async () => {
    try {
      logout();
      localStorage.removeItem("viewAsPlayer");
      await new Promise((resolve) => setTimeout(resolve, 100));
      navigate("/auth", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
      navigate("/auth", { replace: true });
    }
  }, [logout, navigate]);

  // Clear any mobile overlay state when component mounts
  useEffect(() => {
    // Force close any mobile overlays that might be stuck
    const sheets = document.querySelectorAll(
      '[data-state="open"][role="dialog"]'
    );
    sheets.forEach((sheet) => {
      const closeButton = sheet.querySelector('button[aria-label="Close"]');
      if (closeButton) {
        closeButton.click();
      }
    });

    // Clear any overlay backgrounds
    const overlays = document.querySelectorAll("[data-radix-collection-item]");
    overlays.forEach((overlay) => {
      if (overlay.style.display === "block") {
        overlay.style.display = "none";
      }
    });

    // Remove any stuck overlay styles
    document.body.style.pointerEvents = "";
    document.body.style.overflow = "";

    // Clear any radix-ui portal overlays
    const portals = document.querySelectorAll("[data-radix-portal]");
    portals.forEach((portal) => {
      const dialogs = portal.querySelectorAll('[role="dialog"]');
      dialogs.forEach((dialog) => {
        if (dialog.getAttribute("data-state") === "open") {
          dialog.style.display = "none";
        }
      });
    });
  }, []);

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* ===== SIDEBAR HEADER ===== */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              onClick={() => navigate("/manage/events")}
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-sidebar-primary-foreground">
                <img
                  src="https://em-content.zobj.net/source/microsoft-3D-fluent/406/crossed-swords_2694-fe0f.png"
                  alt="UniRAID"
                  className="size-6 object-contain"
                />
              </div>
              {/* LOGO */}
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">UniRAID</span>
                <span className="truncate text-xs text-muted-foreground">
                  Manage Panel
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      location.pathname === item.url ||
                      location.pathname.startsWith(
                        item.url.replace("/view", "")
                      )
                    }
                  >
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {/* Dark Mode Toggle */}
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={toggleColorScheme}
              tooltip={`Switch to ${
                colorScheme === "light" ? "dark" : "light"
              } mode`}
            >
              {colorScheme === "light" ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
              <span>
                {colorScheme === "light" ? "Dark Mode" : "Light Mode"}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <Separator />

        {/* User Menu */}
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage
                      src={user?.profileImage}
                      alt={user?.username || user?.name || "User"}
                      onError={(e) => {
                        console.log(
                          "NavOP avatar image failed to load:",
                          e.target.src
                        );
                        e.target.style.display = "none";
                      }}
                    />
                    <AvatarFallback className="rounded-lg bg-gradient-to-br from-orange-600 to-red-600 text-white">
                      {(user?.username || user?.name || "H")
                        .charAt(0)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {user?.username || user?.name || "User"}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user?.email || ""}
                    </span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage
                        src={user?.profileImage}
                        alt={user?.username || "User"}
                        onError={(e) => (e.target.style.display = "none")}
                      />
                      <AvatarFallback className="rounded-lg bg-gradient-to-br from-orange-600 to-red-600 text-white">
                        {(user?.username || "H").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {user?.username || "User"}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {user?.email || ""}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {!auth ? (
                  <>
                    <DropdownMenuItem onClick={() => navigate("/auth")}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Login</span>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem
                      onClick={() => navigate("/manage/profile")}
                    >
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        localStorage.setItem("viewAsPlayer", "true");
                        navigate("/");
                      }}
                    >
                      <Home className="mr-2 h-4 w-4" />
                      <span>View as Player</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-red-600 focus:text-red-600"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};

export default NavOP;
