"use client";

import Table from "@/components/ui/Table";
import { action, API, getAction } from "@/lib/API";
import { useEffect, useState } from "react";
import AddSuppliers from "./AddSuppliers";

const supplierHeader = [
  { title: "Supplier", value: "supplierName", type: "bold", width: 220 },
  { title: "Contact Person", value: "contactPerson", width: 180 },
  { title: "Phone", value: "phone", width: 150 },
  { title: "Email", value: "email", width: 220 },
  { title: "GST No.", value: "gstNumber", width: 170 },
  { title: "Status", value: "status", type: "status", width: 120 },
  {
    title: "Updated",
    value: "updatedAt",
    render: (value) => (value ? new Date(value).toLocaleDateString() : "-"),
    width: 130,
  },
  { title: "Actions", value: "actions", type: "action", align: "right" },
];

export default function SuppliersList({ refreshKey }) {
  const [supplierData, setSupplierData] = useState([]);
  const [supplierDrawerOpen, setSupplierDrawerOpen] = useState(false);
  const [supplierId, setSupplierId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getSupplierList();
  }, [refreshKey]);

  const getSupplierList = async () => {
    setLoading(true);

    try {
      const result = await getAction(API.GET_SUPPLIER_LIST, {});
      if (result?.statusCode === 200) {
        setSupplierData(result?.data || []);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const deleteSupplier = async (id) => {
    try {
      const result = await action(`${API.DELETE_SUPPLIER}/${id}`, {}, "DELETE");
      if (result?.statusCode === 200) {
        getSupplierList();
      }
    } catch (error) {}
  };

  return (
    <div className="space-y-4">
      <Table
        header={supplierHeader}
        data={supplierData}
        title="Suppliers"
        rowKey="_id"
        loading={loading}
        searchPlaceholder="Search supplier, contact, phone, or GST"
        onView={() => {}}
        onEdit={(id) => {
          setSupplierId(id);
          setSupplierDrawerOpen(true);
        }}
        onDelete={deleteSupplier}
      />

      {supplierDrawerOpen && (
        <AddSuppliers
          open={supplierDrawerOpen}
          onOpenChange={(nextOpen) => {
            setSupplierDrawerOpen(nextOpen);
            if (!nextOpen) {
              setSupplierId(null);
            }
          }}
          onCreated={() => {
            setSupplierId(null);
            getSupplierList();
          }}
          updateId={supplierId}
        />
      )}
    </div>
  );
}
