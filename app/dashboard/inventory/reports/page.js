"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BarChart3,
  IndianRupee,
  PackageSearch,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { Skeleton } from "antd";
import { message } from "@/lib/message";
import { cn } from "@/lib/utils";
import { API, getAction } from "@/lib/API";
import Heading from "@/components/ui/Heading";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function InventoryReportsHubPage() {
  const [stock, setStock] = useState(null);
  const [wastage, setWastage] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [stockRes, wastageRes] = await Promise.all([
        getAction(API.GET_INVENTORY_REPORT),
        getAction(API.GET_WASTAGE_REPORT),
      ]);
      if (stockRes?.statusCode === 200) setStock(stockRes.data);
      if (wastageRes?.statusCode === 200) setWastage(wastageRes.data);
    } catch {
      message.error("Failed to load inventory reports");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const links = [
    {
      title: "Variance Report",
      description: "Theoretical vs. actual consumption against recipe tolerance",
      href: "/dashboard/inventory/variance-report",
      icon: BarChart3,
      color: "text-primary bg-primary/10",
    },
    {
      title: "Wastage Log",
      description: "Full history of recorded waste by reason and item",
      href: "/dashboard/inventory/wastage",
      icon: Trash2,
      color: "text-destructive bg-destructive/10",
    },
    {
      title: "Batch Inventory",
      description: "Lot-level stock of prepared items, expiry tracking",
      href: "/dashboard/inventory/batch-inventory",
      icon: PackageSearch,
      color: "text-accent bg-accent/10",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="mb-6">
        <Heading
          title="Inventory Reports"
          description="Stock valuation at a glance, plus quick links to the detailed reports."
        />
      </div>

      {loading ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              {
                label: "Items in Stock",
                value: stock?.itemCount ?? 0,
                icon: PackageSearch,
                color: "text-primary bg-primary/10",
              },
              {
                label: "Total Stock Value",
                value: currency.format(stock?.totalStockValue || 0),
                icon: IndianRupee,
                color: "text-success bg-success/10",
              },
              {
                label: "Low Stock Items",
                value: stock?.lowStockCount ?? 0,
                icon: TriangleAlert,
                color: "text-warning bg-warning/10",
              },
            ].map((s) => (
              <div key={s.label} className="glass-card flex items-center gap-4 rounded-lg p-4">
                <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", s.color)}>
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-xl font-bold">{s.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mb-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="mb-3 text-sm font-semibold text-foreground">Stock Value by Category</h3>
              <div className="space-y-2">
                {(stock?.byCategory || []).map((c) => (
                  <div key={c.category} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{c.category}</span>
                    <span className="font-medium text-foreground">
                      {currency.format(c.stockValue)} <span className="text-xs text-muted-foreground">({c.itemCount})</span>
                    </span>
                  </div>
                ))}
                {!stock?.byCategory?.length && (
                  <p className="text-xs text-muted-foreground">No categorized stock yet.</p>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="mb-3 text-sm font-semibold text-foreground">Top Wasted Items (all time)</h3>
              <div className="space-y-2">
                {(wastage?.topWastedItems || []).map((w) => (
                  <div key={String(w.inventoryItemId)} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{w.name}</span>
                    <span className="font-medium text-foreground">
                      {w.totalQuantity} {w.unit} <span className="text-xs text-muted-foreground">({w.count}×)</span>
                    </span>
                  </div>
                ))}
                {!wastage?.topWastedItems?.length && (
                  <p className="text-xs text-muted-foreground">No wastage recorded yet.</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="group rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary"
          >
            <div className={cn("mb-3 flex h-9 w-9 items-center justify-center rounded-lg", l.color)}>
              <l.icon className="h-4.5 w-4.5" />
            </div>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              {l.title}
              <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{l.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
