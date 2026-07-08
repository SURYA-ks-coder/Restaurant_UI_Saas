"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Plus,
  ThumbsUp,
  Truck,
  X,
} from "lucide-react";
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
  pending: { label: "Pending", className: "bg-yellow-50 text-yellow-700 border-yellow-200", icon: Clock },
  approved: { label: "Approved", className: "bg-primary/10 text-primary border-primary/30", icon: ThumbsUp },
  completed: { label: "Completed", className: "bg-success/15 text-success border-success/30", icon: CheckCircle2 },
  rejected: { label: "Rejected", className: "bg-destructive/10 text-destructive border-destructive/30", icon: X },
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
  const [statusFilter, setStatusFilter] = useState("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [transfersRes, warehousesRes, inventoryRes] = await Promise.all([
        getAction(API.GET_STOCK_TRANSFER_LIST),
        getAction(API.GET_WAREHOUSE_LIST),
        getAction(API.GET_INVENTORY_LIST),
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
    setForm({ ...EMPTY_FORM, transferDate: new Date().toISOString().split("T")[0] });
    setErrors({});
    setDrawerOpen(true);
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const result = await action(API.CREATE_STOCK_TRANSFER, form, "POST");

      if (result?.statusCode === 200 || result?.statusCode === 201) {
        message.success("Transfer created.");
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

  const updateStatus = async (id, endpointTemplate, status) => {
    try {
      const result = await action(endpointTemplate.replace(":id", id), {}, "PATCH");
      if (result?.statusCode === 200) {
        message.success(`Transfer marked as ${status}.`);
        setTransfers((prev) => prev.map((t) => ((t._id || t.id) === id ? { ...t, status } : t)));
      } else {
        message.error(result?.message || "Status update failed.");
      }
    } catch {
      message.error("Status update failed.");
    }
  };

  const setField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const getError = (field) => errors[field] || "";

  const warehouseOptions = warehouses.map((w) => ({ label: w.name, value: w.name }));
  const itemOptions = inventoryItems.map((item) => ({
    label: `${item.name}${item.unit ? ` (${item.unit})` : ""}`,
    value: item._id || item.id,
  }));

  const counts = {
    all: transfers.length,
    pending: transfers.filter((t) => t.status === "pending").length,
    approved: transfers.filter((t) => t.status === "approved").length,
    completed: transfers.filter((t) => t.status === "completed").length,
  };

  const filteredTransfers =
    statusFilter === "all" ? transfers : transfers.filter((t) => t.status === statusFilter);

  const transferHeaders = [
    {
      title: "Item",
      value: "itemName",
      render: (value) => (
        <span className="flex items-center gap-2 font-medium">{value || "—"}</span>
      ),
    },
    {
      title: "From → To",
      value: "fromWarehouse",
      render: (value, row) => (
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <span>{row.fromWarehouse || "—"}</span>
          <ArrowRight className="h-3 w-3 shrink-0" />
          <span>{row.toWarehouse || "—"}</span>
        </span>
      ),
    },
    {
      title: "Quantity",
      value: "quantity",
      render: (value, row) => (
        <span className="font-medium">
          {value} <span className="text-xs text-muted-foreground">{row.unit}</span>
        </span>
      ),
    },
    {
      title: "Date",
      value: "transferDate",
      render: (value) => (value ? new Date(value).toLocaleDateString() : "—"),
    },
    { title: "Reason", value: "reason" },
    {
      title: "Status",
      value: "status",
      render: (value) => {
        const cfg = STATUS_CONFIG[value] || STATUS_CONFIG.pending;
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
        if (row.status === "pending") {
          return (
            <div className="flex items-center justify-end gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateStatus(id, API.APPROVE_STOCK_TRANSFER, "approved");
                }}
                className="rounded p-1.5 text-primary hover:bg-primary/10"
                title="Approve"
              >
                <ThumbsUp className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateStatus(id, API.REJECT_STOCK_TRANSFER, "rejected");
                }}
                className="rounded p-1.5 text-destructive hover:bg-destructive/10"
                title="Reject"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        }
        if (row.status === "approved") {
          return (
            <div className="flex items-center justify-end">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateStatus(id, API.COMPLETE_STOCK_TRANSFER, "completed");
                }}
                className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-success hover:bg-success/10"
                title="Mark Completed"
              >
                <Truck className="h-3.5 w-3.5" />
                Complete
              </button>
            </div>
          );
        }
        return null;
      },
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Heading
          title="Stock Transfers"
          description="Move stock between warehouses and branches"
        />
        <ButtonClick
          handleSubmit={openAdd}
          buttonName="New Transfer"
          icon={<Plus className="h-4 w-4" />}
          BtnType="primary"
        />
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Object.entries(counts).map(([key, val]) => {
          const label = key === "all" ? "All Transfers" : STATUS_CONFIG[key]?.label;
          return (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={cn(
                "glass-card rounded-lg p-4 text-left transition-colors",
                statusFilter === key && "ring-2 ring-primary/40",
              )}
            >
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-2xl font-bold">{val}</p>
            </button>
          );
        })}
      </div>

      <Table
        header={transferHeaders}
        data={filteredTransfers}
        title="Transfers"
        rowKey="_id"
        loading={loading}
        searchPlaceholder="Search transfers…"
      />

      <DrawerPop
        open={drawerOpen}
        close={() => setDrawerOpen(false)}
        header={["New Transfer", "Move stock between warehouses"]}
        handleSubmit={handleSubmit}
        footerBtn={["Cancel", "Save"]}
        footerBtnDisabled={submitting}
        loadingButton={submitting}
        width={560}
      >
        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <AntSelect
            label="From Warehouse *"
            placeholder="Select source warehouse"
            value={form.fromWarehouse || undefined}
            error={getError("fromWarehouse")}
            options={warehouseOptions}
            onChange={(value) => setField("fromWarehouse", value)}
          />

          <AntSelect
            label="To Warehouse *"
            placeholder="Select destination warehouse"
            value={form.toWarehouse || undefined}
            error={getError("toWarehouse")}
            options={warehouseOptions}
            onChange={(value) => setField("toWarehouse", value)}
          />

          <AntSelect
            label="Item *"
            placeholder="Select inventory item"
            value={form.itemId || undefined}
            error={getError("itemId")}
            options={itemOptions}
            onChange={(value) => {
              const item = inventoryItems.find((i) => (i._id || i.id) === value);
              setField("itemId", value);
              setField("itemName", item?.name || "");
              setField("unit", item?.unit || "");
            }}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <AntInput
              label="Quantity *"
              type="number"
              placeholder="0"
              value={form.quantity}
              error={getError("quantity")}
              onChange={(e) => setField("quantity", e.target.value)}
            />
            <AntInput label="Unit" value={form.unit} readOnly placeholder="Auto-filled" />
          </div>

          <AntInput
            label="Transfer Date *"
            type="date"
            value={form.transferDate}
            error={getError("transferDate")}
            onChange={(e) => setField("transferDate", e.target.value)}
          />

          <AntInput
            label="Reason"
            placeholder="e.g. Branch restocking"
            value={form.reason}
            onChange={(e) => setField("reason", e.target.value)}
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
