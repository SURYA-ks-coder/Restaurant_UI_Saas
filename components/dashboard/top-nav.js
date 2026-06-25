"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Bell,
  Building2,
  CalendarCheck,
  CalendarX,
  Check,
  CheckCircle2,
  ChefHat,
  ChevronDown,
  Clock,
  LayoutGrid,
  MapPin,
  Menu,
  Mic,
  Moon,
  Search,
  Settings,
  ShoppingBag,
  Sun,
  TrendingUp,
  UtensilsCrossed,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getSocket } from "@/components/services/socket";
import { getAction, API } from "@/lib/API";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

const NOTIFICATION_ICON_MAP = {
  // Orders
  order_created: { Icon: ShoppingBag, color: "text-violet-500" },
  order_completed: { Icon: CheckCircle2, color: "text-emerald-500" },
  order_cancelled: { Icon: AlertCircle, color: "text-rose-500" },
  payment_received: { Icon: Wallet, color: "text-emerald-500" },
  // KOT
  kot_created: { Icon: ChefHat, color: "text-orange-500" },
  kot_ready: { Icon: Bell, color: "text-blue-500" },
  kot_served: { Icon: UtensilsCrossed, color: "text-violet-500" },
  // Stock
  low_stock: { Icon: AlertCircle, color: "text-amber-500" },
  // Reservations
  reservation_confirmed: { Icon: CalendarCheck, color: "text-violet-500" },
  reservation_cancelled: { Icon: CalendarX, color: "text-rose-500" },
  // Milestones / misc
  sales_milestone: { Icon: TrendingUp, color: "text-emerald-500" },
  table_closed: { Icon: LayoutGrid, color: "text-blue-500" },
  staff_added: { Icon: Users, color: "text-violet-500" },
  menu_updated: { Icon: UtensilsCrossed, color: "text-amber-500" },
  branch_settings: { Icon: Settings, color: "text-muted-foreground" },
};

const DEFAULT_ICON = { Icon: Bell, color: "text-primary" };

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    type: "order_created",
    title: "New Order #INV-1719123456-342",
    description: "Table 5 · 3 items",
    timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
  },
  {
    id: 2,
    type: "kot_ready",
    title: "Order Ready to Serve",
    description: "Table 5 is ready",
    timestamp: new Date(Date.now() - 8 * 60000).toISOString(),
  },
  {
    id: 3,
    type: "low_stock",
    title: "Low Stock Alert",
    description: "Salmon running low (3 left)",
    timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
  },
  {
    id: 4,
    type: "reservation_confirmed",
    title: "Reservation Confirmed",
    description: "08:00 PM · Party of 6",
    timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
  },
  {
    id: 5,
    type: "sales_milestone",
    title: "Sales Milestone Reached!",
    description: "Daily revenue crossed ₹50,000",
    timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
  },
];

const relativeTime = (ts) => {
  const mins = Math.floor((Date.now() - new Date(ts).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  return hrs < 24 ? `${hrs} hr ago` : `${Math.floor(hrs / 24)} days ago`;
};

export function TopNav({ onMenuToggle, onLogout }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [profileHref, setProfileHref] = useState("/dashboard/staff");
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [unreadCount, setUnreadCount] = useState(INITIAL_NOTIFICATIONS.length);
  const { resolvedTheme, setTheme } = useTheme();

  // ── Branch selector state ──────────────────────────────────────────────────
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);
  const [branchSearch, setBranchSearch] = useState("");
  const [branchLoading, setBranchLoading] = useState(false);
  const branchRef = useRef(null);

  // Close branch dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (branchRef.current && !branchRef.current.contains(e.target)) {
        setBranchDropdownOpen(false);
        setBranchSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Fetch branch list and restore saved selection
  useEffect(() => {
    const fetchBranches = async () => {
      setBranchLoading(true);
      try {
        const result = await getAction(API.GET_BRANCH_LIST);
        if (result?.statusCode === 200) {
          const list = result.data || [];
          setBranches(list);

          const savedId = localStorage.getItem("branchId");
          const found = list.find((b) => b._id === savedId);
          if (found) {
            setSelectedBranch(found);
          } else if (list.length > 0) {
            setSelectedBranch(list[0]);
            localStorage.setItem("branchId", list[0]._id);
          }
        }
      } catch {
        // silently handle
      } finally {
        setBranchLoading(false);
      }
    };
    fetchBranches();
  }, []);

  const handleSelectBranch = (branch) => {
    setSelectedBranch(branch);
    localStorage.setItem("branchId", branch._id);
    setBranchDropdownOpen(false);
    setBranchSearch("");
    // Notify other components that branch changed
    window.dispatchEvent(
      new CustomEvent("branchChanged", { detail: { branchId: branch._id } }),
    );
  };

  const filteredBranches = branches.filter((b) => {
    const q = branchSearch.toLowerCase();
    return (
      (b.branchName || b.name || "").toLowerCase().includes(q) ||
      (b.location || b.address || "").toLowerCase().includes(q)
    );
  });
  // ──────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    setMounted(true);
    const userId =
      localStorage.getItem("userId") ||
      localStorage.getItem("staffId") ||
      localStorage.getItem("_id");
    if (userId) setProfileHref(`/dashboard/staff/${userId}`);
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNotification = (notification) => {
      const newEntry = {
        id: Date.now(),
        type: notification.type,
        title: notification.title,
        description: notification.description,
        timestamp: notification.timestamp ?? new Date().toISOString(),
      };
      setNotifications((prev) => [newEntry, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    socket.on("notification:new", handleNotification);
    return () => socket.off("notification:new", handleNotification);
  }, []);

  const handleDropdownOpen = (open) => {
    if (open) setUnreadCount(0);
  };

  const isLightTheme = mounted && resolvedTheme === "light";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between bg-white dark:bg-background shadow px-4 backdrop-blur md:px-8">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* ── Branch Selector ── */}
        <div className="relative" ref={branchRef}>
          {/* Trigger button */}
          <motion.button
            onClick={() => setBranchDropdownOpen((p) => !p)}
            whileTap={{ scale: 0.96 }}
            className={cn(
              "flex items-center gap-2 h-10 px-3 rounded-lg  transition-colors text-sm font-medium",
              branchDropdownOpen
                ? " bg-primary/5 text-primary"
                : " bg-muted/50 text-foreground hover:bg-muted",
            )}
          >
            <Building2 className="h-4 w-4 text-primary shrink-0" />

            {/* Branch name — cross-fades when selection changes */}
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={selectedBranch?._id ?? "empty"}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="hidden sm:block max-w-32 truncate"
              >
                {branchLoading
                  ? "Loading..."
                  : selectedBranch
                    ? selectedBranch.branchName ||
                      selectedBranch.name ||
                      "Branch"
                    : "Select Branch"}
              </motion.span>
            </AnimatePresence>

            {/* Chevron — rotates on open/close */}
            <motion.span
              animate={{ rotate: branchDropdownOpen ? 180 : 0 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="flex items-center"
            >
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </motion.span>
          </motion.button>

          {/* Dropdown panel */}
          <AnimatePresence>
            {branchDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                className="absolute top-[calc(100%+6px)] left-0 w-72 bg-popover  rounded-xl shadow-xl z-50 overflow-hidden"
              >
                {/* Search */}
                <div className="p-2 border-b border-border">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      autoFocus
                      value={branchSearch}
                      onChange={(e) => setBranchSearch(e.target.value)}
                      placeholder="Search branch..."
                      className="w-full h-8 pl-8 pr-3 text-xs rounded-lg  outline-none focus:border-primary text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                </div>

                {/* Branch list — staggered children */}
                <div className="max-h-60 overflow-y-auto py-1">
                  {filteredBranches.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="py-6 text-center text-xs text-muted-foreground"
                    >
                      No branches found
                    </motion.div>
                  ) : (
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      variants={{
                        visible: { transition: { staggerChildren: 0.05 } },
                      }}
                    >
                      {filteredBranches.map((branch) => {
                        const isSelected = selectedBranch?._id === branch._id;
                        return (
                          <motion.button
                            key={branch._id}
                            variants={{
                              hidden: { opacity: 0, x: -10 },
                              visible: {
                                opacity: 1,
                                x: 0,
                                transition: { duration: 0.15 },
                              },
                            }}
                            whileHover={{ backgroundColor: "var(--muted)" }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleSelectBranch(branch)}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-2.5 text-left",
                              isSelected && "bg-primary/5",
                            )}
                          >
                            <div
                              className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                                isSelected ? "bg-primary/10" : "bg-muted",
                              )}
                            >
                              <Building2
                                className={cn(
                                  "h-4 w-4 transition-colors",
                                  isSelected
                                    ? "text-primary"
                                    : "text-muted-foreground",
                                )}
                              />
                            </div>

                            <div className="flex-1 min-w-0">
                              <p
                                className={cn(
                                  "text-sm font-medium truncate transition-colors",
                                  isSelected
                                    ? "text-primary"
                                    : "text-foreground",
                                )}
                              >
                                {branch.branchName ||
                                  branch.name ||
                                  "Unnamed Branch"}
                              </p>
                              {(branch.location || branch.address) && (
                                <p className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                                  <MapPin className="h-3 w-3 shrink-0" />
                                  {branch.location || branch.address}
                                </p>
                              )}
                            </div>

                            {/* Check mark — springs in/out */}
                            <AnimatePresence>
                              {isSelected && (
                                <motion.span
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 0, opacity: 0 }}
                                  transition={{
                                    type: "spring",
                                    stiffness: 500,
                                    damping: 28,
                                  }}
                                  className="shrink-0"
                                >
                                  <Check className="h-4 w-4 text-primary" />
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </motion.button>
                        );
                      })}
                    </motion.div>
                  )}
                </div>

                {/* Footer */}
                {branches.length > 0 && (
                  <div className="px-3 py-2 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      {branches.length} branch
                      {branches.length !== 1 ? "es" : ""} available
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Search Bar ── */}
        {searchOpen ? (
          <div className="relative w-[min(70vw,28rem)]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search orders, tables, menu..."
              autoFocus
              className="h-10 w-full rounded-lg border border-border bg-muted pl-10 pr-10 text-sm outline-none focus:border-primary"
            />
            <button
              onClick={() => {
                setSearchOpen(false);
                setSearchQuery("");
              }}
              className="absolute right-2 top-1/2 rounded-md p-1 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden h-10 items-center gap-3 rounded-lg bg-muted px-4 text-sm text-muted-foreground hover:text-foreground md:flex"
          >
            <Search className="h-4 w-4" />
            <span>Search...</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          type="button"
          onClick={() => setTheme(isLightTheme ? "dark" : "light")}
          className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label={
            isLightTheme ? "Switch to dark theme" : "Switch to light theme"
          }
          title={isLightTheme ? "Dark theme" : "Light theme"}
        >
          {isLightTheme ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
        </button>

        {/* Notifications */}
        <DropdownMenu onOpenChange={handleDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <button className="relative rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white leading-none">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-80 max-h-96 overflow-y-auto"
          >
            <DropdownMenuLabel className="flex items-center justify-between">
              Notifications
              {unreadCount > 0 && <Badge>{unreadCount} new</Badge>}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No notifications
              </div>
            ) : (
              notifications.map((n) => {
                const { Icon, color } =
                  NOTIFICATION_ICON_MAP[n.type] ?? DEFAULT_ICON;
                return (
                  <DropdownMenuItem
                    key={n.id}
                    className="gap-3 py-3 items-start"
                  >
                    <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${color}`} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium leading-snug">
                        {n.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {n.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {relativeTime(n.timestamp)}
                      </p>
                    </div>
                  </DropdownMenuItem>
                );
              })
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <button className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
          <Mic className="h-5 w-5" />
        </button>

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 rounded-lg p-1.5 hover:bg-muted">
              <Avatar className="h-8 w-8">
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <span className="hidden text-left md:block">
                <span className="block text-sm font-medium">Alex Drake</span>
                <span className="block text-xs text-muted-foreground">
                  Manager
                </span>
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={profileHref}>Staff Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onLogout}
              className="text-destructive focus:text-destructive"
            >
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
