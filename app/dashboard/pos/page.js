"use client";

import { useEffect, useState } from "react";
import {
  Banknote,
  CreditCard,
  Minus,
  Plus,
  Search,
  Smartphone,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { API, action, getAction } from "@/lib/API";
import { AntInput } from "@/components/ui/AntInput";
import { Dropdown, message } from "antd";

const roundAmount = (value) => Number((Number(value) || 0).toFixed(2));

const parseStoredValue = (key) => {
  if (typeof window === "undefined") {
    return "";
  }

  const value = localStorage.getItem(key);

  if (!value) {
    return "";
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    return value;
  }
};

const getEntityId = (value) => {
  if (Array.isArray(value)) {
    return getEntityId(value[0]);
  }

  if (value && typeof value === "object") {
    return value._id || value.id || "";
  }

  return value || "";
};

const getBranchId = () =>
  getEntityId(
    parseStoredValue("branchId") ||
      parseStoredValue("defaultBranchId") ||
      parseStoredValue("branchIds") ||
      parseStoredValue("branchIds"),
  );

const getItemPrice = (item) => Number(item.prices?.dineInPrice || 0);

export default function POSPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState([]);
  const [menuItemData, setMenuItemData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [selectedTableId, setSelectedTableId] = useState("");
  const [gstRate, setGstRate] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((cartItem) => cartItem._id === item._id);
      if (existing) {
        return prev.map((cartItem) =>
          cartItem._id === item._id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem,
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item._id === id ? { ...item, quantity: item.quantity + delta } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const removeFromCart = (id) =>
    setCart((prev) => prev.filter((item) => item._id !== id));

  const subtotal = cart.reduce(
    (sum, item) => sum + getItemPrice(item) * item.quantity,
    0,
  );
  const tax = subtotal * ((Number(gstRate) || 0) / 100);
  const total = subtotal + tax;
  const selectedTable = tableData.find(
    (table) => table._id === selectedTableId,
  );

  useEffect(() => {
    getCategoryList();
    getTableList();
  }, []);

  const getCategoryList = async () => {
    try {
      const result = await getAction(API.GET_CATEGORY_LIST, {});
      if (result.statusCode === 200) {
        setCategoryData([
          { _id: "all", categoryName: "All Items" },
          ...result.data,
        ]);
      }
    } catch (error) {}
  };

  const getMenuItemList = async () => {
    try {
      const result = await action(API.GET_MENU_ITEM_LIST, {
        restaurantId: getEntityId(parseStoredValue("restaurantId")),
        branchId: getBranchId(),
      });
      if (result?.statusCode === 200) {
        setMenuItemData(
          result?.data?.map((item) => ({
            ...item,
            image:
              "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500",
          })) || [],
        );
      }
    } catch (error) {}
  };

  const filteredItems = menuItemData.filter((item) => {
    const matchesCategory =
      selectedCategory === "all" || item.categoryId?._id === selectedCategory;
    const matchesSearch = item.itemName
      ?.toLowerCase()
      ?.includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getTableList = async () => {
    try {
      const result = await getAction(API.GET_TABLE_LIST, {});
      if (result?.statusCode === 200) {
        // Handle table data if needed
        setTableData(result?.data || []);
      }
    } catch (error) {}
  };

  useEffect(() => {
    getMenuItemList();
  }, []);

  const buildBillNo = () => {
    const datePart = new Date().toISOString().slice(0, 10).replaceAll("-", "");
    const randomPart = Math.floor(1000 + Math.random() * 9000);

    return `BILL-${datePart}-${randomPart}`;
  };

  const buildBillPayload = () => {
    const restaurantId = getEntityId(parseStoredValue("restaurantId"));
    const branchId = getBranchId();
    const userData = parseStoredValue("userData");
    const taxRate = Number(gstRate) || 0;

    return {
      restaurantId,
      branchId,
      billNo: buildBillNo(),
      orderType: "qr",
      tableId: selectedTableId,
      items: cart.map((item) => {
        const price = getItemPrice(item);
        const lineSubtotal = price * item.quantity;

        return {
          menuItemId: item._id,
          itemName: item.itemName,
          quantity: Number(item.quantity),
          price: roundAmount(price),
          taxAmount: roundAmount(lineSubtotal * (taxRate / 100)),
          total: roundAmount(lineSubtotal),
        };
      }),
      taxRate,
      discount: 0,
      note: selectedTable
        ? `POS billing for ${selectedTable.tableName || selectedTable.tableNumber}`
        : "POS billing",
      subTotal: roundAmount(subtotal),
      taxTotal: roundAmount(tax),
      discountTotal: 0,
      grandTotal: roundAmount(total),
      payments: [
        {
          method: paymentMethod,
          amount: roundAmount(total),
          paidAt: new Date(),
        },
      ],
      paymentStatus: "paid",
      status: "completed",
      createdBy: getEntityId(userData),
    };
  };

  const validateBill = () => {
    if (!getEntityId(parseStoredValue("restaurantId")) || !getBranchId()) {
      message.error("Restaurant and branch details are required.");
      return false;
    }

    if (!selectedTableId) {
      message.error("Please select a table.");
      return false;
    }

    if (!cart.length) {
      message.error("Please add at least one item.");
      return false;
    }

    return true;
  };

  const completeOrder = async () => {
    if (!validateBill()) {
      return;
    }

    setIsSubmitting(true);
    const taxRate = Number(gstRate) || 0;
    const payload = {
      restaurantId: selectedTable.restaurantId,
      branchId: selectedTable.branchId,
      tableId: selectedTable._id,
      tableNumber: selectedTable.tableNumber,
      tableName: selectedTable.tableName,
      orderType: selectedTable.orderType,
      customerName: "Surya", //
      items: cart.map((item) => {
        const price = getItemPrice(item);
        const lineSubtotal = price * item.quantity;

        return {
          menuItemId: item._id,
          itemName: item.itemName,
          quantity: Number(item.quantity),
          price: roundAmount(price),
          taxAmount: roundAmount(lineSubtotal * (taxRate / 100)),
          total: roundAmount(lineSubtotal),
        };
      }),

      subTotal: roundAmount(subtotal),
      taxTotal: roundAmount(tax),
      total: roundAmount(total),
    };

    try {
      const result = await action(API.CREATE_BILL, buildBillPayload(), "POST");
      // const result = await action(API.CREATE_QR_ORDER, payload, "POST");

      if (result?.statusCode === 200 || result?.statusCode === 201) {
        message.success(result?.message || "Order completed successfully");
        setCart([]);
        return;
      }

      message.error(result?.message || "Unable to complete order");
    } catch (error) {
      message.error("Unable to complete order");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-[calc(100vh-4rem)] gap-6  lg:grid-cols-[1fr_24rem] ">
      <section>
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative md:w-96">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="pl-10"
              placeholder="Search menu"
            />
          </div>
          <Badge className="w-fit">
            {selectedTable
              ? selectedTable.tableName || `Table ${selectedTable.tableNumber}`
              : "No table selected"}
          </Badge>
        </div>

        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {categoryData.map((category) => (
            <button
              key={category._id}
              onClick={() => setSelectedCategory(category._id)}
              className={cn(
                "whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium",
                selectedCategory === category._id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              {category.categoryName}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredItems.map((item) => (
            <button
              key={item._id}
              onClick={() => addToCart(item)}
              className="glass-card rounded-lg  text-left hover:scale-[1.01]"
            >
              <div className=" h-32 overflow-hidden rounded-t-lg bg-muted">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.itemName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <UtensilsCrossed className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <p className="font-medium">{item.itemName}</p>
                <p className="text-sm capitalize text-muted-foreground">
                  {item.categoryId?.categoryName || item.category}
                </p>
                <p className="mt-3 text-lg font-semibold">
                  ₹{getItemPrice(item).toFixed(2)}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      <aside className="glass-card flex flex-col rounded-lg p-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Current Order</h2>
            <p className="text-sm text-muted-foreground">
              {cart.length} item{cart.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() => setCart([])}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center text-center text-muted-foreground">
              <UtensilsCrossed className="mb-3 h-8 w-8" />
              <p>No items in order</p>
              <p className="text-sm">Click on menu items to add them</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item._id} className="rounded-lg bg-muted/30 p-3">
                <div className="mb-3 flex justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{item.itemName}</p>
                    <p className="text-xs text-muted-foreground">
                      ₹{getItemPrice(item).toFixed(2)} each
                    </p>
                  </div>
                  <p className="font-semibold">
                    ₹{(getItemPrice(item) * item.quantity).toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item._id, -1)}
                    className="rounded-lg bg-muted p-2"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-8 text-center text-sm">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item._id, 1)}
                    className="rounded-lg bg-muted p-2"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="ml-auto rounded-lg p-2 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-5 border-t border-border pt-5">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax ({Number(gstRate) || 0}%)</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>

          <div className="my-4 grid grid-cols-3 gap-2">
            {[
              { id: "cash", icon: Banknote, label: "Cash" },
              { id: "card", icon: CreditCard, label: "Card" },
              { id: "upi", icon: Smartphone, label: "UPI" },
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setPaymentMethod(id)}
                className={cn(
                  "rounded-lg border border-border p-3 text-xs hover:bg-muted",
                  paymentMethod === id &&
                    "border-primary bg-primary text-primary-foreground",
                )}
              >
                <Icon className="mx-auto h-5 w-5" />
                <span className="mt-1 block">{label}</span>
              </button>
            ))}
          </div>

          <div className="my-4 grid grid-cols-2 gap-2">
            <Dropdown
              placeholder="Select Table"
              menu={{
                className: "app-ant-dropdown",
                items: tableData.map((table) => ({
                  label: table?.tableName,
                  key: table?._id,
                })),
                onClick: (info) => {
                  setSelectedTableId(info.key);
                },
              }}
              trigger={["click"]}
              className="rounded-lg p-2 text-muted-foreground bg-foreground hover:text-foreground"
            >
              <button className="w-full rounded-lg border border-border py-2 px-3 text-left hover:bg-muted">
                {selectedTable?.tableName || "Select Table"}
              </button>
            </Dropdown>
            <AntInput
              placeholder="Enter GST %"
              type="number"
              min={0}
              max={18}
              value={gstRate}
              onChange={(event) => {
                const value = Number(event.target.value);
                if (!Number.isNaN(value) && value <= 18) {
                  setGstRate(value);
                }
              }}
            />
          </div>

          <button
            onClick={completeOrder}
            disabled={isSubmitting}
            className="w-full rounded-lg bg-primary py-2 font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Completing..." : "Complete Order"}
          </button>
        </div>
      </aside>
    </div>
  );
}
