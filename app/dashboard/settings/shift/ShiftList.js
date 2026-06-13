"use client";

import { useEffect, useState } from "react";
import Table from "@/components/ui/Table";
import { action, API, getAction } from "@/lib/API";
import AddShift from "./AddShift";

const shiftHeader = [
  { title: "Shift", value: "shiftName", type: "bold", width: 200 },
  { title: "Start Time", value: "startTime", width: 130 },
  { title: "End Time", value: "endTime", width: 130 },
  { title: "Description", value: "description", width: 260 },
  { title: "Status", value: "status", type: "status", width: 120 },
  {
    title: "Created",
    value: "createdAt",
    render: (value) => (value ? new Date(value).toLocaleDateString() : "-"),
    width: 130,
  },
  { title: "Actions", value: "actions", type: "action", align: "right" },
];

export default function ShiftList({ refreshKey }) {
  const [data, setData] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [shiftId, setShiftId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchList();
  }, [refreshKey]);

  const fetchList = async () => {
    setLoading(true);
    try {
      const result = await getAction(API.GET_STAFF_SHIFT_LIST);
      if (result?.statusCode === 200) {
        setData(result?.data || []);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const result = await action(
        `${API.DELETE_STAFF_SHIFT}/${id}`,
        {},
        "DELETE",
      );
      if (result?.statusCode === 200) {
        fetchList();
      }
    } catch {}
  };

  return (
    <div className="space-y-4">
      <Table
        header={shiftHeader}
        data={data}
        title="Shifts"
        rowKey="_id"
        loading={loading}
        searchPlaceholder="Search shift name"
        onView={() => {}}
        onEdit={(id) => {
          setShiftId(id);
          setDrawerOpen(true);
        }}
        onDelete={handleDelete}
      />

      {drawerOpen && (
        <AddShift
          open={drawerOpen}
          onOpenChange={(next) => {
            setDrawerOpen(next);
            if (!next) setShiftId(null);
          }}
          onCreated={() => {
            setShiftId(null);
            fetchList();
          }}
          updateId={shiftId}
        />
      )}
    </div>
  );
}
