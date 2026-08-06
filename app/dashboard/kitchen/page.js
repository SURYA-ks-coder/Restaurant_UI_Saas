"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  Check,
  ChefHat,
  Clock,
  Loader2,
  Printer,
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
import { getAccessToken } from "@/lib/auth";
import { triggerPrint } from "@/lib/print";
import { message } from "@/lib/message";
import { Button, Checkbox, Select, Tooltip } from "antd";
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
    assignedChefId: kot.chefId?._id || kot.chefId || kot.assignedChefId || "",
    assignedChefName: kot.chefId?.name || kot.chefName || "",
  };
};

const isChefMember = (member) =>
  [member.role, member.designation, member.roleId?.roleName]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes("chef"));

const KITCHEN_BOOKMARKS_KEY = "kitchenBookmarkedKots";

export default function KitchenPage() {
  const [orders, setOrders] = useState([]);
  const [chefs, setChefs] = useState([]);
  const [assigningId, setAssigningId] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("pending");
  const [reprintingId, setReprintingId] = useState(null);
  // Per-browser highlight for tickets a chef is keeping an eye on — local
  // only, not synced to other kitchen displays or the backend.
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(KITCHEN_BOOKMARKS_KEY) || "[]");
      setBookmarkedIds(new Set(stored));
    } catch {}
  }, []);

  const toggleBookmark = (kotId) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(kotId)) next.delete(kotId);
      else next.add(kotId);
      localStorage.setItem(KITCHEN_BOOKMARKS_KEY, JSON.stringify([...next]));
      return next;
    });
  };

  const reprintKot = async (kotId) => {
    setReprintingId(kotId);
    try {
      await triggerPrint({ endpoint: API.PRINT_KOT, id: kotId });
    } catch {
    } finally {
      setReprintingId(null);
    }
  };

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

    UpdateKOTStatus(kotId, status);
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

  // Chefs available to assign a KOT ticket to — reuses the staff list,
  // filtered to members whose role/designation/roleName mentions "chef"
  // (staff no longer has a fixed role enum, see app/dashboard/staff/AddStaffs.js).
  const getChefList = useCallback(async () => {
    try {
      const result = await getAction(API.GET_STAFF_LIST, {});
      if (result?.statusCode === 200) {
        setChefs((result?.data || []).filter(isChefMember));
      }
    } catch (error) {
      console.error("Unable to fetch chef list:", error);
    }
  }, []);

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
    const token = getAccessToken();
    const branchId = getBranchId();

    getKotList();
    getChefList();

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
  }, [getKotList, getChefList]);

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
        status,
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

  const assignChef = async (kotId, chefId) => {
    setAssigningId(kotId);
    try {
      const result = await patchAction(`${API.ASSIGN_KOT_CHEF}/${kotId}/assign`, {
        chefId,
      });
      if (result?.statusCode === 200) {
        const chef = chefs.find((c) => c._id === chefId);
        setOrders((prev) =>
          prev.map((order) =>
            order._id === kotId
              ? {
                  ...order,
                  assignedChefId: chefId,
                  assignedChefName: chef?.name || "",
                }
              : order,
          ),
        );
        message.success(`Assigned to ${chef?.name || "chef"}`);
      } else {
        message.error(result?.message || "Unable to assign chef");
      }
    } catch {
      message.error("Unable to assign chef");
    } finally {
      setAssigningId(null);
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

          const isBookmarked = bookmarkedIds.has(order.id);

          return (
            <article
              key={order.id}
              className={cn(
                "border rounded-lg p-5 flex flex-col justify-between bg-white dark:bg-card",
                isBookmarked && "ring-2 ring-amber-400 dark:ring-amber-500/70",
              )}
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
                  <div className="flex items-center gap-2">
                    <Badge className={status.color}>{status.label}</Badge>
                    {order.status === "preparing" && (
                      <Tooltip title={isBookmarked ? "Remove bookmark" : "Bookmark this ticket"}>
                        <button
                          onClick={() => toggleBookmark(order.id)}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                          {isBookmarked ? (
                            <BookmarkCheck className="h-3.5 w-3.5 text-amber-500" />
                          ) : (
                            <Bookmark className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </Tooltip>
                    )}
                    <Tooltip title="Reprint KOT">
                      <button
                        onClick={() => reprintKot(order._id)}
                        disabled={reprintingId === order._id}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
                      >
                        {reprintingId === order._id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Printer className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </Tooltip>
                  </div>
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

                <div className="mb-4 flex items-center gap-2">
                  <ChefHat className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <Select
                    className="min-w-0 flex-1"
                    placeholder="Assign chef"
                    value={order.assignedChefId || undefined}
                    loading={assigningId === order._id}
                    disabled={assigningId === order._id}
                    onChange={(chefId) => assignChef(order._id, chefId)}
                    options={chefs.map((chef) => ({
                      value: chef._id,
                      label: chef.name,
                    }))}
                  />
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
