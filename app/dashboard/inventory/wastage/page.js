"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  Edit2,
  Plus,
  Search,
  Trash2,
  TrendingDown,
  X,
} from "lucide-react";
import { message, Popconfirm } from "antd";
import { cn } from "@/lib/utils";
import { action, API, getAction } from "@/lib/API";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const WASTE_REASONS = [
  "Expired",
  "Spoiled",
  "Damaged",
  "Overproduction",
  "Preparation Error",
  "Spillage",
  "Contamination",
  "Other",
];

const EMPTY_FORM = {
  itemId: "",
  itemName: "",
  quantity: "",
  unit: "",
  reason: "",
  recordedBy: "",
  wastedAt: "",
  notes: "",
};

export default function WastagePage() {
  const [wastageList, setWastageList] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [reasonFilter, setReasonFilter] = useState("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [wastageRes, inventoryRes] = await Promise.all([
        getAction(API.GET_WASTAGE_LIST),
        getAction(API.GET_INVENTORY_ITEM_LIST),
      ]);
      if (wastageRes?.statusCode === 200) setWastageList(wastageRes.data || []);
      if (inventoryRes?.statusCode === 200) setInventoryItems(inventoryRes.data || []);
    } catch {
      message.error("Failed to load wastage records");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = wastageList.filter((w) => {
    const matchSearch =
      w.itemName?.toLowerCase().includes(search.toLowerCase()) ||
      w.recordedBy?.toLowerCase().includes(search.toLowerCase());
    const matchReason = reasonFilter === "all" || w.reason === reasonFilter;
    return matchSearch && matchReason;
  });

  const totalWasted = wastageList.reduce((sum, w) => sum + Number(w.quantity || 0), 0);

  const validate = () => {
    const next = {};
    if (!form.itemId) next.itemId = "Item is required";
    if (!form.quantity || Number(form.quantity) <= 0) next.quantity = "Valid quantity required";
    if (!form.reason) next.reason = "Reason is required";
    if (!form.wastedAt) next.wastedAt = "Date is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const openAdd = () => {
    setEditId(null);
    setForm({ ...EMPTY_FORM, wastedAt: new Date().toISOString().split("T")[0] });
    setErrors({});
    setDrawerOpen(true);
  };

  const openEdit = (entry) => {
    setEditId(entry._id || entry.id);
    setForm({
      itemId: entry.itemId || entry.item?._id || "",
      itemName: entry.itemName || "",
      quantity: entry.quantity || "",
      unit: entry.unit || "",
      reason: entry.reason || "",
      recordedBy: entry.recordedBy || "",
      wastedAt: entry.wastedAt?.split("T")[0] || "",
      notes: entry.notes || "",
    });
    setErrors({});
    setDrawerOpen(true);
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const endpoint = editId
        ? `${API.UPDATE_WASTAGE}/${editId}`
        : API.CREATE_WASTAGE;
      const method = editId ? "PATCH" : "POST";
      const result = await action(endpoint, form, method);

      if (result?.statusCode === 200 || result?.statusCode === 201) {
        message.success(editId ? "Wastage record updated." : "Wastage logged successfully.");
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
      const result = await action(`${API.DELETE_WASTAGE}/${id}`, {}, "DELETE");
      if (result?.statusCode === 200) {
        message.success("Record deleted.");
        setWastageList((prev) => prev.filter((w) => (w._id || w.id) !== id));
      } else {
        message.error(result?.message || "Delete failed.");
      }
    } catch {
      message.error("Delete failed.");
    }
  };

  const setField = (name, value) => {
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const reasonCounts = WASTE_REASONS.reduce((acc, r) => {
    acc[r] = wastageList.filter((w) => w.reason === r).length;
    return acc;
  }, {});

  const stats = [
    { label: "Total Records", value: wastageList.length, icon: TrendingDown, color: "text-destructive bg-destructive/10" },
    { label: "Total Wasted Units", value: totalWasted.toFixed(1), icon: AlertTriangle, color: "text-warning bg-warning/10" },
    { label: "This Month", value: wastageList.filter((w) => {
        const d = new Date(w.wastedAt || w.createdAt);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).length, icon: TrendingDown, color: "text-primary bg-primary/10" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Wastage Tracking</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Log and monitor food wastage across your operations
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Log Wastage
        </button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
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
            placeholder="Search by item or staff…"
            className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-4 text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setReasonFilter("all")}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium",
              reasonFilter === "all" ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:bg-muted",
            )}
          >
            All
          </button>
          {WASTE_REASONS.map((r) => (
            <button
              key={r}
              onClick={() => setReasonFilter(r)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium",
                reasonFilter === r ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:bg-muted",
              )}
            >
              {r} {reasonCounts[r] > 0 && <span className="ml-1 opacity-70">({reasonCounts[r]})</span>}
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
                {["Item", "Quantity", "Reason", "Recorded By", "Date", "Notes", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-muted-foreground">Loading wastage records…</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-muted-foreground">
                    {search || reasonFilter !== "all" ? "No records match your filters." : "No wastage records yet."}
                  </td>
                </tr>
              ) : (
                filtered.map((w) => {
                  const id = w._id || w.id;
                  return (
                    <tr key={id} className="border-b border-border/50 transition-colors hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium">{w.itemName || "—"}</td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-destructive">{w.quantity}</span>
                        <span className="ml-1 text-xs text-muted-foreground">{w.unit}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive">
                          {w.reason}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{w.recordedBy || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {w.wastedAt ? new Date(w.wastedAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-3 max-w-xs truncate text-muted-foreground">{w.notes || "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEdit(w)}
                            className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <Popconfirm
                            title="Delete this wastage record?"
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
                <h2 className="text-base font-semibold">{editId ? "Edit Wastage Record" : "Log Wastage"}</h2>
                <p className="text-xs text-muted-foreground">Record wasted or spoiled inventory</p>
              </div>
              <button onClick={() => setDrawerOpen(false)} className="rounded p-1 hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
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
                <Label>Reason *</Label>
                <select
                  value={form.reason}
                  onChange={(e) => setField("reason", e.target.value)}
                  className={cn("h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:border-primary", errors.reason ? "border-destructive" : "border-border")}
                >
                  <option value="">Select reason</option>
                  {WASTE_REASONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                {errors.reason && <p className="text-xs text-destructive">{errors.reason}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>Recorded By</Label>
                <Input
                  placeholder="Staff name"
                  value={form.recordedBy}
                  onChange={(e) => setField("recordedBy", e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Date *</Label>
                <Input
                  type="date"
                  value={form.wastedAt}
                  onChange={(e) => setField("wastedAt", e.target.value)}
                  className={cn(errors.wastedAt && "border-destructive")}
                />
                {errors.wastedAt && <p className="text-xs text-destructive">{errors.wastedAt}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>Notes</Label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setField("notes", e.target.value)}
                  placeholder="Additional details…"
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
                {submitting ? "Saving…" : editId ? "Update" : "Log Wastage"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
