// ===== LIBRARIES ===== //
import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Swords, Sun, Moon, BookA, LogIn, UserPlus } from "lucide-react";

// ===== COMPONENTS ===== //
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
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator";

// ===== CONTEXTS ===== //
import { useThemeColor } from "@/theme/theme-provider";

const NavLanding = ({ ...props }) => {
  const { colorScheme, toggleColorScheme } = useThemeColor();
  const navigate = useNavigate();
  const location = useLocation();

  // ===== NAVIGATION DATA ===== //
  const navigationItems = useMemo(
    () => [
      {
        title: "Navigation",
        items: [
          {
            title: "Landing",
            url: "/landing",
            icon: Swords,
            isActive: location.pathname === "/landing",
          },
          {
            title: "About",
            url: "/about",
            icon: BookA,
            isActive: location.pathname === "/about",
          },
        ],
      },
    ],
    [location.pathname],
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
              onClick={() => navigate("/landing")}
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-sidebar-primary-foreground">
                <img src="/src/assets/Swords.png" alt="UniRAID" className="size-6 object-contain" />
              </div>
              {/* LOGO */}
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">UniRAID</span>
                <span className="truncate text-xs text-muted-foreground">Group Boss Battle</span>
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
                    <SidebarMenuButton asChild isActive={item.isActive} tooltip={item.title}>
                      <button onClick={() => navigate(item.url)} className="flex items-center gap-2 w-full">
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
              tooltip={`Switch to ${colorScheme === "light" ? "dark" : "light"} mode`}
            >
              {colorScheme === "light" ? <Moon className="size-4" /> : <Sun className="size-4" />}
              <span>{colorScheme === "light" ? "Dark Mode" : "Light Mode"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <Separator />

        {/* Authentication Actions */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => navigate("/auth")} tooltip="Login">
              <LogIn className="size-4" />
              <span>Login</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => navigate("/auth?mode=register")} tooltip="Register">
              <UserPlus className="size-4" />
              <span>Register</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};

export default NavLanding;
