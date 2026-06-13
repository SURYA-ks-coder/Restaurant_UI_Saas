"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Clock,
  DollarSign,
  Download,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const revenueData = [
  { name: "Jan", revenue: 42000, orders: 820 },
  { name: "Feb", revenue: 38000, orders: 780 },
  { name: "Mar", revenue: 55000, orders: 1100 },
  { name: "Apr", revenue: 48000, orders: 950 },
  { name: "May", revenue: 62000, orders: 1250 },
  { name: "Jun", revenue: 58000, orders: 1180 },
  { name: "Jul", revenue: 72000, orders: 1420 },
];

const hourlyData = [
  { hour: "10AM", orders: 12, revenue: 480 },
  { hour: "12PM", orders: 65, revenue: 2600 },
  { hour: "2PM", orders: 45, revenue: 1800 },
  { hour: "4PM", orders: 28, revenue: 1120 },
  { hour: "6PM", orders: 72, revenue: 2880 },
  { hour: "8PM", orders: 108, revenue: 4320 },
  { hour: "10PM", orders: 52, revenue: 2080 },
];

const categoryData = [
  { name: "Main Course", value: 42, color: "var(--chart-1)" },
  { name: "Appetizers", value: 18, color: "var(--chart-2)" },
  { name: "Desserts", value: 15, color: "var(--chart-3)" },
  { name: "Beverages", value: 15, color: "var(--chart-4)" },
  { name: "Seafood", value: 10, color: "var(--chart-5)" },
];

const topDishes = [
  { name: "Wagyu Beef Steak", orders: 342, revenue: "$23,256", change: 12.5 },
  { name: "Truffle Pasta", orders: 287, revenue: "$12,054", change: 8.2 },
  { name: "Lobster Bisque", orders: 256, revenue: "$7,168", change: -3.4 },
  { name: "Grilled Salmon", orders: 234, revenue: "$10,530", change: 15.8 },
];

const stats = [
  {
    label: "Total Revenue",
    value: "$72,450",
    change: "+15.2%",
    positive: true,
    icon: DollarSign,
  },
  {
    label: "Total Orders",
    value: "1,847",
    change: "+8.7%",
    positive: true,
    icon: ShoppingBag,
  },
  {
    label: "New Customers",
    value: "324",
    change: "+22.4%",
    positive: true,
    icon: Users,
  },
  {
    label: "Avg. Order Time",
    value: "18 min",
    change: "-12%",
    positive: true,
    icon: Clock,
  },
];

const timeRanges = ["Today", "This Week", "This Month", "This Year"];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-xl">
      <p className="font-medium">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="text-sm" style={{ color: entry.color }}>
          {entry.name}:{" "}
          {entry.name === "revenue"
            ? `$${entry.value.toLocaleString()}`
            : entry.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const [selectedRange, setSelectedRange] = useState("This Month");

  return (
    <div className="min-h-screen ">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Track your restaurant performance
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="rounded-lg bg-muted p-1">
            {timeRanges.map((range) => (
              <button
                key={range}
                onClick={() => setSelectedRange(range)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm",
                  selectedRange === range
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground",
                )}
              >
                {range}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="glass-card rounded-lg p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="rounded-lg bg-primary/10 p-3 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <Badge
                  className={
                    stat.positive
                      ? "bg-success/20 text-success"
                      : "bg-destructive/20 text-destructive"
                  }
                >
                  {stat.change}
                </Badge>
              </div>
              <p className="text-2xl font-semibold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="glass-card rounded-lg p-5 xl:col-span-2">
          <h2 className="text-lg font-semibold">Revenue Trend</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Monthly performance overview
          </p>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" />
                <YAxis
                  stroke="var(--muted-foreground)"
                  tickFormatter={(value) => `$${value / 1000}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--primary)"
                  fill="var(--primary)"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="glass-card rounded-lg p-5">
          <h2 className="text-lg font-semibold">Sales by Category</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Distribution of orders
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={4}
                >
                  {categoryData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {categoryData.map((category) => (
              <div key={category.name} className="flex justify-between text-sm">
                <span>{category.name}</span>
                <span>{category.value}%</span>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-card rounded-lg p-5 xl:col-span-2">
          <h2 className="text-lg font-semibold">Hourly Performance</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Peak hours analysis
          </p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="hour" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="orders"
                  fill="var(--accent)"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="glass-card rounded-lg p-5">
          <h2 className="text-lg font-semibold">Top Performing Dishes</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Best sellers this month
          </p>
          <div className="space-y-3">
            {topDishes.map((dish, index) => (
              <div
                key={dish.name}
                className="flex items-center justify-between rounded-lg bg-muted/30 p-3"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{dish.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {dish.orders} orders
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{dish.revenue}</p>
                  <p
                    className={cn(
                      "flex items-center justify-end gap-1 text-xs",
                      dish.change > 0 ? "text-success" : "text-destructive",
                    )}
                  >
                    {dish.change > 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {Math.abs(dish.change)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
