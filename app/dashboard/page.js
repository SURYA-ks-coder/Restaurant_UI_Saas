"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
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
import { cn } from "@/lib/utils";

/* ─── static data ─────────────────────────────────────────────────────────── */

const BRANCHES = ["Chennai Central", "Anna Nagar", "Velachery"];

const KPI_CARDS = [
  {
    title: "Today's Revenue",
    value: "₹1,25,450",
    sub: "+12.5% from yesterday",
    trend: "up",
    Icon: Wallet,
    cardCls: "from-violet-500/20 via-purple-500/10 to-transparent border-violet-500/20",
    iconCls: "bg-violet-500/20 text-violet-400",
  },
  {
    title: "Total Orders",
    value: "348",
    sub: "+28 new orders",
    trend: "up",
    Icon: ShoppingBag,
    cardCls: "from-blue-500/20 via-cyan-500/10 to-transparent border-blue-500/20",
    iconCls: "bg-blue-500/20 text-blue-400",
  },
  {
    title: "Avg. Order Value",
    value: "₹360",
    sub: "+4.2%",
    trend: "up",
    Icon: TrendingUp,
    cardCls: "from-emerald-500/20 via-teal-500/10 to-transparent border-emerald-500/20",
    iconCls: "bg-emerald-500/20 text-emerald-400",
  },
  {
    title: "Active Tables",
    value: "18 / 24",
    sub: "75% Occupancy",
    trend: "neutral",
    Icon: LayoutGrid,
    cardCls: "from-orange-500/20 via-amber-500/10 to-transparent border-orange-500/20",
    iconCls: "bg-orange-500/20 text-orange-400",
  },
  {
    title: "Kitchen Queue",
    value: "12 Pending",
    sub: "3 Delayed",
    trend: "down",
    Icon: ChefHat,
    cardCls: "from-rose-500/20 via-pink-500/10 to-transparent border-rose-500/20",
    iconCls: "bg-rose-500/20 text-rose-400",
  },
  {
    title: "Staff On Duty",
    value: "24",
    sub: "2 On Leave",
    trend: "neutral",
    Icon: Users,
    cardCls: "from-sky-500/20 via-indigo-500/10 to-transparent border-sky-500/20",
    iconCls: "bg-sky-500/20 text-sky-400",
  },
];

const ORDER_STATUS = [
  { label: "Completed", value: 215, dot: "bg-emerald-500", val: "text-emerald-400" },
  { label: "Preparing", value: 34, dot: "bg-blue-500", val: "text-blue-400" },
  { label: "Ready to Serve", value: 18, dot: "bg-violet-500", val: "text-violet-400" },
  { label: "Pending Payment", value: 12, dot: "bg-amber-500", val: "text-amber-400" },
  { label: "Cancelled", value: 4, dot: "bg-rose-500", val: "text-rose-400" },
];

const DINING_STATUS = [
  { label: "Available", value: 6, dot: "bg-emerald-500", val: "text-emerald-400" },
  { label: "Occupied", value: 18, dot: "bg-blue-500", val: "text-blue-400" },
  { label: "Reserved", value: 3, dot: "bg-violet-500", val: "text-violet-400" },
  { label: "Cleaning", value: 2, dot: "bg-amber-500", val: "text-amber-400" },
];

const KITCHEN_PERF = [
  { label: "Avg. Prep Time", value: "12 min", Icon: Timer, cls: "text-blue-400" },
  { label: "Ready Orders", value: "18", Icon: CheckCircle2, cls: "text-emerald-400" },
  { label: "Urgent Orders", value: "3", Icon: AlertCircle, cls: "text-rose-400" },
  { label: "Chef Efficiency", value: "94%", Icon: Zap, cls: "text-amber-400" },
];

const REVENUE = [
  { period: "Today", value: "₹1,25,450", pct: "+12.5%" },
  { period: "This Week", value: "₹8,72,300", pct: "+8.3%" },
  { period: "This Month", value: "₹32,14,500", pct: "+15.2%" },
  { period: "This Year", value: "₹3,84,20,000", pct: "+22.7%" },
];

const TOP_ITEMS = [
  { rank: 1, name: "Chicken Biryani", qty: 142, rev: "₹28,400", up: true },
  { rank: 2, name: "Paneer Butter Masala", qty: 98, rev: "₹19,600", up: true },
  { rank: 3, name: "Butter Naan", qty: 215, rev: "₹10,750", up: false },
  { rank: 4, name: "Fried Rice", qty: 76, rev: "₹11,400", up: true },
  { rank: 5, name: "Cold Coffee", qty: 63, rev: "₹7,875", up: false },
];

const ACTIVITIES = [
  { text: "Order #2456 Completed", time: "2 min ago", Icon: CheckCircle2, cls: "text-emerald-400", bg: "bg-emerald-500/10" },
  { text: "Table 12 Closed", time: "8 min ago", Icon: LayoutGrid, cls: "text-blue-400", bg: "bg-blue-500/10" },
  { text: "New Staff Added", time: "25 min ago", Icon: Users, cls: "text-violet-400", bg: "bg-violet-500/10" },
  { text: "Menu Updated", time: "1 hr ago", Icon: UtensilsCrossed, cls: "text-amber-400", bg: "bg-amber-500/10" },
  { text: "Branch Settings Modified", time: "3 hr ago", Icon: Settings, cls: "text-sky-400", bg: "bg-sky-500/10" },
];

const CUSTOMER_INSIGHTS = [
  { label: "New Customers", value: "84", Icon: Users, cls: "text-emerald-400", bg: "bg-emerald-500/10" },
  { label: "Returning", value: "264", Icon: Activity, cls: "text-blue-400", bg: "bg-blue-500/10" },
  { label: "VIP Customers", value: "32", Icon: Star, cls: "text-amber-400", bg: "bg-amber-500/10" },
  { label: "Avg. Visit / Week", value: "2.4×", Icon: TrendingUp, cls: "text-violet-400", bg: "bg-violet-500/10" },
];

const BRANCH_PERF = [
  { name: "Chennai Central", revenue: "₹65,000", pct: "+14.2%", up: true, width: "68%" },
  { name: "Anna Nagar", revenue: "₹42,000", pct: "+8.5%", up: true, width: "44%" },
  { name: "Velachery", revenue: "₹18,000", pct: "-3.2%", up: false, width: "19%" },
];

const QUICK_ACTIONS = [
  { label: "Create Order", Icon: Plus, href: "/dashboard/pos", cls: "from-violet-600 to-purple-700" },
  { label: "Add Menu Item", Icon: UtensilsCrossed, href: "/dashboard/menus", cls: "from-blue-600 to-cyan-700" },
  { label: "Manage Tables", Icon: LayoutGrid, href: "/dashboard/tables", cls: "from-emerald-600 to-teal-700" },
  { label: "Open Kitchen", Icon: ChefHat, href: "/dashboard/kitchen", cls: "from-orange-600 to-amber-700" },
  { label: "Generate Report", Icon: FileText, href: "/dashboard/analytics", cls: "from-rose-600 to-pink-700" },
  { label: "Manage Staff", Icon: Users, href: "/dashboard/staff", cls: "from-sky-600 to-indigo-700" },
];

/* ─── shared sub-components ───────────────────────────────────────────────── */

function Glass({ children, className }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm",
        "shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl",
        className,
      )}
    >
      {children}
    </div>
  );
}

function SectionHeading({ children }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <h2 className="shrink-0 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        {children}
      </h2>
      <div className="h-px flex-1 bg-border/40" />
    </div>
  );
}

function LiveDot() {
  return (
    <span className="relative ml-auto flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
    </span>
  );
}

function Trend({ up, label }) {
  return up ? (
    <span className="inline-flex items-center gap-0.5 text-xs font-medium text-emerald-400">
      <ArrowUpRight className="h-3 w-3" />
      {label}
    </span>
  ) : (
    <span className="inline-flex items-center gap-0.5 text-xs font-medium text-rose-400">
      <ArrowDownRight className="h-3 w-3" />
      {label}
    </span>
  );
}

/* ─── page ───────────────────────────────────────────────────────────────── */

export default function DashboardPage() {
  const [now, setNow] = useState(new Date());
  const [branch, setBranch] = useState(BRANCHES[0]);
  const [branchOpen, setBranchOpen] = useState(false);

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

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <p className="text-xs font-medium text-muted-foreground">{dateStr}</p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
            {greeting}, Admin 👋
          </h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {timeStr}
          </p>
        </div>

        {/* Branch selector */}
        <div className="relative">
          <button
            onClick={() => setBranchOpen((p) => !p)}
            className="flex items-center gap-2 rounded-xl border border-border/60 bg-card/60 px-4 py-2.5 text-sm font-medium backdrop-blur-sm transition-colors hover:bg-card"
          >
            <MapPin className="h-3.5 w-3.5 text-primary" />
            {branch}
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform duration-200",
                branchOpen && "rotate-180",
              )}
            />
          </button>
          {branchOpen && (
            <div className="absolute right-0 top-12 z-20 w-48 overflow-hidden rounded-xl border border-border/60 bg-card shadow-2xl">
              {BRANCHES.map((b) => (
                <button
                  key={b}
                  onClick={() => { setBranch(b); setBranchOpen(false); }}
                  className={cn(
                    "flex w-full items-center px-4 py-2.5 text-sm transition-colors hover:bg-muted",
                    b === branch && "font-semibold text-primary",
                  )}
                >
                  {b}
                </button>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Section 1: KPI Cards ── */}
      <section className="mb-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {KPI_CARDS.map(({ title, value, sub, trend, Icon, cardCls, iconCls }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <div
                className={cn(
                  "relative overflow-hidden rounded-2xl border bg-linear-to-br p-5",
                  "transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
                  cardCls,
                )}
              >
                {/* faint glow orb */}
                <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/5 blur-2xl" />

                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-medium text-muted-foreground leading-snug">
                    {title}
                  </p>
                  <div
                    className={cn(
                      "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg",
                      iconCls,
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                </div>

                <p className="mt-3 text-xl font-bold">{value}</p>

                <p
                  className={cn(
                    "mt-1 flex items-center gap-0.5 text-xs",
                    trend === "up" && "text-emerald-400",
                    trend === "down" && "text-rose-400",
                    trend === "neutral" && "text-muted-foreground",
                  )}
                >
                  {trend === "up" && <ArrowUpRight className="h-3 w-3" />}
                  {trend === "down" && <ArrowDownRight className="h-3 w-3" />}
                  {sub}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Section 2: Live Operations ── */}
      <section className="mb-8">
        <SectionHeading>Live Operations</SectionHeading>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

          {/* Order Status */}
          <Glass className="p-5">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/15">
                <ShoppingBag className="h-4 w-4 text-blue-400" />
              </div>
              <h3 className="font-semibold">Order Status</h3>
              <LiveDot />
            </div>
            <div className="space-y-3">
              {ORDER_STATUS.map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={cn("h-2 w-2 rounded-full", s.dot)} />
                    <span className="text-sm text-muted-foreground">{s.label}</span>
                  </div>
                  <span className={cn("text-sm font-semibold tabular-nums", s.val)}>
                    {s.value}
                  </span>
                </div>
              ))}
            </div>
          </Glass>

          {/* Dining Status */}
          <Glass className="p-5">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/15">
                <LayoutGrid className="h-4 w-4 text-violet-400" />
              </div>
              <h3 className="font-semibold">Dining Status</h3>
              <LiveDot />
            </div>
            <div className="space-y-3">
              {DINING_STATUS.map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={cn("h-2 w-2 rounded-full", s.dot)} />
                    <span className="text-sm text-muted-foreground">{s.label}</span>
                  </div>
                  <span className={cn("text-sm font-semibold tabular-nums", s.val)}>
                    {s.value}
                  </span>
                </div>
              ))}
            </div>
          </Glass>

          {/* Kitchen Performance */}
          <Glass className="p-5">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/15">
                <ChefHat className="h-4 w-4 text-orange-400" />
              </div>
              <h3 className="font-semibold">Kitchen Performance</h3>
              <LiveDot />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {KITCHEN_PERF.map(({ label, value, Icon, cls }) => (
                <div
                  key={label}
                  className="rounded-xl bg-muted/30 p-3 transition-colors hover:bg-muted/50"
                >
                  <Icon className={cn("mb-2 h-4 w-4", cls)} />
                  <p className="text-lg font-bold tabular-nums">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </Glass>
        </div>
      </section>

      {/* ── Section 3: Revenue Summary ── */}
      <section className="mb-8">
        <SectionHeading>Revenue Summary</SectionHeading>
        <Glass className="p-6">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {REVENUE.map(({ period, value, pct }, i) => (
              <div
                key={period}
                className={cn(
                  i < REVENUE.length - 1 &&
                    "sm:border-r sm:border-border/40 sm:pr-8",
                )}
              >
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {period}
                </p>
                <p className="mt-2 text-2xl font-bold tabular-nums">{value}</p>
                <p className="mt-0.5 flex items-center gap-0.5 text-xs font-medium text-emerald-400">
                  <ArrowUpRight className="h-3 w-3" />
                  {pct}
                </p>
              </div>
            ))}
          </div>
        </Glass>
      </section>

      {/* ── Sections 4 + 5: Top Items & Activities ── */}
      <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-2">

        {/* Section 4: Top Selling Items */}
        <Glass className="p-5">
          <div className="mb-5 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15">
              <Star className="h-4 w-4 text-amber-400" />
            </div>
            <h3 className="font-semibold">Top Selling Items</h3>
          </div>
          <div className="space-y-2">
            {TOP_ITEMS.map(({ rank, name, qty, rev, up }) => (
              <div
                key={name}
                className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-muted/30"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                  {rank}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{name}</p>
                  <p className="text-xs text-muted-foreground">{qty} sold</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold tabular-nums">{rev}</p>
                  <Trend up={up} label={up ? "↑" : "↓"} />
                </div>
              </div>
            ))}
          </div>
        </Glass>

        {/* Section 5: Recent Activities */}
        <Glass className="p-5">
          <div className="mb-5 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/15">
              <Activity className="h-4 w-4 text-sky-400" />
            </div>
            <h3 className="font-semibold">Recent Activities</h3>
          </div>
          <div className="space-y-0">
            {ACTIVITIES.map(({ text, time, Icon, cls, bg }, i) => (
              <div key={text} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", bg)}>
                    <Icon className={cn("h-3.5 w-3.5", cls)} />
                  </div>
                  {i < ACTIVITIES.length - 1 && (
                    <div className="my-1 w-px flex-1 bg-border/40" style={{ minHeight: 16 }} />
                  )}
                </div>
                <div className="pb-4 pt-1">
                  <p className="text-sm font-medium">{text}</p>
                  <p className="text-xs text-muted-foreground">{time}</p>
                </div>
              </div>
            ))}
          </div>
        </Glass>
      </div>

      {/* ── Section 6: Customer Insights ── */}
      <section className="mb-8">
        <SectionHeading>Customer Insights</SectionHeading>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {CUSTOMER_INSIGHTS.map(({ label, value, Icon, cls, bg }) => (
            <Glass key={label} className="p-5 text-center">
              <div
                className={cn(
                  "mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl",
                  bg,
                )}
              >
                <Icon className={cn("h-6 w-6", cls)} />
              </div>
              <p className="text-2xl font-bold tabular-nums">{value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{label}</p>
            </Glass>
          ))}
        </div>
      </section>

      {/* ── Section 7: Branch Performance ── */}
      <section className="mb-8">
        <SectionHeading>Branch Performance</SectionHeading>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {BRANCH_PERF.map(({ name, revenue, pct, up, width }) => (
            <Glass key={name} className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <p className="font-semibold">{name}</p>
                </div>
                <Trend up={up} label={pct} />
              </div>
              <p className="mt-3 text-2xl font-bold tabular-nums">{revenue}</p>
              <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-muted/40">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-700",
                    up ? "bg-emerald-500" : "bg-rose-500",
                  )}
                  style={{ width }}
                />
              </div>
            </Glass>
          ))}
        </div>
      </section>

      {/* ── Section 8: Quick Actions ── */}
      <section className="mb-2">
        <SectionHeading>Quick Actions</SectionHeading>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {QUICK_ACTIONS.map(({ label, Icon, href, cls }) => (
            <Link key={label} href={href}>
              <div
                className={cn(
                  "group flex cursor-pointer select-none flex-col items-center gap-3 rounded-2xl bg-linear-to-br p-5 text-center",
                  "transition-all duration-200 hover:-translate-y-1 hover:shadow-xl",
                  cls,
                )}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm transition-transform duration-200 group-hover:scale-110">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <p className="text-xs font-semibold text-white">{label}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
