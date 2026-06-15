"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Activity, AlertCircle, ArrowDownRight, ArrowUpRight,
  CheckCircle2, ChefHat, ChevronDown, Clock, FileText,
  LayoutGrid, MapPin, Plus, Settings, ShoppingBag, Star,
  Timer, TrendingUp, Users, UtensilsCrossed, Wallet, Zap,
} from "lucide-react";

/* ── data ──────────────────────────────────────────────────────────────── */

const BRANCHES = ["Chennai Central", "Anna Nagar", "Velachery"];

const HEADER_STATS = [
  { label: "Orders Today", value: "348", Icon: ShoppingBag },
  { label: "Kitchen Queue", value: "12", Icon: ChefHat },
  { label: "Tables Active", value: "18/24", Icon: LayoutGrid },
  { label: "Today's Revenue", value: "₹1.25L", Icon: Wallet },
];

const ORDER_STATUS = [
  { label: "Completed", value: 215, color: "#22c55e", dot: "bg-emerald-500" },
  { label: "Preparing", value: 34, color: "#3b82f6", dot: "bg-blue-500" },
  { label: "Ready to Serve", value: 18, color: "#8b5cf6", dot: "bg-violet-500" },
  { label: "Pending Payment", value: 12, color: "#f59e0b", dot: "bg-amber-400" },
  { label: "Cancelled", value: 4, color: "#f43f5e", dot: "bg-rose-500" },
];

const DINING_STATUS = [
  { label: "Available", value: 6, dot: "bg-emerald-400", total: 29 },
  { label: "Occupied", value: 18, dot: "bg-blue-500", total: 29 },
  { label: "Reserved", value: 3, dot: "bg-violet-500", total: 29 },
  { label: "Cleaning", value: 2, dot: "bg-amber-400", total: 29 },
];

const KITCHEN_PERF = [
  { label: "Avg Prep Time", value: "12 min", Icon: Timer, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Ready Orders", value: "18", Icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Urgent Orders", value: "3", Icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-50" },
  { label: "Chef Efficiency", value: "94%", Icon: Zap, color: "text-amber-600", bg: "bg-amber-50" },
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
  { text: "Order #2456 Completed", time: "2 min ago", Icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
  { text: "Table 12 Closed", time: "8 min ago", Icon: LayoutGrid, color: "text-blue-600", bg: "bg-blue-50" },
  { text: "New Staff Added", time: "25 min ago", Icon: Users, color: "text-violet-600", bg: "bg-violet-50" },
  { text: "Menu Updated", time: "1 hr ago", Icon: UtensilsCrossed, color: "text-amber-600", bg: "bg-amber-50" },
  { text: "Branch Settings Modified", time: "3 hr ago", Icon: Settings, color: "text-slate-500", bg: "bg-slate-100" },
];

const CUSTOMER_INSIGHTS = [
  { label: "New Customers", value: "84", Icon: Users, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Returning", value: "264", Icon: Activity, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "VIP Members", value: "32", Icon: Star, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Avg Visits/Wk", value: "2.4×", Icon: TrendingUp, color: "text-violet-600", bg: "bg-violet-50" },
];

const BRANCH_PERF = [
  { name: "Chennai Central", revenue: "₹65,000", pct: "+14.2%", up: true, w: 68 },
  { name: "Anna Nagar", revenue: "₹42,000", pct: "+8.5%", up: true, w: 44 },
  { name: "Velachery", revenue: "₹18,000", pct: "-3.2%", up: false, w: 19 },
];

const HOURLY = [
  { h: "9AM", v: 45 }, { h: "11AM", v: 72 }, { h: "1PM", v: 100 },
  { h: "3PM", v: 38 }, { h: "5PM", v: 56 }, { h: "7PM", v: 88 },
  { h: "9PM", v: 65 }, { h: "11PM", v: 30 },
];

const QUICK_ACTIONS = [
  { label: "Create Order", Icon: Plus, href: "/dashboard/pos", cls: "bg-violet-600 hover:bg-violet-700" },
  { label: "Add Menu Item", Icon: UtensilsCrossed, href: "/dashboard/menus", cls: "bg-blue-600 hover:bg-blue-700" },
  { label: "Manage Tables", Icon: LayoutGrid, href: "/dashboard/tables", cls: "bg-emerald-600 hover:bg-emerald-700" },
  { label: "Open Kitchen", Icon: ChefHat, href: "/dashboard/kitchen", cls: "bg-orange-600 hover:bg-orange-700" },
  { label: "Generate Report", Icon: FileText, href: "/dashboard/analytics", cls: "bg-rose-600 hover:bg-rose-700" },
  { label: "Manage Staff", Icon: Users, href: "/dashboard/staff", cls: "bg-sky-600 hover:bg-sky-700" },
];

/* ── sub-components ────────────────────────────────────────────────────── */

function Card({ children, className }) {
  return (
    <div className={cn("bg-white rounded-2xl shadow-sm border border-gray-100", className)}>
      {children}
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <h2 className="shrink-0 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
        {children}
      </h2>
      <div className="h-px flex-1 bg-gray-100" />
    </div>
  );
}

function LiveBadge() {
  return (
    <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
      Live
    </span>
  );
}

function DonutChart({ data }) {
  const R = 44;
  const sw = 11;
  const C = 2 * Math.PI * R;
  const total = data.reduce((s, d) => s + d.value, 0);
  const GAP = 1.5;
  let acc = 0;
  const slices = data.map((d) => {
    const len = Math.max(0, (d.value / total) * C - GAP);
    const off = acc;
    acc += len + GAP;
    return { ...d, len, off };
  });

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="108" height="108" viewBox="0 0 108 108">
        <circle cx="54" cy="54" r={R} fill="none" stroke="#f1f5f9" strokeWidth={sw} />
        <g transform="rotate(-90 54 54)">
          {slices.map((s, i) => (
            <circle
              key={i}
              cx="54" cy="54" r={R}
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
        <span className="text-2xl font-bold text-gray-900">{total}</span>
        <span className="text-[10px] uppercase tracking-wide text-gray-400 font-medium">Orders</span>
      </div>
    </div>
  );
}

/* ── page ─────────────────────────────────────────────────────────────── */

export default function DashboardPage() {
  const [now, setNow] = useState(new Date());
  const [branch, setBranch] = useState(BRANCHES[0]);
  const [branchOpen, setBranchOpen] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const hour = now.getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  const dateStr = now.toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true,
  });

  return (
    <div className="min-h-screen bg-slate-50 p-5 text-gray-900">

      {/* ── Header ── */}
      <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-3">

        {/* Greeting + quick stats */}
        <div className="lg:col-span-2 rounded-2xl bg-linear-to-br from-violet-600 to-indigo-700 p-6 text-white shadow-md">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-violet-200 text-xs mb-0.5">{dateStr}</p>
              <h1 className="text-2xl font-bold">{greeting}, Admin 👋</h1>
              <p className="text-violet-200 text-xs mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {timeStr}
              </p>
            </div>

            {/* Branch selector */}
            <div className="relative">
              <button
                onClick={() => setBranchOpen((p) => !p)}
                className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 px-3 py-2 rounded-xl text-sm font-medium transition-colors"
              >
                <MapPin className="w-3.5 h-3.5" />
                {branch}
                <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", branchOpen && "rotate-180")} />
              </button>
              {branchOpen && (
                <div className="absolute right-0 top-10 z-20 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
                  {BRANCHES.map((b) => (
                    <button
                      key={b}
                      onClick={() => { setBranch(b); setBranchOpen(false); }}
                      className={cn(
                        "w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-slate-50 transition-colors",
                        b === branch && "font-semibold text-violet-600",
                      )}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {HEADER_STATS.map(({ label, value, Icon }) => (
              <div key={label} className="bg-white/10 rounded-xl p-3.5 backdrop-blur-sm">
                <Icon className="w-4 h-4 text-violet-200 mb-2.5" />
                <p className="text-xl font-bold tabular-nums">{value}</p>
                <p className="text-[10px] text-violet-200 mt-0.5 leading-tight">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Order distribution donut */}
        <Card className="p-5">
          <div className="flex items-center mb-4">
            <h3 className="text-sm font-semibold text-gray-800">Order Distribution</h3>
            <LiveBadge />
          </div>
          <div className="flex justify-center mb-4">
            <DonutChart data={ORDER_STATUS} />
          </div>
          <div className="space-y-2">
            {ORDER_STATUS.map((s) => {
              const total = ORDER_STATUS.reduce((sum, x) => sum + x.value, 0);
              return (
                <div key={s.label} className="flex items-center gap-2">
                  <span className={cn("w-2 h-2 rounded-full shrink-0", s.dot)} />
                  <span className="text-xs text-gray-500 flex-1">{s.label}</span>
                  <span className="text-xs font-semibold text-gray-800 tabular-nums">{s.value}</span>
                  <span className="text-[10px] text-gray-400 w-7 text-right tabular-nums">
                    {Math.round((s.value / total) * 100)}%
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* ── Live Operations ── */}
      <div className="mb-6">
        <SectionTitle>Live Operations</SectionTitle>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

          <Card className="p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-800">Order Status</h3>
              <LiveBadge />
            </div>
            <div className="space-y-3">
              {ORDER_STATUS.map((s) => (
                <div key={s.label} className="flex items-center gap-2">
                  <span className={cn("w-2.5 h-2.5 rounded-full shrink-0", s.dot)} />
                  <span className="text-sm text-gray-600 flex-1">{s.label}</span>
                  <span className="text-sm font-bold text-gray-900 tabular-nums">{s.value}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center">
                <ChefHat className="w-4 h-4 text-orange-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-800">Kitchen Performance</h3>
              <LiveBadge />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {KITCHEN_PERF.map(({ label, value, Icon, color, bg }) => (
                <div key={label} className={cn("rounded-xl p-3.5", bg)}>
                  <Icon className={cn("w-4 h-4 mb-2", color)} />
                  <p className="text-lg font-bold text-gray-900 tabular-nums">{value}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center">
                <LayoutGrid className="w-4 h-4 text-violet-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-800">Dining Status</h3>
              <LiveBadge />
            </div>
            <div className="space-y-3.5">
              {DINING_STATUS.map((s) => (
                <div key={s.label}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={cn("w-2 h-2 rounded-full shrink-0", s.dot)} />
                    <span className="text-sm text-gray-600 flex-1">{s.label}</span>
                    <span className="text-sm font-bold text-gray-900 tabular-nums">{s.value}</span>
                  </div>
                  <div className="ml-4 h-1.5 bg-gray-100 rounded-full overflow-hidden">
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
            <h3 className="text-sm font-semibold text-gray-800 mb-4">Revenue Breakdown</h3>
            <div className="grid grid-cols-2 gap-3">
              {REVENUE.map(({ period, value, pct, up }) => (
                <div key={period} className="rounded-xl bg-slate-50 p-4">
                  <p className="text-[10px] uppercase tracking-widest font-semibold text-gray-400">{period}</p>
                  <p className="text-xl font-bold text-gray-900 mt-2 tabular-nums">{value}</p>
                  <span className={cn("inline-flex items-center gap-0.5 text-xs font-semibold mt-1", up ? "text-emerald-600" : "text-rose-500")}>
                    {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {pct}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold text-gray-800">Hourly Revenue</h3>
              <span className="text-[10px] font-medium text-gray-400 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-lg">Today</span>
            </div>
            <div className="flex items-end gap-1.5" style={{ height: 100 }}>
              {HOURLY.map(({ h, v }) => (
                <div key={h} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="w-full flex items-end" style={{ height: 80 }}>
                    <div
                      className="w-full bg-violet-500 rounded-t-md hover:bg-violet-600 transition-colors cursor-default"
                      style={{ height: `${v}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-gray-400">{h}</span>
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
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
              <Star className="w-4 h-4 text-amber-600" />
            </div>
            <h3 className="text-sm font-semibold text-gray-800">Top Selling Items</h3>
          </div>
          <div className="space-y-1">
            {TOP_ITEMS.map(({ rank, name, qty, rev, up }) => (
              <div key={name} className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-slate-50 transition-colors">
                <span className="w-6 h-6 rounded-lg bg-violet-50 text-violet-600 text-xs font-bold flex items-center justify-center shrink-0">
                  {rank}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{name}</p>
                  <p className="text-xs text-gray-400">{qty} sold</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-gray-900 tabular-nums">{rev}</p>
                  <span className={cn("text-xs font-semibold", up ? "text-emerald-600" : "text-rose-500")}>
                    {up ? "↑ Up" : "↓ Down"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-xl bg-sky-50 flex items-center justify-center">
              <Activity className="w-4 h-4 text-sky-600" />
            </div>
            <h3 className="text-sm font-semibold text-gray-800">Recent Activities</h3>
          </div>
          <div>
            {ACTIVITIES.map(({ text, time, Icon, color, bg }, i) => (
              <div key={text} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", bg)}>
                    <Icon className={cn("w-3.5 h-3.5", color)} />
                  </div>
                  {i < ACTIVITIES.length - 1 && (
                    <div className="w-px flex-1 my-1 bg-gray-100" style={{ minHeight: 12 }} />
                  )}
                </div>
                <div className="pb-3 pt-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">{text}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Customer Insights + Branch Performance ── */}
      <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-2">

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Customer Insights</h3>
          <div className="grid grid-cols-2 gap-3">
            {CUSTOMER_INSIGHTS.map(({ label, value, Icon, color, bg }) => (
              <div key={label} className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", bg)}>
                  <Icon className={cn("w-5 h-5", color)} />
                </div>
                <div className="min-w-0">
                  <p className="text-xl font-bold text-gray-900 tabular-nums">{value}</p>
                  <p className="text-xs text-gray-400 leading-tight">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-5">Branch Performance</h3>
          <div className="space-y-5">
            {BRANCH_PERF.map(({ name, revenue, pct, up, w }) => (
              <div key={name}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">{name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900 tabular-nums">{revenue}</span>
                    <span className={cn("text-xs font-semibold", up ? "text-emerald-600" : "text-rose-500")}>{pct}</span>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-700", up ? "bg-emerald-500" : "bg-rose-500")}
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
              <div className={cn(
                "flex flex-col items-center gap-3 rounded-2xl p-5 text-white text-center",
                "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg cursor-pointer select-none",
                cls,
              )}>
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
