"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowDownRight,
  CalendarClock,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  FileText,
  Filter,
  MoreHorizontal,
  Plus,
  Receipt,
  Search,
  TrendingDown,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";

const expenses = [
  {
    id: "EXP-1048",
    vendor: "Ocean Fresh",
    category: "Ingredients",
    amount: 820,
    method: "Bank transfer",
    status: "paid",
    date: "Today",
    owner: "Kitchen",
  },
  {
    id: "EXP-1047",
    vendor: "City Power",
    category: "Utilities",
    amount: 1180,
    method: "ACH",
    status: "pending",
    date: "Today",
    owner: "Operations",
  },
  {
    id: "EXP-1046",
    vendor: "Prime Cuts",
    category: "Ingredients",
    amount: 1460,
    method: "Card",
    status: "paid",
    date: "Yesterday",
    owner: "Kitchen",
  },
  {
    id: "EXP-1045",
    vendor: "Table Linen Co.",
    category: "Supplies",
    amount: 340,
    method: "Card",
    status: "approval",
    date: "Yesterday",
    owner: "Floor",
  },
  {
    id: "EXP-1044",
    vendor: "Staff Payroll",
    category: "Payroll",
    amount: 5400,
    method: "Bank transfer",
    status: "scheduled",
    date: "May 15",
    owner: "Admin",
  },
  {
    id: "EXP-1043",
    vendor: "Food Delivery Ads",
    category: "Marketing",
    amount: 620,
    method: "Card",
    status: "paid",
    date: "May 10",
    owner: "Marketing",
  },
  {
    id: "EXP-1042",
    vendor: "EquipCare",
    category: "Maintenance",
    amount: 275,
    method: "Card",
    status: "approval",
    date: "May 09",
    owner: "Operations",
  },
  {
    id: "EXP-1041",
    vendor: "BakeSource",
    category: "Ingredients",
    amount: 390,
    method: "Bank transfer",
    status: "paid",
    date: "May 08",
    owner: "Pastry",
  },
];

const budgets = [
  { category: "Ingredients", spent: 2670, budget: 4200, color: "bg-primary" },
  { category: "Payroll", spent: 5400, budget: 7600, color: "bg-accent" },
  { category: "Utilities", spent: 1180, budget: 1800, color: "bg-warning" },
  { category: "Marketing", spent: 620, budget: 1200, color: "bg-success" },
];

const approvals = [
  {
    vendor: "Table Linen Co.",
    amount: "$340.00",
    requester: "Maya",
    reason: "Dining room refresh",
  },
  {
    vendor: "EquipCare",
    amount: "$275.00",
    requester: "Ravi",
    reason: "Dishwasher service",
  },
];

const recurringBills = [
  { name: "Rent", due: "May 14", amount: "$8,500.00", status: "Upcoming" },
  { name: "Payroll", due: "May 15", amount: "$5,400.00", status: "Scheduled" },
  { name: "Software", due: "May 20", amount: "$299.00", status: "Auto-pay" },
];

const categories = [
  "All",
  "Ingredients",
  "Payroll",
  "Utilities",
  "Supplies",
  "Marketing",
  "Maintenance",
];

const statusStyles = {
  paid: {
    label: "Paid",
    className: "bg-success/10 text-success",
    icon: CheckCircle2,
  },
  pending: {
    label: "Pending",
    className: "bg-warning/10 text-warning",
    icon: Clock,
  },
  approval: {
    label: "Approval",
    className: "bg-primary/10 text-primary",
    icon: AlertCircle,
  },
  scheduled: {
    label: "Scheduled",
    className: "bg-accent/10 text-accent",
    icon: CalendarClock,
  },
};

export default function ExpensesPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExpense, setSelectedExpense] = useState(expenses[0]);

  const filteredExpenses = expenses.filter((expense) => {
    const matchesCategory =
      selectedCategory === "All" || expense.category === selectedCategory;
    const matchesSearch =
      `${expense.vendor} ${expense.category} ${expense.owner} ${expense.id}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const metrics = useMemo(() => {
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const pending = expenses.filter(
      (expense) =>
        expense.status === "pending" || expense.status === "approval",
    ).length;
    const paid = expenses
      .filter((expense) => expense.status === "paid")
      .reduce((sum, expense) => sum + expense.amount, 0);

    return {
      total,
      pending,
      paid,
      average: Math.round(total / expenses.length),
    };
  }, []);

  return (
    <div className="min-h-screen bg-background ">
      <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Expenses</h1>
          <p className="mt-2 text-muted-foreground">
            Monitor spend, approvals, budgets, and vendor payments.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted">
            <Download className="h-4 w-4" />
            Export
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            <Plus className="h-4 w-4" />
            Add Expense
          </button>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Monthly Spend"
          value={`$${metrics.total.toLocaleString()}`}
          detail="Across all departments"
          icon={Wallet}
          tone="primary"
        />
        <MetricCard
          title="Paid"
          value={`$${metrics.paid.toLocaleString()}`}
          detail="Settled transactions"
          icon={CheckCircle2}
          tone="success"
        />
        <MetricCard
          title="Needs Action"
          value={metrics.pending}
          detail="Pending or approval"
          icon={AlertCircle}
          tone="warning"
        />
        <MetricCard
          title="Avg. Expense"
          value={`$${metrics.average.toLocaleString()}`}
          detail="Per transaction"
          icon={TrendingDown}
          tone="accent"
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
                placeholder="Search expense, vendor, owner, or ID"
                className="h-10 w-full rounded-lg border border-border bg-muted pl-10 pr-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={cn(
                    "whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium",
                    selectedCategory === category
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground",
                  )}
                >
                  {category}
                </button>
              ))}
              <button className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
                <Filter className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-border">
            <div className="grid grid-cols-[1.1fr_0.8fr_0.8fr_0.8fr_0.8fr_2.5rem] bg-muted/60 px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground max-lg:hidden">
              <span>Vendor</span>
              <span>Category</span>
              <span>Amount</span>
              <span>Status</span>
              <span>Owner</span>
              <span />
            </div>

            <div className="divide-y divide-border">
              {filteredExpenses.map((expense) => {
                const status = statusStyles[expense.status];
                const StatusIcon = status.icon;
                const isSelected = selectedExpense?.id === expense.id;

                return (
                  <button
                    key={expense.id}
                    onClick={() => setSelectedExpense(expense)}
                    className={cn(
                      "grid w-full gap-4 px-4 py-4 text-left transition-colors hover:bg-muted/40 lg:grid-cols-[1.1fr_0.8fr_0.8fr_0.8fr_0.8fr_2.5rem]",
                      isSelected && "bg-primary/5",
                    )}
                  >
                    <div>
                      <p className="font-medium">{expense.vendor}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {expense.id} • {expense.date}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground lg:text-foreground">
                      {expense.category}
                    </div>
                    <div className="text-sm font-semibold">
                      ${expense.amount.toLocaleString()}
                    </div>
                    <div>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
                          status.className,
                        )}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {expense.owner}
                    </div>
                    <div className="flex justify-end">
                      <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="glass-card rounded-lg p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Expense Details</h2>
                <p className="text-sm text-muted-foreground">
                  Selected transaction
                </p>
              </div>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </div>

            {selectedExpense && (
              <div>
                <div className="mb-4 rounded-lg border border-border bg-muted/30 p-4">
                  <p className="text-sm text-muted-foreground">
                    {selectedExpense.id}
                  </p>
                  <h3 className="mt-1 text-2xl font-semibold">
                    ${selectedExpense.amount.toLocaleString()}
                  </h3>
                  <p className="mt-1 text-sm">{selectedExpense.vendor}</p>
                </div>

                <div className="space-y-3 text-sm">
                  <InfoRow label="Category" value={selectedExpense.category} />
                  <InfoRow label="Payment" value={selectedExpense.method} />
                  <InfoRow
                    label="Status"
                    value={statusStyles[selectedExpense.status].label}
                  />
                  <InfoRow label="Owner" value={selectedExpense.owner} />
                  <InfoRow label="Date" value={selectedExpense.date} />
                </div>

                <div className="mt-5 grid grid-cols-2 gap-2">
                  <button className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">
                    Approve
                  </button>
                  <button className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted">
                    Attach Bill
                  </button>
                </div>
              </div>
            )}
          </section>

          <section className="glass-card rounded-lg p-5">
            <h2 className="text-lg font-semibold">Budget Tracker</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Monthly category usage
            </p>
            <div className="space-y-4">
              {budgets.map((budget) => {
                const usage = Math.min(
                  100,
                  Math.round((budget.spent / budget.budget) * 100),
                );
                return (
                  <div key={budget.category}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span>{budget.category}</span>
                      <span className="text-muted-foreground">
                        ${budget.spent.toLocaleString()} / $
                        {budget.budget.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn("h-full rounded-full", budget.color)}
                        style={{ width: `${usage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="glass-card rounded-lg p-5">
            <h2 className="text-lg font-semibold">Approvals</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Waiting for manager review
            </p>
            <div className="space-y-3">
              {approvals.map((approval) => (
                <div
                  key={approval.vendor}
                  className="rounded-lg bg-muted/30 p-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{approval.vendor}</p>
                    <span className="text-sm font-semibold">
                      {approval.amount}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {approval.requester} • {approval.reason}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="glass-card rounded-lg p-5">
            <h2 className="text-lg font-semibold">Recurring Bills</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Upcoming scheduled payments
            </p>
            <div className="space-y-3">
              {recurringBills.map((bill) => (
                <div
                  key={bill.name}
                  className="flex items-center justify-between rounded-lg bg-muted/30 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2 text-primary">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{bill.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {bill.due} • {bill.status}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold">{bill.amount}</span>
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
    warning: "bg-warning/10 text-warning",
    accent: "bg-accent/10 text-accent",
  };

  return (
    <div className="glass-card rounded-lg p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className={cn("rounded-lg p-3", tones[tone])}>
          <Icon className="h-5 w-5" />
        </div>
        <ArrowDownRight className="h-4 w-4 text-muted-foreground" />
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
