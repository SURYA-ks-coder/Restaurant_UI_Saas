import axios from "axios";
import { getAccessToken } from "@/lib/auth";

const API = {
  CREATE_RESTAURANT: "onboarding/register",
  GET_RESTAURANT_LIST: "onboarding/list",
  GET_RESTAURANT_BY_ID: "onboarding/getRestaurantById",
  UPDATE_RESTAURANT: "onboarding/update",
  DELETE_RESTAURANT: "onboarding/delete",
  LOGIN: "auth/login",

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

  // Dashboard

  TODAY_LIVE_ORDERS: "pos/ordersBydate",
  GET_LIVE_STATUS: "pos/liveStatus",
  GET_REVENUE_SUMMARY: "/dashboard/revenue-summary",
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
  CREATE_INVENTORY_ITEM: "inventory",
  GET_INVENTORY_ITEM_LIST: "inventory/list",
  GET_INVENTORY_ITEM_BY_ID: "inventory/getInventoryItemById",
  UPDATE_INVENTORY_ITEM: "inventory/updateInventoryItem",
  DELETE_INVENTORY_ITEM: "inventory/deleteInventoryItem",

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

  // Stock
  GET_STOCK_LIST: "stock/list",
  GET_STOCK_BY_ID: "stock/getStockById",
  ADJUST_STOCK: "stock/adjust",
  DEDUCT_STOCK_BY_KOT: "stock/deductByKot",
  GET_STOCK_HISTORY: "stock/history",

  // Warehouse
  CREATE_WAREHOUSE: "warehouse",
  GET_WAREHOUSE_LIST: "warehouse/list",
  GET_WAREHOUSE_BY_ID: "warehouse/getWarehouseById",
  UPDATE_WAREHOUSE: "warehouse/updateWarehouse",
  DELETE_WAREHOUSE: "warehouse/deleteWarehouse",

  // Transfers
  CREATE_TRANSFER: "transfers",
  GET_TRANSFER_LIST: "transfers/list",
  GET_TRANSFER_BY_ID: "transfers/getTransferById",
  UPDATE_TRANSFER: "transfers/updateTransfer",
  DELETE_TRANSFER: "transfers/deleteTransfer",
  UPDATE_TRANSFER_STATUS: "transfers/updateStatus",

  // Wastage
  CREATE_WASTAGE: "wastage",
  GET_WASTAGE_LIST: "wastage/list",
  GET_WASTAGE_BY_ID: "wastage/getWastageById",
  UPDATE_WASTAGE: "wastage/updateWastage",
  DELETE_WASTAGE: "wastage/deleteWastage",

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

  // Printers
  CREATE_PRINTER: "printers",
  GET_PRINTER_LIST: "printers/list",
  GET_PRINTER_BY_ID: "printers/getPrinterById",
  UPDATE_PRINTER: "printers/updatePrinter",
  DELETE_PRINTER: "printers/deletePrinter",
  TEST_PRINTER: "printers/test",
};

const URL = "http://localhost:5000/api/v1/";
const pendingRequests = new Map();

const shouldDedupeRequest = (mainUrl, method) => {
  return method === "GET" || mainUrl?.endsWith("/list");
};

const action = async (mainUrl, params, method = "POST", hostUrl = URL) => {
  try {
    const requestMethod = method || "POST";
    const requestBody = JSON.stringify(params);
    const requestUrl = hostUrl + mainUrl;
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
      body: JSON.stringify(params),
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
    const requestUrl = hostUrl + mainUrl;
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
      body: JSON.stringify(params),
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
      data: payload,
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
