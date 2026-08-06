"use client";
import Heading from "@/components/ui/Heading";
import Table from "@/components/ui/Table";
import { connectSocket } from "@/components/services/socket";
import { joinBranch } from "@/components/socket/kotSocketActions";
import {
  registerKotListeners,
  removeKotListeners,
} from "@/components/socket/kotSocketListeners";
import { API, getAction } from "@/lib/API";
import { getAccessToken, getDefaultBranchId, getUserId } from "@/lib/auth";
import { KITCHEN_STATUS_LABELS, KITCHEN_STATUS_STYLES } from "@/lib/kitchenStatus";
import { cn } from "@/lib/utils";
import { Tag } from "antd";
import { useCallback, useEffect, useState } from "react";
import ViewOrderDetails from "../../orders/OrdersDetails.js/ViewOrderDetails";

// Same table/columns as the full Orders List, scoped to bills where
// waiterId === the logged-in staff member — either set explicitly on the
// bill or inherited from the table's assigned waiter (pos.service.js#createBill).
export default function MyOrdersPage() {
  const [ordersData, setOrdersData] = useState([]);
  const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const getMyOrdersList = useCallback(async () => {
    try {
      const userId = getUserId();
      const result = await getAction(
        `${API.GET_BILL_LIST}?waiterId=${userId}`,
        {},
      );
      if (result?.statusCode === 200) {
        setOrdersData(result?.data || []);
      }
    } catch (error) {}
  }, []);

  useEffect(() => {
    getMyOrdersList();

    const token = getAccessToken();
    const branchId = getDefaultBranchId();
    if (!token || !branchId) return;

    connectSocket({ token });
    joinBranch(branchId);
    // Bill.kitchenStatus is server-computed from the KOT(s) on every KOT
    // change (see kot.service.js#computeBillKitchenStatus) — a fresh
    // pos/list fetch is all that's needed to pick it up.
    registerKotListeners({
      onKotCreated: getMyOrdersList,
      onOrderCreated: getMyOrdersList,
      onKotStatusUpdated: getMyOrdersList,
      onKotItemStatusUpdated: getMyOrdersList,
    });

    return () => {
      removeKotListeners();
    };
  }, [getMyOrdersList]);

  const handleView = (_id, row) => {
    setSelectedOrder(row);
    setViewDrawerOpen(true);
  };

  const ordersHeader = [
    { title: "Bill No", value: "billNo", width: 220 },
    {
      title: "Table",
      value: "tableId.tableName",
      render: (value, row) =>
        value || row.tableName || row.table?.tableName || "-",
    },
    {
      title: "Items",
      value: "items",
      width: 300,
      render: (value) => (
        <div className="flex flex-wrap gap-1">
          {value?.map((item) => (
            <span key={item._id} className="rounded bg-muted px-2 py-1 text-xs">
              {item.itemName} ({item.quantity})
            </span>
          ))}
        </div>
      ),
    },
    { title: "Total Amount", value: "grandTotal", align: "right", width: 100 },
    {
      title: "Payment Status",
      value: "paymentStatus",
      type: "status",
      width: 140,
    },
    {
      title: "Kitchen Status",
      value: "kitchenStatus",
      width: 140,
      render: (kitchenStatus) => (
        <Tag
          className={cn(
            "rounded-full border font-medium capitalize",
            KITCHEN_STATUS_STYLES[kitchenStatus] || KITCHEN_STATUS_STYLES.pending,
          )}
        >
          {KITCHEN_STATUS_LABELS[kitchenStatus] || "Not Started"}
        </Tag>
      ),
    },
    { title: "Order Status", value: "status", type: "status", width: 140 },
    {
      title: "Ordered At",
      value: "createdAt",
      render: (value) => (value ? new Date(value).toLocaleDateString() : "-"),
    },
    { title: "Action", value: "action", type: "action" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Heading
        title="My Orders"
        description="Orders assigned to you as the serving staff"
      />
      <Table
        header={ordersHeader}
        data={ordersData}
        title="My Orders"
        rowKey="_id"
        onView={handleView}
      />
      <ViewOrderDetails
        open={viewDrawerOpen}
        close={() => setViewDrawerOpen(false)}
        orderData={selectedOrder}
      />
    </div>
  );
}
