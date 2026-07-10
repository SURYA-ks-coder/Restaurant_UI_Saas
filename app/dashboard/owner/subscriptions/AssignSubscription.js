"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { message } from "@/lib/message";
import { cn } from "@/lib/utils";
import { action, API } from "@/lib/API";
import { getUserId } from "@/lib/auth";
import DrawerPop from "@/components/ui/DrawerPop";

const getId = (value) => value?._id || value || "";

function PlanCard({ plan, selected, isCurrent, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "relative flex flex-col gap-3 rounded-xl border p-4 text-left transition-colors",
        selected
          ? "border-primary bg-primary/5 ring-1 ring-primary"
          : "border-border bg-card hover:border-primary/40",
      )}
    >
      {isCurrent && (
        <span className="absolute right-3 top-3 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
          Current Plan
        </span>
      )}
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
            selected
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border",
          )}
        >
          {selected && <CheckCircle2 className="h-4 w-4" />}
        </span>
        <p className="font-semibold text-foreground">{plan.planName}</p>
      </div>

      <div>
        <span className="text-2xl font-bold text-foreground">
          Rs {plan.price || 0}
        </span>
        <span className="text-xs text-muted-foreground">
          {" "}
          / {plan.billingCycle || "month"}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-lg bg-muted/50 py-2">
          <p className="font-semibold text-foreground">
            {plan.maxBranches ?? "-"}
          </p>
          <p className="text-muted-foreground">Branches</p>
        </div>
        <div className="rounded-lg bg-muted/50 py-2">
          <p className="font-semibold text-foreground">
            {plan.maxUsers ?? "-"}
          </p>
          <p className="text-muted-foreground">Users</p>
        </div>
        <div className="rounded-lg bg-muted/50 py-2">
          <p className="font-semibold text-foreground">
            {plan.maxOrders ?? "-"}
          </p>
          <p className="text-muted-foreground">Orders</p>
        </div>
      </div>

      {plan.trialDays ? (
        <p className="text-xs text-muted-foreground">
          {plan.trialDays} day free trial
        </p>
      ) : null}

      {Array.isArray(plan.features) && plan.features.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {plan.features.map((feature) => (
            <span
              key={feature}
              className="rounded-full bg-muted px-2 py-1 text-[11px] text-muted-foreground"
            >
              {feature}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}

export default function AssignSubscription({
  open,
  restaurant,
  plans = [],
  onOpenChange,
  onAssigned,
}) {
  const [show, setShow] = useState(open);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setShow(open);
  }, [open]);

  useEffect(() => {
    if (!open || !restaurant) return;
    setSelectedPlanId(getId(restaurant.subscriptionPlan) || "");
  }, [open, restaurant]);

  const close = (val) => {
    setShow(val);
    onOpenChange?.(val);
  };

  const currentPlanId = getId(restaurant?.subscriptionPlan);

  const handleAssign = async () => {
    if (!restaurant?._id || !selectedPlanId) return;
    setSubmitting(true);
    try {
      const result = await action(API.UPGRADE_RESTAURANT_SUBSCRIPTION, {
        restaurantId: restaurant._id,
        planId: selectedPlanId,
        userId: getUserId(),
      });

      if (result?.statusCode === 200 || result?.statusCode === 201) {
        message.success(result?.message || "Subscription updated.");
        onAssigned?.();
      } else {
        message.error(result?.message || "Unable to update subscription.");
      }
    } catch (err) {
      message.error(err?.response?.data?.message || "Request failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DrawerPop
      open={show}
      close={close}
      header={[
        "Manage Subscription",
        restaurant?.restaurantName
          ? `Choose a plan for ${restaurant.restaurantName}.`
          : "Choose a plan for this restaurant.",
      ]}
      footerBtn={["Cancel", "Assign Plan"]}
      handleSubmit={handleAssign}
      footerBtnDisabled={!selectedPlanId || submitting}
      loadingButton={submitting}
      width={720}
    >
      <div className="p-1">
        {plans.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No subscription plans found. Create one from the plan catalog
            first.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {plans.map((plan) => (
              <PlanCard
                key={plan._id}
                plan={plan}
                selected={selectedPlanId === plan._id}
                isCurrent={currentPlanId === plan._id}
                onSelect={() => setSelectedPlanId(plan._id)}
              />
            ))}
          </div>
        )}
      </div>
    </DrawerPop>
  );
}
