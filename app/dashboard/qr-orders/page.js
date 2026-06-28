"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  Eye,
  Link2,
  MoreHorizontal,
  Plus,
  QrCode,
  QrCodeIcon,
  RefreshCw,
  Search,
  Send,
  Smartphone,
  UtensilsCrossed,
  Wifi,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFormik } from "formik";
import { action, API, getAction } from "@/lib/API";
import dayjs from "dayjs";
import SearchBox from "@/components/ui/SearchBox";

const qrTables = [
  {
    table: 1,
    seats: 2,
    status: "active",
    scans: 34,
    orders: 8,
    lastScan: "2 min ago",
    url: "flavorhub.app/t/1",
  },
  {
    table: 2,
    seats: 4,
    status: "active",
    scans: 21,
    orders: 5,
    lastScan: "8 min ago",
    url: "flavorhub.app/t/2",
  },
  {
    table: 3,
    seats: 4,
    status: "ordering",
    scans: 48,
    orders: 12,
    lastScan: "Now",
    url: "flavorhub.app/t/3",
  },
  {
    table: 4,
    seats: 6,
    status: "inactive",
    scans: 0,
    orders: 0,
    lastScan: "No scans",
    url: "flavorhub.app/t/4",
  },
  {
    table: 5,
    seats: 2,
    status: "ordering",
    scans: 56,
    orders: 14,
    lastScan: "1 min ago",
    url: "flavorhub.app/t/5",
  },
  {
    table: 6,
    seats: 4,
    status: "active",
    scans: 19,
    orders: 3,
    lastScan: "15 min ago",
    url: "flavorhub.app/t/6",
  },
  {
    table: 7,
    seats: 8,
    status: "active",
    scans: 42,
    orders: 9,
    lastScan: "6 min ago",
    url: "flavorhub.app/t/7",
  },
  {
    table: 8,
    seats: 2,
    status: "needs_refresh",
    scans: 7,
    orders: 1,
    lastScan: "2 hrs ago",
    url: "flavorhub.app/t/8",
  },
];

const menuHighlights = [
  { name: "Wagyu Beef Steak", views: 186, conversion: "18%" },
  { name: "Truffle Pasta", views: 142, conversion: "22%" },
  { name: "Chocolate Lava Cake", views: 119, conversion: "31%" },
];

const campaigns = [
  { title: "Weekend Chef Specials", status: "Live", reach: "24 tables" },
  { title: "Dessert Upsell", status: "Scheduled", reach: "Dinner shift" },
  { title: "Happy Hour Mocktails", status: "Draft", reach: "Bar section" },
];

const statusStyles = {
  active: {
    label: "Active",
    className: "bg-success/10 text-success",
    dot: "bg-success",
  },
  available: {
    label: "Available",
    className: "bg-success/10 text-success",
    dot: "bg-success",
  },
  ordering: {
    label: "Ordering",
    className: "bg-primary/10 text-primary",
    dot: "bg-primary",
  },
  inactive: {
    label: "Inactive",
    className: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground",
  },
  needs_refresh: {
    label: "Refresh",
    className: "bg-warning/10 text-warning",
    dot: "bg-warning",
  },
};

export default function QrOrdersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedTable, setSelectedTable] = useState(qrTables[0]);
  const [tables, setTables] = useState([]);

  const metrics = useMemo(() => {
    return {
      scans: tables.reduce((sum, table) => sum + (table.totalOrders || 0), 0),
      orders: tables.reduce((sum, table) => sum + (table.totalQrOrder || 0), 0),
      active: tables.filter(
        (table) => table.status === "active" || table.status === "ordering",
      ).length,
      liveOrders: tables.filter((table) => table.status === "ordering").length,
    };
  }, [tables]);

  const filteredTables = tables.filter((table) => {
    const matchesStatus =
      selectedStatus === "all" || table.status === selectedStatus;
    const matchesSearch = `${table.tableName}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const formik = useFormik({
    initialValues: {
      table: selectedTable,
      orderType: "dine_in",
    },
    validate: (values) => {
      // const errors = {};
      // if (!values.table) {
      //   errors.table = "Select a table";
      // }
      // if (!values.orderType) {
      //   errors.orderType = "Select an order type";
      // }
      // if (!order.length) {
      //   errors.order = "Add at least one item before checkout";
      // }
      // return errors;
    },
    onSubmit: async (values, { setSubmitting }) => {
      const payload = {
        restaurantId: selectedTable.restaurantId,
        branchId: selectedTable.branchId,
        tableId: selectedTable._id,
        tableNumber: selectedTable.tableNumber,
        table: selectedTable.tableName,
        orderType: selectedTable.orderType,
        customerName: "Surya", //
        items: order.map((item) => ({
          menuItemId: item.id,
          itemName: item.name,
          category: item.category,
          type: item.type,
          price: item.price,
        })),

        subtotal,
        tax,
        total,
      };

      try {
        // setMessage("Creating order...");
        const response = await action(API.QR_ORDER_CREATE, payload);

        if (response?.success === false) {
          setMessage(response?.message || "Order could not be created");
          return;
        }

        setMessage(response?.message || `Order created for ${values.table}`);
        setOrder([]);
      } catch (error) {
        console.error(error);
        setMessage("Order could not be created. Please try again.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  const getTableList = async () => {
    try {
      const result = await getAction(API.GET_ALL_TABLE_ORDER_BASED, {});
      if (result.statusCode === 200) {
        const tableData = result.data;
        setSelectedTable(tableData[0]);
        setTables(tableData);
      }
    } catch (error) {}
  };

  useEffect(() => {
    getTableList();
  }, []);

  return (
    <div className="min-h-screen bg-background ">
      <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-3xl font-bold">QR Orders</h1>
          <p className="mt-2 text-muted-foreground">
            Manage table QR menus, guest ordering, and mobile order flow.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted">
            <Download className="h-4 w-4" />
            Export QR Codes
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            <Plus className="h-4 w-4" />
            Create QR Menu
          </button>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total Scans"
          value={metrics.scans}
          detail="Today across tables"
          icon={QrCode}
          tone="primary"
        />
        <MetricCard
          title="QR Orders"
          value={metrics.orders}
          detail="Submitted by guests"
          icon={Smartphone}
          tone="success"
        />
        <MetricCard
          title="Active Tables"
          value={metrics.active}
          detail="QR menus online"
          icon={Wifi}
          tone="accent"
        />
        <MetricCard
          title="Live Carts"
          value={metrics.liveOrders}
          detail="Awaiting action"
          icon={Activity}
          tone="warning"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        <section>
          <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search table or QR link"
                className="h-10 w-full rounded-lg border border-border bg-muted pl-10 pr-3 text-sm outline-none focus:border-primary"
              />
            </div> */}
            <SearchBox
              value={searchQuery}
              change={(e) => setSearchQuery(e)}
              placeholder="Search table or QR link"
              className="w-full"
            />
            {/* <div className="flex gap-2 overflow-x-auto pb-1">
              {["all", "active", "ordering", "inactive", "needs_refresh"].map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={cn(
                      "whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium capitalize",
                      selectedStatus === status
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {status.replace("_", " ")}
                  </button>
                ),
              )}
            </div> */}
          </div>

          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {filteredTables.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-linear-to-b from-muted/40 to-muted/10 px-6 py-20 text-center">
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted shadow-inner">
                  <QrCode className="h-7 w-7 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold tracking-tight">
                  {tables.length === 0 ? "No QR tables configured" : "No tables match your search"}
                </h3>
                <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                  {tables.length === 0
                    ? "Generate QR codes for your tables so guests can scan and order directly from their phones."
                    : "Try adjusting your search to find the table you're looking for."}
                </p>
              </div>
            )}
            {filteredTables.map((table) => {
              const style = statusStyles[table.status];
              const isSelected = selectedTable?._id === table._id;

              return (
                <button
                  key={table._id}
                  onClick={() => {
                    setSelectedTable(table);
                  }}
                  className={cn(
                    "rounded-lg bg-white dark:bg-card shadow p-4 text-left transition-all hover:-translate-y-0.5 hover:bg-muted/30",
                    isSelected &&
                      "border-primary/50 bg-primary/5 ring-2 ring-primary/30",
                  )}
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Table</p>
                      <h2 className="text-3xl font-bold">{table?.tableName}</h2>
                    </div>
                    <span
                      className={cn(
                        "inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs font-medium capitalize",
                        style?.className,
                      )}
                    >
                      <span
                        className={cn("h-2 w-2 rounded-full ", style?.dot)}
                      />
                      {table?.status}
                    </span>
                  </div>

                  <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <UtensilsCrossed className="h-4 w-4" />
                    {table.capacity} seats
                    <span className="h-1 w-1 rounded-full bg-muted-foreground" />
                    {dayjs(table.updatedAt).format("hh:mm A")}
                  </div>

                  <div className="rounded-lg bg-muted/30 p-2 flex flex-col gap-1.5 ">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Orders</span>
                      <span className="font-medium">{table?.totalOrders}</span>
                    </div>
                    <div className=" flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Revenue</span>
                      <span className="font-medium">
                        ₹ {table?.totalRevenue}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <aside className="space-y-6">
          <section className="bg-white dark:bg-card shadow rounded-lg p-5">
            <div className="mb-4 flex items-center  gap-2">
              <div>
                <h2 className="text-lg font-semibold">QR Preview</h2>
                <p className="text-sm text-muted-foreground">
                  Selected table link
                </p>
              </div>
              {/* <MoreHorizontal
                  className="h-4 w-4 text-muted-foreground cursor-pointer"
                  onClick={(e) => {
                    // e.stopPropagation();
                    formik?.handleSubmit();
                  }}
                /> */}
            </div>

            {selectedTable && (
              <div>
                <div className="mb-4 flex aspect-square items-center justify-center rounded-lg border border-border bg-muted/30">
                  {/* <div className="grid h-36 w-36 grid-cols-5 gap-1 rounded-lg bg-background p-3"></div> */}
                  <img
                    src={selectedTable.qrCodeDataUrl}
                    alt="QR Code"
                    className=" rounded-lg"
                    // width={100}
                    // height={100}
                  />
                </div>

                <div className="space-y-3 text-sm">
                  <InfoRow label="Table" value={selectedTable?.tableName} />
                  <InfoRow
                    label="Status"
                    value={statusStyles[selectedTable?.status]?.label}
                  />
                  <InfoRow
                    label="QR Orders"
                    value={selectedTable?.totalQrOrder}
                  />
                  <InfoRow
                    label="Totla Orders"
                    value={selectedTable?.totalOrders}
                  />

                  <InfoRow
                    label="Last Scan"
                    value={dayjs(selectedTable?.updatedAt).format("hh:mm A")}
                  />
                </div>

                <div className="mt-5 grid grid-cols-3 gap-2">
                  <button
                    className="rounded-lg border border-border p-2 hover:bg-muted"
                    title="Copy link"
                  >
                    <Copy className="mx-auto h-4 w-4" />
                  </button>
                  <button
                    className="rounded-lg border border-border p-2 hover:bg-muted"
                    title="Preview"
                  >
                    <Eye className="mx-auto h-4 w-4" />
                  </button>
                  <button
                    className="rounded-lg border border-border p-2 hover:bg-muted"
                    title="Refresh"
                  >
                    <RefreshCw className="mx-auto h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </section>
          {/* 
          <section className="bg-white dark:bg-card shadow rounded-lg p-5">
            <h2 className="text-lg font-semibold">Live Mobile Orders</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Guest activity from QR menus
            </p>
            <div className="space-y-3">
              {mobileOrders.map((order) => (
                <div key={order.id} className="rounded-lg bg-muted/30 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{order.id}</p>
                    <span className="text-sm font-semibold">{order.total}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {order.table} • {order.guest} • {order.items} items
                  </p>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-primary">{order.status}</span>
                    <span className="text-muted-foreground">{order.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white dark:bg-card shadow rounded-lg p-5">
            <h2 className="text-lg font-semibold">Menu Highlights</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Most viewed QR items
            </p>
            <div className="space-y-3">
              {menuHighlights.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between rounded-lg bg-muted/30 p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.views} views
                    </p>
                  </div>
                  <span className="text-sm text-success">
                    {item.conversion}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white dark:bg-card shadow rounded-lg p-5">
            <h2 className="text-lg font-semibold">QR Campaigns</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Promotions shown inside guest menu
            </p>
            <div className="space-y-3">
              {campaigns.map((campaign) => (
                <div
                  key={campaign.title}
                  className="rounded-lg bg-muted/30 p-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{campaign.title}</p>
                    <span className="text-xs text-primary">
                      {campaign.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {campaign.reach}
                  </p>
                </div>
              ))}
              <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-border py-2 text-sm hover:bg-muted">
                <Send className="h-4 w-4" />
                Push Campaign
              </button>
            </div>
          </section> */}
        </aside>
      </div>
    </div>
  );
}

function MetricCard({ title, value, detail, icon: Icon, tone }) {
  const tones = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    accent: "bg-accent/10 text-accent",
    warning: "bg-warning/10 text-warning",
  };

  return (
    <div className="bg-white dark:bg-card shadow rounded-lg p-3 px-4">
      <div className=" flex items-center justify-between">
        <div className=" flex items-center justify-between gap-2">
          <div className={cn("rounded-lg p-3", tones[tone])}>
            <Icon className="h-5 w-5" />
          </div>
          {/* <CheckCircle2 className="h-4 w-4 text-muted-foreground" /> */}
          <div className="">
            <p className="font-medium text-sm">{title}</p>
            <p className="text-xs text-muted-foreground">{detail}</p>
          </div>
        </div>
        <p className="text-2xl font-semibold">{value}</p>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border pb-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate text-right font-medium">{value}</span>
    </div>
  );
}
