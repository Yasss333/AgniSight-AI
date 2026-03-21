import { NavLink, useLocation } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "./ui/sidebar"
import {
  LayoutDashboard,
  FolderOpen,
  FileText,
  BarChart2,
  LogOut,
} from "lucide-react"
import { Button } from "./ui/button"

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/dashboard" },
  { label: "Sessions", icon: FolderOpen, to: "/sessions" },
  { label: "Reports", icon: FileText, to: "/reports" },
  { label: "Analytics", icon: BarChart2, to: "/analytics", role: "manager" },
]

export function AppSidebar() {
  const { pathname } = useLocation()
  const { user, logout } = useAuth()

  if (!user) return null

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((segment) => segment[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "AS"

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-border"
      style={{
        "--sidebar-background": "var(--card)",
        "--sidebar-foreground": "var(--foreground)",
        "--sidebar-accent": "var(--secondary)",
        "--sidebar-accent-foreground": "var(--foreground)",
        "--sidebar-border": "var(--border)",
      }}
    >
      <SidebarHeader className="px-3 py-4">
        <div className="flex w-full items-center gap-2 group-data-[state=collapsed]:justify-center">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-xs font-bold tracking-tight">
            AS
          </div>
          <div className="flex flex-col leading-none group-data-[state=collapsed]:hidden">
            <span className="text-sm font-semibold">AgniSight</span>
            <span className="text-xs text-muted-foreground"></span>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between gap-2 group-data-[state=collapsed]:justify-center">
          <span className="text-xs text-muted-foreground group-data-[state=collapsed]:hidden">
            Navigation
          </span>
          <SidebarTrigger className="ml-auto" />
        </div>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent className="px-2 py-2">
        <div className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground group-data-[state=collapsed]:hidden">
          Main
        </div>
        <SidebarMenu>
          {navItems
            .filter((item) => !item.role || item.role === user.role)
            .map(({ label, icon: Icon, to }) => {
              const isActive = pathname === to
              return (
                <SidebarMenuItem key={to}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={label}
                  >
                    <NavLink to={to} className="relative flex items-center gap-2">
                      <span
                        aria-hidden="true"
                        className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-primary opacity-0 transition-opacity data-[active=true]:opacity-100"
                        data-active={isActive}
                      />
                      <Icon className="h-4 w-4" />
                      <span className="group-data-[state=collapsed]:hidden">
                        {label}
                      </span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter className="px-3 py-3">
        <div className="px-1 pb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground group-data-[state=collapsed]:hidden">
          Account
        </div>
        <div className="flex w-full items-center gap-2 rounded-md bg-secondary/60 px-2 py-2 group-data-[state=collapsed]:flex-col group-data-[state=collapsed]:items-center group-data-[state=collapsed]:gap-1 group-data-[state=collapsed]:px-1">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary leading-none">
            {initials}
          </div>
          <div className="min-w-0 flex-1 group-data-[state=collapsed]:hidden">
            <p className="truncate text-sm font-medium text-foreground">
              {user.name}
            </p>
            <p className="text-xs uppercase text-muted-foreground">
              {user.role}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
