"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Modal, Spin } from "antd";
import { Minus, Plus, ShoppingCart, Users, UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";
import { action, getAction, API } from "@/lib/API";
import { message } from "@/lib/message";
import ButtonClick from "@/components/ui/ButtonClick";

// Statuses that mean a group is still actively ordering/eating — anything
// else (paid/cancelled) shouldn't block a new guest from starting fresh.
const ACTIVE_STATUSES = ["ordering", "placed"];
const roundAmount = (value) => Number((Number(value) || 0).toFixed(2));
const getItemPrice = (item) => Number(item.prices?.dineInPrice || 0);

// Customer-facing page reached by scanning a table's QR code — no staff
// login involved. If the table already has an active group, this shows an
// "occupied" popup offering to join that group (by its 4-digit code) or
// start a separate one, mirroring the staff "Order Groups" flow in
// app/dashboard/tables/TableManage/TableGroups.js.
export default function CustomerOrderPage() {
  const { tableId } = useParams();

  const [loading, setLoading] = useState(true);
  const [table, setTable] = useState(null);
  const [activeGroup, setActiveGroup] = useState(null);

  const [choiceOpen, setChoiceOpen] = useState(false);
  const [mode, setMode] = useState("new");
  const [guestCount, setGuestCount] = useState(2);
  const [groupLabel, setGroupLabel] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [cart, setCart] = useState([]);
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    if (!tableId) return;
    loadTable();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableId]);

  const loadTable = async () => {
    setLoading(true);
    try {
      const [tableResult, groupsResult] = await Promise.all([
        getAction(`${API.GET_TABLE_BY_ID}/${tableId}`, {}),
        getAction(`${API.GET_TABLE_SESSION_GROUPS_PUBLIC}/${tableId}`, {}),
      ]);
      if (tableResult?.statusCode === 200) setTable(tableResult.data);

      const fetchedGroups =
        groupsResult?.statusCode === 200 ? groupsResult.data?.groups || [] : [];
      const hasActiveGroup = fetchedGroups.some((g) =>
        ACTIVE_STATUSES.includes(g.status),
      );
      if (hasActiveGroup) {
        setMode("join");
        setChoiceOpen(true);
      } else {
        setMode("new");
      }
    } catch {
      message.error("Unable to load this table. Please rescan the QR code.");
    } finally {
      setLoading(false);
    }
  };

  const startNewGroup = async () => {
    setSubmitting(true);
    try {
      const result = await action(
        `${API.CREATE_TABLE_SESSION_GROUP_PUBLIC}/${tableId}/groups`,
        { guestCount: Number(guestCount) || 1, groupLabel: groupLabel || undefined },
      );
      if (result?.statusCode === 201 || result?.statusCode === 200) {
        setActiveGroup(result.data);
        setChoiceOpen(false);
        message.success(`Order started — your code is ${result.data.groupCode}`);
      } else {
        message.error(result?.message || "Unable to start your order");
      }
    } catch {
      message.error("Unable to start your order");
    } finally {
      setSubmitting(false);
    }
  };

  const joinGroup = async () => {
    if (joinCode.length !== 4) {
      message.error("Enter the 4-digit code");
      return;
    }
    setSubmitting(true);
    try {
      const result = await action(
        `${API.JOIN_TABLE_SESSION_GROUP}/${tableId}/groups/join`,
        { groupCode: joinCode },
      );
      if (result?.statusCode === 200 || result?.statusCode === 201) {
        setActiveGroup(result.data);
        setChoiceOpen(false);
        message.success(`Joined ${result.data.groupLabel}`);
      } else {
        message.error(result?.message || "Invalid code — check with your table");
      }
    } catch {
      message.error("Unable to join that group");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!activeGroup || !table) return;
    loadMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeGroup, table]);

  const loadMenu = async () => {
    try {
      // Explicit query params (rather than the logged-out-empty localStorage
      // scope that getAction/action fall back to) so the menu is scoped to
      // this table's restaurant/branch even with no staff session.
      const scope = `restaurantId=${table.restaurantId}&branchId=${table.branchId}`;
      const [catResult, itemResult] = await Promise.all([
        getAction(`${API.GET_CATEGORY_LIST}?${scope}`, {}),
        action(API.GET_MENU_ITEM_LIST, {
          restaurantId: table.restaurantId,
          branchId: table.branchId,
        }),
      ]);
      if (catResult?.statusCode === 200) {
        setCategories([
          { _id: "all", categoryName: "All Items" },
          ...(catResult.data || []),
        ]);
      }
      if (itemResult?.statusCode === 200) setMenuItems(itemResult.data || []);
    } catch {
      message.error("Unable to load the menu");
    }
  };

  const filteredItems = useMemo(
    () =>
      menuItems.filter(
        (item) =>
          selectedCategory === "all" || item.categoryId?._id === selectedCategory,
      ),
    [menuItems, selectedCategory],
  );

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((c) => c._id === item._id);
      if (existing) {
        return prev.map((c) =>
          c._id === item._id ? { ...c, quantity: c.quantity + 1 } : c,
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart((prev) =>
      prev
        .map((c) => (c._id === id ? { ...c, quantity: c.quantity + delta } : c))
        .filter((c) => c.quantity > 0),
    );
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + getItemPrice(item) * item.quantity,
    0,
  );

  const placeOrder = async () => {
    if (!cart.length) {
      message.error("Add at least one item first");
      return;
    }
    setPlacingOrder(true);
    try {
      const result = await action(
        `${API.PLACE_GROUP_ORDER}/${tableId}/groups/${activeGroup.groupId}/order`,
        {
          items: cart.map((item) => ({
            menuItemId: item._id,
            itemName: item.itemName,
            quantity: item.quantity,
            price: roundAmount(getItemPrice(item)),
            total: roundAmount(getItemPrice(item) * item.quantity),
          })),
        },
      );
      if (result?.statusCode === 200 || result?.statusCode === 201) {
        message.success("Order placed — the kitchen has it.");
        setCart([]);
      } else {
        message.error(result?.message || "Unable to place your order");
      }
    } catch {
      message.error("Unable to place your order");
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spin size="large" />
      </div>
    );
  }

  if (!table) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-background px-6 text-center">
        <h1 className="text-lg font-semibold">Table not found</h1>
        <p className="text-sm text-muted-foreground">
          Please rescan the QR code on your table.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="border-b border-border bg-white dark:bg-card px-4 py-4">
        <p className="text-xs text-muted-foreground">Table {table.tableNumber}</p>
        <h1 className="text-xl font-bold">{table.tableName}</h1>
        {activeGroup && (
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            {activeGroup.groupLabel} · code{" "}
            <span className="font-mono font-semibold text-foreground">
              {activeGroup.groupCode}
            </span>
          </p>
        )}
      </div>

      {!activeGroup ? (
        <div className="mx-auto max-w-md px-4 py-8">
          <StartGroupForm
            mode={mode}
            setMode={setMode}
            guestCount={guestCount}
            setGuestCount={setGuestCount}
            groupLabel={groupLabel}
            setGroupLabel={setGroupLabel}
            joinCode={joinCode}
            setJoinCode={setJoinCode}
            submitting={submitting}
            onStart={startNewGroup}
            onJoin={joinGroup}
          />
        </div>
      ) : (
        <>
          <div className="flex gap-2 overflow-x-auto px-4 py-3">
            {categories.map((category) => (
              <button
                key={category._id}
                onClick={() => setSelectedCategory(category._id)}
                className={cn(
                  "whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium",
                  selectedCategory === category._id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {category.categoryName}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 px-4 pb-4">
            {filteredItems.length === 0 && (
              <div className="col-span-2 flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
                <UtensilsCrossed className="mb-2 h-6 w-6" />
                No items in this category yet.
              </div>
            )}
            {filteredItems.map((item) => {
              const inCart = cart.find((c) => c._id === item._id);
              return (
                <button
                  key={item._id}
                  onClick={() => addToCart(item)}
                  className="relative rounded-xl bg-white dark:bg-card p-3 text-left shadow-sm"
                >
                  {inCart && (
                    <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                      {inCart.quantity}
                    </span>
                  )}
                  <p className="text-sm font-medium">{item.itemName}</p>
                  <p className="mt-1 text-sm font-semibold">
                    ₹{getItemPrice(item).toFixed(2)}
                  </p>
                </button>
              );
            })}
          </div>

          {cart.length > 0 && (
            <div className="fixed inset-x-0 bottom-0 border-t border-border bg-white dark:bg-card p-4 shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
              <div className="mx-auto max-w-md">
                <div className="mb-3 max-h-40 space-y-2 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item._id} className="flex items-center justify-between gap-2 text-sm">
                      <span className="min-w-0 flex-1 truncate">{item.itemName}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item._id, -1)}
                          className="rounded-md bg-muted p-1"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-5 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item._id, 1)}
                          className="rounded-md bg-muted p-1"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <ButtonClick
                  BtnType="primary"
                  buttonName={`Place Order · ₹${subtotal.toFixed(2)}`}
                  icon={<ShoppingCart className="h-4 w-4" />}
                  loading={placingOrder}
                  handleSubmit={placeOrder}
                  className="w-full !justify-center"
                />
              </div>
            </div>
          )}
        </>
      )}

      {/* Occupied-table popup — blocks the page until the guest joins the
          existing group or explicitly starts a separate one. */}
      <Modal
        open={choiceOpen}
        closable={false}
        maskClosable={false}
        footer={null}
        centered
        title="This table already has an order in progress"
      >
        <p className="mb-4 text-sm text-muted-foreground">
          Someone at this table already started ordering. Join their group with
          the code they were given, or start your own separate order and bill.
        </p>
        <StartGroupForm
          mode={mode}
          setMode={setMode}
          guestCount={guestCount}
          setGuestCount={setGuestCount}
          groupLabel={groupLabel}
          setGroupLabel={setGroupLabel}
          joinCode={joinCode}
          setJoinCode={setJoinCode}
          submitting={submitting}
          onStart={startNewGroup}
          onJoin={joinGroup}
        />
      </Modal>
    </div>
  );
}

function StartGroupForm({
  mode,
  setMode,
  guestCount,
  setGuestCount,
  groupLabel,
  setGroupLabel,
  joinCode,
  setJoinCode,
  submitting,
  onStart,
  onJoin,
}) {
  return (
    <div>
      <div className="mb-4 flex rounded-lg bg-muted p-1 text-sm font-medium">
        <button
          onClick={() => setMode("new")}
          className={cn(
            "flex-1 rounded-md py-2",
            mode === "new" && "bg-white dark:bg-card shadow",
          )}
        >
          Start New Order
        </button>
        <button
          onClick={() => setMode("join")}
          className={cn(
            "flex-1 rounded-md py-2",
            mode === "join" && "bg-white dark:bg-card shadow",
          )}
        >
          Join with Code
        </button>
      </div>

      {mode === "join" ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Ask your table for the 4-digit code shown on their screen.
          </p>
          <input
            value={joinCode}
            onChange={(e) =>
              setJoinCode(e.target.value.replace(/\D/g, "").slice(0, 4))
            }
            placeholder="1234"
            inputMode="numeric"
            className="h-12 w-full rounded-lg border border-border px-3 text-center text-2xl font-mono tracking-[0.5em] outline-none focus:border-primary"
          />
          <ButtonClick
            BtnType="primary"
            buttonName="Join Group"
            loading={submitting}
            handleSubmit={onJoin}
            className="w-full !justify-center"
          />
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              Guests
            </label>
            <input
              type="number"
              min={1}
              value={guestCount}
              onChange={(e) => setGuestCount(e.target.value)}
              className="h-11 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              Your name (optional)
            </label>
            <input
              value={groupLabel}
              onChange={(e) => setGroupLabel(e.target.value)}
              placeholder="e.g. Priya's family"
              className="h-11 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <ButtonClick
            BtnType="primary"
            buttonName="Start Ordering"
            loading={submitting}
            handleSubmit={onStart}
            className="w-full !justify-center"
          />
        </div>
      )}
    </div>
  );
}
