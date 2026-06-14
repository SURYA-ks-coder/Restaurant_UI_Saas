"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Edit3,
  Globe2,
  Landmark,
  Mail,
  MapPin,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  Store,
  Utensils,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { action, getAction, API } from "@/lib/API";
import AddBranch from "./Branch/AddBranch";
import AddManager from "./Manager/AddManager";
import { FaPen } from "react-icons/fa6";

const branches = [
  {
    _id: "sample-branch-1",
    name: "Indiranagar Flagship",
    branchName: "Indiranagar Flagship",
    code: "BLR-01",
    branchCode: "BLR-01",
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
    name: "Koramangala Express",
    branchName: "Koramangala Express",
    code: "BLR-02",
    branchCode: "BLR-02",
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
    name: "Whitefield Bistro",
    branchName: "Whitefield Bistro",
    code: "BLR-03",
    branchCode: "BLR-03",
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
  {
    _id: "sample-manager-1",
    name: "Anika Rao",
    ownerName: "",
    email: "anika@flavorhub.test",
    phone: "+91 98765 43210",
    role: "manager",
    status: "active",
    branchIds: ["sample-branch-1"],
    defaultBranchId: "sample-branch-1",
  },
  {
    _id: "sample-manager-2",
    name: "Rohan Mehta",
    ownerName: "",
    email: "rohan@flavorhub.test",
    phone: "+91 98765 41023",
    role: "manager",
    status: "active",
    branchIds: ["sample-branch-2"],
    defaultBranchId: "sample-branch-2",
  },
  {
    _id: "sample-manager-3",
    name: "Neha S.",
    ownerName: "",
    email: "neha@flavorhub.test",
    phone: "+91 98765 49821",
    role: "manager",
    status: "inactive",
    branchIds: ["sample-branch-3"],
    defaultBranchId: "sample-branch-3",
  },
];

const serviceHours = [
  { day: "Mon - Thu", time: "11:00 AM - 11:00 PM" },
  { day: "Fri", time: "11:00 AM - 12:30 AM" },
  { day: "Sat - Sun", time: "10:30 AM - 12:30 AM" },
];

const getEntityId = (item) =>
  item?._id || item?.id || item?.code || item?.email;

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

const normalizeManager = (manager) => ({
  ...manager,
  _id: getEntityId(manager),
  name: manager?.name || manager?.ownerName || "Unnamed manager",
  role: manager?.role || "manager",
  status: manager?.status || "active",
  branchIds: Array.isArray(manager?.branchIds) ? manager.branchIds : [],
});

export default function RestaurantProfilePage() {
  const [branchRows, setBranchRows] = useState(branches);
  const [managerRows, setManagerRows] = useState(sampleManagers);
  const [selectedBranch, setSelectedBranch] = useState(branches[0].code);
  const [branchSearch, setBranchSearch] = useState("");
  const [branchDrawerOpen, setBranchDrawerOpen] = useState(false);
  const [managerDrawerOpen, setManagerDrawerOpen] = useState(false);
  const [branchUpdateId, setBranchUpdateId] = useState(null);
  const [managerUpdateId, setManagerUpdateId] = useState(null);

  const normalizedBranches = useMemo(
    () => branchRows.map((branch) => normalizeBranch(branch, managerRows)),
    [branchRows, managerRows],
  );
  const normalizedManagers = useMemo(
    () => managerRows.map(normalizeManager),
    [managerRows],
  );
  const filteredBranches = normalizedBranches.filter((branch) =>
    `${branch.name} ${branch.code} ${branch.address}`
      .toLowerCase()
      .includes(branchSearch.toLowerCase()),
  );
  const activeBranch =
    normalizedBranches.find((b) => getEntityId(b) === selectedBranch) ??
    normalizedBranches[0];

  const fetchManagers = async () => {
    try {
      const result = await action(API.GET_STAFF_LIST, { role: "manager" });
      if (result?.statusCode === 200 || result?.statusCode === 201) {
        const users = normalizeList(result, sampleManagers)
          .filter((u) => (u?.role || "manager") === "manager")
          .map(normalizeManager);
        setManagerRows(users.length ? users : sampleManagers);
      }
    } catch {
      setManagerRows(sampleManagers);
    }
  };

  const fetchBranches = async () => {
    try {
      const result = await getAction(API.GET_BRANCH_LIST, {});
      if (result?.statusCode === 200 || result?.statusCode === 201) {
        const next = normalizeList(result, branches);
        setBranchRows(next.length ? next : branches);
        if (next[0]) setSelectedBranch(getEntityId(next[0]));
      }
    } catch {
      setBranchRows(branches);
    }
  };

  useEffect(() => {
    fetchManagers();
    fetchBranches();
  }, []);

  const activeManagerCount = normalizedManagers.filter(
    (m) => m.status === "active",
  ).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="mb-2 text-sm font-medium text-accent">
            Restaurant Management
          </p>
          <h1 className="text-3xl font-bold md:text-4xl">Restaurant Profile</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            View branch locations, managers, and operating details.
          </p>
        </div>
        <button
          type="button"
          className="flex w-fit items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted"
        >
          <Edit3 className="h-4 w-4" />
          Edit Profile
        </button>
      </div>

      {/* Restaurant Overview Card */}
      <section className="glass-card mb-6 rounded-lg p-5">
        <div className="flex items-start gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Store className="h-8 w-8" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-bold">Flavor Hub</h2>
              <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
                Active
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Mail className="h-4 w-4" /> surya@gmail.com
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="h-4 w-4" /> +91 98765 43210
              </span>
              <span className="flex items-center gap-1.5">
                <Landmark className="h-4 w-4" /> GSTIN: 33ABCDE1234F1Z5
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                Premium Plan
              </span>
              <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                INR · Asia/Kolkata
              </span>
              <span className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                <Globe2 className="h-3 w-3" /> surya-food.restaurant.com
              </span>
              <span className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" /> Chennai, Tamil Nadu, India
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-5 md:grid-cols-4">
          <MetricCard label="Total Branches" value={normalizedBranches.length} />
          <MetricCard label="Active Managers" value={activeManagerCount} />
          <MetricCard label="Currency" value="INR" />
          <MetricCard label="Timezone" value="Asia/Kolkata" />
        </div>
      </section>

      {/* Main Grid */}
      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.75fr]">
        <main className="space-y-6">
          <section className="glass-card overflow-hidden rounded-lg">
            <div className="grid gap-0 lg:grid-cols-[18rem_1fr]">
              {/* Branch List */}
              <div className="border-b border-border p-5 lg:border-b-0 lg:border-r">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">Branches</h2>
                    <p className="text-sm text-muted-foreground">
                      Choose a location to review.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setBranchUpdateId(null);
                      setBranchDrawerOpen(true);
                    }}
                    className="rounded-lg bg-primary p-2 text-primary-foreground"
                    title="Create branch"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={branchSearch}
                    onChange={(e) => setBranchSearch(e.target.value)}
                    placeholder="Search branch"
                    className="h-10 w-full rounded-lg border border-border bg-muted pl-10 pr-3 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  {filteredBranches.map((branch) => {
                    const branchId = getEntityId(branch);
                    const active = selectedBranch === branchId;

                    return (
                      <button
                        key={branchId}
                        type="button"
                        onClick={() => setSelectedBranch(branchId)}
                        className={cn(
                          "w-full rounded-lg border p-3 text-left transition-colors",
                          active
                            ? "border-primary bg-primary/10"
                            : "border-border bg-muted/20 hover:bg-muted/40",
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold">
                              {branch.name}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {branch.code}
                            </p>
                          </div>
                          <FaPen
                            className="cursor-pointer text-sm text-gray-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              setBranchUpdateId(getEntityId(branch));
                              setBranchDrawerOpen(true);
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="mt-3 line-clamp-2 text-xs text-muted-foreground">
                            {branch.address}
                          </p>
                          <span
                            className={cn(
                              "rounded-full px-2 py-1 text-xs font-medium",
                              branch.status === "active"
                                ? "bg-success/10 text-success"
                                : "bg-warning/10 text-warning",
                            )}
                          >
                            {branch.status === "active" ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Branch Detail */}
              <div className="p-5">
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Store className="h-7 w-7" />
                    </div>
                    <h2 className="text-2xl font-semibold">
                      {activeBranch.name}
                    </h2>
                    <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {activeBranch.address}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <MetricCard
                    label="Today Revenue"
                    value={activeBranch.revenue}
                  />
                  <MetricCard label="Orders" value={activeBranch.orders} />
                  <MetricCard
                    label="Branch Code"
                    value={activeBranch.code}
                  />
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <InfoPanel title="Branch Contact">
                    <DetailRow
                      icon={Store}
                      label="Manager"
                      value={activeBranch.manager}
                    />
                    <DetailRow
                      icon={Phone}
                      label="Phone"
                      value={activeBranch.phone}
                    />
                    <DetailRow
                      icon={Utensils}
                      label="Service"
                      value={activeBranch.service}
                    />
                  </InfoPanel>

                  <InfoPanel title="Operating Hours">
                    {serviceHours.map((slot) => (
                      <div
                        key={slot.day}
                        className="flex items-center justify-between rounded-lg bg-muted/30 p-3"
                      >
                        <span className="text-sm font-medium">{slot.day}</span>
                        <span className="text-sm text-muted-foreground">
                          {slot.time}
                        </span>
                      </div>
                    ))}
                  </InfoPanel>
                </div>
              </div>
            </div>
          </section>
        </main>

        <aside className="space-y-6">
          {/* Managers */}
          <section className="glass-card rounded-lg p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Managers</h2>
                <p className="text-sm text-muted-foreground">
                  Branch manager access and assignments.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setManagerUpdateId(null);
                  setManagerDrawerOpen(true);
                }}
                className="rounded-lg bg-primary p-2 text-primary-foreground"
                title="Add manager"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              {normalizedManagers.map((manager) => (
                <div
                  key={getEntityId(manager)}
                  className="rounded-lg border border-border bg-muted/20 p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
                        {manager.name
                          .split(" ")
                          .map((p) => p[0])
                          .join("")
                          .slice(0, 2)}
                      </span>
                      <div>
                        <p className="text-sm font-semibold">{manager.name}</p>
                        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {manager.email || "No email"}
                        </p>
                        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {manager.phone || "No phone"}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setManagerUpdateId(getEntityId(manager));
                        setManagerDrawerOpen(true);
                      }}
                      className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                      title="Manage manager"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="rounded-full bg-primary/10 px-2 py-1 text-primary">
                      {manager.role}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-1",
                        manager.status === "active"
                          ? "bg-success/10 text-success"
                          : "bg-warning/10 text-warning",
                      )}
                    >
                      {manager.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Receipt Header Preview */}
          <section className="glass-card rounded-lg p-5">
            <h2 className="text-lg font-semibold">Receipt Header</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Preview for this branch.
            </p>
            <div className="rounded-lg bg-muted/30 p-4 text-center">
              <p className="text-lg font-semibold">Flavor Hub</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {activeBranch.name}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {activeBranch.address}
              </p>
              <div className="my-4 border-t border-dashed border-border" />
              <p className="text-xs text-muted-foreground">
                GSTIN: 29ABCDE1234F1Z5
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Thank you for dining with us
              </p>
            </div>
          </section>
        </aside>
      </div>

      <AddBranch
        open={branchDrawerOpen}
        updateId={branchUpdateId}
        branches={normalizedBranches}
        managers={normalizedManagers}
        onOpenChange={(next) => {
          setBranchDrawerOpen(next);
          if (!next) setBranchUpdateId(null);
        }}
        onSaved={() => {
          fetchBranches();
          fetchManagers();
        }}
      />

      <AddManager
        open={managerDrawerOpen}
        updateId={managerUpdateId}
        branches={normalizedBranches}
        managers={normalizedManagers}
        onOpenChange={(next) => {
          setManagerDrawerOpen(next);
          if (!next) setManagerUpdateId(null);
        }}
        onSaved={() => {
          fetchManagers();
          fetchBranches();
        }}
      />
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function InfoPanel({ title, children }) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 p-4">
      <h3 className="mb-4 text-sm font-semibold">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-muted/30 p-3">
      <span className="rounded-lg bg-primary/10 p-2 text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
