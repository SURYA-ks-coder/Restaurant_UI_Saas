import axios from "axios";
import {
  getAccessToken,
  getRestaurantId,
  getDefaultBranchId,
} from "@/lib/auth";

const API = {
  CREATE_RESTAURANT: "onboarding/register",
  GET_RESTAURANT_LIST: "onboarding/list",
  GET_RESTAURANT_BY_ID: "onboarding/getRestaurantById",
  UPDATE_RESTAURANT: "onboarding/update",
  DELETE_RESTAURANT: "onboarding/delete",
  LOGIN: "auth/login",
  GET_ME: "auth/me",
  GET_PREFERENCES: "auth/preferences",
  UPDATE_PREFERENCES: "auth/preferences",

  // Notifications
  GET_NOTIFICATIONS: "notifications",
  MARK_NOTIFICATIONS_READ: "notifications/read",

  // Branch
  CREATE_BRANCH: "branches",
  GET_BRANCH_LIST: "branches/list",
  GET_BRANCH_BY_ID: "branches/getBranchById",
  UPDATE_BRANCH: "branches/UpdateBranch",

  // User / Manager
  CREATE_STAFF: "staff",
  GET_STAFF_LIST: "staff/list",
  GET_MY_TEAM: "staff/my-team",
  GET_STAFF_BY_ID: "staff/getUserById",
  UPDATE_STAFF: "staff/UpdateUser",
  DELETE_STAFF: "staff/deleteUser",

  // Category
  CREATE_CATEGORY: "categories",
  GET_CATEGORY_LIST: "categories/list",
  GET_CATEGORY_BY_ID: "categories/getCategoryById",
  UPDATE_CATEGORY: "categories/updateCategory",
  DELETE_CATEGORY: "categories/deleteCategory",
  // Sub Category
  CREATE_SUB_CATEGORY: "subcategories",
  GET_SUB_CATEGORY_LIST: "subcategories/list",
  GET_SUB_CATEGORY_BY_ID: "subcategories/getSubCategoryById",
  UPDATE_SUB_CATEGORY: "subcategories/updateSubCategory",
  DELETE_SUB_CATEGORY: "subcategories/deleteSubCategory",

  // Menu Item
  CREATE_MENU_ITEM: "menuitems",
  GET_MENU_ITEM_LIST: "menuitems/list",
  GET_MENU_ITEM_BY_ID: "menuitems/getMenuItemById",
  UPDATE_MENU_ITEM: "menuitems/updateMenuItem",
  DELETE_MENU_ITEM: "menuitems/deleteMenuItem",

  // Suppliers
  CREATE_SUPPLIER: "suppliers",
  GET_SUPPLIER_LIST: "suppliers/list",
  GET_SUPPLIER_BY_ID: "suppliers/getSupplierById",
  UPDATE_SUPPLIER: "suppliers/updateSupplier",
  DELETE_SUPPLIER: "suppliers/deleteSupplier",

  // Tables
  CREATE_TABLE: "tables",
  GET_TABLE_LIST: "tables/list",
  GET_TABLE_BY_ID: "tables/getTableById",
  UPDATE_TABLE: "tables/updateTable",
  DELETE_TABLE: "tables/deleteTable",
  CREATE_QR_CODE: "tables/generateQRCode",
  GET_ACTIVE_TABLES: "tables/activeTables",
  GET_ALL_TABLE_ORDER_BASED: "tables/stats",

  // Reservations
  CREATE_RESERVATION: "reservations",
  GET_RESERVATION_LIST: "reservations/list",
  GET_RESERVATION_BY_ID: "reservations/getReservationById",
  UPDATE_RESERVATION: "reservations/updateReservation",
  DELETE_RESERVATION: "reservations/deleteReservation",

  // Bills / POS
  CREATE_BILL: "pos",
  GET_BILL_LIST: "pos/list",
  GET_BILL_BY_ID: "pos/getBillById",
  UPDATE_BILL: "pos/updateBill",
  DELETE_BILL: "pos/deleteBill",

  // Payments — Razorpay staff-generated payment link/QR (customer pays on
  // their own phone; there is no embedded checkout SDK on the staff side)
  RAZORPAY_LINK: "payments/razorpay/link",
  RAZORPAY_STATUS: "payments/razorpay/status",

  // Dashboard

  TODAY_LIVE_ORDERS: "pos/ordersBydate",
  GET_LIVE_STATUS: "pos/liveStatus",
  GET_REVENUE_SUMMARY: "dashboard/revenue-summary",
  GET_HOURLY_REVENUE: "dashboard/hourlyRevenue",
  GET_TOP_SELLING_ITEMS: "dashboard/top-selling-items",
  GET_RECENT_ACTIVITIES: "dashboard/recent-activities",
  GET_CUSTOMER_SUMMARY: "dashboard/customer-summary",
  GET_BRANCH_PERFORMANCE: "dashboard/branch-performance",

  // QR Orders
  CREATE_QR_ORDER: "qrOrders",
  GET_QR_ORDER_LIST: "qrOrders/list",
  GET_QR_ORDER_BY_ID: "qrOrders/getQROrderById",
  UPDATE_QR_ORDER: "qrOrders/updateQROrder",
  DELETE_QR_ORDER: "qrOrders/deleteQROrder",

  // Inventory
  GET_INVENTORY_LIST: "inventory",
  GET_LOW_STOCK_INVENTORY: "inventory/low-stock",
  GET_INVENTORY_REPORT: "inventory/report",
  GET_INVENTORY_BY_ID: "inventory",
  CREATE_INVENTORY: "inventory",
  UPDATE_INVENTORY: "inventory",
  ADD_INVENTORY_STOCK: "inventory/:id/stock/add",
  REMOVE_INVENTORY_STOCK: "inventory/:id/stock/remove",
  GET_INVENTORY_HISTORY: "inventory/:id/history",
  SUBMIT_STOCK_COUNT: "inventory/stock-count",
  GET_REORDER_SUGGESTIONS: "inventory/reorder-suggestions",

  // Recipes
  CREATE_RECIPE: "recipes",
  GET_RECIPE_LIST: "recipes",
  GET_RECIPE_BY_ID: "recipes",
  UPDATE_RECIPE: "recipes",
  DELETE_RECIPE: "recipes",

  // Purchases
  CREATE_PURCHASE: "purchases",
  GET_PURCHASE_LIST: "purchases",
  GET_PURCHASE_BY_ID: "purchases",
  GET_PURCHASE_SUMMARY: "purchases/summary",
  CANCEL_PURCHASE: "purchases/:id/cancel",

  // KOT
  CREATE_KOT: "kot",
  GET_KOT_LIST: "kot/list",
  GET_KOT_BY_ID: "kot/getKOTById",
  UPDATE_KOT_ITEM_STATUS: "kot/updateItemStatus",
  UPDATE_KOT_STATUS: "kot/KOTstatusUpdate",
  DELETE_KOT: "kot/deleteKOT",

  // Reports
  SALES_REPORT: "reports/sales",
  SALES_SUMMARY_REPORT: "reports/sales/summary",
  REVENUE_REPORT: "reports/sales/revenue",
  HOURLY_SALES_REPORT: "reports/sales/hourly",
  TOP_ITEMS_REPORT: "reports/top-selling-items",
  SALES_CATEGORY_REPORT: "reports/sales/category",

  INVENTORY_REPORT: "reports/inventory",
  LOW_STOCK_REPORT: "reports/inventory/low-stock",
  SUPPLIER_REPORT: "reports/inventory/suppliers",
  INVENTORY_USAGE_REPORT: "reports/inventory/usage",
  PURCHASE_ORDER_REPORT: "reports/inventory/purchase-orders",

  ORDER_REPORT: "reports/orders",
  KOT_REPORT: "reports/kot",
  CANCELLED_ORDERS_REPORT: "reports/orders/cancelled",
  TABLE_OCCUPANCY_REPORT: "reports/tables/occupancy",
  QR_ORDERS_REPORT: "reports/qr-orders",

  STAFF_REPORT: "reports/staff",
  ATTENDANCE_REPORT: "reports/staff/attendance",
  DEPARTMENT_REPORT: "reports/staff/department",
  SHIFT_REPORT: "reports/staff/shifts",

  EXPENSE_REPORT: "reports/expenses",
  PROFIT_LOSS_REPORT: "reports/financial/profit-loss",
  BILL_SETTLEMENT_REPORT: "reports/bills/settlement",
  TAX_REPORT: "reports/financial/tax",

  // Reports (GET, added alongside the POST report set above)
  LEAST_SELLING_ITEMS_REPORT: "reports/items/least-selling",
  STAFF_PERFORMANCE_REPORT: "reports/staff-performance",
  CUSTOMER_REPORT: "reports/customers",
  BRANCH_REPORT: "reports/branches",
  AUDIT_LOG_REPORT: "reports/audit-logs",
  TAX_DETAIL_REPORT: "reports/tax-detail",

  // Stock (KOT auto-deduction only — item stock itself lives on the Inventory resource above)
  DEDUCT_STOCK_BY_KOT: "stock/deductByKot",

  // Warehouse
  GET_WAREHOUSE_LIST: "warehouses",
  GET_WAREHOUSE_BY_ID: "warehouses",
  CREATE_WAREHOUSE: "warehouses",
  UPDATE_WAREHOUSE: "warehouses",
  DELETE_WAREHOUSE: "warehouses",

  // Stock Transfer
  GET_STOCK_TRANSFER_LIST: "stock-transfers",
  GET_STOCK_TRANSFER_BY_ID: "stock-transfers",
  CREATE_STOCK_TRANSFER: "stock-transfers",
  APPROVE_STOCK_TRANSFER: "stock-transfers/:id/approve",
  COMPLETE_STOCK_TRANSFER: "stock-transfers/:id/complete",
  REJECT_STOCK_TRANSFER: "stock-transfers/:id/reject",

  // Wastage
  GET_WASTAGE_LIST: "wastage",
  GET_WASTAGE_REPORT: "wastage/report",
  GET_WASTAGE_BY_ID: "wastage",
  RECORD_WASTAGE: "wastage",

  // Roles / Privileges
  CREATE_ROLE: "roles",
  GET_ROLE_LIST: "roles/list",
  GET_ROLE_BY_ID: "roles/getRoleById",
  UPDATE_ROLE: "roles/updateRole",
  DELETE_ROLE: "roles/deleteRole",
  TOGGLE_ROLE_STATUS: "roles/toggleStatus",
  GET_MENU_LIST: "roles/menus",
  ASSIGN_USER_BY_ROLE: "staff/assignRole",

  // Subscription

  GET_SUBSCRIPTION_PLAN_LIST: "subscription/list",
  DELETE_SUBSCRIPTION_PLAN: "subscription/delete",
  GET_SUBSCRIPTION_PLAN_BY_ID: "subscription/getSubscriptionById",
  CREATE_SUBSCRIPTION_PLAN: "subscription/plans",
  UPDATE_SUBSCRIPTION_PLAN: "subscription/updateSubscriptionPlan",
  UPGRADE_RESTAURANT_SUBSCRIPTION: "subscription/upgrade",

  // Staff - Department

  CREATE_DEPARTMENT: "departments",
  GET_DEPARTMENT_LIST: "departments/list",
  GET_DEPARTMENT_BY_ID: "departments/getDepartmentsById",
  UPDATE_DEPARTMENT: "departments/updateDepartment",
  UPDATE_DEPARTMENT_STATUS: "departments/departmentsStatusUpdate",
  DELETE_DEPARTMENT: "departments/deleteDepartments",

  // Staff - Designation
  CREATE_DESIGNATION: "designations",
  GET_DESIGNATION_LIST: "designations/list",
  GET_DESIGNATION_BY_ID: "designations/getDesignationById",
  UPDATE_DESIGNATION: "designations/updateDesignation",
  DELETE_DESIGNATION: "designations/deleteDesignation",

  // Staff - Shift

  CREATE_STAFF_SHIFT: "shifts",
  GET_STAFF_SHIFT_LIST: "shifts/list",
  GET_STAFF_SHIFT_BY_ID: "shifts/getStaffShiftById",
  UPDATE_STAFF_SHIFT: "shifts/updateStaffShift",
  UPDATE_STAFF_SHIFT_STATUS: "shifts/staffShiftStatusUpdate",
  DELETE_STAFF_SHIFT: "shifts/deleteStaffShift",

  // Roster (who works which shift on which date)
  GET_ROSTER: "shifts/roster",
  ASSIGN_ROSTER: "shifts/roster",
  COPY_ROSTER_WEEK: "shifts/roster/copy-week",
  DELETE_ROSTER_ENTRY: "shifts/roster",

  // Attendance
  ATTENDANCE_CHECK_IN: "attendance/check-in",
  ATTENDANCE_CHECK_OUT: "attendance/check-out",
  ATTENDANCE_BREAK: "attendance/break",
  ATTENDANCE_DAY: "attendance/day",
  ATTENDANCE_REGISTER: "attendance/register",
  ATTENDANCE_CORRECT: "attendance",

  // Earnings (tips / commission / payouts)
  GET_COMMISSION_RULES: "earnings/rules",
  CREATE_COMMISSION_RULE: "earnings/rules",
  UPDATE_COMMISSION_RULE: "earnings/rules",
  DELETE_COMMISSION_RULE: "earnings/rules",
  GET_TIPS: "earnings/tips",
  GET_COMMISSIONS: "earnings/commissions",
  GET_PENDING_EARNINGS: "earnings/pending",
  CREATE_PAYOUT: "earnings/payouts",
  GET_PAYOUTS: "earnings/payouts",

  // Loyalty & CRM
  GET_LOYALTY_PROGRAM: "loyalty/program",
  UPDATE_LOYALTY_PROGRAM: "loyalty/program",
  GET_LOYALTY_SUMMARY: "loyalty/customers/:customerId/summary",
  GET_LOYALTY_TRANSACTIONS: "loyalty/customers/:customerId/transactions",
  LOYALTY_REDEEM_PREVIEW: "loyalty/redeem/preview",
  LOYALTY_ADJUST: "loyalty/adjust",
  LOYALTY_WALLET_TOPUP: "loyalty/wallet/topup",
  LOYALTY_BIRTHDAY_REWARD: "loyalty/rewards/birthday",
  LOYALTY_REDEEM_REWARD: "loyalty/rewards/redeem",
  LOYALTY_APPLY_REFERRAL: "loyalty/referral/apply",

  // Customers (CRM)
  GET_CUSTOMER_LIST: "customers",
  CREATE_CUSTOMER: "customers",
  UPDATE_CUSTOMER: "customers",
  GET_CUSTOMER_360: "customers/:id/profile360",

  // Bill settlement + waiter assignment
  RECORD_BILL_PAYMENT: "pos/:id/payment",
  ASSIGN_TABLE_WAITER: "tables/:id/assign-waiter",
  WAITER_LEADERBOARD: "reports/waiter-leaderboard",

  // Print
  GET_PRINT_SETTINGS: "print/settings",
  UPDATE_PRINT_SETTINGS: "print/settings",
  CREATE_PRINT_PRINTER: "print/settings/printers",
  UPDATE_PRINT_PRINTER: "print/settings/printers",
  DELETE_PRINT_PRINTER: "print/settings/printers",
  PRINT_KOT: "print/kot",
  PRINT_BILL: "print/bill",
  PRINT_QR_ORDER: "print/qr-order",
  PRINT_AGENT_STATUS: "print/agent/status",
  GET_AGENT_PRINTERS: "print/agent/printers",
  GENERATE_PRINT_AGENT_KEY: "print/settings/agent-key",
};

const URL = "https://restaurant-server-saas.onrender.com/api/v1/";
// const URL = "http://localhost:5000/api/v1/";
const pendingRequests = new Map();

// ── Scope injection: every request carries the selected branch + restaurant ──
const getSelectedBranchId = () => {
  if (typeof window === "undefined") return "";
  // "branchId" is the branch picked in the top-nav selector; fall back to the
  // user's default branch from the auth store.
  return localStorage.getItem("branchId") || getDefaultBranchId() || "";
};

// Merge restaurantId/branchId into a request body. Caller-provided values win.
const withScopeBody = (params) => {
  const restaurantId = getRestaurantId();
  const branchId = getSelectedBranchId();
  if (!restaurantId && !branchId) return params;

  if (typeof FormData !== "undefined" && params instanceof FormData) {
    if (restaurantId && !params.has("restaurantId"))
      params.append("restaurantId", restaurantId);
    if (branchId && !params.has("branchId"))
      params.append("branchId", branchId);
    return params;
  }

  const scope = {};
  if (restaurantId) scope.restaurantId = restaurantId;
  if (branchId) scope.branchId = branchId;
  return { ...scope, ...(params || {}) };
};

// Append restaurantId/branchId to a URL's query string (skips ones already set).
const withScopeQuery = (mainUrl) => {
  const restaurantId = getRestaurantId();
  const branchId = getSelectedBranchId();
  const parts = [];
  if (restaurantId && !/[?&]restaurantId=/.test(mainUrl))
    parts.push(`restaurantId=${encodeURIComponent(restaurantId)}`);
  if (branchId && !/[?&]branchId=/.test(mainUrl))
    parts.push(`branchId=${encodeURIComponent(branchId)}`);
  if (parts.length === 0) return mainUrl;
  return mainUrl + (mainUrl.includes("?") ? "&" : "?") + parts.join("&");
};

const shouldDedupeRequest = (mainUrl, method) => {
  return method === "GET" || mainUrl?.endsWith("/list");
};

const action = async (mainUrl, params, method = "POST", hostUrl = URL) => {
  try {
    const requestMethod = method || "POST";
    const isGet = requestMethod === "GET";
    const scopedUrl = isGet ? withScopeQuery(mainUrl) : mainUrl;
    const requestBody = isGet
      ? JSON.stringify(params)
      : JSON.stringify(withScopeBody(params));
    const requestUrl = hostUrl + scopedUrl;
    const dedupeKey = `${requestMethod}:${requestUrl}:${requestBody}`;

    if (
      shouldDedupeRequest(mainUrl, requestMethod) &&
      pendingRequests.has(dedupeKey)
    ) {
      return pendingRequests.get(dedupeKey);
    }

    const request = fetch(requestUrl, {
      method: requestMethod,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAccessToken()}`,
      },
      body: requestBody,
    })
      .then((response) => response.json())
      .finally(() => {
        pendingRequests.delete(dedupeKey);
      });

    if (shouldDedupeRequest(mainUrl, requestMethod)) {
      pendingRequests.set(dedupeKey, request);
    }

    return await request;
  } catch (error) {
    console.error("Error:", error);
  }
};
const postAction = async (mainUrl, params, method = "POST", hostUrl = URL) => {
  try {
    const response = await fetch(hostUrl + mainUrl, {
      method: method || "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(withScopeBody(params)),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error:", error);
  }
};
const getAction = async (mainUrl, params, hostUrl = URL) => {
  try {
    const requestMethod = "GET";
    const requestUrl = hostUrl + withScopeQuery(mainUrl);
    const dedupeKey = `${requestMethod}:${requestUrl}`;

    if (pendingRequests.has(dedupeKey)) {
      return pendingRequests.get(dedupeKey);
    }

    const request = fetch(requestUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAccessToken()}`,
      },
    })
      .then((response) => response.json())
      .finally(() => {
        pendingRequests.delete(dedupeKey);
      });

    pendingRequests.set(dedupeKey, request);

    return await request;
  } catch (error) {
    console.error("Error:", error);
  }
};

const patchAction = async (mainUrl, params, hostUrl = URL) => {
  try {
    const response = await fetch(hostUrl + mainUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(withScopeBody(params)),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error:", error);
  }
};

const fileUpload = async (mainUrl, payload, method = "post", hostUrl = URL) => {
  try {
    const response = await axios({
      method,
      url: hostUrl + mainUrl,
      data: withScopeBody(payload),
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${getAccessToken()}`,
      },
    });
    const data = response.data;
    return data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export { postAction, getAction, patchAction, action, fileUpload, API, URL };
