"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  ChefHat,
  ChevronLeft,
  LayoutDashboard,
  Package,
  QrCode,
  Receipt,
  Settings,
  Sparkles,
  Users,
  UtensilsCrossed,
  Wallet,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "POS Ordering", href: "/dashboard/pos", icon: Receipt },
  { name: "Orders", href: "/dashboard/orders", icon: Receipt },
  { name: "Billing", href: "/dashboard/billing", icon: Receipt },
  { name: "Tables", href: "/dashboard/tables", icon: UtensilsCrossed },
  { name: "Kitchen KOT", href: "/dashboard/kitchen", icon: ChefHat },
  { name: "Inventory", href: "/dashboard/inventory", icon: Package },
  { name: "Expenses", href: "/dashboard/expenses", icon: Wallet },
  { name: "Reports", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Staff", href: "/dashboard/staff", icon: Users },
  { name: "QR Orders", href: "/dashboard/qr-orders", icon: QrCode },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
  { name: "Profile", href: "/dashboard/restaurant-profile", icon: Settings },
  { name: "Menus", href: "/dashboard/menus", icon: Settings },
];

function NavLinks({ collapsed = false, onNavigate }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-1 px-3 overflow-auto">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname?.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
              collapsed && "justify-center px-2",
            )}
            title={collapsed ? item.name : undefined}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{item.name}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar({ collapsed, onToggle }) {
  return (
    <aside
      className={cn(
        " left-0 top-0 z-40 hidden h-screen border-r border-border bg-sidebar lg:block",
        collapsed ? "w-20" : " w-52",
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ChefHat className="h-5 w-5" />
            </span>
            {!collapsed && (
              <span className="text-lg font-semibold">Flavor Hub</span>
            )}
          </Link>
        </div>

        <NavLinks collapsed={collapsed} />

        <div className="mt-auto space-y-4 p-4">
          {!collapsed && (
            <div className="rounded-lg border border-border bg-muted/40 p-4">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent" />
                <div>
                  <p className="text-sm font-medium">AI Assistant</p>
                  <p className="text-xs text-muted-foreground">Always ready</p>
                </div>
              </div>
              <button className="w-full rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">
                Ask anything
              </button>
            </div>
          )}

          <button
            onClick={onToggle}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <ChevronLeft
              className={cn(
                "h-4 w-4 transition-transform",
                collapsed && "rotate-180",
              )}
            />
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}

export function MobileSidebar({ onClose }) {
  return (
    <aside className="h-screen w-80 max-w-[85vw] border-r border-border bg-sidebar">
      <div className="flex h-16 items-center justify-between px-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-3"
          onClick={onClose}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ChefHat className="h-5 w-5" />
          </span>
          <span className="text-lg font-semibold">Flavor Hub</span>
        </Link>
        <button
          onClick={onClose}
          className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <NavLinks onNavigate={onClose} />
    </aside>
  );
}
