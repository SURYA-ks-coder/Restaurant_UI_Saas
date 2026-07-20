import {
  LayoutDashboard,
  Receipt,
  UtensilsCrossed,
  Package,
  BarChart3,
  Users,
  Settings,
  Store,
  Crown,
  ClipboardList,
  ListOrdered,
  CreditCard,
  ChefHat,
  Table2,
  QrCode,
  BookOpen,
  Boxes,
  PackageSearch,
  Warehouse,
  ArrowLeftRight,
  Trash2,
  UserRound,
  UsersRound,
  Building2,
  GitBranch,
  SlidersHorizontal,
  ShieldCheck,
  Palette,
  LayoutGrid,
  Building,
  ShoppingCart,
  ClipboardCheck,
} from "lucide-react";
import { getMenuIds, getPermissionIds } from "@/lib/auth";
import { navLink } from "./NavLink";
import { permissionIds } from "./Permission";

// Single source of truth for the dashboard nav tree — consumed by the
// desktop rail (sidebarNew.js) and the mobile drawer (sidebar.js).
//
// permissionId values reference the privileges menu catalog returned by
// API.GET_MENU_LIST (see FALLBACK_MENU_LIST in lib/menuPermissions.js).
// A leaf without a permissionId is only visible to owner / super_admin.
export const navItems = [
  {
    id: 1,
    title: "Dashboard",
    shortTitle: "Dash",
    icon: <LayoutDashboard />,
    link: navLink.dashboard,
    permissionId: permissionIds.dashboard,
  },

  // ================= Operations =================
  {
    id: 2,
    title: "Operations",
    shortTitle: "Ops",
    icon: <Receipt />,
    submenus: [
      {
        id: 1,
        title: "Order Management",
        subMenu: [
          {
            id: 1,
            title: "Orders",
            link: navLink.orders,
            navigation: true,
            icon: <ClipboardList />,
            permissionId: permissionIds.orders,
          },
          {
            id: 2,
            title: "Orders List",
            link: navLink.ordersList,
            navigation: true,
            icon: <ListOrdered />,
            permissionId: permissionIds.ordersList,
          },
          {
            id: 3,
            title: "Billing",
            link: navLink.billing,
            navigation: true,
            icon: <CreditCard />,
            permissionId: permissionIds.billing,
          },
          {
            id: 4,
            title: "Kitchen KOT",
            link: navLink.kitchen,
            navigation: true,
            icon: <ChefHat />,
            permissionId: permissionIds.kitchenKot,
          },
          {
            id: 5,
            title: "Tables",
            link: navLink.tables,
            navigation: true,
            icon: <Table2 />,
            permissionId: permissionIds.tables,
          },
          {
            id: 6,
            title: "QR Orders",
            link: navLink.qrOrders,
            navigation: true,
            icon: <QrCode />,
            permissionId: permissionIds.qrOrders,
          },
        ],
      },
    ],
  },

  // ================= Menu =================
  // {
  //   id: 3,
  //   title: "Menu",
  //   shortTitle: "Menu",
  //   icon: <UtensilsCrossed />,
  //   submenus: [
  //     {
  //       id: 1,
  //       title: "Menu Management",
  //       subMenu: [
  //         {
  //           id: 1,
  //           title: "Menus",
  //           link: navLink.menus,
  //           navigation: true,
  //           icon: <BookOpen />,
  //           permissionId: permissionIds.menus,
  //         },
  //       ],
  //     },
  //   ],
  // },

  // ================= Inventory =================
  {
    id: 4,
    title: "Inventory",
    shortTitle: "Stock",
    icon: <Package />,
    submenus: [
      {
        id: 1,
        title: "Inventory",
        subMenu: [
          {
            id: 1,
            title: "Inventory Items",
            link: navLink.inventory,
            navigation: true,
            icon: <Boxes />,
            permissionId: permissionIds.inventory,
          },
          {
            id: 2,
            title: "Stock",
            link: navLink.inventoryStock,
            navigation: true,
            icon: <PackageSearch />,
            permissionId: permissionIds.inventory,
          },
          {
            id: 8,
            title: "Recipes",
            link: navLink.inventoryRecipes,
            navigation: true,
            icon: <ChefHat />,
            permissionId: permissionIds.inventory,
          },
          {
            id: 6,
            title: "Purchases",
            link: navLink.inventoryPurchases,
            navigation: true,
            icon: <ShoppingCart />,
            permissionId: permissionIds.inventory,
          },
          {
            id: 7,
            title: "Stock Count",
            link: navLink.inventoryStockCount,
            navigation: true,
            icon: <ClipboardCheck />,
            permissionId: permissionIds.inventory,
          },
          {
            id: 3,
            title: "Warehouse",
            link: navLink.inventoryWarehouse,
            navigation: true,
            icon: <Warehouse />,
            permissionId: permissionIds.inventory,
          },
          {
            id: 4,
            title: "Transfers",
            link: navLink.inventoryTransfers,
            navigation: true,
            icon: <ArrowLeftRight />,
            permissionId: permissionIds.inventory,
          },
          {
            id: 5,
            title: "Wastage",
            link: navLink.inventoryWastage,
            navigation: true,
            icon: <Trash2 />,
            permissionId: permissionIds.inventory,
          },
        ],
      },
    ],
  },

  // ================= Reports & Finance =================
  {
    id: 5,
    title: "Reports",
    shortTitle: "Reports",
    icon: <BarChart3 />,
    link: navLink.reports,
    permissionId: permissionIds.reports,
  },

  // ================= Staff =================
  // {
  //   id: 6,
  //   title: "Staff",
  //   shortTitle: "Staff",
  //   icon: <Users />,
  //   submenus: [

  //   ],
  // },

  // ================= Restaurant =================
  {
    id: 7,
    title: "Restaurant",
    shortTitle: "Restaurant",
    icon: <Store />,
    submenus: [
      {
        id: 1,
        title: "Management",
        subMenu: [
          {
            id: 1,
            title: "Restaurant Profile",
            link: navLink.restaurantProfile,
            navigation: true,
            icon: <Building2 />,
            permissionId: permissionIds.restaurantProfile,
          },
          {
            id: 2,
            title: "Branch Management",
            link: navLink.branchManagement,
            navigation: true,
            icon: <GitBranch />,
            permissionId: permissionIds.restaurantProfile,
          },
        ],
      },
      {
        id: 2,
        title: "Team",
        subMenu: [
          {
            id: 1,
            title: "All Staff",
            link: navLink.staff,
            navigation: true,
            icon: <UserRound />,
            permissionId: permissionIds.staff,
          },
          {
            id: 2,
            title: "My Team",
            link: navLink.staffMyTeam,
            navigation: true,
            hideForRoles: ["owner", "super_admin"],
            icon: <UsersRound />,
            permissionId: permissionIds.staff,
          },
        ],
      },
    ],
  },

  // ================= Administration =================
  {
    id: 8,
    title: "Administration",
    shortTitle: "Admin",
    icon: <Settings />,
    submenus: [
      {
        id: 1,
        title: "Configuration",
        subMenu: [
          {
            id: 1,
            title: "Appearance",
            link: navLink.appearance,
            navigation: true,
            icon: <Palette />,
            permissionId: permissionIds.appearance,
          },
          {
            id: 2,
            title: "Privileges",
            link: navLink.privileges,
            navigation: true,
            icon: <ShieldCheck />,
            permissionId: permissionIds.privileges,
          },
          {
            id: 3,
            title: "General Settings",
            link: navLink.settings,
            navigation: true,
            icon: <SlidersHorizontal />,
            permissionId: permissionIds.settings,
          },
        ],
      },
      {
        id: 2,
        title: "Owner Tools",
        subMenu: [
          {
            id: 1,
            title: "Owner Dashboard",
            link: navLink.owner,
            navigation: true,
            icon: <LayoutGrid />,
          },
          {
            id: 2,
            title: "Restaurants",
            link: navLink.ownerAddRestaurant,
            navigation: true,
            icon: <Building />,
          },
        ],
      },
    ],
  },
];

// Reads the logged-in user's allowed permission ids (login response `menus`,
// falling back to `permissionIds`). Returns null for full access — owner /
// super_admin, or legacy sessions with no permission list saved.
export function getAllowedPermissionIds(role) {
  if (role === "owner" || role === "super_admin") return null;
  const ids = getMenuIds();
  const effective = ids.length > 0 ? ids : getPermissionIds();
  return effective.length > 0 ? new Set(effective) : null;
}

// Prunes the nav tree to leaves whose permissionId is allowed. Leaves without
// a permissionId (e.g. Owner Tools) are dropped; groups and top-level entries
// with no remaining children disappear. allowedIds === null keeps everything.
export function filterNavItemsByPermissions(items, allowedIds) {
  if (!allowedIds) return items;
  const canSee = (item) =>
    item.permissionId != null && allowedIds.has(item.permissionId);

  return items
    .map((menu) => {
      if (!menu.submenus) return canSee(menu) ? menu : null;
      const submenus = menu.submenus
        .map((group) => {
          const subMenu = (group.subMenu || []).filter(canSee);
          return subMenu.length > 0 ? { ...group, subMenu } : null;
        })
        .filter(Boolean);
      return submenus.length > 0 ? { ...menu, submenus } : null;
    })
    .filter(Boolean);
}
