"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, CheckCircle2, Plus, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { action, getAction, API } from "@/lib/API";
import Table from "@/components/ui/Table";
import AddRestaurant from "./AddRestaurant";

const sampleRestaurants = [
  {
    _id: "rest-1",
    restaurantName: "Flavor Hub",
    ownerName: "Surya KS",
    email: "surya@flavorhub.com",
    mobileNumber: "9876543210",
    city: "Chennai",
    state: "Tamil Nadu",
    country: "India",
    status: "active",
    subscriptionPlan: "premium",
    subdomain: "flavorhub",
  },
  {
    _id: "rest-2",
    restaurantName: "Spice Garden",
    ownerName: "Priya Rajan",
    email: "priya@spicegarden.com",
    mobileNumber: "9876512345",
    city: "Bengaluru",
    state: "Karnataka",
    country: "India",
    status: "active",
    subscriptionPlan: "standard",
    subdomain: "spicegarden",
  },
  {
    _id: "rest-3",
    restaurantName: "The Curry House",
    ownerName: "Rahul Sharma",
    email: "rahul@curryhouse.com",
    mobileNumber: "9876567890",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    status: "inactive",
    subscriptionPlan: "basic",
    subdomain: "curryhouse",
  },
];

const restaurantHeader = [
  { title: "Restaurant", value: "restaurantName", type: "link" },
  { title: "Owner", value: "ownerName", type: "bold" },
  { title: "Email", value: "email" },
  { title: "City", value: "city" },
  { title: "Plan", value: "subscriptionPlan", type: "status" },
  { title: "Status", value: "status", type: "status" },
  { title: "Actions", value: "actions", type: "action" },
];

const normalizeList = (result, fallback = []) => {
  const data = result?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.docs)) return data.docs;
  if (Array.isArray(data?.list)) return data.list;
  if (Array.isArray(data?.restaurants)) return data.restaurants;
  return fallback;
};

export default function RestaurantList() {
  const router = useRouter();
  const [data, setData] = useState(sampleRestaurants);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [restaurantId, setRestaurantId] = useState(null);

  const fetchList = async () => {
    setLoading(true);
    try {
      const result = await getAction(API.GET_RESTAURANT_LIST);
      if (result?.statusCode === 200 || result?.statusCode === 201) {
        const list = normalizeList(result, sampleRestaurants);
        setData(list.length ? list : sampleRestaurants);
      }
    } catch {
      setData(sampleRestaurants);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const handleDelete = async (id) => {
    try {
      const result = await action(`${API.DELETE_RESTAURANT}/${id}`, {}, "DELETE");
      if (result?.statusCode === 200 || result?.statusCode === 201) {
        fetchList();
      }
    } catch {
      // silent
    }
  };

  const stats = {
    total: data.length,
    active: data.filter((r) => r.status === "active").length,
    inactive: data.filter((r) => r.status !== "active").length,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="mb-2 text-sm font-medium text-accent">Owner Tools</p>
          <h1 className="text-3xl font-bold md:text-4xl">Restaurants</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            All registered restaurants on the platform. Click a row to view its
            branches.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setRestaurantId(null);
            setDrawerOpen(true);
          }}
          className="flex w-fit items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
        >
          <Plus className="h-4 w-4" />
          Add Restaurant
        </button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Total Restaurants" value={stats.total} icon={Building2} color="primary" />
        <StatCard label="Active" value={stats.active} icon={CheckCircle2} color="success" />
        <StatCard label="Inactive" value={stats.inactive} icon={XCircle} color="warning" />
      </div>

      {/* Table */}
      <div className="glass-card rounded-lg p-5">
        <Table
          header={restaurantHeader}
          data={data}
          loading={loading}
          rowKey="_id"
          searchPlaceholder="Search restaurant, owner, city..."
          onRowClick={(record) => {
            const name = encodeURIComponent(record.restaurantName || "");
            router.push(
              `/dashboard/branch-management?restaurantId=${record._id}&restaurantName=${name}`
            );
          }}
          onEdit={(id) => {
            setRestaurantId(id);
            setDrawerOpen(true);
          }}
          onDelete={handleDelete}
        />
      </div>

      <AddRestaurant
        open={drawerOpen}
        onOpenChange={(next) => {
          setDrawerOpen(next);
          if (!next) setRestaurantId(null);
        }}
        onCreated={() => {
          setRestaurantId(null);
          fetchList();
        }}
        updateId={restaurantId}
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
