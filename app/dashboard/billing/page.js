"use client";

import { message } from "@/lib/message";

import { useEffect, useMemo, useState } from "react";
import {
  Banknote, CheckCircle2, CreditCard, Minus, PauseCircle,
  Plus, ReceiptText, Smartphone, Tag, Trash2,
  UtensilsCrossed, Users, X, Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { API, action, getAction } from "@/lib/API";
import { AntInput } from "@/components/ui/AntInput";
import { AntSelect } from "@/components/ui/AntSelect";
import SearchBox from "@/components/ui/SearchBox";

/* ── fallback data ─────────────────────────────────────────────────────── */

const fallbackCategories = [
  { _id: "starters", categoryName: "Starters" },
  { _id: "mains", categoryName: "Main Course" },
  { _id: "drinks", categoryName: "Drinks" },
];

const fallbackMenuItems = [
  { _id: "paneer-tikka", itemName: "Paneer Tikka", itemCode: "ITM001", categoryId: { _id: "starters", categoryName: "Starters" }, prices: { dineInPrice: 220 }, gstPercent: 5, addOns: [] },
  { _id: "veg-biryani", itemName: "Veg Biryani", itemCode: "ITM002", categoryId: { _id: "mains", categoryName: "Main Course" }, prices: { dineInPrice: 260 }, gstPercent: 5, addOns: [] },
  { _id: "lime-soda", itemName: "Fresh Lime Soda", itemCode: "ITM003", categoryId: { _id: "drinks", categoryName: "Drinks" }, prices: { dineInPrice: 90 }, gstPercent: 5, addOns: [] },
  { _id: "chicken-tikka", itemName: "Chicken Tikka", itemCode: "ITM004", categoryId: { _id: "starters", categoryName: "Starters" }, prices: { dineInPrice: 320 }, gstPercent: 5, addOns: [] },
  { _id: "dal-makhani", itemName: "Dal Makhani", itemCode: "ITM005", categoryId: { _id: "mains", categoryName: "Main Course" }, prices: { dineInPrice: 200 }, gstPercent: 5, addOns: [] },
  { _id: "mango-lassi", itemName: "Mango Lassi", itemCode: "ITM006", categoryId: { _id: "drinks", categoryName: "Drinks" }, prices: { dineInPrice: 120 }, gstPercent: 5, addOns: [] },
];

const fallbackTables = [
  { _id: "table-1", tableName: "T1", tableNumber: 1, capacity: 2 },
  { _id: "table-2", tableName: "T2", tableNumber: 2, capacity: 4 },
  { _id: "table-3", tableName: "T3", tableNumber: 3, capacity: 6 },
];

const customerTypes = ["Dine In", "Parcel", "Delivery"];

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency", currency: "INR", maximumFractionDigits: 2,
});

/* ── helpers ───────────────────────────────────────────────────────────── */

const getItemPrice = (item) =>
  Number(item?.prices?.dineInPrice || item?.prices?.parcelPrice || item?.prices?.deliveryPrice || item?.price || 0);

const roundAmount = (v) => Number((Number(v) || 0).toFixed(2));

const parseStoredValue = (key) => {
  if (typeof window === "undefined") return "";
  const v = localStorage.getItem(key);
  if (!v) return "";
  try { return JSON.parse(v); } catch { return v; }
};

const getEntityId = (value) => {
  if (Array.isArray(value)) return getEntityId(value[0]);
  if (value && typeof value === "object") return value._id || value.id || "";
  return value || "";
};

const getBranchId = () =>
  getEntityId(
    parseStoredValue("branchId") || parseStoredValue("defaultBranchId") || parseStoredValue("branchIds"),
  );

const getOrderType = (type) =>
  ({ "Dine In": "dine_in", Parcel: "parcel", Delivery: "online" }[type] || "dine_in");

const buildBillNo = () => {
  const d = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `BILL-${d}-${Math.floor(1000 + Math.random() * 9000)}`;
};

/* ── page ──────────────────────────────────────────────────────────────── */

export default function BillingPage() {
  const [customer, setCustomer] = useState({ name: "", mobile: "", type: "Dine In", tableId: "", guests: 1 });
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState([]);
  const [discountValue, setDiscountValue] = useState("");
  const [discountType, setDiscountType] = useState("flat");
  const [showDiscount, setShowDiscount] = useState(false);
  const [splitPayment, setSplitPayment] = useState(false);
  const [paymentMode, setPaymentMode] = useState("cash");
  const [payments, setPayments] = useState({ cash: "", upi: "", card: "" });
  const [lastFourDigits, setLastFourDigits] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [menuItems, setMenuItems] = useState(fallbackMenuItems);
  const [categories, setCategories] = useState(fallbackCategories);
  const [tables, setTables] = useState(fallbackTables);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const billNo = useMemo(() => buildBillNo(), []);

  useEffect(() => {
    const load = async () => {
      try {
        const [catRes, menuRes, tableRes] = await Promise.all([
          getAction(API.GET_CATEGORY_LIST, {}),
          getAction(API.GET_MENU_ITEM_LIST, {}),
          getAction(API.GET_TABLE_LIST, {}),
        ]);
        if (catRes?.statusCode === 200 && catRes.data?.length) setCategories(catRes.data);
        if (menuRes?.statusCode === 200 && menuRes.data?.length) setMenuItems(menuRes.data);
        if (tableRes?.statusCode === 200 && tableRes.data?.length) setTables(tableRes.data);
      } catch {
        setStatusMessage("Using sample data — API offline.");
      }
    };
    load();
  }, []);

  const categoryOptions = useMemo(
    () => [{ _id: "all", categoryName: "All" }, ...categories],
    [categories],
  );

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return menuItems.filter((item) => {
      const catId = item.categoryId?._id || item.categoryId;
      const matchesCat = selectedCategory === "all" || catId === selectedCategory;
      const text = `${item.itemName || ""} ${item.itemCode || ""}`.toLowerCase();
      return matchesCat && text.includes(q);
    });
  }, [menuItems, searchQuery, selectedCategory]);

  const summary = useMemo(() => {
    const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    const discInput = Number(discountValue) || 0;
    const discount = discountType === "percent"
      ? Math.min(subtotal, subtotal * (discInput / 100))
      : Math.min(subtotal, discInput);
    const taxable = subtotal - discount;
    const gst = cart.reduce((s, i) => {
      const share = subtotal ? (i.price * i.quantity) / subtotal : 0;
      return s + taxable * share * ((i.gstPercent || 0) / 100);
    }, 0);
    const serviceCharge = taxable * 0.05;
    const total = taxable + gst + serviceCharge;
    return { subtotal, discount, gst, serviceCharge, total };
  }, [cart, discountType, discountValue]);

  useEffect(() => {
    if (splitPayment) return;
    setPayments({
      cash: paymentMode === "cash" ? summary.total.toFixed(2) : "",
      upi: paymentMode === "upi" ? summary.total.toFixed(2) : "",
      card: paymentMode === "card" ? summary.total.toFixed(2) : "",
    });
  }, [paymentMode, splitPayment, summary.total]);

  const paidTotal = Object.values(payments).reduce((s, v) => s + (Number(v) || 0), 0);
  const balance = summary.total - paidTotal;
  const selectedTable = tables.find((t) => t._id === customer.tableId);

  const updateCustomer = (field, value) => setCustomer((c) => ({ ...c, [field]: value }));

  const addItemToCart = (item) => {
    const existing = cart.find((c) => c.itemId === item._id);
    if (existing) {
      setCart((prev) => prev.map((c) => c.itemId === item._id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      const price = getItemPrice(item);
      setCart((prev) => [...prev, {
        lineId: `${item._id}-${Date.now()}`,
        itemId: item._id,
        itemName: item.itemName,
        itemCode: item.itemCode,
        categoryId: item.categoryId,
        quantity: 1,
        price,
        total: price,
        gstPercent: Number(item.gstPercent || 5),
      }]);
    }
    setSearchQuery("");
  };

  const updateCartQuantity = (lineId, delta) => {
    setCart((prev) =>
      prev.map((i) => i.lineId === lineId ? { ...i, quantity: i.quantity + delta } : i)
          .filter((i) => i.quantity > 0),
    );
  };

  const resetBill = () => {
    setCustomer({ name: "", mobile: "", type: "Dine In", tableId: "", guests: 1 });
    setCart([]);
    setDiscountValue("");
    setDiscountType("flat");
    setShowDiscount(false);
    setSplitPayment(false);
    setPaymentMode("cash");
    setPayments({ cash: "", upi: "", card: "" });
    setLastFourDigits("");
  };

  const validateBill = ({ requirePayment = true } = {}) => {
    const restaurantId = getEntityId(parseStoredValue("restaurantId"));
    const branchId = getBranchId();
    if (!restaurantId || !branchId) { setStatusMessage("Restaurant and branch details are required."); return false; }
    if (customer.type === "Dine In" && !customer.tableId) { setStatusMessage("Select a table for dine-in."); return false; }
    if (!cart.length) { setStatusMessage("Add at least one item."); return false; }
    if (requirePayment && Math.abs(balance) > 0.01) { setStatusMessage("Payment must match bill total."); return false; }
    return true;
  };

  const cartNotes = () =>
    cart.map((i) => {
      const d = [i.notes, ...(i.addOns || [])].filter(Boolean).join(", ");
      return d ? `${i.itemName}: ${d}` : "";
    }).filter(Boolean);

  const buildPayload = (status) => {
    const restaurantId = getEntityId(parseStoredValue("restaurantId"));
    const branchId = getBranchId();
    const userData = parseStoredValue("userData");
    const taxable = Math.max(summary.subtotal - summary.discount, 0);
    const customerText = [
      customer.name && `Customer: ${customer.name}`,
      customer.mobile && `Mobile: ${customer.mobile}`,
      customer.guests && `Guests: ${customer.guests}`,
      `Service Charge: ${currency.format(summary.serviceCharge)}`,
    ].filter(Boolean).join(" | ");

    const items = cart.map((item) => {
      const sub = item.price * item.quantity;
      const discShare = summary.subtotal ? summary.discount * (sub / summary.subtotal) : 0;
      const taxable2 = Math.max(sub - discShare, 0);
      const taxAmount = roundAmount(taxable2 * ((item.gstPercent || 0) / 100));
      return { menuItemId: item.itemId, itemName: item.itemName, quantity: Number(item.quantity), price: roundAmount(item.price), taxAmount, total: roundAmount(sub) };
    });

    const billPayments = Object.entries(payments)
      .map(([method, amount]) => ({ method, amount: roundAmount(amount), transactionRef: method === "card" ? lastFourDigits : "", paidAt: new Date() }))
      .filter((p) => p.amount > 0);

    return {
      restaurantId, branchId, billNo, orderType: getOrderType(customer.type),
      tableId: customer.type === "Dine In" ? customer.tableId : undefined,
      items, taxRate: cart[0]?.gstPercent || 0,
      discount: roundAmount(discountValue),
      note: [customerText, ...cartNotes()].filter(Boolean).join("\n"),
      subTotal: roundAmount(summary.subtotal), taxTotal: roundAmount(summary.gst),
      discountTotal: roundAmount(summary.discount),
      grandTotal: roundAmount(taxable + summary.gst + summary.serviceCharge),
      payments: billPayments,
      paymentStatus: status === "completed" && Math.abs(balance) <= 0.01 ? "paid" : "pending",
      status, createdBy: getEntityId(userData),
    };
  };

  const submitBill = async (status) => {
    if (!validateBill({ requirePayment: status === "completed" })) return;
    setIsSubmitting(true);
    try {
      const res = await action(API.CREATE_BILL, buildPayload(status));
      if (res?.statusCode === 200 || res?.statusCode === 201) {
        const msg = status === "completed" ? "Bill saved!" : status === "held" ? "Bill on hold." : "Bill cancelled.";
        message.success(res?.message || msg);
        setStatusMessage(msg);
        if (status !== "held") resetBill();
        return;
      }
      message.error(res?.message || "Unable to save bill");
      setStatusMessage(res?.message || "Unable to save bill");
    } catch {
      message.error("Unable to save bill");
      setStatusMessage("Unable to save bill. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── render ── */
  return (
    <div className="min-h-screen bg-background">

      {/* ── Page header ── */}
      <div className="mb-6">
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground mb-1.5">
          <ReceiptText className="w-3.5 h-3.5" />
          POS / Billing
        </div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Billing & Payment</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Browse items, apply discounts, collect payment</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {cart.length > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
                <Zap className="w-3 h-3" />
                {cart.length} item{cart.length !== 1 ? "s" : ""}
              </span>
            )}
            <span className="rounded-xl border border-border bg-muted px-3 py-1.5 font-mono text-xs text-muted-foreground">
              {billNo}
            </span>
          </div>
        </div>
      </div>

      {/* ── Status message ── */}
      {statusMessage && (
        <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-border bg-muted/60 px-4 py-3 text-sm backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="text-foreground">{statusMessage}</span>
          </div>
          <button onClick={() => setStatusMessage("")} className="rounded-lg p-1 text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── Two-panel layout ── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px]">

        {/* ════════════════ LEFT PANEL ════════════════ */}
        <div className="space-y-5">

          {/* Customer card */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/10">
                <Users className="h-3.5 w-3.5 text-violet-500" />
              </div>
              <h2 className="text-sm font-semibold text-foreground">Customer Details</h2>
            </div>

            {/* Order type pills */}
            <div className="mb-4 flex gap-2 rounded-xl bg-muted p-1">
              {customerTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => updateCustomer("type", type)}
                  className={cn(
                    "flex-1 rounded-lg py-2 text-xs font-semibold transition-all duration-200",
                    customer.type === type
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Fields */}
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
              <AntInput
                label="Customer Name"
                value={customer.name}
                onChange={(e) => updateCustomer("name", e.target.value)}
                placeholder="Optional"
              />
              <AntInput
                label="Mobile Number"
                value={customer.mobile}
                onChange={(e) => updateCustomer("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))}
                inputMode="numeric"
                placeholder="10-digit"
              />
              {customer.type === "Dine In" && (
                <AntSelect
                  label="Table"
                  options={tables.map((t) => ({ label: t.tableName || `Table ${t.tableNumber}`, value: t._id }))}
                  value={customer.tableId}
                  onChange={(v) => updateCustomer("tableId", v)}
                />
              )}
              <BillField label="Guests">
                <Stepper value={customer.guests} onChange={(v) => updateCustomer("guests", Math.max(1, v))} />
              </BillField>
            </div>
          </div>

          {/* Menu card */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10">
                <UtensilsCrossed className="h-3.5 w-3.5 text-amber-500" />
              </div>
              <h2 className="text-sm font-semibold text-foreground">Menu</h2>
              <span className="ml-auto text-xs text-muted-foreground">
                {filteredItems.length} item{filteredItems.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Search */}
            <SearchBox
              value={searchQuery}
              change={(v) => setSearchQuery(v)}
              placeholder="Search by name or code…"
            />

            {/* Category pills */}
            <div className="no-scrollbar mt-3 flex gap-1.5 overflow-x-auto pb-0.5">
              {categoryOptions.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => setSelectedCategory(cat._id)}
                  className={cn(
                    "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200",
                    selectedCategory === cat._id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted text-muted-foreground hover:text-foreground",
                  )}
                >
                  {cat.categoryName}
                </button>
              ))}
            </div>

            {/* Items grid */}
            {filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-center">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                  <UtensilsCrossed className="h-7 w-7 text-muted-foreground/30" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">No items found</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Try a different search or category</p>
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                {filteredItems.map((item) => {
                  const cartEntry = cart.find((c) => c.itemId === item._id);
                  return (
                    <MenuItemCard
                      key={item._id}
                      item={item}
                      cartQty={cartEntry?.quantity || 0}
                      onAdd={() => addItemToCart(item)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ════════════════ RIGHT PANEL (cart) ════════════════ */}
        <div className="sticky top-5 flex max-h-[calc(100vh-96px)] flex-col overflow-hidden rounded-2xl border border-border bg-card">

          {/* Cart header */}
          <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="font-semibold text-foreground">Current Order</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {cart.length} item{cart.length !== 1 ? "s" : ""}
                {selectedTable && ` · ${selectedTable.tableName}`}
              </p>
            </div>
            {cart.length > 0 && (
              <button
                onClick={() => setCart([])}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Cart items — scrollable */}
          <div className="flex-1 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
                <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                  <UtensilsCrossed className="h-7 w-7 text-muted-foreground/30" />
                </div>
                <p className="text-sm font-medium text-foreground">Cart is empty</p>
                <p className="mt-1 text-xs text-muted-foreground">Tap items from the menu to add</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {cart.map((item) => (
                  <div key={item.lineId} className="flex items-center gap-3 px-5 py-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted">
                      <UtensilsCrossed className="h-4 w-4 text-muted-foreground/50" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{item.itemName}</p>
                      <p className="text-xs text-muted-foreground">₹{item.price.toFixed(0)} each</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        onClick={() => updateCartQuantity(item.lineId, -1)}
                        className="flex h-6 w-6 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors hover:bg-muted/70"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-7 text-center text-sm font-bold tabular-nums text-foreground">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQuantity(item.lineId, 1)}
                        className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary transition-colors hover:bg-primary/20"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <span className="w-14 shrink-0 text-right text-sm font-bold tabular-nums text-foreground">
                      ₹{(item.price * item.quantity).toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bill summary + payment — fixed bottom */}
          <div className="shrink-0 space-y-3.5 border-t border-border p-4">

            {/* Discount toggle */}
            <button
              onClick={() => setShowDiscount((p) => !p)}
              className="flex w-full items-center gap-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <Tag className="h-3.5 w-3.5" />
              {showDiscount ? "Remove discount" : "Apply discount"}
              <span className={cn("ml-auto flex h-4 w-7 items-center rounded-full px-0.5 transition-colors", showDiscount ? "bg-primary" : "bg-muted border border-border")}>
                <span className={cn("h-3 w-3 rounded-full bg-white shadow-sm transition-transform duration-200", showDiscount ? "translate-x-3" : "translate-x-0")} />
              </span>
            </button>

            {showDiscount && (
              <div className="flex gap-2">
                <div className="flex overflow-hidden rounded-xl border border-border text-xs">
                  <button
                    onClick={() => setDiscountType("flat")}
                    className={cn("px-3 py-2 font-semibold transition-colors", discountType === "flat" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}
                  >
                    ₹ Flat
                  </button>
                  <button
                    onClick={() => setDiscountType("percent")}
                    className={cn("px-3 py-2 font-semibold transition-colors", discountType === "percent" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}
                  >
                    % Off
                  </button>
                </div>
                <input
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder={discountType === "flat" ? "Amount (₹)" : "Percent (%)"}
                  className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary"
                />
              </div>
            )}

            {/* Summary rows */}
            <div className="space-y-1.5 rounded-xl bg-muted/50 p-3 text-sm">
              <BillRow label="Subtotal" value={currency.format(summary.subtotal)} />
              {summary.discount > 0 && (
                <BillRow label="Discount" value={`- ${currency.format(summary.discount)}`} className="text-emerald-500" />
              )}
              <BillRow label="GST" value={currency.format(summary.gst)} />
              <BillRow label="Service Charge (5%)" value={currency.format(summary.serviceCharge)} />
              <div className="border-t border-border/60 pt-2">
                <BillRow
                  label={<span className="font-bold text-foreground">Total</span>}
                  value={<span className="text-base font-bold text-foreground">{currency.format(Math.max(summary.total, 0))}</span>}
                />
              </div>
            </div>

            {/* Payment method */}
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Payment Method</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "cash", Icon: Banknote, label: "Cash" },
                  { id: "card", Icon: CreditCard, label: "Card" },
                  { id: "upi", Icon: Smartphone, label: "UPI" },
                ].map(({ id, Icon, label }) => (
                  <button
                    key={id}
                    onClick={() => setPaymentMode(id)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-xl border py-3 text-xs font-bold transition-all duration-200",
                      paymentMode === id
                        ? "border-primary bg-primary text-primary-foreground shadow-md"
                        : "border-border bg-muted/50 text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {label}
                  </button>
                ))}
              </div>

              {paymentMode === "card" && !splitPayment && (
                <input
                  value={lastFourDigits}
                  onChange={(e) => setLastFourDigits(e.target.value.slice(0, 4))}
                  placeholder="Last 4 card digits"
                  maxLength={4}
                  className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary"
                />
              )}

              {/* Split payment toggle */}
              <button
                onClick={() => setSplitPayment((p) => !p)}
                className="mt-2 flex w-full items-center gap-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <span className={cn("flex h-4 w-7 items-center rounded-full px-0.5 transition-colors", splitPayment ? "bg-primary" : "bg-muted border border-border")}>
                  <span className={cn("h-3 w-3 rounded-full bg-white shadow-sm transition-transform duration-200", splitPayment ? "translate-x-3" : "translate-x-0")} />
                </span>
                Split payment
              </button>

              {splitPayment && (
                <div className="mt-2 space-y-2">
                  {[{ id: "cash", label: "Cash", Icon: Banknote }, { id: "card", label: "Card", Icon: CreditCard }, { id: "upi", label: "UPI", Icon: Smartphone }].map(({ id, label, Icon }) => (
                    <div key={id} className="flex items-center gap-2">
                      <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span className="w-10 text-xs text-muted-foreground">{label}</span>
                      <input
                        type="number"
                        value={payments[id]}
                        onChange={(e) => setPayments((prev) => ({ ...prev, [id]: e.target.value }))}
                        placeholder="0.00"
                        className="min-w-0 flex-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm text-foreground outline-none focus:border-primary"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Balance indicator */}
            {cart.length > 0 && Math.abs(balance) > 0.01 && (
              <div className={cn(
                "flex items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold",
                balance > 0 ? "bg-rose-500/10 text-rose-500" : "bg-emerald-500/10 text-emerald-500",
              )}>
                <span>{balance > 0 ? "Balance due" : "Change"}</span>
                <span className="tabular-nums">{currency.format(Math.abs(balance))}</span>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={() => submitBill("completed")}
                disabled={isSubmitting || !cart.length}
                className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? "Processing…" : `Generate Bill  ${cart.length > 0 ? "· " + currency.format(Math.max(summary.total, 0)) : ""}`}
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => submitBill("held")}
                  disabled={isSubmitting || !cart.length}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-muted py-2.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted/70 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <PauseCircle className="h-3.5 w-3.5" />
                  Hold Bill
                </button>
                <button
                  onClick={() => { if (!cart.length) { resetBill(); setStatusMessage("Bill cleared."); } else submitBill("cancelled"); }}
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-destructive/30 bg-destructive/10 py-2.5 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/15 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X className="h-3.5 w-3.5" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── sub-components ────────────────────────────────────────────────────── */

function MenuItemCard({ item, cartQty, onAdd }) {
  const price = getItemPrice(item);
  return (
    <div
      onClick={onAdd}
      className={cn(
        "group relative cursor-pointer rounded-2xl border bg-background p-4 transition-all duration-200",
        "hover:shadow-md active:scale-[0.97]",
        cartQty > 0 ? "border-primary/40 ring-1 ring-primary/20" : "border-border hover:border-primary/30",
      )}
    >
      {/* Cart qty badge */}
      {cartQty > 0 && (
        <div className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-md">
          {cartQty}
        </div>
      )}

      {/* Item image placeholder */}
      <div className="mb-3 flex aspect-square w-full items-center justify-center rounded-xl bg-muted">
        <UtensilsCrossed className="h-7 w-7 text-muted-foreground/30" />
      </div>

      <p className="truncate text-sm font-semibold leading-tight text-foreground">{item.itemName}</p>
      <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
        {item.itemCode || item.categoryId?.categoryName || ""}
      </p>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-base font-bold text-primary">₹{price}</span>
        <div className={cn(
          "flex h-7 w-7 items-center justify-center rounded-lg shadow-sm transition-all duration-200 group-hover:scale-110",
          cartQty > 0 ? "bg-primary" : "bg-primary/10",
        )}>
          <Plus className={cn("h-4 w-4", cartQty > 0 ? "text-primary-foreground" : "text-primary")} />
        </div>
      </div>
    </div>
  );
}

function BillRow({ label, value, className }) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

function BillField({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}

function Stepper({ value, onChange }) {
  return (
    <div className="grid h-10 grid-cols-[2.5rem_1fr_2.5rem] overflow-hidden rounded-lg border border-border bg-muted/30">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, Number(value) - 1))}
        className="flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      >
        <Minus className="h-4 w-4" />
      </button>
      <input
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 1)}
        inputMode="numeric"
        className="min-w-0 bg-transparent text-center text-sm font-medium text-foreground outline-none"
      />
      <button
        type="button"
        onClick={() => onChange(Number(value) + 1)}
        className="flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
