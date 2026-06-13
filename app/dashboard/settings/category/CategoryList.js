import Table from "@/components/ui/Table";
import { action, API, getAction } from "@/lib/API";
import { useEffect, useState } from "react";
import AddCategory from "./AddCategory";

const categoryHeader = [
  { title: "Category", value: "categoryName", type: "bold", width: 220 },
  { title: "Order", value: "displayOrder", align: "right", width: 100 },
  { title: "Description", value: "description", width: 260 },
  { title: "Status", value: "status", type: "status" },
  {
    title: "Updated",
    value: "updatedAt",
    label: "Updated",
    render: (value) => (value ? new Date(value).toLocaleDateString() : "-"),
  },
  { title: "Actions", value: "actions", type: "action", align: "right" },
];

export default function CategoryList({ refreshKey }) {
  const [categoryData, setCategoryData] = useState([]);
  const [categoryDrawerOpen, setCategoryDrawerOpen] = useState(false);
  const [categoryId, setCategoryId] = useState(null);

  useEffect(() => {
    getCategoryList();
  }, [refreshKey]);

  const getCategoryList = async () => {
    try {
      const result = await getAction(API.GET_CATEGORY_LIST, {});
      if (result.statusCode === 200) {
        setCategoryData(result.data);
      }
    } catch (error) {}
  };
  const deleteCategory = async (id) => {
    try {
      const result = await action(API.DELETE_CATEGORY + "/" + id, {}, "DELETE");
      if (result.statusCode === 200) {
        getCategoryList();
      }
    } catch (error) {}
  };
  return (
    <div className="">
      <Table
        header={categoryHeader}
        data={categoryData}
        title="Category"
        onView={() => {}}
        onEdit={(id, data) => {
          setCategoryId(id);
          setCategoryDrawerOpen(true);
        }}
        onDelete={deleteCategory}
      />

      {categoryDrawerOpen && (
        <AddCategory
          open={categoryDrawerOpen}
          onOpenChange={(nextOpen) => {
            setCategoryDrawerOpen(nextOpen);
            if (!nextOpen) {
              setCategoryId(null);
            }
          }}
          onCreated={() => {
            setCategoryId(null);
            getCategoryList();
          }}
          updateId={categoryId}
        />
      )}
    </div>
  );
}
