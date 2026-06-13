"use client";

import { useEffect, useState } from "react";
import Table from "@/components/ui/Table";
import { action, API, getAction } from "@/lib/API";
import AddDepartment from "./AddDepartment";

const departmentHeader = [
  { title: "Department", value: "departmentName", type: "bold", width: 220 },
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

export default function DepartmentList({ refreshKey }) {
  const [data, setData] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [departmentId, setDepartmentId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchList();
  }, [refreshKey]);

  const fetchList = async () => {
    setLoading(true);
    try {
      const result = await getAction(API.GET_DEPARTMENT_LIST);
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
        `${API.DELETE_DEPARTMENT}/${id}`,
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
        header={departmentHeader}
        data={data}
        title="Departments"
        rowKey="_id"
        loading={loading}
        searchPlaceholder="Search department name"
        onView={() => {}}
        onEdit={(id) => {
          setDepartmentId(id);
          setDrawerOpen(true);
        }}
        onDelete={handleDelete}
      />

      {drawerOpen && (
        <AddDepartment
          open={drawerOpen}
          onOpenChange={(next) => {
            setDrawerOpen(next);
            if (!next) setDepartmentId(null);
          }}
          onCreated={() => {
            setDepartmentId(null);
            fetchList();
          }}
          updateId={departmentId}
        />
      )}
    </div>
  );
}
