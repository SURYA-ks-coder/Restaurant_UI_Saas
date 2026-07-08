"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Plus, TrendingDown } from "lucide-react";
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

const REASON_OPTIONS = WASTE_REASONS.map((r) => ({ label: r, value: r }));

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

const wastageHeaders = [
  { title: "Item", value: "itemName", type: "bold" },
  {
    title: "Quantity",
    value: "quantity",
    render: (value, row) => (
      <span>
        <span className="font-semibold text-destructive">{value}</span>
        <span className="ml-1 text-xs text-muted-foreground">{row.unit}</span>
      </span>
    ),
  },
  {
    title: "Reason",
    value: "reason",
    render: (value) => (
      <span className="rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive">
        {value}
      </span>
    ),
  },
  { title: "Recorded By", value: "recordedBy" },
  {
    title: "Date",
    value: "wastedAt",
    render: (value) => (value ? new Date(value).toLocaleDateString() : "—"),
  },
  { title: "Notes", value: "notes" },
];

export default function WastagePage() {
  const [wastageList, setWastageList] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reasonFilter, setReasonFilter] = useState("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [wastageRes, inventoryRes] = await Promise.all([
        getAction(API.GET_WASTAGE_LIST),
        getAction(API.GET_INVENTORY_LIST),
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

  const totalWasted = wastageList.reduce((sum, w) => sum + Number(w.quantity || 0), 0);

  const reasonCounts = WASTE_REASONS.reduce((acc, r) => {
    acc[r] = wastageList.filter((w) => w.reason === r).length;
    return acc;
  }, {});

  const filteredWastage =
    reasonFilter === "all" ? wastageList : wastageList.filter((w) => w.reason === reasonFilter);

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
    setForm({ ...EMPTY_FORM, wastedAt: new Date().toISOString().split("T")[0] });
    setErrors({});
    setDrawerOpen(true);
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const result = await action(API.RECORD_WASTAGE, form, "POST");

      if (result?.statusCode === 200 || result?.statusCode === 201) {
        message.success("Wastage logged successfully.");
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

  const setField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const getError = (field) => errors[field] || "";

  const itemOptions = inventoryItems.map((item) => ({
    label: `${item.name}${item.unit ? ` (${item.unit})` : ""}`,
    value: item._id || item.id,
  }));

  const stats = [
    { label: "Total Records", value: wastageList.length, icon: TrendingDown, color: "text-destructive bg-destructive/10" },
    { label: "Total Wasted Units", value: totalWasted.toFixed(1), icon: AlertTriangle, color: "text-warning bg-warning/10" },
    {
      label: "This Month",
      value: wastageList.filter((w) => {
        const d = new Date(w.wastedAt || w.createdAt);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).length,
      icon: TrendingDown,
      color: "text-primary bg-primary/10",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Heading
          title="Wastage Tracking"
          description="Log and monitor food wastage across your operations"
        />
        <ButtonClick
          handleSubmit={openAdd}
          buttonName="Log Wastage"
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

      <div className="mb-4 flex flex-wrap gap-2">
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

      <Table
        header={wastageHeaders}
        data={filteredWastage}
        title="Wastage Records"
        rowKey="_id"
        loading={loading}
        searchPlaceholder="Search by item or staff…"
      />

      <DrawerPop
        open={drawerOpen}
        close={() => setDrawerOpen(false)}
        header={["Log Wastage", "Record wasted or spoiled inventory"]}
        handleSubmit={handleSubmit}
        footerBtn={["Cancel", "Save"]}
        footerBtnDisabled={submitting}
        loadingButton={submitting}
        width={560}
      >
        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
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

          <AntSelect
            label="Reason *"
            placeholder="Select reason"
            value={form.reason || undefined}
            error={getError("reason")}
            options={REASON_OPTIONS}
            onChange={(value) => setField("reason", value)}
          />

          <AntInput
            label="Recorded By"
            placeholder="Staff name"
            value={form.recordedBy}
            onChange={(e) => setField("recordedBy", e.target.value)}
          />

          <AntInput
            label="Date *"
            type="date"
            value={form.wastedAt}
            error={getError("wastedAt")}
            onChange={(e) => setField("wastedAt", e.target.value)}
          />

          <AntTextArea
            label="Notes"
            placeholder="Additional details…"
            value={form.notes}
            onChange={(e) => setField("notes", e.target.value)}
          />
        </div>
      </DrawerPop>
    </div>
  );
}
