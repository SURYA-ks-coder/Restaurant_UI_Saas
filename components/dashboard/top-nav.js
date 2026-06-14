"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bell,
  Check,
  Clock,
  Menu,
  Mic,
  Moon,
  Search,
  Sun,
  TrendingUp,
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

const notifications = [
  {
    id: 1,
    title: "New order #1234",
    description: "Table 5 - 3 items",
    time: "2 min ago",
    icon: Check,
  },
  {
    id: 2,
    title: "Low stock alert",
    description: "Salmon running low",
    time: "15 min ago",
    icon: Clock,
  },
  {
    id: 3,
    title: "Reservation confirmed",
    description: "8:00 PM - Party of 6",
    time: "1 hour ago",
    icon: Bell,
  },
  {
    id: 4,
    title: "Sales milestone",
    description: "Daily target reached",
    time: "2 hours ago",
    icon: TrendingUp,
  },
];

export function TopNav({ onMenuToggle, onLogout }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [profileHref, setProfileHref] = useState("/dashboard/staff");
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    const userId =
      localStorage.getItem("userId") ||
      localStorage.getItem("staffId") ||
      localStorage.getItem("_id");
    if (userId) setProfileHref(`/dashboard/staff/${userId}`);
  }, []);

  const isLightTheme = mounted && resolvedTheme === "light";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between  bg-white dark:bg-background shadow px-4 backdrop-blur md:px-8">
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
              onChange={(event) => setSearchQuery(event.target.value)}
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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              Notifications
              <Badge>4 new</Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.map((notification) => {
              const Icon = notification.icon;
              return (
                <DropdownMenuItem key={notification.id} className="gap-3 py-3">
                  <Icon className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{notification.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {notification.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {notification.time}
                    </p>
                  </div>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        <button className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
          <Mic className="h-5 w-5" />
        </button>

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
