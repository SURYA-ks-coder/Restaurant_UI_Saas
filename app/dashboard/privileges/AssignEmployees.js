"use client";

import { useState } from "react";
import { Checkbox } from "antd";
import Stepper from "@/components/ui/Stepper";
import Heading from "@/components/ui/Heading";
import ButtonClick from "@/components/ui/ButtonClick";
import SearchBox from "@/components/ui/SearchBox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const ALL_EMPLOYEES = [
  { id: 1, name: "Muhammed Aslam", empCode: "1", color: "#4B9EF6" },
  { id: 2, name: "Test eee", empCode: "1", color: "#26A69A" },
  { id: 3, name: "Roberto Messi", empCode: "2", color: "#37474F" },
  { id: 4, name: "Asdasd asdasd", empCode: "3", color: "#7E57C2" },
  { id: 5, name: "Dfsdfsdf dfsdfdfsf", empCode: "4", color: "#FF7043" },
  { id: 6, name: "Sundara pandiyan", empCode: "123", color: "#26A69A" },
  { id: 7, name: "FirstName firstName", empCode: "em675", color: "#FFA726" },
  { id: 8, name: "Mahi dhoni", empCode: "em676", color: "#4B9EF6" },
];

const STEPS = [{ title: "Roles" }, { title: "Assign Roles" }];

export default function AssignEmployees({ onBack, onSave }) {
  const [availSearch, setAvailSearch] = useState("");
  const [assignSearch, setAssignSearch] = useState("");
  const [assignedIds, setAssignedIds] = useState([8]);

  const available = ALL_EMPLOYEES.filter(
    (e) =>
      !assignedIds.includes(e.id) &&
      e.name.toLowerCase().includes(availSearch.toLowerCase()),
  );
  const assigned = ALL_EMPLOYEES.filter(
    (e) =>
      assignedIds.includes(e.id) &&
      e.name.toLowerCase().includes(assignSearch.toLowerCase()),
  );

  const update = (next) => {
    setAssignedIds(next);
    onSave?.(next);
  };

  // Check an available employee → moves it to assigned
  const assignOne = (id) => update([...assignedIds, id]);

  // Uncheck an assigned employee → moves it back to available
  const unassignOne = (id) => update(assignedIds.filter((i) => i !== id));

  // Select-all in left panel: assign all visible available employees
  const assignAll = (checked) => {
    if (checked) {
      update([...new Set([...assignedIds, ...available.map((e) => e.id)])]);
    }
  };

  // Select-all in right panel: unassign all visible assigned employees
  const unassignAll = (checked) => {
    if (!checked) {
      const visibleIds = assigned.map((e) => e.id);
      update(assignedIds.filter((id) => !visibleIds.includes(id)));
    }
  };

  const allAssignedChecked =
    assigned.length > 0 && assigned.every((e) => assignedIds.includes(e.id));
  const assignedIndeterminate =
    assignedIds.length > 0 && !allAssignedChecked;

  return (
    <div className="flex flex-col gap-6">
      {/* Stepper bar */}
      <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-border px-10 py-5">
        <Stepper
          steps={STEPS}
          currentStepNumber={1}
          presentage={1}
          showTitle={true}
        />
      </div>

      {/* Main assign card */}
      <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-border p-6">
        {/* Header row */}
        <div className="flex items-start justify-between mb-5">
          <Heading title="Assign" description="Assign Employees here" />
          <ButtonClick BtnType="primary" buttonName="Employees" />
        </div>

        {/* Two-panel layout */}
        <div className="flex border border-border rounded-xl overflow-hidden">
          {/* ── Left: Available Employees ── */}
          <div className="flex-1 bg-white dark:bg-[#0f172a] p-4">
            <p className="text-xs font-semibold text-foreground mb-3">
              Available Employees
            </p>

            <SearchBox
              placeholder="Search Employees"
              value={availSearch}
              change={setAvailSearch}
              className="mb-3"
            />

            {/* Group header */}
            <div className="flex items-center gap-2 py-2 px-1 mb-1">
              <Checkbox
                checked={available.length === 0 && ALL_EMPLOYEES.length > 0}
                indeterminate={available.length > 0}
                onChange={(e) => assignAll(e.target.checked)}
              />
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-xs font-medium text-foreground">
                  Not Assigned Employees
                </span>
                <span className="bg-orange-400 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                  {available.length}
                </span>
              </div>
            </div>

            {/* Employee list */}
            {available.map((emp) => (
              <div
                key={emp.id}
                className="flex items-center gap-3 py-2.5 px-1 hover:bg-muted/60 rounded-md cursor-pointer"
                onClick={() => assignOne(emp.id)}
              >
                <Checkbox
                  checked={false}
                  onChange={() => assignOne(emp.id)}
                  onClick={(e) => e.stopPropagation()}
                />
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarFallback
                    style={{ backgroundColor: emp.color }}
                    className="text-white text-xs font-bold"
                  >
                    {emp.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-foreground leading-tight">
                    {emp.name}
                  </p>
                  <p className="text-xs text-orange-500">
                    Emp Code: {emp.empCode}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Vertical divider */}
          <div className="w-px bg-border shrink-0" />

          {/* ── Right: Assigned Employees ── */}
          <div className="flex-1 bg-[#f0eeff] dark:bg-[#1a1a3e] p-4">
            <p className="text-xs font-semibold text-foreground mb-3">
              Assigned Employees
            </p>

            <SearchBox
              placeholder="Search Employees"
              value={assignSearch}
              change={setAssignSearch}
              className="mb-3"
            />

            {/* Group header */}
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

            {/* Employee list */}
            {assigned.map((emp) => (
              <div
                key={emp.id}
                className="flex items-center gap-3 py-2.5 px-1 hover:bg-purple-100/50 rounded-md cursor-pointer"
                onClick={() => unassignOne(emp.id)}
              >
                <Checkbox
                  checked={true}
                  onChange={() => unassignOne(emp.id)}
                  onClick={(e) => e.stopPropagation()}
                />
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarFallback
                    style={{ backgroundColor: emp.color }}
                    className="text-white text-xs font-bold"
                  >
                    {emp.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-foreground leading-tight">
                    {emp.name}
                  </p>
                  <p className="text-xs text-orange-500">
                    Emp Code: {emp.empCode}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
