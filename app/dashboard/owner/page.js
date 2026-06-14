"use client";

import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Crown,
  FileText,
  Plus,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";

const quickActions = [
  {
    title: "Register Restaurant",
    description: "Set up a new restaurant with owner, branches, and subscription details.",
    icon: Plus,
    href: "/dashboard/owner/add-restaurant",
    accent: "bg-primary/10 text-primary",
    border: "hover:border-primary/40",
  },
  {
    title: "Subscription Plans",
    description: "Manage and configure available subscription tiers.",
    icon: FileText,
    href: "/dashboard/settings/master",
    accent: "bg-success/10 text-success",
    border: "hover:border-success/40",
  },
  {
    title: "Staff & Privileges",
    description: "Assign roles, manage staff access and permissions.",
    icon: ShieldCheck,
    href: "/dashboard/privileges",
    accent: "bg-warning/10 text-warning",
    border: "hover:border-warning/40",
  },
  {
    title: "Settings",
    description: "Configure categories, departments, shifts, and more.",
    icon: Settings,
    href: "/dashboard/settings",
    accent: "bg-blue-500/10 text-blue-500",
    border: "hover:border-blue-400/40",
  },
];

const stats = [
  { label: "Restaurants", value: "1", icon: Building2 },
  { label: "Active Branches", value: "2", icon: BadgeCheck },
  { label: "Total Staff", value: "6", icon: Users },
  { label: "Subscription", value: "Premium", icon: Crown },
];

export default function OwnerPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Banner */}
      <div className="mb-8 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary">
            <Crown className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              Owner Tools
            </p>
            <h1 className="text-2xl font-bold">Owner Control Panel</h1>
          </div>
        </div>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground">
          Administrative tools for restaurant setup, subscription management,
          and operational configuration. Use these tools to onboard and manage
          restaurants end-to-end.
        </p>
      </div>

      {/* Stats Row */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="glass-card flex items-center gap-4 rounded-lg p-4"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="text-xl font-bold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Quick Actions</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className={`glass-card group flex flex-col gap-4 rounded-lg border border-border p-5 no-underline transition-all duration-200 ${item.border}`}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${item.accent}`}
              >
                <item.icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.description}
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                Open <ArrowRight className="h-3 w-3" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Support Note */}
      <section className="glass-card rounded-lg border border-border p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Crown className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Owner Access Only</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              This section is reserved for platform owners and administrators.
              Use{" "}
              <Link
                href="/dashboard/owner/add-restaurant"
                className="text-primary underline-offset-2 hover:underline"
              >
                Register Restaurant
              </Link>{" "}
              to onboard a new restaurant. All created restaurants will appear
              in the Restaurant Profile and Branch Management sections.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
