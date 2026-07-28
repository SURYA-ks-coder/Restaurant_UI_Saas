"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, BarChart3, CheckCircle2, ChefHat, Factory } from "lucide-react";
import { Skeleton } from "antd";
import { message } from "@/lib/message";
import { cn } from "@/lib/utils";
import { API, getAction } from "@/lib/API";
import Heading from "@/components/ui/Heading";

const toDateString = (d) => {
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 10);
};

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : "—");

export default function VarianceReportPage() {
  const [from, setFrom] = useState(() => toDateString(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)));
  const [to, setTo] = useState(() => toDateString(new Date()));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("recipes");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAction(`${API.GET_VARIANCE_REPORT}?from=${from}&to=${to}`);
      if (res?.statusCode === 200) setData(res.data);
      else message.error(res?.message || "Failed to load variance report");
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    load();
  }, [load]);

  const recipeBreaches = data?.recipeVariance?.filter((r) => r.hasBreach).length || 0;
  const productionBreaches = data?.productionVariance?.filter((b) => b.hasBreach).length || 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Heading
          title="Variance Report"
          description="Theoretical vs. actual consumption — flagged when it exceeds a recipe's acceptable tolerance."
        />
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground"
          />
          <span className="text-xs text-muted-foreground">to</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground"
          />
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Recipes tracked", value: data?.recipeVariance?.length || 0, icon: BarChart3, color: "text-primary bg-primary/10" },
          { label: "Recipe breaches", value: recipeBreaches, icon: AlertTriangle, color: "text-destructive bg-destructive/10" },
          { label: "Production breaches", value: productionBreaches, icon: Factory, color: "text-destructive bg-destructive/10" },
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
          { id: "recipes", label: "Menu Item Recipes", icon: ChefHat },
          { id: "production", label: "Production Batches", icon: Factory },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium",
              tab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground",
            )}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : tab === "recipes" ? (
        <div className="space-y-3">
          {(data?.recipeVariance || []).map((recipe) => (
            <div key={String(recipe.recipeId)} className="rounded-xl border border-border bg-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-foreground">{recipe.menuItemName}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {recipe.quantitySold} sold · tolerance {recipe.tolerancePercent}%
                  </span>
                </div>
                {recipe.hasBreach ? (
                  <span className="flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-medium text-destructive">
                    <AlertTriangle className="h-3 w-3" /> Breach
                  </span>
                ) : (
                  <span className="flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success">
                    <CheckCircle2 className="h-3 w-3" /> Within tolerance
                  </span>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-[11px] text-muted-foreground">
                      <th className="py-1.5 font-medium">Ingredient</th>
                      <th className="py-1.5 text-right font-medium">Theoretical</th>
                      <th className="py-1.5 text-right font-medium">Actual</th>
                      <th className="py-1.5 text-right font-medium">Variance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recipe.ingredients.map((ing) => (
                      <tr key={String(ing.inventoryItemId)} className="border-b border-border/60 last:border-0">
                        <td className="py-1.5 text-foreground">{ing.materialName}</td>
                        <td className="py-1.5 text-right text-muted-foreground">
                          {ing.theoreticalQty} {ing.unit}
                        </td>
                        <td className="py-1.5 text-right text-muted-foreground">
                          {ing.actualQty} {ing.unit}
                        </td>
                        <td
                          className={cn(
                            "py-1.5 text-right font-medium",
                            ing.withinTolerance ? "text-success" : "text-destructive",
                          )}
                        >
                          {ing.variancePercent > 0 ? "+" : ""}
                          {ing.variancePercent}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
          {!data?.recipeVariance?.length && (
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No paid orders for menu-item recipes in this date range.
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground">
                <th className="px-4 py-3 text-left font-medium">Batch</th>
                <th className="px-4 py-3 text-left font-medium">Produces</th>
                <th className="px-4 py-3 font-medium">Planned</th>
                <th className="px-4 py-3 font-medium">Actual</th>
                <th className="px-4 py-3 font-medium">Yield Variance</th>
                <th className="px-4 py-3 font-medium">Completed</th>
              </tr>
            </thead>
            <tbody>
              {(data?.productionVariance || []).map((b) => (
                <tr key={String(b.batchId)} className="border-b border-border last:border-0 text-center">
                  <td className="px-4 py-3 text-left font-medium text-foreground">{b.batchNo}</td>
                  <td className="px-4 py-3 text-left">{b.recipeName}</td>
                  <td className="px-4 py-3">{b.plannedQuantity} {b.outputUnit}</td>
                  <td className="px-4 py-3">{b.actualYield} {b.outputUnit}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
                        b.hasBreach ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success",
                      )}
                    >
                      {b.hasBreach ? <AlertTriangle className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                      {b.yieldVariancePercent > 0 ? "+" : ""}
                      {b.yieldVariancePercent}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{fmtDate(b.completedAt)}</td>
                </tr>
              ))}
              {!data?.productionVariance?.length && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                    No completed production batches in this date range.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
