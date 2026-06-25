"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip } from "antd";
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
        title: "Resources",
        subMenu: [
          { id: 1, title: "Inventory", link: "/dashboard/inventory", navigation: true },
          { id: 2, title: "Expenses", link: "/dashboard/expenses", navigation: true },
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
    link: "/dashboard/staff",
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

const SidebarNew = ({ onLogout = () => {} }) => {
  const pathname = usePathname();
  const [hovering, setHovering] = useState(false);
  const [openMenus, setOpenMenus] = useState({});
  const [selectedMain, setSelectedMain] = useState(
    () => localStorage.getItem("selectedMainMenu") || "",
  );

  const anyMenuOpen = Object.values(openMenus).some(Boolean);
  const isExpanded = hovering || anyMenuOpen;

  const isRouteActive = (link) => {
    if (!link) return false;
    return pathname === link || pathname.startsWith(link + "/");
  };

  const handleMenuClick = (menu) => {
    if (menu.submenus?.length) {
      setOpenMenus((prev) => ({ ...prev, [menu.id]: !prev[menu.id] }));
    } else {
      setSelectedMain(menu.title);
      localStorage.setItem("selectedMainMenu", menu.title);
    }
  };

  const handleSubClick = (title) => {
    setSelectedMain(title);
    localStorage.setItem("selectedMainMenu", title);
  };

  const iconOf = (icon, active) => {
    if (!React.isValidElement(icon)) return icon;
    return React.cloneElement(icon, {
      className: `text-lg shrink-0 transition-colors duration-200 ${
        active ? "text-primary" : "text-[#667085] dark:text-[#94a3b8]"
      }`,
    });
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isExpanded ? 240 : 80 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className="fixed top-0 left-0 z-999 h-full flex flex-col overflow-hidden select-none font-figtree"
    >
      {/* ── Animated background ── */}
      <AnimatePresence initial={false}>
        {isExpanded ? (
          <motion.div
            key="bg-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-white dark:bg-[#0f172a] border-r border-[#e4e7ec] dark:border-[#1e293b] shadow-[2px_0_12px_rgba(0,0,0,0.06)] dark:shadow-[2px_0_12px_rgba(0,0,0,0.4)]"
          />
        ) : (
          <motion.div
            key="bg-primary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-primary"
          />
        )}
      </AnimatePresence>

      {/* ── Content layer ── */}
      <div className="relative z-10 flex flex-col h-full overflow-hidden">

        {/* Header */}
        <AnimatePresence initial={false} mode="wait">
          {isExpanded ? (
            <motion.div
              key="hdr-expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2 px-4 min-h-16 shrink-0"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm shadow-primary/30 shrink-0">
                <Flame className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-base tracking-tight text-foreground whitespace-nowrap">
                Ember<span className="text-primary">.</span>
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="hdr-collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center justify-center min-h-16 shrink-0"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
                <Flame className="h-5 w-5 text-white" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2 scrollbar-hide">
          <AnimatePresence initial={false} mode="wait">

            {/* ── EXPANDED nav ── */}
            {isExpanded ? (
              <motion.ul
                key="nav-expanded"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col gap-0.5 px-2"
              >
                {navItems.map((menu) => {
                  const isActive =
                    isRouteActive(menu.link) ||
                    menu.submenus?.some((group) =>
                      group.subMenu?.some((item) => isRouteActive(item.link)),
                    );
                  const isOpen = openMenus[menu.id];
                  const hasSubmenus = menu.submenus?.length > 0;

                  return (
                    <li key={menu.id}>
                      {menu.link ? (
                        <Link
                          href={menu.link}
                          onClick={() => handleMenuClick(menu)}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer
                            transition-all duration-200 no-underline
                            ${isActive ? "bg-primary/10 dark:bg-primary/20" : "hover:bg-[#f2f4f7] dark:hover:bg-[#1e293b]"}`}
                        >
                          {iconOf(menu.icon, isActive)}
                          <span className={`text-sm font-medium whitespace-nowrap overflow-hidden
                            ${isActive ? "text-primary" : "text-[#344054] dark:text-[#e2e8f0]"}`}>
                            {menu.title}
                          </span>
                        </Link>
                      ) : (
                        <div
                          onClick={() => handleMenuClick(menu)}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer
                            transition-all duration-200
                            ${isActive ? "bg-primary/10 dark:bg-primary/20" : "hover:bg-[#f2f4f7] dark:hover:bg-[#1e293b]"}`}
                        >
                          {iconOf(menu.icon, isActive)}
                          <span className={`text-sm font-medium whitespace-nowrap overflow-hidden flex-1
                            ${isActive ? "text-primary" : "text-[#344054] dark:text-[#e2e8f0]"}`}>
                            {menu.title}
                          </span>
                          {hasSubmenus && (
                            <motion.span
                              animate={{ rotate: isOpen ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                              className="shrink-0 text-[#667085] dark:text-[#94a3b8]"
                            >
                              <HiChevronDown className="text-base" />
                            </motion.span>
                          )}
                        </div>
                      )}

                      {/* Sub-menu groups */}
                      <AnimatePresence initial={false}>
                        {isOpen && hasSubmenus && (
                          <motion.ul
                            key="submenu"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                            className="overflow-hidden pl-4 flex flex-col gap-0.5 mt-0.5"
                          >
                            {menu.submenus.map((group) => (
                              <li key={group.id}>
                                {group.title && (
                                  <p className="text-[10px] font-semibold uppercase tracking-widest
                                    text-[#9aa8bc] dark:text-[#475569] px-3 pt-2 pb-1">
                                    {group.title}
                                  </p>
                                )}
                                <ul className="flex flex-col gap-0.5 pl-3">
                                  {group.subMenu?.map((item) => {
                                    if (!item.navigation || !item.link) return null;
                                    const itemActive = isRouteActive(item.link);
                                    return (
                                      <li key={item.id}>
                                        <Link
                                          href={item.link}
                                          onClick={() => handleSubClick(item.title)}
                                          className={`flex items-center gap-3 px-3 py-2 rounded-lg no-underline text-xs
                                            ${itemActive
                                              ? "bg-primary text-white"
                                              : "text-gray-600 font-semibold hover:bg-[#f2f4f7]"
                                            }`}
                                        >
                                          <span>{item.title}</span>
                                        </Link>
                                      </li>
                                    );
                                  })}
                                </ul>
                              </li>
                            ))}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </li>
                  );
                })}
              </motion.ul>
            ) : (

              /* ── COLLAPSED nav — icon + label ── */
              <motion.ul
                key="nav-collapsed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col items-center gap-1 px-2"
              >
                {navItems.map((menu) => {
                  const isActive =
                    isRouteActive(menu.link) ||
                    menu.submenus?.some((group) =>
                      group.subMenu?.some((item) => isRouteActive(item.link)),
                    );

                  const iconNode = React.isValidElement(menu.icon)
                    ? React.cloneElement(menu.icon, {
                        className: `h-5 w-5 transition-colors ${isActive ? "text-primary" : "text-white"}`,
                      })
                    : menu.icon;

                  const content = (
                    <div className="flex flex-col items-center gap-1 py-1.5 w-full">
                      <div
                        className={`rounded-xl p-2.5 transition-all duration-200 ${
                          isActive
                            ? "bg-white shadow-sm"
                            : "bg-white/15 group-hover:bg-white/30"
                        }`}
                      >
                        {iconNode}
                      </div>
                      <span
                        className={`text-[9px] font-medium tracking-wide leading-none ${
                          isActive ? "text-white" : "text-white/70 group-hover:text-white/90"
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
                          onClick={() => handleMenuClick(menu)}
                          className="group flex w-full"
                        >
                          {content}
                        </Link>
                      ) : (
                        <button
                          onClick={() => handleMenuClick(menu)}
                          className="group flex w-full"
                        >
                          {content}
                        </button>
                      )}
                    </li>
                  );
                })}
              </motion.ul>
            )}
          </AnimatePresence>
        </nav>

        {/* ── Bottom: logout ── */}
        <div className={`shrink-0 px-2 py-2 ${isExpanded ? "border-t border-[#e4e7ec] dark:border-[#1e293b]" : ""}`}>
          {isExpanded ? (
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer
                transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-900/20 group"
            >
              <PiSignOut className="text-lg shrink-0 text-[#667085] dark:text-[#94a3b8]
                group-hover:text-red-500 transition-colors duration-200" />
              <span className="text-sm font-medium text-[#344054] dark:text-[#e2e8f0]
                group-hover:text-red-500 whitespace-nowrap overflow-hidden">
                Logout
              </span>
            </button>
          ) : (
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
          )}
        </div>
      </div>
    </motion.aside>
  );
};

export default SidebarNew;
