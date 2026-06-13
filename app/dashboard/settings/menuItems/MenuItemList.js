"use client";

import { useEffect, useState } from "react";
import Table from "@/components/ui/Table";
import { action, API, getAction } from "@/lib/API";
import AddMenuItem from "./AddMenuItem";

const menuItemHeader = [
  {
    title: "Menu Item",
    value: "itemName",
    type: "bold",
  },
  {
    title: "Code",
    value: "itemCode",
    width: 130,
  },
  {
    title: "Category",
    value: "categoryId.categoryName",
    render: (value, row) =>
      value || row.categoryName || row.category?.categoryName || "-",
  },
  {
    title: "Sub Category",
    value: "subCategoryId.subCategoryName",
    render: (value, row) =>
      value || row.subCategoryName || row.subCategory?.subCategoryName || "-",
  },
  {
    title: "Dine In Price",
    value: "dineInPrice",
    render: (value, row) => {
      const price = value ?? row.price;
      return price || price === 0 ? `Rs ${price}` : "-";
    },
  },
  {
    title: "GST",
    value: "gstPercentage",
    render: (value) => (value || value === 0 ? `${value}%` : "-"),
    align: "right",
    width: 90,
  },
  { title: "Status", value: "status", type: "status" },
  {
    title: "Updated",
    value: "updatedAt",
    render: (value) => (value ? new Date(value).toLocaleDateString() : "-"),
  },
  { title: "Actions", value: "actions", type: "action", align: "right" },
];

export default function MenuItemList({ refreshKey }) {
  const [menuItemData, setMenuItemData] = useState([]);
  const [menuItemDrawerOpen, setMenuItemDrawerOpen] = useState(false);
  const [menuItemId, setMenuItemId] = useState(null);

  useEffect(() => {
    getMenuItemList();
  }, [refreshKey]);

  const getMenuItemList = async () => {
    try {
      const result = await action(API.GET_MENU_ITEM_LIST, {
        restaurantId: JSON.parse(localStorage.getItem("restaurantId")),
        branchId: JSON.parse(localStorage.getItem("branchIds")),
      });
      if (result?.statusCode === 200) {
        setMenuItemData(result?.data || []);
      }
    } catch (error) {}
  };

  const deleteMenuItem = async (id) => {
    try {
      const result = await action(
        `${API.DELETE_MENU_ITEM}/${id}`,
        {},
        "DELETE",
      );
      if (result?.statusCode === 200) {
        getMenuItemList();
      }
    } catch (error) {}
  };

  return (
    <div className="space-y-4">
      <Table
        header={menuItemHeader}
        data={menuItemData}
        title="Menu Items"
        rowKey="_id"
        onView={() => {}}
        onEdit={(id) => {
          setMenuItemId(id);
          setMenuItemDrawerOpen(true);
        }}
        onDelete={deleteMenuItem}
      />

      <AddMenuItem
        open={menuItemDrawerOpen}
        onOpenChange={(nextOpen) => {
          setMenuItemDrawerOpen(nextOpen);
          if (!nextOpen) {
            setMenuItemId(null);
          }
        }}
        onCreated={() => {
          setMenuItemId(null);
          getMenuItemList();
        }}
        updateId={menuItemId}
      />
    </div>
  );
}
