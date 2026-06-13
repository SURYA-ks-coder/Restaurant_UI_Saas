"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDownUp,
  Boxes,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  FileText,
  MoreHorizontal,
  Package,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

const inventoryItems = [
  {
    id: "INV-001",
    name: "Atlantic Salmon",
    category: "Seafood",
    stock: 8,
    unit: "kg",
    par: 18,
    cost: "$18.50",
    supplier: "Ocean Fresh",
    status: "low",
    updated: "12 min ago",
  },
  {
    id: "INV-002",
    name: "A5 Wagyu Ribeye",
    category: "Meat",
    stock: 16,
    unit: "kg",
    par: 12,
    cost: "$92.00",
    supplier: "Prime Cuts",
    status: "healthy",
    updated: "35 min ago",
  },
  {
    id: "INV-003",
    name: "Black Truffle",
    category: "Produce",
    stock: 2,
    unit: "kg",
    par: 5,
    cost: "$240.00",
    supplier: "Terra Market",
    status: "critical",
    updated: "1 hr ago",
  },
  {
    id: "INV-004",
    name: "Parmesan Wheel",
    category: "Dairy",
    stock: 7,
    unit: "pcs",
    par: 6,
    cost: "$64.00",
    supplier: "Dairy Co.",
    status: "healthy",
    updated: "2 hrs ago",
  },
  {
    id: "INV-005",
    name: "Arborio Rice",
    category: "Dry Goods",
    stock: 22,
    unit: "kg",
    par: 20,
    cost: "$4.20",
    supplier: "Pantry Pro",
    status: "healthy",
    updated: "Today",
  },
  {
    id: "INV-006",
    name: "Vanilla Beans",
    category: "Bakery",
    stock: 14,
    unit: "packs",
    par: 18,
    cost: "$12.80",
    supplier: "BakeSource",
    status: "low",
    updated: "Today",
  },
  {
    id: "INV-007",
    name: "Craft Tonic",
    category: "Beverage",
    stock: 48,
    unit: "bottles",
    par: 36,
    cost: "$1.90",
    supplier: "Barline",
    status: "healthy",
    updated: "Yesterday",
  },
  {
    id: "INV-008",
    name: "Microgreens",
    category: "Produce",
    stock: 10,
    unit: "trays",
    par: 10,
    cost: "$7.50",
    supplier: "Terra Market",
    status: "watch",
    updated: "Yesterday",
  },
];

const purchaseOrders = [
  {
    id: "PO-3108",
    supplier: "Ocean Fresh",
    items: "Salmon, scallops",
    eta: "Today, 5:30 PM",
    amount: "$820.00",
    state: "Arriving",
  },
  {
    id: "PO-3109",
    supplier: "Terra Market",
    items: "Truffle, microgreens",
    eta: "Tomorrow, 10:00 AM",
    amount: "$1,140.00",
    state: "Confirmed",
  },
  {
    id: "PO-3110",
    supplier: "Pantry Pro",
    items: "Rice, flour, spices",
    eta: "May 14",
    amount: "$420.00",
    state: "Draft",
  },
];

const categories = [
  "All",
  "Seafood",
  "Meat",
  "Produce",
  "Dairy",
  "Dry Goods",
  "Bakery",
  "Beverage",
];

const statusStyles = {
  healthy: {
    label: "Healthy",
    className: "bg-success/10 text-success",
    bar: "bg-success",
  },
  watch: {
    label: "Watch",
    className: "bg-accent/10 text-accent",
    bar: "bg-accent",
  },
  low: {
    label: "Low",
    className: "bg-warning/10 text-warning",
    bar: "bg-warning",
  },
  critical: {
    label: "Critical",
    className: "bg-destructive/10 text-destructive",
    bar: "bg-destructive",
  },
};

export default function InventoryPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(inventoryItems[0]);
  const [purchaseOrderOpen, setPurchaseOrderOpen] = useState(false);

  const filteredItems = inventoryItems.filter((item) => {
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch = `${item.name} ${item.category} ${item.supplier}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const metrics = useMemo(() => {
    const lowCount = inventoryItems.filter(
      (item) => item.status === "low" || item.status === "critical",
    ).length;
    const totalValue = inventoryItems.reduce((sum, item) => {
      const cost = Number(item.cost.replace("$", ""));
      return sum + cost * item.stock;
    }, 0);

    return {
      totalItems: inventoryItems.length,
      lowCount,
      totalValue,
      ordersDue: purchaseOrders.filter((order) => order.state !== "Draft")
        .length,
    };
  }, []);

  return (
    <Drawer
      open={purchaseOrderOpen}
      onOpenChange={setPurchaseOrderOpen}
      direction="right"
    >
      <div className="min-h-screen bg-background ">
        <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Inventory</h1>
            <p className="mt-2 text-muted-foreground">
              Track stock levels, supplier orders, and kitchen-ready
              ingredients.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted">
              <ClipboardList className="h-4 w-4" />
              Stock Count
            </button>
            <DrawerTrigger asChild>
              <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                <Plus className="h-4 w-4" />
                New Purchase Order
              </button>
            </DrawerTrigger>
          </div>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Total Items"
            value={metrics.totalItems}
            detail="Tracked ingredients"
            icon={Boxes}
            tone="primary"
          />
          <MetricCard
            title="Low Stock"
            value={metrics.lowCount}
            detail="Need attention"
            icon={AlertTriangle}
            tone="warning"
          />
          <MetricCard
            title="Inventory Value"
            value={`$${metrics.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
            detail="Current stock estimate"
            icon={Package}
            tone="success"
          />
          <MetricCard
            title="Orders Due"
            value={metrics.ordersDue}
            detail="Supplier deliveries"
            icon={Truck}
            tone="accent"
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
          <section>
            <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative max-w-md flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search item, category, or supplier"
                  className="h-10 w-full rounded-lg border border-border bg-muted pl-10 pr-3 text-sm outline-none focus:border-primary"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={cn(
                      "whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium",
                      selectedCategory === category
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-border">
              <div className="grid grid-cols-[1.5fr_0.8fr_0.9fr_0.7fr_1fr_2.5rem] bg-muted/60 px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground max-lg:hidden">
                <span>Item</span>
                <span>Category</span>
                <span>Stock</span>
                <span>Cost</span>
                <span>Supplier</span>
                <span />
              </div>

              <div className="divide-y divide-border">
                {filteredItems.map((item) => {
                  const style = statusStyles[item.status];
                  const fill = Math.min(
                    100,
                    Math.round((item.stock / item.par) * 100),
                  );
                  const isSelected = selectedItem?.id === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className={cn(
                        "grid w-full gap-4 px-4 py-4 text-left transition-colors hover:bg-muted/40 lg:grid-cols-[1.5fr_0.8fr_0.9fr_0.7fr_1fr_2.5rem]",
                        isSelected && "bg-primary/5",
                      )}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.name}</span>
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-xs font-medium",
                              style.className,
                            )}
                          >
                            {style.label}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {item.id} • Updated {item.updated}
                        </p>
                      </div>

                      <div className="text-sm text-muted-foreground lg:text-foreground">
                        {item.category}
                      </div>

                      <div>
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span>
                            {item.stock} {item.unit}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Par {item.par}
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className={cn("h-full rounded-full", style.bar)}
                            style={{ width: `${fill}%` }}
                          />
                        </div>
                      </div>

                      <div className="text-sm">{item.cost}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.supplier}
                      </div>
                      <div className="flex justify-end">
                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <section className="glass-card rounded-lg p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Selected Item</h2>
                  <p className="text-sm text-muted-foreground">Stock details</p>
                </div>
                <ArrowDownUp className="h-4 w-4 text-muted-foreground" />
              </div>

              {selectedItem && (
                <div>
                  <div className="mb-4 rounded-lg border border-border bg-muted/30 p-4">
                    <p className="text-sm text-muted-foreground">
                      {selectedItem.category}
                    </p>
                    <h3 className="mt-1 text-2xl font-semibold">
                      {selectedItem.name}
                    </h3>
                    <span
                      className={cn(
                        "mt-3 inline-flex rounded-full px-2 py-1 text-xs font-medium",
                        statusStyles[selectedItem.status].className,
                      )}
                    >
                      {statusStyles[selectedItem.status].label}
                    </span>
                  </div>

                  <div className="space-y-3 text-sm">
                    <InfoRow
                      label="Current Stock"
                      value={`${selectedItem.stock} ${selectedItem.unit}`}
                    />
                    <InfoRow
                      label="Par Level"
                      value={`${selectedItem.par} ${selectedItem.unit}`}
                    />
                    <InfoRow label="Unit Cost" value={selectedItem.cost} />
                    <InfoRow label="Supplier" value={selectedItem.supplier} />
                    <InfoRow label="Last Update" value={selectedItem.updated} />
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <button className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">
                      Reorder
                    </button>
                    <button className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted">
                      Adjust
                    </button>
                  </div>
                </div>
              )}
            </section>

            <section className="glass-card rounded-lg p-5">
              <h2 className="text-lg font-semibold">Low Stock Alerts</h2>
              <p className="mb-4 text-sm text-muted-foreground">
                Items below par level
              </p>
              <div className="space-y-3">
                {inventoryItems
                  .filter(
                    (item) =>
                      item.status === "low" || item.status === "critical",
                  )
                  .map((item) => (
                    <div key={item.id} className="rounded-lg bg-muted/30 p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{item.name}</p>
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-xs",
                            statusStyles[item.status].className,
                          )}
                        >
                          {item.stock}/{item.par}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.supplier} • {item.category}
                      </p>
                    </div>
                  ))}
              </div>
            </section>

            <section className="glass-card rounded-lg p-5">
              <h2 className="text-lg font-semibold">Purchase Orders</h2>
              <p className="mb-4 text-sm text-muted-foreground">
                Supplier activity
              </p>
              <div className="space-y-3">
                {purchaseOrders.map((order) => (
                  <div key={order.id} className="rounded-lg bg-muted/30 p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{order.id}</p>
                      <span className="text-xs text-primary">
                        {order.state}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {order.supplier} • {order.items}
                    </p>
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <CalendarClock className="h-3 w-3" />
                        {order.eta}
                      </span>
                      <span className="font-medium">{order.amount}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
      <NewPurchaseOrderDrawer onDone={() => setPurchaseOrderOpen(false)} />
    </Drawer>
  );
}

function NewPurchaseOrderDrawer({ onDone }) {
  const orderLines = [
    { item: "Atlantic Salmon", quantity: 12, unit: "kg", cost: "$18.50" },
    { item: "Black Truffle", quantity: 3, unit: "kg", cost: "$240.00" },
    { item: "Microgreens", quantity: 8, unit: "trays", cost: "$7.50" },
  ];

  return (
    <DrawerContent className="flex flex-col">
      <DrawerHeader className="flex items-start justify-between gap-4">
        <div>
          <DrawerTitle>New Purchase Order</DrawerTitle>
          <DrawerDescription>
            Create a supplier order for low-stock inventory items.
          </DrawerDescription>
        </div>
        <DrawerClose asChild>
          <button className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </DrawerClose>
      </DrawerHeader>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <FormField label="Supplier">
            <select
              className="h-10 w-full rounded-lg border border-border bg-muted px-3 text-sm outline-none focus:border-primary"
              defaultValue="Ocean Fresh"
            >
              <option>Ocean Fresh</option>
              <option>Terra Market</option>
              <option>Prime Cuts</option>
              <option>Pantry Pro</option>
            </select>
          </FormField>

          <FormField label="Expected Delivery">
            <input
              type="datetime-local"
              className="h-10 w-full rounded-lg border border-border bg-muted px-3 text-sm outline-none focus:border-primary"
            />
          </FormField>

          <FormField label="Order Priority">
            <select
              className="h-10 w-full rounded-lg border border-border bg-muted px-3 text-sm outline-none focus:border-primary"
              defaultValue="Standard"
            >
              <option>Standard</option>
              <option>Rush</option>
              <option>Scheduled</option>
            </select>
          </FormField>

          <FormField label="Department">
            <select
              className="h-10 w-full rounded-lg border border-border bg-muted px-3 text-sm outline-none focus:border-primary"
              defaultValue="Kitchen"
            >
              <option>Kitchen</option>
              <option>Bar</option>
              <option>Pastry</option>
              <option>Operations</option>
            </select>
          </FormField>
        </div>

        <section className="mb-6 rounded-lg border border-border">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <h3 className="font-medium">Order Items</h3>
              <p className="text-xs text-muted-foreground">
                Add ingredients, quantity, and expected unit cost.
              </p>
            </div>
            <button className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted">
              <Plus className="h-4 w-4" />
              Add Item
            </button>
          </div>

          <div className="divide-y divide-border">
            {orderLines.map((line) => (
              <div
                key={line.item}
                className="grid gap-3 px-4 py-4 sm:grid-cols-[1fr_6rem_5rem_6rem_2rem] sm:items-end"
              >
                <FormField label="Item">
                  <input
                    defaultValue={line.item}
                    className="h-10 w-full rounded-lg border border-border bg-muted px-3 text-sm outline-none focus:border-primary"
                  />
                </FormField>
                <FormField label="Qty">
                  <input
                    type="number"
                    defaultValue={line.quantity}
                    className="h-10 w-full rounded-lg border border-border bg-muted px-3 text-sm outline-none focus:border-primary"
                  />
                </FormField>
                <FormField label="Unit">
                  <input
                    defaultValue={line.unit}
                    className="h-10 w-full rounded-lg border border-border bg-muted px-3 text-sm outline-none focus:border-primary"
                  />
                </FormField>
                <FormField label="Cost">
                  <input
                    defaultValue={line.cost}
                    className="h-10 w-full rounded-lg border border-border bg-muted px-3 text-sm outline-none focus:border-primary"
                  />
                </FormField>
                <button className="mb-1 rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </section>

        <div className="grid gap-4">
          <FormField label="Internal Notes">
            <textarea
              rows={4}
              placeholder="Add receiving instructions, substitutions, or invoice notes"
              className="w-full resize-none rounded-lg border border-border bg-muted px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </FormField>

          <div className="rounded-lg bg-muted/40 p-4">
            <div className="mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <h3 className="font-medium">Order Summary</h3>
            </div>
            <div className="space-y-2 text-sm">
              <SummaryRow label="Items" value="3" />
              <SummaryRow label="Estimated subtotal" value="$1,022.00" />
              <SummaryRow label="Delivery fee" value="$24.00" />
              <SummaryRow label="Estimated total" value="$1,046.00" strong />
            </div>
          </div>
        </div>
      </div>

      <DrawerFooter className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <DrawerClose asChild>
          <button className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted">
            Cancel
          </button>
        </DrawerClose>
        <button className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted">
          Save Draft
        </button>
        <button
          onClick={onDone}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Create Purchase Order
        </button>
      </DrawerFooter>
    </DrawerContent>
  );
}

function FormField({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}

function SummaryRow({ label, value, strong }) {
  return (
    <div
      className={cn(
        "flex items-center justify-between",
        strong && "border-t border-border pt-2 text-base font-semibold",
      )}
    >
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function MetricCard({ title, value, detail, icon: Icon, tone }) {
  const tones = {
    primary: "bg-primary/10 text-primary",
    warning: "bg-warning/10 text-warning",
    success: "bg-success/10 text-success",
    accent: "bg-accent/10 text-accent",
  };

  return (
    <div className="glass-card rounded-lg p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className={cn("rounded-lg p-3", tones[tone])}>
          <Icon className="h-5 w-5" />
        </div>
        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="text-2xl font-semibold">{value}</p>
      <p className="mt-1 font-medium">{title}</p>
      <p className="text-sm text-muted-foreground">{detail}</p>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
