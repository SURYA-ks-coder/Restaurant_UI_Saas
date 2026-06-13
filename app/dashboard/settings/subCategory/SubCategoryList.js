"use client";

import { useEffect, useState } from "react";
import Table from "@/components/ui/Table";
import { action, API, getAction } from "@/lib/API";
import AddSubCategory from "./AddSubCategory";

const subCategoryHeader = [
  {
    title: "Sub Category",
    value: "subCategoryName",
    type: "bold",
    width: 220,
  },
  {
    title: "Category",
    value: "categoryId.categoryName",
    width: 180,
    render: (value, row) =>
      value || row.categoryName || row.category?.categoryName || "-",
  },
  {
    title: "Order",
    value: "displayOrder",
    align: "right",
    width: 100,
  },
  {
    title: "Description",
    value: "description",
    width: 260,
  },
  {
    title: "Status",
    value: "status",
    type: "status",
    width: 140,
  },
  {
    title: "Updated",
    value: "updatedAt",
    label: "Updated",
    render: (value) => (value ? new Date(value).toLocaleDateString() : "-"),
  },
  {
    title: "Actions",
    value: "actions",
    type: "action",
    align: "right",
    width: 80,
  },
];

export default function SubCategoryList({ refreshKey }) {
  const [subCategoryData, setSubCategoryData] = useState([]);
  const [subCategoryDrawerOpen, setSubCategoryDrawerOpen] = useState(false);
  const [subCategoryId, setSubCategoryId] = useState(null);

  useEffect(() => {
    getSubCategoryList();
  }, [refreshKey]);

  const getSubCategoryList = async () => {
    try {
      const result = await getAction(API.GET_SUB_CATEGORY_LIST, {});
      if (result?.statusCode === 200) {
        setSubCategoryData(result?.data || []);
      }
    } catch (error) {}
  };
  const deleteSubCategory = async (id) => {
    try {
      const result = await action(
        API.DELETE_SUB_CATEGORY + "/" + id,
        {},
        "DELETE",
      );
      if (result.statusCode === 200) {
        getSubCategoryList();
      }
    } catch (error) {}
  };

  return (
    <div className="space-y-4">
      <Table
        header={subCategoryHeader}
        data={subCategoryData}
        title="Sub Categories"
        rowKey="_id"
        onView={() => {}}
        onEdit={(id) => {
          setSubCategoryId(id);
          setSubCategoryDrawerOpen(true);
        }}
        onDelete={deleteSubCategory}
      />

      {subCategoryDrawerOpen && (
        <AddSubCategory
          open={subCategoryDrawerOpen}
          onOpenChange={(nextOpen) => {
            setSubCategoryDrawerOpen(nextOpen);
            if (!nextOpen) {
              setSubCategoryId(null);
            }
          }}
          onCreated={() => {
            setSubCategoryId(null);
            getSubCategoryList();
          }}
          updateId={subCategoryId}
        />
      )}
    </div>
  );
}
