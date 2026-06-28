"use client";

import { useEffect, useState, useMemo } from "react";
import { Avatar, Tag } from "antd";
import { getAction, API } from "@/lib/API";
import SearchBox from "@/components/ui/SearchBox";
import Table from "@/components/ui/Table";

const mockUsers = [
  {
    _id: "u1",
    name: "Ahmed Al-Rashid",
    email: "ahmed@restaurant.com",
    role: "Manage Growth",
    status: "active",
    department: "Operations",
  },
  {
    _id: "u2",
    name: "Sara Hassan",
    email: "sara@restaurant.com",
    role: "HRS",
    status: "active",
    department: "HR",
  },
  {
    _id: "u3",
    name: "Mohammed Yusuf",
    email: "m.yusuf@restaurant.com",
    role: "Probation Approver",
    status: "inactive",
    department: "Management",
  },
  {
    _id: "u4",
    name: "Fatima Noor",
    email: "fatima@restaurant.com",
    role: "Probation",
    status: "active",
    department: "HR",
  },
  {
    _id: "u5",
    name: "Khalid Ibrahim",
    email: "khalid@restaurant.com",
    role: "JACK HR",
    status: "active",
    department: "HR",
  },
];

const statusStyles = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  inactive: "bg-red-50 text-red-700 border-red-200",
};

export default function UsersList({ refreshKey }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    getUsersList();
  }, [refreshKey]);

  const getUsersList = async () => {
    setLoading(true);
    try {
      const result = await getAction(API.GET_STAFF_LIST);
      if (result?.statusCode === 200 && result.data?.length) {
        setUsers(result.data);
      } else {
        setUsers(mockUsers);
      }
    } catch {
      setUsers(mockUsers);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    const q = searchValue.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      const roleName =
        typeof u.role === "object" ? u.role?.roleName : u.role;
      return (
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        roleName?.toLowerCase().includes(q)
      );
    });
  }, [users, searchValue]);

  const columns = [
    {
      title: "Name",
      key: "name",
      width: 220,
      render: (_, record) => (
        <div className="flex items-center gap-2.5">
          <Avatar
            style={{ backgroundColor: "#7c3aed", fontSize: 12, flexShrink: 0 }}
            size={32}
          >
            {record.name?.charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <p className="font-semibold text-foreground text-sm leading-tight">
              {record.name}
            </p>
            <p className="text-xs text-muted-foreground">{record.email}</p>
          </div>
        </div>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      width: 200,
      render: (value, record) => {
        const label =
          typeof value === "object"
            ? value?.roleName
            : value || record.roleId?.roleName || null;
        return (
          <span className="text-sm text-foreground">{label || "-"}</span>
        );
      },
    },
    {
      title: "Department",
      dataIndex: "departmentId",
      key: "departmentId",
      width: 160,
      render: (value) => {
        const label =
          typeof value === "object" ? value?.departmentName : value || null;
        return (
          <span className="text-sm text-muted-foreground">{label || "-"}</span>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (value) => {
        const key = value?.toLowerCase();
        return (
          <span
            className={`inline-flex items-center justify-center rounded-full px-2.5 py-1 text-xs font-medium capitalize border ${
              statusStyles[key] || "bg-blue-50 text-blue-700 border-blue-200"
            }`}
          >
            {value || "-"}
          </span>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end">
        <SearchBox
          parentClass="w-64"
          placeholder="Search users"
          change={setSearchValue}
          value={searchValue}
        />
      </div>

      <Table
        data={filteredUsers}
        header={columns}
        rowKey="_id"
        title={"User List"}
        loading={loading}
        pagination={{ pageSize: 10, showSizeChanger: false }}
        scroll={{ x: "max-content" }}
        size="middle"
        bordered={false}
      />
    </div>
  );
}
