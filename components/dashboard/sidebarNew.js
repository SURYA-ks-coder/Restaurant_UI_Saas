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
} from "lucide-react";

const navItems = [
  {
    id: 1,
    title: "Dashboard",
    shortTitle: "Dash",
    icon: <LayoutDashboard />,
    link: "/dashboard",
  },
  {
    id: 2,
    title: "Orders & Billing",
    shortTitle: "Orders",
    icon: <Receipt />,
    submenus: [
      {
        id: 1,
        title: "Operations",
        subMenu: [
          { id: 1, title: "Orders", link: "/dashboard/orders", navigation: true },
          { id: 2, title: "Orders List", link: "/dashboard/ordersList", navigation: true },
          { id: 3, title: "Billing", link: "/dashboard/billing", navigation: true },
          { id: 4, title: "Kitchen KOT", link: "/dashboard/kitchen", navigation: true },
        ],
      },
    ],
  },
  {
    id: 3,
    title: "Menu & Tables",
    shortTitle: "Menu",
    icon: <UtensilsCrossed />,
    submenus: [
      {
        id: 1,
        title: "Manage",
        subMenu: [
          { id: 1, title: "Menus", link: "/dashboard/menus", navigation: true },
          { id: 2, title: "Tables", link: "/dashboard/tables", navigation: true },
          { id: 3, title: "QR Orders", link: "/dashboard/qr-orders", navigation: true },
        ],
      },
    ],
  },
  {
    id: 4,
    title: "Inventory & Finance",
    shortTitle: "Stock",
    icon: <Package />,
    submenus: [
      {
        id: 1,
        title: "Inventory",
        subMenu: [
          { id: 1, title: "Inventory Items", link: "/dashboard/inventory", navigation: true },
          { id: 2, title: "Stock", link: "/dashboard/inventory/stock", navigation: true },
          { id: 3, title: "Warehouse", link: "/dashboard/inventory/warehouse", navigation: true },
          { id: 4, title: "Transfers", link: "/dashboard/inventory/transfers", navigation: true },
          { id: 5, title: "Wastage", link: "/dashboard/inventory/wastage", navigation: true },
        ],
      },
      {
        id: 2,
        title: "Finance",
        subMenu: [
          { id: 1, title: "Expenses", link: "/dashboard/expenses", navigation: true },
        ],
      },
    ],
  },
  {
    id: 5,
    title: "Reports",
    shortTitle: "Reports",
    icon: <BarChart3 />,
    link: "/dashboard/reports",
  },
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
          { id: 1, title: "All Staff", link: "/dashboard/staff", navigation: true },
          { id: 2, title: "My Team", link: "/dashboard/staff/my-team", navigation: true, hideForRoles: ["owner", "super_admin"] },
        ],
      },
    ],
  },
  {
    id: 7,
    title: "Settings",
    shortTitle: "Settings",
    icon: <Settings />,
    submenus: [
      {
        id: 1,
        title: "Configuration",
        subMenu: [
          { id: 1, title: "General", link: "/dashboard/settings", navigation: true },
          { id: 2, title: "Privileges", link: "/dashboard/privileges", navigation: true },
          { id: 3, title: "Appearance", link: "/dashboard/appearance", navigation: true },
        ],
      },
    ],
  },
  {
    id: 8,
    title: "Restaurant",
    shortTitle: "Bistro",
    icon: <Store />,
    submenus: [
      {
        id: 1,
        title: "Profile",
        subMenu: [
          { id: 1, title: "Restaurant Profile", link: "/dashboard/restaurant-profile", navigation: true },
          { id: 2, title: "All Branches", link: "/dashboard/branch-management", navigation: true },
        ],
      },
    ],
  },
  {
    id: 9,
    title: "Owner Tools",
    shortTitle: "Admin",
    icon: <Crown />,
    submenus: [
      {
        id: 1,
        title: "Admin",
        subMenu: [
          { id: 1, title: "Overview", link: "/dashboard/owner", navigation: true },
          { id: 2, title: "Restaurants", link: "/dashboard/owner/add-restaurant", navigation: true },
        ],
      },
    ],
  },
];

function getLoggedRole() {
  try {
    const u = JSON.parse(localStorage.getItem("userData") || "{}");
    return u?.role || "staff";
  } catch {
    return "staff";
  }
}

const SidebarNew = ({ onLogout = () => {} }) => {
  const pathname = usePathname();
  const [hoveredMenuId, setHoveredMenuId] = useState(null);
  const [openSections, setOpenSections] = useState({});
  const closeTimer = useRef(null);
  const [loggedRole, setLoggedRole] = useState("staff");

  React.useEffect(() => {
    setLoggedRole(getLoggedRole());
  }, []);

  const hoveredMenu = navItems.find((m) => m.id === hoveredMenuId) ?? null;
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
    const menu = navItems.find((m) => m.id === menuId);
    if (menu?.submenus) {
      const init = {};
      menu.submenus.forEach((g) => { init[g.id] = true; });
      setOpenSections(init);
    }
  };

  return (
    <>
      {/* ══════════════════════════════════════════
          ICON RAIL — always visible, 80 px, primary bg
          ══════════════════════════════════════════ */}
      <div className="fixed top-0 left-0 z-1000 w-20 h-full bg-primary flex flex-col select-none font-figtree">

        {/* Logo */}
        <div className="flex items-center justify-center min-h-16 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
            <Flame className="h-5 w-5 text-white" />
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-1 scrollbar-hide">
          <ul className="flex flex-col items-center gap-0.5 px-2">
            {navItems.map((menu) => {
              const isActive =
                isRouteActive(menu.link) ||
                menu.submenus?.some((g) =>
                  g.subMenu?.some((i) => isRouteActive(i.link)),
                );
              const isHovered = hoveredMenuId === menu.id;

              const iconNode = React.isValidElement(menu.icon)
                ? React.cloneElement(menu.icon, {
                    className: `h-5 w-5 transition-colors ${
                      isActive || isHovered ? "text-primary" : "text-white"
                    }`,
                  })
                : menu.icon;

              const inner = (
                <div className="flex flex-col items-center gap-1 py-1.5 w-full">
                  <div
                    className={`rounded-xl p-2.5 transition-all duration-150 ${
                      isActive || isHovered
                        ? "bg-white shadow-sm"
                        : "bg-white/15 group-hover:bg-white/30"
                    }`}
                  >
                    {iconNode}
                  </div>
                  <span
                    className={`text-[9px] font-medium tracking-wide leading-none ${
                      isActive || isHovered
                        ? "text-white"
                        : "text-white/70 group-hover:text-white/90"
                    }`}
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
                      className="group flex w-full"
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

        {/* Logout */}
        <div className="shrink-0 px-2 py-3">
          <button
            onClick={onLogout}
            className="group flex flex-col items-center gap-1 py-1.5 w-full"
          >
            <div className="rounded-xl p-2.5 bg-white/15 group-hover:bg-red-500/70 transition-colors duration-200">
              <PiSignOut className="h-5 w-5 text-white" />
            </div>
            <span className="text-[9px] font-medium text-white/60 group-hover:text-white/90">
              Logout
            </span>
          </button>
        </div>
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
            className="fixed top-0 left-20 z-999 w-56 h-full flex flex-col
              bg-white dark:bg-[#0f172a]
              border-r border-[#e4e7ec] dark:border-[#1e293b]
              shadow-[4px_0_20px_rgba(0,0,0,0.09)] dark:shadow-[4px_0_20px_rgba(0,0,0,0.5)]
              overflow-hidden"
          >
            {/* Panel header */}
            <div className="min-h-16 flex items-center px-4 shrink-0 border-b border-[#e4e7ec] dark:border-[#1e293b]">
              <span className="text-sm font-bold text-foreground">
                {hoveredMenu.title}
              </span>
            </div>

            {/* Section groups */}
            <nav className="flex-1 overflow-y-auto py-3 px-3 scrollbar-hide">
              {hoveredMenu.submenus.map((group) => (
                <div key={group.id} className="mb-2">
                  {/* Section heading */}
                  {group.title && (
                    <button
                      onClick={() =>
                        setOpenSections((prev) => ({
                          ...prev,
                          [group.id]: !prev[group.id],
                        }))
                      }
                      className="w-full flex items-center justify-between px-2 py-1.5 mb-1 group"
                    >
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#9aa8bc] dark:text-[#475569] group-hover:text-foreground transition-colors">
                        {group.title}
                      </span>
                      <motion.span
                        animate={{ rotate: openSections[group.id] !== false ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-[#9aa8bc] dark:text-[#475569]"
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
                          if (item.hideForRoles?.includes(loggedRole)) return null;
                          const active = isRouteActive(item.link);
                          return (
                            <li key={item.id}>
                              <Link
                                href={item.link}
                                onClick={() =>
                                  localStorage.setItem("selectedMainMenu", item.title)
                                }
                                className={`flex items-center px-3 py-2 rounded-lg no-underline text-sm transition-colors duration-150
                                  ${
                                    active
                                      ? "bg-primary text-white font-medium"
                                      : "text-[#344054] dark:text-[#e2e8f0] hover:bg-[#f2f4f7] dark:hover:bg-[#1e293b] hover:text-foreground"
                                  }`}
                              >
                                {item.title}
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
