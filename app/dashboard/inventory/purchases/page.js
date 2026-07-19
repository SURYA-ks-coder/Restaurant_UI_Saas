"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Ban,
  Eye,
  IndianRupee,
  Lightbulb,
  Plus,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { message } from "@/lib/message";
import { cn } from "@/lib/utils";
import { action, API, getAction, patchAction } from "@/lib/API";
import Table from "@/components/ui/Table";
import DrawerPop from "@/components/ui/DrawerPop";
import ButtonClick from "@/components/ui/ButtonClick";
import Heading from "@/components/ui/Heading";
import { AntInput } from "@/components/ui/AntInput";
import { AntSelect } from "@/components/ui/AntSelect";
import { AntTextArea } from "@/components/ui/AntTextArea";

const EMPTY_LINE = { inventoryItemId: "", quantity: "", unitCost: "" };

const EMPTY_FORM = {
  supplierId: "",
  invoiceNumber: "",
  purchaseDate: "",
  notes: "",
};

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [summary, setSummary] = useState({ purchaseCount: 0, totalSpend: 0 });
  const [loading, setLoading] = useState(true);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [lines, setLines] = useState([{ ...EMPTY_LINE }]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [viewOpen, setViewOpen] = useState(false);
  const [viewPurchase, setViewPurchase] = useState(null);
  const [suggestOpen, setSuggestOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [purchaseRes, supplierRes, inventoryRes, suggestionRes, summaryRes] =
        await Promise.all([
          getAction(`${API.GET_PURCHASE_LIST}?limit=100`),
          getAction(API.GET_SUPPLIER_LIST),
          getAction(`${API.GET_INVENTORY_LIST}?limit=100&status=active`),
          getAction(API.GET_REORDER_SUGGESTIONS),
          getAction(API.GET_PURCHASE_SUMMARY),
        ]);
      if (purchaseRes?.statusCode === 200) setPurchases(purchaseRes.data || []);
      if (supplierRes?.statusCode === 200) setSuppliers(supplierRes.data || []);
      if (inventoryRes?.statusCode === 200)
        setInventoryItems(inventoryRes.data || []);
      if (suggestionRes?.statusCode === 200)
        setSuggestions(suggestionRes.data || []);
      if (summaryRes?.statusCode === 200)
        setSummary(summaryRes.data || { purchaseCount: 0, totalSpend: 0 });
    } catch {
      message.error("Failed to load purchases");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const itemById = useMemo(() => {
    const map = {};
    inventoryItems.forEach((item) => {
      map[item._id] = item;
    });
    return map;
  }, [inventoryItems]);

  const itemOptions = inventoryItems.map((item) => ({
    label: `${item.materialName} (${item.unit})`,
    value: item._id,
  }));

  const supplierOptions = suppliers.map((s) => ({
    label: s.supplierName,
    value: s._id,
  }));

  const grandTotal = lines.reduce(
    (sum, line) => sum + (Number(line.quantity) || 0) * (Number(line.unitCost) || 0),
    0,
  );

  const setField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const setLineField = (index, name, value) => {
    setLines((prev) => {
      const next = prev.map((line, i) =>
        i === index ? { ...line, [name]: value } : line,
      );
      // Prefill last known unit cost when an item is picked.
      if (name === "inventoryItemId" && itemById[value] && !next[index].unitCost) {
        next[index] = {
          ...next[index],
          unitCost: itemById[value].purchasePrice || "",
        };
      }
      return next;
    });
    if (errors.items) setErrors((prev) => ({ ...prev, items: "" }));
  };

  const addLine = () => setLines((prev) => [...prev, { ...EMPTY_LINE }]);
  const removeLine = (index) =>
    setLines((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));

  const openAdd = (prefillLines) => {
    setForm(EMPTY_FORM);
    setLines(
      prefillLines && prefillLines.length > 0 ? prefillLines : [{ ...EMPTY_LINE }],
    );
    setErrors({});
    setDrawerOpen(true);
  };

  const startFromSuggestions = () => {
    if (suggestions.length === 0) return;
    setSuggestOpen(false);
    openAdd(
      suggestions.map((s) => ({
        inventoryItemId: s.inventoryItemId,
        quantity: s.suggestedQuantity,
        unitCost: s.purchasePrice,
      })),
    );
  };

  const validate = () => {
    const next = {};
    const validLines = lines.filter((l) => l.inventoryItemId);
    if (validLines.length === 0) next.items = "Add at least one item";
    else if (
      validLines.some(
        (l) => !l.quantity || Number(l.quantity) <= 0 || Number(l.unitCost) < 0,
      )
    )
      next.items = "Every item needs a quantity above 0 and a valid unit cost";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        supplierId: form.supplierId || undefined,
        invoiceNumber: form.invoiceNumber,
        purchaseDate: form.purchaseDate || undefined,
        notes: form.notes,
        items: lines
          .filter((l) => l.inventoryItemId)
          .map((l) => ({
            inventoryItemId: l.inventoryItemId,
            quantity: Number(l.quantity),
            unitCost: Number(l.unitCost) || 0,
          })),
      };
      const result = await action(API.CREATE_PURCHASE, payload);
      if (result?.statusCode === 200 || result?.statusCode === 201) {
        message.success("Purchase recorded — stock updated.");
        setDrawerOpen(false);
        fetchData();
      } else {
        message.error(result?.message || "Failed to record purchase.");
      }
    } catch {
      message.error("Request failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelPurchase = async (purchase) => {
    if (
      typeof window !== "undefined" &&
      !window.confirm(
        `Cancel ${purchase.purchaseNumber}? Stock added by this purchase will be reversed.`,
      )
    )
      return;
    try {
      const result = await patchAction(
        API.CANCEL_PURCHASE.replace(":id", purchase._id),
        { reason: "Cancelled from purchases page" },
      );
      if (result?.statusCode === 200) {
        message.success("Purchase cancelled and stock reversed.");
        fetchData();
      } else {
        message.error(result?.message || "Failed to cancel purchase.");
      }
    } catch {
      message.error("Request failed.");
    }
  };

  const openView = (purchase) => {
    setViewPurchase(purchase);
    setViewOpen(true);
  };

  const stats = [
    {
      label: "Total Purchases",
      value: summary.purchaseCount,
      icon: ShoppingCart,
      color: "text-primary bg-primary/10",
    },
    {
      label: "Total Spend",
      value: `₹${Number(summary.totalSpend || 0).toLocaleString()}`,
      icon: IndianRupee,
      color: "text-success bg-success/10",
    },
    {
      label: "Reorder Suggestions",
      value: suggestions.length,
      icon: Lightbulb,
      color: "text-warning bg-warning/10",
    },
  ];

  const purchaseHeaders = [
    { title: "Purchase #", value: "purchaseNumber", type: "bold", width: 170 },
    {
      title: "Supplier",
      value: "supplierName",
      render: (value, row) =>
        row.supplierId?.supplierName || row.supplierName || "—",
    },
    {
      title: "Date",
      value: "purchaseDate",
      render: (value) => (value ? new Date(value).toLocaleDateString() : "—"),
    },
    {
      title: "Items",
      value: "items",
      render: (value) => `${value?.length || 0} item${value?.length === 1 ? "" : "s"}`,
    },
    {
      title: "Total",
      value: "totalAmount",
      render: (value) => (
        <span className="font-semibold">₹{Number(value || 0).toLocaleString()}</span>
      ),
    },
    {
      title: "Status",
      value: "status",
      render: (value) => (
        <span
          className={cn(
            "rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
            value === "received"
              ? "bg-success/15 text-success border-success/30"
              : "bg-destructive/15 text-destructive border-destructive/30",
          )}
        >
          {value}
        </span>
      ),
    },
    {
      title: "Actions",
      value: "actions",
      align: "right",
      render: (value, row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              openView(row);
            }}
            className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            title="View details"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          {row.status === "received" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCancelPurchase(row);
              }}
              className="rounded p-1.5 text-destructive hover:bg-destructive/10"
              title="Cancel purchase (reverses stock)"
            >
              <Ban className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Heading
          title="Purchases"
          description="Record supplier purchases — stock and the ledger update automatically."
        />
        <div className="flex items-center gap-2">
          <ButtonClick
            handleSubmit={() => setSuggestOpen(true)}
            buttonName={`Suggestions (${suggestions.length})`}
            icon={<Lightbulb className="h-4 w-4" />}
          />
          <ButtonClick
            handleSubmit={() => openAdd()}
            buttonName="New Purchase"
            icon={<Plus className="h-4 w-4" />}
            BtnType="primary"
          />
        </div>
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
        header={purchaseHeaders}
        data={purchases}
        title="Purchase History"
        rowKey="_id"
        loading={loading}
        searchPlaceholder="Search purchase #, supplier, invoice…"
      />

      {/* New purchase drawer */}
      <DrawerPop
        open={drawerOpen}
        close={() => setDrawerOpen(false)}
        header={["New Purchase", "Stock increases as soon as the purchase is saved"]}
        handleSubmit={handleSubmit}
        footerBtn={["Cancel", "Record Purchase"]}
        footerBtnDisabled={submitting}
        loadingButton={submitting}
        width={720}
      >
        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <div className="grid gap-4 md:grid-cols-2">
            <AntSelect
              label="Supplier"
              placeholder="Select supplier"
              value={form.supplierId || undefined}
              options={supplierOptions}
              allowClear
              onChange={(value) => setField("supplierId", value || "")}
            />
            <AntInput
              label="Invoice Number"
              placeholder="Supplier invoice no."
              value={form.invoiceNumber}
              onChange={(e) => setField("invoiceNumber", e.target.value)}
            />
          </div>

          <AntInput
            label="Purchase Date"
            type="date"
            value={form.purchaseDate}
            onChange={(e) => setField("purchaseDate", e.target.value)}
          />

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">Items *</span>
              <button
                onClick={addLine}
                className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10"
              >
                <Plus className="h-3 w-3" /> Add Item
              </button>
            </div>

            <div className="space-y-3">
              {lines.map((line, index) => {
                const selected = itemById[line.inventoryItemId];
                const lineTotal =
                  (Number(line.quantity) || 0) * (Number(line.unitCost) || 0);
                return (
                  <div
                    key={index}
                    className="grid grid-cols-[1fr_90px_110px_90px_32px] items-end gap-2 rounded-lg border border-border p-3"
                  >
                    <AntSelect
                      label={index === 0 ? "Ingredient" : undefined}
                      placeholder="Select item"
                      value={line.inventoryItemId || undefined}
                      options={itemOptions}
                      showSearch
                      optionFilterProp="label"
                      onChange={(value) => setLineField(index, "inventoryItemId", value)}
                    />
                    <AntInput
                      label={index === 0 ? `Qty` : undefined}
                      type="number"
                      placeholder={selected ? selected.unit : "0"}
                      value={line.quantity}
                      onChange={(e) => setLineField(index, "quantity", e.target.value)}
                    />
                    <AntInput
                      label={index === 0 ? "Unit Cost (₹)" : undefined}
                      type="number"
                      placeholder="0.00"
                      value={line.unitCost}
                      onChange={(e) => setLineField(index, "unitCost", e.target.value)}
                    />
                    <div className="pb-2 text-right text-sm font-semibold">
                      ₹{lineTotal.toLocaleString()}
                    </div>
                    <button
                      onClick={() => removeLine(index)}
                      className="mb-1.5 rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      title="Remove line"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
            {errors.items && (
              <p className="mt-1 text-xs text-destructive">{errors.items}</p>
            )}

            <div className="mt-3 flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
              <span className="text-sm font-medium">Grand Total</span>
              <span className="text-lg font-bold">₹{grandTotal.toLocaleString()}</span>
            </div>
          </div>

          <AntTextArea
            label="Notes"
            placeholder="Delivery details, quality remarks…"
            value={form.notes}
            onChange={(e) => setField("notes", e.target.value)}
          />
        </div>
      </DrawerPop>

      {/* View purchase drawer */}
      <DrawerPop
        open={viewOpen}
        close={() => setViewOpen(false)}
        header={[viewPurchase?.purchaseNumber || "Purchase", "Purchase details"]}
        isFooter={false}
        width={560}
      >
        {viewPurchase && (
          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Supplier</p>
                <p className="text-sm font-medium">
                  {viewPurchase.supplierId?.supplierName || viewPurchase.supplierName || "—"}
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="text-sm font-medium">
                  {viewPurchase.purchaseDate
                    ? new Date(viewPurchase.purchaseDate).toLocaleDateString()
                    : "—"}
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Invoice #</p>
                <p className="text-sm font-medium">{viewPurchase.invoiceNumber || "—"}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Status</p>
                <p className="text-sm font-medium capitalize">{viewPurchase.status}</p>
              </div>
            </div>

            <div className="rounded-lg border border-border">
              <div className="grid grid-cols-[1fr_80px_90px_90px] gap-2 border-b border-border bg-muted/50 px-3 py-2 text-xs font-medium text-muted-foreground">
                <span>Item</span>
                <span className="text-right">Qty</span>
                <span className="text-right">Unit Cost</span>
                <span className="text-right">Total</span>
              </div>
              {(viewPurchase.items || []).map((item, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-[1fr_80px_90px_90px] gap-2 border-b border-border px-3 py-2 text-sm last:border-b-0"
                >
                  <span className="font-medium">{item.inventoryItemName}</span>
                  <span className="text-right">
                    {item.quantity} {item.unit}
                  </span>
                  <span className="text-right">₹{item.unitCost}</span>
                  <span className="text-right font-semibold">
                    ₹{Number(item.total || 0).toLocaleString()}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-sm font-medium">Grand Total</span>
                <span className="text-base font-bold">
                  ₹{Number(viewPurchase.totalAmount || 0).toLocaleString()}
                </span>
              </div>
            </div>

            {viewPurchase.notes && (
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Notes</p>
                <p className="text-sm">{viewPurchase.notes}</p>
              </div>
            )}
            {viewPurchase.status === "cancelled" && viewPurchase.cancellationReason && (
              <div className="rounded-lg bg-destructive/10 p-3">
                <p className="text-xs text-destructive">Cancellation Reason</p>
                <p className="text-sm">{viewPurchase.cancellationReason}</p>
              </div>
            )}
          </div>
        )}
      </DrawerPop>

      {/* Reorder suggestions drawer */}
      <DrawerPop
        open={suggestOpen}
        close={() => setSuggestOpen(false)}
        header={["Purchase Suggestions", "Items at or below their minimum stock level"]}
        handleSubmit={startFromSuggestions}
        footerBtn={["Close", "Start Purchase From Suggestions"]}
        footerBtnDisabled={suggestions.length === 0}
        width={560}
      >
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {suggestions.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              All stocked up — nothing needs reordering.
            </div>
          ) : (
            <div className="space-y-3">
              {suggestions.map((s) => (
                <div
                  key={s.inventoryItemId}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{s.materialName}</p>
                    <p className="text-xs text-muted-foreground">
                      In stock: {s.stockQuantity} {s.unit} · Minimum: {s.minimumStock}{" "}
                      {s.unit}
                      {s.supplier ? ` · ${s.supplier}` : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-warning">
                      Buy {s.suggestedQuantity} {s.unit}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ≈ ₹{Number(s.estimatedCost || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DrawerPop>
    </div>
  );
}
