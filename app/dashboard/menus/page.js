"use client";

import { useMemo, useState } from "react";
import {
  CalendarClock,
  CheckCircle2,
  ChefHat,
  Clock,
  Copy,
  Eye,
  GripVertical,
  Image,
  ListPlus,
  MoreHorizontal,
  Plus,
  Save,
  Search,
  Sparkles,
  Star,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuSections = [
  {
    id: "starters",
    name: "Starters",
    description: "Small plates and shared bites",
    items: [
      {
        name: "Lobster Bisque",
        price: 28,
        tags: ["signature"],
        available: true,
      },
      {
        name: "Caesar Salad",
        price: 18,
        tags: ["vegetarian"],
        available: true,
      },
      { name: "Burrata Toast", price: 22, tags: ["new"], available: true },
    ],
  },
  {
    id: "mains",
    name: "Mains",
    description: "Chef-led dinner favorites",
    items: [
      {
        name: "Wagyu Beef Steak",
        price: 68,
        tags: ["signature"],
        available: true,
      },
      { name: "Grilled Salmon", price: 45, tags: ["healthy"], available: true },
      {
        name: "Truffle Pasta",
        price: 42,
        tags: ["vegetarian"],
        available: true,
      },
    ],
  },
  {
    id: "desserts",
    name: "Desserts",
    description: "Sweet finishes",
    items: [
      {
        name: "Chocolate Lava Cake",
        price: 16,
        tags: ["popular"],
        available: true,
      },
      { name: "Tiramisu", price: 14, tags: ["classic"], available: false },
    ],
  },
];

const suggestedItems = [
  { name: "Craft Cocktail", category: "Drinks", margin: "68%" },
  { name: "Shrimp Scampi", category: "Seafood", margin: "54%" },
  { name: "Red Wine", category: "Drinks", margin: "72%" },
];

const channels = [
  { name: "Dine-in QR", enabled: true },
  { name: "POS Billing", enabled: true },
  { name: "Delivery Menu", enabled: false },
];

export default function NewMenuPage() {
  const [activeSection, setActiveSection] = useState(menuSections[0].id);
  const [menuName, setMenuName] = useState("Dinner Menu");
  const [menuStatus, setMenuStatus] = useState("Draft");
  const [searchQuery, setSearchQuery] = useState("");

  const selectedSection =
    menuSections.find((section) => section.id === activeSection) ||
    menuSections[0];

  const filteredItems = selectedSection.items.filter((item) =>
    `${item.name} ${item.tags.join(" ")}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase()),
  );

  const menuMetrics = useMemo(() => {
    const allItems = menuSections.flatMap((section) => section.items);
    return {
      sections: menuSections.length,
      items: allItems.length,
      available: allItems.filter((item) => item.available).length,
      averagePrice: Math.round(
        allItems.reduce((sum, item) => sum + item.price, 0) / allItems.length,
      ),
    };
  }, []);

  return (
    <div className="min-h-screen bg-background ">
      <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Create New Menu</h1>
          <p className="mt-2 text-muted-foreground">
            Build a menu for QR ordering, POS, delivery, or seasonal service.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted">
            <Eye className="h-4 w-4" />
            Preview
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted">
            <Copy className="h-4 w-4" />
            Duplicate
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            <Save className="h-4 w-4" />
            Save Menu
          </button>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Sections"
          value={menuMetrics.sections}
          detail="Menu categories"
          icon={ListPlus}
          tone="primary"
        />
        <MetricCard
          title="Items"
          value={menuMetrics.items}
          detail="Total dishes"
          icon={UtensilsCrossed}
          tone="success"
        />
        <MetricCard
          title="Available"
          value={menuMetrics.available}
          detail="Ready to sell"
          icon={CheckCircle2}
          tone="accent"
        />
        <MetricCard
          title="Avg. Price"
          value={`$${menuMetrics.averagePrice}`}
          detail="Across menu"
          icon={Star}
          tone="warning"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[18rem_1fr_22rem]">
        <aside className="space-y-6">
          <section className="glass-card rounded-lg p-5">
            <h2 className="text-lg font-semibold">Menu Setup</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Core information
            </p>
            <div className="space-y-4">
              <FormField label="Menu Name">
                <input
                  value={menuName}
                  onChange={(event) => setMenuName(event.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-muted px-3 text-sm outline-none focus:border-primary"
                />
              </FormField>
              <FormField label="Status">
                <select
                  value={menuStatus}
                  onChange={(event) => setMenuStatus(event.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-muted px-3 text-sm outline-none focus:border-primary"
                >
                  <option>Draft</option>
                  <option>Active</option>
                  <option>Scheduled</option>
                </select>
              </FormField>
              <FormField label="Service Window">
                <select
                  className="h-10 w-full rounded-lg border border-border bg-muted px-3 text-sm outline-none focus:border-primary"
                  defaultValue="Dinner"
                >
                  <option>Breakfast</option>
                  <option>Lunch</option>
                  <option>Dinner</option>
                  <option>All day</option>
                </select>
              </FormField>
              <FormField label="Available From">
                <input
                  type="date"
                  className="h-10 w-full rounded-lg border border-border bg-muted px-3 text-sm outline-none focus:border-primary"
                />
              </FormField>
            </div>
          </section>

          <section className="glass-card rounded-lg p-5">
            <h2 className="text-lg font-semibold">Sections</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Organize menu categories
            </p>
            <div className="space-y-2">
              {menuSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm",
                    activeSection === section.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/40 text-muted-foreground hover:text-foreground",
                  )}
                >
                  <span>{section.name}</span>
                  <span>{section.items.length}</span>
                </button>
              ))}
              <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
                <Plus className="h-4 w-4" />
                Add Section
              </button>
            </div>
          </section>
        </aside>

        <main className="space-y-6">
          <section className="glass-card rounded-lg p-5">
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  {selectedSection.name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {selectedSection.description}
                </p>
              </div>
              <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                <Plus className="h-4 w-4" />
                Add Item
              </button>
            </div>

            <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="relative max-w-md flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search menu items"
                  className="h-10 w-full rounded-lg border border-border bg-muted pl-10 pr-3 text-sm outline-none focus:border-primary"
                />
              </div>
              <div className="flex gap-2">
                <button className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted">
                  Bulk Edit
                </button>
                <button className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted">
                  Sort
                </button>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-border">
              <div className="grid grid-cols-[2rem_1.4fr_0.7fr_0.8fr_0.7fr_2.5rem] bg-muted/60 px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground max-lg:hidden">
                <span />
                <span>Item</span>
                <span>Price</span>
                <span>Tags</span>
                <span>Status</span>
                <span />
              </div>

              <div className="divide-y divide-border">
                {filteredItems.map((item) => (
                  <div
                    key={item.name}
                    className="grid gap-4 px-4 py-4 lg:grid-cols-[2rem_1.4fr_0.7fr_0.8fr_0.7fr_2.5rem] lg:items-center"
                  >
                    <GripVertical className="hidden h-4 w-4 text-muted-foreground lg:block" />
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                        <Image className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Tap to edit item details
                        </p>
                      </div>
                    </div>
                    <input
                      defaultValue={`$${item.price.toFixed(2)}`}
                      className="h-9 w-full rounded-lg border border-border bg-muted px-3 text-sm outline-none focus:border-primary"
                    />
                    <div className="flex flex-wrap gap-1">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <span
                      className={cn(
                        "w-fit rounded-full px-2 py-1 text-xs",
                        item.available
                          ? "bg-success/10 text-success"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {item.available ? "Available" : "Hidden"}
                    </span>
                    <button className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="glass-card rounded-lg p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  Availability & Channels
                </h2>
                <p className="text-sm text-muted-foreground">
                  Choose where this menu can be sold.
                </p>
              </div>
              <CalendarClock className="h-5 w-5 text-primary" />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {channels.map((channel) => (
                <div
                  key={channel.name}
                  className="rounded-lg border border-border bg-muted/30 p-4"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <span className="font-medium">{channel.name}</span>
                    <span
                      className={cn(
                        "h-5 w-9 rounded-full p-0.5",
                        channel.enabled ? "bg-primary" : "bg-muted",
                      )}
                    >
                      <span
                        className={cn(
                          "block h-4 w-4 rounded-full bg-white",
                          channel.enabled && "translate-x-4",
                        )}
                      />
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {channel.enabled
                      ? "Enabled for this menu"
                      : "Not available yet"}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </main>

        <aside className="space-y-6">
          <section className="glass-card rounded-lg p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Live Preview</h2>
                <p className="text-sm text-muted-foreground">
                  Guest-facing menu
                </p>
              </div>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="rounded-lg border border-border bg-background p-4">
              <div className="mb-5 rounded-lg bg-muted/50 p-4">
                <p className="text-xs text-muted-foreground">Flavor Hub</p>
                <h3 className="text-2xl font-semibold">{menuName}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {menuStatus}
                </p>
              </div>
              <div className="space-y-3">
                {selectedSection.items.slice(0, 3).map((item) => (
                  <div key={item.name} className="rounded-lg bg-muted/30 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {selectedSection.name}
                        </p>
                      </div>
                      <span className="text-sm font-semibold">
                        ${item.price}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="glass-card rounded-lg p-5">
            <h2 className="text-lg font-semibold">AI Suggestions</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Items to consider adding
            </p>
            <div className="space-y-3">
              {suggestedItems.map((item) => (
                <div key={item.name} className="rounded-lg bg-muted/30 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{item.name}</p>
                    <Sparkles className="h-4 w-4 text-accent" />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.category} • {item.margin} margin
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="glass-card rounded-lg p-5">
            <h2 className="text-lg font-semibold">Publishing Checklist</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Ready before activation
            </p>
            <div className="space-y-3">
              <ChecklistItem done label="Menu name added" />
              <ChecklistItem done label="At least one section" />
              <ChecklistItem done label="Pricing complete" />
              <ChecklistItem label="Photos reviewed" />
              <ChecklistItem label="Tax rules confirmed" />
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
        <ChefHat className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="text-2xl font-semibold">{value}</p>
      <p className="mt-1 font-medium">{title}</p>
      <p className="text-sm text-muted-foreground">{detail}</p>
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}

function ChecklistItem({ done, label }) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-muted/30 p-3 text-sm">
      <span
        className={cn(
          "flex h-5 w-5 items-center justify-center rounded-full",
          done
            ? "bg-success text-background"
            : "bg-muted text-muted-foreground",
        )}
      >
        {done ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : (
          <Clock className="h-4 w-4" />
        )}
      </span>
      <span className={done ? "text-foreground" : "text-muted-foreground"}>
        {label}
      </span>
    </div>
  );
}
