"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ClipboardCheck, Equal, TrendingDown, TrendingUp } from "lucide-react";
import { message } from "@/lib/message";
import { cn } from "@/lib/utils";
import { action, API, getAction } from "@/lib/API";
import Table from "@/components/ui/Table";
import Heading from "@/components/ui/Heading";
import ButtonClick from "@/components/ui/ButtonClick";
import { AntInput } from "@/components/ui/AntInput";

export default function StockCountPage() {
  const [items, setItems] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState("");

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAction(`${API.GET_INVENTORY_LIST}?limit=100&status=active`);
      if (result?.statusCode === 200) setItems(result.data || []);
    } catch {
      message.error("Failed to load inventory items");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const setCount = (id, value) => {
    setCounts((prev) => ({ ...prev, [id]: value }));
  };

  const countedEntries = useMemo(
    () =>
      Object.entries(counts).filter(
        ([, value]) => value !== "" && value !== null && !Number.isNaN(Number(value)),
      ),
    [counts],
  );

  const varianceOf = (row) => {
    const value = counts[row._id];
    if (value === "" || value === undefined || value === null) return null;
    return Number(value) - (row.stockQuantity || 0);
  };

  const varianceSummary = useMemo(() => {
    let over = 0;
    let short = 0;
    let matched = 0;
    items.forEach((row) => {
      const variance = varianceOf(row);
      if (variance === null) return;
      if (variance > 0) over += 1;
      else if (variance < 0) short += 1;
      else matched += 1;
    });
    return { over, short, matched };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, counts]);

  const handleSubmit = async () => {
    if (countedEntries.length === 0) {
      message.error("Enter a counted quantity for at least one item.");
      return;
    }
    if (
      typeof window !== "undefined" &&
      !window.confirm(
        `Apply the physical count for ${countedEntries.length} item(s)? System stock will be adjusted to match.`,
      )
    )
      return;

    setSubmitting(true);
    try {
      const result = await action(API.SUBMIT_STOCK_COUNT, {
        notes,
        items: countedEntries.map(([inventoryItemId, value]) => ({
          inventoryItemId,
          countedQuantity: Number(value),
        })),
      });
      if (result?.statusCode === 200 || result?.statusCode === 201) {
        message.success(result?.message || "Stock count recorded.");
        setCounts({});
        setNotes("");
        fetchItems();
      } else {
        message.error(result?.message || "Failed to record stock count.");
      }
    } catch {
      message.error("Request failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const stats = [
    {
      label: "Items Counted",
      value: `${countedEntries.length} / ${items.length}`,
      icon: ClipboardCheck,
      color: "text-primary bg-primary/10",
    },
    {
      label: "Matched",
      value: varianceSummary.matched,
      icon: Equal,
      color: "text-success bg-success/10",
    },
    {
      label: "Over System",
      value: varianceSummary.over,
      icon: TrendingUp,
      color: "text-accent bg-accent/10",
    },
    {
      label: "Short",
      value: varianceSummary.short,
      icon: TrendingDown,
      color: "text-destructive bg-destructive/10",
    },
  ];

  const headers = [
    { title: "Item", value: "materialName", type: "bold", width: 200 },
    { title: "Category", value: "category" },
    {
      title: "System Stock",
      value: "stockQuantity",
      render: (value, row) => (
        <span className="font-semibold">
          {value ?? 0}{" "}
          <span className="text-xs font-normal text-muted-foreground">{row.unit}</span>
        </span>
      ),
    },
    {
      title: "Counted Quantity",
      value: "counted",
      width: 170,
      render: (value, row) => (
        <div onClick={(e) => e.stopPropagation()}>
          <AntInput
            type="number"
            size="middle"
            placeholder={`Count in ${row.unit || "units"}`}
            value={counts[row._id] ?? ""}
            onChange={(e) => setCount(row._id, e.target.value)}
          />
        </div>
      ),
    },
    {
      title: "Variance",
      value: "variance",
      render: (value, row) => {
        const variance = varianceOf(row);
        if (variance === null) return <span className="text-muted-foreground">—</span>;
        return (
          <span
            className={cn(
              "font-semibold",
              variance === 0 && "text-success",
              variance > 0 && "text-accent",
              variance < 0 && "text-destructive",
            )}
          >
            {variance > 0 ? "+" : ""}
            {Number(variance.toFixed(3))} {row.unit}
          </span>
        );
      },
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Heading
          title="Physical Stock Count"
          description="Count the shelf, enter what you found — variances become audited adjustments."
        />
        <ButtonClick
          handleSubmit={handleSubmit}
          buttonName={
            submitting ? "Applying…" : `Apply Count (${countedEntries.length})`
          }
          icon={<ClipboardCheck className="h-4 w-4" />}
          BtnType="primary"
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

      <div className="mb-4">
        <AntInput
          label="Count Notes"
          placeholder="e.g. Month-end count, counted by night shift"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <Table
        header={headers}
        data={items}
        title="Count Sheet"
        rowKey="_id"
        loading={loading}
        searchPlaceholder="Search item or category…"
      />
    </div>
  );
}
