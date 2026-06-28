"use client";

import { message } from "@/lib/message";

import { useFormik } from "formik";
import { useEffect, useState } from "react";
import * as Yup from "yup";
import {
  AntInput,
  AntSelect,
  AntTextArea,
} from "@/components/ui/antd-components";
import DrawerPop from "@/components/ui/DrawerPop";
import { action, API, getAction } from "@/lib/API";
import { LocalStorageData } from "@/lib/LocalStoragekeyvalue";

const initialValues = {
  restaurantId: "",
  branchId: "",
  supplierName: "",
  contactPerson: "",
  phone: "",
  email: "",
  gstNumber: "",
  address: "",
  status: "active",
  notes: "",
};

const supplierValidationSchema = Yup.object({
  supplierName: Yup.string()
    .trim()
    .min(2, "Supplier name must be at least 2 characters")
    .max(100, "Supplier name must be 100 characters or less")
    .required("Supplier name is required"),
  contactPerson: Yup.string()
    .trim()
    .max(80, "Contact person must be 80 characters or less")
    .nullable(),
  phone: Yup.string()
    .trim()
    .matches(/^[0-9+\-\s()]{7,16}$/, "Enter a valid phone number")
    .required("Phone number is required"),
  email: Yup.string().trim().email("Enter a valid email").nullable(),
  gstNumber: Yup.string()
    .trim()
    .max(20, "GST number must be 20 characters or less")
    .nullable(),
  address: Yup.string()
    .trim()
    .max(300, "Address must be 300 characters or less")
    .nullable(),
  status: Yup.string()
    .oneOf(["active", "inactive"], "Select a valid status")
    .required("Status is required"),
  notes: Yup.string()
    .trim()
    .max(300, "Notes must be 300 characters or less")
    .nullable(),
});

export default function AddSuppliers({
  open,
  onOpenChange,
  onCreated,
  updateId = null,
}) {
  const [show, setShow] = useState(open);
  const isUpdate = Boolean(updateId);

  useEffect(() => {
    setShow(open);
  }, [open]);

  const formik = useFormik({
    initialValues,
    validationSchema: supplierValidationSchema,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        const payload = {
          ...values,
          restaurantId: LocalStorageData.restaurantId,
          branchId: LocalStorageData.branchId,
          supplierName: values.supplierName.trim(),
          contactPerson: values.contactPerson.trim(),
          phone: values.phone.trim(),
          email: values.email.trim(),
          gstNumber: values.gstNumber.trim(),
          address: values.address.trim(),
          notes: values.notes.trim(),
        };

        const result = await action(
          isUpdate ? `${API.UPDATE_SUPPLIER}/${updateId}` : API.CREATE_SUPPLIER,
          payload,
          isUpdate ? "PATCH" : "POST",
        );

        if (result?.statusCode === 200 || result?.statusCode === 201) {
          message.success(result?.message || "Supplier saved successfully");
          resetForm();
          onCreated?.(result?.data || payload);
          onOpenChange(false);
          return;
        }

        message.error(
          result?.message ||
            (isUpdate ? "Unable to update supplier" : "Unable to add supplier"),
        );
      } catch (error) {
        message.error(
          isUpdate ? "Unable to update supplier" : "Unable to add supplier",
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  const getError = (field) => {
    return formik.touched[field] && formik.errors[field]
      ? formik.errors[field]
      : "";
  };

  const closeDrawer = () => {
    formik.resetForm();
    setShow(false);
    onOpenChange(false);
  };

  const getSupplierDetails = async (id) => {
    try {
      const result = await getAction(`${API.GET_SUPPLIER_BY_ID}/${id}`);
      if (result?.statusCode === 200) {
        const supplier = result?.data;

        if (supplier) {
          formik.setValues({
            restaurantId: supplier.restaurantId || "",
            branchId: supplier.branchId || "",
            supplierName: supplier.supplierName || supplier.name || "",
            contactPerson: supplier.contactPerson || supplier.contactName || "",
            phone: supplier.phone || supplier.mobile || "",
            email: supplier.email || "",
            gstNumber: supplier.gstNumber || supplier.gstin || "",
            address: supplier.address || "",
            status: supplier.status || "active",
            notes: supplier.notes || supplier.description || "",
          });
        }
      }
    } catch (error) {
      message.error("Unable to fetch supplier details");
    }
  };

  useEffect(() => {
    if (!open) return;

    if (updateId) {
      getSupplierDetails(updateId);
      return;
    }

    formik.resetForm();
  }, [open, updateId]);

  return (
    <DrawerPop
      open={show}
      close={closeDrawer}
      header={[
        isUpdate ? "Update Supplier" : "Add Supplier",
        isUpdate
          ? "Update supplier details for this restaurant branch."
          : "Create a supplier for purchase and inventory records.",
      ]}
      handleSubmit={formik.handleSubmit}
      footerBtn={["Cancel", "Save"]}
      footerBtnDisabled={formik.isSubmitting}
      loadingButton={formik.isSubmitting}
      width={760}
    >
      <div className="flex-1 space-y-5 overflow-y-auto ">
        <div className="grid gap-4 md:grid-cols-2">
          <AntInput
            label="Supplier Name"
            name="supplierName"
            placeholder="Eg: Fresh Farm Traders"
            value={formik.values.supplierName}
            error={getError("supplierName")}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          <AntInput
            label="Contact Person"
            name="contactPerson"
            placeholder="Eg: Raj Sharma"
            value={formik.values.contactPerson}
            error={getError("contactPerson")}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          <AntInput
            label="Phone Number"
            name="phone"
            placeholder="Eg: 9876543210"
            value={formik.values.phone}
            error={getError("phone")}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          <AntInput
            label="Email"
            name="email"
            type="email"
            placeholder="supplier@example.com"
            value={formik.values.email}
            error={getError("email")}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          <AntInput
            label="GST Number"
            name="gstNumber"
            placeholder="GSTIN"
            value={formik.values.gstNumber}
            error={getError("gstNumber")}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          <AntSelect
            label="Status"
            value={formik.values.status}
            error={getError("status")}
            options={[
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
            ]}
            onChange={(value) => formik.setFieldValue("status", value)}
            onBlur={() => formik.setFieldTouched("status", true)}
          />
        </div>

        <AntTextArea
          label="Address"
          name="address"
          placeholder="Supplier address"
          value={formik.values.address}
          error={getError("address")}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />

        <AntTextArea
          label="Notes"
          name="notes"
          placeholder="Payment terms, delivery days, or other supplier notes"
          value={formik.values.notes}
          error={getError("notes")}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
      </div>
    </DrawerPop>
  );
}
