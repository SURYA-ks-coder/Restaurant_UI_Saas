"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import dayjs from "dayjs";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CalendarClock,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Shield,
  Trash2,
  User,
  Users,
} from "lucide-react";
import { Modal } from "antd";
import { message } from "@/lib/message";
import { cn } from "@/lib/utils";
import { action, API, getAction } from "@/lib/API";
import AddStaffs from "../AddStaffs";

const statusConfig = {
  active: {
    label: "Active",
    className: "bg-success/15 text-success border-success/30",
    dot: "bg-success",
    pulse: true,
  },
  inactive: {
    label: "Inactive",
    className: "bg-muted text-muted-foreground border-border",
    dot: "bg-muted-foreground",
    pulse: false,
  },
  blocked: {
    label: "Blocked",
    className: "bg-destructive/15 text-destructive border-destructive/30",
    dot: "bg-destructive",
    pulse: false,
  },
};

const TABS = ["Overview", "Personal", "Work Details", "Emergency Contact"];

function getInitials(name = "") {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getDeptName(staff) {
  const d = staff.departmentId;
  if (!d) return "";
  if (typeof d === "object") return d.departmentName || d.name || "";
  return "";
}

export default function StaffProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Overview");
  const [editOpen, setEditOpen] = useState(false);

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAction(`${API.GET_STAFF_BY_ID}/${id}`);
      if (result?.statusCode === 200) {
        setStaff(result.data);
      } else {
        message.error("Staff member not found");
        router.push("/dashboard/staff");
      }
    } catch {
      message.error("Failed to load staff profile");
      router.push("/dashboard/staff");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const handleDelete = () => {
    Modal.confirm({
      title: "Remove Staff Member",
      content: `Are you sure you want to remove ${staff?.name}? This action cannot be undone.`,
      okText: "Remove",
      cancelText: "Cancel",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          const result = await action(`${API.DELETE_STAFF}/${id}`, {}, "DELETE");
          if (result?.statusCode === 200) {
            message.success("Staff member removed");
            router.push("/dashboard/staff");
          } else {
            message.error(result?.message || "Unable to remove staff");
          }
        } catch {
          message.error("Unable to remove staff");
        }
      },
    });
  };

  if (loading) return <ProfileSkeleton />;
  if (!staff) return null;

  const status = statusConfig[staff.status] || statusConfig.inactive;
  const dept = getDeptName(staff);

  return (
    <div className="min-h-screen bg-background pb-10">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/dashboard/staff"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Staff
        </Link>
      </div>

      {/* Hero Card */}
      <div className="mb-6 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {/* Banner */}
        <div className="relative h-32 bg-gradient-to-br from-primary/25 via-primary/10 to-transparent overflow-hidden">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-primary/10" />
          <div className="absolute right-24 top-2 h-28 w-28 rounded-full bg-primary/6" />
          <div className="absolute -left-6 -bottom-6 h-32 w-32 rounded-full bg-primary/5" />
        </div>

        {/* Profile Row */}
        <div className="-mt-14 flex flex-col gap-5 px-6 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            {/* Avatar */}
            <div className="relative h-24 w-24 flex-shrink-0 rounded-2xl border-4 border-card bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shadow-lg">
              <span className="text-3xl font-bold text-primary tracking-tight">
                {getInitials(staff.name)}
              </span>
              {/* online dot */}
              {staff.status === "active" && (
                <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-card bg-success" />
              )}
            </div>

            <div className="pb-1">
              <h1 className="text-2xl font-bold capitalize leading-tight">
                {staff.name}
              </h1>
              <p className="text-sm text-muted-foreground capitalize mt-0.5">
                {staff.designation || staff.role?.replace("_", " ")}
                {dept ? ` · ${dept}` : ""}
              </p>
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
                    status.className,
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      status.dot,
                      status.pulse && "animate-pulse",
                    )}
                  />
                  {status.label}
                </span>
                {staff.employeeCode && (
                  <span className="rounded-full bg-muted/80 border border-border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                    {staff.employeeCode}
                  </span>
                )}
                {staff.role && (
                  <span className="rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-medium text-primary capitalize">
                    {staff.role.replace("_", " ")}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 pb-1">
            <a
              href={`tel:${staff.phone}`}
              onClick={(e) => !staff.phone && e.preventDefault()}
              className={cn(
                "flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium transition-all",
                staff.phone
                  ? "hover:bg-muted hover:border-primary/30"
                  : "opacity-40 cursor-not-allowed pointer-events-none",
              )}
            >
              <Phone className="h-4 w-4" />
              Call
            </a>
            <button
              onClick={() => setEditOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
            >
              <Pencil className="h-4 w-4" />
              Edit Profile
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Remove
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-xl border border-border bg-muted/30 p-1">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-all",
              activeTab === tab
                ? "bg-background shadow-sm border border-border/60 text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "Overview" && <OverviewTab staff={staff} dept={dept} />}
      {activeTab === "Personal" && <PersonalTab staff={staff} />}
      {activeTab === "Work Details" && <WorkTab staff={staff} dept={dept} />}
      {activeTab === "Emergency Contact" && <EmergencyTab staff={staff} />}

      <AddStaffs
        open={editOpen}
        onOpenChange={(next) => setEditOpen(next)}
        onCreated={() => fetchStaff()}
        updateId={id}
      />
    </div>
  );
}

/* ─── Tab: Overview ─────────────────────────────────────────────────────── */

function OverviewTab({ staff, dept }) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Quick stats column */}
      <div className="space-y-4">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Quick Info
          </h3>
          <div className="space-y-4">
            <InfoItem
              icon={Users}
              label="Department"
              value={dept || "Not assigned"}
            />
            <InfoItem
              icon={Shield}
              label="Role"
              value={staff.role?.replace("_", " ")}
              className="capitalize"
            />
            <InfoItem
              icon={Calendar}
              label="Date of Joining"
              value={
                staff.dateOfJoining
                  ? dayjs(staff.dateOfJoining).format("MMM D, YYYY")
                  : "—"
              }
            />
            <InfoItem
              icon={CalendarClock}
              label="Employee Code"
              value={staff.employeeCode || "Not assigned"}
            />
            <InfoItem
              icon={Users}
              label="Reports To"
              value={
                staff.reportsTo
                  ? `${staff.reportsTo.name} (${staff.reportsTo.role?.replace("_", " ")})`
                  : "Not Assigned"
              }
              className="capitalize"
            />
          </div>
        </div>
      </div>

      {/* Contact + branches column */}
      <div className="lg:col-span-2 space-y-4">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Contact Information
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <ContactCard
              icon={Mail}
              label="Email Address"
              value={staff.email}
              href={staff.email ? `mailto:${staff.email}` : null}
            />
            <ContactCard
              icon={Phone}
              label="Phone Number"
              value={staff.phone}
              href={staff.phone ? `tel:${staff.phone}` : null}
            />
            {staff.address && (
              <div className="sm:col-span-2">
                <ContactCard
                  icon={MapPin}
                  label="Address"
                  value={staff.address}
                />
              </div>
            )}
          </div>
        </div>

        {staff.branchIds?.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Branch Access
            </h3>
            <div className="flex flex-wrap gap-2">
              {staff.branchIds.map((branch, i) => {
                const branchName =
                  typeof branch === "object" ? branch.branchName : branch;
                const isDefault =
                  typeof branch === "object"
                    ? branch._id === staff.defaultBranchId
                    : branch === staff.defaultBranchId;
                return (
                  <span
                    key={i}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium",
                      isDefault
                        ? "bg-primary/10 text-primary border-primary/20"
                        : "bg-muted/50 text-muted-foreground border-border",
                    )}
                  >
                    <Building2 className="h-3.5 w-3.5" />
                    {branchName}
                    {isDefault && (
                      <span className="text-xs opacity-70">(default)</span>
                    )}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Tab: Personal ─────────────────────────────────────────────────────── */

function PersonalTab({ staff }) {
  const rows = [
    { label: "Full Name", value: staff.name, className: "capitalize" },
    { label: "Email Address", value: staff.email },
    { label: "Phone Number", value: staff.phone },
    { label: "Gender", value: staff.gender, className: "capitalize" },
    {
      label: "Date of Birth",
      value: staff.dateOfBirth
        ? dayjs(staff.dateOfBirth).format("MMMM D, YYYY")
        : null,
    },
    { label: "Residential Address", value: staff.address, span: 2 },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <h3 className="mb-6 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Personal Details
      </h3>
      <div className="grid gap-6 sm:grid-cols-2">
        {rows.map(({ label, value, className, span }) => (
          <div
            key={label}
            className={cn("space-y-1", span === 2 && "sm:col-span-2")}
          >
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className={cn("text-sm font-medium", className)}>
              {value || "—"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Tab: Work Details ─────────────────────────────────────────────────── */

function WorkTab({ staff, dept }) {
  const shift =
    typeof staff.shiftId === "object" ? staff.shiftId?.shiftName : null;

  const rows = [
    {
      label: "System Role",
      value: staff.role?.replace("_", " "),
      className: "capitalize",
    },
    { label: "Job Title / Designation", value: staff.designation },
    { label: "Department", value: dept || "Not assigned" },
    { label: "Employee Code", value: staff.employeeCode },
    {
      label: "Date of Joining",
      value: staff.dateOfJoining
        ? dayjs(staff.dateOfJoining).format("MMM D, YYYY")
        : null,
    },
    { label: "Assigned Shift", value: shift },
    {
      label: "Reports To",
      value: staff.reportsTo
        ? `${staff.reportsTo.name} (${staff.reportsTo.role?.replace("_", " ")})`
        : null,
      className: "capitalize",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h3 className="mb-6 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Work Assignment
        </h3>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map(({ label, value, className }) => (
            <div key={label} className="space-y-1">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className={cn("text-sm font-medium", className)}>
                {value || "—"}
              </p>
            </div>
          ))}
        </div>
      </div>

      {staff.branchIds?.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Branch Assignments
          </h3>
          <div className="flex flex-wrap gap-2">
            {staff.branchIds.map((branch, i) => {
              const branchName =
                typeof branch === "object" ? branch.branchName : branch;
              const isDefault =
                typeof branch === "object"
                  ? branch._id === staff.defaultBranchId
                  : branch === staff.defaultBranchId;
              return (
                <span
                  key={i}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium",
                    isDefault
                      ? "bg-primary/10 text-primary border-primary/20"
                      : "bg-muted/50 text-muted-foreground border-border",
                  )}
                >
                  <Building2 className="h-3.5 w-3.5" />
                  {branchName}
                  {isDefault && (
                    <span className="text-xs opacity-70">(default)</span>
                  )}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Tab: Emergency Contact ─────────────────────────────────────────────── */

function EmergencyTab({ staff }) {
  const ec = staff.emergencyContact || {};
  const hasData = ec.name || ec.phone || ec.relation;

  if (!hasData) {
    return (
      <div className="rounded-xl border border-border bg-card px-6 py-14 flex flex-col items-center justify-center text-center shadow-sm">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <User className="h-8 w-8 text-muted-foreground opacity-40" />
        </div>
        <p className="font-medium">No Emergency Contact</p>
        <p className="mt-1 text-sm text-muted-foreground">
          No emergency contact has been added for this staff member.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <h3 className="mb-6 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Emergency Contact Details
      </h3>
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Contact Name</p>
          <p className="text-sm font-medium capitalize">{ec.name || "—"}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Phone Number</p>
          {ec.phone ? (
            <a
              href={`tel:${ec.phone}`}
              className="text-sm font-medium text-primary hover:underline"
            >
              {ec.phone}
            </a>
          ) : (
            <p className="text-sm font-medium">—</p>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Relationship</p>
          <p className="text-sm font-medium capitalize">{ec.relation || "—"}</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function InfoItem({ icon: Icon, label, value, className }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={cn("text-sm font-medium truncate", className)}>
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

function ContactCard({ icon: Icon, label, value, href }) {
  const inner = (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border border-border bg-muted/20 p-3.5 transition-all",
        href && value
          ? "hover:border-primary/30 hover:bg-primary/5 cursor-pointer"
          : "opacity-60",
      )}
    >
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium truncate">{value || "—"}</p>
      </div>
    </div>
  );

  if (href && value) return <a href={href}>{inner}</a>;
  return <div>{inner}</div>;
}

/* ─── Loading Skeleton ───────────────────────────────────────────────────── */

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-background pb-10 animate-pulse">
      <div className="mb-6 h-5 w-28 rounded-lg bg-muted" />

      <div className="mb-6 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="h-32 bg-muted" />
        <div className="px-6 pb-6 flex flex-col sm:flex-row gap-4">
          <div className="-mt-14 h-24 w-24 rounded-2xl bg-muted flex-shrink-0 border-4 border-card" />
          <div className="space-y-2 pt-2 flex-1">
            <div className="h-7 w-52 rounded-lg bg-muted" />
            <div className="h-4 w-36 rounded-lg bg-muted" />
            <div className="flex gap-2 mt-2">
              <div className="h-6 w-16 rounded-full bg-muted" />
              <div className="h-6 w-24 rounded-full bg-muted" />
            </div>
          </div>
          <div className="flex gap-2 items-end pb-1">
            <div className="h-10 w-20 rounded-xl bg-muted" />
            <div className="h-10 w-28 rounded-xl bg-muted" />
            <div className="h-10 w-22 rounded-xl bg-muted" />
          </div>
        </div>
      </div>

      <div className="mb-6 h-12 rounded-xl bg-muted" />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="h-3 w-20 rounded bg-muted" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="h-8 w-8 rounded-lg bg-muted flex-shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="h-3 w-16 rounded bg-muted" />
                <div className="h-4 w-32 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
          <div className="h-3 w-24 rounded bg-muted mb-4" />
          <div className="grid gap-3 sm:grid-cols-2">
            {[1, 2].map((i) => (
              <div key={i} className="rounded-xl border border-border p-3.5 flex gap-3">
                <div className="h-9 w-9 rounded-lg bg-muted flex-shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3 w-14 rounded bg-muted" />
                  <div className="h-4 w-36 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
