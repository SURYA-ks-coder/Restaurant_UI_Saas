"use client";
import React from "react";
import { Tag, Divider } from "antd";
import {
  IoLocationOutline as MapPin,
  IoPersonOutline as User,
  IoCarOutline as Truck,
  IoClipboardOutline as ClipboardList,
  IoReceiptOutline as Hash,
} from "react-icons/io5";
import DrawerPop from "@/components/ui/DrawerPop";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function getInitials(name = "") {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatPrice(val) {
  return val != null ? `$${Number(val).toFixed(2)}` : "-";
}

const ORDER_STEPS = [
  {
    key: "pending",
    label: "Order Confirmed",
    desc: "Your order has been confirmed and sent to the kitchen",
  },
  {
    key: "preparing",
    label: "Preparing",
    desc: "Our chefs are preparing your delicious meal",
  },
  {
    key: "completed",
    label: "Completed",
    desc: "Order Making successfully",
  },
  {
    key: "served",
    label: "Out for Delivery",
    desc: "Your order is on its way to you",
  },
];

const STATUS_TAG_COLOR = {
  paid: "green",
  unpaid: "red",
  pending: "gold",
  completed: "green",
  delivered: "green",
  preparing: "blue",
  confirmed: "cyan",
  out_for_delivery: "orange",
  cancelled: "default",
};

function SectionHeader({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-2 mb-3 ">
      {Icon && <Icon size={15} color="var(--primary)" />}
      <h3 className="font-semibold text-sm text-foreground">{title}</h3>
    </div>
  );
}

function InfoRow({ label, value, valueClass = "" }) {
  return (
    <div className="flex justify-between items-start gap-3 text-sm">
      <span className="text-muted-foreground whitespace-nowrap shrink-0">
        {label}:
      </span>
      <span className={`text-right font-medium break-all ${valueClass}`}>
        {value || "-"}
      </span>
    </div>
  );
}

export default function ViewOrderDetails({ open, close, orderData }) {
  if (!orderData) return null;

  const {
    items = [],
    status,
    paymentStatus,
    billNo,
    createdAt,
    subTotal,
    grandTotal,
    tableId,
    customer,
    deliveryPerson,
    deliveryAddress,
  } = orderData;
  console.log(orderData, "orderData");

  const statusKey = status?.toLowerCase().replace(/\s+/g, "_");
  const currentStepIndex = ORDER_STEPS.findIndex((s) => s.key === statusKey);


  return (
    <DrawerPop
      open={open}
      close={close}
      header={["Order Details", billNo ? `Bill No: #${billNo}` : ""]}
      size="large"
      isFooter={false}
    >
      <div className="grid grid-cols-[1fr_320px] gap-4 h-full">
        {/* LEFT PANEL */}
        <div className="flex flex-col gap-4 ">
          {/* Order Items */}
          <div className="rounded-xl border bg-card p-4">
            <SectionHeader icon={ClipboardList} title="Order Items" />
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-xs text-muted-foreground">
                  <th className="pb-2 text-left font-medium">Item</th>
                  <th className="pb-2 text-left font-medium">Details</th>
                  <th className="pb-2 text-center font-medium">Quantity</th>
                  <th className="pb-2 text-right font-medium">Unit Price</th>
                  <th className="pb-2 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.length > 0 ? (
                  items.map((item, idx) => {
                    const unitPrice = item.price ?? item.unitPrice ?? 0;
                    const total = unitPrice * (item.quantity || 1);
                    return (
                      <tr
                        key={item._id || idx}
                        className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        <td className="py-3 pr-3">
                          <div className="flex items-center gap-2">
                            <div className="h-10 w-10 shrink-0 rounded-lg bg-muted overflow-hidden">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.itemName}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-base">
                                  🍽️
                                </div>
                              )}
                            </div>
                            <span className="font-semibold text-foreground">
                              {item.itemName || "-"}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 pr-3 text-xs max-w-40 text-primary">
                          {item.description || item.itemDescription || ""}
                        </td>
                        <td className="py-3 text-center">{item.quantity}</td>
                        <td className="py-3 text-right">
                          {formatPrice(unitPrice)}
                        </td>
                        <td className="py-3 text-right font-semibold">
                          {formatPrice(total)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-6 text-center text-sm text-muted-foreground"
                    >
                      No items found
                    </td>
                  </tr>
                )}
              </tbody>
              {(subTotal != null || grandTotal != null) && (
                <tfoot>
                  <tr>
                    <td
                      colSpan={4}
                      className="pt-3 pr-2 text-right text-xs text-muted-foreground"
                    >
                      Sub Total:
                    </td>
                    <td className="pt-3 text-right font-semibold text-sm">
                      {formatPrice(subTotal)}
                    </td>
                  </tr>
                  <tr>
                    <td
                      colSpan={4}
                      className="pt-1 pr-2 text-right text-sm font-semibold text-foreground"
                    >
                      Grand Total:
                    </td>
                    <td className="pt-1 text-right text-base font-bold text-primary">
                      {formatPrice(grandTotal)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {/* Order Tracking + Delivery Person */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border bg-card p-4">
              <SectionHeader title="Order Tracking" />
              <div className="flex flex-col">
                {ORDER_STEPS.map((step, i) => {
                  const isDone = i <= currentStepIndex;
                  const lineActive = i < currentStepIndex;
                  const isLast = i === ORDER_STEPS.length - 1;
                  return (
                    <div key={step.key} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className="h-3 w-3 rounded-full mt-0.5 shrink-0 transition-colors"
                          style={{
                            backgroundColor: isDone
                              ? "var(--primary)"
                              : "#d1d5db",
                          }}
                        />
                        {!isLast && (
                          <div
                            className="w-0.5 flex-1 min-h-5 my-1 transition-colors"
                            style={{
                              backgroundColor: lineActive
                                ? "var(--primary)"
                                : "#d1d5db",
                            }}
                          />
                        )}
                      </div>
                      <div className="pb-4">
                        <p
                          className={`text-sm font-medium ${isDone ? "text-foreground" : "text-muted-foreground"}`}
                        >
                          {step.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border bg-card p-4">
              <SectionHeader icon={Truck} title="Delivery Person" />
              {deliveryPerson ? (
                <div className="flex flex-col items-center gap-3">
                  <Avatar className="h-14 w-14">
                    <AvatarImage
                      src={deliveryPerson.image}
                      alt={deliveryPerson.name}
                    />
                    <AvatarFallback>
                      {getInitials(deliveryPerson.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <p className="font-semibold text-sm text-foreground">
                      {deliveryPerson.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Your delivery partner for today
                    </p>
                  </div>
                  <Divider className="my-0" />
                  <div className="w-full space-y-2">
                    <InfoRow
                      label="Phone Number"
                      value={deliveryPerson.phone}
                    />
                    <InfoRow
                      label="Email Address"
                      value={deliveryPerson.email}
                      valueClass="text-blue-500"
                    />
                    {deliveryPerson.joinedAt && (
                      <InfoRow
                        label="Joined on"
                        value={new Date(
                          deliveryPerson.joinedAt,
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      />
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-28 gap-2 text-muted-foreground">
                  <Truck size={26} className="opacity-30" />
                  <p className="text-xs">No delivery person assigned</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex flex-col gap-4 ">
          {/* Customer Information */}
          <div className="rounded-xl border bg-card p-4">
            <SectionHeader icon={User} title="Customer Information" />
            <div className="flex flex-col items-center gap-2 mb-3">
              <Avatar className="h-16 w-16">
                <AvatarImage src={customer?.image} alt={customer?.name} />
                <AvatarFallback className="text-base">
                  {customer?.name ? (
                    getInitials(customer.name)
                  ) : (
                    <User size={18} />
                  )}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <p className="font-semibold text-foreground">
                  {customer?.name ||
                    (tableId?.tableName
                      ? `Table: ${tableId.tableName}`
                      : "Walk-in")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {customer?.memberType
                    ? `${customer.memberType} · ${customer.points || 0} Points`
                    : "Dine-in Order"}
                </p>
              </div>
            </div>
            <Divider className="my-2" />
            <div className="space-y-2">
              {customer?.phone && (
                <InfoRow label="Phone Number" value={customer.phone} />
              )}
              {customer?.email && (
                <InfoRow
                  label="Email Address"
                  value={customer.email}
                  valueClass="text-blue-500"
                />
              )}
              {customer?.address && (
                <InfoRow label="Address" value={customer.address} />
              )}
              {!customer && tableId?.tableName && (
                <InfoRow label="Table" value={tableId.tableName} />
              )}
              {customer?.deliveryNote && (
                <div className="pt-1">
                  <p className="text-xs text-muted-foreground mb-1">
                    Note for Delivery:
                  </p>
                  <p className="text-xs text-muted-foreground italic leading-relaxed">
                    {customer.deliveryNote}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Delivery Address */}
          {deliveryAddress && (
            <div className="rounded-xl border bg-card p-4">
              <SectionHeader icon={MapPin} title="Delivery Address" />
              <div className="h-28 rounded-lg bg-muted flex items-center justify-center mb-3">
                <div className="text-center text-muted-foreground">
                  <MapPin size={22} className="mx-auto mb-1 opacity-40" />
                  <p className="text-xs">Map View</p>
                </div>
              </div>
              <div className="space-y-2">
                <InfoRow
                  label="Delivery Address"
                  value={deliveryAddress.address}
                />
                {deliveryAddress.instructions && (
                  <div className="pt-1">
                    <p className="text-xs text-muted-foreground mb-1">
                      Delivery Instructions:
                    </p>
                    <p className="text-xs text-muted-foreground italic leading-relaxed">
                      {deliveryAddress.instructions}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Order Summary */}
          <div className="rounded-xl border bg-card p-4">
            <SectionHeader icon={Hash} title="Order Summary" />
            <div className="space-y-2">
              <InfoRow label="Bill No" value={billNo ? `#${billNo}` : "-"} />
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Order Status:</span>
                <Tag
                  color={STATUS_TAG_COLOR[statusKey] || "blue"}
                  className="capitalize m-0!"
                >
                  {status || "-"}
                </Tag>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Payment Status:</span>
                <Tag
                  color={
                    STATUS_TAG_COLOR[paymentStatus?.toLowerCase()] || "default"
                  }
                  className="capitalize m-0!"
                >
                  {paymentStatus || "-"}
                </Tag>
              </div>
              {tableId?.tableName && (
                <InfoRow label="Table" value={tableId.tableName} />
              )}
              <InfoRow
                label="Ordered At"
                value={
                  createdAt
                    ? new Date(createdAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "-"
                }
              />
              <Divider className="my-2" />
              <InfoRow label="Sub Total" value={formatPrice(subTotal)} />
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-foreground">Grand Total:</span>
                <span className="text-primary">{formatPrice(grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DrawerPop>
  );
}
