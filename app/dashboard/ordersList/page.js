"use client";
import Heading from "@/components/ui/Heading";
import Table from "@/components/ui/Table";
import { connectSocket } from "@/components/services/socket";
import { joinBranch } from "@/components/socket/kotSocketActions";
import {
  registerKotListeners,
  removeKotListeners,
} from "@/components/socket/kotSocketListeners";
import { API, getAction, patchAction } from "@/lib/API";
import { getAccessToken, getDefaultBranchId } from "@/lib/auth";
import {
  KITCHEN_STATUS_LABELS,
  KITCHEN_STATUS_STYLES,
  LIST_STATUS_FILTERS,
  matchesListStatusFilter,
} from "@/lib/kitchenStatus";
import { message } from "@/lib/message";
import { cn } from "@/lib/utils";
import { Select, Tag } from "antd";
import { useCallback, useEffect, useState } from "react";
import ViewOrderDetails from "../orders/OrdersDetails.js/ViewOrderDetails";

// Mirrors Bill.status exactly (pending/held/completed/cancelled) — kitchen
// progress ("preparing"/"ready"/"served") is tracked on the KOT instead and
// is joined in separately below (see lib/kitchenStatus.js) so this column
// still only ever offers the four statuses the backend accepts here.
const ORDER_STATUS_OPTIONS = ["pending", "held", "completed", "cancelled"];

// Mirrors app/dashboard/settings/menuItems/AddMenuItem.js's kitchenSectionOptions.
const KITCHEN_SECTION_OPTIONS = [
  { label: "Main Kitchen", value: "main_kitchen" },
  { label: "Grill", value: "grill" },
  { label: "Cold Station", value: "cold_station" },
];

// Staff no longer has a fixed role enum (see app/dashboard/staff/AddStaffs.js),
// so — same approach as app/dashboard/kitchen/page.js's isChefMember — match
// on whatever free-text role/designation/roleName the account was given.
const isWaiterMember = (member) =>
  [member.role, member.designation, member.roleId?.roleName]
    .filter(Boolean)
    .some((value) =>
      ["waiter", "server"].some((term) => String(value).toLowerCase().includes(term)),
    );

const orderStatusStyles = {
  pending:
    "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/15 dark:text-yellow-400 dark:border-yellow-500/30",
  held: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/15 dark:text-sky-400 dark:border-sky-500/30",
  completed:
    "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-400 dark:border-indigo-500/30",
  cancelled:
    "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-500/15 dark:text-gray-400 dark:border-gray-500/30",
};

function OrderStatusCell({ row, updatingId, onChange }) {
  const value = row.status?.toLowerCase();
  const isKnown = ORDER_STATUS_OPTIONS.includes(value);
  const isUpdating = updatingId === row._id;

  return (
    <div onClick={(event) => event.stopPropagation()}>
      <Select
        value={isKnown ? value : undefined}
        placeholder={row.status || "-"}
        size="small"
        variant="borderless"
        loading={isUpdating}
        disabled={isUpdating}
        onChange={(nextStatus) => onChange(row, nextStatus)}
        popupMatchSelectWidth={false}
        className={cn(
          "min-w-28 rounded-full border font-medium capitalize",
          "[&_.ant-select-selector]:bg-transparent! [&_.ant-select-selection-item]:capitalize",
          isKnown ? orderStatusStyles[value] : orderStatusStyles.pending,
        )}
        options={ORDER_STATUS_OPTIONS.map((status) => ({
          value: status,
          label: status.charAt(0).toUpperCase() + status.slice(1),
        }))}
      />
    </div>
  );
}

function WaiterCell({ row, waiters, updatingId, onChange }) {
  return (
    <div onClick={(event) => event.stopPropagation()}>
      <Select
        value={row.waiterId || undefined}
        placeholder="Assign waiter"
        size="small"
        variant="borderless"
        loading={updatingId === row._id}
        disabled={updatingId === row._id}
        onChange={(waiterId) => onChange(row, waiterId)}
        popupMatchSelectWidth={false}
        className="min-w-32"
        options={waiters.map((waiter) => ({
          value: waiter._id,
          label: waiter.name,
        }))}
      />
    </div>
  );
}

function KitchenSectionCell({ row, updatingId, onChange }) {
  return (
    <div onClick={(event) => event.stopPropagation()}>
      <Select
        value={row.kitchenSection || undefined}
        placeholder="Assign section"
        size="small"
        variant="borderless"
        loading={updatingId === row._id}
        disabled={updatingId === row._id}
        onChange={(kitchenSection) => onChange(row, kitchenSection)}
        popupMatchSelectWidth={false}
        className="min-w-32"
        options={KITCHEN_SECTION_OPTIONS}
      />
    </div>
  );
}

export default function OrdersList() {
  const [ordersData, setordersDataa] = useState([]);
  const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [waiterUpdatingId, setWaiterUpdatingId] = useState(null);
  const [kitchenUpdatingId, setKitchenUpdatingId] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [waiters, setWaiters] = useState([]);

  const getOrdersList = useCallback(async () => {
    try {
      const result = await getAction(API.GET_BILL_LIST, {});
      if (result?.statusCode === 200) {
        setordersDataa(result?.data || []);
      }
    } catch (error) {}
  }, []);

  useEffect(() => {
    const getWaiters = async () => {
      try {
        const result = await getAction(`${API.GET_STAFF_LIST}?status=active&limit=100`);
        if (result?.statusCode === 200) {
          setWaiters((result?.data || []).filter(isWaiterMember));
        }
      } catch (error) {}
    };
    getWaiters();
  }, []);

  useEffect(() => {
    getOrdersList();

    const token = getAccessToken();
    const branchId = getDefaultBranchId();
    if (!token || !branchId) return;

    connectSocket({ token });
    joinBranch(branchId);
    // Bill.kitchenStatus is server-computed from the KOT(s) on every KOT
    // change (see kot.service.js#computeBillKitchenStatus) — a fresh
    // pos/list fetch is all that's needed to pick it up.
    registerKotListeners({
      onKotCreated: getOrdersList,
      onOrderCreated: getOrdersList,
      onKotStatusUpdated: getOrdersList,
      onKotItemStatusUpdated: getOrdersList,
    });

    return () => {
      removeKotListeners();
    };
  }, [getOrdersList]);

  const filteredOrdersData = ordersData.filter((order) =>
    matchesListStatusFilter(order, selectedStatus),
  );

  const statusCounts = Object.fromEntries(
    LIST_STATUS_FILTERS.map(({ key }) => [
      key,
      ordersData.filter((order) => matchesListStatusFilter(order, key)).length,
    ]),
  );

  const handleView = (_id, row) => {
    setSelectedOrder(row);
    setViewDrawerOpen(true);
  };

  const handleStatusChange = async (row, nextStatus) => {
    const prevStatus = row.status;
    if (nextStatus === prevStatus) return;

    setUpdatingId(row._id);
    setordersDataa((prev) =>
      prev.map((order) =>
        order._id === row._id ? { ...order, status: nextStatus } : order,
      ),
    );

    try {
      const result = await patchAction(
        `${API.UPDATE_BILL}/${row._id}`,
        {
          status: nextStatus,
          paymentStatus: nextStatus === "completed" ? "paid" : undefined,
        },
      );
      if (result?.statusCode === 200) {
        message.success("Order status updated");
      } else {
        throw new Error(result?.message || "Unable to update order status");
      }
    } catch (error) {
      setordersDataa((prev) =>
        prev.map((order) =>
          order._id === row._id ? { ...order, status: prevStatus } : order,
        ),
      );
      message.error(error?.message || "Unable to update order status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleWaiterChange = async (row, waiterId) => {
    const prevWaiterId = row.waiterId;
    const prevWaiterName = row.waiterName;
    const waiter = waiters.find((w) => w._id === waiterId);

    setWaiterUpdatingId(row._id);
    setordersDataa((prev) =>
      prev.map((order) =>
        order._id === row._id
          ? { ...order, waiterId, waiterName: waiter?.name || "" }
          : order,
      ),
    );

    try {
      const result = await patchAction(`${API.UPDATE_BILL}/${row._id}`, {
        waiterId,
        waiterName: waiter?.name || "",
      });
      if (result?.statusCode === 200) {
        message.success(`Assigned to ${waiter?.name || "waiter"}`);
      } else {
        throw new Error(result?.message || "Unable to assign waiter");
      }
    } catch (error) {
      setordersDataa((prev) =>
        prev.map((order) =>
          order._id === row._id
            ? { ...order, waiterId: prevWaiterId, waiterName: prevWaiterName }
            : order,
        ),
      );
      message.error(error?.message || "Unable to assign waiter");
    } finally {
      setWaiterUpdatingId(null);
    }
  };

  const handleKitchenSectionChange = async (row, kitchenSection) => {
    const prevKitchenSection = row.kitchenSection;

    setKitchenUpdatingId(row._id);
    setordersDataa((prev) =>
      prev.map((order) =>
        order._id === row._id ? { ...order, kitchenSection } : order,
      ),
    );

    try {
      const result = await patchAction(`${API.UPDATE_BILL}/${row._id}`, {
        kitchenSection,
      });
      if (result?.statusCode === 200) {
        message.success("Kitchen section updated");
      } else {
        throw new Error(result?.message || "Unable to update kitchen section");
      }
    } catch (error) {
      setordersDataa((prev) =>
        prev.map((order) =>
          order._id === row._id
            ? { ...order, kitchenSection: prevKitchenSection }
            : order,
        ),
      );
      message.error(error?.message || "Unable to update kitchen section");
    } finally {
      setKitchenUpdatingId(null);
    }
  };

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
    {
      title: "Waiter",
      value: "waiterId",
      width: 160,
      render: (_value, row) => (
        <WaiterCell
          row={row}
          waiters={waiters}
          updatingId={waiterUpdatingId}
          onChange={handleWaiterChange}
        />
      ),
    },
    {
      title: "Kitchen Section",
      value: "kitchenSection",
      width: 160,
      render: (_value, row) => (
        <KitchenSectionCell
          row={row}
          updatingId={kitchenUpdatingId}
          onChange={handleKitchenSectionChange}
        />
      ),
    },
    {
      title: "Order Status",
      value: "status",
      width: 160,
      render: (_value, row) => (
        <OrderStatusCell
          row={row}
          updatingId={updatingId}
          onChange={handleStatusChange}
        />
      ),
    },
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

  return (
    <div className="flex flex-col gap-4">
      <Heading title="Orders" description="Manage your restaurant orders" />
      <div className="flex flex-wrap gap-2">
        {LIST_STATUS_FILTERS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setSelectedStatus(key)}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium cursor-pointer",
              selectedStatus === key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground",
            )}
          >
            {label} ({statusCounts[key]})
          </button>
        ))}
      </div>
      <Table
        header={ordersHeader}
        data={filteredOrdersData}
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
