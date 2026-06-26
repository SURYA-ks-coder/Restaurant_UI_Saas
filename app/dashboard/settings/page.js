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
import DesignationList from "./designation/DesignationList";
import AddDesignation from "./designation/AddDesignation";
import DepartmentList from "./department/DepartmentList";
import AddDepartment from "./department/AddDepartment";
import ShiftList from "./shift/ShiftList";
import AddShift from "./shift/AddShift";
import PrinterList from "./printer/PrinterList";
import AddPrinter from "./printer/AddPrinter";

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
  const [departmentDrawerOpen, setDepartmentDrawerOpen] = useState(false);
  const [departmentRefreshKey, setDepartmentRefreshKey] = useState(0);
  const [designationDrawerOpen, setDesignationDrawerOpen] = useState(false);
  const [designationRefreshKey, setDesignationRefreshKey] = useState(0);
  const [shiftDrawerOpen, setShiftDrawerOpen] = useState(false);
  const [shiftRefreshKey, setShiftRefreshKey] = useState(0);
  const [printerDrawerOpen, setPrinterDrawerOpen] = useState(false);
  const [printerRefreshKey, setPrinterRefreshKey] = useState(0);

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
    if (selectedTab === "Department") {
      setDepartmentDrawerOpen(true);
    }
    if (selectedTab === "Designation") {
      setDesignationDrawerOpen(true);
    }
    if (selectedTab === "shift") {
      setShiftDrawerOpen(true);
    }
    if (selectedTab === "Printer") {
      setPrinterDrawerOpen(true);
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
          {
            id: 6,
            title: "Department",
            content: <DepartmentList refreshKey={departmentRefreshKey} />,
          },
          {
            id: 7,
            title: "Designation",
            content: <DesignationList refreshKey={designationRefreshKey} />,
          },
          {
            id: 8,
            title: "shift",
            content: <ShiftList refreshKey={shiftRefreshKey} />,
          },
          {
            id: 9,
            title: "Printer",
            content: <PrinterList refreshKey={printerRefreshKey} />,
          },
        ]}
      />
      {categoryDrawerOpen && (
        <AddCategory
          open={categoryDrawerOpen}
          onOpenChange={setCategoryDrawerOpen}
          onCreated={() => setCategoryRefreshKey((key) => key + 1)}
        />
      )}
      {subCategoryDrawerOpen && (
        <AddSubCategory
          open={subCategoryDrawerOpen}
          onOpenChange={setSubCategoryDrawerOpen}
          onCreated={() => setSubCategoryRefreshKey((key) => key + 1)}
        />
      )}
      {menuItemDrawerOpen && (
        <AddMenuItem
          open={menuItemDrawerOpen}
          onOpenChange={setMenuItemDrawerOpen}
          onCreated={() => setMenuItemRefreshKey((key) => key + 1)}
        />
      )}
      {suppliersDrawerOpen && (
        <AddSuppliers
          open={suppliersDrawerOpen}
          onOpenChange={setSuppliersDrawerOpen}
          onCreated={() => setSuppliersRefreshKey((key) => key + 1)}
        />
      )}
      {departmentDrawerOpen && (
        <AddDepartment
          open={departmentDrawerOpen}
          onOpenChange={setDepartmentDrawerOpen}
          onCreated={() => setDepartmentRefreshKey((k) => k + 1)}
        />
      )}
      {designationDrawerOpen && (
        <AddDesignation
          open={designationDrawerOpen}
          onOpenChange={setDesignationDrawerOpen}
          onCreated={() => setDesignationRefreshKey((k) => k + 1)}
        />
      )}
      {shiftDrawerOpen && (
        <AddShift
          open={shiftDrawerOpen}
          onOpenChange={setShiftDrawerOpen}
          onCreated={() => setShiftRefreshKey((k) => k + 1)}
        />
      )}
      {printerDrawerOpen && (
        <AddPrinter
          open={printerDrawerOpen}
          onOpenChange={setPrinterDrawerOpen}
          onCreated={() => setPrinterRefreshKey((k) => k + 1)}
        />
      )}
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
