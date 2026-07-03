"use client";
import React, { useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { PiSignOut } from "react-icons/pi";
import { HiChevronDown } from "react-icons/hi2";
import {
  LayoutDashboard,
  Receipt,
  UtensilsCrossed,
  Package,
  BarChart3,
  Users,
  Settings,
  Store,
  Crown,
  Flame,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    id: 1,
    title: "Dashboard",
    shortTitle: "Dash",
    icon: <LayoutDashboard />,
    link: "/dashboard",
  },

  // ================= Operations =================
  {
    id: 2,
    title: "Operations",
    shortTitle: "Ops",
    icon: <Receipt />,
    submenus: [
      {
        id: 1,
        title: "Order Management",
        subMenu: [
          {
            id: 1,
            title: "Orders",
            link: "/dashboard/orders",
            navigation: true,
          },
          {
            id: 2,
            title: "Orders List",
            link: "/dashboard/ordersList",
            navigation: true,
          },
          {
            id: 3,
            title: "Billing",
            link: "/dashboard/billing",
            navigation: true,
          },
          {
            id: 4,
            title: "Kitchen KOT",
            link: "/dashboard/kitchen",
            navigation: true,
          },
          {
            id: 5,
            title: "Tables",
            link: "/dashboard/tables",
            navigation: true,
          },
          {
            id: 6,
            title: "QR Orders",
            link: "/dashboard/qr-orders",
            navigation: true,
          },
        ],
      },
    ],
  },

  // ================= Menu =================
  {
    id: 3,
    title: "Menu",
    shortTitle: "Menu",
    icon: <UtensilsCrossed />,
    submenus: [
      {
        id: 1,
        title: "Menu Management",
        subMenu: [
          {
            id: 1,
            title: "Menus",
            link: "/dashboard/menus",
            navigation: true,
          },
        ],
      },
    ],
  },

  // ================= Inventory =================
  {
    id: 4,
    title: "Inventory",
    shortTitle: "Stock",
    icon: <Package />,
    submenus: [
      {
        id: 1,
        title: "Inventory",
        subMenu: [
          {
            id: 1,
            title: "Inventory Items",
            link: "/dashboard/inventory",
            navigation: true,
          },
          {
            id: 2,
            title: "Stock",
            link: "/dashboard/inventory/stock",
            navigation: true,
          },
          {
            id: 3,
            title: "Warehouse",
            link: "/dashboard/inventory/warehouse",
            navigation: true,
          },
          {
            id: 4,
            title: "Transfers",
            link: "/dashboard/inventory/transfers",
            navigation: true,
          },
          {
            id: 5,
            title: "Wastage",
            link: "/dashboard/inventory/wastage",
            navigation: true,
          },
        ],
      },
    ],
  },

  // ================= Reports & Finance =================
  {
    id: 5,
    title: "Reports",
    shortTitle: "Reports",
    icon: <BarChart3 />,
    link: "/dashboard/reports",
  },

  // ================= Staff =================
  {
    id: 6,
    title: "Staff",
    shortTitle: "Staff",
    icon: <Users />,
    submenus: [
      {
        id: 1,
        title: "Team",
        subMenu: [
          {
            id: 1,
            title: "All Staff",
            link: "/dashboard/staff",
            navigation: true,
          },
          {
            id: 2,
            title: "My Team",
            link: "/dashboard/staff/my-team",
            navigation: true,
            hideForRoles: ["owner", "super_admin"],
          },
        ],
      },
    ],
  },

  // ================= Restaurant =================
  {
    id: 7,
    title: "Restaurant",
    shortTitle: "Restaurant",
    icon: <Store />,
    submenus: [
      {
        id: 1,
        title: "Management",
        subMenu: [
          {
            id: 1,
            title: "Restaurant Profile",
            link: "/dashboard/restaurant-profile",
            navigation: true,
          },
          {
            id: 2,
            title: "Branch Management",
            link: "/dashboard/branch-management",
            navigation: true,
          },
        ],
      },
    ],
  },

  // ================= Administration =================
  {
    id: 8,
    title: "Administration",
    shortTitle: "Admin",
    icon: <Settings />,
    submenus: [
      {
        id: 1,
        title: "Configuration",
        subMenu: [
          {
            id: 1,
            title: "General Settings",
            link: "/dashboard/settings",
            navigation: true,
          },
          {
            id: 2,
            title: "Privileges",
            link: "/dashboard/privileges",
            navigation: true,
          },
          {
            id: 3,
            title: "Appearance",
            link: "/dashboard/appearance",
            navigation: true,
          },
        ],
      },
      {
        id: 2,
        title: "Owner Tools",
        subMenu: [
          {
            id: 1,
            title: "Owner Dashboard",
            link: "/dashboard/owner",
            navigation: true,
          },
          {
            id: 2,
            title: "Restaurants",
            link: "/dashboard/owner/add-restaurant",
            navigation: true,
          },
        ],
      },
    ],
  },
];

import { getUserRole, getMenuIds } from "@/lib/auth";

const GRADIENT =
  "linear-gradient(135deg, var(--primary), color-mix(in oklch, var(--primary) 55%, white))";
const GLOW = "color-mix(in oklch, var(--primary) 35%, transparent)";

const SidebarNew = ({ onLogout = () => {} }) => {
  const pathname = usePathname();
  const [hoveredMenuId, setHoveredMenuId] = useState(null);
  const [openSections, setOpenSections] = useState({});
  const closeTimer = useRef(null);
  const [loggedRole, setLoggedRole] = useState("staff");
  const [allowedMenuIds, setAllowedMenuIds] = useState(null);

  React.useEffect(() => {
    setLoggedRole(getUserRole());
    const ids = getMenuIds();
    setAllowedMenuIds(ids.length > 0 ? new Set(ids) : null);
  }, []);

  const visibleNavItems = allowedMenuIds
    ? navItems.filter((m) => allowedMenuIds.has(m.id))
    : navItems;

  const hoveredMenu =
    visibleNavItems.find((m) => m.id === hoveredMenuId) ?? null;
  const showPanel = (hoveredMenu?.submenus?.length ?? 0) > 0;

  const isRouteActive = (link) => {
    if (!link) return false;
    return pathname === link || pathname.startsWith(link + "/");
  };

  const cancelClose = () => clearTimeout(closeTimer.current);

  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setHoveredMenuId(null), 160);
  };

  const handleIconEnter = (menuId) => {
    cancelClose();
    setHoveredMenuId(menuId);
    // Auto-expand all sections for this menu
    const menu = visibleNavItems.find((m) => m.id === menuId);
    if (menu?.submenus) {
      const init = {};
      menu.submenus.forEach((g) => {
        init[g.id] = true;
      });
      setOpenSections(init);
    }
  };

  return (
    <>
      {/* ══════════════════════════════════════════
          ICON RAIL — always visible, 80 px
          ══════════════════════════════════════════ */}
      <div className="fixed top-0 left-0 z-1000 flex h-full w-20 flex-col select-none border-r border-sidebar-border/60 bg-sidebar/95 backdrop-blur-2xl font-figtree">
        {/* Logo */}
        <div className="flex min-h-[72px] shrink-0 items-center justify-center">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-2xl"
            style={{
              background: GRADIENT,
              boxShadow: `0 8px 24px ${GLOW}`,
            }}
          >
            <Flame className="h-5 w-5 text-white" />
          </div>
        </div>

        <div className="mx-4 h-px shrink-0 bg-sidebar-border/60" />

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 scrollbar-hide">
          <ul className="flex flex-col items-center gap-1 px-2.5">
            {visibleNavItems.map((menu) => {
              const isActive =
                isRouteActive(menu.link) ||
                menu.submenus?.some((g) =>
                  g.subMenu?.some((i) => isRouteActive(i.link)),
                );
              const showPill = hoveredMenuId === menu.id;

              const iconNode = React.isValidElement(menu.icon)
                ? React.cloneElement(menu.icon, {
                    className: cn(
                      "h-[18px] w-[18px] transition-colors duration-200",
                      showPill
                        ? "text-white"
                        : isActive
                          ? "text-primary"
                          : "text-sidebar-foreground/70 group-hover:text-sidebar-foreground",
                    ),
                  })
                : menu.icon;

              const inner = (
                <div className="flex w-full flex-col items-center gap-1 py-1.5">
                  <div className="relative flex h-10 w-10 items-center justify-center">
                    {showPill && (
                      <motion.div
                        layoutId="railPill"
                        transition={{
                          type: "spring",
                          stiffness: 480,
                          damping: 32,
                        }}
                        className="absolute inset-0 rounded-md bg-primary"
                      />
                    )}
                    {!showPill && isActive && (
                      <div className="absolute inset-0 rounded-md bg-primary/12" />
                    )}
                    <span className="relative z-10 flex h-full w-full items-center justify-center">
                      {iconNode}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "text-[9.5px] font-medium leading-none tracking-wide transition-colors duration-200",
                      showPill
                        ? "text-sidebar-foreground"
                        : isActive
                          ? "text-primary"
                          : "text-sidebar-foreground/65 group-hover:text-sidebar-foreground",
                    )}
                  >
                    {menu.shortTitle}
                  </span>
                </div>
              );

              return (
                <li key={menu.id} className="w-full">
                  {menu.link ? (
                    <Link
                      href={menu.link}
                      className="group flex w-full"
                      onMouseEnter={() => handleIconEnter(menu.id)}
                      onMouseLeave={scheduleClose}
                    >
                      {inner}
                    </Link>
                  ) : (
                    <button
                      className="group flex w-full cursor-pointer"
                      onMouseEnter={() => handleIconEnter(menu.id)}
                      onMouseLeave={scheduleClose}
                    >
                      {inner}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Role + Logout */}
        {/* <div className="shrink-0 space-y-2 px-2.5 py-3">
          {loggedRole && (
            <div className="mx-auto w-fit rounded-full bg-sidebar-accent px-2 py-0.5 text-center text-[9px] font-semibold uppercase tracking-wide text-sidebar-foreground/60">
              {loggedRole}
            </div>
          )}
          <button
            onClick={onLogout}
            className="group flex w-full flex-col items-center gap-1 py-1.5 cursor-pointer"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar-accent text-sidebar-foreground/60 transition-colors duration-200 group-hover:bg-destructive/15 group-hover:text-destructive">
              <PiSignOut className="h-[18px] w-[18px]" />
            </div>
            <span className="text-[9.5px] font-medium text-sidebar-foreground/45 group-hover:text-destructive">
              Logout
            </span>
          </button>
        </div> */}
      </div>

      {/* ══════════════════════════════════════════
          FLYOUT PANEL — slides out for submenu items
          ══════════════════════════════════════════ */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            key={hoveredMenuId}
            initial={{ x: -12, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -12, opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
            className="fixed top-0 left-20 z-999 flex h-full w-60 flex-col overflow-hidden
              border-r border-sidebar-border/60
              bg-sidebar/95 backdrop-blur-2xl
              shadow-[8px_0_32px_rgba(0,0,0,0.08)] dark:shadow-[8px_0_32px_rgba(0,0,0,0.55)]"
          >
            {/* Panel header */}
            <div className="flex min-h-[72px] shrink-0 items-center gap-3 border-b border-sidebar-border/60 px-5">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-xl text-white"
                style={{ background: GRADIENT }}
              >
                {React.isValidElement(hoveredMenu.icon) &&
                  React.cloneElement(hoveredMenu.icon, {
                    className: "h-4 w-4",
                  })}
              </div>
              <span className="text-sm font-bold text-sidebar-foreground">
                {hoveredMenu.title}
              </span>
            </div>

            {/* Section groups */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-hide">
              {hoveredMenu.submenus.map((group) => (
                <div key={group.id} className="mb-3">
                  {/* Section heading */}
                  {group.title && (
                    <button
                      onClick={() =>
                        setOpenSections((prev) => ({
                          ...prev,
                          [group.id]: !prev[group.id],
                        }))
                      }
                      className="w-full flex items-center justify-between px-2 py-1.5 mb-1 group cursor-pointer"
                    >
                      <span className="text-[10px] font-bold uppercase tracking-widest text-sidebar-foreground/60 group-hover:text-sidebar-foreground transition-colors">
                        {group.title}
                      </span>
                      <motion.span
                        animate={{
                          rotate: openSections[group.id] !== false ? 180 : 0,
                        }}
                        transition={{ duration: 0.2 }}
                        className="text-sidebar-foreground/60 group-hover:text-sidebar-foreground transition-colors"
                      >
                        <HiChevronDown className="text-sm" />
                      </motion.span>
                    </button>
                  )}

                  {/* Sub-items */}
                  <AnimatePresence initial={false}>
                    {openSections[group.id] !== false && (
                      <motion.ul
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                        className="overflow-hidden flex flex-col gap-0.5"
                      >
                        {group.subMenu?.map((item) => {
                          if (!item.navigation || !item.link) return null;
                          if (item.hideForRoles?.includes(loggedRole))
                            return null;
                          const active = isRouteActive(item.link);
                          return (
                            <li key={item.id}>
                              <Link
                                href={item.link}
                                onClick={() =>
                                  localStorage.setItem(
                                    "selectedMainMenu",
                                    item.title,
                                  )
                                }
                                className={cn(
                                  "group/item flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm no-underline transition-colors duration-150",
                                  active
                                    ? "bg-primary font-medium text-primary-foreground"
                                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                                )}
                              >
                                <span>{item.title}</span>
                                <ChevronRight
                                  className={cn(
                                    "h-3.5 w-3.5 shrink-0 transition-opacity",
                                    active
                                      ? "opacity-80"
                                      : "opacity-0 group-hover/item:opacity-60",
                                  )}
                                />
                              </Link>
                            </li>
                          );
                        })}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SidebarNew;
