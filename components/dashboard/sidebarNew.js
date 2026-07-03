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
  ClipboardList,
  ListOrdered,
  CreditCard,
  ChefHat,
  Table2,
  QrCode,
  BookOpen,
  Boxes,
  PackageSearch,
  Warehouse,
  ArrowLeftRight,
  Trash2,
  UserRound,
  UsersRound,
  Building2,
  GitBranch,
  SlidersHorizontal,
  ShieldCheck,
  Palette,
  LayoutGrid,
  Building,
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
            icon: <ClipboardList />,
          },
          {
            id: 2,
            title: "Orders List",
            link: "/dashboard/ordersList",
            navigation: true,
            icon: <ListOrdered />,
          },
          {
            id: 3,
            title: "Billing",
            link: "/dashboard/billing",
            navigation: true,
            icon: <CreditCard />,
          },
          {
            id: 4,
            title: "Kitchen KOT",
            link: "/dashboard/kitchen",
            navigation: true,
            icon: <ChefHat />,
          },
          {
            id: 5,
            title: "Tables",
            link: "/dashboard/tables",
            navigation: true,
            icon: <Table2 />,
          },
          {
            id: 6,
            title: "QR Orders",
            link: "/dashboard/qr-orders",
            navigation: true,
            icon: <QrCode />,
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
            icon: <BookOpen />,
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
            icon: <Boxes />,
          },
          {
            id: 2,
            title: "Stock",
            link: "/dashboard/inventory/stock",
            navigation: true,
            icon: <PackageSearch />,
          },
          {
            id: 3,
            title: "Warehouse",
            link: "/dashboard/inventory/warehouse",
            navigation: true,
            icon: <Warehouse />,
          },
          {
            id: 4,
            title: "Transfers",
            link: "/dashboard/inventory/transfers",
            navigation: true,
            icon: <ArrowLeftRight />,
          },
          {
            id: 5,
            title: "Wastage",
            link: "/dashboard/inventory/wastage",
            navigation: true,
            icon: <Trash2 />,
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
            icon: <UserRound />,
          },
          {
            id: 2,
            title: "My Team",
            link: "/dashboard/staff/my-team",
            navigation: true,
            hideForRoles: ["owner", "super_admin"],
            icon: <UsersRound />,
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
            icon: <Building2 />,
          },
          {
            id: 2,
            title: "Branch Management",
            link: "/dashboard/branch-management",
            navigation: true,
            icon: <GitBranch />,
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
            icon: <SlidersHorizontal />,
          },
          {
            id: 2,
            title: "Privileges",
            link: "/dashboard/privileges",
            navigation: true,
            icon: <ShieldCheck />,
          },
          {
            id: 3,
            title: "Appearance",
            link: "/dashboard/appearance",
            navigation: true,
            icon: <Palette />,
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
            icon: <LayoutGrid />,
          },
          {
            id: 2,
            title: "Restaurants",
            link: "/dashboard/owner/add-restaurant",
            navigation: true,
            icon: <Building />,
          },
        ],
      },
    ],
  },
];

import { getUserRole, getMenuIds } from "@/lib/auth";

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
    if (link === "/dashboard") return pathname === "/dashboard";
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
          ICON RAIL — always visible, 80 px, primary bg
          ══════════════════════════════════════════ */}
      <div className="fixed top-0 left-0 z-1000 flex h-full w-20 flex-col select-none bg-primary font-figtree">
        {/* Logo */}
        <div className="flex min-h-[76px] shrink-0 items-center justify-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
            <Flame className="h-5 w-5 text-white" />
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2.5 py-2 scrollbar-hide">
          <ul className="flex flex-col items-center gap-1.5">
            {visibleNavItems.map((menu) => {
              const isActive =
                isRouteActive(menu.link) ||
                menu.submenus?.some((g) =>
                  g.subMenu?.some((i) => isRouteActive(i.link)),
                );
              const highlighted = hoveredMenuId
                ? hoveredMenuId === menu.id
                : isActive;

              const iconNode = React.isValidElement(menu.icon)
                ? React.cloneElement(menu.icon, {
                    className: cn(
                      "h-[19px] w-[19px] transition-colors duration-150",
                      highlighted
                        ? "text-primary"
                        : "text-white/75 group-hover:text-white",
                    ),
                  })
                : menu.icon;

              const inner = (
                <div className="flex w-full flex-col items-center gap-1 py-1">
                  <div className="relative flex h-11 w-11 items-center justify-center">
                    {highlighted && (
                      <motion.div
                        layoutId="railHighlight"
                        transition={{
                          type: "spring",
                          stiffness: 480,
                          damping: 32,
                        }}
                        className="absolute inset-0 rounded-md bg-white shadow-sm"
                      />
                    )}
                    {!highlighted && (
                      <div className="absolute inset-0 rounded-md bg-white/10 border border-white/20 transition-colors duration-150 group-hover:bg-white/20" />
                    )}
                    <span className="relative z-10 flex h-full w-full items-center justify-center">
                      {iconNode}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "text-[9.5px] font-medium leading-none tracking-wide transition-colors duration-150",
                      highlighted
                        ? "text-white"
                        : "text-white/60 group-hover:text-white/85",
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
            className="fixed top-0 left-20 z-999 flex h-full w-64 flex-col overflow-hidden
              border-r border-sidebar-border/60
              bg-sidebar
              shadow-[8px_0_32px_rgba(0,0,0,0.08)] dark:shadow-[8px_0_32px_rgba(0,0,0,0.55)]"
          >
            {/* Panel header */}
            <div className="flex min-h-[76px] shrink-0 items-center px-5">
              <span className="text-lg font-bold text-primary">
                {hoveredMenu.title}
              </span>
            </div>

            {/* Section groups */}
            <nav className="flex-1 overflow-y-auto py-2 px-3 scrollbar-hide">
              {hoveredMenu.submenus.map((group) => (
                <div key={group.id} className="mb-1">
                  {/* Section heading */}
                  {group.title && (
                    <button
                      onClick={() =>
                        setOpenSections((prev) => ({
                          ...prev,
                          [group.id]: !prev[group.id],
                        }))
                      }
                      className="w-full flex items-center justify-between px-2 py-2 mb-0.5 group cursor-pointer"
                    >
                      <span className="text-[11px] font-bold uppercase tracking-wider text-primary/70 group-hover:text-primary transition-colors">
                        {group.title}
                      </span>
                      <motion.span
                        animate={{
                          rotate: openSections[group.id] !== false ? 180 : 0,
                        }}
                        transition={{ duration: 0.2 }}
                        className="text-primary/70 group-hover:text-primary transition-colors"
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
                                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm no-underline transition-colors duration-150",
                                  active
                                    ? "bg-primary! font-semibold text-primary-foreground!"
                                    : "hover:bg-primary/10!",
                                )}
                              >
                                {React.isValidElement(item.icon) &&
                                  React.cloneElement(item.icon, {
                                    className: cn(
                                      "h-4 w-4 shrink-0 transition-colors duration-150",
                                      active
                                        ? "text-primary-foreground!"
                                        : "text-sidebar-foreground/50 group-hover:text-primary!",
                                    ),
                                  })}
                                <p
                                  className={cn(
                                    "truncate transition-colors duration-150",
                                    active
                                      ? "text-primary-foreground!"
                                      : "text-sidebar-foreground/80 group-hover:text-primary!",
                                  )}
                                >
                                  {item.title}
                                </p>
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
