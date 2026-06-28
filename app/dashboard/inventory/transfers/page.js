"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Edit2,
  Package,
  Plus,
  Search,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import { Popconfirm } from "antd";
import { message } from "@/lib/message";
import { cn } from "@/lib/utils";
import { action, API, getAction } from "@/lib/API";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const STATUS_CONFIG = {
  pending: { label: "Pending", className: "bg-yellow-50 text-yellow-700 border-yellow-200", icon: Clock },
  in_transit: { label: "In Transit", className: "bg-primary/10 text-primary border-primary/30", icon: Truck },
  completed: { label: "Completed", className: "bg-success/15 text-success border-success/30", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", className: "bg-destructive/10 text-destructive border-destructive/30", icon: X },
};

const EMPTY_FORM = {
  fromWarehouse: "",
  toWarehouse: "",
  itemName: "",
  itemId: "",
  quantity: "",
  unit: "",
  reason: "",
  transferDate: "",
  notes: "",
};

export default function TransfersPage() {
  const [transfers, setTransfers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [transfersRes, warehousesRes, inventoryRes] = await Promise.all([
        getAction(API.GET_TRANSFER_LIST),
        getAction(API.GET_WAREHOUSE_LIST),
        getAction(API.GET_INVENTORY_ITEM_LIST),
      ]);
      if (transfersRes?.statusCode === 200) setTransfers(transfersRes.data || []);
      if (warehousesRes?.statusCode === 200) setWarehouses(warehousesRes.data || []);
      if (inventoryRes?.statusCode === 200) setInventoryItems(inventoryRes.data || []);
    } catch {
      message.error("Failed to load transfers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = transfers.filter((t) => {
    const matchSearch =
      t.itemName?.toLowerCase().includes(search.toLowerCase()) ||
      t.fromWarehouse?.toLowerCase().includes(search.toLowerCase()) ||
      t.toWarehouse?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const validate = () => {
    const next = {};
    if (!form.fromWarehouse) next.fromWarehouse = "Source warehouse required";
    if (!form.toWarehouse) next.toWarehouse = "Destination warehouse required";
    if (form.fromWarehouse && form.fromWarehouse === form.toWarehouse)
      next.toWarehouse = "Source and destination must differ";
    if (!form.itemId) next.itemId = "Item is required";
    if (!form.quantity || Number(form.quantity) <= 0) next.quantity = "Valid quantity required";
    if (!form.transferDate) next.transferDate = "Transfer date required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const openAdd = () => {
    setEditId(null);
    setForm({ ...EMPTY_FORM, transferDate: new Date().toISOString().split("T")[0] });
    setErrors({});
    setDrawerOpen(true);
  };

  const openEdit = (transfer) => {
    setEditId(transfer._id || transfer.id);
    setForm({
      fromWarehouse: transfer.fromWarehouse || "",
      toWarehouse: transfer.toWarehouse || "",
      itemName: transfer.itemName || "",
      itemId: transfer.itemId || transfer.item?._id || "",
      quantity: transfer.quantity || "",
      unit: transfer.unit || "",
      reason: transfer.reason || "",
      transferDate: transfer.transferDate?.split("T")[0] || "",
      notes: transfer.notes || "",
    });
    setErrors({});
    setDrawerOpen(true);
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const endpoint = editId
        ? `${API.UPDATE_TRANSFER}/${editId}`
        : API.CREATE_TRANSFER;
      const method = editId ? "PATCH" : "POST";
      const result = await action(endpoint, form, method);

      if (result?.statusCode === 200 || result?.statusCode === 201) {
        message.success(editId ? "Transfer updated." : "Transfer created.");
        setDrawerOpen(false);
        fetchData();
      } else {
        message.error(result?.message || "Something went wrong.");
      }
    } catch {
      message.error("Request failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const result = await action(`${API.DELETE_TRANSFER}/${id}`, {}, "DELETE");
      if (result?.statusCode === 200) {
        message.success("Transfer deleted.");
        setTransfers((prev) => prev.filter((t) => (t._id || t.id) !== id));
      } else {
        message.error(result?.message || "Delete failed.");
      }
    } catch {
      message.error("Delete failed.");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const result = await action(`${API.UPDATE_TRANSFER_STATUS}/${id}`, { status }, "PATCH");
      if (result?.statusCode === 200) {
        message.success(`Transfer marked as ${status.replace("_", " ")}.`);
        setTransfers((prev) =>
          prev.map((t) => ((t._id || t.id) === id ? { ...t, status } : t)),
        );
      } else {
        message.error(result?.message || "Status update failed.");
      }
    } catch {
      message.error("Status update failed.");
    }
  };

  const counts = {
    all: transfers.length,
    pending: transfers.filter((t) => t.status === "pending").length,
    in_transit: transfers.filter((t) => t.status === "in_transit").length,
    completed: transfers.filter((t) => t.status === "completed").length,
  };

  const setField = (name, value) => {
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Stock Transfers</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Move stock between warehouses and branches
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          New Transfer
        </button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Object.entries(counts).map(([key, val]) => {
          const cfg = key === "all" ? { label: "All Transfers", className: "text-foreground bg-muted" } : { label: STATUS_CONFIG[key]?.label, className: STATUS_CONFIG[key]?.className };
          return (
            <div key={key} className="glass-card rounded-lg p-4">
              <p className="text-xs text-muted-foreground">{cfg.label}</p>
              <p className="text-2xl font-bold">{val}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transfers…"
            className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-4 text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="flex gap-2">
          {["all", "pending", "in_transit", "completed"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                statusFilter === s
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-muted-foreground hover:bg-muted",
              )}
            >
              {s === "all" ? "All" : STATUS_CONFIG[s]?.label}
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
                {["Item", "From → To", "Quantity", "Date", "Reason", "Status", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-muted-foreground">Loading transfers…</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-muted-foreground">
                    {search || statusFilter !== "all" ? "No transfers match your filters." : "No transfers yet. Create one to get started."}
                  </td>
                </tr>
              ) : (
                filtered.map((t) => {
                  const statusCfg = STATUS_CONFIG[t.status] || STATUS_CONFIG.pending;
                  const id = t._id || t.id;
                  return (
                    <tr key={id} className="border-b border-border/50 transition-colors hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-2 font-medium">
                          <Package className="h-3.5 w-3.5 text-muted-foreground" />
                          {t.itemName || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <span>{t.fromWarehouse || "—"}</span>
                          <ArrowRight className="h-3 w-3 shrink-0" />
                          <span>{t.toWarehouse || "—"}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {t.quantity} <span className="text-xs text-muted-foreground">{t.unit}</span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {t.transferDate ? new Date(t.transferDate).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{t.reason || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-medium", statusCfg.className)}>
                          {statusCfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {t.status === "pending" && (
                            <button
                              onClick={() => updateStatus(id, "in_transit")}
                              className="rounded px-2 py-1 text-xs text-primary hover:bg-primary/10"
                              title="Mark In Transit"
                            >
                              <Truck className="h-3.5 w-3.5" />
                            </button>
                          )}
                          {t.status === "in_transit" && (
                            <button
                              onClick={() => updateStatus(id, "completed")}
                              className="rounded px-2 py-1 text-xs text-success hover:bg-success/10"
                              title="Mark Completed"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => openEdit(t)}
                            className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <Popconfirm
                            title="Delete this transfer?"
                            onConfirm={() => handleDelete(id)}
                            okText="Delete"
                            okButtonProps={{ danger: true }}
                          >
                            <button className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </Popconfirm>
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

      {/* Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40" onClick={() => setDrawerOpen(false)} />
          <div className="flex w-full max-w-md flex-col bg-background shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div>
                <h2 className="text-base font-semibold">{editId ? "Edit Transfer" : "New Transfer"}</h2>
                <p className="text-xs text-muted-foreground">Move stock between warehouses</p>
              </div>
              <button onClick={() => setDrawerOpen(false)} className="rounded p-1 hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <div className="space-y-1.5">
                <Label>From Warehouse *</Label>
                <select
                  value={form.fromWarehouse}
                  onChange={(e) => setField("fromWarehouse", e.target.value)}
                  className={cn("h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:border-primary", errors.fromWarehouse ? "border-destructive" : "border-border")}
                >
                  <option value="">Select source warehouse</option>
                  {warehouses.map((w) => (
                    <option key={w._id || w.id} value={w.name}>{w.name}</option>
                  ))}
                </select>
                {errors.fromWarehouse && <p className="text-xs text-destructive">{errors.fromWarehouse}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>To Warehouse *</Label>
                <select
                  value={form.toWarehouse}
                  onChange={(e) => setField("toWarehouse", e.target.value)}
                  className={cn("h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:border-primary", errors.toWarehouse ? "border-destructive" : "border-border")}
                >
                  <option value="">Select destination warehouse</option>
                  {warehouses.map((w) => (
                    <option key={w._id || w.id} value={w.name}>{w.name}</option>
                  ))}
                </select>
                {errors.toWarehouse && <p className="text-xs text-destructive">{errors.toWarehouse}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>Item *</Label>
                <select
                  value={form.itemId}
                  onChange={(e) => {
                    const item = inventoryItems.find((i) => (i._id || i.id) === e.target.value);
                    setField("itemId", e.target.value);
                    setField("itemName", item?.name || "");
                    setField("unit", item?.unit || "");
                  }}
                  className={cn("h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:border-primary", errors.itemId ? "border-destructive" : "border-border")}
                >
                  <option value="">Select inventory item</option>
                  {inventoryItems.map((item) => (
                    <option key={item._id || item.id} value={item._id || item.id}>
                      {item.name} {item.unit ? `(${item.unit})` : ""}
                    </option>
                  ))}
                </select>
                {errors.itemId && <p className="text-xs text-destructive">{errors.itemId}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Quantity *</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={form.quantity}
                    onChange={(e) => setField("quantity", e.target.value)}
                    className={cn(errors.quantity && "border-destructive")}
                  />
                  {errors.quantity && <p className="text-xs text-destructive">{errors.quantity}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Unit</Label>
                  <Input value={form.unit} readOnly placeholder="Auto-filled" className="bg-muted/50" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Transfer Date *</Label>
                <Input
                  type="date"
                  value={form.transferDate}
                  onChange={(e) => setField("transferDate", e.target.value)}
                  className={cn(errors.transferDate && "border-destructive")}
                />
                {errors.transferDate && <p className="text-xs text-destructive">{errors.transferDate}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>Reason</Label>
                <Input placeholder="e.g. Branch restocking" value={form.reason} onChange={(e) => setField("reason", e.target.value)} />
              </div>

              <div className="space-y-1.5">
                <Label>Notes</Label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setField("notes", e.target.value)}
                  placeholder="Additional notes…"
                  rows={3}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
              <button onClick={() => setDrawerOpen(false)} className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted">
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-70"
              >
                {submitting ? "Saving…" : editId ? "Update" : "Create Transfer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
