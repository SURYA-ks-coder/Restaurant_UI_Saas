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
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { action, API, getAction } from "@/lib/API";
import Table from "@/components/ui/Table";
import DrawerPop from "@/components/ui/DrawerPop";
import Heading from "@/components/ui/Heading";
import { AntInput } from "@/components/ui/AntInput";
import { AntTextArea } from "@/components/ui/AntTextArea";

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
  const [statusFilter, setStatusFilter] = useState("all");
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustItem, setAdjustItem] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyItem, setHistoryItem] = useState(null);
  const [adjustForm, setAdjustForm] = useState({ type: "add", quantity: "", reason: "", notes: "" });
  const [adjustErrors, setAdjustErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchStock = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAction(API.GET_INVENTORY_LIST);
      if (result?.statusCode === 200) {
        setStockList(
          (result.data || []).map((item) => {
            const currentStock = item.stockQuantity ?? 0;
            const par = item.minimumStock ?? 0;
            return {
              ...item,
              name: item.materialName,
              currentStock,
              par,
              cost: item.purchasePrice ? `₹${item.purchasePrice}` : "—",
              status: getStockStatus(currentStock, par),
            };
          }),
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

  const counts = {
    all: stockList.length,
    healthy: stockList.filter((s) => s.status === "healthy").length,
    watch: stockList.filter((s) => s.status === "watch").length,
    low: stockList.filter((s) => s.status === "low").length,
    critical: stockList.filter((s) => s.status === "critical").length,
  };

  const filteredStock =
    statusFilter === "all" ? stockList : stockList.filter((s) => s.status === statusFilter);

  const openAdjust = (id, item) => {
    setAdjustItem(item);
    setAdjustForm({ type: "add", quantity: "", reason: "", notes: "" });
    setAdjustErrors({});
    setAdjustOpen(true);
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
      const id = adjustItem._id || adjustItem.id;
      const endpoint = (
        adjustForm.type === "add" ? API.ADD_INVENTORY_STOCK : API.REMOVE_INVENTORY_STOCK
      ).replace(":id", id);
      const result = await action(endpoint, {
        quantity: Number(adjustForm.quantity),
        notes: [adjustForm.reason, adjustForm.notes].filter(Boolean).join(" — "),
      });

      if (result?.statusCode === 200 || result?.statusCode === 201) {
        message.success(`Stock ${adjustForm.type === "add" ? "added" : "deducted"} successfully.`);
        setAdjustOpen(false);
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

  const openHistory = async (id, item) => {
    setHistoryItem(item);
    setHistoryOpen(true);
    if (historyMap[id]) return;
    setHistoryLoading(true);
    try {
      const result = await getAction(API.GET_INVENTORY_HISTORY.replace(":id", id));
      if (result?.statusCode === 200) {
        setHistoryMap((prev) => ({ ...prev, [id]: result.data || [] }));
      }
    } catch {
      message.error("Failed to load history");
    } finally {
      setHistoryLoading(false);
    }
  };

  const setAdjustField = (name, value) => {
    setAdjustForm((prev) => ({ ...prev, [name]: value }));
    if (adjustErrors[name]) setAdjustErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const stats = [
    { label: "Total Items", value: counts.all, color: "text-primary bg-primary/10", icon: Package },
    { label: "Critical", value: counts.critical, color: "text-destructive bg-destructive/10", icon: AlertTriangle },
    { label: "Low Stock", value: counts.low, color: "text-warning bg-warning/10", icon: AlertTriangle },
    { label: "Healthy", value: counts.healthy, color: "text-success bg-success/10", icon: CheckCircle2 },
  ];

  const stockHeaders = [
    {
      title: "Item",
      value: "name",
      width: 200,
      render: (value, row) => (
        <div>
          <div className="font-medium">{row.name}</div>
          <div className="text-xs text-muted-foreground">{row.itemId || row._id || row.id}</div>
        </div>
      ),
    },
    { title: "Category", value: "category" },
    {
      title: "Current Stock",
      value: "currentStock",
      render: (value, row) => {
        const pct = row.par > 0 ? Math.min(100, Math.round((row.currentStock / row.par) * 100)) : 100;
        return (
          <div>
            <span className="font-semibold">
              {row.currentStock} <span className="text-xs font-normal text-muted-foreground">{row.unit}</span>
            </span>
            {row.par > 0 && (
              <div className="mt-1 h-1.5 w-24 rounded-full bg-muted">
                <div
                  className={cn("h-full rounded-full transition-all", {
                    "bg-success": row.status === "healthy",
                    "bg-accent": row.status === "watch",
                    "bg-warning": row.status === "low",
                    "bg-destructive": row.status === "critical",
                  })}
                  style={{ width: `${pct}%` }}
                />
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Par Level",
      value: "par",
      render: (value, row) => (row.par > 0 ? `${row.par} ${row.unit}` : "—"),
    },
    { title: "Unit Cost", value: "cost" },
    { title: "Supplier", value: "supplier" },
    {
      title: "Status",
      value: "status",
      render: (value) => {
        const cfg = STOCK_STATUS[value] || STOCK_STATUS.healthy;
        return (
          <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-medium", cfg.className)}>
            {cfg.label}
          </span>
        );
      },
    },
    {
      title: "Actions",
      value: "actions",
      align: "right",
      render: (value, row) => {
        const id = row._id || row.id;
        return (
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                openAdjust(id, row);
              }}
              className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10"
              title="Adjust stock"
            >
              <SlidersHorizontal className="h-3 w-3" />
              Adjust
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                openHistory(id, row);
              }}
              className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              title="View history"
            >
              <History className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="mb-6 flex items-center justify-between">
        <Heading
          title="Stock Management"
          description="Real-time stock levels with manual adjustments"
        />
      </div>

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

      <div className="mb-4 flex flex-wrap gap-2">
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

      <Table
        header={stockHeaders}
        data={filteredStock}
        title="Stock"
        rowKey="_id"
        loading={loading}
        searchPlaceholder="Search items, category, supplier…"
      />

      <DrawerPop
        open={adjustOpen}
        close={() => setAdjustOpen(false)}
        header={["Adjust Stock", adjustItem?.name || ""]}
        handleSubmit={handleAdjust}
        footerBtn={["Cancel", adjustForm.type === "add" ? "Add Stock" : "Deduct Stock"]}
        footerBtnDisabled={submitting}
        loadingButton={submitting}
        width={480}
      >
        {adjustItem && (
          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-xs text-muted-foreground">Current Stock</p>
              <p className="text-2xl font-bold">
                {adjustItem.currentStock ?? 0}{" "}
                <span className="text-sm font-normal text-muted-foreground">{adjustItem.unit}</span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setAdjustField("type", "add")}
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
                onClick={() => setAdjustField("type", "deduct")}
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

            <AntInput
              label={`Quantity * (${adjustItem.unit || ""})`}
              type="number"
              placeholder="0"
              value={adjustForm.quantity}
              error={adjustErrors.quantity}
              onChange={(e) => setAdjustField("quantity", e.target.value)}
            />

            <AntInput
              label="Reason *"
              placeholder="e.g. New delivery, Manual correction"
              value={adjustForm.reason}
              error={adjustErrors.reason}
              onChange={(e) => setAdjustField("reason", e.target.value)}
            />

            <AntTextArea
              label="Notes"
              placeholder="Additional details…"
              value={adjustForm.notes}
              onChange={(e) => setAdjustField("notes", e.target.value)}
            />
          </div>
        )}
      </DrawerPop>

      <DrawerPop
        open={historyOpen}
        close={() => setHistoryOpen(false)}
        header={["Stock History", historyItem?.name || ""]}
        isFooter={false}
        width={480}
      >
        {historyItem && (
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {historyLoading ? (
              <div className="py-12 text-center text-sm text-muted-foreground">Loading history…</div>
            ) : (historyMap[historyItem._id || historyItem.id] || []).length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">No adjustment history yet.</div>
            ) : (
              <div className="space-y-3">
                {(historyMap[historyItem._id || historyItem.id] || []).map((entry, idx) => {
                  const isAdd = Number(entry.quantity) >= 0;
                  return (
                    <div key={idx} className="flex items-start gap-3 rounded-lg border border-border p-3">
                      <div
                        className={cn(
                          "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                          isAdd ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive",
                        )}
                      >
                        {isAdd ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className={cn("text-sm font-semibold", isAdd ? "text-success" : "text-destructive")}>
                            {isAdd ? "+" : "-"}
                            {Math.abs(Number(entry.quantity))} {historyItem.unit}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {entry.createdAt ? new Date(entry.createdAt).toLocaleString() : "—"}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs font-medium capitalize">
                          {(entry.type || "").replace(/_/g, " ")} · Balance: {entry.updatedQuantity} {historyItem.unit}
                        </p>
                        {entry.notes && <p className="mt-0.5 truncate text-xs text-muted-foreground">{entry.notes}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </DrawerPop>
    </div>
  );
}
