"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChefHat,
  IndianRupee,
  Plus,
  Trash2,
  UtensilsCrossed,
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
import { getDefaultBranchId, getRestaurantId } from "@/lib/auth";

const EMPTY_LINE = { inventoryItemId: "", quantity: "" };

export default function RecipesPage() {
  const [recipes, setRecipes] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [menuItemId, setMenuItemId] = useState("");
  const [lines, setLines] = useState([{ ...EMPTY_LINE }]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [recipeRes, menuRes, inventoryRes] = await Promise.all([
        getAction(`${API.GET_RECIPE_LIST}?limit=100`),
        action(API.GET_MENU_ITEM_LIST, {
          restaurantId: getRestaurantId(),
          branchId: getDefaultBranchId(),
        }),
        getAction(`${API.GET_INVENTORY_LIST}?limit=100&status=active`),
      ]);
      if (recipeRes?.statusCode === 200) setRecipes(recipeRes.data || []);
      const menuData = menuRes?.data?.items || menuRes?.data || [];
      if (menuRes?.statusCode === 200) setMenuItems(menuData);
      if (inventoryRes?.statusCode === 200)
        setInventoryItems(inventoryRes.data || []);
    } catch {
      message.error("Failed to load recipes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const inventoryById = useMemo(() => {
    const map = {};
    inventoryItems.forEach((item) => {
      map[item._id] = item;
    });
    return map;
  }, [inventoryItems]);

  const recipeMenuItemIds = useMemo(
    () =>
      new Set(
        recipes.map((r) => r.menuItemId?._id || r.menuItemId).filter(Boolean),
      ),
    [recipes],
  );

  const menuItemOptions = useMemo(
    () =>
      menuItems
        // When creating, hide menu items that already have a recipe.
        .filter((m) => editId || !recipeMenuItemIds.has(m._id))
        .map((m) => ({ label: m.itemName, value: m._id })),
    [menuItems, recipeMenuItemIds, editId],
  );

  const ingredientOptions = inventoryItems.map((item) => ({
    label: `${item.materialName} (${item.unit})`,
    value: item._id,
  }));

  const lineCost = (line) => {
    const item = inventoryById[line.inventoryItemId];
    if (!item || !line.quantity) return 0;
    return (Number(line.quantity) || 0) * (item.purchasePrice || 0);
  };

  const totalCost = lines.reduce((sum, line) => sum + lineCost(line), 0);

  const recipeCost = (recipe) =>
    (recipe.ingredients || []).reduce((sum, ing) => {
      const inv =
        typeof ing.inventoryItemId === "object"
          ? ing.inventoryItemId
          : inventoryById[ing.inventoryItemId];
      return sum + (Number(ing.quantity) || 0) * (inv?.purchasePrice || 0);
    }, 0);

  const setLineField = (index, name, value) => {
    setLines((prev) =>
      prev.map((line, i) => (i === index ? { ...line, [name]: value } : line)),
    );
    if (errors.ingredients) setErrors((prev) => ({ ...prev, ingredients: "" }));
  };

  const addLine = () => setLines((prev) => [...prev, { ...EMPTY_LINE }]);
  const removeLine = (index) =>
    setLines((prev) =>
      prev.length > 1 ? prev.filter((_, i) => i !== index) : prev,
    );

  const openAdd = () => {
    setEditId(null);
    setMenuItemId("");
    setLines([{ ...EMPTY_LINE }]);
    setErrors({});
    setDrawerOpen(true);
  };

  const openEdit = (recipe) => {
    setEditId(recipe._id);
    setMenuItemId(recipe.menuItemId?._id || recipe.menuItemId || "");
    setLines(
      (recipe.ingredients || []).map((ing) => ({
        inventoryItemId: ing.inventoryItemId?._id || ing.inventoryItemId || "",
        quantity: ing.quantity ?? "",
      })),
    );
    setErrors({});
    setDrawerOpen(true);
  };

  const validate = () => {
    const next = {};
    if (!menuItemId) next.menuItemId = "Select a menu item";
    const validLines = lines.filter((l) => l.inventoryItemId);
    if (validLines.length === 0)
      next.ingredients = "Add at least one ingredient";
    else if (validLines.some((l) => !l.quantity || Number(l.quantity) <= 0))
      next.ingredients = "Every ingredient needs a quantity above 0";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        menuItemId,
        ingredients: lines
          .filter((l) => l.inventoryItemId)
          .map((l) => ({
            inventoryItemId: l.inventoryItemId,
            quantity: Number(l.quantity),
          })),
      };
      const result = editId
        ? await patchAction(`${API.UPDATE_RECIPE}/${editId}`, payload)
        : await action(API.CREATE_RECIPE, payload);

      if (result?.statusCode === 200 || result?.statusCode === 201) {
        message.success(editId ? "Recipe updated." : "Recipe created.");
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

  const handleDelete = async (recipe) => {
    const label = recipe.menuItemId?.itemName || "this menu item";
    if (
      typeof window !== "undefined" &&
      !window.confirm(
        `Delete the recipe for ${label}? Stock will no longer auto-deduct for it.`,
      )
    )
      return;
    try {
      const result = await action(
        `${API.DELETE_RECIPE}/${recipe._id}`,
        {},
        "DELETE",
      );
      if (result?.statusCode === 200) {
        message.success("Recipe deleted.");
        fetchData();
      } else {
        message.error(result?.message || "Failed to delete recipe.");
      }
    } catch {
      message.error("Request failed.");
    }
  };

  const stats = [
    {
      label: "Recipes",
      value: recipes.length,
      icon: ChefHat,
      color: "text-primary bg-primary/10",
    },
    {
      label: "Menu Items Covered",
      value: `${recipeMenuItemIds.size} / ${menuItems.length}`,
      icon: UtensilsCrossed,
      color: "text-accent bg-accent/10",
    },
    {
      label: "Avg. Ingredient Cost",
      value: recipes.length
        ? `₹${(
            recipes.reduce((sum, r) => sum + recipeCost(r), 0) / recipes.length
          ).toFixed(2)}`
        : "—",
      icon: IndianRupee,
      color: "text-success bg-success/10",
    },
  ];

  const headers = [
    {
      title: "Menu Item",
      value: "menuItemId",
      type: "bold",
      width: 200,
      render: (value, row) => row.menuItemId?.itemName || "—",
    },
    {
      title: "Ingredients",
      value: "ingredients",
      render: (value, row) => (
        <div className="flex flex-wrap gap-1">
          {(row.ingredients || []).map((ing, idx) => {
            const inv =
              typeof ing.inventoryItemId === "object"
                ? ing.inventoryItemId
                : inventoryById[ing.inventoryItemId];
            return (
              <span
                key={idx}
                className="rounded-full bg-muted px-2 py-0.5 text-xs"
              >
                {inv?.materialName || "Unknown"} · {ing.quantity}{" "}
                {inv?.unit || ""}
              </span>
            );
          })}
        </div>
      ),
    },
    {
      title: "Est. Cost / Serving",
      value: "cost",
      render: (value, row) => (
        <span className="font-semibold">₹{recipeCost(row).toFixed(2)}</span>
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
              openEdit(row);
            }}
            className="rounded px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10"
          >
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row);
            }}
            className="rounded p-1.5 text-destructive hover:bg-destructive/10"
            title="Delete recipe"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Heading
          title="Recipes"
          description="Link menu items to ingredients — stock auto-deducts on every order."
        />
        <ButtonClick
          handleSubmit={openAdd}
          buttonName="Add Recipe"
          icon={<Plus className="h-4 w-4" />}
          BtnType="primary"
        />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="glass-card flex items-center gap-4 rounded-lg p-4"
          >
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                s.color,
              )}
            >
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
        header={headers}
        data={recipes}
        title="Recipes"
        rowKey="_id"
        loading={loading}
        searchPlaceholder="Search recipes…"
      />

      <DrawerPop
        open={drawerOpen}
        close={() => setDrawerOpen(false)}
        header={[
          editId ? "Edit Recipe" : "Add Recipe",
          "Quantities are in the ingredient's stock unit and deduct per serving",
        ]}
        handleSubmit={handleSubmit}
        footerBtn={["Cancel", "Save Recipe"]}
        footerBtnDisabled={submitting}
        loadingButton={submitting}
        width={640}
      >
        <div className="flex-1 space-y-5 overflow-y-auto p-2">
          <AntSelect
            label="Menu Item"
            placeholder="Select menu item"
            value={menuItemId || undefined}
            options={menuItemOptions}
            error={errors.menuItemId}
            showSearch
            optionFilterProp="label"
            disabled={Boolean(editId)}
            onChange={(value) => {
              setMenuItemId(value);
              if (errors.menuItemId)
                setErrors((prev) => ({ ...prev, menuItemId: "" }));
            }}
            required
          />

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">
                Ingredients
                <span className="text-destructive">*</span>
              </span>
              <button
                onClick={addLine}
                className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10"
              >
                <Plus className="h-3 w-3" /> Add Ingredient
              </button>
            </div>

            <div className="space-y-3">
              {lines.map((line, index) => {
                const selected = inventoryById[line.inventoryItemId];
                return (
                  <div
                    key={index}
                    className="grid grid-cols-[1fr_110px_80px_32px] items-end gap-2 rounded-lg border border-border p-3"
                  >
                    <AntSelect
                      label={index === 0 ? "Ingredient" : undefined}
                      placeholder="Select ingredient"
                      value={line.inventoryItemId || undefined}
                      options={ingredientOptions}
                      showSearch
                      optionFilterProp="label"
                      onChange={(value) =>
                        setLineField(index, "inventoryItemId", value)
                      }
                    />
                    <AntInput
                      label={index === 0 ? "Qty / serving" : undefined}
                      type="number"
                      placeholder={selected ? `in ${selected.unit}` : "0"}
                      value={line.quantity}
                      onChange={(e) =>
                        setLineField(index, "quantity", e.target.value)
                      }
                    />
                    <div className="pb-2 text-right text-sm font-semibold">
                      ₹{lineCost(line).toFixed(2)}
                    </div>
                    <button
                      onClick={() => removeLine(index)}
                      className="mb-1.5 rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      title="Remove ingredient"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
            {errors.ingredients && (
              <p className="mt-1 text-xs text-destructive">
                {errors.ingredients}
              </p>
            )}

            <div className="mt-3 flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
              <span className="text-sm font-medium">
                Est. Ingredient Cost / Serving
              </span>
              <span className="text-lg font-bold">₹{totalCost.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </DrawerPop>
    </div>
  );
}
