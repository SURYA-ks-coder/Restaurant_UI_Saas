"use client";

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
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { API, getAction } from "@/lib/API";
import ViewOrderDetails from "./OrdersDetails.js/ViewOrderDetails";

/* ─── static placeholder data (design only) ──────────────────────────────── */

const CATEGORIES = [
  { id: "all", label: "All Items", count: 24, emoji: "🍽️" },
  { id: "starters", label: "Starters", count: 6, emoji: "🥗" },
  { id: "main", label: "Main Course", count: 8, emoji: "🍛" },
  { id: "biryani", label: "Biryani", count: 4, emoji: "🫕" },
  { id: "breads", label: "Breads", count: 4, emoji: "🫓" },
  { id: "desserts", label: "Desserts", count: 4, emoji: "🍮" },
  { id: "drinks", label: "Drinks", count: 4, emoji: "🥤" },
];

const TABLES = [
  { id: "t1", name: "Table 01", status: "available", seats: 2 },
  { id: "t2", name: "Table 02", status: "occupied", seats: 4 },
  { id: "t3", name: "Table 03", status: "available", seats: 4 },
  { id: "t4", name: "Table 04", status: "reserved", seats: 6 },
  { id: "t5", name: "Table 05", status: "available", seats: 2 },
  { id: "t6", name: "Table 06", status: "occupied", seats: 8 },
  { id: "t7", name: "Table 07", status: "available", seats: 4 },
  { id: "t8", name: "Table 08", status: "available", seats: 6 },
];

const MENU_ITEMS = [
  {
    id: "1",
    name: "Paneer Tikka",
    desc: "Smoked cottage cheese with spices",
    price: 240,
    time: 15,
    category: "starters",
    veg: true,
    popular: true,
    emoji: "🧀",
    bg: "from-orange-400/70 to-red-500/70",
  },
  {
    id: "2",
    name: "Chicken Wings",
    desc: "Crispy wings with hot sauce",
    price: 320,
    time: 20,
    category: "starters",
    veg: false,
    popular: true,
    emoji: "🍗",
    bg: "from-amber-400/70 to-orange-600/70",
  },
  {
    id: "3",
    name: "Spring Rolls",
    desc: "Crispy vegetable filled rolls",
    price: 160,
    time: 12,
    category: "starters",
    veg: true,
    popular: false,
    emoji: "🥟",
    bg: "from-yellow-300/70 to-amber-500/70",
  },
  {
    id: "4",
    name: "Seekh Kebab",
    desc: "Minced meat on skewers",
    price: 280,
    time: 18,
    category: "starters",
    veg: false,
    popular: true,
    emoji: "🍢",
    bg: "from-red-400/70 to-rose-600/70",
  },
  {
    id: "5",
    name: "Mushroom Tikka",
    desc: "Button mushrooms in spiced marinade",
    price: 200,
    time: 15,
    category: "starters",
    veg: true,
    popular: false,
    emoji: "🍄",
    bg: "from-stone-400/70 to-stone-700/70",
  },
  {
    id: "6",
    name: "Veg Platter",
    desc: "Assorted vegetarian starters",
    price: 350,
    time: 25,
    category: "starters",
    veg: true,
    popular: false,
    emoji: "🥘",
    bg: "from-lime-400/70 to-green-600/70",
  },
  {
    id: "7",
    name: "Butter Chicken",
    desc: "Creamy tomato-based chicken curry",
    price: 380,
    time: 25,
    category: "main",
    veg: false,
    popular: true,
    emoji: "🍲",
    bg: "from-orange-500/70 to-red-600/70",
  },
  {
    id: "8",
    name: "Dal Makhani",
    desc: "Slow-cooked black lentils in cream",
    price: 280,
    time: 30,
    category: "main",
    veg: true,
    popular: true,
    emoji: "🫘",
    bg: "from-amber-600/70 to-red-700/70",
  },
  {
    id: "9",
    name: "Paneer Butter Masala",
    desc: "Cottage cheese in rich tomato gravy",
    price: 300,
    time: 20,
    category: "main",
    veg: true,
    popular: false,
    emoji: "🧀",
    bg: "from-orange-400/70 to-amber-600/70",
  },
  {
    id: "10",
    name: "Fish Curry",
    desc: "Coastal style spiced fish curry",
    price: 420,
    time: 25,
    category: "main",
    veg: false,
    popular: false,
    emoji: "🐟",
    bg: "from-teal-400/70 to-cyan-600/70",
  },
  {
    id: "11",
    name: "Mutton Rogan Josh",
    desc: "Kashmiri spiced mutton curry",
    price: 480,
    time: 40,
    category: "main",
    veg: false,
    popular: true,
    emoji: "🍖",
    bg: "from-red-600/70 to-rose-800/70",
  },
  {
    id: "12",
    name: "Palak Paneer",
    desc: "Cottage cheese in spinach gravy",
    price: 270,
    time: 20,
    category: "main",
    veg: true,
    popular: false,
    emoji: "🥬",
    bg: "from-green-500/70 to-emerald-700/70",
  },
  {
    id: "13",
    name: "Chicken Biryani",
    desc: "Fragrant basmati with tender chicken",
    price: 380,
    time: 35,
    category: "biryani",
    veg: false,
    popular: true,
    emoji: "🫕",
    bg: "from-yellow-500/70 to-amber-700/70",
  },
  {
    id: "14",
    name: "Veg Biryani",
    desc: "Aromatic rice with mixed vegetables",
    price: 280,
    time: 30,
    category: "biryani",
    veg: true,
    popular: false,
    emoji: "🌾",
    bg: "from-green-500/70 to-emerald-700/70",
  },
  {
    id: "15",
    name: "Hyderabadi Biryani",
    desc: "Authentic dum-cooked biryani",
    price: 420,
    time: 40,
    category: "biryani",
    veg: false,
    popular: true,
    emoji: "🍚",
    bg: "from-amber-500/70 to-yellow-700/70",
  },
  {
    id: "16",
    name: "Prawn Biryani",
    desc: "Spiced rice with tiger prawns",
    price: 450,
    time: 40,
    category: "biryani",
    veg: false,
    popular: false,
    emoji: "🦐",
    bg: "from-pink-400/70 to-rose-600/70",
  },
  {
    id: "17",
    name: "Butter Naan",
    desc: "Soft leavened bread with butter",
    price: 50,
    time: 8,
    category: "breads",
    veg: true,
    popular: true,
    emoji: "🫓",
    bg: "from-yellow-300/70 to-orange-400/70",
  },
  {
    id: "18",
    name: "Garlic Naan",
    desc: "Naan with garlic and herbs",
    price: 60,
    time: 8,
    category: "breads",
    veg: true,
    popular: false,
    emoji: "🧄",
    bg: "from-lime-400/70 to-green-600/70",
  },
  {
    id: "19",
    name: "Tandoori Roti",
    desc: "Whole wheat bread from tandoor",
    price: 40,
    time: 6,
    category: "breads",
    veg: true,
    popular: false,
    emoji: "🫓",
    bg: "from-amber-300/70 to-yellow-600/70",
  },
  {
    id: "20",
    name: "Peshwari Naan",
    desc: "Stuffed with nuts and coconut",
    price: 80,
    time: 10,
    category: "breads",
    veg: true,
    popular: false,
    emoji: "🌰",
    bg: "from-amber-400/70 to-yellow-700/70",
  },
  {
    id: "21",
    name: "Gulab Jamun",
    desc: "Soft milk dumplings in rose syrup",
    price: 120,
    time: 5,
    category: "desserts",
    veg: true,
    popular: true,
    emoji: "🍮",
    bg: "from-pink-400/70 to-rose-600/70",
  },
  {
    id: "22",
    name: "Rasmalai",
    desc: "Soft chenna dumplings in cream",
    price: 140,
    time: 5,
    category: "desserts",
    veg: true,
    popular: false,
    emoji: "🍵",
    bg: "from-yellow-200/70 to-amber-400/70",
  },
  {
    id: "23",
    name: "Ice Cream",
    desc: "Seasonal flavors, house-made",
    price: 160,
    time: 3,
    category: "desserts",
    veg: true,
    popular: true,
    emoji: "🍨",
    bg: "from-sky-300/70 to-blue-500/70",
  },
  {
    id: "24",
    name: "Gajar Halwa",
    desc: "Warm carrot pudding with nuts",
    price: 130,
    time: 5,
    category: "desserts",
    veg: true,
    popular: false,
    emoji: "🥕",
    bg: "from-orange-300/70 to-amber-500/70",
  },
  {
    id: "25",
    name: "Mango Lassi",
    desc: "Fresh mango blended with yogurt",
    price: 120,
    time: 5,
    category: "drinks",
    veg: true,
    popular: true,
    emoji: "🥭",
    bg: "from-yellow-400/70 to-orange-500/70",
  },
  {
    id: "26",
    name: "Masala Chai",
    desc: "Spiced Indian milk tea",
    price: 60,
    time: 5,
    category: "drinks",
    veg: true,
    popular: true,
    emoji: "☕",
    bg: "from-amber-700/70 to-yellow-900/70",
  },
  {
    id: "27",
    name: "Fresh Lime Soda",
    desc: "Refreshing lime with soda",
    price: 80,
    time: 3,
    category: "drinks",
    veg: true,
    popular: false,
    emoji: "🍋",
    bg: "from-lime-400/70 to-green-600/70",
  },
  {
    id: "28",
    name: "Cold Coffee",
    desc: "Chilled coffee with cream",
    price: 140,
    time: 5,
    category: "drinks",
    veg: true,
    popular: false,
    emoji: "🧋",
    bg: "from-amber-500/70 to-stone-700/70",
  },
];

const PAYMENT_METHODS = [
  { id: "cash", label: "Cash", Icon: Banknote },
  { id: "card", label: "Card", Icon: CreditCard },
  { id: "upi", label: "UPI", Icon: Smartphone },
  { id: "wallet", label: "Wallet", Icon: Wallet },
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
    <div className="group relative flex flex-col overflow-hidden rounded-[20px] bg-white shadow-sm ring-1 ring-gray-100/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-blue-100">
      {/* Image area */}
      <div
        className={cn(
          "relative flex h-44 items-center justify-center overflow-hidden bg-linear-to-br",
          item.bg,
        )}
      >
        <span className="text-[64px] leading-none drop-shadow-lg transition-transform duration-300 group-hover:scale-110">
          {item.emoji}
        </span>

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
          className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-all duration-200 hover:scale-110 hover:bg-blue-700 active:scale-95"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {/* Card body */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-1.5">
          <VegDot veg={item.veg} />
          <h3 className="truncate font-semibold leading-snug text-gray-900">
            {item.name}
          </h3>
        </div>
        <p className="mt-0.5 line-clamp-1 text-xs leading-relaxed text-gray-400">
          {item.desc}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">₹{item.price}</span>
          <span className="flex items-center gap-1 text-xs text-gray-400">
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
    <div className="flex items-center gap-3 border-b border-gray-100 py-3 last:border-0">
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
        <p className="truncate text-sm font-semibold text-gray-900">
          {item.name}
        </p>
        <p className="text-xs text-gray-400">₹{item.price} each</p>
      </div>

      {/* Qty control */}
      <div className="flex items-center gap-1 rounded-xl bg-gray-50 p-1">
        <button
          onClick={() => onDecrease(item.id)}
          className="flex h-6 w-6 items-center justify-center rounded-lg bg-white text-gray-500 shadow-sm transition-colors hover:bg-red-50 hover:text-red-500"
        >
          <Minus className="h-3 w-3" />
        </button>
        <span className="w-5 text-center text-sm font-bold tabular-nums text-gray-900">
          {item.qty}
        </span>
        <button
          onClick={() => onIncrease(item.id)}
          className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm transition-colors hover:bg-blue-700"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>

      {/* Price + remove */}
      <div className="min-w-13 text-right">
        <p className="text-sm font-bold text-gray-900">
          ₹{item.price * item.qty}
        </p>
        <button
          onClick={() => onRemove(item.id)}
          className="text-[11px] text-red-400 transition-colors hover:text-red-600"
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
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ── existing API ── */
  useEffect(() => {
    getOrdersList();
  }, []);

  const getOrdersList = async () => {
    try {
      const result = await getAction(API.GET_BILL_LIST, {});
      if (result?.statusCode === 200) {
        setOrdersData(result?.data || []);
      }
    } catch (error) {}
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
  const filteredItems = MENU_ITEMS.filter((item) => {
    const matchCat =
      activeCategory === "all" || item.category === activeCategory;
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

  /* ── submit handler (design only – no API call added) ── */
  const handleCompleteOrder = async () => {
    if (!cart.length || !selectedTable) return;
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsSubmitting(false);
    clearCart();
    setSelectedTable(null);
  };

  return (
    <div className="flex h-[calc(100vh-5.5rem)] gap-5 overflow-hidden">
      {/* ══════════════════════════════════════════
          LEFT PANEL — menu browsing (70%)
      ══════════════════════════════════════════ */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-[20px] bg-[#F8FAFC]">
        {/* Sticky top bar */}
        <div className="shrink-0 rounded-t-[20px] bg-white px-5 pt-5 shadow-sm">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search dishes, categories…"
              className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-9 text-sm text-gray-900 placeholder:text-gray-400 transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Category chips */}
          <div className="flex gap-2 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200",
                  activeCategory === cat.id
                    ? "bg-linear-to-r from-blue-700 to-blue-500 text-white shadow-md shadow-blue-500/30"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200",
                )}
              >
                <span>{cat.emoji}</span>
                {cat.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                    activeCategory === cat.id
                      ? "bg-white/20 text-white"
                      : "bg-white text-gray-500 shadow-sm",
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
              <p className="text-lg font-semibold text-gray-600">
                No items found
              </p>
              <p className="mt-1 text-sm text-gray-400">
                Try a different search or category
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  setActiveCategory("all");
                }}
                className="mt-4 rounded-xl bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100"
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
      <div className="flex w-85 shrink-0 flex-col overflow-hidden rounded-[20px] border border-gray-100 bg-white shadow-xl xl:w-95">
        {/* Panel header */}
        <div className="shrink-0 border-b border-gray-100 px-5 pb-4 pt-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Current Order
              </h2>
              {cartCount > 0 && (
                <p className="text-xs text-gray-400">
                  {cartCount} item{cartCount > 1 ? "s" : ""} in cart
                </p>
              )}
            </div>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-50 hover:text-red-600"
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
                  ? "border-blue-400/50 bg-blue-50 text-blue-900"
                  : "border-dashed border-gray-300 bg-gray-50 text-gray-500 hover:border-blue-400 hover:bg-blue-50/50",
              )}
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex h-2 w-2 rounded-full",
                    selectedTable ? "bg-emerald-500" : "bg-gray-300",
                  )}
                />
                {selectedTable ? (
                  <span>
                    <span className="font-semibold">{selectedTable.name}</span>
                    <span className="ml-1.5 text-xs font-normal text-blue-500">
                      · {selectedTable.seats} seats
                    </span>
                  </span>
                ) : (
                  "Select a table"
                )}
              </div>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-gray-400 transition-transform duration-200",
                  tableOpen && "rotate-180",
                )}
              />
            </button>

            {tableOpen && (
              <div className="absolute left-0 right-0 top-full z-30 mt-1.5 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-2xl">
                <div className="max-h-56 overflow-y-auto py-1">
                  {TABLES.map((t) => (
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
                        t.status !== "occupied" && "hover:bg-blue-50",
                        selectedTable?.id === t.id &&
                          "bg-blue-50 font-semibold text-blue-700",
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
                        <span className="text-gray-800">{t.name}</span>
                        <span className="text-xs text-gray-400">
                          {t.seats} seats
                        </span>
                      </div>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize",
                          t.status === "available" &&
                            "bg-emerald-50 text-emerald-700",
                          t.status === "occupied" && "bg-red-50 text-red-700",
                          t.status === "reserved" &&
                            "bg-amber-50 text-amber-700",
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
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto px-5">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-50 text-4xl">
                🛒
              </div>
              <p className="font-semibold text-gray-600">Cart is empty</p>
              <p className="mt-1 text-xs text-gray-400">
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
          <div className="shrink-0 border-t border-gray-100 bg-gray-50/60 px-5 pb-3 pt-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">
                  Subtotal ({cartCount} items)
                </span>
                <span className="font-medium text-gray-800">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">GST (5%)</span>
                <span className="font-medium text-gray-800">₹{tax}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Service charge (2%)</span>
                <span className="font-medium text-gray-800">
                  ₹{serviceCharge}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 text-xl font-semibold">
                  Grand Total
                </span>
                <span className="font-medium text-gray-800">₹{grandTotal}</span>
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
          <div className="shrink-0 border-t border-gray-100 px-5 py-3">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
              Payment Method
            </p>
            <div className="grid grid-cols-4 gap-1.5">
              {PAYMENT_METHODS.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => setPaymentMethod(id)}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-xl px-1 py-2.5 text-xs font-semibold transition-all duration-200",
                    paymentMethod === id
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200",
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
        <div className="shrink-0 px-5 pb-5 pt-2">
          <button
            onClick={handleCompleteOrder}
            disabled={!cart.length || !selectedTable || isSubmitting}
            className={cn(
              "flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-semibold text-white transition-all duration-200",
              cart.length && selectedTable
                ? "bg-linear-to-r from-blue-700 to-blue-500 shadow-lg shadow-blue-500/35 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/40 active:translate-y-0"
                : "cursor-not-allowed bg-gray-200 text-gray-400",
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing…
              </>
            ) : !selectedTable ? (
              "Select a table first"
            ) : !cart.length ? (
              "Add items to order"
            ) : (
              <>
                <Check className="h-4 w-4" />
                Complete Order · ₹{grandTotal}
              </>
            )}
          </button>
        </div>
      </div>

      {/* existing view-order drawer */}
      <ViewOrderDetails
        open={viewDrawerOpen}
        close={() => setViewDrawerOpen(false)}
        orderData={selectedOrder}
      />
    </div>
  );
}
