"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Edit3,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Store,
  Utensils,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { action, getAction, API } from "@/lib/API";
import AddBranch from "@/app/dashboard/restaurant-profile/Branch/AddBranch";

const sampleBranches = [
  {
    _id: "sample-branch-1",
    branchName: "Indiranagar Flagship",
    branchCode: "BLR-01",
    code: "BLR-01",
    address: "100 Feet Road, Indiranagar, Bengaluru",
    manager: "Anika Rao",
    managerId: "sample-manager-1",
    phone: "+91 98765 43210",
    status: "active",
    isDefault: true,
    service: "Dine-in, delivery, takeaway",
    revenue: "Rs 4.8L",
    orders: 384,
  },
  {
    _id: "sample-branch-2",
    branchName: "Koramangala Express",
    branchCode: "BLR-02",
    code: "BLR-02",
    address: "5th Block, Koramangala, Bengaluru",
    manager: "Rohan Mehta",
    managerId: "sample-manager-2",
    phone: "+91 98765 41023",
    status: "active",
    isDefault: false,
    service: "Delivery and takeaway",
    revenue: "Rs 3.1L",
    orders: 246,
  },
  {
    _id: "sample-branch-3",
    branchName: "Whitefield Bistro",
    branchCode: "BLR-03",
    code: "BLR-03",
    address: "Phoenix Marketcity, Whitefield, Bengaluru",
    manager: "Neha S.",
    managerId: "sample-manager-3",
    phone: "+91 98765 49821",
    status: "inactive",
    isDefault: false,
    service: "Opening soon",
    revenue: "Rs 0",
    orders: 0,
  },
];

const sampleManagers = [
  { _id: "sample-manager-1", name: "Anika Rao", email: "anika@flavorhub.test", phone: "+91 98765 43210", role: "manager", status: "active" },
  { _id: "sample-manager-2", name: "Rohan Mehta", email: "rohan@flavorhub.test", phone: "+91 98765 41023", role: "manager", status: "active" },
  { _id: "sample-manager-3", name: "Neha S.", email: "neha@flavorhub.test", phone: "+91 98765 49821", role: "manager", status: "inactive" },
];

const getEntityId = (item) => item?._id || item?.id || item?.code || item?.email;

const normalizeList = (result, fallback = []) => {
  const data = result?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.docs)) return data.docs;
  if (Array.isArray(data?.list)) return data.list;
  if (Array.isArray(data?.branches)) return data.branches;
  if (Array.isArray(data?.users)) return data.users;
  return fallback;
};

const normalizeBranch = (branch, managers = []) => {
  const managerId =
    typeof branch?.manager === "object"
      ? getEntityId(branch.manager)
      : branch?.manager;
  const managerName =
    typeof branch?.manager === "object"
      ? branch.manager?.name
      : managers.find((m) => getEntityId(m) === managerId)?.name;

  return {
    ...branch,
    _id: getEntityId(branch),
    name: branch?.branchName || branch?.name || "Unnamed branch",
    branchName: branch?.branchName || branch?.name || "",
    branchCode: branch?.branchCode || branch?.code || "",
    code: branch?.code || branch?.branchCode || "",
    manager: managerName || "Unassigned",
    managerId: managerId || "",
    status: branch?.status || "active",
    service: branch?.service || "Dine-in, delivery, takeaway",
    revenue: branch?.revenue || "Rs 0",
    orders: branch?.orders ?? 0,
  };
};

export default function BranchManagementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const restaurantId = searchParams.get("restaurantId");
  const restaurantName = searchParams.get("restaurantName")
    ? decodeURIComponent(searchParams.get("restaurantName"))
    : null;

  const [branchRows, setBranchRows] = useState(sampleBranches);
  const [managerRows, setManagerRows] = useState(sampleManagers);
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [updateId, setUpdateId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const normalizedBranches = useMemo(
    () => branchRows.map((b) => normalizeBranch(b, managerRows)),
    [branchRows, managerRows],
  );

  const filtered = normalizedBranches.filter((b) => {
    const matchesSearch = `${b.name} ${b.code} ${b.address} ${b.manager}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: normalizedBranches.length,
    active: normalizedBranches.filter((b) => b.status === "active").length,
    inactive: normalizedBranches.filter((b) => b.status === "inactive").length,
  };

  const fetchBranches = async () => {
    try {
      const result = await getAction(API.GET_BRANCH_LIST, {});
      if (result?.statusCode === 200 || result?.statusCode === 201) {
        const list = normalizeList(result, sampleBranches);
        setBranchRows(list.length ? list : sampleBranches);
      }
    } catch {
      setBranchRows(sampleBranches);
    }
  };

  const fetchManagers = async () => {
    try {
      const result = await action(API.GET_STAFF_LIST, { role: "manager" });
      if (result?.statusCode === 200 || result?.statusCode === 201) {
        const list = normalizeList(result, sampleManagers).filter(
          (u) => (u?.role || "manager") === "manager",
        );
        setManagerRows(list.length ? list : sampleManagers);
      }
    } catch {
      setManagerRows(sampleManagers);
    }
  };

  useEffect(() => {
    fetchBranches();
    fetchManagers();
  }, []);

  const openAdd = () => {
    setUpdateId(null);
    setDrawerOpen(true);
  };

  const openEdit = (id) => {
    setUpdateId(id);
    setDrawerOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          {restaurantId ? (
            <button
              type="button"
              onClick={() => router.push("/dashboard/owner/add-restaurant")}
              className="mb-3 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Restaurants
            </button>
          ) : (
            <p className="mb-2 text-sm font-medium text-accent">Locations</p>
          )}
          <h1 className="text-3xl font-bold md:text-4xl">
            {restaurantName ? `${restaurantName} — Branches` : "Branch Management"}
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            {restaurantName
              ? `Viewing all branches for ${restaurantName}.`
              : "Manage all your restaurant locations — view details, assign managers, and track branch performance in one place."}
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="flex w-fit items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
        >
          <Plus className="h-4 w-4" />
          Add Branch
        </button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Branches"
          value={stats.total}
          icon={Building2}
          color="primary"
        />
        <StatCard
          label="Active"
          value={stats.active}
          icon={CheckCircle2}
          color="success"
        />
        <StatCard
          label="Inactive"
          value={stats.inactive}
          icon={XCircle}
          color="warning"
        />
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, code, address, manager…"
            className="h-10 w-full rounded-lg border border-border bg-muted pl-10 pr-3 text-sm outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-2">
          {["all", "active", "inactive"].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setStatusFilter(f)}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                statusFilter === f
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-muted text-muted-foreground hover:bg-muted/80",
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Branch Cards Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 py-20 text-center">
          <Building2 className="mb-4 h-12 w-12 text-muted-foreground/40" />
          <p className="text-base font-medium text-muted-foreground">
            No branches found
          </p>
          <p className="mt-1 text-sm text-muted-foreground/60">
            Try adjusting your search or filter.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((branch) => (
            <BranchCard
              key={getEntityId(branch)}
              branch={branch}
              onEdit={() => openEdit(getEntityId(branch))}
            />
          ))}
        </div>
      )}

      <AddBranch
        open={drawerOpen}
        updateId={updateId}
        branches={normalizedBranches}
        managers={managerRows}
        onOpenChange={(next) => {
          setDrawerOpen(next);
          if (!next) setUpdateId(null);
        }}
        onSaved={() => {
          fetchBranches();
          fetchManagers();
        }}
      />
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  const colorMap = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
  };

  return (
    <div className="glass-card flex items-center gap-4 rounded-xl p-4">
      <span className={cn("rounded-lg p-3", colorMap[color])}>
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function BranchCard({ branch, onEdit }) {
  const isActive = branch.status === "active";

  return (
    <div className="glass-card flex flex-col rounded-xl border border-border p-5 transition-shadow hover:shadow-md">
      {/* Card Header */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Store className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold leading-tight">{branch.name}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {branch.code}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {branch.isDefault && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              Default
            </span>
          )}
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs font-medium",
              isActive
                ? "bg-success/10 text-success"
                : "bg-warning/10 text-warning",
            )}
          >
            {isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="flex-1 space-y-2.5">
        <DetailItem icon={MapPin} text={branch.address || "—"} />
        <DetailItem icon={Phone} text={branch.phone || "—"} />
        <DetailItem
          icon={Store}
          text={`Manager: ${branch.manager || "Unassigned"}`}
        />
        <DetailItem icon={Utensils} text={branch.service || "—"} />
      </div>

      {/* Metrics */}
      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4">
        <div className="rounded-lg bg-muted/40 px-3 py-2">
          <p className="text-xs text-muted-foreground">Revenue</p>
          <p className="mt-0.5 text-sm font-semibold">{branch.revenue}</p>
        </div>
        <div className="rounded-lg bg-muted/40 px-3 py-2">
          <p className="text-xs text-muted-foreground">Orders</p>
          <p className="mt-0.5 text-sm font-semibold">{branch.orders}</p>
        </div>
      </div>

      {/* Edit Button */}
      <button
        type="button"
        onClick={onEdit}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-border py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
      >
        <Edit3 className="h-3.5 w-3.5" />
        Edit Branch
      </button>
    </div>
  );
}

function DetailItem({ icon: Icon, text }) {
  return (
    <div className="flex items-start gap-2 text-xs text-muted-foreground">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span className="line-clamp-1">{text}</span>
    </div>
  );
}
