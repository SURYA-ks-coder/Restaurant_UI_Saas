"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Factory,
  Plus,
  XCircle,
} from "lucide-react";
import { Modal } from "antd";
import { message } from "@/lib/message";
import { cn } from "@/lib/utils";
import { action, API, getAction } from "@/lib/API";
import Table from "@/components/ui/Table";
import DrawerPop from "@/components/ui/DrawerPop";
import ButtonClick from "@/components/ui/ButtonClick";
import Heading from "@/components/ui/Heading";
import { AntInput } from "@/components/ui/AntInput";
import { AntSelect } from "@/components/ui/AntSelect";

const STATUS_STYLES = {
  draft: "bg-warning/10 text-warning",
  completed: "bg-success/10 text-success",
  cancelled: "bg-muted text-muted-foreground",
};

const fmtDate = (d) => (d ? new Date(d).toLocaleString() : "—");

export default function ProductionEntryPage() {
  const [batches, setBatches] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  // New batch (draft) drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [recipeId, setRecipeId] = useState("");
  const [plannedQuantity, setPlannedQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const [creating, setCreating] = useState(false);

  // Complete-batch modal
  const [completing, setCompleting] = useState(null); // batch object
  const [actualYield, setActualYield] = useState("");
  const [actualQtys, setActualQtys] = useState({}); // inventoryItemId -> value
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (statusFilter) params.set("status", statusFilter);
      const [batchRes, recipeRes] = await Promise.all([
        getAction(`${API.GET_PRODUCTION_LIST}?${params.toString()}`),
        getAction(`${API.GET_RECIPE_LIST}?limit=100&outputType=inventory_item`),
      ]);
      if (batchRes?.statusCode === 200) setBatches(batchRes.data || []);
      if (recipeRes?.statusCode === 200) setRecipes(recipeRes.data || []);
    } catch {
      message.error("Failed to load production batches");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const recipeOptions = useMemo(
    () =>
      recipes.map((r) => ({
        label: `${r.outputInventoryItemId?.materialName || "Unknown"} (yields ${r.outputQuantity} ${r.outputInventoryItemId?.unit || ""})`,
        value: r._id,
      })),
    [recipes],
  );

  const selectedRecipe = recipes.find((r) => r._id === recipeId);
  const scale =
    selectedRecipe && plannedQuantity
      ? Number(plannedQuantity) / selectedRecipe.outputQuantity
      : 0;

  const openCreate = () => {
    setRecipeId("");
    setPlannedQuantity("");
    setNotes("");
    setDrawerOpen(true);
  };

  const createDraft = async () => {
    if (!recipeId || !plannedQuantity || Number(plannedQuantity) <= 0) {
      message.error("Select a recipe and enter a planned quantity.");
      return;
    }
    setCreating(true);
    try {
      const res = await action(API.CREATE_PRODUCTION_BATCH, {
        recipeId,
        plannedQuantity: Number(plannedQuantity),
        notes,
      });
      if (res?.statusCode === 200 || res?.statusCode === 201) {
        message.success("Batch drafted — enter actuals when cooking is done.");
        setDrawerOpen(false);
        fetchData();
      } else {
        message.error(res?.message || "Unable to create batch");
      }
    } finally {
      setCreating(false);
    }
  };

  const openComplete = (batch) => {
    setCompleting(batch);
    setActualYield(batch.plannedQuantity ?? "");
    setActualQtys(
      Object.fromEntries(
        batch.ingredients.map((i) => [String(i.inventoryItemId), i.theoreticalQty]),
      ),
    );
  };

  const submitComplete = async () => {
    if (!actualYield || Number(actualYield) <= 0) {
      message.error("Enter the actual yield produced.");
      return;
    }
    setSaving(true);
    try {
      const res = await action(
        API.COMPLETE_PRODUCTION_BATCH.replace(":id", completing._id),
        {
          actualYield: Number(actualYield),
          ingredients: Object.entries(actualQtys).map(([inventoryItemId, actualQty]) => ({
            inventoryItemId,
            actualQty: Number(actualQty),
          })),
        },
      );
      if (res?.statusCode === 200) {
        message.success("Batch completed and stock updated.");
        setCompleting(null);
        fetchData();
      } else {
        message.error(res?.message || "Unable to complete batch");
      }
    } finally {
      setSaving(false);
    }
  };

  const cancelBatch = async (batch) => {
    if (typeof window !== "undefined" && !window.confirm(`Cancel draft batch ${batch.batchNo}?`)) return;
    const res = await action(API.CANCEL_PRODUCTION_BATCH.replace(":id", batch._id), {}, "POST");
    if (res?.statusCode === 200) {
      message.success("Batch cancelled");
      fetchData();
    } else message.error(res?.message || "Unable to cancel batch");
  };

  const stats = useMemo(() => {
    const draft = batches.filter((b) => b.status === "draft").length;
    const completed = batches.filter((b) => b.status === "completed");
    const breaches = completed.filter(
      (b) => !b.yieldWithinTolerance || b.ingredients?.some((i) => !i.withinTolerance),
    ).length;
    return { draft, completedCount: completed.length, breaches };
  }, [batches]);

  const headers = [
    { title: "Batch", value: "batchNo", type: "bold", width: 160 },
    {
      title: "Produces",
      value: "recipeName",
      render: (value, row) => (
        <span>
          {row.recipeName} <span className="text-xs text-muted-foreground">({row.outputUnit})</span>
        </span>
      ),
    },
    {
      title: "Planned",
      value: "plannedQuantity",
      render: (value, row) => `${row.plannedQuantity} ${row.outputUnit}`,
    },
    {
      title: "Actual Yield",
      value: "actualYield",
      render: (value, row) =>
        row.status === "completed" ? (
          <span className="flex items-center gap-1.5">
            {row.actualYield} {row.outputUnit}
            {row.yieldWithinTolerance ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-success" />
            ) : (
              <AlertTriangle className="h-3.5 w-3.5 text-destructive" titleAccess="Outside tolerance" />
            )}
          </span>
        ) : (
          "—"
        ),
    },
    {
      title: "Status",
      value: "status",
      render: (value, row) => (
        <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium capitalize", STATUS_STYLES[row.status])}>
          {row.status}
        </span>
      ),
    },
    { title: "Created", value: "createdAt", render: (v) => fmtDate(v) },
    {
      title: "Actions",
      value: "actions",
      align: "right",
      render: (value, row) =>
        row.status === "draft" ? (
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                openComplete(row);
              }}
              className="rounded px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10"
            >
              Complete
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                cancelBatch(row);
              }}
              className="rounded p-1.5 text-destructive hover:bg-destructive/10"
              title="Cancel batch"
            >
              <XCircle className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Heading
          title="Batch Cooking — Production Entry"
          description="Turn raw ingredients into prepared stock. Draft a batch, then log actuals when it's done."
        />
        <ButtonClick
          handleSubmit={openCreate}
          buttonName="New Batch"
          icon={<Plus className="h-4 w-4" />}
          BtnType="primary"
        />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Draft Batches", value: stats.draft, icon: Factory, color: "text-warning bg-warning/10" },
          { label: "Completed", value: stats.completedCount, icon: CheckCircle2, color: "text-success bg-success/10" },
          { label: "Variance Breaches", value: stats.breaches, icon: AlertTriangle, color: "text-destructive bg-destructive/10" },
        ].map((s) => (
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

      <div className="mb-4 flex gap-1 rounded-lg border border-border bg-card p-0.5 w-fit">
        {[
          { id: "", label: "All" },
          { id: "draft", label: "Draft" },
          { id: "completed", label: "Completed" },
          { id: "cancelled", label: "Cancelled" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setStatusFilter(t.id)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium",
              statusFilter === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {!recipes.length && (
        <div className="mb-4 rounded-xl border border-dashed border-border bg-muted/30 p-4 text-xs text-muted-foreground">
          No batch-production recipes yet. Create one from{" "}
          <a href="/dashboard/inventory/recipes" className="font-medium text-primary hover:underline">
            Recipes
          </a>{" "}
          — pick "Batch Production" as the recipe type and choose the prepared item it yields.
        </div>
      )}

      <Table
        header={headers}
        data={batches}
        title="Production Batches"
        rowKey="_id"
        loading={loading}
        searchPlaceholder="Search batch number…"
      />

      <DrawerPop
        open={drawerOpen}
        close={() => setDrawerOpen(false)}
        header={["New Production Batch", "Ingredient quantities auto-scale from the recipe"]}
        handleSubmit={createDraft}
        footerBtn={["Cancel", "Create Draft"]}
        footerBtnDisabled={creating}
        loadingButton={creating}
        width={560}
      >
        <div className="flex-1 space-y-5 overflow-y-auto p-2">
          <AntSelect
            label="Recipe"
            placeholder="Select a batch-production recipe"
            value={recipeId || undefined}
            options={recipeOptions}
            showSearch
            optionFilterProp="label"
            onChange={setRecipeId}
            required
          />
          <AntInput
            label="Planned quantity"
            type="number"
            placeholder={selectedRecipe ? `in ${selectedRecipe.outputInventoryItemId?.unit}` : "0"}
            value={plannedQuantity}
            onChange={(e) => setPlannedQuantity(e.target.value)}
          />
          {selectedRecipe && plannedQuantity > 0 && (
            <div className="rounded-lg bg-muted/50 p-3 text-xs">
              <p className="mb-2 font-medium text-foreground">Scaled ingredients (×{scale.toFixed(2)})</p>
              <div className="space-y-1">
                {selectedRecipe.ingredients.map((ing, i) => (
                  <div key={i} className="flex justify-between text-muted-foreground">
                    <span>{ing.inventoryItemId?.materialName}</span>
                    <span className="font-medium text-foreground">
                      {(ing.quantity * scale).toFixed(2)} {ing.inventoryItemId?.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <AntInput
            label="Notes"
            placeholder="Optional"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </DrawerPop>

      <Modal
        title={completing ? `Complete batch ${completing.batchNo}` : ""}
        open={!!completing}
        onCancel={() => setCompleting(null)}
        onOk={submitComplete}
        okText="Complete Batch"
        confirmLoading={saving}
        width={620}
      >
        {completing && (
          <div className="space-y-4 pt-2">
            <AntInput
              label={`Actual yield (planned: ${completing.plannedQuantity} ${completing.outputUnit})`}
              type="number"
              value={actualYield}
              onChange={(e) => setActualYield(e.target.value)}
            />
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                Actual ingredient usage (defaults to theoretical — edit what actually went in)
              </p>
              <div className="max-h-64 space-y-2 overflow-y-auto">
                {completing.ingredients.map((ing) => (
                  <div key={String(ing.inventoryItemId)} className="grid grid-cols-[1fr_110px] items-center gap-2 rounded-lg border border-border p-2.5">
                    <div>
                      <p className="text-sm font-medium text-foreground">{ing.materialName}</p>
                      <p className="text-[11px] text-muted-foreground">
                        theoretical: {ing.theoreticalQty} {ing.unit}
                      </p>
                    </div>
                    <AntInput
                      type="number"
                      size="middle"
                      value={actualQtys[String(ing.inventoryItemId)] ?? ""}
                      onChange={(e) =>
                        setActualQtys((prev) => ({
                          ...prev,
                          [String(ing.inventoryItemId)]: e.target.value,
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
