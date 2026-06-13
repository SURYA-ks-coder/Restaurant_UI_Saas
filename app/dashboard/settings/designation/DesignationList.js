"use client";

import { useEffect, useState } from "react";
import Table from "@/components/ui/Table";
import { action, API, getAction } from "@/lib/API";
import AddDesignation from "./AddDesignation";

const designationHeader = [
  { title: "Designation", value: "designationName", type: "bold", width: 220 },
  { title: "Description", value: "description", width: 300 },
  { title: "Status", value: "status", type: "status", width: 120 },
  {
    title: "Created",
    value: "createdAt",
    render: (value) => (value ? new Date(value).toLocaleDateString() : "-"),
    width: 130,
  },
  { title: "Actions", value: "actions", type: "action", align: "right" },
];

export default function DesignationList({ refreshKey }) {
  const [data, setData] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [designationId, setDesignationId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchList();
  }, [refreshKey]);

  const fetchList = async () => {
    setLoading(true);
    try {
      const result = await getAction(API.GET_DESIGNATION_LIST);
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
        `${API.DELETE_DESIGNATION}/${id}`,
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
        header={designationHeader}
        data={data}
        title="Designations"
        rowKey="_id"
        loading={loading}
        searchPlaceholder="Search designation name"
        onView={() => {}}
        onEdit={(id) => {
          setDesignationId(id);
          setDrawerOpen(true);
        }}
        onDelete={handleDelete}
      />

      {drawerOpen && (
        <AddDesignation
          open={drawerOpen}
          onOpenChange={(next) => {
            setDrawerOpen(next);
            if (!next) setDesignationId(null);
          }}
          onCreated={() => {
            setDesignationId(null);
            fetchList();
          }}
          updateId={designationId}
        />
      )}
    </div>
  );
}
