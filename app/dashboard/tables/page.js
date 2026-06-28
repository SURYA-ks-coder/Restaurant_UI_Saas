"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  CheckCircle2,
  Clock,
  MoreHorizontal,
  Plus,
  Search,
  Sparkles,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import { cn } from "@/lib/utils";
import CreateTable from "./TableManage/CreateTable";
import Reservations from "./TableManage/Reservations";
import { action, API, getAction } from "@/lib/API";
import { Button, Dropdown } from "antd";
import { FiDownload } from "react-icons/fi";
import dayjs from "dayjs";
import ButtonClick from "@/components/ui/ButtonClick";

const statusStyles = {
  available: {
    label: "Available",
    dot: "bg-success",
    panel: "border-success/30 bg-success/5",
    text: "text-success",
  },
  occupied: {
    label: "Occupied",
    dot: "bg-primary",
    panel: "border-primary/30 bg-primary/5",
    text: "text-primary",
  },
  reserved: {
    label: "Reserved",
    dot: "bg-warning",
    panel: "border-warning/30 bg-warning/5",
    text: "text-warning",
  },
  cleaning: {
    label: "Cleaning",
    dot: "bg-muted-foreground",
    panel: "border-muted-foreground/20 bg-muted/50",
    text: "text-muted-foreground",
  },
};

export default function TablesPage() {
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [tables, setTables] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [selectedTable, setSelectedTable] = useState({});
  const [tableDrawerOpen, setTableDrawerOpen] = useState(false);
  const [reservationDrawerOpen, setReservationDrawerOpen] = useState(false);

  const counts = useMemo(() => {
    return tables.reduce(
      (acc, table) => {
        acc[table.status] = (acc[table.status] || 0) + 1;
        acc.all += 1;
        return acc;
      },
      { all: 0, available: 0, occupied: 0, reserved: 0, cleaning: 0 },
    );
  }, [tables]);

  const filteredTables = tables.filter((table) => {
    const matchesStatus =
      selectedStatus === "all" || table.status === selectedStatus;
    const searchable =
      `${table.tableName || ""} ${table.tableNumber || ""}`.toLowerCase();
    const matchesSearch = searchable.includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const occupiedRevenue = tables
    .filter((t) => t.status === "occupied")
    .reduce((sum, t) => sum + Number(t.totalRevenue || 0), 0);

  const upcomingReservations = reservations.filter((r) =>
    ["reserved", "confirmed"].includes(r.status),
  );

  const addCreatedTable = (table) => {
    const nextTable = {
      id: table.tableNumber || table.number || table.id,
      seats: table.capacity || table.seats,
      status: table.status || "available",
      guest: table.tableName,
      server: table.floorName || table.floor || "-",
    };

    setTables((currentTables) => [...currentTables, nextTable]);
    setSelectedTable(nextTable);
  };

  const addCreatedReservation = (reservation) => {
    const reservationTableId = String(reservation.tableId);

    if (reservation.status !== "cancelled") {
      setReservations((prev) => [...prev, reservation]);
      setTables((currentTables) =>
        currentTables.map((table) =>
          String(table._id || table.id) === reservationTableId
            ? { ...table, status: "reserved" }
            : table,
        ),
      );
    }
  };

  const getTableList = async () => {
    try {
      const result = await getAction(API.GET_TABLE_LIST, {});
      if (result.statusCode === 200) {
        const tableData = result.data;
        setSelectedTable(tableData[0]);
        setTables(tableData);
      }
    } catch (error) {}
  };

  const getReservationList = async () => {
    try {
      const result = await getAction(API.GET_RESERVATION_LIST, {});
      if (result.statusCode === 200) {
        setReservations(result.data);
      }
    } catch (error) {}
  };

  useEffect(() => {
    getTableList();
    getReservationList();
  }, []);

  const createQRCode = async (tableId) => {
    try {
      const result = await action(`${API.CREATE_QR_CODE}/${tableId}`);
      if (result?.statusCode === 200) {
        getTableList();
        message.success("QR code generated successfully");
      } else {
        message.error(result?.message || "Unable to generate QR code");
      }
    } catch (error) {
      message.error("Unable to generate QR code");
    }
  };

  return (
    <div className="min-h-screen bg-background ">
      <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tables</h1>
          <p className="mt-2 text-muted-foreground">
            Manage floor availability, reservations, and live table service.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setReservationDrawerOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted"
          >
            <CalendarClock className="h-4 w-4" />
            New Reservation
          </button>
          <button
            onClick={() => setTableDrawerOpen({ status: true, table: null })}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            <Plus className="h-4 w-4" />
            Add Table
          </button>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Available"
          value={counts.available}
          detail="Ready to seat"
          icon={CheckCircle2}
          tone="success"
        />
        <SummaryCard
          title="Occupied"
          value={counts.occupied}
          detail={`Open checks: $${occupiedRevenue.toFixed(2)}`}
          icon={Users}
          tone="primary"
        />
        <SummaryCard
          title="Reserved"
          value={counts.reserved}
          detail="Upcoming tonight"
          icon={CalendarClock}
          tone="warning"
        />
        <SummaryCard
          title="Cleaning"
          value={counts.cleaning}
          detail="Turnover in progress"
          icon={Sparkles}
          tone="muted"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        <section>
          <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search table, guest, or server"
                className="h-10 w-full rounded-lg border border-border bg-muted pl-10 pr-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {["all", "available", "occupied", "reserved", "cleaning"].map(
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
                    {status}
                    {/* ({counts[status]}) */}
                  </button>
                ),
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
            {filteredTables.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-linear-to-b from-muted/40 to-muted/10 px-6 py-20 text-center">
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted shadow-inner">
                  <UtensilsCrossed className="h-7 w-7 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold tracking-tight">
                  {tables.length === 0
                    ? "No tables yet"
                    : "No tables match your search"}
                </h3>
                <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                  {tables.length === 0
                    ? "Add your first table to start managing your floor, reservations, and guest service."
                    : "Try adjusting your search or filter to find what you're looking for."}
                </p>
                {tables.length === 0 && (
                  <ButtonClick
                    handleSubmit={() =>
                      setTableDrawerOpen({ status: true, table: null })
                    }
                    BtnType="primary"
                    buttonName={"Add First Table"}
                    icon={<Plus className="h-4 w-4" />}
                    className=" mt-6 flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
                  >
                    {/* <Plus className="h-4 w-4" />
                    Add First Table */}
                  </ButtonClick>
                )}
              </div>
            )}
            {filteredTables.map((table) => {
              const style = statusStyles[table.status];
              const isSelected = selectedTable?._id === table._id;
              const reservation = reservations.find(
                (r) => String(r.tableId) === String(table._id),
              );
              const elapsedMin = dayjs().diff(dayjs(table.updatedAt), "minute");
              const elapsed =
                elapsedMin < 60
                  ? `${elapsedMin} min`
                  : `${Math.floor(elapsedMin / 60)} hr ${elapsedMin % 60} min`;

              return (
                <button
                  key={table._id}
                  onClick={() => setSelectedTable(table)}
                  className={cn(
                    "rounded-lg p-4 text-left transition-all hover:-translate-y-0.5 bg-white dark:bg-card shadow ",
                    isSelected && "border-primary/50 ring-2 ring-primary/20",
                  )}
                >
                  <div className="mb-5 flex items-start justify-between">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm text-muted-foreground">
                        Table {table.tableNumber}
                      </p>
                      <h2 className="text-3xl font-bold">{table.tableName}</h2>
                    </div>
                    <p
                      className={cn(
                        "flex items-center gap-2 rounded-full bg-background/60 px-3 py-1 text-xs font-medium capitalize",
                        style.text,
                      )}
                    >
                      <span className={cn("h-2 w-2 rounded-full", style.dot)} />
                      {style.label}
                    </p>
                  </div>

                  <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <UtensilsCrossed className="h-4 w-4" />
                    {table.capacity} seats
                    <span className="h-1 w-1 rounded-full bg-muted-foreground" />
                    {dayjs(table.updatedAt).format("hh:mm A")}
                  </div>

                  {table.qrCodeDataUrl && (
                    <div className="flex items-center gap-2 pb-2 text-sm">
                      <img
                        src={table.qrCodeDataUrl}
                        alt="QR Code"
                        width={100}
                        height={100}
                      />
                      <a
                        href={table.qrCodeDataUrl}
                        download={`table-${table.tableNumber}-qr.png`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 rounded-lg hover:bg-muted px-3 py-2 text-sm font-medium text-black dark:text-white"
                      >
                        <FiDownload className="text-2xl" />
                      </a>
                    </div>
                  )}

                  <div className="min-h-16 rounded-lg bg-background/50 p-3">
                    {table.status === "available" && (
                      <p className="text-sm text-muted-foreground">
                        Ready for the next guest party.
                      </p>
                    )}
                    {table.status === "occupied" && (
                      <>
                        <p className="text-sm font-medium">
                          {table.guestName || table.customerName || "Guest"}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {elapsed} seated
                          {table.totalRevenue
                            ? ` • ₹${table.totalRevenue}`
                            : ""}
                        </p>
                      </>
                    )}
                    {table.status === "reserved" && (
                      <>
                        <p className="text-sm font-medium">
                          {reservation?.guestName || "Reserved"}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {reservation?.reservationTime
                            ? `Arrives at ${reservation.reservationTime}`
                            : `${reservation?.partySize || table.capacity} guests`}
                        </p>
                      </>
                    )}
                    {table.status === "cleaning" && (
                      <p className="text-sm text-muted-foreground">
                        Reset started {elapsed} ago.
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <aside className="space-y-6">
          <section className="bg-white dark:bg-card shadow rounded-lg p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Selected Table</h2>
                <p className="text-sm text-muted-foreground">Quick actions</p>
              </div>
              <Dropdown
                menu={{
                  items: [
                    { key: "1", label: "Generate QR code" },
                    { key: "2", label: "Edit Table" },
                    { key: "3", label: "Add Reservation" },
                    { key: "4", label: "Mark as Cleaned" },
                  ],
                  onClick: (info) => {
                    if (info.key === "1") {
                      createQRCode(selectedTable._id);
                    } else if (info.key === "2") {
                      setTableDrawerOpen({
                        status: true,
                        table: selectedTable,
                      });
                    } else if (info.key === "3") {
                      setReservationDrawerOpen(true);
                    } else if (info.key === "4") {
                      // Mark as cleaned logic here
                    }
                  },
                }}
                // onOpenChange={(info) => {
                //   // if (info.key === "1") {
                //   createQRCode(selectedTable._id);
                //   // }
                // }}
                trigger={["click"]}
                className="rounded-lg p-2 text-muted-foreground bg-foreground hover:text-foreground"
              >
                <button className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </Dropdown>
            </div>

            {selectedTable && (
              <div>
                {/* Table Card */}
                <div
                  className={cn(
                    "mb-4 rounded-lg  p-4 bg-white dark:bg-card ",
                    statusStyles[selectedTable.status]?.panel,
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {selectedTable.tableName}
                    </span>

                    <span
                      className={cn(
                        "text-sm font-medium",
                        statusStyles[selectedTable.status]?.text,
                      )}
                    >
                      {statusStyles[selectedTable.status]?.label}
                    </span>
                  </div>

                  <p className="mt-2 text-2xl font-semibold">
                    {selectedTable.capacity} Seats
                  </p>
                </div>

                {/* Details */}
                <div className="space-y-3 text-sm">
                  {(() => {
                    const linkedReservation = reservations.find(
                      (r) => String(r.tableId) === String(selectedTable._id),
                    );
                    const elapsedMin = dayjs().diff(
                      dayjs(selectedTable.updatedAt),
                      "minute",
                    );
                    const elapsed =
                      elapsedMin < 60
                        ? `${elapsedMin} min`
                        : `${Math.floor(elapsedMin / 60)} hr ${elapsedMin % 60} min`;

                    return (
                      <>
                        <InfoRow
                          label="Guest"
                          value={
                            selectedTable.guestName ||
                            selectedTable.customerName ||
                            linkedReservation?.guestName ||
                            "No guest seated"
                          }
                        />
                        <InfoRow
                          label="Party Size"
                          value={
                            linkedReservation?.partySize ||
                            selectedTable.capacity
                              ? `${linkedReservation?.partySize || selectedTable.capacity} guests`
                              : "-"
                          }
                        />
                        <InfoRow
                          label="Time"
                          value={
                            selectedTable.status === "occupied"
                              ? `${elapsed} seated`
                              : selectedTable.status === "reserved"
                                ? linkedReservation?.reservationTime ||
                                  "Pending"
                                : selectedTable.status === "cleaning"
                                  ? `${elapsed} ago`
                                  : "Available now"
                          }
                        />
                        <InfoRow
                          label="Revenue"
                          value={
                            selectedTable.totalRevenue
                              ? `₹${selectedTable.totalRevenue}`
                              : "-"
                          }
                        />
                        <InfoRow
                          label="Table No"
                          value={selectedTable.tableNumber}
                        />
                        <InfoRow
                          label="Floor"
                          value={
                            selectedTable.floorName ||
                            selectedTable.floor ||
                            "-"
                          }
                        />
                        <InfoRow
                          label="Created"
                          value={
                            selectedTable.createdAt
                              ? dayjs(selectedTable.createdAt).format(
                                  "DD MMM YYYY, hh:mm A",
                                )
                              : "-"
                          }
                        />
                      </>
                    );
                  })()}
                </div>

                {/* Actions */}

                <div className="mt-5 grid grid-cols-2 gap-2">
                  <Button
                    type="primary"
                    onClick={() => {
                      const isAvailable = selectedTable?.status === "available";
                      if (isAvailable) {
                        handleTakeTable(selectedTable);
                      } else {
                        handleOpenCheck(selectedTable);
                      }
                    }}
                    className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
                  >
                    {selectedTable?.status === "available"
                      ? "Assign Table"
                      : "Manage Table"}
                  </Button>

                  <Button
                    type="primary"
                    onClick={() => handleMarkClean(selectedTable)}
                    className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted"
                  >
                    Mark Clean
                  </Button>
                </div>
              </div>
            )}
          </section>

          <section className="bg-white dark:bg-card shadow rounded-lg p-5">
            <h2 className="text-lg font-semibold">Upcoming</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Reservations queued tonight
            </p>
            <div className="space-y-3">
              {upcomingReservations.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No upcoming reservations.
                </p>
              )}
              {upcomingReservations.map((reservation) => {
                const reservedTable = tables.find(
                  (t) => String(t._id) === String(reservation.tableId),
                );
                return (
                  <div
                    key={reservation._id}
                    className="rounded-lg bg-muted/30 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">
                        {reservation.guestName}
                      </p>
                      <span className="flex items-center gap-1 text-xs text-warning">
                        <Clock className="h-3 w-3" />
                        {reservation.reservationTime}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {reservedTable ? `${reservedTable.tableName}` : "Table"} •{" "}
                      {reservation.partySize} guests
                    </p>
                    <p className="mt-0.5 text-xs capitalize text-muted-foreground">
                      {reservation.status}
                      {reservation.reservationDate
                        ? ` · ${dayjs(reservation.reservationDate).format("DD MMM")}`
                        : ""}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        </aside>
      </div>
      <CreateTable
        open={tableDrawerOpen.status}
        onOpenChange={(status) =>
          setTableDrawerOpen({ table: null, status: false })
        }
        onCreated={addCreatedTable}
        updateId={tableDrawerOpen?.table?._id}
        refresh={getTableList}
      />
      <Reservations
        open={reservationDrawerOpen}
        onOpenChange={setReservationDrawerOpen}
        onCreated={addCreatedReservation}
      />
    </div>
  );
}

function SummaryCard({ title, value, detail, icon: Icon, tone }) {
  const tones = {
    success: "bg-success/10 text-success",
    primary: "bg-primary/10 text-primary",
    warning: "bg-warning/10 text-warning",
    muted: "bg-muted text-muted-foreground",
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
    // <div className="border rounded-lg p-5 bg-white/50 dark:bg-card/50">
    //   <div className="mb-4 flex items-center justify-between">
    //     <div className={cn("rounded-lg p-3", tones[tone])}>
    //       <Icon className="h-5 w-5" />
    //     </div>
    //     <span className="text-3xl font-semibold">{value}</span>
    //   </div>
    //   <p className="font-medium">{title}</p>
    //   <p className="text-sm text-muted-foreground">{detail}</p>
    // </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
