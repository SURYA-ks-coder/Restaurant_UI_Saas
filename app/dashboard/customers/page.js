"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Cake, HeartHandshake, Search, UserX } from "lucide-react";
import { Skeleton } from "antd";
import { cn } from "@/lib/utils";
import { API, getAction } from "@/lib/API";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const TIER_COLORS = {
  Silver: "bg-muted text-muted-foreground",
  Gold: "bg-warning/10 text-warning",
  Platinum: "bg-primary/10 text-primary",
};

const QUICK_FILTERS = [
  { id: "all", label: "All customers" },
  { id: "birthday", label: "Birthdays this month", icon: Cake },
  { id: "inactive", label: "Inactive 30+ days", icon: UserX },
];

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [quickFilter, setQuickFilter] = useState("all");
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (search.trim()) params.set("search", search.trim());
      if (quickFilter === "birthday")
        params.set("birthdayMonth", String(new Date().getMonth() + 1));
      if (quickFilter === "inactive") params.set("inactiveDays", "30");
      const res = await getAction(`${API.GET_CUSTOMER_LIST}?${params.toString()}`);
      if (res?.statusCode === 200) {
        setCustomers(res.data || []);
        setMeta(res.meta || null);
      }
    } finally {
      setLoading(false);
    }
  }, [page, search, quickFilter]);

  useEffect(() => {
    const t = setTimeout(load, search ? 350 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mb-6">
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground mb-1.5">
          <HeartHandshake className="w-3.5 h-3.5" />
          Customers & Loyalty
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-semibold text-foreground">Customers</h1>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 w-3.5 h-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search name or mobile…"
              className="w-64 rounded-lg border border-border bg-card py-1.5 pl-8 pr-3 text-xs text-foreground"
            />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-1 rounded-lg border border-border bg-card p-0.5 w-fit">
          {QUICK_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => {
                setQuickFilter(f.id);
                setPage(1);
              }}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium",
                quickFilter === f.id ? "bg-primary text-primary-foreground" : "text-muted-foreground",
              )}
            >
              {f.icon && <f.icon className="w-3.5 h-3.5" />}
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground">
                <th className="px-4 py-3 text-left font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Tier</th>
                <th className="px-4 py-3 font-medium">Points</th>
                <th className="px-4 py-3 font-medium">Wallet</th>
                <th className="px-4 py-3 font-medium">Orders</th>
                <th className="px-4 py-3 font-medium">Total spent</th>
                <th className="px-4 py-3 font-medium">Last visit</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c._id} className="border-b border-border last:border-0 text-center hover:bg-muted/20">
                  <td className="px-4 py-3 text-left">
                    <Link href={`/dashboard/customers/${c._id}`} className="font-medium text-foreground hover:text-primary">
                      {c.customerName}
                    </Link>
                    <div className="text-[11px] text-muted-foreground">{c.mobileNumber}</div>
                  </td>
                  <td className="px-4 py-3">
                    {c.tier?.name ? (
                      <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", TIER_COLORS[c.tier.name] || "bg-muted text-muted-foreground")}>
                        {c.tier.name}
                      </span>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">{c.loyaltyPoints || 0}</td>
                  <td className="px-4 py-3">{currency.format(c.walletBalance || 0)}</td>
                  <td className="px-4 py-3">{c.totalOrders || 0}</td>
                  <td className="px-4 py-3">{currency.format(c.totalSpent || 0)}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {c.lastVisitAt ? new Date(c.lastVisitAt).toLocaleDateString() : "—"}
                  </td>
                </tr>
              ))}
              {!customers.length && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                    No customers match this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {meta && meta.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-end gap-2 text-xs">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-lg border border-border bg-card px-3 py-1.5 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-muted-foreground">
            Page {meta.page} of {meta.totalPages}
          </span>
          <button
            disabled={page >= meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-border bg-card px-3 py-1.5 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
