"use client";

import { message } from "@/lib/message";
import { getRestaurantId, getDefaultBranchId, getUserId } from "@/lib/auth";

import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Clock,
  ChevronDown,
  CreditCard,
  Banknote,
  Smartphone,
  Wallet,
  Heart,
  Check,
  Loader2,
  QrCode,
  X,
  ChefHat,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { API, action, getAction } from "@/lib/API";
import { triggerPrint } from "@/lib/print";
import ViewOrderDetails from "./OrdersDetails.js/ViewOrderDetails";
import RazorpayPaymentModal from "@/components/payments/RazorpayPaymentModal";

/* ─── helpers (mirrors pos/page.js) ──────────────────────────────────────── */

const roundAmount = (value) => Number((Number(value) || 0).toFixed(2));

/* ─── transform API shapes → design shapes ───────────────────────────────── */

const ITEM_EMOJIS = [
  "🍽️",
  "🥘",
  "🍲",
  "🍛",
  "🍜",
  "🍝",
  "🥗",
  "🍱",
  "🫕",
  "🥙",
  "🍗",
  "🍖",
  "🧀",
  "🥬",
  "🍄",
  "🥕",
  "🍋",
  "☕",
  "🧋",
  "🥤",
  "🍮",
  "🍨",
];
const ITEM_BGS = [
  "from-orange-400/70 to-red-500/70",
  "from-amber-400/70 to-orange-600/70",
  "from-yellow-300/70 to-amber-500/70",
  "from-red-400/70 to-rose-600/70",
  "from-stone-400/70 to-stone-700/70",
  "from-lime-400/70 to-green-600/70",
  "from-orange-500/70 to-red-600/70",
  "from-amber-600/70 to-red-700/70",
  "from-teal-400/70 to-cyan-600/70",
  "from-green-500/70 to-emerald-700/70",
  "from-pink-400/70 to-rose-600/70",
  "from-sky-300/70 to-blue-500/70",
];

const transformMenuItem = (item, index) => ({
  id: item._id,
  name: item.itemName,
  desc: item.description || "",
  price: Number(item.prices?.dineInPrice || 0),
  time: item.preparationTime || item.prepTime || 15,
  category: item.categoryId?.categoryName || "",
  categoryId: item.categoryId?._id || "",
  veg: item.itemType === "veg",
  popular: item.isPopular ?? false,
  image: item.image || null,
  emoji: ITEM_EMOJIS[index % ITEM_EMOJIS.length],
  bg: ITEM_BGS[index % ITEM_BGS.length],
});

const transformTable = (table) => ({
  id: table._id,
  name: table.tableName || `Table ${table.tableNumber}`,
  status: table.status === "active" ? "available" : table.status || "available",
  seats: table.capacity || table.seats || 4,
});

const PAYMENT_METHODS = [
  { id: "cash", label: "Cash", Icon: Banknote },
  { id: "card", label: "Card", Icon: CreditCard },
  { id: "upi", label: "UPI", Icon: Smartphone },
  // { id: "wallet", label: "Wallet", Icon: Wallet },
  { id: "razorpay", label: "Razorpay", Icon: QrCode },
];

/* ─── VegDot ──────────────────────────────────────────────────────────────── */

function VegDot({ veg }) {
  return (
    <span
      className={cn(
        "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border-2",
        veg ? "border-emerald-600" : "border-rose-600",
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          veg ? "bg-emerald-600" : "bg-rose-600",
        )}
      />
    </span>
  );
}

/* ─── FoodCard ────────────────────────────────────────────────────────────── */

function FoodCard({ item, onAdd }) {
  const [liked, setLiked] = useState(false);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-[20px] bg-card shadow-sm ring-1 ring-border/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-primary/30">
      {/* Image area */}
      <div
        className={cn(
          "relative flex h-44 items-center justify-center overflow-hidden bg-linear-to-br",
          !item.image && item.bg,
        )}
      >
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="text-[64px] leading-none drop-shadow-lg transition-transform duration-300 group-hover:scale-110">
            {item.emoji}
          </span>
        )}

        {/* Favorite */}
        <button
          onClick={() => setLiked((l) => !l)}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 shadow-sm backdrop-blur-sm transition-all hover:scale-110 hover:bg-white"
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-colors",
              liked ? "fill-rose-500 text-rose-500" : "text-gray-400",
            )}
          />
        </button>

        {/* Category badge */}
        <span className="absolute left-3 top-3 rounded-full bg-white/85 px-2.5 py-0.5 text-[11px] font-semibold capitalize text-gray-700 shadow-sm backdrop-blur-sm">
          {item.category}
        </span>

        {/* Popular badge */}
        {item.popular && (
          <span className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-0.5 text-[11px] font-semibold text-amber-900 shadow-sm">
            🔥 Popular
          </span>
        )}

        {/* Floating add */}
        <button
          onClick={() => onAdd(item)}
          className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all duration-200 hover:scale-110 hover:opacity-90 active:scale-95"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {/* Card body */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-1.5">
          <VegDot veg={item.veg} />
          <h3 className="truncate font-semibold leading-snug text-foreground">
            {item.name}
          </h3>
        </div>
        <p className="mt-0.5 line-clamp-1 text-xs leading-relaxed text-muted-foreground">
          {item.desc}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-bold text-foreground">
            ₹{item.price}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {item.time} min
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── CartItemRow ─────────────────────────────────────────────────────────── */

function CartItemRow({ item, onIncrease, onDecrease, onRemove }) {
  return (
    <div className="flex items-center gap-3 border-b border-border py-3 last:border-0">
      {/* Emoji thumbnail */}
      <div
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br text-2xl",
          item.bg,
        )}
      >
        {item.emoji}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">
          {item.name}
        </p>
        <p className="text-xs text-muted-foreground">₹{item.price} each</p>
      </div>

      {/* Qty control */}
      <div className="flex items-center gap-1 rounded-xl bg-muted p-1">
        <button
          onClick={() => onDecrease(item.id)}
          className="flex h-6 w-6 items-center justify-center rounded-lg bg-card text-muted-foreground shadow-sm transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <Minus className="h-3 w-3" />
        </button>
        <span className="w-5 text-center text-sm font-bold tabular-nums text-foreground">
          {item.qty}
        </span>
        <button
          onClick={() => onIncrease(item.id)}
          className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm transition-colors hover:opacity-90"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>

      {/* Price + remove */}
      <div className="min-w-13 text-right">
        <p className="text-sm font-bold text-foreground">
          ₹{item.price * item.qty}
        </p>
        <button
          onClick={() => onRemove(item.id)}
          className="text-[11px] text-destructive/70 transition-colors hover:text-destructive"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

/* ─── main page ───────────────────────────────────────────────────────────── */

export default function OrdersPage() {
  /* existing API state */
  const [ordersData, setOrdersData] = useState([]);
  const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  /* POS UI state */
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [cart, setCart] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableOpen, setTableOpen] = useState(false);
  const [tableGroups, setTableGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [groupFormOpen, setGroupFormOpen] = useState(false);
  const [newGroupGuestCount, setNewGroupGuestCount] = useState(2);
  const [newGroupLabel, setNewGroupLabel] = useState("");
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [razorpayModal, setRazorpayModal] = useState({
    open: false,
    billId: null,
    billNo: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingToKot, setIsSendingToKot] = useState(false);

  /* live data */
  const [categoryData, setCategoryData] = useState([]);
  const [menuItemData, setMenuItemData] = useState([]);
  const [tableData, setTableData] = useState([]);

  /* ── fetch functions ── */
  useEffect(() => {
    getOrdersList();
    getCategoryList();
    getMenuItemList();
    getTableList();
  }, []);

  const getOrdersList = async () => {
    try {
      const result = await getAction(API.GET_BILL_LIST, {});
      if (result?.statusCode === 200) setOrdersData(result?.data || []);
    } catch (error) {}
  };

  const getCategoryList = async () => {
    try {
      const result = await getAction(API.GET_CATEGORY_LIST);
      if (result?.statusCode === 200) {
        setCategoryData([
          { id: "all", label: "All Items", emoji: "🍽️" },
          ...(result.data || []).map((c) => ({
            id: c._id,
            label: c.categoryName,
            emoji: "🍽️",
          })),
        ]);
      }
    } catch (error) {}
  };

  const getMenuItemList = async () => {
    try {
      const result = await action(API.GET_MENU_ITEM_LIST, {
        restaurantId: getRestaurantId(),
        branchId: getDefaultBranchId(),
      });
      if (result?.statusCode === 200) {
        setMenuItemData((result.data || []).map(transformMenuItem));
      }
    } catch (error) {}
  };

  const getTableList = async () => {
    try {
      const result = await getAction(API.GET_TABLE_LIST);
      if (result?.statusCode === 200) {
        setTableData((result.data || []).map(transformTable));
      }
    } catch (error) {}
  };

  // Active order groups for the selected table — lets a waiter attach the
  // cart to one family's group instead of billing the whole table, the same
  // way the staff "Order Groups" modal splits a shared table into separate
  // parties/bills (app/dashboard/tables/TableManage/TableGroups.js).
  const getTableGroups = async (tableId) => {
    if (!tableId) {
      setTableGroups([]);
      return;
    }
    try {
      const result = await getAction(
        `${API.GET_TABLE_SESSION_GROUPS}/${tableId}/staff`,
        {},
      );
      if (result?.statusCode === 200) {
        const active = (result.data.groups || []).filter((g) =>
          ["ordering", "placed"].includes(g.status),
        );
        setTableGroups(active);
      } else {
        setTableGroups([]);
      }
    } catch {
      setTableGroups([]);
    }
  };

  useEffect(() => {
    setSelectedGroupId("");
    setGroupFormOpen(false);
    getTableGroups(selectedTable?.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTable?.id]);

  const createSplitGroup = async () => {
    if (!selectedTable?.id) return;
    setCreatingGroup(true);
    try {
      const result = await action(
        `${API.CREATE_TABLE_SESSION_GROUP}/${selectedTable.id}/staff/groups`,
        {
          guestCount: Number(newGroupGuestCount) || 1,
          groupLabel: newGroupLabel || undefined,
        },
      );
      if (result?.statusCode === 201 || result?.statusCode === 200) {
        message.success(
          `${result.data.groupLabel} created — code ${result.data.groupCode}`,
        );
        setNewGroupLabel("");
        setNewGroupGuestCount(2);
        setGroupFormOpen(false);
        await getTableGroups(selectedTable.id);
        setSelectedGroupId(result.data.groupId);
      } else {
        message.error(result?.message || "Unable to create group");
      }
    } catch {
      message.error("Unable to create group");
    } finally {
      setCreatingGroup(false);
    }
  };

  const handleView = (_id, row) => {
    setSelectedOrder(row);
    setViewDrawerOpen(true);
  };

  /* ── cart logic ── */
  const addToCart = (item) => {
    setCart((prev) => {
      const exists = prev.find((c) => c.id === item.id);
      if (exists)
        return prev.map((c) =>
          c.id === item.id ? { ...c, qty: c.qty + 1 } : c,
        );
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const increaseQty = (id) =>
    setCart((prev) =>
      prev.map((c) => (c.id === id ? { ...c, qty: c.qty + 1 } : c)),
    );

  const decreaseQty = (id) =>
    setCart((prev) => {
      const item = prev.find((c) => c.id === id);
      if (item?.qty <= 1) return prev.filter((c) => c.id !== id);
      return prev.map((c) => (c.id === id ? { ...c, qty: c.qty - 1 } : c));
    });

  const removeFromCart = (id) =>
    setCart((prev) => prev.filter((c) => c.id !== id));

  const clearCart = () => setCart([]);

  /* ── derived values ── */
  const categoriesWithCounts = categoryData.map((cat) => ({
    ...cat,
    count:
      cat.id === "all"
        ? menuItemData.length
        : menuItemData.filter((i) => i.categoryId === cat.id).length,
  }));

  const filteredItems = menuItemData.filter((item) => {
    const matchCat =
      activeCategory === "all" || item.categoryId === activeCategory;
    const q = search.toLowerCase();
    const matchSearch =
      item.name.toLowerCase().includes(q) ||
      item.desc.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const cartCount = cart.reduce((s, c) => s + c.qty, 0);
  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const tax = Math.round(subtotal * 0.05);
  const serviceCharge = Math.round(subtotal * 0.02);
  const grandTotal = subtotal + tax + serviceCharge;

  /* ── bill helpers ── */
  const buildBillNo = () => {
    const datePart = new Date().toISOString().slice(0, 10).replaceAll("-", "");
    return `BILL-${datePart}-${Math.floor(1000 + Math.random() * 9000)}`;
  };

  const buildBillPayload = ({ mode = "complete" } = {}) => {
    const restaurantId = getRestaurantId();
    const branchId = getDefaultBranchId();
    const TAX_RATE = 5;
    const selectedGroup = tableGroups.find(
      (g) => g.groupId === selectedGroupId,
    );

    return {
      restaurantId,
      branchId,
      billNo: buildBillNo(),
      orderType: "dine-in",
      tableId: selectedTable?.id,
      ...(selectedGroup
        ? { groupId: selectedGroup.groupId, groupLabel: selectedGroup.groupLabel }
        : {}),
      items: cart.map((item) => {
        const lineSubtotal = item.price * item.qty;
        return {
          menuItemId: item.id,
          itemName: item.name,
          quantity: Number(item.qty),
          price: roundAmount(item.price),
          taxAmount: roundAmount(lineSubtotal * (TAX_RATE / 100)),
          total: roundAmount(lineSubtotal),
        };
      }),
      taxRate: TAX_RATE,
      orderType: "dine_in",
      discount: 0,
      note: selectedTable ? `Order for ${selectedTable.name}` : "Dine-in order",
      subTotal: roundAmount(subtotal),
      taxTotal: roundAmount(tax),
      discountTotal: 0,
      grandTotal: roundAmount(grandTotal),
      payments:
        mode === "complete"
          ? [
              {
                method: paymentMethod,
                amount: roundAmount(grandTotal),
                paidAt: new Date(),
              },
            ]
          : [],
      paymentStatus: mode === "complete" ? "paid" : "pending",
      status:
        mode === "kot" ? "pending" : mode === "razorpay" ? "held" : "completed",
      createdBy: getUserId(),
    };
  };

  const validateBill = () => {
    if (!getRestaurantId() || !getDefaultBranchId()) {
      message.error("Restaurant and branch details are required.");
      return false;
    }
    if (!selectedTable) {
      message.error("Please select a table.");
      return false;
    }
    if (tableGroups.length >= 2 && !selectedGroupId) {
      message.error(
        "This table is split — select which group this order is for.",
      );
      return false;
    }
    if (!cart.length) {
      message.error("Please add at least one item.");
      return false;
    }
    return true;
  };

  const printBill = async (billId) => {
    if (!billId) return;
    try {
      await triggerPrint({ endpoint: API.PRINT_BILL, id: billId });
    } catch {
      message.error("Unable to print bill");
    }
  };

  const completeOrder = async () => {
    if (!validateBill()) return;
    setIsSubmitting(true);
    try {
      const result = await action(
        API.CREATE_BILL,
        buildBillPayload({ mode: "complete" }),
        "POST",
      );
      if (result?.statusCode === 200 || result?.statusCode === 201) {
        message.success(result?.message || "Order completed successfully");
        clearCart();
        setSelectedTable(null);
        getOrdersList();
        printBill(result?.data?._id || result?.data?.id);
        return;
      }
      message.error(result?.message || "Unable to complete order");
    } catch {
      message.error("Unable to complete order");
    } finally {
      setIsSubmitting(false);
    }
  };

  const sendToKot = async () => {
    if (!validateBill()) return;
    setIsSendingToKot(true);
    try {
      const result = await action(
        API.CREATE_BILL,
        buildBillPayload({ mode: "kot" }),
        "POST",
      );
      if (result?.statusCode === 200 || result?.statusCode === 201) {
        message.success(result?.message || "Order sent to kitchen");
        clearCart();
        setSelectedTable(null);
        getOrdersList();
        return;
      }
      message.error(result?.message || "Unable to send order to kitchen");
    } catch {
      message.error("Unable to send order to kitchen");
    } finally {
      setIsSendingToKot(false);
    }
  };

  // Holds the bill with no payment recorded yet, then opens the Razorpay
  // link/QR modal — the bill only settles once that modal's polling sees
  // paymentStatus: "paid".
  const payWithRazorpay = async () => {
    if (!validateBill()) return;
    setIsSubmitting(true);
    try {
      const result = await action(
        API.CREATE_BILL,
        buildBillPayload({ mode: "razorpay" }),
        "POST",
      );
      if (result?.statusCode === 200 || result?.statusCode === 201) {
        const bill = result?.data || {};
        setRazorpayModal({
          open: true,
          billId: bill._id || bill.id,
          billNo: bill.billNo,
        });
      } else {
        message.error(result?.message || "Unable to create bill");
      }
    } catch {
      message.error("Unable to create bill");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 lg:h-[calc(100vh-5.5rem)] lg:flex-row lg:overflow-hidden">
      {/* ══════════════════════════════════════════
          LEFT PANEL — menu browsing (70%)
      ══════════════════════════════════════════ */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-[20px] bg-muted/40">
        {/* Sticky top bar */}
        <div className="shrink-0 rounded-t-[20px] bg-card px-5 pt-5 shadow-sm">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search dishes, categories…"
              className="h-11 w-full rounded-xl border border-border bg-muted pl-10 pr-9 text-sm text-foreground placeholder:text-muted-foreground transition-all focus:border-primary focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Category chips */}
          <div className="flex gap-2 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden">
            {categoriesWithCounts.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 capitalize",
                  activeCategory === cat.id
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                    : "bg-muted text-muted-foreground hover:bg-muted/70",
                )}
              >
                <span>{cat.emoji}</span>
                {cat.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                    activeCategory === cat.id
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-card text-muted-foreground shadow-sm",
                  )}
                >
                  {cat.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable menu grid */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="mb-4 text-5xl">🔍</span>
              <p className="text-lg font-semibold text-muted-foreground">
                No items found
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try a different search or category
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  setActiveCategory("all");
                }}
                className="mt-4 rounded-xl bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
              {filteredItems.map((item) => (
                <FoodCard key={item.id} item={item} onAdd={addToCart} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          RIGHT PANEL — order cart (30%)
      ══════════════════════════════════════════ */}
      <div className="flex w-full shrink-0 flex-col overflow-hidden rounded-[20px] border border-border bg-card shadow-xl lg:w-85 xl:w-95">
        {/* Panel header */}
        <div className="shrink-0 border-b border-border px-5 pb-4 pt-2">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground">
                Current Order
              </h2>
              {cartCount > 0 && (
                <p className="text-xs text-muted-foreground">
                  {cartCount} item{cartCount > 1 ? "s" : ""} in cart
                </p>
              )}
            </div>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-destructive/70 transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
                Clear all
              </button>
            )}
          </div>

          {/* Table selector */}
          <div className="relative">
            <button
              onClick={() => setTableOpen((p) => !p)}
              className={cn(
                "flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-sm font-medium transition-all duration-200",
                selectedTable
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : "border-dashed border-border bg-muted text-muted-foreground hover:border-primary/50 hover:bg-primary/5",
              )}
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex h-2 w-2 rounded-full",
                    selectedTable ? "bg-emerald-500" : "bg-muted-foreground/40",
                  )}
                />
                {selectedTable ? (
                  <span>
                    <span className="font-semibold">{selectedTable.name}</span>
                    <span className="ml-1.5 text-xs font-normal text-primary/70">
                      · {selectedTable.seats} seats
                    </span>
                  </span>
                ) : (
                  "Select a table"
                )}
              </div>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform duration-200",
                  tableOpen && "rotate-180",
                )}
              />
            </button>

            {tableOpen && (
              <div className="absolute left-0 right-0 top-full z-30 mt-1.5 overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
                <div className="max-h-56 overflow-y-auto py-1">
                  {tableData.map((t) => (
                    <button
                      key={t.id}
                      disabled={t.status === "occupied"}
                      onClick={() => {
                        setSelectedTable(t);
                        setTableOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center justify-between px-4 py-2.5 text-sm transition-colors",
                        t.status === "occupied" &&
                          "cursor-not-allowed opacity-40",
                        t.status !== "occupied" && "hover:bg-primary/10",
                        selectedTable?.id === t.id &&
                          "bg-primary/10 font-semibold text-primary",
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={cn(
                            "h-2 w-2 rounded-full",
                            t.status === "available" && "bg-emerald-500",
                            t.status === "occupied" && "bg-red-500",
                            t.status === "reserved" && "bg-amber-500",
                          )}
                        />
                        <span className="text-foreground">{t.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {t.seats} seats
                        </span>
                      </div>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize",
                          t.status === "available" &&
                            "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                          t.status === "occupied" &&
                            "bg-red-500/10 text-red-600 dark:text-red-400",
                          t.status === "reserved" &&
                            "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                        )}
                      >
                        {t.status}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Split by group — separate families at one table get separate bills */}
          {selectedTable && (
            <div className="mt-3">
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Split by group
              </p>
              <div className="flex flex-wrap gap-1.5">
                {tableGroups.map((group) => (
                  <button
                    key={group.groupId}
                    onClick={() => setSelectedGroupId(group.groupId)}
                    className={cn(
                      "flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-colors",
                      selectedGroupId === group.groupId
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-muted text-muted-foreground hover:bg-muted/70",
                    )}
                  >
                    <Users className="h-3 w-3" />
                    {group.groupLabel} · {group.guestCount}
                  </button>
                ))}
                <button
                  onClick={() => setGroupFormOpen((v) => !v)}
                  className="rounded-lg border border-dashed border-border px-2.5 py-1 text-[11px] font-semibold text-muted-foreground hover:bg-muted"
                >
                  + Split / New Group
                </button>
              </div>

              {groupFormOpen && (
                <div className="mt-2 flex flex-col gap-2 rounded-lg bg-muted/50 p-2 sm:flex-row sm:items-end">
                  <div className="w-full sm:flex-1">
                    <label className="mb-1 block text-[10px] text-muted-foreground">
                      Guests
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={newGroupGuestCount}
                      onChange={(e) => setNewGroupGuestCount(e.target.value)}
                      className="h-8 w-full rounded-md border border-border bg-card px-2 text-xs outline-none focus:border-primary"
                    />
                  </div>
                  <div className="w-full sm:flex-2">
                    <label className="mb-1 block text-[10px] text-muted-foreground">
                      Label
                    </label>
                    <input
                      value={newGroupLabel}
                      onChange={(e) => setNewGroupLabel(e.target.value)}
                      placeholder="e.g. Family 2"
                      className="h-8 w-full rounded-md border border-border bg-card px-2 text-xs outline-none focus:border-primary"
                    />
                  </div>
                  <button
                    onClick={createSplitGroup}
                    disabled={creatingGroup}
                    className="flex h-8 w-full items-center justify-center gap-1 rounded-md bg-primary px-2.5 text-xs font-semibold text-primary-foreground disabled:opacity-60 sm:w-auto"
                  >
                    {creatingGroup ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Plus className="h-3 w-3" />
                    )}
                    Add
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto px-5">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted text-4xl">
                🛒
              </div>
              <p className="font-semibold text-foreground">Cart is empty</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Pick dishes from the menu to get started
              </p>
            </div>
          ) : (
            <div className="py-1">
              {cart.map((item) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  onIncrease={increaseQty}
                  onDecrease={decreaseQty}
                  onRemove={removeFromCart}
                />
              ))}
            </div>
          )}
        </div>

        {/* Order summary */}
        {cart.length > 0 && (
          <div className="shrink-0 border-t border-border bg-muted/50 px-5 pb-3 pt-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">
                  Subtotal ({cartCount} items)
                </span>
                <span className="font-medium text-foreground">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">GST (5%)</span>
                <span className="font-medium text-foreground">₹{tax}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">
                  Service charge (2%)
                </span>
                <span className="font-medium text-foreground">
                  ₹{serviceCharge}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground text-sm font-semibold">
                  Grand Total
                </span>
                <span className="font-medium text-foreground">
                  ₹{grandTotal}
                </span>
              </div>
            </div>

            {/* Grand total pill */}
            {/* <div className="mt-3 flex items-center justify-between rounded-xl bg-blue-600 px-4 py-3 shadow-md shadow-blue-500/20">
              <span className="text-sm font-semibold text-white">
                Grand Total
              </span>
              <span className="text-xl font-bold text-white">
                ₹{grandTotal}
              </span>
            </div> */}
          </div>
        )}

        {/* Payment method */}
        {cart.length > 0 && (
          <div className="shrink-0 border-t border-border px-5 py-3">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Payment Method
            </p>
            <div className="grid grid-cols-4 gap-1.5">
              {PAYMENT_METHODS.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => setPaymentMethod(id)}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-lg px-1 py-2 text-[10px] font-semibold transition-all duration-200 ",
                    paymentMethod === id
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                      : "bg-muted text-muted-foreground hover:bg-muted/70",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="shrink-0 px-5 pb-2 pt-2">
          {(!selectedTable || !cart.length) && (
            <p className="mb-2 text-center text-xs font-medium text-muted-foreground">
              {!selectedTable ? "Select a table first" : "Add items to order"}
            </p>
          )}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={sendToKot}
              disabled={
                !cart.length || !selectedTable || isSubmitting || isSendingToKot
              }
              className={cn(
                "flex h-12 w-full items-center justify-center gap-2 rounded-2xl border text-sm font-semibold transition-all duration-200 cursor-pointer",
                cart.length && selectedTable
                  ? "border-primary/40 text-primary hover:bg-primary/10"
                  : "cursor-not-allowed border-border bg-muted text-muted-foreground",
              )}
            >
              {isSendingToKot ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <ChefHat className="h-4 w-4" />
                  Send to KOT
                </>
              )}
            </button>

            <button
              onClick={
                paymentMethod === "razorpay" ? payWithRazorpay : completeOrder
              }
              disabled={
                !cart.length || !selectedTable || isSubmitting || isSendingToKot
              }
              className={cn(
                "flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-semibold transition-all duration-200 cursor-pointer",
                cart.length && selectedTable
                  ? "bg-linear-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/35 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/40 active:translate-y-0"
                  : "cursor-not-allowed bg-muted text-muted-foreground",
              )}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : paymentMethod === "razorpay" ? (
                <>
                  <QrCode className="h-4 w-4" />
                  Payment Link
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Complete · ₹{grandTotal}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <RazorpayPaymentModal
        open={razorpayModal.open}
        billId={razorpayModal.billId}
        billNo={razorpayModal.billNo}
        onClose={() =>
          setRazorpayModal({ open: false, billId: null, billNo: "" })
        }
        onPaid={() => {
          setRazorpayModal({ open: false, billId: null, billNo: "" });
          clearCart();
          setSelectedTable(null);
          getOrdersList();
          message.success("Bill paid via Razorpay.");
        }}
      />

      {/* existing view-order drawer */}
      <ViewOrderDetails
        open={viewDrawerOpen}
        close={() => setViewDrawerOpen(false)}
        orderData={selectedOrder}
      />
    </div>
  );
}
