"use client";

import { useEffect, useMemo, useState } from "react";
import { CreditCard, LayoutGrid, ShieldCheck, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { API, getAction } from "@/lib/API";
import Table from "@/components/ui/Table";
import AssignSubscription from "./AssignSubscription";

const normalizeList = (result, fallback = []) => {
  const data = result?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.docs)) return data.docs;
  if (Array.isArray(data?.list)) return data.list;
  if (Array.isArray(data?.restaurants)) return data.restaurants;
  return fallback;
};

export default function OwnerSubscriptionsPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [restaurantRes, planRes] = await Promise.all([
        getAction(API.GET_RESTAURANT_LIST),
        getAction(API.GET_SUBSCRIPTION_PLAN_LIST, {}),
      ]);
      if (restaurantRes?.statusCode === 200) {
        setRestaurants(normalizeList(restaurantRes));
      }
      if (planRes?.statusCode === 200) {
        setPlans(planRes?.data || []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const planById = useMemo(() => {
    const map = new Map();
    plans.forEach((plan) => map.set(plan._id, plan));
    return map;
  }, [plans]);

  const resolvePlan = (restaurant) => {
    const raw = restaurant?.subscriptionPlan;
    if (raw && typeof raw === "object") return raw;
    if (raw && planById.has(raw)) return planById.get(raw);
    return null;
  };

  const stats = useMemo(() => {
    const assigned = restaurants.filter((r) => resolvePlan(r)).length;
    return {
      total: restaurants.length,
      assigned,
      unassigned: restaurants.length - assigned,
      plansAvailable: plans.filter((p) => p.status === "active").length,
    };
  }, [restaurants, plans]);

  const openAssign = (row) => {
    setSelectedRestaurant(row);
    setDrawerOpen(true);
  };

  const restaurantHeader = [
    { title: "Restaurant", value: "restaurantName", type: "bold" },
    { title: "Owner", value: "ownerName" },
    {
      title: "Current Plan",
      value: "subscriptionPlan",
      render: (_, row) => {
        const plan = resolvePlan(row);
        return plan ? (
          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
            {plan.planName}
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
            No plan
          </span>
        );
      },
    },
    {
      title: "Billing",
      value: "billing",
      render: (_, row) => {
        const plan = resolvePlan(row);
        return plan ? `Rs ${plan.price || 0} / ${plan.billingCycle}` : "-";
      },
    },
    { title: "Status", value: "status", type: "status" },
    {
      title: "Updated",
      value: "updatedAt",
      render: (value) => (value ? new Date(value).toLocaleDateString() : "-"),
    },
    {
      title: "Actions",
      value: "actions",
      align: "right",
      render: (_, row) => (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            openAssign(row);
          }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
        >
          <CreditCard className="h-3.5 w-3.5" />
          Manage Plan
        </button>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="mb-8 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              Owner Tools
            </p>
            <h1 className="text-2xl font-bold">Subscriptions</h1>
          </div>
        </div>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground">
          View every restaurant&apos;s active plan and assign or change
          subscriptions from the plan catalog.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          label="Restaurants"
          value={stats.total}
          icon={LayoutGrid}
          tone="primary"
        />
        <StatCard
          label="On a Plan"
          value={stats.assigned}
          icon={ShieldCheck}
          tone="success"
        />
        <StatCard
          label="No Plan Assigned"
          value={stats.unassigned}
          icon={Wallet}
          tone="warning"
        />
        <StatCard
          label="Plans Available"
          value={stats.plansAvailable}
          icon={CreditCard}
          tone="accent"
        />
      </div>

      <div className="glass-card rounded-lg p-5">
        <Table
          header={restaurantHeader}
          data={restaurants}
          loading={loading}
          rowKey="_id"
          title="Restaurant Subscriptions"
          searchPlaceholder="Search restaurant, owner..."
          onRowClick={openAssign}
        />
      </div>

      <AssignSubscription
        open={drawerOpen}
        restaurant={selectedRestaurant}
        plans={plans}
        onOpenChange={(next) => {
          setDrawerOpen(next);
          if (!next) setSelectedRestaurant(null);
        }}
        onAssigned={() => {
          setDrawerOpen(false);
          setSelectedRestaurant(null);
          fetchAll();
        }}
      />
    </div>
  );
}

function StatCard({ label, value, icon: Icon, tone }) {
  const tones = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    accent: "bg-accent/10 text-accent",
  };

  return (
    <div className="glass-card flex items-center gap-4 rounded-lg p-4">
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
          tones[tone],
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );
}
