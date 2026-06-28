"use client";

import { useEffect, useState } from "react";
import { Switch } from "antd";
import { message } from "@/lib/message";
import { useFormik } from "formik";
import * as Yup from "yup";
import { AntInput } from "@/components/ui/AntInput";
import { AntSelect } from "@/components/ui/AntSelect";
import AntTextArea from "@/components/ui/AntTextArea";
import DrawerPop from "@/components/ui/DrawerPop";
import { action, API, getAction } from "@/lib/API";

const PRINTER_TYPES = [
  { label: "Receipt Printer", value: "receipt" },
  { label: "Kitchen Printer", value: "kitchen" },
  { label: "Label Printer", value: "label" },
  { label: "Barcode Printer", value: "barcode" },
];

const CONNECTION_TYPES = [
  { label: "Network (Ethernet / WiFi)", value: "network" },
  { label: "USB", value: "usb" },
  { label: "Bluetooth", value: "bluetooth" },
  { label: "Serial", value: "serial" },
];

const PAPER_SIZES = [
  { label: "58 mm  (Mini Receipt)", value: "58mm" },
  { label: "80 mm  (Standard Receipt)", value: "80mm" },
  { label: "A4", value: "A4" },
];

const COPIES_OPTIONS = [1, 2, 3, 4, 5].map((n) => ({
  label: `${n} ${n === 1 ? "copy" : "copies"}`,
  value: n,
}));

const STATUS_OPTIONS = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

const initialValues = {
  printerName: "",
  printerType: undefined,
  connectionType: undefined,
  ipAddress: "",
  port: "9100",
  paperSize: "80mm",
  copies: 1,
  autoPrint: false,
  status: "active",
  description: "",
};

const validationSchema = Yup.object({
  printerName: Yup.string()
    .trim()
    .min(2, "Minimum 2 characters")
    .max(100, "Maximum 100 characters")
    .required("Printer name is required"),
  printerType: Yup.string().required("Printer type is required"),
  connectionType: Yup.string().required("Connection type is required"),
  ipAddress: Yup.string().when("connectionType", {
    is: "network",
    then: (schema) =>
      schema
        .trim()
        .required("IP address is required for network printers")
        .matches(
          /^(\d{1,3}\.){3}\d{1,3}$/,
          "Enter a valid IP address (e.g. 192.168.1.100)",
        ),
    otherwise: (schema) => schema.nullable(),
  }),
  port: Yup.number().when("connectionType", {
    is: "network",
    then: (schema) =>
      schema
        .typeError("Port must be a number")
        .required("Port is required")
        .min(1, "Invalid port")
        .max(65535, "Invalid port"),
    otherwise: (schema) => schema.nullable(),
  }),
  paperSize: Yup.string().required("Paper size is required"),
  copies: Yup.number().min(1).max(5).required("Number of copies is required"),
  status: Yup.string().oneOf(["active", "inactive"]).required(),
  description: Yup.string().trim().max(300, "Max 300 characters").nullable(),
});

export default function AddPrinter({
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
    validationSchema,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        const isNetwork = values.connectionType === "network";
        const payload = {
          printerName: values.printerName.trim(),
          printerType: values.printerType,
          connectionType: values.connectionType,
          ...(isNetwork && {
            ipAddress: values.ipAddress.trim(),
            port: Number(values.port),
          }),
          paperSize: values.paperSize,
          copies: values.copies,
          autoPrint: values.autoPrint,
          status: values.status,
          ...(values.description?.trim() && {
            description: values.description.trim(),
          }),
        };

        const result = await action(
          isUpdate
            ? `${API.UPDATE_PRINTER}/${updateId}`
            : API.CREATE_PRINTER,
          payload,
          isUpdate ? "PATCH" : "POST",
        );

        if (result?.statusCode === 200 || result?.statusCode === 201) {
          message.success(
            result?.message ||
              (isUpdate ? "Printer updated successfully" : "Printer added successfully"),
          );
          resetForm();
          onCreated?.(result?.data || payload);
          onOpenChange(false);
          return;
        }

        message.error(
          result?.message ||
            (isUpdate ? "Unable to update printer" : "Unable to add printer"),
        );
      } catch {
        message.error(
          isUpdate ? "Unable to update printer" : "Unable to add printer",
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  const getError = (field) =>
    formik.touched[field] && formik.errors[field]
      ? formik.errors[field]
      : "";

  const closeDrawer = () => {
    formik.resetForm();
    setShow(false);
    onOpenChange(false);
  };

  const fetchPrinterDetails = async (id) => {
    try {
      const result = await getAction(`${API.GET_PRINTER_BY_ID}/${id}`);
      if (result?.statusCode === 200 && result.data) {
        const p = result.data;
        formik.setValues({
          printerName: p.printerName || "",
          printerType: p.printerType || undefined,
          connectionType: p.connectionType || undefined,
          ipAddress: p.ipAddress || "",
          port: p.port ? String(p.port) : "9100",
          paperSize: p.paperSize || "80mm",
          copies: p.copies || 1,
          autoPrint: p.autoPrint || false,
          status: p.status || "active",
          description: p.description || "",
        });
      }
    } catch {
      message.error("Unable to fetch printer details");
    }
  };

  useEffect(() => {
    if (!open) return;
    if (updateId) {
      fetchPrinterDetails(updateId);
    } else {
      formik.resetForm();
    }
  }, [open, updateId]);

  const isNetworkPrinter = formik.values.connectionType === "network";

  return (
    <DrawerPop
      open={show}
      close={closeDrawer}
      header={[
        isUpdate ? "Update Printer" : "Add Printer",
        isUpdate
          ? "Update printer configuration and settings."
          : "Configure a new printer for your restaurant.",
      ]}
      handleSubmit={formik.handleSubmit}
      footerBtn={["Cancel", "Save"]}
      footerBtnDisabled={formik.isSubmitting}
      loadingButton={formik.isSubmitting}
      width={640}
    >
      <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
        <AntInput
          label="Printer Name *"
          name="printerName"
          placeholder="Eg: Main Receipt Printer, Kitchen Printer 1"
          value={formik.values.printerName}
          error={getError("printerName")}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <AntSelect
            label="Printer Type *"
            placeholder="Select printer type"
            value={formik.values.printerType}
            error={getError("printerType")}
            options={PRINTER_TYPES}
            onChange={(value) => formik.setFieldValue("printerType", value)}
            onBlur={() => formik.setFieldTouched("printerType", true)}
          />

          <AntSelect
            label="Connection Type *"
            placeholder="Select connection type"
            value={formik.values.connectionType}
            error={getError("connectionType")}
            options={CONNECTION_TYPES}
            onChange={(value) => {
              formik.setFieldValue("connectionType", value);
              if (value !== "network") {
                formik.setFieldValue("ipAddress", "");
                formik.setFieldValue("port", "9100");
              }
            }}
            onBlur={() => formik.setFieldTouched("connectionType", true)}
          />
        </div>

        {isNetworkPrinter && (
          <div className="grid gap-4 md:grid-cols-2">
            <AntInput
              label="IP Address *"
              name="ipAddress"
              placeholder="192.168.1.100"
              value={formik.values.ipAddress}
              error={getError("ipAddress")}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            <AntInput
              label="Port *"
              name="port"
              type="number"
              placeholder="9100"
              value={formik.values.port}
              error={getError("port")}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <AntSelect
            label="Paper Size"
            value={formik.values.paperSize}
            error={getError("paperSize")}
            options={PAPER_SIZES}
            onChange={(value) => formik.setFieldValue("paperSize", value)}
            onBlur={() => formik.setFieldTouched("paperSize", true)}
          />
          <AntSelect
            label="Number of Copies"
            value={formik.values.copies}
            error={getError("copies")}
            options={COPIES_OPTIONS}
            onChange={(value) => formik.setFieldValue("copies", value)}
            onBlur={() => formik.setFieldTouched("copies", true)}
          />
        </div>

        <AntSelect
          label="Status"
          value={formik.values.status}
          error={getError("status")}
          options={STATUS_OPTIONS}
          onChange={(value) => formik.setFieldValue("status", value)}
          onBlur={() => formik.setFieldTouched("status", true)}
        />

        <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
          <div>
            <p className="text-sm font-medium">Auto Print</p>
            <p className="text-xs text-muted-foreground">
              Automatically print when a new order is placed
            </p>
          </div>
          <Switch
            checked={formik.values.autoPrint}
            onChange={(checked) => formik.setFieldValue("autoPrint", checked)}
          />
        </div>

        <AntTextArea
          label="Description / Notes"
          name="description"
          placeholder="Optional notes about this printer (location, special instructions, etc.)"
          rows={3}
          value={formik.values.description}
          error={getError("description")}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
      </div>
    </DrawerPop>
  );
}
