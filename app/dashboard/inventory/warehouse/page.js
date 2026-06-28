"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Building2,
  Edit2,
  MapPin,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  Warehouse,
  X,
} from "lucide-react";
import { message, Popconfirm } from "antd";
import { cn } from "@/lib/utils";
import { action, API, getAction } from "@/lib/API";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const STATUS_CONFIG = {
  active: { label: "Active", className: "bg-success/15 text-success border-success/30" },
  inactive: { label: "Inactive", className: "bg-muted text-muted-foreground border-border" },
  maintenance: { label: "Maintenance", className: "bg-warning/15 text-warning border-warning/30" },
};

const EMPTY_FORM = {
  name: "",
  code: "",
  location: "",
  city: "",
  capacity: "",
  unit: "sq.ft",
  managerName: "",
  managerPhone: "",
  status: "active",
  notes: "",
};

export default function WarehousePage() {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const fetchWarehouses = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAction(API.GET_WAREHOUSE_LIST);
      if (result?.statusCode === 200) {
        setWarehouses(result.data || []);
      }
    } catch {
      message.error("Failed to load warehouses");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWarehouses();
  }, [fetchWarehouses]);

  const filtered = warehouses.filter(
    (w) =>
      w.name?.toLowerCase().includes(search.toLowerCase()) ||
      w.code?.toLowerCase().includes(search.toLowerCase()) ||
      w.location?.toLowerCase().includes(search.toLowerCase()),
  );

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Warehouse name is required";
    if (!form.code.trim()) next.code = "Warehouse code is required";
    if (!form.location.trim()) next.location = "Location is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const openAdd = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setDrawerOpen(true);
  };

  const openEdit = (warehouse) => {
    setEditId(warehouse._id || warehouse.id);
    setForm({
      name: warehouse.name || "",
      code: warehouse.code || "",
      location: warehouse.location || "",
      city: warehouse.city || "",
      capacity: warehouse.capacity || "",
      unit: warehouse.unit || "sq.ft",
      managerName: warehouse.managerName || "",
      managerPhone: warehouse.managerPhone || "",
      status: warehouse.status || "active",
      notes: warehouse.notes || "",
    });
    setErrors({});
    setDrawerOpen(true);
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const endpoint = editId
        ? `${API.UPDATE_WAREHOUSE}/${editId}`
        : API.CREATE_WAREHOUSE;
      const method = editId ? "PATCH" : "POST";
      const result = await action(endpoint, form, method);

      if (result?.statusCode === 200 || result?.statusCode === 201) {
        message.success(editId ? "Warehouse updated." : "Warehouse created.");
        setDrawerOpen(false);
        fetchWarehouses();
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
      const result = await action(`${API.DELETE_WAREHOUSE}/${id}`, {}, "DELETE");
      if (result?.statusCode === 200) {
        message.success("Warehouse deleted.");
        setWarehouses((prev) => prev.filter((w) => (w._id || w.id) !== id));
      } else {
        message.error(result?.message || "Delete failed.");
      }
    } catch {
      message.error("Delete failed.");
    }
  };

  const field = (name) => ({
    value: form[name],
    onChange: (e) => {
      setForm((p) => ({ ...p, [name]: e.target.value }));
      if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
    },
  });

  const stats = [
    { label: "Total Warehouses", value: warehouses.length, icon: Warehouse, color: "text-primary bg-primary/10" },
    { label: "Active", value: warehouses.filter((w) => w.status === "active").length, icon: Building2, color: "text-success bg-success/10" },
    { label: "In Maintenance", value: warehouses.filter((w) => w.status === "maintenance").length, icon: MapPin, color: "text-warning bg-warning/10" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Warehouse Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage storage locations for your inventory
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Add Warehouse
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

      {/* Search */}
      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search warehouses…"
            className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-4 text-sm outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-lg border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {["Warehouse", "Code", "Location", "Capacity", "Manager", "Status", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-muted-foreground">
                    Loading warehouses…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-muted-foreground">
                    {search ? "No warehouses match your search." : "No warehouses yet. Add one to get started."}
                  </td>
                </tr>
              ) : (
                filtered.map((w) => {
                  const statusCfg = STATUS_CONFIG[w.status] || STATUS_CONFIG.active;
                  const id = w._id || w.id;
                  return (
                    <tr key={id} className="border-b border-border/50 transition-colors hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium">{w.name}</td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{w.code}</td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {[w.location, w.city].filter(Boolean).join(", ")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {w.capacity ? `${w.capacity} ${w.unit || "sq.ft"}` : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium">{w.managerName || "—"}</div>
                        {w.managerPhone && (
                          <div className="text-xs text-muted-foreground">{w.managerPhone}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-medium", statusCfg.className)}>
                          {statusCfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEdit(w)}
                            className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <Popconfirm
                            title="Delete this warehouse?"
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
                <h2 className="text-base font-semibold">{editId ? "Edit Warehouse" : "Add Warehouse"}</h2>
                <p className="text-xs text-muted-foreground">Fill in the warehouse details below</p>
              </div>
              <button onClick={() => setDrawerOpen(false)} className="rounded p-1 hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Warehouse Name *</Label>
                  <Input placeholder="e.g. Main Storage" {...field("name")} className={cn(errors.name && "border-destructive")} />
                  {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Code *</Label>
                  <Input placeholder="e.g. WH-01" {...field("code")} className={cn(errors.code && "border-destructive")} />
                  {errors.code && <p className="text-xs text-destructive">{errors.code}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Location / Address *</Label>
                <Input placeholder="Street address" {...field("location")} className={cn(errors.location && "border-destructive")} />
                {errors.location && <p className="text-xs text-destructive">{errors.location}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>City</Label>
                <Input placeholder="City" {...field("city")} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Capacity</Label>
                  <Input type="number" placeholder="e.g. 5000" {...field("capacity")} />
                </div>
                <div className="space-y-1.5">
                  <Label>Unit</Label>
                  <select
                    value={form.unit}
                    onChange={(e) => setForm((p) => ({ ...p, unit: e.target.value }))}
                    className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                  >
                    {["sq.ft", "sq.m", "pallets", "tons"].map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Manager Name</Label>
                  <Input placeholder="e.g. John Doe" {...field("managerName")} />
                </div>
                <div className="space-y-1.5">
                  <Label>Manager Phone</Label>
                  <Input placeholder="10-digit number" {...field("managerPhone")} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Status</Label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                  className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label>Notes</Label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                  placeholder="Additional notes…"
                  rows={3}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
              <button
                onClick={() => setDrawerOpen(false)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-70"
              >
                {submitting ? "Saving…" : editId ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
