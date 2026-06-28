"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  ChefHat,
  Clock,
  RefreshCw,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { connectSocket, disconnectSocket } from "@/components/services/socket";
import {
  joinBranch,
  joinDashboard,
  leaveBranch,
  updateKotStatus,
} from "@/components/socket/kotSocketActions";
import {
  registerKotListeners,
  removeKotListeners,
} from "@/components/socket/kotSocketListeners";
import { action, API, getAction, patchAction, postAction } from "@/lib/API";
import { Button, Checkbox, Tooltip } from "antd";
import { FaCircleCheck } from "react-icons/fa6";
import { MdCancel } from "react-icons/md";

const statusConfig = {
  new: { label: "New", color: "bg-accent/20 text-accent border-accent/30" },
  pending: {
    label: "Pending",
    color: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },
  preparing: {
    label: "Preparing",
    color: "bg-primary/20 text-primary border-primary/30",
  },
  ready: {
    label: "Ready",
    color: "bg-success/20 text-success border-success/30",
  },
  recalled: {
    label: "Recalled",
    color: "bg-warning/20 text-warning border-warning/30",
  },
};

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

const normalizeKotOrder = (kot) => {
  const createdAt = kot.createdAt || kot.created_at || kot.time || new Date();
  const createdDate = new Date(createdAt);
  const hasValidDate = !Number.isNaN(createdDate.getTime());
  const elapsed = hasValidDate
    ? Math.max(0, Math.floor((Date.now() - createdDate.getTime()) / 60000))
    : 0;

  return {
    ...kot,
    id: kot._id,
    table:
      kot.tableName ||
      kot.table ||
      kot.tableId?.tableName ||
      kot.tableId?.tableNumber ||
      "Table",
    time: hasValidDate
      ? createdDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "-",
    elapsed,
    items: kot.items || kot.orderItems || kot.billId?.items || [],
    status: kot.status || "new",
    priority: Boolean(kot.priority),
  };
};

export default function KitchenPage() {
  const [orders, setOrders] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("pending");

  const filteredOrders = orders.filter(
    (order) => selectedStatus === "all" || order.status === selectedStatus,
  );

  const handleStatusChange = (kotId, status) => {
    const branchId = getBranchId();

    // updateKotStatus({
    //   kotId,
    //   orderId: "ORDER_ID",
    //   branchId,
    //   status,
    // });

    UpdateKOTStatus(kotId);
  };

  const deductStockForKot = async (kotId, items) => {
    try {
      await postAction(API.DEDUCT_STOCK_BY_KOT, { kotId, items });
    } catch {
      // Stock deduction is best-effort; do not block order flow on failure
    }
  };

  const moveToNextStatus = (order) => {
    const statusFlow = {
      pending: "preparing",
      preparing: "ready",
      ready: "ready",
      recalled: "preparing",
    };
    const nextStatus = statusFlow[order.status] || "preparing";
    const kotId = order._id;

    setOrders((prev) =>
      prev.map((currentOrder) => {
        if (currentOrder.id !== order.id) return currentOrder;
        return { ...currentOrder, status: nextStatus };
      }),
    );

    // Deduct ingredients from stock when chef starts preparation
    if (order.status === "pending" && nextStatus === "preparing") {
      deductStockForKot(kotId, order.items);
    }

    handleStatusChange(kotId, nextStatus);
  };

  const recallOrder = (order) => {
    const kotId = order.kotId || order._id || order.id;

    setOrders((prev) =>
      prev.map((currentOrder) =>
        currentOrder.id === order.id
          ? { ...currentOrder, status: "recalled" }
          : currentOrder,
      ),
    );
    handleStatusChange(kotId, "recalled");
  };

  const toggleItemDone = (orderId, itemIndex, items) => {
    // setOrders((prev) =>
    //   prev.map((order) => {
    //     if (order.id !== orderId) return order;
    //     const items = order.items.map((item, index) =>
    //       index === itemIndex ? { ...item, done: !item.done } : item,
    //     );
    //     return { ...order, items };
    //   }),
    // );
  };

  const counts = {
    pending: orders.filter((order) => order.status === "pending")?.length,
    preparing: orders.filter((order) => order.status === "preparing").length,
    ready: orders.filter((order) => order.status === "ready").length,
  };

  const getKotList = useCallback(async () => {
    console.log("Fetching KOT list...");
    try {
      const result = await getAction(API.GET_KOT_LIST, {});

      if (result?.statusCode === 200) {
        setOrders((result?.data || []).map(normalizeKotOrder));
      }
    } catch (error) {
      console.error("Unable to fetch KOT list:", error);
    }
  }, []);

  useEffect(() => {
    const token = parseStoredValue("accessToken");
    const branchId = getBranchId();

    getKotList();

    if (!token || !branchId) {
      return;
    }
    connectSocket({ token });
    joinBranch(branchId);
    joinDashboard(branchId);

    registerKotListeners({
      onKotCreated: getKotList,
      onOrderCreated: getKotList,

      onKotStatusUpdated: (updatedKot) => {
        setOrders((prev) =>
          prev.map((kot) =>
            String(kot.kotId || kot._id || kot.id) ===
            String(updatedKot.kotId || updatedKot._id || updatedKot.id)
              ? {
                  ...kot,
                  status: updatedKot.status,
                }
              : kot,
          ),
        );
      },
    });

    return () => {
      // leaveBranch(branchId);
      // removeKotListeners();
      // disconnectSocket();
    };
  }, [getKotList]);

  const updateKotItemList = async (updatedKot) => {
    try {
      const result = await patchAction(API.UPDATE_KOT_ITEM_STATUS, {
        id: updatedKot.id,
        itemId: updatedKot._id,
        status: updatedKot?.status,
      });

      console.log("Update KOT item result:", result);
      if (result?.statusCode === 200) {
        await getKotList();

        setOrders((prev) =>
          prev.map((kot) =>
            String(kot.kotId || kot._id || kot.id) ===
            String(updatedKot.kotId || updatedKot._id || updatedKot.id)
              ? {
                  ...kot,
                  status: updatedKot.status,
                }
              : kot,
          ),
        );
      } else {
        console.error(
          "Failed to update KOT status:",
          result?.message || "Unknown error",
        );
      }
    } catch (error) {
      console.error("Error updating KOT in list:", error);
    }
  };

  const UpdateKOTStatus = async (kotId, status) => {
    try {
      const result = await patchAction(API.UPDATE_KOT_STATUS, {
        id: kotId,
        status: "ready",
      });

      if (result?.statusCode === 200) {
        getKotList();
      } else {
        console.error(
          "Failed to update KOT status:",
          result?.message || "Unknown error",
        );
      }
    } catch (error) {
      console.error("Error updating KOT status:", error);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-3 text-primary">
            <ChefHat className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Kitchen Display</h1>
            <p className="text-muted-foreground">Real-time order management</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSoundEnabled((value) => !value)}
            className="rounded-lg bg-muted p-3"
          >
            {soundEnabled ? (
              <Volume2 className="h-5 w-5" />
            ) : (
              <VolumeX className="h-5 w-5" />
            )}
          </button>
          <button
            onClick={getKotList}
            className="flex items-center gap-2 rounded-lg border border-border px-4 py-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {[
          ["all", `All Orders (${orders.length})`],
          ["pending", `New (${counts.pending})`],
          ["preparing", `Preparing (${counts.preparing})`],
          ["ready", `Ready (${counts.ready})`],
        ].map(([status, label]) => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium cursor-pointer",
              selectedStatus === status
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredOrders.map((order) => {
          const status = statusConfig[order.status] || {
            label: order.status || "New",
            color: "bg-muted text-muted-foreground border-border",
          };
          const isUrgent = order.elapsed > 10 && order.status !== "ready";

          return (
            <article
              key={order.id}
              className="border rounded-lg p-5 flex flex-col justify-between bg-white dark:bg-card"
            >
              <div className="">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold">{order.kitchenSection}</h2>
                      {order.priority && <Badge>VIP</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {order.table} • {order.time}
                    </p>
                  </div>
                  <Badge className={status.color}>{status.label}</Badge>
                </div>

                <div
                  className={cn(
                    "mb-4 flex items-center gap-2 text-sm",
                    isUrgent ? "text-warning" : "text-muted-foreground",
                  )}
                >
                  <Clock className="h-4 w-4" />
                  {order.elapsed}m
                  {isUrgent && <AlertTriangle className="h-4 w-4" />}
                </div>

                <div className="space-y-2">
                  {order.items.map((item, itemIndex) => {
                    const itemName = item.name || item.itemName || "Item";
                    const itemNotes =
                      item.notes ||
                      item.note ||
                      item.instructions ||
                      "food is good";

                    return (
                      <button
                        key={`${itemName}-${itemIndex}`}
                        className={cn(
                          "flex w-full items-center justify-between gap-3 rounded-lg bg-muted/40 p-3 text-left",
                          item.status === "ready" && "opacity-60 line-through",
                        )}
                      >
                        {/* <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded border border-border"> */}
                        {/* {item.done && (
                           <Check
                        className="h-3 w-3"
                        onChange={updateKotInList}
                        value=""
                      /> 
                        )} */}
                        {/* </span> */}
                        <div className="flex items-center gap-3">
                          <Tooltip title="Start preparing this item">
                            <Checkbox
                              onChange={(checked) =>
                                updateKotItemList({
                                  id: order._id,
                                  _id: item._id,
                                  status: "preparing",
                                  // ...item,
                                })
                              }
                              checked={
                                item.status === "preparing" ||
                                item.status === "ready"
                              }
                              disabled={
                                item.status === "preparing" ||
                                item.status === "ready"
                              }
                            />
                          </Tooltip>
                          <span>
                            <span className="font-medium">
                              {item.quantity}x {itemName}
                            </span>
                            {itemNotes && (
                              <span className="block text-xs text-muted-foreground">
                                {itemNotes}
                              </span>
                            )}
                          </span>
                        </div>
                        {
                          <div className="flex items-center gap-2">
                            {item.status !== "preparing" &&
                            item.status !== "ready" ? (
                              <Tooltip title="Cancel">
                                <MdCancel
                                  className="text-xl text-red-500 cursor-pointer"
                                  onClick={() =>
                                    updateKotItemList({
                                      _id: item._id,
                                      id: order._id,
                                      status: "cancelled",
                                    })
                                  }
                                />
                              </Tooltip>
                            ) : null}
                            {item.status === "preparing" ||
                            item.status === "pending" ? (
                              <Tooltip title="Mark as Completed this item">
                                <FaCircleCheck
                                  className=" text-green-500 cursor-pointer"
                                  onClick={() =>
                                    updateKotItemList({
                                      _id: item._id,
                                      id: order._id,
                                      status: "ready",
                                    })
                                  }
                                />
                              </Tooltip>
                            ) : null}
                          </div>
                        }
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="mt-5">
                <Button
                  type="primary"
                  size="large"
                  disabled={order.status === "ready"}
                  onClick={() => moveToNextStatus(order)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 font-medium text-primary-foreground "
                >
                  {/* order.status === "pending"
                      ? "Start"
                      :  */}
                  <p className="dark:text-white">
                    {order.status !== "ready" ? "Done" : "Completed"}
                  </p>
                  {order.status === "pending" ? (
                    <ArrowRight className="h-4 w-4" />
                  ) : null}
                </Button>
                {/* )} */}
              </div>
            </article>
          );
        })}
      </div>

      {filteredOrders.length === 0 && (
        <div className="rounded-lg border border-border p-12 text-center text-muted-foreground">
          No orders
        </div>
      )}
    </div>
  );
}
