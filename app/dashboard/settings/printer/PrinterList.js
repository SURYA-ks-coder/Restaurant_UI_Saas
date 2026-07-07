"use client";

import { useEffect, useState } from "react";
import { Globe, Monitor } from "lucide-react";
import Table from "@/components/ui/Table";
import { action, API, getAction } from "@/lib/API";
import { hasPermission } from "@/lib/auth";
import AddPrinter from "./AddPrinter";

const CONNECTION_ICONS = {
  lan: <Globe size={14} className="mr-1 inline" />,
  browser: <Monitor size={14} className="mr-1 inline" />,
};

const PURPOSE_LABELS = {
  kot: "KOT",
  bill: "Bill",
  qr_order: "QR Order",
};

const printerHeaders = [
  { title: "Printer Name", value: "name", type: "bold", width: 200 },
  {
    title: "Purpose",
    value: "purpose",
    width: 120,
    render: (value) => PURPOSE_LABELS[value] || value || "-",
  },
  {
    title: "Connection",
    value: "connectionType",
    width: 140,
    render: (value) => (
      <span className="flex items-center capitalize">
        {CONNECTION_ICONS[value]}
        {value === "lan" ? "LAN" : "Browser"}
      </span>
    ),
  },
  {
    title: "IP / Port",
    value: "ip",
    width: 170,
    render: (value, row) =>
      row.connectionType === "lan" && value
        ? `${value} : ${row.port || 9100}`
        : "-",
  },
  { title: "Paper Width", value: "paperWidth", width: 120 },
  {
    title: "Active",
    value: "isActive",
    width: 100,
    render: (value) => (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
          value
            ? "bg-emerald-50 text-emerald-700"
            : "bg-gray-100 text-gray-600"
        }`}
      >
        {value ? "Yes" : "No"}
      </span>
    ),
  },
  { title: "Actions", value: "actions", type: "action", align: "right" },
];

export default function PrinterList({ refreshKey }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [printerId, setPrinterId] = useState(null);
  const canManage = hasPermission("print:manage");

  useEffect(() => {
    fetchList();
  }, [refreshKey]);

  const fetchList = async () => {
    setLoading(true);
    try {
      const result = await getAction(API.GET_PRINT_SETTINGS);
      if (result?.statusCode === 200) {
        setData(result?.data?.printers || []);
      }
    } catch {}
    finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!canManage) return;
    try {
      const result = await action(
        `${API.DELETE_PRINT_PRINTER}/${id}`,
        {},
        "DELETE",
      );
      if (result?.statusCode === 200) fetchList();
    } catch {}
  };

  return (
    <div className="space-y-4">
      <Table
        header={printerHeaders}
        data={data}
        title="Printers"
        rowKey="_id"
        loading={loading}
        searchPlaceholder="Search printer name"
        onView={() => {}}
        onEdit={
          canManage
            ? (id) => {
                setPrinterId(id);
                setDrawerOpen(true);
              }
            : undefined
        }
        onDelete={canManage ? handleDelete : undefined}
      />

      {drawerOpen && (
        <AddPrinter
          open={drawerOpen}
          onOpenChange={(next) => {
            setDrawerOpen(next);
            if (!next) setPrinterId(null);
          }}
          onCreated={() => {
            setPrinterId(null);
            fetchList();
          }}
          updateId={printerId}
          printers={data}
        />
      )}
    </div>
  );
}
