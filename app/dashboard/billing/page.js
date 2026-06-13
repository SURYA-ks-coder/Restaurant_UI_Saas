"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Banknote,
  CreditCard,
  Minus,
  PauseCircle,
  Plus,
  Printer,
  ReceiptText,
  RotateCcw,
  Save,
  Search,
  Smartphone,
  Trash2,
  UtensilsCrossed,
  XCircle,
} from "lucide-react";
import { Dropdown, message } from "antd";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { API, action, getAction } from "@/lib/API";
import { cn } from "@/lib/utils";
import { AntSelect } from "@/components/ui/AntSelect";
import { AntInput } from "@/components/ui/AntInput";
import SearchBox from "@/components/ui/SearchBox";

const fallbackCategories = [
  { _id: "starters", categoryName: "Starters" },
  { _id: "mains", categoryName: "Main Course" },
  { _id: "drinks", categoryName: "Drinks" },
];

const fallbackMenuItems = [
  {
    _id: "paneer-tikka",
    itemName: "Paneer Tikka",
    itemCode: "ITM001",
    categoryId: { _id: "starters", categoryName: "Starters" },
    prices: { dineInPrice: 220 },
    gstPercent: 5,
    addOns: ["Extra chutney", "Cheese"],
  },
  {
    _id: "veg-biryani",
    itemName: "Veg Biryani",
    itemCode: "ITM002",
    categoryId: { _id: "mains", categoryName: "Main Course" },
    prices: { dineInPrice: 260 },
    gstPercent: 5,
    addOns: ["Raita", "Extra masala"],
  },
  {
    _id: "lime-soda",
    itemName: "Fresh Lime Soda",
    itemCode: "ITM003",
    categoryId: { _id: "drinks", categoryName: "Drinks" },
    prices: { dineInPrice: 90 },
    gstPercent: 5,
    addOns: ["Sweet", "Salted"],
  },
];

const fallbackTables = [
  { _id: "table-1", tableName: "T1", tableNumber: 1, capacity: 2 },
  { _id: "table-2", tableName: "T2", tableNumber: 2, capacity: 4 },
  { _id: "table-3", tableName: "T3", tableNumber: 3, capacity: 6 },
];

const customerTypes = ["Dine In", "Parcel", "Delivery"];
const paymentModes = [
  { id: "cash", label: "Cash", icon: Banknote },
  { id: "upi", label: "UPI", icon: Smartphone },
  { id: "card", label: "Card", icon: CreditCard },
];

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

const getItemPrice = (item) =>
  Number(
    item?.prices?.dineInPrice ||
      item?.prices?.parcelPrice ||
      item?.prices?.deliveryPrice ||
      item?.price ||
      0,
  );

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

const getOrderType = (customerType) => {
  const orderTypes = {
    "Dine In": "dine_in",
    Parcel: "parcel",
    Delivery: "online",
  };

  return orderTypes[customerType] || "dine_in";
};

const buildBillNo = () => {
  const datePart = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const randomPart = Math.floor(1000 + Math.random() * 9000);

  return `BILL-${datePart}-${randomPart}`;
};
const itemHeaders = [
  { label: "item Name", value: "itemName" },
  { label: "item Code", value: "itemCode" },
  { label: "Quantity", value: "quantity" },
  { label: "Category", value: "categoryId" },
  { label: "GST %", value: "gstPercent" },
  { label: "Price", value: "price" },
  { label: "Total", value: "total" },
];

export default function BillingPage() {
  const [customer, setCustomer] = useState({
    name: "",
    mobile: "",
    type: "Dine In",
    tableId: "",
    guests: 1,
  });
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeItemId, setActiveItemId] = useState("");
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemNotes, setItemNotes] = useState("");
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [cart, setCart] = useState([]);
  const [discountValue, setDiscountValue] = useState("");
  const [discountType, setDiscountType] = useState("flat");
  const [splitPayment, setSplitPayment] = useState(false);
  const [paymentMode, setPaymentMode] = useState("cash");
  const [payments, setPayments] = useState({ cash: "", upi: "", card: "" });
  const [lastFourDigits, setLastFourDigits] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [menuItems, setMenuItems] = useState(fallbackMenuItems);
  const [categories, setCategories] = useState(fallbackCategories);
  const [tables, setTables] = useState(fallbackTables);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    const loadBillingData = async () => {
      try {
        const [categoryResult, menuResult, tableResult] = await Promise.all([
          getAction(API.GET_CATEGORY_LIST, {}),
          getAction(API.GET_MENU_ITEM_LIST, {}),
          getAction(API.GET_TABLE_LIST, {}),
        ]);

        if (categoryResult?.statusCode === 200 && categoryResult.data?.length) {
          setCategories(categoryResult.data);
        }

        if (menuResult?.statusCode === 200 && menuResult.data?.length) {
          setMenuItems(menuResult.data);
        }

        if (tableResult?.statusCode === 200 && tableResult.data?.length) {
          setTables(tableResult.data);
        }
      } catch (error) {
        setStatusMessage("Using sample billing data while the API is offline.");
      }
    };

    loadBillingData();
  }, []);

  const categoryOptions = useMemo(
    () => [{ _id: "all", categoryName: "All Items" }, ...categories],
    [categories],
  );

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return menuItems.filter((item) => {
      const categoryId = item.categoryId?._id || item.categoryId;
      const matchesCategory =
        selectedCategory === "all" || categoryId === selectedCategory;
      const searchable = `${item.itemName || ""} ${item.itemCode || ""}`
        .toLowerCase()
        .trim();

      return matchesCategory && searchable.includes(query);
    });
  }, [menuItems, searchQuery, selectedCategory]);

  const activeItem =
    menuItems.find((item) => item._id === activeItemId) || filteredItems[0];

  useEffect(() => {
    if (!activeItemId && filteredItems[0]?._id) {
      setActiveItemId(filteredItems[0]._id);
    }
  }, [activeItemId, filteredItems]);

  useEffect(() => {
    setSelectedAddOns([]);
    setItemNotes("");
    setItemQuantity(1);
  }, [activeItemId]);

  const summary = useMemo(() => {
    const subtotal = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const discountInput = Number(discountValue) || 0;
    const discount =
      discountType === "percent"
        ? Math.min(subtotal, subtotal * (discountInput / 100))
        : Math.min(subtotal, discountInput);
    const taxableSubtotal = subtotal - discount;
    const gst = cart.reduce((sum, item) => {
      const itemShare = subtotal ? (item.price * item.quantity) / subtotal : 0;
      return sum + taxableSubtotal * itemShare * ((item.gstPercent || 0) / 100);
    }, 0);
    const serviceCharge = taxableSubtotal * 0.05;
    const total = taxableSubtotal + gst + serviceCharge;

    return { subtotal, discount, gst, serviceCharge, total };
  }, [cart, discountType, discountValue]);

  useEffect(() => {
    if (splitPayment) {
      return;
    }

    setPayments({
      cash: paymentMode === "cash" ? summary.total.toFixed(2) : "",
      upi: paymentMode === "upi" ? summary.total.toFixed(2) : "",
      card: paymentMode === "card" ? summary.total.toFixed(2) : "",
    });
  }, [paymentMode, splitPayment, summary.total]);

  const paidTotal = Object.values(payments).reduce(
    (sum, value) => sum + (Number(value) || 0),
    0,
  );
  const balance = summary.total - paidTotal;
  const addOns = activeItem?.addOns || activeItem?.addons || [];

  const updateCustomer = (field, value) => {
    setCustomer((current) => ({ ...current, [field]: value }));
  };

  const addItemToBill = () => {
    if (!activeItem) {
      return;
    }

    const lineId = `${activeItem._id}-${Date.now()}`;
    const price = getItemPrice(activeItem);

    setCart((current) => [
      ...current,
      {
        lineId,
        itemId: activeItem._id,
        itemName: activeItem.itemName,
        itemCode: activeItem.itemCode,
        price,
        quantity: Math.max(1, Number(itemQuantity) || 1),
        notes: itemNotes,
        addOns: selectedAddOns,
        gstPercent: Number(activeItem.gstPercent || activeItem.gst || 5),
      },
    ]);
    setStatusMessage(`${activeItem.itemName} added to the bill.`);
  };

  const updateCartQuantity = (lineId, delta) => {
    setCart((current) =>
      current
        .map((item) =>
          item.lineId === lineId
            ? { ...item, quantity: item.quantity + delta }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const resetBill = () => {
    setCustomer({
      name: "",
      mobile: "",
      type: "Dine In",
      tableId: "",
      guests: 1,
    });
    setCart([]);
    setDiscountValue("");
    setDiscountType("flat");
    setSplitPayment(false);
    setPaymentMode("cash");
    setPayments({ cash: "", upi: "", card: "" });
    setLastFourDigits("");
  };

  const validateBill = ({ requirePayment = true } = {}) => {
    const restaurantId = getEntityId(parseStoredValue("restaurantId"));
    const branchId = getBranchId();

    if (!restaurantId || !branchId) {
      setStatusMessage("Restaurant and branch details are required.");
      return false;
    }

    if (customer.type === "Dine In" && !customer.tableId) {
      setStatusMessage("Select a table for dine-in billing.");
      return false;
    }

    if (!cart.length) {
      setStatusMessage("Add at least one item before saving the bill.");
      return false;
    }

    if (requirePayment && Math.abs(balance) > 0.01) {
      setStatusMessage("Payment amount must match the bill total.");
      return false;
    }

    return true;
  };

  const buildBillPayload = (status) => {
    const restaurantId = getEntityId(parseStoredValue("restaurantId"));
    const branchId = getBranchId();
    const userData = parseStoredValue("userData");
    const taxableSubtotal = Math.max(summary.subtotal - summary.discount, 0);
    const serviceChargeText = `Service Charge: ${currency.format(summary.serviceCharge)}`;
    const customerText = [
      customer.name && `Customer: ${customer.name}`,
      customer.mobile && `Mobile: ${customer.mobile}`,
      customer.guests && `Guests: ${customer.guests}`,
      serviceChargeText,
    ]
      .filter(Boolean)
      .join(" | ");

    const items = cart.map((item) => {
      const itemSubtotal = item.price * item.quantity;
      const discountShare = summary.subtotal
        ? summary.discount * (itemSubtotal / summary.subtotal)
        : 0;
      const itemTaxableTotal = Math.max(itemSubtotal - discountShare, 0);
      const taxAmount = roundAmount(
        itemTaxableTotal * ((item.gstPercent || 0) / 100),
      );

      return {
        menuItemId: item.itemId,
        itemName: item.itemName,
        quantity: Number(item.quantity),
        price: roundAmount(item.price),
        taxAmount,
        total: roundAmount(itemSubtotal),
      };
    });

    const billPayments = Object.entries(payments)
      .map(([method, amount]) => ({
        method,
        amount: roundAmount(amount),
        transactionRef: method === "card" ? lastFourDigits : "",
        paidAt: new Date(),
      }))
      .filter((payment) => payment.amount > 0);

    return {
      restaurantId,
      branchId,
      billNo: buildBillNo(),
      orderType: getOrderType(customer.type),
      tableId: customer.type === "Dine In" ? customer.tableId : undefined,
      items,
      taxRate: cart[0]?.gstPercent || 0,
      discount: roundAmount(discountValue),
      note: [customerText, ...cartNotes()].filter(Boolean).join("\n"),
      subTotal: roundAmount(summary.subtotal),
      taxTotal: roundAmount(summary.gst),
      discountTotal: roundAmount(summary.discount),
      grandTotal: roundAmount(
        taxableSubtotal + summary.gst + summary.serviceCharge,
      ),
      payments: billPayments,
      paymentStatus:
        status === "completed" && Math.abs(balance) <= 0.01
          ? "paid"
          : "pending",
      status,
      createdBy: getEntityId(userData),
    };
  };

  const cartNotes = () =>
    cart
      .map((item) => {
        const details = [item.notes, ...item.addOns].filter(Boolean).join(", ");
        return details ? `${item.itemName}: ${details}` : "";
      })
      .filter(Boolean);

  const submitBill = async (status) => {
    const requirePayment = status === "completed";

    if (!validateBill({ requirePayment })) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await action(API.CREATE_BILL, buildBillPayload(status));

      if (result?.statusCode === 200 || result?.statusCode === 201) {
        const successText =
          status === "completed"
            ? "Bill saved successfully."
            : status === "held"
              ? "Bill is on hold and the order remains open."
              : "Bill cancelled.";

        message.success(result?.message || successText);
        setStatusMessage(successText);

        if (status !== "held") {
          resetBill();
        }

        return;
      }

      message.error(result?.message || "Unable to save bill");
      setStatusMessage(result?.message || "Unable to save bill");
    } catch (error) {
      message.error("Unable to save bill");
      setStatusMessage("Unable to save bill. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveBill = () => {
    submitBill("completed");
  };

  const handleHoldBill = () => {
    submitBill("held");
  };

  const handleCancelBill = () => {
    if (!cart.length) {
      resetBill();
      setStatusMessage("Bill cancelled.");
      return;
    }

    submitBill("cancelled");
  };

  const selectedTable = tables.find((table) => table._id === customer.tableId);

  const addItemFromSearch = (selectedItem) => {
    const price = getItemPrice(selectedItem);

    const cartItem = {
      lineId: `${selectedItem._id}-${Date.now()}`,
      itemId: selectedItem._id,
      itemName: selectedItem.itemName,
      itemCode: selectedItem.itemCode,
      categoryId: selectedItem.categoryId,
      quantity: 1,
      price,
      total: price,
      gstPercent: Number(selectedItem.gstPercent || 5),
    };

    setCart((prev) => [...prev, cartItem]);

    setSelectedItems((prev) => [...prev, cartItem]);

    setSearchQuery("");
  };
  return (
    <div className="min-h-screen bg-background ">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
            <ReceiptText className="h-4 w-4" />
            POS Billing
          </div>
          <h1 className="text-3xl font-bold">Create Bill</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Search items, apply discounts, split payments, and close the order
            from one billing screen.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">
            {cart.length} item{cart.length === 1 ? "" : "s"}
          </Badge>
          <Badge>Total {currency.format(Math.max(summary.total, 0))}</Badge>
        </div>
      </div>

      {statusMessage && (
        <div className="mb-5 flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm">
          <span>{statusMessage}</span>
          <button
            type="button"
            onClick={() => setStatusMessage("")}
            className="rounded-md p-1 text-muted-foreground hover:bg-background hover:text-foreground"
          >
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      )}

      <main className="space-y-6">
        <section className="glass-card rounded-lg p-5">
          <SectionHeader title="Customer Section" />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <AntInput
              label="Customer Name"
              value={customer.name}
              onChange={(event) => updateCustomer("name", event.target.value)}
              placeholder="Auto-complete customer"
            />

            <AntInput
              label="Mobile Number"
              value={customer.mobile}
              onChange={(event) =>
                updateCustomer(
                  "mobile",
                  event.target.value.replace(/\D/g, "").slice(0, 10),
                )
              }
              inputMode="numeric"
              placeholder="10-digit mobile"
            />
            <AntSelect
              label="Table Selection"
              options={tables.map((table) => ({
                label: table.tableName || `Table ${table.tableNumber}`,
                value: table._id,
              }))}
              value={customer.tableId}
              onChange={(value) => updateCustomer("tableId", value)}
              // error={}
            />
            <Field label="Guest Count">
              <Stepper
                value={customer.guests}
                onChange={(value) =>
                  updateCustomer("guests", Math.max(1, value))
                }
              />
            </Field>
          </div>
        </section>

        <section className="glass-card rounded-lg p-5">
          <SectionHeader title="Item Section" />
          <div className="mb-5 grid gap-4 ">
            <Dropdown
              // overlayClassName="app-dropdown-overlay"
              classNames={{
                root: "app-dropdown-overlay",
              }}
              trigger={["click"]}
              menu={{
                items: filteredItems.map((item) => ({
                  key: item._id,
                  label: (
                    <div>
                      <p>{item.itemName}</p>
                      <p>{item.itemCode}</p>
                    </div>
                  ),
                })),
                onClick: ({ key }) => {
                  const selectedItem = menuItems.find(
                    (item) => item._id === key,
                  );

                  if (selectedItem) {
                    addItemFromSearch(selectedItem);
                  }
                },
              }}
            >
              <div className="relative">
                <SearchBox
                  value={searchQuery}
                  change={(e) => setSearchQuery(e)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const selectedItem = menuItems.find(
                        (item) =>
                          item.itemName?.toLowerCase() ===
                            searchQuery.toLowerCase() ||
                          item.itemCode?.toLowerCase() ===
                            searchQuery.toLowerCase(),
                      );

                      if (selectedItem) {
                        addItemFromSearch(selectedItem);
                      }
                    }
                  }}
                  className="pl-10"
                  placeholder="Search item by name or code"
                />
              </div>
            </Dropdown>
          </div>

          <div className="lg:hidden">
            {/* Card Layout */}
            <div className="block lg:hidden space-y-3">
              {selectedItems.map((item) => (
                <div
                  key={item._id}
                  className="rounded-lg border p-4 bg-background"
                >
                  {itemHeaders.map((header) => (
                    <div
                      key={header.value}
                      className="flex justify-between py-1"
                    >
                      <span className="font-medium">{header.label}</span>

                      <span>
                        {typeof item[header.value] === "object"
                          ? item[header.value]?.categoryName || "-"
                          : item[header.value] || "-"}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <div className=" max-h-[32rem] gap-3 overflow-y-auto pr-1">
              <div className="hidden lg:block overflow-x-auto rounded-lg border">
                {/* Table Layout */}
                <div className="overflow-x-auto ">
                  <table className="min-w-full text-sm">
                    <thead className=" bg-gray-50">
                      <tr>
                        {itemHeaders.map((header) => (
                          <th
                            key={header.value}
                            className="whitespace-nowrap px-4 py-3 text-left font-medium"
                          >
                            {header.label}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody className=" bg-white">
                      {selectedItems.length > 0 ? (
                        selectedItems.map((item, index) => (
                          <tr
                            key={item._id || index}
                            className="border-t hover:bg-muted/50"
                          >
                            {itemHeaders.map((header) => (
                              <td
                                key={header.value}
                                className="whitespace-nowrap px-4 py-3"
                              >
                                {typeof item[header.value] === "object"
                                  ? item[header.value]?.categoryName || "-"
                                  : item[header.value] || "-"}
                              </td>
                            ))}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={itemHeaders.length}
                            className="py-6 text-center text-muted-foreground"
                          >
                            No items selected
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

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

              {/* <div className="min-h-0 flex-1 space-y-3 overflow-y-auto">
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
                    </div> */}

              <div className="mt-5 border-t border-border pt-5">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{currency.format(summary.subtotal)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Discount</span>
                    <span>- {currency.format(summary.discount)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>GST</span>
                    <span>{currency.format(summary.gst)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Service Charge</span>
                    <span>{currency.format(summary.serviceCharge)}</span>
                  </div>

                  <div className="flex justify-between border-t pt-2 text-lg font-semibold">
                    <span>Total</span>
                    <span>{currency.format(summary.total)}</span>
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
                      onClick={() => setPaymentMode(id)}
                      className={cn(
                        "rounded-lg border border-border p-3 text-xs hover:bg-muted",
                        paymentMode === id &&
                          "border-primary bg-primary text-primary-foreground",
                      )}
                    >
                      <Icon className="mx-auto h-5 w-5" />
                      <span className="mt-1 block">{label}</span>
                    </button>
                  ))}
                </div>

                {/* <div cl assN  */}

                <button
                  onClick={handleSaveBill}
                  disabled={isSubmitting}
                  className="w-full rounded-lg bg-primary py-2 font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Completing..." : "Generate Bill"}
                </button>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
}

function SectionHeader({ title }) {
  return (
    <div className="mb-4 flex items-center gap-2 border-b border-border pb-3">
      <span className="h-2 w-2 rounded-full bg-primary" />
      <h2 className="text-sm font-semibold uppercase tracking-wide">{title}</h2>
    </div>
  );
}

function Field({ label, required, compact, className, children }) {
  return (
    <label className={cn("block", className)}>
      <span
        className={cn("mb-1.5 block text-sm font-medium", compact && "sr-only")}
      >
        {label}
        {required && <span className="text-destructive"> *</span>}
      </span>
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
        className="flex items-center justify-center hover:bg-muted"
      >
        <Minus className="h-4 w-4" />
      </button>
      <input
        value={value}
        onChange={(event) => onChange(Number(event.target.value) || 1)}
        inputMode="numeric"
        className="min-w-0 bg-transparent text-center text-sm outline-none"
      />
      <button
        type="button"
        onClick={() => onChange(Number(value) + 1)}
        className="flex items-center justify-center hover:bg-muted"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

function SummaryRow({ label, value, strong }) {
  return (
    <div
      className={cn(
        "flex items-center justify-between",
        strong && "pt-2 text-lg font-semibold",
      )}
    >
      <span className="text-muted-foreground">{label}</span>
      <span>{currency.format(value)}</span>
    </div>
  );
}

function IconButton({ label, className, children, ...props }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-lg bg-background text-muted-foreground hover:text-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function ActionButton({ icon: Icon, label, danger, ...props }) {
  return (
    <button
      type="button"
      className={cn(
        "flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium",
        props.disabled && "cursor-not-allowed opacity-60",
        danger
          ? "border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/15"
          : "border border-border bg-muted/30 hover:bg-muted",
      )}
      {...props}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
