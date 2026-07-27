"use client";

import { useCallback, useEffect, useState } from "react";
import { ClipboardCheck, LogIn, LogOut, Coffee, Pencil } from "lucide-react";
import { Modal, Skeleton, Select, TimePicker } from "antd";
import dayjs from "dayjs";
import { message } from "@/lib/message";
import { cn } from "@/lib/utils";
import { action, API, getAction, patchAction } from "@/lib/API";

const toDateString = (d) => {
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 10);
};

const fmtTime = (t) => (t ? new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—");
const fmtMinutes = (m) => (m ? `${Math.floor(m / 60)}h ${m % 60}m` : "0h");

const STATUS_STYLES = {
  present: "bg-success/10 text-success",
  half_day: "bg-warning/10 text-warning",
  leave: "bg-primary/10 text-primary",
  absent: "bg-destructive/10 text-destructive",
  holiday: "bg-muted text-muted-foreground",
};

export default function AttendancePage() {
  const [tab, setTab] = useState("today");
  const [date, setDate] = useState(() => toDateString(new Date()));
  const [month, setMonth] = useState(() => toDateString(new Date()).slice(0, 7));
  const [dayData, setDayData] = useState(null);
  const [register, setRegister] = useState([]);
  const [loading, setLoading] = useState(true);
  const [correction, setCorrection] = useState(null); // { record, userName }
  const [correctionForm, setCorrectionForm] = useState({});
  const [saving, setSaving] = useState(false);

  const loadDay = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAction(`${API.ATTENDANCE_DAY}?date=${date}`);
      if (res?.statusCode === 200) setDayData(res.data);
    } finally {
      setLoading(false);
    }
  }, [date]);

  const loadRegister = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAction(`${API.ATTENDANCE_REGISTER}?month=${month}`);
      if (res?.statusCode === 200) setRegister(res.data || []);
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => {
    if (tab === "today") loadDay();
    else loadRegister();
  }, [tab, loadDay, loadRegister]);

  const act = async (endpoint, userId) => {
    const res = await action(endpoint, { userId, date });
    if (res?.statusCode === 200 || res?.statusCode === 201) {
      message.success(res?.message || "Done");
      await loadDay();
    } else {
      message.error(res?.message || "Failed");
    }
  };

  const openCorrection = (record, userName) => {
    setCorrection({ record, userName });
    setCorrectionForm({
      checkInTime: record?.checkIn?.time ? dayjs(record.checkIn.time) : null,
      checkOutTime: record?.checkOut?.time ? dayjs(record.checkOut.time) : null,
      status: record?.status || "present",
    });
  };

  const saveCorrection = async () => {
    setSaving(true);
    try {
      const body = { status: correctionForm.status };
      if (correctionForm.checkInTime) body.checkInTime = correctionForm.checkInTime.toISOString();
      if (correctionForm.checkOutTime) body.checkOutTime = correctionForm.checkOutTime.toISOString();
      const res = await patchAction(`${API.ATTENDANCE_CORRECT}/${correction.record._id}`, body);
      if (res?.statusCode === 200) {
        message.success("Attendance updated");
        setCorrection(null);
        await loadDay();
      } else {
        message.error(res?.message || "Unable to update");
      }
    } finally {
      setSaving(false);
    }
  };

  const renderRow = ({ user, rosterEntry, attendance }) => {
    const record = attendance;
    const onBreak = record?.breaks?.some((b) => !b.end);
    return (
      <tr key={String(user._id)} className="border-b border-border last:border-0">
        <td className="px-4 py-3">
          <div className="font-medium text-foreground">{user.name}</div>
          {rosterEntry?.shiftId && (
            <div className="text-[11px] text-muted-foreground">
              {rosterEntry.shiftId.shiftName} · {rosterEntry.shiftId.startTime}–{rosterEntry.shiftId.endTime}
            </div>
          )}
        </td>
        <td className="px-4 py-3 text-center">
          {record ? (
            <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", STATUS_STYLES[record.status])}>
              {record.status}{record.lateMinutes > 0 && record.status === "present" ? ` · ${record.lateMinutes}m late` : ""}
            </span>
          ) : (
            <span className="text-[11px] text-muted-foreground">not checked in</span>
          )}
        </td>
        <td className="px-4 py-3 text-center text-foreground">{fmtTime(record?.checkIn?.time)}</td>
        <td className="px-4 py-3 text-center text-foreground">{fmtTime(record?.checkOut?.time)}</td>
        <td className="px-4 py-3 text-center text-foreground">{fmtMinutes(record?.workedMinutes)}</td>
        <td className="px-4 py-3">
          <div className="flex items-center justify-end gap-1.5">
            {!record?.checkIn?.time && (
              <button
                onClick={() => act(API.ATTENDANCE_CHECK_IN, user._id)}
                className="flex items-center gap-1 rounded-lg bg-success/10 px-2.5 py-1.5 text-[11px] font-medium text-success hover:bg-success/20"
              >
                <LogIn className="w-3.5 h-3.5" /> Check in
              </button>
            )}
            {record?.checkIn?.time && !record?.checkOut?.time && (
              <>
                <button
                  onClick={() => act(API.ATTENDANCE_BREAK, user._id)}
                  className={cn(
                    "flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-medium",
                    onBreak ? "bg-warning/20 text-warning" : "bg-muted text-muted-foreground hover:bg-warning/10 hover:text-warning",
                  )}
                >
                  <Coffee className="w-3.5 h-3.5" /> {onBreak ? "End break" : "Break"}
                </button>
                <button
                  onClick={() => act(API.ATTENDANCE_CHECK_OUT, user._id)}
                  className="flex items-center gap-1 rounded-lg bg-destructive/10 px-2.5 py-1.5 text-[11px] font-medium text-destructive hover:bg-destructive/20"
                >
                  <LogOut className="w-3.5 h-3.5" /> Check out
                </button>
              </>
            )}
            {record && (
              <button
                onClick={() => openCorrection(record, user.name)}
                className="rounded-lg border border-border p-1.5 text-muted-foreground hover:border-primary hover:text-primary"
                title="Correct"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </td>
      </tr>
    );
  };

  const dayRows = dayData
    ? [
        ...(dayData.rostered || []).map((r) => ({
          user: r.rosterEntry.userId,
          rosterEntry: r.rosterEntry,
          attendance: r.attendance,
        })),
        ...(dayData.walkIns || []).map((record) => ({
          user: record.userId,
          rosterEntry: null,
          attendance: record,
        })),
      ].filter((r) => r.user)
    : [];

  return (
    <div className="min-h-screen bg-background">
      <div className="mb-6">
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground mb-1.5">
          <ClipboardCheck className="w-3.5 h-3.5" />
          Staff / Attendance
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-semibold text-foreground">Attendance</h1>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-border bg-card p-0.5">
              {["today", "register"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-medium capitalize",
                    tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                  )}
                >
                  {t === "today" ? "Day view" : "Monthly register"}
                </button>
              ))}
            </div>
            {tab === "today" ? (
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground"
              />
            ) : (
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground"
              />
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : tab === "today" ? (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground">
                <th className="px-4 py-3 text-left font-medium">Staff</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Check-in</th>
                <th className="px-4 py-3 font-medium">Check-out</th>
                <th className="px-4 py-3 font-medium">Worked</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {dayRows.map(renderRow)}
              {!dayRows.length && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                    Nobody rostered or checked in on {date}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground">
                <th className="px-4 py-3 text-left font-medium">Staff</th>
                <th className="px-4 py-3 font-medium">Present</th>
                <th className="px-4 py-3 font-medium">Half days</th>
                <th className="px-4 py-3 font-medium">Leave</th>
                <th className="px-4 py-3 font-medium">Absent</th>
                <th className="px-4 py-3 font-medium">Hours</th>
                <th className="px-4 py-3 font-medium">Late (total)</th>
              </tr>
            </thead>
            <tbody>
              {register.map((row) => (
                <tr key={String(row.user?._id)} className="border-b border-border last:border-0 text-center">
                  <td className="px-4 py-3 text-left font-medium text-foreground">{row.user?.name}</td>
                  <td className="px-4 py-3 text-success font-medium">{row.totals.present}</td>
                  <td className="px-4 py-3">{row.totals.half_day}</td>
                  <td className="px-4 py-3">{row.totals.leave}</td>
                  <td className="px-4 py-3 text-destructive">{row.totals.absent}</td>
                  <td className="px-4 py-3">{fmtMinutes(row.totals.workedMinutes)}</td>
                  <td className="px-4 py-3">{fmtMinutes(row.totals.lateMinutes)}</td>
                </tr>
              ))}
              {!register.length && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                    No attendance recorded in {month}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        title={correction ? `Correct attendance — ${correction.userName}` : ""}
        open={!!correction}
        onCancel={() => setCorrection(null)}
        onOk={saveCorrection}
        okText="Save"
        confirmLoading={saving}
      >
        <div className="space-y-3 pt-2">
          <div>
            <div className="mb-1 text-xs text-muted-foreground">Check-in time</div>
            <TimePicker
              className="w-full"
              format="HH:mm"
              value={correctionForm.checkInTime}
              onChange={(v) => setCorrectionForm((f) => ({ ...f, checkInTime: v }))}
            />
          </div>
          <div>
            <div className="mb-1 text-xs text-muted-foreground">Check-out time</div>
            <TimePicker
              className="w-full"
              format="HH:mm"
              value={correctionForm.checkOutTime}
              onChange={(v) => setCorrectionForm((f) => ({ ...f, checkOutTime: v }))}
            />
          </div>
          <div>
            <div className="mb-1 text-xs text-muted-foreground">Status</div>
            <Select
              className="w-full"
              value={correctionForm.status}
              onChange={(v) => setCorrectionForm((f) => ({ ...f, status: v }))}
              options={["present", "half_day", "absent", "leave", "holiday"].map((s) => ({
                value: s,
                label: s.replace("_", " "),
              }))}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
