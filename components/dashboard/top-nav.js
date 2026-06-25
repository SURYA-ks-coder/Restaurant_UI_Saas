"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Bell,
  CalendarCheck,
  CalendarX,
  Check,
  CheckCircle2,
  ChefHat,
  Clock,
  LayoutGrid,
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

const NOTIFICATION_ICON_MAP = {
  // Orders
  order_created:         { Icon: ShoppingBag,    color: "text-violet-500" },
  order_completed:       { Icon: CheckCircle2,   color: "text-emerald-500" },
  order_cancelled:       { Icon: AlertCircle,    color: "text-rose-500" },
  payment_received:      { Icon: Wallet,         color: "text-emerald-500" },
  // KOT
  kot_created:           { Icon: ChefHat,        color: "text-orange-500" },
  kot_ready:             { Icon: Bell,           color: "text-blue-500" },
  kot_served:            { Icon: UtensilsCrossed,color: "text-violet-500" },
  // Stock
  low_stock:             { Icon: AlertCircle,    color: "text-amber-500" },
  // Reservations
  reservation_confirmed: { Icon: CalendarCheck,  color: "text-violet-500" },
  reservation_cancelled: { Icon: CalendarX,      color: "text-rose-500" },
  // Milestones / misc
  sales_milestone:       { Icon: TrendingUp,     color: "text-emerald-500" },
  table_closed:          { Icon: LayoutGrid,     color: "text-blue-500" },
  staff_added:           { Icon: Users,          color: "text-violet-500" },
  menu_updated:          { Icon: UtensilsCrossed,color: "text-amber-500" },
  branch_settings:       { Icon: Settings,       color: "text-muted-foreground" },
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
              onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
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
          aria-label={isLightTheme ? "Switch to dark theme" : "Switch to light theme"}
          title={isLightTheme ? "Dark theme" : "Light theme"}
        >
          {isLightTheme ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
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
          <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
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
                const { Icon, color } = NOTIFICATION_ICON_MAP[n.type] ?? DEFAULT_ICON;
                return (
                  <DropdownMenuItem key={n.id} className="gap-3 py-3 items-start">
                    <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${color}`} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium leading-snug">{n.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{n.description}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{relativeTime(n.timestamp)}</p>
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
                <span className="block text-xs text-muted-foreground">Manager</span>
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
