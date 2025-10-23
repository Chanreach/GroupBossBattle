// ===== LIBRARIES ===== //
import { useMemo, useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// ===== COMPONENTS ===== //
import {
  Sun,
  Moon,
  Flame,
  Badge,
  House,
  BookA,
  LogOut,
  User,
  Settings,
  Trophy,
  QrCode,
  Users,
  BarChart3,
  Shield,
  PencilRuler,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AlertLogout from "./AlertLogout";

// ===== HOOKS ===== //
import { useTheme } from "@/context/useTheme";
import { useAuth } from "@/context/useAuth";

export function NavSidebar({ ...props }) {
  const { colorScheme, toggleColorScheme } = useTheme();
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  // ===== AUTHENTICATION HANDLERS ===== //
  const handleLogout = useCallback(async () => {
    try {
      logout();
      localStorage.removeItem("viewAsPlayer");
      navigate("/auth");
    } catch (error) {
      console.error("Logout failed:", error);
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

  // ===== NAVIGATION DATA ===== //
  const navigationItems = useMemo(
    () => [
      {
        title: "Main",
        items: [
          {
            title: "Home",
            url: "/",
            icon: House,
            isActive: location.pathname === "/",
          },
          {
            title: "Badges",
            url: "/badges",
            icon: Badge,
            isActive: location.pathname === "/badges",
          },
          {
            title: "Leaderboard",
            url: "/leaderboard",
            icon: Trophy,
            isActive: location.pathname === "/leaderboard",
          },
          {
            title: "QR",
            url: "/qr",
            icon: QrCode,
            isActive: location.pathname === "/qr",
          },
        ],
      },
      {
        title: "Information",
        items: [
          {
            title: "About",
            url: "/about",
            icon: BookA,
            isActive: location.pathname === "/about",
          },
        ],
      },
    ],
    [location.pathname]
  );

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* ===== SIDEBAR HEADER ===== */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              onClick={() => navigate("/")}
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
                  Group Boss Battle
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* ===== SIDEBAR CONTENT ===== */}
      <SidebarContent>
        {navigationItems.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={item.isActive}
                      tooltip={item.title}
                    >
                      <button
                        onClick={() => navigate(item.url)}
                        className="flex items-center gap-2 w-full"
                      >
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* ===== SIDEBAR FOOTER ===== */}
      <SidebarFooter>
        {/* Theme Toggle */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={toggleColorScheme}
              tooltip={`Switch to ${
                colorScheme === "light" ? "dark" : "light"
              } mode`}
            >
              {colorScheme === "light" ? (
                <Moon className="size-4" />
              ) : (
                <Sun className="size-4" />
              )}
              <span>
                {colorScheme === "light" ? "Dark Mode" : "Light Mode"}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <Separator />

        {/* User Menu - show when user is authenticated (including guests) */}
        {auth && (
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
                        src={auth.user?.profileImage}
                        alt={auth.user?.username || "User"}
                        onError={(e) => {
                          console.log(
                            "Avatar image failed to load:",
                            e.target.src
                          );
                          e.target.style.display = "none";
                        }}
                      />
                      <AvatarFallback className="rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                        {(auth.user?.username || "BF").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {auth.user?.username || "User"}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {auth.user?.email || ""}
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
                          src={auth.user?.profileImage}
                          alt={auth.user?.username || "User"}
                          onError={(e) => {
                            console.log(
                              "Dropdown avatar image failed to load:",
                              e.target.src
                            );
                            e.target.style.display = "none";
                          }}
                        />
                        <AvatarFallback className="rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                          {(auth.user?.username || "BF")
                            .charAt(0)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">
                          {auth.user?.username || "User"}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                          {auth.user?.email || ""}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {/* Profile - only show for non-guest users */}
                  {auth.type === "user" && (
                    <DropdownMenuItem onClick={() => navigate("/profile")}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                  )}
                  {/* User Management for superadmin/admin/host only */}
                  {(auth.user?.role === "superadmin" ||
                    auth.user?.role === "admin" ||
                    auth.user?.role === "host") && (
                    <DropdownMenuItem
                      onClick={() => {
                        localStorage.removeItem("viewAsPlayer");
                        localStorage.removeItem("viewAsPlayerTimestamp");
                        navigate("/manage/events");
                      }}
                    >
                      <PencilRuler className="mr-2 h-4 w-4" />
                      <span>View as Host</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setShowLogoutDialog(true)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarFooter>

      {/* Logout Confirmation Dialog */}
      <AlertLogout
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        onConfirm={handleLogout}
      />

      <SidebarRail />
    </Sidebar>
  );
}

export default NavSidebar;
