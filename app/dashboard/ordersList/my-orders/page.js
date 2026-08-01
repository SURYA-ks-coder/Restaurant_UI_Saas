"use client";
import Heading from "@/components/ui/Heading";
import Table from "@/components/ui/Table";
import { API, getAction } from "@/lib/API";
import { getUserId } from "@/lib/auth";
import { useEffect, useState } from "react";
import ViewOrderDetails from "../../orders/OrdersDetails.js/ViewOrderDetails";

// Same table/columns as the full Orders List, scoped to bills where
// waiterId === the logged-in staff member — either set explicitly on the
// bill or inherited from the table's assigned waiter (pos.service.js#createBill).
export default function MyOrdersPage() {
  const [ordersData, setOrdersData] = useState([]);
  const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    getMyOrdersList();
  }, []);

  const getMyOrdersList = async () => {
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
  };

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
