"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Activity,
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  ChefHat,
  ChevronDown,
  Clock,
  FileText,
  LayoutGrid,
  MapPin,
  Plus,
  Settings,
  ShoppingBag,
  Star,
  Timer,
  TrendingUp,
  Users,
  UtensilsCrossed,
  Wallet,
  Zap,
} from "lucide-react";
import { action, API } from "@/lib/API";
import dayjs from "dayjs";

/* ── data ──────────────────────────────────────────────────────────────── */

const BRANCHES = ["Chennai Central", "Anna Nagar", "Velachery"];

const HEADER_STATS = [
  { label: "Orders Today", value: "ordersToday", Icon: ShoppingBag },
  { label: "Kitchen Queue", value: "kitchenQueue", Icon: ChefHat },
  {
    label: "Tables Active",
    value: "tablesActive",
    Icon: LayoutGrid,
    isSplit: true,
  },
  { label: "Today's Revenue", value: "todayRevenue", Icon: Wallet },
];

const STATUS_CONFIG = [
  {
    status: "completed",
    label: "Completed",
    color: "#22c55e",
    dot: "bg-emerald-500",
  },
  {
    status: "preparing",
    label: "Preparing",
    color: "#3b82f6",
    dot: "bg-blue-500",
  },
  {
    status: "ready_to_serve",
    label: "Ready to Serve",
    color: "#8b5cf6",
    dot: "bg-violet-500",
  },
  {
    status: "pending_payment",
    label: "Pending Payment",
    color: "#f59e0b",
    dot: "bg-amber-400",
  },
  {
    status: "cancelled",
    label: "Cancelled",
    color: "#f43f5e",
    dot: "bg-rose-500",
  },
];

const DINING_STATUS = [
  { label: "Available", value: 6, dot: "bg-emerald-400", total: 29 },
  { label: "Occupied", value: 18, dot: "bg-blue-500", total: 29 },
  { label: "Reserved", value: 3, dot: "bg-violet-500", total: 29 },
  { label: "Cleaning", value: 2, dot: "bg-amber-400", total: 29 },
];

const KITCHEN_PERF = [
  {
    label: "Avg Prep Time",
    value: "12 min",
    Icon: Timer,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    label: "Ready Orders",
    value: "18",
    Icon: CheckCircle2,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    label: "Urgent Orders",
    value: "3",
    Icon: AlertCircle,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
  },
  {
    label: "Chef Efficiency",
    value: "94%",
    Icon: Zap,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
];

const REVENUE = [
  { period: "Today", value: "₹1,25,450", pct: "+12.5%", up: true },
  { period: "This Week", value: "₹8,72,300", pct: "+8.3%", up: true },
  { period: "This Month", value: "₹32,14,500", pct: "+15.2%", up: true },
  { period: "This Year", value: "₹3,84,20,000", pct: "+22.7%", up: true },
];

const TOP_ITEMS = [
  { rank: 1, name: "Chicken Biryani", qty: 142, rev: "₹28,400", up: true },
  { rank: 2, name: "Paneer Butter Masala", qty: 98, rev: "₹19,600", up: true },
  { rank: 3, name: "Butter Naan", qty: 215, rev: "₹10,750", up: false },
  { rank: 4, name: "Fried Rice", qty: 76, rev: "₹11,400", up: true },
  { rank: 5, name: "Cold Coffee", qty: 63, rev: "₹7,875", up: false },
];

const ACTIVITIES = [
  {
    text: "Order #2456 Completed",
    time: "2 min ago",
    Icon: CheckCircle2,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    text: "Table 12 Closed",
    time: "8 min ago",
    Icon: LayoutGrid,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    text: "New Staff Added",
    time: "25 min ago",
    Icon: Users,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
  },
  {
    text: "Menu Updated",
    time: "1 hr ago",
    Icon: UtensilsCrossed,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    text: "Branch Settings Modified",
    time: "3 hr ago",
    Icon: Settings,
    color: "text-muted-foreground",
    bg: "bg-muted",
  },
];

const CUSTOMER_INSIGHTS = [
  {
    label: "New Customers",
    value: "84",
    Icon: Users,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    label: "Returning",
    value: "264",
    Icon: Activity,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    label: "VIP Members",
    value: "32",
    Icon: Star,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    label: "Avg Visits/Wk",
    value: "2.4×",
    Icon: TrendingUp,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
  },
];

const BRANCH_PERF = [
  {
    name: "Chennai Central",
    revenue: "₹65,000",
    pct: "+14.2%",
    up: true,
    w: 68,
  },
  { name: "Anna Nagar", revenue: "₹42,000", pct: "+8.5%", up: true, w: 44 },
  { name: "Velachery", revenue: "₹18,000", pct: "-3.2%", up: false, w: 19 },
];

const HOURLY = [
  { h: "9AM", v: 45 },
  { h: "11AM", v: 72 },
  { h: "1PM", v: 100 },
  { h: "3PM", v: 38 },
  { h: "5PM", v: 56 },
  { h: "7PM", v: 88 },
  { h: "9PM", v: 65 },
  { h: "11PM", v: 30 },
];

const QUICK_ACTIONS = [
  {
    label: "Create Order",
    Icon: Plus,
    href: "/dashboard/pos",
    cls: "bg-violet-600 hover:bg-violet-700",
  },
  {
    label: "Add Menu Item",
    Icon: UtensilsCrossed,
    href: "/dashboard/menus",
    cls: "bg-blue-600   hover:bg-blue-700",
  },
  {
    label: "Manage Tables",
    Icon: LayoutGrid,
    href: "/dashboard/tables",
    cls: "bg-emerald-600 hover:bg-emerald-700",
  },
  {
    label: "Open Kitchen",
    Icon: ChefHat,
    href: "/dashboard/kitchen",
    cls: "bg-orange-600 hover:bg-orange-700",
  },
  {
    label: "Generate Report",
    Icon: FileText,
    href: "/dashboard/analytics",
    cls: "bg-rose-600   hover:bg-rose-700",
  },
  {
    label: "Manage Staff",
    Icon: Users,
    href: "/dashboard/staff",
    cls: "bg-sky-600    hover:bg-sky-700",
  },
];

/* ── sub-components ────────────────────────────────────────────────────── */

function Card({ children, className }) {
  return (
    <div className={cn("bg-card rounded-2xl shadow-sm ", className)}>
      {children}
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <h2 className="shrink-0 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        {children}
      </h2>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

function LiveBadge() {
  return (
    <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
      Live
    </span>
  );
}

function DonutChart({ data }) {
  const R = 44;
  const sw = 11;
  const C = 2 * Math.PI * R;
  const total = data?.reduce((s, d) => s + d.value, 0);
  const GAP = 1.5;
  let acc = 0;
  const slices = data?.map((d) => {
    const len = Math.max(0, (d.value / total) * C - GAP);
    const off = acc;
    acc += len + GAP;
    return { ...d, len, off };
  });

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="108" height="108" viewBox="0 0 108 108">
        {/* Track uses CSS variable so it switches with the theme */}
        <circle
          cx="54"
          cy="54"
          r={R}
          fill="none"
          className="stroke-border"
          strokeWidth={sw}
        />
        <g transform="rotate(-90 54 54)">
          {slices?.map((s, i) => (
            <circle
              key={i}
              cx="54"
              cy="54"
              r={R}
              fill="none"
              strokeWidth={sw}
              stroke={s.color}
              strokeDasharray={`${s.len} ${C}`}
              strokeDashoffset={-s.off}
            />
          ))}
        </g>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-2xl font-bold text-foreground">{total}</span>
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
          Orders
        </span>
      </div>
    </div>
  );
}

/* ── page ─────────────────────────────────────────────────────────────── */

export default function DashboardPage() {
  const [now, setNow] = useState(new Date());
  const [branch, setBranch] = useState(BRANCHES[0]);
  const [branchOpen, setBranchOpen] = useState(false);
  const [liveOrders, setLiveOrders] = useState({});

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  const dateStr = now.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const apiBreakdown = liveOrders?.orderStatusBreakdown ?? [];
  const apiMap = Object.fromEntries(apiBreakdown.map((i) => [i.status, i]));
  const orderStatusData = STATUS_CONFIG.map(({ status, label, color, dot }) => {
    const api = apiMap[status];
    return {
      label: api?.label ?? label,
      value: api?.count ?? 0,
      percentage: api?.percentage ?? 0,
      color,
      dot,
    };
  });

  const getLiveOrdersList = async () => {
    try {
      const result = await action(API.TODAY_LIVE_ORDERS, {
        page: 1,
        limit: 20,
        date: dayjs().format("YYYY-MM-DD"),
      });
      if (result.statusCode === 200) {
        const orders = result.data;
        setLiveOrders(orders);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getLiveOrdersList();
  }, []);

  return (
    <div className="min-h-screen bg-background p-5 text-foreground">
      {/* ── Header ── */}
      <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Greeting + quick stats — dark aurora card */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-3xl border border-white/6 bg-[#0c0a1e] p-7 text-white shadow-2xl">
          {/* Aurora glow orbs */}
          <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-violet-700/50 blur-[100px]" />
          <div className="pointer-events-none absolute right-8 top-0 h-60 w-60 rounded-full bg-indigo-500/30 blur-[80px]" />
          <div className="pointer-events-none absolute -bottom-20 left-1/2 h-52 w-52 rounded-full bg-fuchsia-600/20 blur-[90px]" />

          {/* Dot-grid texture */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                "radial-gradient(circle, #ffffff 1px, transparent 1px)",
              backgroundSize: "22px 22px",
            }}
          />

          {/* Shimmer top edge */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-violet-400/40 to-transparent" />

          {/* Greeting row */}
          <div className="relative z-10 mb-8 flex items-start justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/35">
                  {dateStr}
                </p>
              </div>
              <h1 className="text-3xl font-bold tracking-tight">
                {greeting}, Admin 👋
              </h1>
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-white/8 bg-white/5 px-3 py-1.5 backdrop-blur-sm">
                <Clock className="h-3 w-3 text-white/30" />
                <span className="font-mono text-sm tabular-nums text-white/55">
                  {timeStr}
                </span>
              </div>
            </div>

            {/* Branch selector */}
            <div className="relative">
              <button
                onClick={() => setBranchOpen((p) => !p)}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/8 px-4 py-2.5 text-sm font-medium backdrop-blur-sm transition-all duration-200 hover:border-white/20 hover:bg-white/12"
              >
                <MapPin className="h-3.5 w-3.5 text-violet-400" />
                {branch}
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 text-white/40 transition-transform duration-200",
                    branchOpen && "rotate-180",
                  )}
                />
              </button>
              {branchOpen && (
                <div className="absolute right-0 top-11 z-20 w-48 overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
                  {BRANCHES.map((b) => (
                    <button
                      key={b}
                      onClick={() => {
                        setBranch(b);
                        setBranchOpen(false);
                      }}
                      className={cn(
                        "w-full px-4 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-muted",
                        b === branch && "font-semibold text-primary",
                      )}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Stat tiles */}
          <div className="relative z-10 grid grid-cols-4 gap-3">
            {HEADER_STATS.map(({ label, value, Icon, isSplit }, i) => {
              const accent = [
                {
                  icon: "text-violet-400",
                  ring: "bg-violet-500/[0.15]  ring-1 ring-violet-500/20",
                },
                {
                  icon: "text-orange-400",
                  ring: "bg-orange-500/[0.15]  ring-1 ring-orange-500/20",
                },
                {
                  icon: "text-blue-400",
                  ring: "bg-blue-500/[0.15]    ring-1 ring-blue-500/20",
                },
                {
                  icon: "text-emerald-400",
                  ring: "bg-emerald-500/[0.15] ring-1 ring-emerald-500/20",
                },
              ][i];
              return (
                <div
                  key={label}
                  className="group relative rounded-2xl border border-white/7 bg-white/5 p-4 backdrop-blur-sm transition-all duration-300 hover:border-white/[0.14] hover:bg-white/8"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-xl",
                        accent.ring,
                      )}
                    >
                      <Icon className={cn("h-4 w-4", accent.icon)} />
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-white/12 transition-colors duration-200 group-hover:text-emerald-400" />
                  </div>
                  <p className="text-2xl font-bold tabular-nums">
                    {isSplit
                      ? liveOrders[value]?.occupied +
                        "/" +
                        liveOrders[value]?.total
                      : liveOrders[value]}
                  </p>
                  <p className="mt-1 text-[11px] text-white/40">{label}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order distribution donut */}
        <Card className="p-5">
          <div className="flex items-center mb-4">
            <h3 className="text-sm font-semibold text-foreground">
              Order Distribution
            </h3>
            <LiveBadge />
          </div>
          <div className="flex justify-center mb-4">
            <DonutChart data={orderStatusData} />
          </div>
          <div className="space-y-2">
            {orderStatusData?.map((s) => (
              <div key={s.label} className="flex items-center gap-2">
                <span className={cn("w-2 h-2 rounded-full shrink-0", s.dot)} />
                <span className="text-xs text-muted-foreground flex-1">
                  {s.label}
                </span>
                <span className="text-xs font-semibold text-foreground tabular-nums">
                  {s.value}
                </span>
                <span className="text-[10px] text-muted-foreground w-7 text-right tabular-nums">
                  {s.percentage}%
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Live Operations ── */}
      <div className="mb-6">
        <SectionTitle>Live Operations</SectionTitle>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <Card className="p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-blue-500" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">
                Order Status
              </h3>
              <LiveBadge />
            </div>
            <div className="space-y-3">
              {orderStatusData?.map((s) => (
                <div key={s.label} className="flex items-center gap-2">
                  <span
                    className={cn("w-2.5 h-2.5 rounded-full shrink-0", s.dot)}
                  />
                  <span className="text-sm text-muted-foreground flex-1">
                    {s.label}
                  </span>
                  <span className="text-sm font-bold text-foreground tabular-nums">
                    {s.value}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <ChefHat className="w-4 h-4 text-orange-500" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">
                Kitchen Performance
              </h3>
              <LiveBadge />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {KITCHEN_PERF.map(({ label, value, Icon, color, bg }) => (
                <div key={label} className={cn("rounded-xl p-3.5", bg)}>
                  <Icon className={cn("w-4 h-4 mb-2", color)} />
                  <p className="text-lg font-bold text-foreground tabular-nums">
                    {value}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center">
                <LayoutGrid className="w-4 h-4 text-violet-500" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">
                Dining Status
              </h3>
              <LiveBadge />
            </div>
            <div className="space-y-3.5">
              {DINING_STATUS.map((s) => (
                <div key={s.label}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className={cn("w-2 h-2 rounded-full shrink-0", s.dot)}
                    />
                    <span className="text-sm text-muted-foreground flex-1">
                      {s.label}
                    </span>
                    <span className="text-sm font-bold text-foreground tabular-nums">
                      {s.value}
                    </span>
                  </div>
                  <div className="ml-4 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full", s.dot)}
                      style={{ width: `${(s.value / s.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* ── Revenue ── */}
      <div className="mb-6">
        <SectionTitle>Revenue Summary</SectionTitle>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Revenue Breakdown
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {REVENUE.map(({ period, value, pct, up }) => (
                <div key={period} className="rounded-xl bg-muted p-4">
                  <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">
                    {period}
                  </p>
                  <p className="text-xl font-bold text-foreground mt-2 tabular-nums">
                    {value}
                  </p>
                  <span
                    className={cn(
                      "inline-flex items-center gap-0.5 text-xs font-semibold mt-1",
                      up ? "text-emerald-500" : "text-rose-500",
                    )}
                  >
                    {up ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                    {pct}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold text-foreground">
                Hourly Revenue
              </h3>
              <span className="text-[10px] font-medium text-muted-foreground bg-muted border border-border px-2.5 py-1 rounded-lg">
                Today
              </span>
            </div>
            <div className="flex items-end gap-1.5" style={{ height: 100 }}>
              {HOURLY.map(({ h, v }) => (
                <div
                  key={h}
                  className="flex-1 flex flex-col items-center gap-1.5"
                >
                  <div className="w-full flex items-end" style={{ height: 80 }}>
                    <div
                      className="w-full bg-violet-500 rounded-t-md hover:bg-violet-600 transition-colors cursor-default"
                      style={{ height: `${v}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-muted-foreground">{h}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* ── Top Items + Activities ── */}
      <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Star className="w-4 h-4 text-amber-500" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">
              Top Selling Items
            </h3>
          </div>
          <div className="space-y-1">
            {TOP_ITEMS.map(({ rank, name, qty, rev, up }) => (
              <div
                key={name}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-muted transition-colors"
              >
                <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                  {rank}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {name}
                  </p>
                  <p className="text-xs text-muted-foreground">{qty} sold</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-foreground tabular-nums">
                    {rev}
                  </p>
                  <span
                    className={cn(
                      "text-xs font-semibold",
                      up ? "text-emerald-500" : "text-rose-500",
                    )}
                  >
                    {up ? "↑ Up" : "↓ Down"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 flex items-center justify-center">
              <Activity className="w-4 h-4 text-sky-500" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">
              Recent Activities
            </h3>
          </div>
          <div>
            {ACTIVITIES.map(({ text, time, Icon, color, bg }, i) => (
              <div key={text} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                      bg,
                    )}
                  >
                    <Icon className={cn("w-3.5 h-3.5", color)} />
                  </div>
                  {i < ACTIVITIES.length - 1 && (
                    <div
                      className="w-px flex-1 my-1 bg-border"
                      style={{ minHeight: 12 }}
                    />
                  )}
                </div>
                <div className="pb-3 pt-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{text}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Customer Insights + Branch Performance ── */}
      <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Customer Insights
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {CUSTOMER_INSIGHTS.map(({ label, value, Icon, color, bg }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-xl bg-muted p-4"
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    bg,
                  )}
                >
                  <Icon className={cn("w-5 h-5", color)} />
                </div>
                <div className="min-w-0">
                  <p className="text-xl font-bold text-foreground tabular-nums">
                    {value}
                  </p>
                  <p className="text-xs text-muted-foreground leading-tight">
                    {label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-foreground mb-5">
            Branch Performance
          </h3>
          <div className="space-y-5">
            {BRANCH_PERF.map(({ name, revenue, pct, up, w }) => (
              <div key={name}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">
                      {name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground tabular-nums">
                      {revenue}
                    </span>
                    <span
                      className={cn(
                        "text-xs font-semibold",
                        up ? "text-emerald-500" : "text-rose-500",
                      )}
                    >
                      {pct}
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-700",
                      up ? "bg-emerald-500" : "bg-rose-500",
                    )}
                    style={{ width: `${w}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Quick Actions ── */}
      <div>
        <SectionTitle>Quick Actions</SectionTitle>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {QUICK_ACTIONS.map(({ label, Icon, href, cls }) => (
            <Link key={label} href={href}>
              <div
                className={cn(
                  "flex flex-col items-center gap-3 rounded-2xl p-5 text-white text-center",
                  "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg cursor-pointer select-none",
                  cls,
                )}
              >
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold leading-tight">{label}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
