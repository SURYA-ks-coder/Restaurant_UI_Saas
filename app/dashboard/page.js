"use client";

import { motion } from "framer-motion";
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  UtensilsCrossed,
} from "lucide-react";
import { AIInsights } from "@/components/dashboard/ai-insights";
import { KitchenStatus } from "@/components/dashboard/kitchen-status";
import { LiveOrders } from "@/components/dashboard/live-orders";
import { PopularItems } from "@/components/dashboard/popular-items";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { StatCard } from "@/components/dashboard/stat-card";
import { TableStatus } from "@/components/dashboard/table-status";
import { useEffect } from "react";
import { connectSocket } from "@/components/services/socket";

export default function DashboardPage() {
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const branchId = localStorage.getItem("branchId");

    if (token && branchId) {
      connectSocket({ token });
    } else {
      console.warn(
        "Missing auth token or branch ID. Socket connection will not be established.",
      );
    }
  }, []);
  return (
    <div className="min-h-screen bg-background ">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold md:text-4xl">Good evening, Alex</h1>
          <p className="mt-2 text-muted-foreground">
            Here&apos;s what&apos;s happening at your restaurant today.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted">
            Export Report
          </button>
          <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            New Order
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Revenue"
          value="$12,500"
          change="+12%"
          changeType="positive"
          icon={DollarSign}
          delay={0}
        />
        <StatCard
          title="Orders"
          value="348"
          change="+5%"
          changeType="positive"
          icon={ShoppingBag}
          delay={0.1}
        />
        <StatCard
          title="Items Sold"
          value="2,450"
          change="-2%"
          changeType="negative"
          icon={UtensilsCrossed}
          delay={0.2}
        />
        <StatCard
          title="Growth"
          value="23.5%"
          change="+8%"
          changeType="positive"
          icon={TrendingUp}
          delay={0.3}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <LiveOrders />
        <TableStatus />
        <KitchenStatus />
        <AIInsights />
        <PopularItems />
        <div className="lg:col-span-3">
          <RecentTransactions />
        </div>
      </div>
    </div>
  );
}
