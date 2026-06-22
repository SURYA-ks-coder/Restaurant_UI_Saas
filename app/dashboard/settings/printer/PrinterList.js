"use client";

import { useEffect, useState } from "react";
import { Bluetooth, Usb, Wifi } from "lucide-react";
import Table from "@/components/ui/Table";
import { action, API, getAction } from "@/lib/API";
import AddPrinter from "./AddPrinter";

const CONNECTION_ICONS = {
  network: <Wifi size={14} className="mr-1 inline" />,
  usb: <Usb size={14} className="mr-1 inline" />,
  bluetooth: <Bluetooth size={14} className="mr-1 inline" />,
};

const printerHeaders = [
  { title: "Printer Name", value: "printerName", type: "bold", width: 200 },
  {
    title: "Type",
    value: "printerType",
    width: 130,
    render: (value) => (
      <span className="capitalize">{value || "-"}</span>
    ),
  },
  {
    title: "Connection",
    value: "connectionType",
    width: 140,
    render: (value) => (
      <span className="flex items-center capitalize">
        {CONNECTION_ICONS[value?.toLowerCase()]}
        {value || "-"}
      </span>
    ),
  },
  {
    title: "IP / Port",
    value: "ipAddress",
    width: 170,
    render: (value, row) =>
      row.connectionType === "network" && value
        ? `${value} : ${row.port || 9100}`
        : "-",
  },
  { title: "Paper Size", value: "paperSize", width: 120 },
  {
    title: "Auto Print",
    value: "autoPrint",
    width: 110,
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
  { title: "Status", value: "status", type: "status", width: 110 },
  {
    title: "Created",
    value: "createdAt",
    width: 130,
    render: (value) => (value ? new Date(value).toLocaleDateString() : "-"),
  },
  { title: "Actions", value: "actions", type: "action", align: "right" },
];

export default function PrinterList({ refreshKey }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [printerId, setPrinterId] = useState(null);

  useEffect(() => {
    fetchList();
  }, [refreshKey]);

  const fetchList = async () => {
    setLoading(true);
    try {
      const result = await getAction(API.GET_PRINTER_LIST);
      if (result?.statusCode === 200) {
        setData(result?.data || []);
      }
    } catch {}
    finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const result = await action(`${API.DELETE_PRINTER}/${id}`, {}, "DELETE");
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
        onEdit={(id) => {
          setPrinterId(id);
          setDrawerOpen(true);
        }}
        onDelete={handleDelete}
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
        />
      )}
    </div>
  );
}
