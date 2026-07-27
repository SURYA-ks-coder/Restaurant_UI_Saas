"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Copy, Trash2 } from "lucide-react";
import { Modal, Skeleton, Select } from "antd";
import { message } from "@/lib/message";
import { cn } from "@/lib/utils";
import { action, API, getAction } from "@/lib/API";

/* ── date helpers (all dates are local-day "YYYY-MM-DD" strings) ───────── */

const toDateString = (d) => {
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 10);
};

const startOfWeek = (d) => {
  const date = new Date(d);
  const day = (date.getDay() + 6) % 7; // Monday = 0
  date.setDate(date.getDate() - day);
  return date;
};

const addDays = (dateString, days) => {
  const d = new Date(`${dateString}T00:00:00`);
  d.setDate(d.getDate() + days);
  return toDateString(d);
};

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function RosterPage() {
  const [weekStart, setWeekStart] = useState(() => toDateString(startOfWeek(new Date())));
  const [staff, setStaff] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignCell, setAssignCell] = useState(null); // { userId, userName, date }
  const [selectedShiftId, setSelectedShiftId] = useState(null);
  const [saving, setSaving] = useState(false);

  const weekDates = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );

  const loadRoster = useCallback(async () => {
    const res = await getAction(
      `${API.GET_ROSTER}?from=${weekStart}&to=${addDays(weekStart, 6)}`,
    );
    if (res?.statusCode === 200) setEntries(res.data || []);
  }, [weekStart]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [staffRes, shiftRes] = await Promise.all([
          getAction(`${API.GET_STAFF_LIST}?limit=100`),
          getAction(`${API.GET_STAFF_SHIFT_LIST}?limit=100&status=active`),
        ]);
        if (staffRes?.statusCode === 200) setStaff(staffRes.data || []);
        if (shiftRes?.statusCode === 200) setShifts(shiftRes.data || []);
        await loadRoster();
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [loadRoster]);

  const entryFor = (userId, date) =>
    entries.find(
      (e) => String(e.userId?._id || e.userId) === String(userId) && e.date === date,
    );

  const saveAssignment = async () => {
    if (!selectedShiftId) return message.error("Select a shift");
    setSaving(true);
    try {
      const res = await action(API.ASSIGN_ROSTER, {
        assignments: [
          { userId: assignCell.userId, shiftId: selectedShiftId, date: assignCell.date },
        ],
      });
      if (res?.statusCode === 200 || res?.statusCode === 201) {
        message.success("Roster updated");
        setAssignCell(null);
        setSelectedShiftId(null);
        await loadRoster();
      } else {
        message.error(res?.message || "Unable to update roster");
      }
    } finally {
      setSaving(false);
    }
  };

  const removeEntry = async (entry) => {
    const res = await action(`${API.DELETE_ROSTER_ENTRY}/${entry._id}`, {}, "DELETE");
    if (res?.statusCode === 200) {
      message.success("Removed");
      await loadRoster();
    } else {
      message.error(res?.message || "Unable to remove");
    }
  };

  const copyLastWeek = async () => {
    const res = await action(API.COPY_ROSTER_WEEK, {
      fromWeekStart: addDays(weekStart, -7),
      toWeekStart: weekStart,
    });
    if (res?.statusCode === 200 || res?.statusCode === 201) {
      message.success(
        `Copied ${res?.data?.copied ?? 0} entries (${res?.data?.skipped ?? 0} already set)`,
      );
      await loadRoster();
    } else {
      message.error(res?.message || "Unable to copy week");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mb-6">
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground mb-1.5">
          <CalendarDays className="w-3.5 h-3.5" />
          Staff / Roster
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-semibold text-foreground">Weekly Roster</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={copyLastWeek}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:border-primary"
            >
              <Copy className="w-3.5 h-3.5" /> Copy last week
            </button>
            <button
              onClick={() => setWeekStart(addDays(weekStart, -7))}
              className="rounded-lg border border-border bg-card p-1.5 hover:border-primary"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium text-foreground min-w-[170px] text-center">
              {weekStart} → {addDays(weekStart, 6)}
            </span>
            <button
              onClick={() => setWeekStart(addDays(weekStart, 7))}
              className="rounded-lg border border-border bg-card p-1.5 hover:border-primary"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground w-48">
                  Staff
                </th>
                {weekDates.map((date, i) => (
                  <th key={date} className="px-2 py-3 text-center font-medium text-muted-foreground">
                    <div>{DAY_LABELS[i]}</div>
                    <div className="text-[11px] font-normal">{date.slice(5)}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {staff.map((member) => (
                <tr key={member._id} className="border-b border-border last:border-0">
                  <td className="px-4 py-2 font-medium text-foreground">
                    {member.name}
                    <div className="text-[11px] text-muted-foreground">
                      {member.designationId?.designationName || member.role || ""}
                    </div>
                  </td>
                  {weekDates.map((date) => {
                    const entry = entryFor(member._id, date);
                    return (
                      <td key={date} className="px-1.5 py-1.5 text-center">
                        {entry ? (
                          <div
                            className={cn(
                              "group relative mx-auto max-w-[120px] rounded-lg border border-primary/30 bg-primary/10 px-2 py-1.5 text-xs",
                              entry.status === "on_leave" && "border-warning/40 bg-warning/10",
                            )}
                          >
                            <div className="font-medium text-foreground truncate">
                              {entry.shiftId?.shiftName || "Shift"}
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              {entry.shiftId?.startTime}–{entry.shiftId?.endTime}
                            </div>
                            <button
                              onClick={() => removeEntry(entry)}
                              className="absolute -right-1.5 -top-1.5 hidden rounded-full bg-destructive p-0.5 text-white group-hover:block"
                              title="Remove"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setAssignCell({ userId: member._id, userName: member.name, date });
                              setSelectedShiftId(null);
                            }}
                            className="mx-auto block w-full max-w-[120px] rounded-lg border border-dashed border-border py-2.5 text-[11px] text-muted-foreground hover:border-primary hover:text-primary"
                          >
                            + Assign
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
              {!staff.length && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
                    No staff found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        title={assignCell ? `Assign shift — ${assignCell.userName} · ${assignCell.date}` : ""}
        open={!!assignCell}
        onCancel={() => setAssignCell(null)}
        onOk={saveAssignment}
        okText="Assign"
        confirmLoading={saving}
      >
        <Select
          className="w-full"
          size="large"
          placeholder="Select shift"
          value={selectedShiftId}
          onChange={setSelectedShiftId}
          options={shifts.map((s) => ({
            value: s._id,
            label: `${s.shiftName} (${s.startTime}–${s.endTime})`,
          }))}
        />
      </Modal>
    </div>
  );
}
