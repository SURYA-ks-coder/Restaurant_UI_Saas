"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  MoreHorizontal,
  Plus,
  QrCode,
  Search,
  Sparkles,
  Users,
  UtensilsCrossed,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import CreateTable from "./TableManage/CreateTable";
import Reservations from "./TableManage/Reservations";
import { action, API, getAction } from "@/lib/API";
import { Dropdown, Modal } from "antd";
import { message } from "@/lib/message";
import dayjs from "dayjs";
import ButtonClick from "@/components/ui/ButtonClick";

const STATUS = {
  available: {
    label: "Available",
    dot: "bg-emerald-500",
    card: "border-l-4 border-l-emerald-500",
    badge: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    icon: CheckCircle2,
    color: "text-emerald-600 bg-emerald-50",
  },
  occupied: {
    label: "Occupied",
    dot: "bg-blue-500",
    card: "border-l-4 border-l-blue-500",
    badge: "bg-blue-50 text-blue-700 border border-blue-200",
    icon: Users,
    color: "text-blue-600 bg-blue-50",
  },
  reserved: {
    label: "Reserved",
    dot: "bg-amber-500",
    card: "border-l-4 border-l-amber-500",
    badge: "bg-amber-50 text-amber-700 border border-amber-200",
    icon: CalendarClock,
    color: "text-amber-600 bg-amber-50",
  },
  cleaning: {
    label: "Cleaning",
    dot: "bg-slate-400",
    card: "border-l-4 border-l-slate-400",
    badge: "bg-slate-50 text-slate-600 border border-slate-200",
    icon: Sparkles,
    color: "text-slate-500 bg-slate-100",
  },
};

export default function TablesPage() {
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [tables, setTables] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableDrawerOpen, setTableDrawerOpen] = useState(false);
  const [reservationDrawerOpen, setReservationDrawerOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [generatingQr, setGeneratingQr] = useState(false);

  const counts = useMemo(
    () =>
      tables.reduce(
        (acc, t) => {
          acc[t.status] = (acc[t.status] || 0) + 1;
          acc.all += 1;
          return acc;
        },
        { all: 0, available: 0, occupied: 0, reserved: 0, cleaning: 0 },
      ),
    [tables],
  );

  const filteredTables = tables.filter((t) => {
    const matchStatus = selectedStatus === "all" || t.status === selectedStatus;
    const matchSearch = `${t.tableName || ""} ${t.tableNumber || ""}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const occupiedRevenue = tables
    .filter((t) => t.status === "occupied")
    .reduce((sum, t) => sum + Number(t.totalRevenue || 0), 0);

  const upcomingReservations = reservations.filter((r) =>
    ["reserved", "confirmed"].includes(r.status),
  );

  const addCreatedTable = (table) => {
    const next = {
      id: table.tableNumber || table.number || table.id,
      seats: table.capacity || table.seats,
      status: table.status || "available",
      guest: table.tableName,
      server: table.floorName || table.floor || "-",
    };
    setTables((prev) => [...prev, next]);
    setSelectedTable(next);
  };

  const addCreatedReservation = (reservation) => {
    const tid = String(reservation.tableId);
    if (reservation.status !== "cancelled") {
      setReservations((prev) => [...prev, reservation]);
      setTables((prev) =>
        prev.map((t) =>
          String(t._id || t.id) === tid ? { ...t, status: "reserved" } : t,
        ),
      );
    }
  };

  const getTableList = async () => {
    try {
      const result = await getAction(API.GET_TABLE_LIST, {});
      if (result.statusCode === 200) {
        setTables(result.data);
        setSelectedTable((prev) => prev ?? result.data[0] ?? null);
      }
    } catch {}
  };

  const getReservationList = async () => {
    try {
      const result = await getAction(API.GET_RESERVATION_LIST, {});
      if (result.statusCode === 200) setReservations(result.data);
    } catch {}
  };

  useEffect(() => {
    getTableList();
    getReservationList();
  }, []);

  const createQRCode = async (tableId) => {
    try {
      setGeneratingQr(true);
      const result = await action(`${API.CREATE_QR_CODE}/${tableId}`);
      if (result?.statusCode === 200) {
        await getTableList();
        message.success("QR code generated");
      } else {
        message.error(result?.message || "Unable to generate QR code");
      }
    } catch {
      message.error("Unable to generate QR code");
    } finally {
      setGeneratingQr(false);
    }
  };

  const STAT_CARDS = [
    {
      key: "available",
      label: "Available",
      detail: "Ready to seat",
    },
    {
      key: "occupied",
      label: "Occupied",
      detail:
        occupiedRevenue > 0
          ? `₹${occupiedRevenue.toFixed(0)} open`
          : "Active tables",
    },
    { key: "reserved", label: "Reserved", detail: "Booked tonight" },
    { key: "cleaning", label: "Cleaning", detail: "Turnover in progress" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tables</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage floor layout, reservations, and live service status.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setReservationDrawerOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
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

      {/* Stat cards — clickable as filters */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {STAT_CARDS.map(({ key, label, detail }) => {
          const s = STATUS[key];
          const Icon = s.icon;
          return (
            <button
              key={key}
              onClick={() =>
                setSelectedStatus((prev) => (prev === key ? "all" : key))
              }
              className={cn(
                "flex items-center gap-3 rounded-xl bg-white dark:bg-card p-4 shadow-sm text-left transition-all hover:shadow-md",
                selectedStatus === key && "ring-2 ring-primary/30",
              )}
            >
              <div className={cn("rounded-xl p-2.5", s.color)}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{label}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {detail}
                </p>
              </div>
              <span className="text-2xl font-bold">{counts[key]}</span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_21rem]">
        {/* ── Left: table grid ── */}
        <div>
          {/* Filter bar */}
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative max-w-xs flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tables…"
                className="h-9 w-full rounded-lg border border-border bg-muted pl-10 pr-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {["all", "available", "occupied", "reserved", "cleaning"].map(
                (s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedStatus(s)}
                    className={cn(
                      "whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition-colors",
                      selectedStatus === s
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {s}
                    {s !== "all" && (
                      <span className="ml-1 opacity-60">({counts[s]})</span>
                    )}
                  </button>
                ),
              )}
            </div>
          </div>

          {/* Grid */}
          {filteredTables.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 py-20 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                <UtensilsCrossed className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-semibold">
                {tables.length === 0 ? "No tables yet" : "No tables match"}
              </h3>
              <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                {tables.length === 0
                  ? "Add your first table to start managing the floor."
                  : "Adjust your search or filter."}
              </p>
              {tables.length === 0 && (
                <ButtonClick
                  handleSubmit={() =>
                    setTableDrawerOpen({ status: true, table: null })
                  }
                  BtnType="primary"
                  buttonName="Add First Table"
                  icon={<Plus className="h-4 w-4" />}
                  className="mt-5"
                />
              )}
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
              {filteredTables.map((table) => (
                <TableCard
                  key={table._id}
                  table={table}
                  isSelected={selectedTable?._id === table._id}
                  reservation={reservations.find(
                    (r) => String(r.tableId) === String(table._id),
                  )}
                  onClick={() => setSelectedTable(table)}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Right: detail panel ── */}
        <div className="space-y-4">
          {/* Selected table card */}
          <div className="rounded-xl bg-white dark:bg-card shadow-sm p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">Table Details</h2>
              {selectedTable && (
                <Dropdown
                  menu={{
                    items: [
                      {
                        key: "qr",
                        label: "Generate QR code",
                        icon: <QrCode className="h-3.5 w-3.5" />,
                      },
                      { key: "edit", label: "Edit Table" },
                      { key: "reserve", label: "Add Reservation" },
                    ],
                    onClick: ({ key }) => {
                      if (key === "qr") createQRCode(selectedTable._id);
                      else if (key === "edit")
                        setTableDrawerOpen({
                          status: true,
                          table: selectedTable,
                        });
                      else if (key === "reserve")
                        setReservationDrawerOpen(true);
                    },
                  }}
                  trigger={["click"]}
                >
                  <button className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </Dropdown>
              )}
            </div>

            {selectedTable ? (
              <>
                {/* Status banner */}
                {(() => {
                  const s = STATUS[selectedTable.status] || STATUS.available;
                  const Icon = s.icon;
                  return (
                    <div className="mb-4 flex items-center justify-between rounded-xl bg-muted/40 p-4">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Table {selectedTable.tableNumber}
                        </p>
                        <p className="mt-0.5 text-xl font-bold capitalize">
                          {selectedTable.tableName}
                        </p>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {selectedTable.capacity} seats
                        </p>
                      </div>
                      <span
                        className={cn(
                          "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium",
                          s.badge,
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {s.label}
                      </span>
                    </div>
                  );
                })()}

                {/* QR Code section */}
                <div className="mb-4 rounded-xl border border-dashed border-border bg-muted/20 p-4 text-center">
                  {selectedTable.qrCodeDataUrl ? (
                    <>
                      <img
                        src={selectedTable.qrCodeDataUrl}
                        alt="Table QR Code"
                        className="mx-auto mb-3 h-44 w-44 rounded-xl border border-border"
                      />
                      <p className="mb-3 text-xs text-muted-foreground">
                        Scan to order · Table {selectedTable.tableNumber}
                      </p>
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => setQrModalOpen(true)}
                          className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          View Full
                        </button>
                        <a
                          href={selectedTable.qrCodeDataUrl}
                          download={`table-${selectedTable.tableNumber}-qr.png`}
                          className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Download
                        </a>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-xl bg-muted">
                        <QrCode className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="mb-1 text-sm font-medium">No QR code yet</p>
                      <p className="mb-3 text-xs text-muted-foreground">
                        Generate a QR so guests can scan and order directly.
                      </p>
                      <button
                        onClick={() => createQRCode(selectedTable._id)}
                        disabled={generatingQr}
                        className="mx-auto flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground disabled:opacity-60 cursor-pointer"
                      >
                        {generatingQr ? (
                          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                        ) : (
                          <Zap className="h-3.5 w-3.5" />
                        )}
                        {generatingQr ? "Generating…" : "Generate QR"}
                      </button>
                    </>
                  )}
                </div>

                {/* Info rows */}
                {(() => {
                  const reservation = reservations.find(
                    (r) => String(r.tableId) === String(selectedTable._id),
                  );
                  const elapsedMin = dayjs().diff(
                    dayjs(selectedTable.updatedAt),
                    "minute",
                  );
                  const elapsed =
                    elapsedMin < 60
                      ? `${elapsedMin}m`
                      : `${Math.floor(elapsedMin / 60)}h ${elapsedMin % 60}m`;

                  return (
                    <div className="space-y-0 text-sm">
                      <InfoRow
                        label="Guest"
                        value={
                          selectedTable.guestName ||
                          reservation?.guestName ||
                          "—"
                        }
                      />
                      <InfoRow
                        label="Party Size"
                        value={
                          reservation?.partySize
                            ? `${reservation.partySize} guests`
                            : `${selectedTable.capacity} seats`
                        }
                      />
                      <InfoRow
                        label="Status Time"
                        value={
                          selectedTable.status === "occupied"
                            ? `${elapsed} seated`
                            : selectedTable.status === "reserved"
                              ? reservation?.reservationTime || "Pending"
                              : selectedTable.status === "cleaning"
                                ? `${elapsed} ago`
                                : "Available now"
                        }
                      />
                      {Number(selectedTable.totalRevenue) > 0 && (
                        <InfoRow
                          label="Open Check"
                          value={`₹${selectedTable.totalRevenue}`}
                        />
                      )}
                      <InfoRow
                        label="Floor"
                        value={
                          selectedTable.floorName || selectedTable.floor || "—"
                        }
                      />
                      <InfoRow
                        label="Added"
                        value={
                          selectedTable.createdAt
                            ? dayjs(selectedTable.createdAt).format(
                                "DD MMM YYYY",
                              )
                            : "—"
                        }
                      />
                    </div>
                  );
                })()}

                {/* Actions */}
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    onClick={() =>
                      setTableDrawerOpen({
                        status: true,
                        table: selectedTable,
                      })
                    }
                    className="rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-muted"
                  >
                    Edit Table
                  </button>
                  <button className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">
                    {selectedTable.status === "available"
                      ? "Assign Table"
                      : "Manage"}
                  </button>
                </div>
              </>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Select a table to view details.
              </p>
            )}
          </div>

          {/* Upcoming reservations */}
          <div className="rounded-xl bg-white dark:bg-card shadow-sm p-5">
            <h2 className="font-semibold">Upcoming</h2>
            <p className="mb-4 mt-0.5 text-xs text-muted-foreground">
              Reservations queued tonight
            </p>
            <div className="space-y-2">
              {upcomingReservations.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No upcoming reservations.
                </p>
              ) : (
                upcomingReservations.map((r) => {
                  const t = tables.find(
                    (tbl) => String(tbl._id) === String(r.tableId),
                  );
                  return (
                    <div
                      key={r._id}
                      className="flex items-start gap-3 rounded-lg bg-muted/30 p-3"
                    >
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50">
                        <Clock className="h-4 w-4 text-amber-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {r.guestName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t ? t.tableName : "Table"} · {r.partySize} guests
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {r.reservationTime}
                          {r.reservationDate
                            ? ` · ${dayjs(r.reservationDate).format("DD MMM")}`
                            : ""}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium capitalize text-amber-700">
                        {r.status}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* QR full-screen modal */}
      <Modal
        open={qrModalOpen}
        onCancel={() => setQrModalOpen(false)}
        footer={null}
        centered
        width={400}
        title={`QR Code — Table ${selectedTable?.tableNumber}`}
      >
        {selectedTable?.qrCodeDataUrl && (
          <div className="flex flex-col items-center gap-4 py-4">
            <img
              src={selectedTable.qrCodeDataUrl}
              alt="Table QR"
              className="h-64 w-64 rounded-xl border border-border"
            />
            <p className="text-center text-sm text-muted-foreground">
              Guests scan this to view the menu and order for{" "}
              <span className="font-medium">{selectedTable.tableName}</span>.
            </p>
            <a
              href={selectedTable.qrCodeDataUrl}
              download={`table-${selectedTable.tableNumber}-qr.png`}
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              <Download className="h-4 w-4" />
              Download QR Code
            </a>
          </div>
        )}
      </Modal>

      <CreateTable
        open={tableDrawerOpen.status}
        onOpenChange={() => setTableDrawerOpen({ table: null, status: false })}
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

function TableCard({ table, isSelected, reservation, onClick }) {
  const s = STATUS[table.status] || STATUS.available;
  const elapsedMin = dayjs().diff(dayjs(table.updatedAt), "minute");
  const elapsed =
    elapsedMin < 60
      ? `${elapsedMin}m ago`
      : `${Math.floor(elapsedMin / 60)}h ${elapsedMin % 60}m ago`;

  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex flex-col rounded-xl bg-white dark:bg-card text-left shadow-sm transition-all hover:shadow-md",
        s.card,
        isSelected && "ring-2 ring-primary/30 shadow-md",
      )}
    >
      <div className="p-4">
        <div className="mb-3 flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground">
              Table {table.tableNumber}
            </p>
            <h3 className="mt-0.5 text-lg font-bold leading-tight capitalize">
              {table.tableName}
            </h3>
          </div>
          <span
            className={cn(
              "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
              s.badge,
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
            {s.label}
          </span>
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {table.capacity} seats
          </span>
          {table.floorName && (
            <>
              <span className="h-3 w-px bg-border" />
              <span>{table.floorName}</span>
            </>
          )}
          {table.qrCodeDataUrl && (
            <>
              <span className="h-3 w-px bg-border" />
              <span className="flex items-center gap-1 text-primary font-medium">
                <QrCode className="h-3.5 w-3.5" />
                QR Ready
              </span>
            </>
          )}
        </div>

        <div className="rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          {table.status === "available" && "Ready for next guest"}
          {table.status === "occupied" && (
            <>
              {table.guestName || "Guest"} · {elapsed}
              {table.totalRevenue ? ` · ₹${table.totalRevenue}` : ""}
            </>
          )}
          {table.status === "reserved" && (
            <>
              {reservation?.guestName || "Reserved"} ·{" "}
              {reservation?.partySize || table.capacity} guests
              {reservation?.reservationTime
                ? ` · ${reservation.reservationTime}`
                : ""}
            </>
          )}
          {table.status === "cleaning" && `Reset started ${elapsed}`}
        </div>
      </div>
    </button>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-border/50 py-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="ml-2 max-w-[60%] truncate text-right font-medium">
        {value}
      </span>
    </div>
  );
}
