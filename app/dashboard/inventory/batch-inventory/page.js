"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, Boxes, Clock, Layers } from "lucide-react";
import { Skeleton } from "antd";
import { message } from "@/lib/message";
import { cn } from "@/lib/utils";
import { API, getAction } from "@/lib/API";
import Heading from "@/components/ui/Heading";

const fmtDateTime = (d) => (d ? new Date(d).toLocaleString() : "—");

const hoursUntil = (d) => (d ? (new Date(d).getTime() - Date.now()) / (60 * 60 * 1000) : null);

const urgency = (expiryAt) => {
  if (!expiryAt) return { label: "No expiry", className: "bg-muted text-muted-foreground" };
  const hrs = hoursUntil(expiryAt);
  if (hrs <= 0) return { label: "Expired", className: "bg-destructive/10 text-destructive" };
  if (hrs <= 6) return { label: `${Math.round(hrs)}h left`, className: "bg-destructive/10 text-destructive" };
  if (hrs <= 24) return { label: `${Math.round(hrs)}h left`, className: "bg-warning/10 text-warning" };
  return { label: `${Math.round(hrs / 24)}d left`, className: "bg-success/10 text-success" };
};

export default function BatchInventoryPage() {
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("active");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      const res = await getAction(`${API.GET_INVENTORY_LOTS}?${params.toString()}`);
      if (res?.statusCode === 200) setLots(res.data || []);
      else message.error(res?.message || "Failed to load batch inventory");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const grouped = useMemo(() => {
    const byItem = new Map();
    for (const lot of lots) {
      const key = String(lot.inventoryItemId?._id || lot.inventoryItemId);
      if (!byItem.has(key))
        byItem.set(key, {
          item: lot.inventoryItemId,
          totalRemaining: 0,
          lots: [],
        });
      const bucket = byItem.get(key);
      bucket.totalRemaining += lot.quantityRemaining;
      bucket.lots.push(lot);
    }
    return [...byItem.values()].sort((a, b) =>
      (a.item?.materialName || "").localeCompare(b.item?.materialName || ""),
    );
  }, [lots]);

  const stats = useMemo(() => {
    const expiringSoon = lots.filter((l) => {
      const hrs = hoursUntil(l.expiryAt);
      return l.status === "active" && hrs !== null && hrs > 0 && hrs <= 24;
    }).length;
    const expired = lots.filter((l) => l.status === "expired").length;
    return {
      items: grouped.length,
      lots: lots.length,
      expiringSoon,
      expired,
    };
  }, [lots, grouped]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Heading
          title="Batch Inventory"
          description="Lot-level stock of prepared items — produced via batch cooking, consumed first-expire-first-out."
        />
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Prepared Items", value: stats.items, icon: Boxes, color: "text-primary bg-primary/10" },
          { label: "Active Lots", value: stats.lots, icon: Layers, color: "text-accent bg-accent/10" },
          { label: "Expiring in 24h", value: stats.expiringSoon, icon: Clock, color: "text-warning bg-warning/10" },
          { label: "Expired", value: stats.expired, icon: AlertTriangle, color: "text-destructive bg-destructive/10" },
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

      <div className="mb-4 flex gap-1 rounded-lg border border-border bg-card p-0.5 w-fit">
        {[
          { id: "active", label: "Active" },
          { id: "expired", label: "Expired" },
          { id: "depleted", label: "Depleted" },
          { id: "", label: "All" },
        ].map((t) => (
          <button
            key={t.id || "all"}
            onClick={() => setStatusFilter(t.id)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium",
              statusFilter === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : (
        <div className="space-y-3">
          {grouped.map((bucket) => (
            <div key={String(bucket.item?._id)} className="rounded-xl border border-border bg-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-semibold text-foreground">{bucket.item?.materialName}</span>
                <span className="text-xs text-muted-foreground">
                  {bucket.totalRemaining} {bucket.item?.unit} remaining across {bucket.lots.length} lot
                  {bucket.lots.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-[11px] text-muted-foreground">
                      <th className="py-1.5 font-medium">Batch</th>
                      <th className="py-1.5 text-right font-medium">Produced</th>
                      <th className="py-1.5 text-right font-medium">Remaining</th>
                      <th className="py-1.5 font-medium">Produced At</th>
                      <th className="py-1.5 font-medium">Expiry</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bucket.lots.map((lot) => {
                      const badge = urgency(lot.expiryAt);
                      return (
                        <tr key={lot._id} className="border-b border-border/60 last:border-0">
                          <td className="py-1.5 text-foreground">{lot.productionBatchId?.batchNo || "—"}</td>
                          <td className="py-1.5 text-right text-muted-foreground">
                            {lot.quantityProduced} {lot.unit}
                          </td>
                          <td className="py-1.5 text-right font-medium text-foreground">
                            {lot.quantityRemaining} {lot.unit}
                          </td>
                          <td className="py-1.5 text-muted-foreground">{fmtDateTime(lot.producedAt)}</td>
                          <td className="py-1.5">
                            <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", badge.className)}>
                              {badge.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
          {!grouped.length && (
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No {statusFilter || ""} batch inventory. Lots appear here once a Production batch is completed.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
