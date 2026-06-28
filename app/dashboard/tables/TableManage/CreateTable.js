"use client";

import { message, Switch } from "antd";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import * as Yup from "yup";
import { AntInput, AntSelect } from "@/components/ui/antd-components";
import DrawerPop from "@/components/ui/DrawerPop";
import { action, API, getAction } from "@/lib/API";
import { LocalStorageData } from "@/lib/LocalStoragekeyvalue";

const initialValues = {
  restaurantId: "",
  branchId: "",
  tableName: "",
  tableNumber: "",
  capacity: "",
  floorName: "",
  qrCodeEnabled: false,
  status: "available",
};

const tableValidationSchema = Yup.object({
  tableName: Yup.string()
    .trim()
    .min(2, "Table name must be at least 2 characters")
    .max(80, "Table name must be 80 characters or less")
    .required("Table name is required"),
  tableNumber: Yup.number()
    .typeError("Table number must be a number")
    .integer("Table number must be a whole number")
    .min(1, "Table number must be at least 1")
    .required("Table number is required"),
  capacity: Yup.number()
    .typeError("Capacity must be a number")
    .integer("Capacity must be a whole number")
    .min(1, "Capacity must be at least 1")
    .required("Capacity is required"),
  floorName: Yup.string().trim().required("Floor name is required"),
  qrCodeEnabled: Yup.boolean(),
  status: Yup.string()
    .oneOf(["available", "reserved", "cleaning"], "Select a valid status")
    .required("Status is required"),
});

const floorOptions = [
  { label: "Ground Floor", value: "Ground Floor" },
  { label: "First Floor", value: "First Floor" },
  { label: "Second Floor", value: "Second Floor" },
  { label: "Rooftop", value: "Rooftop" },
  { label: "Outdoor / Patio", value: "Outdoor / Patio" },
];

const statusOptions = [
  { label: "Available", value: "available" },
  { label: "Reserved", value: "reserved" },
  { label: "Cleaning", value: "cleaning" },
];

const numberOrEmpty = (value) => (value || value === 0 ? value : "");

function SectionTitle({ children }) {
  return (
    <div className="border-b border-border pb-2 pt-2 text-sm font-semibold text-accent">
      {children}
    </div>
  );
}

export default function CreateTable({
  open,
  onOpenChange,
  onCreated,
  updateId = null,
  refresh,
}) {
  const [show, setShow] = useState(open);
  const isUpdate = Boolean(updateId);

  useEffect(() => {
    setShow(open);
  }, [open]);

  const formik = useFormik({
    initialValues,
    validationSchema: tableValidationSchema,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        const payload = {
          ...values,
          restaurantId: LocalStorageData.restaurantId,
          branchId: LocalStorageData.branchId,
          tableName: values.tableName.trim(),
          tableNumber: Number(values.tableNumber),
          capacity: Number(values.capacity),
          floorId: values.floorName,
          qrCodeEnabled: Boolean(values.qrCodeEnabled),
          status: values.status,
        };

        const result = await action(
          isUpdate ? `${API.UPDATE_TABLE}/${updateId}` : API.CREATE_TABLE,
          payload,
          isUpdate ? "PATCH" : "POST",
        );

        if (result?.statusCode === 200 || result?.statusCode === 201) {
          message.success(result?.message);
          refresh();
          resetForm();
          onCreated?.(result?.data || payload);
          onOpenChange(false);
          return;
        }

        message.error(
          result?.message ||
            (isUpdate ? "Unable to update table" : "Unable to create table"),
        );
      } catch (error) {
        message.error(
          isUpdate ? "Unable to update table" : "Unable to create table",
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

  const getTableDetails = async (id) => {
    try {
      const result = await getAction(`${API.GET_TABLE_BY_ID}/${id}`);
      if (result?.statusCode === 200) {
        const table = result?.data;

        if (table) {
          formik.setValues({
            restaurantId: table.restaurantId || "",
            branchId: table.branchId || "",
            tableName: table.tableName || table.name || "",
            tableNumber: numberOrEmpty(table.tableNumber || table.number),
            capacity: numberOrEmpty(table.capacity || table.seats),
            floorName: table.floorName || table.floorId || "",
            qrCodeEnabled: Boolean(table.qrCodeEnabled),
            status: table.status || "available",
          });
        }
      }
    } catch (error) {
      message.error("Unable to fetch table details");
    }
  };

  useEffect(() => {
    if (!open) return;
    console.log(updateId, "updateId");

    if (updateId) {
      getTableDetails(updateId);
      return;
    }

    formik.resetForm();
  }, [open, updateId]);

  return (
    <DrawerPop
      open={show}
      close={() => {
        closeDrawer();
      }}
      header={[
        isUpdate ? "Update Table" : "Create Table",
        isUpdate
          ? "Update table details for this restaurant branch."
          : "Create a dining table for this restaurant branch.",
      ]}
      handleSubmit={formik.handleSubmit}
      footerBtn={["Cancel", "Save"]}
      footerBtnDisabled={formik.isSubmitting}
      loadingButton={formik.isSubmitting}
      width={720}
    >
      <div className="flex-1 space-y-5 overflow-y-auto">
        <SectionTitle>Table Details</SectionTitle>
        <div className="grid gap-4 md:grid-cols-2">
          <AntInput
            label="Table Name"
            name="tableName"
            placeholder="Eg: T1, Window Seat"
            value={formik.values.tableName}
            error={getError("tableName")}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          <AntInput
            label="Table Number"
            name="tableNumber"
            type="number"
            min={1}
            placeholder="Eg: 1"
            value={formik.values.tableNumber}
            error={getError("tableNumber")}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          <AntInput
            label="Capacity"
            name="capacity"
            type="number"
            min={1}
            placeholder="Number of seats"
            value={formik.values.capacity}
            error={getError("capacity")}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          <AntSelect
            label="Floor Name"
            value={formik.values.floorName || undefined}
            error={getError("floorName")}
            options={floorOptions}
            placeholder="Select floor"
            onChange={(value) => formik.setFieldValue("floorName", value)}
            onBlur={() => formik.setFieldTouched("floorName", true)}
          />
        </div>

        <SectionTitle>Ordering & Status</SectionTitle>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium">
              QR Code Enable
            </span>
            <Switch
              checked={formik.values.qrCodeEnabled}
              onChange={(checked) =>
                formik.setFieldValue("qrCodeEnabled", checked)
              }
              className="bg-primary"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Enables QR ordering for this table.
            </p>
          </label>
          <AntSelect
            label="Status"
            value={formik.values.status}
            error={getError("status")}
            options={statusOptions}
            placeholder="Select status"
            onChange={(value) => formik.setFieldValue("status", value)}
            onBlur={() => formik.setFieldTouched("status", true)}
          />
        </div>
      </div>
    </DrawerPop>
  );
}
