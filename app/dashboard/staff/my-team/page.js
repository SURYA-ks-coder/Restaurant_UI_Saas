"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { API, getAction } from "@/lib/API";

const statusStyles = {
  active: { label: "Active", className: "bg-success/10 text-success", dot: "bg-success" },
  inactive: { label: "Inactive", className: "bg-muted text-muted-foreground", dot: "bg-muted-foreground" },
  blocked: { label: "Blocked", className: "bg-destructive/10 text-destructive", dot: "bg-destructive" },
};

const roleColors = {
  manager: "bg-purple-100 text-purple-700",
  cashier: "bg-blue-100 text-blue-700",
  chef: "bg-orange-100 text-orange-700",
  waiter: "bg-sky-100 text-sky-700",
  server: "bg-teal-100 text-teal-700",
  staff: "bg-gray-100 text-gray-700",
  inventory_staff: "bg-amber-100 text-amber-700",
};

function getInitials(name = "") {
  return name.split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2);
}

function StaffCard({ member, depth = 0 }) {
  const [expanded, setExpanded] = useState(false);
  const status = statusStyles[member.status] || statusStyles.inactive;
  const roleClass = roleColors[member.role] || "bg-gray-100 text-gray-700";
  const hasSubordinates = member.subordinates?.length > 0;
  const designationName =
    typeof member.designationId === "object"
      ? member.designationId?.designationName
      : member.designationId || null;
  const roleName =
    typeof member.roleId === "object"
      ? member.roleId?.roleName
      : member.role || "Staff";

  return (
    <div className="flex flex-col gap-3">
      <div
        className={cn(
          "rounded-xl border border-border bg-card p-4 shadow-sm transition-all",
          depth > 0 && "border-primary/20 bg-primary/5",
        )}
      >
        <div className="flex items-start justify-between gap-3">
          {/* Avatar + name */}
          <div className="flex items-center gap-3">
            {member.profileImage ? (
              <img
                src={member.profileImage}
                alt={member.name}
                className="h-11 w-11 rounded-xl object-cover border-2 border-border shrink-0"
              />
            ) : (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
                {getInitials(member.name)}
              </div>
            )}
            <div>
              <p className="font-semibold capitalize leading-tight">{member.name}</p>
              {designationName && (
                <p className="text-xs text-muted-foreground mt-0.5">{designationName}</p>
              )}
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
                status.className,
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} />
              {status.label}
            </span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                roleClass,
              )}
            >
              {roleName}
            </span>
          </div>
        </div>

        {/* Expand subordinates */}
        {hasSubordinates && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="mt-3 flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            {expanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
            {expanded ? "Hide" : "View"} Team ({member.subordinates.length})
          </button>
        )}
      </div>

      {/* Nested subordinates — max 3 levels */}
      {expanded && hasSubordinates && depth < 2 && (
        <div className="ml-6 flex flex-col gap-3 border-l-2 border-primary/20 pl-4">
          {member.subordinates.map((sub) => (
            <StaffCard key={sub._id} member={sub} depth={depth + 1} />
          ))}
        </div>
      )}

      {/* Deep hierarchy fallback */}
      {expanded && hasSubordinates && depth >= 2 && (
        <div className="ml-6 pl-4 border-l-2 border-primary/20">
          <Link
            href="/dashboard/staff"
            className="text-xs text-primary underline underline-offset-2 hover:opacity-80"
          >
            View full team in Staff Management →
          </Link>
        </div>
      )}
    </div>
  );
}

export default function MyTeamPage() {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTeam = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAction(API.GET_MY_TEAM);
      if (result?.statusCode === 200) {
        setTeam(result.data || []);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  return (
    <div className="min-h-screen bg-background pb-10">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <Link
            href="/dashboard/staff"
            className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Staff
          </Link>
          <h1 className="text-3xl font-bold">My Team</h1>
          <p className="mt-2 text-muted-foreground">
            Your direct reports and their subordinate hierarchy.
          </p>
        </div>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-muted shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 w-32 rounded bg-muted" />
                  <div className="h-3 w-20 rounded bg-muted" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && team.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-linear-to-b from-muted/40 to-muted/10 px-6 py-24 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted shadow-inner">
            <Users className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold tracking-tight">
            No direct reports assigned yet
          </h3>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            Assign staff to report to you from the Staff Management page by
            setting their &quot;Reports To&quot; field.
          </p>
          <Link
            href="/dashboard/staff"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90 transition"
          >
            Go to Staff Management
          </Link>
        </div>
      )}

      {/* Team grid */}
      {!loading && team.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {team.map((member) => (
            <StaffCard key={member._id} member={member} depth={0} />
          ))}
        </div>
      )}
    </div>
  );
}
