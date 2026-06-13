"use client";

import { useState } from "react";
import {
  Bell,
  CreditCard,
  PlugZap,
  Printer,
  Settings,
  ShieldCheck,
  Store,
  TabletSmartphone,
  Wifi,
} from "lucide-react";
import { cn } from "@/lib/utils";
import TabsNew from "@/components/ui/TabsNew";
import Heading from "@/components/ui/Heading";
import CategoryList from "./category/CategoryList";
import ButtonClick from "@/components/ui/ButtonClick";
import SubCategoryList from "./subCategory/SubCategoryList";
import MenuItemList from "./menuItems/MenuItemList";
import AddCategory from "./category/AddCategory";
import AddSubCategory from "./subCategory/AddSubCategory";
import AddMenuItem from "./menuItems/AddMenuItem";
import SuppliersList from "./suppliers/SuppliersList";
import AddSuppliers from "./suppliers/AddSuppliers";
import SubscriptionPlanList from "./master/SubscriptionPlan";
import AddSubscriptionPlan from "./master/AddSubscriptionPlan";

const settingSections = [
  { id: "profile", label: "Restaurant Profile", icon: Store },
  { id: "operations", label: "Operations", icon: Settings },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "integrations", label: "Integrations", icon: PlugZap },
  { id: "security", label: "Security", icon: ShieldCheck },
];

const integrations = [
  { name: "Stripe Payments", status: "Connected", icon: CreditCard },
  { name: "Kitchen Printer", status: "Online", icon: Printer },
  { name: "Guest Wi-Fi", status: "Active", icon: Wifi },
  { name: "Online Ordering", status: "Needs review", icon: TabletSmartphone },
];

const permissionRoles = [
  { role: "Owner", access: "Full access", users: 1 },
  { role: "Manager", access: "Operations, reports, staff", users: 3 },
  { role: "Cashier", access: "POS and orders", users: 4 },
  { role: "Kitchen", access: "KOT and inventory view", users: 6 },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("profile");
  const [onlineOrdering, setOnlineOrdering] = useState(true);
  const [autoPrint, setAutoPrint] = useState(true);
  const [lowStockAlerts, setLowStockAlerts] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(false);
  const [selectedTab, setSelectedTab] = useState("Category");
  const [categoryDrawerOpen, setCategoryDrawerOpen] = useState(false);
  const [categoryRefreshKey, setCategoryRefreshKey] = useState(0);
  const [subCategoryDrawerOpen, setSubCategoryDrawerOpen] = useState(false);
  const [subCategoryRefreshKey, setSubCategoryRefreshKey] = useState(0);
  const [menuItemDrawerOpen, setMenuItemDrawerOpen] = useState(false);
  const [menuItemRefreshKey, setMenuItemRefreshKey] = useState(0);
  const [suppliersDrawerOpen, setSuppliersDrawerOpen] = useState(false);
  const [suppliersRefreshKey, setSuppliersRefreshKey] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleAddClick = () => {
    if (selectedTab === "Category") {
      setCategoryDrawerOpen(true);
    }
    if (selectedTab === "Sub Category") {
      setSubCategoryDrawerOpen(true);
    }
    if (selectedTab === "Menu Items") {
      setMenuItemDrawerOpen(true);
    }
    if (selectedTab === "Suppliers") {
      setSuppliersDrawerOpen(true);
    }

    if (selectedTab === "Subcription") {
      setDrawerOpen(true);
    }
  };

  return (
    <div className="min-h-screen  flex flex-col gap-6">
      <div className=" flex items-center justify-between">
        <Heading
          title="Settings"
          description="Configure your restaurant settings"
        />
        <ButtonClick
          buttonName={"Add " + selectedTab}
          BtnType="add"
          handleSubmit={handleAddClick}
        />
      </div>
      <TabsNew
        onTabChange={(id, tab) => {
          setSelectedTab(tab.title);
        }}
        tabs={[
          {
            id: 1,
            title: "Category",
            content: <CategoryList refreshKey={categoryRefreshKey} />,
          },
          {
            id: 2,
            title: "Sub Category",
            content: <SubCategoryList refreshKey={subCategoryRefreshKey} />,
          },
          {
            id: 3,
            title: "Menu Items",
            content: <MenuItemList refreshKey={menuItemRefreshKey} />,
          },
          {
            id: 4,
            title: "Suppliers",
            content: <SuppliersList refreshKey={suppliersRefreshKey} />,
          },
          {
            id: 5,
            title: "Subcription",
            content: <SubscriptionPlanList refreshKey={suppliersRefreshKey} />,
          },
        ]}
      />
      <AddCategory
        open={categoryDrawerOpen}
        onOpenChange={setCategoryDrawerOpen}
        onCreated={() => setCategoryRefreshKey((key) => key + 1)}
      />
      <AddSubCategory
        open={subCategoryDrawerOpen}
        onOpenChange={setSubCategoryDrawerOpen}
        onCreated={() => setSubCategoryRefreshKey((key) => key + 1)}
      />
      <AddMenuItem
        open={menuItemDrawerOpen}
        onOpenChange={setMenuItemDrawerOpen}
        onCreated={() => setMenuItemRefreshKey((key) => key + 1)}
      />
      <AddSuppliers
        open={suppliersDrawerOpen}
        onOpenChange={setSuppliersDrawerOpen}
        onCreated={() => setSuppliersRefreshKey((key) => key + 1)}
      />
      {drawerOpen && (
        <AddSubscriptionPlan
          open={drawerOpen}
          onOpenChange={(open) => {
            setDrawerOpen(open);
          }}
          // onCreated={() => {
          //   setPlanId(null);
          //   getPlanList();
          // }}
        />
      )}
    </div>
  );
}
