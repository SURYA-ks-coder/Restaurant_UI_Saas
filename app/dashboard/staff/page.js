"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const ADMIN_ROLES = new Set(["owner", "super_admin"]);

function getLoggedRole() {
  try {
    const u = JSON.parse(localStorage.getItem("userData") || "{}");
    return u?.role || "staff";
  } catch {
    return "staff";
  }
}
import {
  Award,
  CalendarClock,
  Clock,
  ExternalLink,
  MoreHorizontal,
  Pencil,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  Users,
  UserX,
} from "lucide-react";
import { Dropdown, Skeleton, message } from "antd";
import { cn } from "@/lib/utils";
import { action, API, getAction } from "@/lib/API";
import AddStaffs from "./AddStaffs";
import ButtonClick from "@/components/ui/ButtonClick";

const statusStyles = {
  active: {
    label: "Active",
    className: "bg-success/10 text-success",
    dot: "bg-success",
    text: " text-success",
  },
  inactive: {
    label: "Inactive",
    className: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground",
    text: " text-muted-foreground",
  },
  blocked: {
    label: "Blocked",
    className: "bg-destructive/10 text-destructive",
    dot: "bg-destructive",
    text: " text-destructive",
  },
};

const requests = [];

function getDeptName(member) {
  const d = member.departmentId;
  if (!d) return "";
  if (typeof d === "object") return d.departmentName || d.name || "";
  return "";
}

function getInitials(name = "") {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function StaffPage() {
  const router = useRouter();
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [addStaffOpen, setAddStaffOpen] = useState(false);
  const [editStaffId, setEditStaffId] = useState(null);

  const loggedRole = useMemo(() => getLoggedRole(), []);
  const isAdmin = ADMIN_ROLES.has(loggedRole);
  const [viewScope, setViewScope] = useState(isAdmin ? "all" : "subordinates");

  const fetchStaffList = useCallback(async () => {
    setLoading(true);
    try {
      const url =
        viewScope === "subordinates"
          ? `${API.GET_STAFF_LIST}?viewScope=subordinates`
          : API.GET_STAFF_LIST;
      const result = await getAction(url);
      if (result?.statusCode === 200) {
        const list = result.data || [];
        setStaffList(list);
        if (list.length > 0 && !selectedStaff) setSelectedStaff(list[0]);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, [viewScope]);

  useEffect(() => {
    fetchStaffList();
  }, [fetchStaffList]);

  const departments = useMemo(() => {
    const names = new Set(staffList.map(getDeptName).filter(Boolean));
    return ["All", ...names];
  }, [staffList]);

  const filteredStaff = useMemo(() => {
    return staffList.filter((member) => {
      const dept = getDeptName(member);
      const matchesDept =
        selectedDepartment === "All" || dept === selectedDepartment;
      const haystack =
        `${member.name} ${member.role} ${dept} ${member.employeeCode || ""} ${member.designation || ""}`.toLowerCase();
      return matchesDept && haystack.includes(searchQuery.toLowerCase());
    });
  }, [staffList, selectedDepartment, searchQuery]);

  const metrics = useMemo(
    () => ({
      total: staffList.length,
      active: staffList.filter((m) => m.status === "active").length,
      inactive: staffList.filter((m) => m.status === "inactive").length,
      blocked: staffList.filter((m) => m.status === "blocked").length,
    }),
    [staffList],
  );

  const handleDelete = async (id) => {
    try {
      const result = await action(`${API.DELETE_STAFF}/${id}`, {}, "DELETE");
      if (result?.statusCode === 200) {
        message.success("Staff removed");
        if (selectedStaff?._id === id) setSelectedStaff(null);
        fetchStaffList();
      } else {
        message.error(result?.message || "Unable to delete staff");
      }
    } catch {
      message.error("Unable to delete staff");
    }
  };

  const openEdit = (member) => {
    setEditStaffId(member._id);
    setAddStaffOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Staff</h1>
          <p className="mt-2 text-muted-foreground">
            Manage team roster, shifts, attendance, and staff requests.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted">
            <CalendarClock className="h-4 w-4" />
            Schedule Shift
          </button>
          <ButtonClick
            handleSubmit={() => {
              setEditStaffId(null);
              setAddStaffOpen(true);
            }}
            buttonName="Add Staff"
            icon={<Plus />}
            BtnType="primary"
          />
        </div>
      </div>

      {/* View scope toggle — admins only see both options */}
      {isAdmin && (
        <div className="mb-6 flex gap-2 rounded-xl border border-border bg-muted/30 p-1 w-fit">
          {[
            { label: "All Staff", value: "all" },
            { label: "My Team", value: "subordinates" },
          ].map(({ label, value }) => (
            <button
              key={value}
              onClick={() => {
                setViewScope(value);
                setSelectedStaff(null);
              }}
              className={cn(
                "rounded-lg px-4 py-1.5 text-sm font-medium transition-all",
                viewScope === value
                  ? "bg-background shadow-sm border border-border/60 text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Team Members"
          value={metrics.total}
          detail="Total staff"
          icon={Users}
          tone="primary"
        />
        <MetricCard
          title="Active"
          value={metrics.active}
          detail="Currently active"
          icon={UserCheck}
          tone="success"
        />
        <MetricCard
          title="Inactive"
          value={metrics.inactive}
          detail="Off duty"
          icon={Clock}
          tone="accent"
        />
        <MetricCard
          title="Blocked"
          value={metrics.blocked}
          detail="Access restricted"
          icon={ShieldCheck}
          tone="warning"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        <section>
          <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, role, or department"
                className="h-10 w-full rounded-lg border border-border pl-10 pr-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {departments.map((dept) => (
                <button
                  key={dept}
                  onClick={() => setSelectedDepartment(dept)}
                  className={cn(
                    "whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium",
                    selectedDepartment === dept
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground",
                  )}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-border bg-card/40 p-4"
                >
                  <Skeleton active avatar paragraph={{ rows: 2 }} />
                </div>
              ))}
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
              <UserX className="h-10 w-10 opacity-40" />
              <p className="text-sm">
                {staffList.length === 0
                  ? "No staff added yet. Click Add Staff to get started."
                  : "No staff match your search."}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {filteredStaff.map((member) => {
                const statusKey = statusStyles[member.status]
                  ? member.status
                  : "inactive";
                const status = statusStyles[statusKey];
                const isSelected = selectedStaff?._id === member._id;
                const deptName = getDeptName(member);

                const menuItems = [
                  {
                    key: "view",
                    label: "View Profile",
                    icon: <ExternalLink className="h-3.5 w-3.5" />,
                    onClick: () =>
                      router.push(`/dashboard/staff/${member._id}`),
                  },
                  {
                    key: "edit",
                    label: "Edit",
                    icon: <Pencil className="h-3.5 w-3.5" />,
                    onClick: () => openEdit(member),
                  },
                  {
                    key: "delete",
                    label: "Delete",
                    icon: <Trash2 className="h-3.5 w-3.5" />,
                    danger: true,
                    onClick: () => handleDelete(member._id),
                  },
                ];

                return (
                  <div
                    key={member._id}
                    onClick={() => setSelectedStaff(member)}
                    className={cn(
                      "relative cursor-pointer rounded-lg border border-border bg-card/40 p-4 transition-all hover:-translate-y-0.5 hover:bg-muted/30",
                      isSelected &&
                        "border-primary/50 bg-primary/5 ring-2 ring-primary/30",
                    )}
                  >
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary capitalize">
                          {getInitials(member.name)}
                        </div>
                        <div>
                          <h2 className="font-semibold capitalize">
                            {member.name}
                          </h2>
                          <p className="text-sm capitalize text-muted-foreground">
                            {member?.departmentId?.departmentName}
                          </p>
                        </div>
                      </div>
                      <Dropdown
                        menu={{ items: menuItems }}
                        trigger={["click"]}
                        placement="bottomRight"
                      >
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="rounded p-1 hover:bg-muted"
                        >
                          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </Dropdown>
                    </div>

                    <div className="mb-4 flex items-center justify-between">
                      <span
                        className={cn(
                          "inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs font-medium",
                          status.className,
                        )}
                      >
                        <span
                          className={cn("h-2 w-2 rounded-full", status.dot)}
                        />
                        {status.label}
                      </span>
                      {member.employeeCode && (
                        <span className="text-xs text-muted-foreground">
                          {member.employeeCode}
                        </span>
                      )}
                    </div>

                    <div className="rounded-lg bg-muted/30 p-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          Department
                        </span>
                        <span className="capitalize">{deptName || "—"}</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-muted-foreground">Role</span>
                        <span className="capitalize">
                          {member.roleId?.roleName?.replace("_", " ") || "—"}
                        </span>
                      </div>
                      {member.reportsTo && (
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-muted-foreground">
                            Reports To
                          </span>
                          <span className="capitalize truncate max-w-30">
                            {member.reportsTo.name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <aside className="space-y-6">
          <section className="glass-card rounded-lg p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Staff Details</h2>
                <p className="text-sm text-muted-foreground">
                  Selected profile
                </p>
              </div>
              <Award className="h-4 w-4 text-muted-foreground" />
            </div>

            {selectedStaff ? (
              <div className=" flex flex-col gap-4">
                <div className=" flex gap-2  rounded-lg border border-border bg-muted/30 p-4">
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 text-lg font-semibold text-primary">
                    {getInitials(selectedStaff.name)}
                  </div>
                  <div className=" ">
                    <h3 className="text-xl font-semibold capitalize">
                      {selectedStaff.name}
                    </h3>
                    <p className="text-sm capitalize text-muted-foreground">
                      {selectedStaff.designation ||
                        selectedStaff.role?.replace("_", " ")}
                      {getDeptName(selectedStaff)
                        ? ` • ${getDeptName(selectedStaff)}`
                        : ""}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  {selectedStaff.employeeCode && (
                    <InfoRow
                      label="Employee Code"
                      value={selectedStaff.employeeCode}
                    />
                  )}
                  <InfoRow
                    label="Role"
                    value={
                      <span className="capitalize">
                        {selectedStaff.role?.replace("_", " ") || "—"}
                      </span>
                    }
                  />
                  <InfoRow
                    label="Status"
                    value={
                      statusStyles[selectedStaff.status]?.label ||
                      selectedStaff.status
                    }
                    className={statusStyles[selectedStaff.status]?.text}
                  />
                  {selectedStaff.email && (
                    <InfoRow label="Email" value={selectedStaff.email} />
                  )}
                  {selectedStaff.phone && (
                    <InfoRow label="Phone" value={selectedStaff.phone} />
                  )}
                  <InfoRow
                    label="Reports To"
                    value={
                      selectedStaff.reportsTo
                        ? `${selectedStaff.reportsTo.name} (${selectedStaff.reportsTo.role?.replace("_", " ")})`
                        : "Not Assigned"
                    }
                  />
                </div>

                <div className="mt-5 grid grid-cols-2 gap-2">
                  <a
                    href={`tel:${selectedStaff.phone}`}
                    onClick={(e) => !selectedStaff.phone && e.preventDefault()}
                    className="flex items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted"
                  >
                    <Phone className="h-4 w-4" />
                    Call
                  </a>
                  <button
                    onClick={() => openEdit(selectedStaff)}
                    className="flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </button>
                </div>
                <Link
                  href={`/dashboard/staff/${selectedStaff._id}`}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-muted transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Full Profile
                </Link>
              </div>
            ) : (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Select a staff member to view details.
              </p>
            )}
          </section>

          {/* <section className="glass-card rounded-lg p-5">
            <h2 className="text-lg font-semibold">Today&apos;s Schedule</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Coverage by station
            </p>
            <div className="space-y-3">
              {shiftBlocks.map((block) => (
                <div key={block.time} className="rounded-lg bg-muted/30 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium">{block.time}</span>
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p>Kitchen: {block.kitchen}</p>
                    <p>Floor: {block.floor}</p>
                    <p>Bar: {block.bar}</p>
                  </div>
                </div>
              ))}
            </div>
          </section> */}

          <section className="glass-card rounded-lg p-5">
            <h2 className="text-lg font-semibold">Requests</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Pending staff actions
            </p>
            {requests.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No pending requests.
              </p>
            ) : (
              <div className="space-y-3">
                {requests.map((request) => (
                  <div
                    key={`${request.name}-${request.type}`}
                    className="rounded-lg bg-muted/30 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{request.type}</p>
                      <span className="text-xs text-primary">
                        {request.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {request.name} • {request.detail}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </aside>
      </div>

      <AddStaffs
        open={addStaffOpen}
        onOpenChange={(next) => {
          setAddStaffOpen(next);
          if (!next) setEditStaffId(null);
        }}
        onCreated={() => fetchStaffList()}
        updateId={editStaffId}
      />
    </div>
  );
}

function MetricCard({ title, value, detail, icon: Icon, tone }) {
  const tones = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    accent: "bg-accent/10 text-accent",
    warning: "bg-warning/10 text-warning",
  };

  return (
    <div className="glass-card rounded-lg p-3 px-4">
      <div className=" flex items-center justify-between">
        <div className=" flex items-center justify-between gap-2">
          <div className={cn("rounded-lg p-3", tones[tone])}>
            <Icon className="h-5 w-5" />
          </div>
          {/* <CheckCircle2 className="h-4 w-4 text-muted-foreground" /> */}
          <div className="">
            <p className="font-medium text-sm">{title}</p>
            <p className="text-xs text-muted-foreground">{detail}</p>
          </div>
        </div>
        <p className="text-2xl font-semibold">{value}</p>
      </div>
    </div>
  );
}

function InfoRow({ label, value, className }) {
  return (
    <div
      className={` ${className} flex items-center justify-between border-b border-border pb-2`}
    >
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
