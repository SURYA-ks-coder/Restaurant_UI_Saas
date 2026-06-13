"use client";

import { useEffect, useState } from "react";
import Table from "@/components/ui/Table";
import { action, API, getAction } from "@/lib/API";
import AddSubscriptionPlan from "./AddSubscriptionPlan";
const subscriptionPlanHeader = [
  {
    title: "Plan Name",
    value: "planName",
    type: "bold",
  },
  {
    title: "Price",
    value: "price",
    render: (value) => `Rs ${value || 0}`,
    align: "right",
    width: 120,
  },
  {
    title: "Billing Cycle",
    value: "billingCycle",
    width: 120,
  },
  {
    title: "Trial Days",
    value: "trialDays",
    align: "right",
    width: 100,
  },
  {
    title: "Max Branches",
    value: "maxBranches",
    align: "right",
    width: 120,
  },
  {
    title: "Max Users",
    value: "maxUsers",
    align: "right",
    width: 100,
  },
  {
    title: "Max Orders",
    value: "maxOrders",
    align: "right",
    width: 120,
  },
  {
    title: "Features",
    value: "features",
    render: (value) =>
      Array.isArray(value) && value.length ? value.join(", ") : "-",
  },
  {
    title: "System Plan",
    value: "isSystem",
    render: (value) => (value ? "Yes" : "No"),
    width: 110,
  },
  {
    title: "Status",
    value: "status",
    type: "status",
    width: 100,
  },
  {
    title: "Updated",
    value: "updatedAt",
    render: (value) => (value ? new Date(value).toLocaleDateString() : "-"),
    width: 120,
  },
  {
    title: "Actions",
    value: "actions",
    type: "action",
    align: "right",
    width: 120,
  },
];
export default function SubscriptionPlanList({ refreshKey }) {
  const [planData, setPlanData] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [planId, setPlanId] = useState(null);

  useEffect(() => {
    getPlanList();
  }, [refreshKey]);

  const getPlanList = async () => {
    try {
      const result = await getAction(API.GET_SUBSCRIPTION_PLAN_LIST, {});

      if (result?.statusCode === 200) {
        setPlanData(result?.data || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const deletePlan = async (id) => {
    try {
      const result = await action(
        `${API.DELETE_SUBSCRIPTION_PLAN}/${id}`,
        {},
        "DELETE",
      );

      if (result?.statusCode === 200) {
        getPlanList();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-4">
      <Table
        header={subscriptionPlanHeader}
        data={planData}
        title="Subscription Plans"
        rowKey="_id"
        onView={() => {}}
        onEdit={(id) => {
          setPlanId(id);
          setDrawerOpen(true);
        }}
        onDelete={deletePlan}
      />

      <AddSubscriptionPlan
        open={drawerOpen}
        updateId={planId}
        onOpenChange={(open) => {
          setDrawerOpen(open);

          if (!open) {
            setPlanId(null);
          }
        }}
        onCreated={() => {
          setPlanId(null);
          getPlanList();
        }}
      />
    </div>
  );
}
