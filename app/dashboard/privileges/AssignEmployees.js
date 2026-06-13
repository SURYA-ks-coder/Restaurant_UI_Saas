"use client";

import { useState, useEffect } from "react";
import { Checkbox, Skeleton } from "antd";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import SearchBox from "@/components/ui/SearchBox";

function getInitials(name = "") {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const AVATAR_COLORS = [
  "#4B9EF6",
  "#26A69A",
  "#37474F",
  "#7E57C2",
  "#FF7043",
  "#FFA726",
  "#66BB6A",
  "#EC407A",
];

function avatarColor(id = "") {
  let hash = 0;
  for (let i = 0; i < id.length; i++)
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function AssignEmployees({
  employees = [],
  initialAssignedIds = [],
  loading = false,
  onSave,
}) {
  const [availSearch, setAvailSearch] = useState("");
  const [assignSearch, setAssignSearch] = useState("");
  const [assignedIds, setAssignedIds] = useState(new Set(initialAssignedIds));

  useEffect(() => {
    setAssignedIds(new Set(initialAssignedIds));
  }, [initialAssignedIds]);

  const available = employees.filter(
    (e) =>
      !assignedIds.has(e._id) &&
      e.name?.toLowerCase().includes(availSearch.toLowerCase()),
  );

  const assigned = employees.filter(
    (e) =>
      assignedIds.has(e._id) &&
      e.name?.toLowerCase().includes(assignSearch.toLowerCase()),
  );

  const update = (next) => {
    setAssignedIds(next);
    onSave?.([...next]);
  };

  const assignOne = (id) => {
    const next = new Set(assignedIds);
    next.add(id);
    update(next);
  };

  const unassignOne = (id) => {
    const next = new Set(assignedIds);
    next.delete(id);
    update(next);
  };

  const assignAll = (checked) => {
    if (checked) {
      const next = new Set(assignedIds);
      available.forEach((e) => next.add(e._id));
      update(next);
    }
  };

  const unassignAll = (checked) => {
    if (!checked) {
      const next = new Set(assignedIds);
      assigned.forEach((e) => next.delete(e._id));
      update(next);
    }
  };

  const allAssignedChecked =
    assigned.length > 0 && assigned.every((e) => assignedIds.has(e._id));
  const assignedIndeterminate = assignedIds.size > 0 && !allAssignedChecked;

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Main assign card */}
      <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-border p-6">
        <div className="mb-5">
          <h2 className="text-xl font-bold text-foreground">
            Assign Employees
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Select employees to assign to this role
          </p>
        </div>

        {loading ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : (
          <div className="flex border border-border rounded-xl overflow-hidden">
            {/* ── Left: Available ── */}
            <div className="flex-1 bg-white dark:bg-[#0f172a] p-4">
              <p className="text-xs font-semibold text-foreground mb-3">
                Available Employees
              </p>

              <SearchBox
                placeholder="Search employees"
                value={availSearch}
                change={setAvailSearch}
                className="mb-3"
              />

              <div className="flex items-center gap-2 py-2 px-1 mb-1">
                <Checkbox
                  checked={available.length === 0 && employees.length > 0}
                  indeterminate={available.length > 0}
                  onChange={(e) => assignAll(e.target.checked)}
                />
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-xs font-medium text-foreground">
                    Not Assigned
                  </span>
                  <span className="bg-orange-400 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                    {available.length}
                  </span>
                </div>
              </div>

              {available.length === 0 && (
                <p className="text-xs text-muted-foreground py-4 text-center">
                  All employees assigned.
                </p>
              )}

              {available.map((emp) => (
                <div
                  key={emp._id}
                  className="flex items-center gap-3 py-2.5 px-1 hover:bg-muted/60 rounded-md cursor-pointer"
                  onClick={() => assignOne(emp._id)}
                >
                  <Checkbox
                    checked={false}
                    onChange={() => assignOne(emp._id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarFallback
                      style={{ backgroundColor: avatarColor(emp._id) }}
                      className="text-white text-xs font-bold"
                    >
                      {getInitials(emp.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-foreground leading-tight">
                      {emp.name}
                    </p>
                    <p className="text-xs text-orange-500">
                      {emp.employeeCode
                        ? `Code: ${emp.employeeCode}`
                        : emp.email || ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="w-px bg-border shrink-0" />

            {/* ── Right: Assigned ── */}
            <div className="flex-1 bg-[#f0eeff] dark:bg-[#1a1a3e] p-4">
              <p className="text-xs font-semibold text-foreground mb-3">
                Assigned Employees
              </p>

              <SearchBox
                placeholder="Search employees"
                value={assignSearch}
                change={setAssignSearch}
                className="mb-3"
              />

              <div className="flex items-center gap-2 py-2 px-1 mb-1">
                <Checkbox
                  checked={allAssignedChecked}
                  indeterminate={assignedIndeterminate}
                  onChange={(e) => unassignAll(e.target.checked)}
                />
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                  <span className="text-xs font-medium text-foreground">
                    Assigned
                  </span>
                  <span className="bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                    {assigned.length}
                  </span>
                </div>
              </div>

              {assigned.length === 0 && (
                <p className="text-xs text-muted-foreground py-4 text-center">
                  No employees assigned yet.
                </p>
              )}

              {assigned.map((emp) => (
                <div
                  key={emp._id}
                  className="flex items-center gap-3 py-2.5 px-1 hover:bg-purple-100/50 rounded-md cursor-pointer"
                  onClick={() => unassignOne(emp._id)}
                >
                  <Checkbox
                    checked={true}
                    onChange={() => unassignOne(emp._id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarFallback
                      style={{ backgroundColor: avatarColor(emp._id) }}
                      className="text-white text-xs font-bold"
                    >
                      {getInitials(emp.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-foreground leading-tight">
                      {emp.name}
                    </p>
                    <p className="text-xs text-orange-500">
                      {emp.employeeCode
                        ? `Code: ${emp.employeeCode}`
                        : emp.email || ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
