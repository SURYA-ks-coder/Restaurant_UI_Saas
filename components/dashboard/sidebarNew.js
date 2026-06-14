"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import { Tooltip } from "antd";
import { PiSignOut } from "react-icons/pi";
import { HiChevronDown } from "react-icons/hi2";
import { HiMenuAlt2 } from "react-icons/hi";
import { BsThreeDotsVertical } from "react-icons/bs";

import {
  LayoutDashboard,
  Receipt,
  UtensilsCrossed,
  ChefHat,
  Package,
  Wallet,
  BarChart3,
  Users,
  QrCode,
  Settings,
  Paintbrush,
  Store,
  Building2,
  Crown,
} from "lucide-react";

const navItems = [
  {
    id: 1,
    title: "Dashboard",
    icon: <LayoutDashboard />,
    link: "/dashboard",
  },

  {
    id: 2,
    title: "Sales",
    icon: <Receipt />,
    submenus: [
      {
        id: 1,
        title: "Operations",
        subMenu: [
          {
            id: 1,
            title: "POS Ordering",
            link: "/dashboard/pos",
            navigation: true,
          },
          {
            id: 2,
            title: "Orders",
            link: "/dashboard/orders",
            navigation: true,
          },
          {
            id: 3,
            title: "Billing",
            link: "/dashboard/billing",
            navigation: true,
          },
        ],
      },
    ],
  },

  {
    id: 3,
    title: "Restaurant",
    icon: <UtensilsCrossed />,
    submenus: [
      {
        id: 1,
        title: "Management",
        subMenu: [
          {
            id: 1,
            title: "Tables",
            link: "/dashboard/tables",
            navigation: true,
          },
          {
            id: 2,
            title: "Kitchen KOT",
            link: "/dashboard/kitchen",
            navigation: true,
          },
          {
            id: 3,
            title: "Menus",
            link: "/dashboard/menus",
            navigation: true,
          },
          {
            id: 4,
            title: "QR Orders",
            link: "/dashboard/qr-orders",
            navigation: true,
          },
        ],
      },
    ],
  },

  {
    id: 4,
    title: "Inventory & Finance",
    icon: <Package />,
    submenus: [
      {
        id: 1,
        title: "Resources",
        subMenu: [
          {
            id: 1,
            title: "Inventory",
            link: "/dashboard/inventory",
            navigation: true,
          },
          {
            id: 2,
            title: "Expenses",
            link: "/dashboard/expenses",
            navigation: true,
          },
        ],
      },
    ],
  },

  {
    id: 5,
    title: "Administration",
    icon: <Settings />,
    submenus: [
      {
        id: 1,
        title: "Settings",
        subMenu: [
          {
            id: 1,
            title: "Staff",
            link: "/dashboard/staff",
            navigation: true,
          },
          {
            id: 2,
            title: "Reports",
            link: "/dashboard/analytics",
            navigation: true,
          },
          {
            id: 3,
            title: "Settings",
            link: "/dashboard/settings",
            navigation: true,
          },
          {
            id: 4,
            title: "Privileges",
            link: "/dashboard/privileges",
            navigation: true,
          },
          {
            id: 5,
            title: "Appearance",
            link: "/dashboard/appearance",
            navigation: true,
          },
        ],
      },
    ],
  },

  {
    id: 6,
    title: "Restaurant Management",
    icon: <Store />,
    submenus: [
      {
        id: 1,
        title: "Profile",
        subMenu: [
          {
            id: 1,
            title: "Restaurant Profile",
            link: "/dashboard/restaurant-profile",
            navigation: true,
          },
        ],
      },
    ],
  },

  {
    id: 7,
    title: "Branch Management",
    icon: <Building2 />,
    submenus: [
      {
        id: 1,
        title: "Locations",
        subMenu: [
          {
            id: 1,
            title: "All Branches",
            link: "/dashboard/branch-management",
            navigation: true,
          },
        ],
      },
    ],
  },

  {
    id: 8,
    title: "Owner Tools",
    icon: <Crown />,
    submenus: [
      {
        id: 1,
        title: "Admin",
        subMenu: [
          {
            id: 1,
            title: "Overview",
            link: "/dashboard/owner",
            navigation: true,
          },
          {
            id: 2,
            title: "Register Restaurant",
            link: "/dashboard/owner/add-restaurant",
            navigation: true,
          },
        ],
      },
    ],
  },
];

const SidebarNew = ({ isPFESIenabled = null, onLogout = () => {} }) => {
  const pathname = usePathname();

  const [expanded, setExpanded] = useState(() => {
    const stored = localStorage.getItem("sidebarExpanded");
    return stored !== null ? JSON.parse(stored) : true;
  });

  const [openMenus, setOpenMenus] = useState({});
  const [selectedMain, setSelectedMain] = useState(
    () => localStorage.getItem("selectedMainMenu") || "",
  );

  const handleMenuClick = (menu) => {
    if (menu.submenus?.length) {
      if (!expanded) setExpanded(true);
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

  const isLinkActive = (link) => link && pathname.startsWith(link);

  /* ── icon wrapper helper ── */
  const iconOf = (icon, active) => {
    if (!React.isValidElement(icon)) return icon;
    return React.cloneElement(icon, {
      className: `text-lg flex-shrink-0 transition-colors duration-200 ${
        active ? "text-primary" : "text-[#667085] dark:text-[#94a3b8]"
      }`,
    });
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: expanded ? 240 : 64 }}
      transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
      className=" top-0 left-0 z-[999] h-full flex flex-col
        bg-white dark:bg-[#0f172a]
        border-r border-[#e4e7ec] dark:border-[#1e293b]
        shadow-[2px_0_12px_rgba(0,0,0,0.06)] dark:shadow-[2px_0_12px_rgba(0,0,0,0.4)]
        overflow-hidden font-figtree select-none"
    >
      {/* ── TOP: logo + toggle ── */}
      <div className="flex items-center justify-between px-4 py-4 flex-shrink-0 min-h-[64px]">
        <AnimatePresence initial={false}>
          {expanded ? (
            <motion.div
              key="logo-full"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2 overflow-hidden"
            >
              {/* <img
                src={logo}
                alt="logo"
                className="h-7 w-7 object-contain flex-shrink-0"
              /> */}
              {/* <img src={logoFull} alt="brand" className="h-5 object-contain" /> */}
            </motion.div>
          ) : (
            <motion.div
              key="logo-icon"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {/* <img src={logo} alt="logo" className="h-7 w-7 object-contain" /> */}
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setExpanded((p) => !p)}
          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
            text-[#667085] dark:text-[#94a3b8]
            hover:bg-[#f2f4f7] dark:hover:bg-[#1e293b]
            transition-colors duration-200"
        >
          <HiMenuAlt2 className="text-xl" />
        </button>
      </div>

      {/* ── MAIN NAV ── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-2 scrollbar-hide">
        <ul className="flex flex-col gap-0.5">
          {navItems.map((menu) => {
            const isActive =
              pathname === menu.link ||
              menu.submenus?.some((group) =>
                group.subMenu?.some((item) => pathname.startsWith(item.link)),
              );
            const isOpen = openMenus[menu.id];
            const hasSubmenus = menu.submenus?.length > 0;

            return (
              <li key={menu.id}>
                {/* ── Parent item ── */}
                <Tooltip
                  title={!expanded ? menu.title : ""}
                  placement="right"
                  mouseEnterDelay={0.3}
                >
                  {menu.link ? (
                    <Link
                      href={menu.link}
                      target={menu.targetBlank ? "_blank" : undefined}
                      onClick={() => handleMenuClick(menu)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer
                        transition-all duration-200 group no-underline
                        ${
                          isActive
                            ? "bg-primary/10 dark:bg-primary/20"
                            : "hover:bg-[#f2f4f7] dark:hover:bg-[#1e293b]"
                        }`}
                    >
                      {iconOf(menu.icon, isActive)}

                      <AnimatePresence initial={false}>
                        {expanded && (
                          <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: "auto" }}
                            exit={{ opacity: 0, width: 0 }}
                            transition={{ duration: 0.2 }}
                            className={`text-sm font-medium whitespace-nowrap overflow-hidden
                              ${isActive ? "text-primary" : "text-[#344054] dark:text-[#e2e8f0]"}`}
                          >
                            {menu.title}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </Link>
                  ) : (
                    <div
                      onClick={() => handleMenuClick(menu)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer
                        transition-all duration-200 group
                        ${
                          isActive
                            ? "bg-primary/10 dark:bg-primary/20"
                            : "hover:bg-[#f2f4f7] dark:hover:bg-[#1e293b]"
                        }`}
                    >
                      {iconOf(menu.icon, isActive)}
                      <AnimatePresence initial={false}>
                        {expanded && (
                          <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: "auto" }}
                            exit={{ opacity: 0, width: 0 }}
                            transition={{ duration: 0.2 }}
                            className={`text-sm font-medium whitespace-nowrap overflow-hidden flex-1
                              ${isActive ? "text-primary" : "text-[#344054] dark:text-[#e2e8f0]"}`}
                          >
                            {menu.title}
                          </motion.span>
                        )}
                      </AnimatePresence>
                      {expanded && hasSubmenus && (
                        <motion.span
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="flex-shrink-0 text-[#667085] dark:text-[#94a3b8]"
                        >
                          <HiChevronDown className="text-base" />
                        </motion.span>
                      )}
                    </div>
                  )}
                </Tooltip>

                {/* ── Sub-menu groups ── */}
                <AnimatePresence initial={false}>
                  {expanded && isOpen && hasSubmenus && (
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
                          {/* Group heading */}
                          {group.title && (
                            <p
                              className="text-[10px] font-semibold uppercase tracking-widest
                              text-[#9aa8bc] dark:text-[#475569] px-3 pt-2 pb-1"
                            >
                              {group.title}
                            </p>
                          )}
                          {/* Sub-items */}
                          <ul className="flex flex-col gap-0.5 pl-3">
                            {group.subMenu?.map((item) => {
                              if (!item.navigation || !item.link) return null;

                              const itemActive = pathname.startsWith(item.link);

                              return (
                                <li key={item.id}>
                                  <Link
                                    href={item.link}
                                    onClick={() => handleSubClick(item.title)}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg no-underline text-xs
          ${
            itemActive
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
        </ul>
      </nav>

      {/* ── BOTTOM: settings + logout + user ── */}
      <div className="flex-shrink-0 border-t border-[#e4e7ec] dark:border-[#1e293b] px-2 py-2">
        {/* Settings & Help */}
        <ul className="flex flex-col gap-0.5 mb-2">
          {/* {bottomMenus.map((menu) => {
            const isActive = selectedMain === menu.title;
            return (
              <li key={menu.id}>
                <Tooltip
                  title={!expanded ? menu.title : ""}
                  placement="right"
                  mouseEnterDelay={0.3}
                >
                  <div
                    onClick={() => handleMenuClick(menu)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer
                      transition-all duration-200
                      ${
                        isActive
                          ? "bg-primary/10 dark:bg-primary/20"
                          : "hover:bg-[#f2f4f7] dark:hover:bg-[#1e293b]"
                      }`}
                  >
                    {iconOf(menu.icon, isActive)}
                    <AnimatePresence initial={false}>
                      {expanded && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.2 }}
                          className={`text-sm font-medium whitespace-nowrap overflow-hidden
                            ${isActive ? "text-primary" : "text-[#344054] dark:text-[#e2e8f0]"}`}
                        >
                          {menu.title}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </Tooltip>
              </li>
            );
          })} */}

          {/* Logout */}
          <li>
            <Tooltip
              title={!expanded ? "Logout" : ""}
              placement="right"
              mouseEnterDelay={0.3}
            >
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer
                  transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-900/20 group"
              >
                <PiSignOut
                  className="text-lg flex-shrink-0 text-[#667085] dark:text-[#94a3b8]
                  group-hover:text-red-500 transition-colors duration-200"
                />
                <AnimatePresence initial={false}>
                  {expanded && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-sm font-medium text-[#344054] dark:text-[#e2e8f0]
                        group-hover:text-red-500 whitespace-nowrap overflow-hidden"
                    >
                      Logout
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </Tooltip>
          </li>
        </ul>

        {/* User profile card */}
        <div
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl
          bg-[#f9fafb] dark:bg-[#1e293b]
          border border-[#e4e7ec] dark:border-[#334155]
          transition-all duration-200 overflow-hidden`}
        >
          {/* <div className="flex-shrink-0">
            <Avatar name={userName} image={userAvatar} border={false} />
          </div> */}
          {/* <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="flex-1 overflow-hidden flex items-center justify-between gap-1"
              >
                <div className="overflow-hidden">
                  <p
                    className="text-sm font-semibold text-[#101828] dark:text-white
                    whitespace-nowrap overflow-hidden text-ellipsis leading-tight"
                  >
                    {userName}
                  </p>
                  {userEmail && (
                    <p
                      className="text-xs text-[#667085] dark:text-[#94a3b8]
                      whitespace-nowrap overflow-hidden text-ellipsis leading-tight"
                    >
                      {userEmail}
                    </p>
                  )}
                </div>
                <button
                  className="flex-shrink-0 text-[#667085] dark:text-[#94a3b8]
                  hover:text-[#344054] dark:hover:text-white transition-colors duration-200 p-1"
                >
                  <BsThreeDotsVertical className="text-base" />
                </button>
              </motion.div>
            )}
          </AnimatePresence> */}
        </div>
      </div>
    </motion.aside>
  );
};

export default SidebarNew;
