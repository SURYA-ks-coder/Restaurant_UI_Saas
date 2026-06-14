"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Table as AntTable,
  Switch,
  Space,
  Button,
  Tooltip,
  Avatar,
} from "antd";
import { Pencil, Trash2, Columns3 } from "lucide-react";
import { message } from "antd";
import { action, API, getAction } from "@/lib/API";
import SearchBox from "@/components/ui/SearchBox";
import Table from "@/components/ui/Table";

const mockRoles = [
  {
    _id: "1",
    roleName: "New Test",
    status: "active",
    employees: [{ name: "M" }],
    isSystem: true,
  },
  {
    _id: "2",
    roleName: "Manage Growth",
    status: "active",
    employees: [],
    isSystem: false,
  },
  {
    _id: "3",
    roleName: "Managing Use'S",
    status: "active",
    employees: [],
    isSystem: false,
  },
  {
    _id: "4",
    roleName: "JACKHRT",
    status: "inactive",
    employees: [],
    isSystem: false,
  },
  {
    _id: "5",
    roleName: "HRS",
    status: "inactive",
    employees: [],
    isSystem: false,
  },
  {
    _id: "6",
    roleName: "JACK HR",
    status: "active",
    employees: [],
    isSystem: false,
  },
  {
    _id: "7",
    roleName: "Probation-Murshid",
    status: "active",
    employees: [],
    isSystem: false,
  },
  {
    _id: "8",
    roleName: "Probation",
    status: "active",
    employees: [],
    isSystem: false,
  },
  {
    _id: "9",
    roleName: "Probation Approver",
    status: "inactive",
    employees: [],
    isSystem: false,
  },
];

export default function RoleList({ refreshKey, onEdit }) {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    getRoleList();
  }, [refreshKey]);

  const getRoleList = async () => {
    setLoading(true);
    try {
      const result = await getAction(API.GET_ROLE_LIST);
      if (result?.statusCode === 200) {
        setRoles(result.data);
      } else {
        setRoles(mockRoles);
      }
    } catch {
      setRoles(mockRoles);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, checked, record) => {
    const updated = roles.map((r) =>
      r._id === id ? { ...r, status: checked ? "active" : "inactive" } : r,
    );
    setRoles(updated);
    try {
      await action(
        `${API.TOGGLE_ROLE_STATUS}/${id}`,
        { status: checked ? "active" : "inactive" },
        "PATCH",
      );
    } catch {
      setRoles(roles);
    }
  };

  const handleDelete = async (id) => {
    try {
      const result = await action(`${API.DELETE_ROLE}/${id}`, {}, "DELETE");
      if (result?.statusCode === 200) {
        message.success("Role deleted successfully");
        getRoleList();
      } else {
        message.error(result?.message || "Unable to delete role");
      }
    } catch {
      message.error("Unable to delete role");
    }
  };

  const filteredRoles = useMemo(() => {
    const q = searchValue.trim().toLowerCase();
    if (!q) return roles;
    return roles.filter((r) => r.roleName?.toLowerCase().includes(q));
  }, [roles, searchValue]);

  const columns = [
    {
      title: "Roles",
      value: "roleName",
      width: 280,
      render: (value) => (
        <span className="font-semibold text-foreground capitalize">
          {value || "-"}
        </span>
      ),
    },
    {
      title: "Employees",
      value: "employees",
      width: 160,
      isImageMultiple: true,
      render: (employees) => {
        if (!employees?.length) return null;
        return (
          <Avatar.Group max={{ count: 4 }}>
            {employees.map((emp, i) => (
              <Avatar
                key={i}
                style={{ backgroundColor: "#7c3aed", fontSize: 12 }}
                size={28}
              >
                {emp.name?.charAt(0).toUpperCase()}
              </Avatar>
            ))}
          </Avatar.Group>
        );
      },
    },
    {
      title: "Status",
      value: "status",
      width: 120,
      render: (value, record) => (
        <Switch
          checked={value === "active"}
          onChange={(checked) =>
            handleToggleStatus(record._id, checked, record)
          }
          style={
            value === "active" ? { backgroundColor: "#7c3aed" } : undefined
          }
        />
      ),
    },
    {
      title: "Action",
      key: "action",
      align: "right",
      render: (_, record) => (
        <Space size={4}>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<Pencil size={15} className="text-primary" />}
              onClick={() => onEdit?.(record._id, record)}
            />
          </Tooltip>
          {!record.isSystem && (
            <Tooltip title="Delete">
              <Button
                type="text"
                danger
                icon={<Trash2 size={15} />}
                onClick={() => handleDelete(record._id)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Table
        header={columns}
        data={filteredRoles}
        title={"Role "}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 10, showSizeChanger: false }}
        scroll={{ x: "max-content" }}
        size="middle"
        bordered={false}
      />
    </div>
  );
}
