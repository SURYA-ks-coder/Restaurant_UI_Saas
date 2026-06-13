"use client";

import { useMemo, useState } from "react";
import {
  Award,
  CalendarClock,
  CheckCircle2,
  Clock,
  Mail,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  Star,
  UserCheck,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const staffMembers = [
  {
    id: "STF-001",
    name: "Maya Kapoor",
    role: "Server",
    department: "Floor",
    status: "on_shift",
    shift: "4:00 PM - 11:00 PM",
    rating: 4.9,
    phone: "+91 98765 11001",
    email: "maya@flavorhub.test",
  },
  {
    id: "STF-002",
    name: "Ravi Menon",
    role: "Head Chef",
    department: "Kitchen",
    status: "on_shift",
    shift: "2:00 PM - 10:00 PM",
    rating: 4.8,
    phone: "+91 98765 11002",
    email: "ravi@flavorhub.test",
  },
  {
    id: "STF-003",
    name: "Isha Rao",
    role: "Host",
    department: "Floor",
    status: "break",
    shift: "5:00 PM - 12:00 AM",
    rating: 4.7,
    phone: "+91 98765 11003",
    email: "isha@flavorhub.test",
  },
  {
    id: "STF-004",
    name: "Noah D'Souza",
    role: "Bartender",
    department: "Bar",
    status: "on_shift",
    shift: "6:00 PM - 1:00 AM",
    rating: 4.6,
    phone: "+91 98765 11004",
    email: "noah@flavorhub.test",
  },
  {
    id: "STF-005",
    name: "Anika Shah",
    role: "Pastry Chef",
    department: "Kitchen",
    status: "off",
    shift: "Off today",
    rating: 4.8,
    phone: "+91 98765 11005",
    email: "anika@flavorhub.test",
  },
  {
    id: "STF-006",
    name: "Kabir Singh",
    role: "Runner",
    department: "Floor",
    status: "scheduled",
    shift: "8:00 PM - 1:00 AM",
    rating: 4.4,
    phone: "+91 98765 11006",
    email: "kabir@flavorhub.test",
  },
  {
    id: "STF-007",
    name: "Neha Rao",
    role: "Cashier",
    department: "Admin",
    status: "on_shift",
    shift: "3:00 PM - 10:00 PM",
    rating: 4.5,
    phone: "+91 98765 11007",
    email: "neha@flavorhub.test",
  },
  {
    id: "STF-008",
    name: "Arjun Patel",
    role: "Line Cook",
    department: "Kitchen",
    status: "scheduled",
    shift: "7:00 PM - 2:00 AM",
    rating: 4.6,
    phone: "+91 98765 11008",
    email: "arjun@flavorhub.test",
  },
];

const shiftBlocks = [
  { time: "2 PM", kitchen: "Ravi", floor: "Prep crew", bar: "-" },
  { time: "4 PM", kitchen: "Ravi, Anika", floor: "Maya", bar: "-" },
  { time: "6 PM", kitchen: "Ravi, Arjun", floor: "Maya, Isha", bar: "Noah" },
  { time: "8 PM", kitchen: "Ravi, Arjun", floor: "Maya, Kabir", bar: "Noah" },
  { time: "10 PM", kitchen: "Arjun", floor: "Kabir", bar: "Noah" },
];

const requests = [
  {
    name: "Maya Kapoor",
    type: "Shift swap",
    detail: "Swap Friday close with Sunday lunch",
    status: "Pending",
  },
  {
    name: "Anika Shah",
    type: "Time off",
    detail: "May 18 - May 20",
    status: "Review",
  },
  {
    name: "Noah D'Souza",
    type: "Overtime",
    detail: "2.5 hours from last weekend",
    status: "Pending",
  },
];

const departments = ["All", "Floor", "Kitchen", "Bar", "Admin"];

const statusStyles = {
  on_shift: {
    label: "On Shift",
    className: "bg-success/10 text-success",
    dot: "bg-success",
  },
  break: {
    label: "On Break",
    className: "bg-warning/10 text-warning",
    dot: "bg-warning",
  },
  scheduled: {
    label: "Scheduled",
    className: "bg-primary/10 text-primary",
    dot: "bg-primary",
  },
  off: {
    label: "Off",
    className: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground",
  },
};

export default function StaffPage() {
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStaff, setSelectedStaff] = useState(staffMembers[0]);

  const filteredStaff = staffMembers.filter((member) => {
    const matchesDepartment =
      selectedDepartment === "All" || member.department === selectedDepartment;
    const matchesSearch = `${member.name} ${member.role} ${member.department}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesDepartment && matchesSearch;
  });

  const metrics = useMemo(() => {
    return {
      total: staffMembers.length,
      onShift: staffMembers.filter((member) => member.status === "on_shift")
        .length,
      scheduled: staffMembers.filter((member) => member.status === "scheduled")
        .length,
      requests: requests.length,
    };
  }, []);

  return (
    <div className="min-h-screen bg-background ">
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
          <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            <Plus className="h-4 w-4" />
            Add Staff
          </button>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Team Members"
          value={metrics.total}
          detail="Active profiles"
          icon={Users}
          tone="primary"
        />
        <MetricCard
          title="On Shift"
          value={metrics.onShift}
          detail="Currently clocked in"
          icon={UserCheck}
          tone="success"
        />
        <MetricCard
          title="Scheduled"
          value={metrics.scheduled}
          detail="Upcoming tonight"
          icon={Clock}
          tone="accent"
        />
        <MetricCard
          title="Requests"
          value={metrics.requests}
          detail="Need review"
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
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search staff, role, or department"
                className="h-10 w-full rounded-lg border border-border bg-muted pl-10 pr-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {departments.map((department) => (
                <button
                  key={department}
                  onClick={() => setSelectedDepartment(department)}
                  className={cn(
                    "whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium",
                    selectedDepartment === department
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground",
                  )}
                >
                  {department}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {filteredStaff.map((member) => {
              const status = statusStyles[member.status];
              const isSelected = selectedStaff?.id === member.id;

              return (
                <button
                  key={member.id}
                  onClick={() => setSelectedStaff(member)}
                  className={cn(
                    "rounded-lg border border-border bg-card/40 p-4 text-left transition-all hover:-translate-y-0.5 hover:bg-muted/30",
                    isSelected &&
                      "border-primary/50 bg-primary/5 ring-2 ring-primary/30",
                  )}
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
                        {member.name
                          .split(" ")
                          .map((part) => part[0])
                          .join("")}
                      </div>
                      <div>
                        <h2 className="font-semibold">{member.name}</h2>
                        <p className="text-sm text-muted-foreground">
                          {member.role}
                        </p>
                      </div>
                    </div>
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
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
                    <span className="flex items-center gap-1 text-sm text-warning">
                      <Star className="h-4 w-4 fill-current" />
                      {member.rating}
                    </span>
                  </div>

                  <div className="rounded-lg bg-muted/30 p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Department</span>
                      <span>{member.department}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-muted-foreground">Shift</span>
                      <span>{member.shift}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
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

            {selectedStaff && (
              <div>
                <div className="mb-4 rounded-lg border border-border bg-muted/30 p-4">
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 text-lg font-semibold text-primary">
                    {selectedStaff.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")}
                  </div>
                  <h3 className="text-xl font-semibold">
                    {selectedStaff.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedStaff.role} • {selectedStaff.department}
                  </p>
                </div>

                <div className="space-y-3 text-sm">
                  <InfoRow label="Staff ID" value={selectedStaff.id} />
                  <InfoRow
                    label="Status"
                    value={statusStyles[selectedStaff.status].label}
                  />
                  <InfoRow label="Shift" value={selectedStaff.shift} />
                  <InfoRow label="Rating" value={selectedStaff.rating} />
                </div>

                <div className="mt-5 grid grid-cols-2 gap-2">
                  <button className="flex items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted">
                    <Phone className="h-4 w-4" />
                    Call
                  </button>
                  <button className="flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">
                    <Mail className="h-4 w-4" />
                    Message
                  </button>
                </div>
              </div>
            )}
          </section>

          <section className="glass-card rounded-lg p-5">
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
          </section>

          <section className="glass-card rounded-lg p-5">
            <h2 className="text-lg font-semibold">Requests</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Pending staff actions
            </p>
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
          </section>
        </aside>
      </div>
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
    <div className="glass-card rounded-lg p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className={cn("rounded-lg p-3", tones[tone])}>
          <Icon className="h-5 w-5" />
        </div>
        <Users className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="text-2xl font-semibold">{value}</p>
      <p className="mt-1 font-medium">{title}</p>
      <p className="text-sm text-muted-foreground">{detail}</p>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
