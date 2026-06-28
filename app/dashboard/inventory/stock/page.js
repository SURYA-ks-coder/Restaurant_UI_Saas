"use client";

import { message } from "@/lib/message";

import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  History,
  Package,
  Plus,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { action, API, getAction } from "@/lib/API";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const STOCK_STATUS = {
  healthy: { label: "Healthy", className: "bg-success/15 text-success border-success/30" },
  watch: { label: "Watch", className: "bg-accent/15 text-accent border-accent/30" },
  low: { label: "Low", className: "bg-warning/15 text-warning border-warning/30" },
  critical: { label: "Critical", className: "bg-destructive/15 text-destructive border-destructive/30" },
};

const getStockStatus = (stock, par) => {
  if (!par || par === 0) return "healthy";
  const pct = (stock / par) * 100;
  if (pct <= 20) return "critical";
  if (pct <= 50) return "low";
  if (pct <= 80) return "watch";
  return "healthy";
};

export default function StockPage() {
  const [stockList, setStockList] = useState([]);
  const [historyMap, setHistoryMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [adjustDrawer, setAdjustDrawer] = useState(null);
  const [historyDrawer, setHistoryDrawer] = useState(null);
  const [adjustForm, setAdjustForm] = useState({ type: "add", quantity: "", reason: "", notes: "" });
  const [adjustErrors, setAdjustErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchStock = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAction(API.GET_STOCK_LIST);
      if (result?.statusCode === 200) {
        setStockList(
          (result.data || []).map((item) => ({
            ...item,
            status: getStockStatus(item.currentStock ?? item.stock, item.par ?? item.parLevel),
          })),
        );
      }
    } catch {
      message.error("Failed to load stock data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStock();
  }, [fetchStock]);

  const filtered = stockList.filter((s) => {
    const matchSearch =
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.category?.toLowerCase().includes(search.toLowerCase()) ||
      s.supplier?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    all: stockList.length,
    healthy: stockList.filter((s) => s.status === "healthy").length,
    watch: stockList.filter((s) => s.status === "watch").length,
    low: stockList.filter((s) => s.status === "low").length,
    critical: stockList.filter((s) => s.status === "critical").length,
  };

  const openAdjust = (item) => {
    setAdjustDrawer(item);
    setAdjustForm({ type: "add", quantity: "", reason: "", notes: "" });
    setAdjustErrors({});
  };

  const validateAdjust = () => {
    const next = {};
    if (!adjustForm.quantity || Number(adjustForm.quantity) <= 0) next.quantity = "Enter a valid quantity";
    if (!adjustForm.reason.trim()) next.reason = "Reason is required";
    setAdjustErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleAdjust = async () => {
    if (!validateAdjust()) return;
    setSubmitting(true);
    try {
      const id = adjustDrawer._id || adjustDrawer.id;
      const result = await action(API.ADJUST_STOCK, {
        itemId: id,
        type: adjustForm.type,
        quantity: Number(adjustForm.quantity),
        reason: adjustForm.reason,
        notes: adjustForm.notes,
      });

      if (result?.statusCode === 200 || result?.statusCode === 201) {
        message.success(`Stock ${adjustForm.type === "add" ? "added" : "deducted"} successfully.`);
        setAdjustDrawer(null);
        fetchStock();
      } else {
        message.error(result?.message || "Adjustment failed.");
      }
    } catch {
      message.error("Request failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const openHistory = async (item) => {
    const id = item._id || item.id;
    setHistoryDrawer(item);
    if (historyMap[id]) return;
    setHistoryLoading(true);
    try {
      const result = await getAction(`${API.GET_STOCK_HISTORY}/${id}`);
      if (result?.statusCode === 200) {
        setHistoryMap((prev) => ({ ...prev, [id]: result.data || [] }));
      }
    } catch {
      message.error("Failed to load history");
    } finally {
      setHistoryLoading(false);
    }
  };

  const stats = [
    { label: "Total Items", value: counts.all, color: "text-primary bg-primary/10", icon: Package },
    { label: "Critical", value: counts.critical, color: "text-destructive bg-destructive/10", icon: AlertTriangle },
    { label: "Low Stock", value: counts.low, color: "text-warning bg-warning/10", icon: AlertTriangle },
    { label: "Healthy", value: counts.healthy, color: "text-success bg-success/10", icon: CheckCircle2 },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Stock Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Real-time stock levels with manual adjustments
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
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

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items, category, supplier…"
            className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-4 text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="flex gap-2">
          {["all", "critical", "low", "watch", "healthy"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors",
                statusFilter === s ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:bg-muted",
              )}
            >
              {s === "all" ? `All (${counts.all})` : `${STOCK_STATUS[s]?.label} (${counts[s]})`}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-lg border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {["Item", "Category", "Current Stock", "Par Level", "Unit Cost", "Supplier", "Status", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-muted-foreground">Loading stock data…</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-muted-foreground">
                    {search || statusFilter !== "all" ? "No items match your filters." : "No stock data available."}
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const stock = item.currentStock ?? item.stock ?? 0;
                  const par = item.par ?? item.parLevel ?? 0;
                  const pct = par > 0 ? Math.min(100, Math.round((stock / par) * 100)) : 100;
                  const statusCfg = STOCK_STATUS[item.status] || STOCK_STATUS.healthy;
                  const id = item._id || item.id;

                  return (
                    <tr key={id} className="border-b border-border/50 transition-colors hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-muted-foreground">{item.itemId || id}</div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{item.category || "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">
                            {stock} <span className="text-xs font-normal text-muted-foreground">{item.unit}</span>
                          </span>
                        </div>
                        {par > 0 && (
                          <div className="mt-1 h-1.5 w-24 rounded-full bg-muted">
                            <div
                              className={cn("h-full rounded-full transition-all", {
                                "bg-success": item.status === "healthy",
                                "bg-accent": item.status === "watch",
                                "bg-warning": item.status === "low",
                                "bg-destructive": item.status === "critical",
                              })}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {par > 0 ? `${par} ${item.unit}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{item.cost || item.unitCost || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{item.supplier || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-medium", statusCfg.className)}>
                          {statusCfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openAdjust(item)}
                            className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10"
                            title="Adjust stock"
                          >
                            <SlidersHorizontal className="h-3 w-3" />
                            Adjust
                          </button>
                          <button
                            onClick={() => openHistory(item)}
                            className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                            title="View history"
                          >
                            <History className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Stock Drawer */}
      {adjustDrawer && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40" onClick={() => setAdjustDrawer(null)} />
          <div className="flex w-full max-w-sm flex-col bg-background shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div>
                <h2 className="text-base font-semibold">Adjust Stock</h2>
                <p className="text-xs text-muted-foreground">{adjustDrawer.name}</p>
              </div>
              <button onClick={() => setAdjustDrawer(null)} className="rounded p-1 hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {/* Current Stock */}
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-xs text-muted-foreground">Current Stock</p>
                <p className="text-2xl font-bold">
                  {adjustDrawer.currentStock ?? adjustDrawer.stock ?? 0}{" "}
                  <span className="text-sm font-normal text-muted-foreground">{adjustDrawer.unit}</span>
                </p>
              </div>

              {/* Type selector */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setAdjustForm((p) => ({ ...p, type: "add" }))}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-lg border py-3 text-sm font-medium transition-colors",
                    adjustForm.type === "add"
                      ? "border-success bg-success/10 text-success"
                      : "border-border hover:bg-muted",
                  )}
                >
                  <ArrowUp className="h-4 w-4" /> Add Stock
                </button>
                <button
                  onClick={() => setAdjustForm((p) => ({ ...p, type: "deduct" }))}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-lg border py-3 text-sm font-medium transition-colors",
                    adjustForm.type === "deduct"
                      ? "border-destructive bg-destructive/10 text-destructive"
                      : "border-border hover:bg-muted",
                  )}
                >
                  <ArrowDown className="h-4 w-4" /> Deduct
                </button>
              </div>

              <div className="space-y-1.5">
                <Label>Quantity * ({adjustDrawer.unit})</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={adjustForm.quantity}
                  onChange={(e) => {
                    setAdjustForm((p) => ({ ...p, quantity: e.target.value }));
                    if (adjustErrors.quantity) setAdjustErrors((p) => ({ ...p, quantity: "" }));
                  }}
                  className={cn(adjustErrors.quantity && "border-destructive")}
                />
                {adjustErrors.quantity && <p className="text-xs text-destructive">{adjustErrors.quantity}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>Reason *</Label>
                <Input
                  placeholder="e.g. New delivery, Manual correction"
                  value={adjustForm.reason}
                  onChange={(e) => {
                    setAdjustForm((p) => ({ ...p, reason: e.target.value }));
                    if (adjustErrors.reason) setAdjustErrors((p) => ({ ...p, reason: "" }));
                  }}
                  className={cn(adjustErrors.reason && "border-destructive")}
                />
                {adjustErrors.reason && <p className="text-xs text-destructive">{adjustErrors.reason}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>Notes</Label>
                <textarea
                  value={adjustForm.notes}
                  onChange={(e) => setAdjustForm((p) => ({ ...p, notes: e.target.value }))}
                  placeholder="Additional details…"
                  rows={3}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
              <button onClick={() => setAdjustDrawer(null)} className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted">
                Cancel
              </button>
              <button
                onClick={handleAdjust}
                disabled={submitting}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-70",
                  adjustForm.type === "add" ? "bg-success" : "bg-destructive",
                )}
              >
                {submitting ? "Saving…" : adjustForm.type === "add" ? "Add Stock" : "Deduct Stock"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock History Drawer */}
      {historyDrawer && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40" onClick={() => setHistoryDrawer(null)} />
          <div className="flex w-full max-w-sm flex-col bg-background shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div>
                <h2 className="text-base font-semibold">Stock History</h2>
                <p className="text-xs text-muted-foreground">{historyDrawer.name}</p>
              </div>
              <button onClick={() => setHistoryDrawer(null)} className="rounded p-1 hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {historyLoading ? (
                <div className="py-12 text-center text-sm text-muted-foreground">Loading history…</div>
              ) : (historyMap[historyDrawer._id || historyDrawer.id] || []).length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">No adjustment history yet.</div>
              ) : (
                <div className="space-y-3">
                  {(historyMap[historyDrawer._id || historyDrawer.id] || []).map((entry, idx) => (
                    <div key={idx} className="flex items-start gap-3 rounded-lg border border-border p-3">
                      <div className={cn(
                        "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                        entry.type === "add" ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive",
                      )}>
                        {entry.type === "add" ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={cn("text-sm font-semibold", entry.type === "add" ? "text-success" : "text-destructive")}>
                            {entry.type === "add" ? "+" : "-"}{entry.quantity} {historyDrawer.unit}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : "—"}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs font-medium">{entry.reason}</p>
                        {entry.notes && <p className="mt-0.5 text-xs text-muted-foreground truncate">{entry.notes}</p>}
                        {entry.adjustedBy && <p className="mt-0.5 text-xs text-muted-foreground">By: {entry.adjustedBy}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
