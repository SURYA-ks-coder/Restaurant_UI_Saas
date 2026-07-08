"use client";

import { useCallback, useEffect, useState } from "react";
import { Building2, MapPin, Plus, Warehouse } from "lucide-react";
import { message } from "@/lib/message";
import { cn } from "@/lib/utils";
import { action, API, getAction } from "@/lib/API";
import Table from "@/components/ui/Table";
import DrawerPop from "@/components/ui/DrawerPop";
import ButtonClick from "@/components/ui/ButtonClick";
import Heading from "@/components/ui/Heading";
import { AntInput } from "@/components/ui/AntInput";
import { AntSelect } from "@/components/ui/AntSelect";
import { AntTextArea } from "@/components/ui/AntTextArea";

const STATUS_CONFIG = {
  active: { label: "Active", className: "bg-success/15 text-success border-success/30" },
  inactive: { label: "Inactive", className: "bg-muted text-muted-foreground border-border" },
  maintenance: { label: "Maintenance", className: "bg-warning/15 text-warning border-warning/30" },
};

const UNIT_OPTIONS = [
  { label: "sq.ft", value: "sq.ft" },
  { label: "sq.m", value: "sq.m" },
  { label: "pallets", value: "pallets" },
  { label: "tons", value: "tons" },
];

const STATUS_OPTIONS = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Maintenance", value: "maintenance" },
];

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

const warehouseHeaders = [
  { title: "Warehouse", value: "name", type: "bold", width: 180 },
  { title: "Code", value: "code", width: 110 },
  {
    title: "Location",
    value: "location",
    render: (value, row) => [row.location, row.city].filter(Boolean).join(", ") || "—",
  },
  {
    title: "Capacity",
    value: "capacity",
    render: (value, row) => (row.capacity ? `${row.capacity} ${row.unit || "sq.ft"}` : "—"),
  },
  {
    title: "Manager",
    value: "managerName",
    render: (value, row) => (
      <div>
        <div className="text-sm font-medium">{row.managerName || "—"}</div>
        {row.managerPhone && (
          <div className="text-xs text-muted-foreground">{row.managerPhone}</div>
        )}
      </div>
    ),
  },
  {
    title: "Status",
    value: "status",
    render: (value) => {
      const cfg = STATUS_CONFIG[value] || STATUS_CONFIG.active;
      return (
        <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-medium", cfg.className)}>
          {cfg.label}
        </span>
      );
    },
  },
  { title: "Actions", value: "actions", type: "action", align: "right", width: 100 },
];

export default function WarehousePage() {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const openEdit = (id, warehouse) => {
    setEditId(id);
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
      const endpoint = editId ? `${API.UPDATE_WAREHOUSE}/${editId}` : API.CREATE_WAREHOUSE;
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

  const setField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const getError = (field) => errors[field] || "";

  const stats = [
    { label: "Total Warehouses", value: warehouses.length, icon: Warehouse, color: "text-primary bg-primary/10" },
    { label: "Active", value: warehouses.filter((w) => w.status === "active").length, icon: Building2, color: "text-success bg-success/10" },
    { label: "In Maintenance", value: warehouses.filter((w) => w.status === "maintenance").length, icon: MapPin, color: "text-warning bg-warning/10" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Heading
          title="Warehouse Management"
          description="Manage storage locations for your inventory"
        />
        <ButtonClick
          handleSubmit={openAdd}
          buttonName="Add Warehouse"
          icon={<Plus className="h-4 w-4" />}
          BtnType="primary"
        />
      </div>

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

      <Table
        header={warehouseHeaders}
        data={warehouses}
        title="Warehouses"
        rowKey="_id"
        loading={loading}
        searchPlaceholder="Search warehouses…"
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      <DrawerPop
        open={drawerOpen}
        close={() => setDrawerOpen(false)}
        header={[editId ? "Edit Warehouse" : "Add Warehouse", "Fill in the warehouse details below"]}
        handleSubmit={handleSubmit}
        footerBtn={["Cancel", "Save"]}
        footerBtnDisabled={submitting}
        loadingButton={submitting}
        width={560}
      >
        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <div className="grid gap-4 md:grid-cols-2">
            <AntInput
              label="Warehouse Name *"
              placeholder="e.g. Main Storage"
              value={form.name}
              error={getError("name")}
              onChange={(e) => setField("name", e.target.value)}
            />
            <AntInput
              label="Code *"
              placeholder="e.g. WH-01"
              value={form.code}
              error={getError("code")}
              onChange={(e) => setField("code", e.target.value)}
            />
          </div>

          <AntInput
            label="Location / Address *"
            placeholder="Street address"
            value={form.location}
            error={getError("location")}
            onChange={(e) => setField("location", e.target.value)}
          />

          <AntInput
            label="City"
            placeholder="City"
            value={form.city}
            onChange={(e) => setField("city", e.target.value)}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <AntInput
              label="Capacity"
              type="number"
              placeholder="e.g. 5000"
              value={form.capacity}
              onChange={(e) => setField("capacity", e.target.value)}
            />
            <AntSelect
              label="Unit"
              value={form.unit}
              options={UNIT_OPTIONS}
              onChange={(value) => setField("unit", value)}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <AntInput
              label="Manager Name"
              placeholder="e.g. John Doe"
              value={form.managerName}
              onChange={(e) => setField("managerName", e.target.value)}
            />
            <AntInput
              label="Manager Phone"
              placeholder="10-digit number"
              value={form.managerPhone}
              onChange={(e) => setField("managerPhone", e.target.value)}
            />
          </div>

          <AntSelect
            label="Status"
            value={form.status}
            options={STATUS_OPTIONS}
            onChange={(value) => setField("status", value)}
          />

          <AntTextArea
            label="Notes"
            placeholder="Additional notes…"
            value={form.notes}
            onChange={(e) => setField("notes", e.target.value)}
          />
        </div>
      </DrawerPop>
    </div>
  );
}
