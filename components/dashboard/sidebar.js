"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  ChefHat,
  ChevronDown,
  ChevronLeft,
  Flame,
  LayoutDashboard,
  LogOut,
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
import {
  navItems as menuTree,
  getAllowedPermissionIds,
  filterNavItemsByPermissions,
} from "./sidebarNew";
import { getUserRole } from "@/lib/auth";

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

/* ═══════════════════════════════════════════════════════════
   MOBILE DRAWER — mirrors the desktop rail's grouped nav tree
   (imported from sidebarNew) with accordion sections
   ═══════════════════════════════════════════════════════════ */

const cloneIcon = (icon, className) =>
  React.isValidElement(icon)
    ? React.cloneElement(icon, { className })
    : icon;

export function MobileSidebar({ onClose, onLogout = () => {} }) {
  const pathname = usePathname();
  const [openId, setOpenId] = useState(null);
  const [role, setRole] = useState("");
  const [allowedMenuIds, setAllowedMenuIds] = useState(null);

  useEffect(() => {
    const loggedRole = getUserRole();
    setRole(loggedRole);
    setAllowedMenuIds(getAllowedPermissionIds(loggedRole));
  }, []);

  const isRouteActive = (link) => {
    if (!link) return false;
    if (link === "/dashboard") return pathname === "/dashboard";
    return pathname === link || pathname.startsWith(link + "/");
  };

  // Start with the section holding the current route expanded
  useEffect(() => {
    const activeGroup = menuTree.find((m) =>
      m.submenus?.some((g) => g.subMenu?.some((i) => isRouteActive(i.link))),
    );
    if (activeGroup) setOpenId(activeGroup.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const visibleItems = filterNavItemsByPermissions(menuTree, allowedMenuIds);

  return (
    <aside className="flex h-screen w-80 max-w-[86vw] flex-col overflow-hidden rounded-r-3xl bg-sidebar shadow-2xl">
      {/* ── Header ── */}
      <div className="relative shrink-0 overflow-hidden bg-primary px-5 pb-6 pt-5">
        {/* soft glow accents */}
        <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-white/15 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-14 -left-8 h-32 w-32 rounded-full bg-black/15 blur-2xl" />

        <div className="relative flex items-start justify-between">
          <Link
            href="/dashboard"
            onClick={onClose}
            className="flex items-center gap-3"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur-sm">
              <Flame className="h-5 w-5 text-white" />
            </span>
            <span>
              <span className="block text-lg font-bold leading-tight text-white">
                Flavor Hub
              </span>
              <span className="block text-[11px] text-white/60">
                Restaurant Suite
              </span>
            </span>
          </Link>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-xl bg-white/10 p-2 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {role && (
          <span className="relative mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white/80 ring-1 ring-white/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
            {role.replace(/_/g, " ")}
          </span>
        )}
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 overflow-y-auto px-3 py-3">
        <ul className="space-y-1">
          {visibleItems.map((menu) => {
            const childLinks = (menu.submenus ?? [])
              .flatMap((g) => g.subMenu ?? [])
              .filter(
                (i) =>
                  i.navigation &&
                  i.link &&
                  !i.hideForRoles?.includes(role),
              );
            const hasChildren = childLinks.length > 0;
            const groupActive = hasChildren
              ? childLinks.some((i) => isRouteActive(i.link))
              : isRouteActive(menu.link);
            const open = openId === menu.id;

            const iconTile = (
              <span
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors",
                  groupActive
                    ? "bg-primary/15 text-primary"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {cloneIcon(menu.icon, "h-4.5 w-4.5")}
              </span>
            );

            if (!hasChildren) {
              return (
                <li key={menu.id}>
                  <Link
                    href={menu.link}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl px-2.5 py-2 transition-colors",
                      groupActive ? "bg-primary/8" : "hover:bg-muted/60",
                    )}
                  >
                    {iconTile}
                    <span
                      className={cn(
                        "flex-1 text-sm font-medium",
                        groupActive ? "text-primary" : "text-foreground",
                      )}
                    >
                      {menu.title}
                    </span>
                    {groupActive && (
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    )}
                  </Link>
                </li>
              );
            }

            return (
              <li key={menu.id}>
                <button
                  onClick={() => setOpenId(open ? null : menu.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl px-2.5 py-2 text-left transition-colors",
                    groupActive && !open ? "bg-primary/8" : "hover:bg-muted/60",
                  )}
                >
                  {iconTile}
                  <span
                    className={cn(
                      "flex-1 text-sm font-medium",
                      groupActive ? "text-primary" : "text-foreground",
                    )}
                  >
                    {menu.title}
                  </span>
                  <motion.span
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-muted-foreground"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                      className="overflow-hidden"
                    >
                      <ul className="ml-5.5 space-y-0.5 border-l-2 border-border/70 py-1.5 pl-3.5">
                        {childLinks.map((item) => {
                          const active = isRouteActive(item.link);
                          return (
                            <li key={item.id}>
                              <Link
                                href={item.link}
                                onClick={onClose}
                                className={cn(
                                  "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors",
                                  active
                                    ? "bg-primary font-semibold text-primary-foreground shadow-sm"
                                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                                )}
                              >
                                {cloneIcon(
                                  item.icon,
                                  cn(
                                    "h-4 w-4 shrink-0",
                                    active
                                      ? "text-primary-foreground"
                                      : "text-muted-foreground",
                                  ),
                                )}
                                <span className="truncate">{item.title}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── Footer ── */}
      <div className="shrink-0 border-t border-border px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-2xl px-2.5 py-2 text-left transition-colors hover:bg-destructive/10"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
            <LogOut className="h-4.5 w-4.5" />
          </span>
          <span className="text-sm font-medium text-destructive">Log out</span>
        </button>
      </div>
    </aside>
  );
}
