"use client";
import Heading from "@/components/ui/Heading";
import Table from "@/components/ui/Table";
import { API, getAction } from "@/lib/API";
import React, { useEffect, useState } from "react";
import ViewOrderDetails from "../orders/OrdersDetails.js/ViewOrderDetails";
const ordersHeader = [
  {
    title: "Bill No",
    value: "billNo",
    // type: "link",
    width: 220,
  },
  {
    title: "Table",
    value: "tableId.tableName",
    // width: 180,
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
  { title: "Sub Total", value: "subTotal" },
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
  {
    title: "Action",
    value: "action",
    type: "action",
    // render: (value) => (value ? new Date(value).toLocaleDateString() : "-"),
  },
];

export default function OrdersList() {
  const [ordersData, setordersDataa] = useState([]);
  const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    getOrdersList();
  }, []);

  const getOrdersList = async () => {
    try {
      const result = await getAction(API.GET_BILL_LIST, {});
      if (result?.statusCode === 200) {
        setordersDataa(result?.data || []);
      }
    } catch (error) {}
  };

  const handleView = (_id, row) => {
    setSelectedOrder(row);
    setViewDrawerOpen(true);
  };

  return (
    <div className="flex flex-col gap-4">
      <Heading title="Orders" description="Manage your restaurant orders" />
      <Table
        header={ordersHeader}
        data={ordersData}
        title="Orders List"
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
