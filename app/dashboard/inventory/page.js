"use client";

import { useCallback, useEffect, useState } from "react";
import { Boxes, Building2, Plus, Tags } from "lucide-react";
import { message } from "@/lib/message";
import { cn } from "@/lib/utils";
import { action, API, getAction } from "@/lib/API";
import Table from "@/components/ui/Table";
import DrawerPop from "@/components/ui/DrawerPop";
import ButtonClick from "@/components/ui/ButtonClick";
import Heading from "@/components/ui/Heading";
import { AntInput } from "@/components/ui/AntInput";
import { AntSelect } from "@/components/ui/AntSelect";

const UNIT_OPTIONS = [
  { label: "kg", value: "kg" },
  { label: "g", value: "g" },
  { label: "ltr", value: "ltr" },
  { label: "ml", value: "ml" },
  { label: "pcs", value: "pcs" },
  { label: "packs", value: "packs" },
  { label: "boxes", value: "boxes" },
  { label: "dozen", value: "dozen" },
];

const EMPTY_FORM = {
  name: "",
  itemType: "raw",
  category: "",
  unit: "kg",
  par: "",
  cost: "",
  supplier: "",
};

const itemHeaders = [
  { title: "Item Name", value: "materialName", type: "bold", width: 200 },
  {
    title: "Type",
    value: "itemType",
    width: 100,
    render: (value) => (
      <span
        className={cn(
          "rounded-full px-2 py-0.5 text-[11px] font-medium",
          value === "prepared" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground",
        )}
      >
        {value === "prepared" ? "Prepared" : "Raw"}
      </span>
    ),
  },
  { title: "Category", value: "category" },
  { title: "Unit", value: "unit", width: 90 },
  {
    title: "Min Stock",
    value: "minimumStock",
    render: (value, row) => (value ? `${value} ${row.unit || ""}` : "—"),
  },
  {
    title: "Unit Cost",
    value: "purchasePrice",
    render: (value) => (value ? `₹${value}` : "—"),
  },
  { title: "Supplier", value: "supplier" },
  { title: "Actions", value: "actions", type: "action", align: "right" },
];

export default function InventoryPage() {
  const [itemTypeFilter, setItemTypeFilter] = useState("raw");
  const [items, setItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [itemsRes, suppliersRes] = await Promise.all([
        getAction(`${API.GET_INVENTORY_LIST}?itemType=${itemTypeFilter}&limit=200`),
        getAction(API.GET_SUPPLIER_LIST),
      ]);
      if (itemsRes?.statusCode === 200) setItems(itemsRes.data || []);
      if (suppliersRes?.statusCode === 200)
        setSuppliers(suppliersRes.data || []);
    } catch {
      message.error("Failed to load inventory items");
    } finally {
      setLoading(false);
    }
  }, [itemTypeFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Item name is required";
    // if (!form.category.trim()) next.category = "Category is required";
    if (!form.unit) next.unit = "Unit is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const openAdd = () => {
    setEditId(null);
    setForm({ ...EMPTY_FORM, itemType: itemTypeFilter });
    setErrors({});
    setDrawerOpen(true);
  };

  const openEdit = (id, item) => {
    setEditId(id);
    setForm({
      name: item.materialName || item.name || "",
      itemType: item.itemType || "raw",
      category: item.category || "",
      unit: item.unit || "kg",
      par: item.minimumStock ?? "",
      cost: item.purchasePrice ?? "",
      supplier: item.supplier || "",
    });
    setErrors({});
    setDrawerOpen(true);
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const endpoint = editId
        ? `${API.UPDATE_INVENTORY}/${editId}`
        : API.CREATE_INVENTORY;
      const method = editId ? "PATCH" : "POST";
      const payload = {
        materialName: form.name,
        itemType: form.itemType,
        category: form.category,
        unit: form.unit,
        minimumStock: Number(form.par) || 0,
        purchasePrice: Number(form.cost) || 0,
        supplier: form.supplier,
      };
      const result = await action(endpoint, payload, method);

      if (result?.statusCode === 200 || result?.statusCode === 201) {
        message.success(editId ? "Item updated." : "Item created.");
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

  const supplierOptions = suppliers.map((s) => ({
    label: s.supplierName,
    value: s.supplierName,
  }));

  const stats = [
    {
      label: "Total Items",
      value: items.length,
      icon: Boxes,
      color: "text-primary bg-primary/10",
    },
    {
      label: "Categories",
      value: new Set(items.map((i) => i.category).filter(Boolean)).size,
      icon: Tags,
      color: "text-accent bg-accent/10",
    },
    {
      label: "Suppliers",
      value: new Set(items.map((i) => i.supplier).filter(Boolean)).size,
      icon: Building2,
      color: "text-success bg-success/10",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Heading
          title="Raw Materials"
          description="Manage your ingredient catalog — categories, units, par levels, and suppliers."
        />
        <ButtonClick
          handleSubmit={openAdd}
          buttonName="Add Item"
          icon={<Plus className="h-4 w-4" />}
          BtnType="primary"
        />
      </div>

      <div className="mb-4 flex gap-1 rounded-lg border border-border bg-card p-0.5 w-fit">
        {[
          { id: "raw", label: "Raw Materials" },
          { id: "prepared", label: "Prepared Item Catalog" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setItemTypeFilter(t.id)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium",
              itemTypeFilter === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
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
        header={itemHeaders}
        data={items}
        title={itemTypeFilter === "raw" ? "Raw Materials" : "Prepared Item Catalog"}
        rowKey="_id"
        loading={loading}
        searchPlaceholder="Search item, category, or supplier"
        onEdit={openEdit}
      />

      <DrawerPop
        open={drawerOpen}
        close={() => setDrawerOpen(false)}
        header={[
          editId ? "Edit Item" : "Add Item",
          "Add an ingredient to your inventory catalog",
        ]}
        handleSubmit={handleSubmit}
        footerBtn={["Cancel", "Save"]}
        footerBtnDisabled={submitting}
        loadingButton={submitting}
        width={560}
      >
        <div className="flex-1 space-y-5 overflow-y-auto p-2">
          <AntInput
            label="Item Name"
            placeholder="e.g. Atlantic Salmon"
            value={form.name}
            error={getError("name")}
            onChange={(e) => setField("name", e.target.value)}
            required
          />

          <AntSelect
            label="Item Type"
            value={form.itemType}
            options={[
              { label: "Raw Material (purchased from supplier)", value: "raw" },
              { label: "Prepared Item (produced via batch cooking)", value: "prepared" },
            ]}
            onChange={(value) => setField("itemType", value)}
          />

          <div className="grid gap-4 md:grid-cols-2">
            {/* <AntInput
              label="Category"
              placeholder="e.g. Seafood"
              value={form.category}
              error={getError("category")}
              onChange={(e) => setField("category", e.target.value)}
            /> */}
            <AntSelect
              label="Unit"
              value={form.unit}
              error={getError("unit")}
              options={UNIT_OPTIONS}
              onChange={(value) => setField("unit", value)}
            />
            {/* </div> */}

            {/* <div className="grid gap-4 md:grid-cols-2"> */}
            <AntInput
              label="Minimum Stock"
              type="number"
              placeholder="e.g. 20"
              value={form.par}
              onChange={(e) => setField("par", e.target.value)}
            />
            <AntInput
              label="Unit Cost"
              type="number"
              placeholder="e.g. 18.50"
              value={form.cost}
              onChange={(e) => setField("cost", e.target.value)}
            />
          </div>

          <AntSelect
            label="Supplier"
            placeholder="Select supplier"
            value={form.supplier || undefined}
            options={supplierOptions}
            onChange={(value) => setField("supplier", value)}
          />
        </div>
      </DrawerPop>
    </div>
  );
}
