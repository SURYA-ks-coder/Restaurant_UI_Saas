"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { DatePicker, Modal, Select, Skeleton, message } from "antd";
import {
  BarChart3,
  DollarSign,
  Download,
  FileText,
  LayoutGrid,
  List,
  Package,
  Search,
  ShoppingCart,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getAction, API, URL as API_URL } from "@/lib/API";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

// ─── Report Categories ────────────────────────────────────────────────────────

const CATEGORIES = [
  "All Reports",
  "Favorites",
  "Sales Reports",
  "Inventory Reports",
  "Order Reports",
  "Staff Reports",
  "Financial Reports",
];

const CATEGORY_ICONS = {
  "Sales Reports": TrendingUp,
  "Inventory Reports": Package,
  "Order Reports": ShoppingCart,
  "Staff Reports": Users,
  "Financial Reports": DollarSign,
};

// ─── All Reports Definition ───────────────────────────────────────────────────

const ALL_REPORTS = [
  // Sales Reports (6)
  {
    id: "daily-sales",
    name: "Daily Sales Report",
    description:
      "Complete daily sales breakdown with all transactions and payment totals",
    category: "Sales Reports",
    endpoint: "reports/sales",
    filterFields: ["branch", "dateRange"],
  },
  {
    id: "sales-summary",
    name: "Sales Summary Report",
    description:
      "Consolidated sales summary grouped by category and selected time period",
    category: "Sales Reports",
    endpoint: "reports/sales/summary",
    filterFields: ["branch", "dateRange", "groupBy"],
  },
  {
    id: "revenue-report",
    name: "Revenue Report",
    description:
      "Comprehensive revenue analysis with trends and period-over-period comparisons",
    category: "Sales Reports",
    endpoint: "reports/sales/revenue",
    filterFields: ["branch", "dateRange"],
  },
  {
    id: "hourly-sales",
    name: "Hourly Sales Analysis",
    description:
      "Sales performance breakdown by hour to identify peak and off-peak periods",
    category: "Sales Reports",
    endpoint: "reports/sales/hourly",
    filterFields: ["branch", "date"],
  },
  {
    id: "top-items",
    name: "Top Selling Items Report",
    description:
      "Best performing menu items ranked by number of orders and revenue",
    category: "Sales Reports",
    endpoint: "reports/top-selling-items",
    filterFields: ["branch", "dateRange", "category"],
  },
  {
    id: "sales-by-category",
    name: "Sales by Category Report",
    description:
      "Sales distribution and performance analysis broken down by menu category",
    category: "Sales Reports",
    endpoint: "reports/sales/category",
    filterFields: ["branch", "dateRange"],
  },

  // Inventory Reports (5)
  {
    id: "stock-level",
    name: "Stock Level Report",
    description:
      "Current stock quantities and total value for all inventory items",
    category: "Inventory Reports",
    endpoint: "reports/inventory",
    filterFields: ["branch"],
  },
  {
    id: "low-stock",
    name: "Low Stock Alert Report",
    description:
      "Items that have fallen below the minimum reorder threshold requiring attention",
    category: "Inventory Reports",
    endpoint: "reports/inventory/low-stock",
    filterFields: ["branch"],
  },
  {
    id: "supplier-report",
    name: "Supplier Report",
    description:
      "Supplier details, purchase orders and delivery performance history",
    category: "Inventory Reports",
    endpoint: "reports/inventory/suppliers",
    filterFields: ["branch", "dateRange"],
  },
  {
    id: "inventory-usage",
    name: "Inventory Usage Report",
    description:
      "Consumption tracking and waste analysis across all inventory items",
    category: "Inventory Reports",
    endpoint: "reports/inventory/usage",
    filterFields: ["branch", "dateRange"],
  },
  {
    id: "purchase-orders",
    name: "Purchase Order Report",
    description:
      "All purchase orders with supplier, item details and payment information",
    category: "Inventory Reports",
    endpoint: "reports/inventory/purchase-orders",
    filterFields: ["branch", "dateRange"],
  },

  // Order Reports (5)
  {
    id: "order-summary",
    name: "Order Summary Report",
    description:
      "Comprehensive order details including status, items, tables and payments",
    category: "Order Reports",
    endpoint: "reports/orders",
    filterFields: ["branch", "dateRange", "orderStatus"],
  },
  {
    id: "kot-report",
    name: "KOT Status Report",
    description:
      "Kitchen Order Ticket details with preparation times and completion status",
    category: "Order Reports",
    endpoint: "reports/kot",
    filterFields: ["branch", "dateRange"],
  },
  {
    id: "cancelled-orders",
    name: "Cancelled Orders Report",
    description:
      "All cancelled and refunded orders with cancellation reasons and amounts",
    category: "Order Reports",
    endpoint: "reports/orders/cancelled",
    filterFields: ["branch", "dateRange"],
  },
  {
    id: "table-occupancy",
    name: "Table Occupancy Report",
    description:
      "Table usage rates, average dining duration and turnover analysis",
    category: "Order Reports",
    endpoint: "reports/tables/occupancy",
    filterFields: ["branch", "dateRange"],
  },
  {
    id: "qr-orders",
    name: "QR Orders Report",
    description:
      "Orders placed through QR code scanning with full payment method breakdown",
    category: "Order Reports",
    endpoint: "reports/qr-orders",
    filterFields: ["branch", "dateRange"],
  },

  // Staff Reports (4)
  {
    id: "staff-directory",
    name: "Staff Directory Report",
    description:
      "Complete employee directory with roles, departments and contact details",
    category: "Staff Reports",
    endpoint: "reports/staff",
    filterFields: ["branch", "department", "staffStatus"],
  },
  {
    id: "attendance",
    name: "Attendance Report",
    description:
      "Staff attendance tracking with check-in/out times and total work hours",
    category: "Staff Reports",
    endpoint: "reports/staff/attendance",
    filterFields: ["branch", "dateRange", "department"],
  },
  {
    id: "department-report",
    name: "Department Wise Report",
    description:
      "Staff performance and attendance analysis grouped by department",
    category: "Staff Reports",
    endpoint: "reports/staff/department",
    filterFields: ["branch", "dateRange"],
  },
  {
    id: "shift-summary",
    name: "Shift Summary Report",
    description:
      "Shift-wise staff allocation, hours worked and shift coverage details",
    category: "Staff Reports",
    endpoint: "reports/staff/shifts",
    filterFields: ["branch", "dateRange"],
  },

  // Financial Reports (4)
  {
    id: "expense-report",
    name: "Expense Report",
    description:
      "All restaurant expenses categorized by type with amounts and payment details",
    category: "Financial Reports",
    endpoint: "reports/expenses",
    filterFields: ["branch", "dateRange"],
  },
  {
    id: "profit-loss",
    name: "Profit & Loss Report",
    description:
      "Revenue versus expenses analysis with net profit and loss calculations",
    category: "Financial Reports",
    endpoint: "reports/financial/profit-loss",
    filterFields: ["branch", "dateRange"],
  },
  {
    id: "bill-settlement",
    name: "Bill Settlement Report",
    description:
      "Payment method breakdown with cash, card and digital wallet totals",
    category: "Financial Reports",
    endpoint: "reports/bills/settlement",
    filterFields: ["branch", "dateRange"],
  },
  {
    id: "tax-report",
    name: "Tax Summary Report",
    description:
      "GST/VAT computation with taxable amounts, rates and payable tax details",
    category: "Financial Reports",
    endpoint: "reports/financial/tax",
    filterFields: ["branch", "dateRange"],
  },
];

// ─── Order / Staff status options ─────────────────────────────────────────────

const ORDER_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "preparing", label: "Preparing" },
  { value: "ready", label: "Ready" },
  { value: "served", label: "Served" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const STAFF_STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "blocked", label: "Blocked" },
];

const GROUP_BY_OPTIONS = [
  { value: "day", label: "Daily" },
  { value: "week", label: "Weekly" },
  { value: "month", label: "Monthly" },
];

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("All Reports");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [favorites, setFavorites] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState("pdf");
  const [formValues, setFormValues] = useState({});

  const [branches, setBranches] = useState([]);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Load favorites from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("reportFavorites");
      if (saved) setFavorites(JSON.parse(saved));
    } catch {
      // ignore
    }
  }, []);

  // Fetch supporting data for filter dropdowns
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [branchRes, catRes, deptRes] = await Promise.all([
          getAction(API.GET_BRANCH_LIST),
          getAction(API.GET_CATEGORY_LIST),
          getAction(API.GET_DEPARTMENT_LIST),
        ]);
        if (branchRes?.statusCode === 200) {
          setBranches(
            (branchRes.data || []).map((b) => ({
              value: b._id,
              label: b.branchName || b.name || "Branch",
            }))
          );
        }
        if (catRes?.statusCode === 200) {
          setCategories(
            (catRes.data || []).map((c) => ({
              value: c._id,
              label: c.categoryName || c.name || "Category",
            }))
          );
        }
        if (deptRes?.statusCode === 200) {
          setDepartments(
            (deptRes.data || []).map((d) => ({
              value: d._id,
              label: d.departmentName || d.name || "Department",
            }))
          );
        }
      } catch {
        // silently handle fetch errors
      }
    };
    fetchData();
  }, []);

  const toggleFavorite = useCallback(
    (reportId, e) => {
      e.stopPropagation();
      const updated = favorites.includes(reportId)
        ? favorites.filter((id) => id !== reportId)
        : [...favorites, reportId];
      setFavorites(updated);
      localStorage.setItem("reportFavorites", JSON.stringify(updated));
    },
    [favorites]
  );

  const filteredReports = useMemo(() => {
    let list = ALL_REPORTS;
    if (activeTab === "Favorites") {
      list = list.filter((r) => favorites.includes(r.id));
    } else if (activeTab !== "All Reports") {
      list = list.filter((r) => r.category === activeTab);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q)
      );
    }
    return list;
  }, [activeTab, searchQuery, favorites]);

  const tabCounts = useMemo(() => {
    const counts = {
      "All Reports": ALL_REPORTS.length,
      Favorites: favorites.length,
    };
    CATEGORIES.slice(2).forEach((cat) => {
      counts[cat] = ALL_REPORTS.filter((r) => r.category === cat).length;
    });
    return counts;
  }, [favorites]);

  const openModal = useCallback((report) => {
    setSelectedReport(report);
    setFormValues({});
    setDownloadFormat("pdf");
    setModalOpen(true);
  }, []);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const params = { format: downloadFormat };

      if (formValues.branchId) params.branchId = formValues.branchId;
      if (formValues.categoryId) params.categoryId = formValues.categoryId;
      if (formValues.departmentId) params.departmentId = formValues.departmentId;
      if (formValues.orderStatus) params.status = formValues.orderStatus;
      if (formValues.staffStatus) params.status = formValues.staffStatus;
      if (formValues.groupBy) params.groupBy = formValues.groupBy;

      if (formValues.dateRange?.[0]) {
        params.startDate = dayjs(formValues.dateRange[0]).format("YYYY-MM-DD");
        params.endDate = dayjs(formValues.dateRange[1]).format("YYYY-MM-DD");
      }
      if (formValues.date) {
        params.date = dayjs(formValues.date).format("YYYY-MM-DD");
      }

      const response = await fetch(`${API_URL}${selectedReport.endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JSON.parse(
            localStorage.getItem("accessToken")
          )}`,
        },
        body: JSON.stringify(params),
      });

      const contentType = response.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        const data = await response.json();
        if (data.statusCode === 200) {
          if (data.downloadUrl) {
            const a = document.createElement("a");
            a.href = data.downloadUrl;
            a.download = `${selectedReport.name}.${downloadFormat === "pdf" ? "pdf" : "xlsx"}`;
            a.click();
          }
          message.success(data.message || "Report generated successfully");
          setModalOpen(false);
        } else {
          message.error(data.message || "Failed to generate report");
        }
      } else if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${selectedReport.name}.${downloadFormat === "pdf" ? "pdf" : "xlsx"}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        message.success("Report downloaded successfully");
        setModalOpen(false);
      } else {
        message.error("Failed to generate report. Please try again.");
      }
    } catch {
      message.error("An error occurred while downloading the report");
    } finally {
      setDownloading(false);
    }
  };

  const setField = (key, val) =>
    setFormValues((prev) => ({ ...prev, [key]: val }));

  const renderFilterField = (fieldKey) => {
    switch (fieldKey) {
      case "branch":
        return (
          <div key="branch" className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Branch</label>
            <Select
              size="large"
              placeholder="All Branches"
              className="w-full"
              options={[{ value: "", label: "All Branches" }, ...branches]}
              value={formValues.branchId || undefined}
              onChange={(val) => setField("branchId", val)}
              allowClear
            />
          </div>
        );
      case "dateRange":
        return (
          <div key="dateRange" className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">
              Date Range
            </label>
            <RangePicker
              size="large"
              className="w-full"
              value={formValues.dateRange}
              onChange={(dates) => setField("dateRange", dates)}
              format="DD/MM/YYYY"
              placeholder={["From Date", "To Date"]}
            />
          </div>
        );
      case "date":
        return (
          <div key="date" className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Date</label>
            <DatePicker
              size="large"
              className="w-full"
              value={formValues.date}
              onChange={(date) => setField("date", date)}
              format="DD/MM/YYYY"
              placeholder="Select Date"
            />
          </div>
        );
      case "category":
        return (
          <div key="category" className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">
              Category
            </label>
            <Select
              size="large"
              placeholder="All Categories"
              className="w-full"
              options={[{ value: "", label: "All Categories" }, ...categories]}
              value={formValues.categoryId || undefined}
              onChange={(val) => setField("categoryId", val)}
              allowClear
            />
          </div>
        );
      case "department":
        return (
          <div key="department" className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">
              Department
            </label>
            <Select
              size="large"
              placeholder="All Departments"
              className="w-full"
              options={[
                { value: "", label: "All Departments" },
                ...departments,
              ]}
              value={formValues.departmentId || undefined}
              onChange={(val) => setField("departmentId", val)}
              allowClear
            />
          </div>
        );
      case "orderStatus":
        return (
          <div key="orderStatus" className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">
              Order Status
            </label>
            <Select
              size="large"
              placeholder="All Status"
              className="w-full"
              options={[
                { value: "", label: "All Status" },
                ...ORDER_STATUS_OPTIONS,
              ]}
              value={formValues.orderStatus || undefined}
              onChange={(val) => setField("orderStatus", val)}
              allowClear
            />
          </div>
        );
      case "staffStatus":
        return (
          <div key="staffStatus" className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Status</label>
            <Select
              size="large"
              placeholder="All Status"
              className="w-full"
              options={[
                { value: "", label: "All Status" },
                ...STAFF_STATUS_OPTIONS,
              ]}
              value={formValues.staffStatus || undefined}
              onChange={(val) => setField("staffStatus", val)}
              allowClear
            />
          </div>
        );
      case "groupBy":
        return (
          <div key="groupBy" className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">
              Group By
            </label>
            <Select
              size="large"
              placeholder="Select Period"
              className="w-full"
              options={GROUP_BY_OPTIONS}
              value={formValues.groupBy || undefined}
              onChange={(val) => setField("groupBy", val)}
              allowClear
            />
          </div>
        );
      default:
        return null;
    }
  };

  const CategoryIcon = selectedReport
    ? CATEGORY_ICONS[selectedReport.category] || FileText
    : FileText;

  return (
    <div className="min-h-screen">
      {/* ── Header ── */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            The Reports section offers customizable insights and analytics for
            restaurant management, facilitating data-driven decisions and
            improving efficiency.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* View toggle */}
          <div className="flex items-center rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-2 transition-colors",
                viewMode === "grid"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:bg-muted"
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-2 transition-colors",
                viewMode === "list"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:bg-muted"
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search reports"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm bg-card border border-border rounded-lg outline-none focus:border-primary transition-colors w-52 placeholder:text-muted-foreground text-foreground"
            />
          </div>
        </div>
      </div>

      {/* ── Category Tabs ── */}
      <div className="mb-6 bg-card border border-border rounded-xl px-4 py-3">
        <div className="flex gap-2 overflow-x-auto flex-nowrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0",
                activeTab === cat
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              {cat}
              <span
                className={cn(
                  "text-xs px-1.5 py-0.5 rounded-full font-semibold",
                  activeTab === cat
                    ? "bg-white/20 text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {tabCounts[cat] ?? 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Reports Grid / List ── */}
      {filteredReports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <BarChart3 className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-base font-medium">No reports found</p>
          <p className="text-sm mt-1">Try adjusting your search or category filter</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {filteredReports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              isFavorite={favorites.includes(report.id)}
              onToggleFavorite={toggleFavorite}
              onGenerate={openModal}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-0 bg-card border border-border rounded-xl overflow-hidden">
          {filteredReports.map((report, idx) => (
            <ReportListItem
              key={report.id}
              report={report}
              isFavorite={favorites.includes(report.id)}
              onToggleFavorite={toggleFavorite}
              onGenerate={openModal}
              isLast={idx === filteredReports.length - 1}
            />
          ))}
        </div>
      )}

      {/* ── Generate Modal ── */}
      <Modal
        open={modalOpen}
        onCancel={() => !downloading && setModalOpen(false)}
        footer={null}
        width={480}
        centered
        closable={!downloading}
        maskClosable={!downloading}
        styles={{
          content: { borderRadius: "16px", padding: "0" },
          body: { padding: "0" },
        }}
      >
        {selectedReport && (
          <div className="p-6">
            {/* Icon + Title */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <CategoryIcon className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">
                {selectedReport.name}
              </h2>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                {selectedReport.description}
              </p>
            </div>

            {/* Filter Fields */}
            <div className="flex flex-col gap-4 bg-muted/40 rounded-xl p-4 mb-4">
              {selectedReport.filterFields.map((field) =>
                renderFilterField(field)
              )}
            </div>

            {/* Download Format */}
            <div className="mb-6">
              <p className="text-sm font-medium text-foreground mb-3">
                Download Format{" "}
                <span className="text-destructive">*</span>
              </p>
              <div className="flex gap-4">
                <label
                  className={cn(
                    "flex items-center gap-2.5 px-4 py-2.5 rounded-lg border cursor-pointer transition-all flex-1 justify-center",
                    downloadFormat === "pdf"
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:bg-muted/50"
                  )}
                >
                  <input
                    type="radio"
                    name="format"
                    value="pdf"
                    checked={downloadFormat === "pdf"}
                    onChange={() => setDownloadFormat("pdf")}
                    className="accent-primary"
                  />
                  <FileText
                    className={cn(
                      "w-4 h-4",
                      downloadFormat === "pdf"
                        ? "text-destructive"
                        : "text-muted-foreground"
                    )}
                  />
                  <span
                    className={cn(
                      "text-sm font-medium",
                      downloadFormat === "pdf"
                        ? "text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    PDF
                  </span>
                </label>

                <label
                  className={cn(
                    "flex items-center gap-2.5 px-4 py-2.5 rounded-lg border cursor-pointer transition-all flex-1 justify-center",
                    downloadFormat === "excel"
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:bg-muted/50"
                  )}
                >
                  <input
                    type="radio"
                    name="format"
                    value="excel"
                    checked={downloadFormat === "excel"}
                    onChange={() => setDownloadFormat("excel")}
                    className="accent-primary"
                  />
                  <BarChart3
                    className={cn(
                      "w-4 h-4",
                      downloadFormat === "excel"
                        ? "text-green-600"
                        : "text-muted-foreground"
                    )}
                  />
                  <span
                    className={cn(
                      "text-sm font-medium",
                      downloadFormat === "excel"
                        ? "text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    Excel
                  </span>
                </label>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setModalOpen(false)}
                disabled={downloading}
                className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                {downloading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Download
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ─── Report Card (Grid View) ──────────────────────────────────────────────────

function ReportCard({ report, isFavorite, onToggleFavorite, onGenerate }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-4 hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-sm text-foreground leading-snug">
          {report.name}
        </h3>
        <button
          onClick={(e) => onToggleFavorite(report.id, e)}
          className="flex-shrink-0 mt-0.5 transition-transform hover:scale-110"
          title={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Star
            className={cn(
              "w-4 h-4 transition-colors",
              isFavorite
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground hover:text-yellow-400"
            )}
          />
        </button>
      </div>

      <p className="text-xs text-muted-foreground flex-1 leading-relaxed line-clamp-3">
        {report.description}
      </p>

      <button
        onClick={() => onGenerate(report)}
        className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-lg py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        <FileText className="w-4 h-4" />
        Generate
      </button>
    </div>
  );
}

// ─── Report List Item (List View) ─────────────────────────────────────────────

function ReportListItem({
  report,
  isFavorite,
  onToggleFavorite,
  onGenerate,
  isLast,
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors gap-4",
        !isLast && "border-b border-border"
      )}
    >
      <div className="min-w-0">
        <h3 className="font-semibold text-sm text-foreground">{report.name}</h3>
        <p className="text-xs text-primary mt-0.5 truncate max-w-xl">
          {report.description}
        </p>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <button
          onClick={(e) => onToggleFavorite(report.id, e)}
          className="transition-transform hover:scale-110"
          title={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Star
            className={cn(
              "w-4 h-4 transition-colors",
              isFavorite
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground hover:text-yellow-400"
            )}
          />
        </button>
        <button
          onClick={() => onGenerate(report)}
          className="flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <FileText className="w-4 h-4" />
          Generate
        </button>
      </div>
    </div>
  );
}
