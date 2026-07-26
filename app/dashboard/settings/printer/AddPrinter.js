"use client";

import { useEffect, useState } from "react";
import { Switch } from "antd";
import { message } from "@/lib/message";
import { useFormik } from "formik";
import * as Yup from "yup";
import { AntInput } from "@/components/ui/AntInput";
import { AntSelect } from "@/components/ui/AntSelect";
import DrawerPop from "@/components/ui/DrawerPop";
import { action, API, getAction } from "@/lib/API";

const PURPOSE_TYPES = [
  { label: "KOT (Kitchen Order Ticket)", value: "kot" },
  { label: "Bill", value: "bill" },
  { label: "QR Order Slip", value: "qr_order" },
];

const CONNECTION_TYPES = [
  { label: "LAN (network printer)", value: "lan" },
  { label: "USB (connected to agent PC)", value: "usb" },
  { label: "Browser (client-side print)", value: "browser" },
];

const PAPER_WIDTHS = [
  { label: "58 mm", value: "58mm" },
  { label: "80 mm", value: "80mm" },
];

const initialValues = {
  name: "",
  purpose: undefined,
  kitchenSections: [],
  connectionType: undefined,
  ip: "",
  port: "9100",
  printerName: "",
  paperWidth: "80mm",
  isActive: true,
};

const validationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .min(2, "Minimum 2 characters")
    .max(100, "Maximum 100 characters")
    .required("Printer name is required"),
  purpose: Yup.string().required("Purpose is required"),
  connectionType: Yup.string().required("Connection type is required"),
  ip: Yup.string().when("connectionType", {
    is: "lan",
    then: (schema) =>
      schema
        .trim()
        .required("IP address is required for LAN printers")
        .matches(
          /^(\d{1,3}\.){3}\d{1,3}$/,
          "Enter a valid IP address (e.g. 192.168.1.100)",
        ),
    otherwise: (schema) => schema.nullable(),
  }),
  port: Yup.number().when("connectionType", {
    is: "lan",
    then: (schema) =>
      schema
        .typeError("Port must be a number")
        .required("Port is required")
        .min(1, "Invalid port")
        .max(65535, "Invalid port"),
    otherwise: (schema) => schema.nullable(),
  }),
  printerName: Yup.string().when("connectionType", {
    is: "usb",
    then: (schema) =>
      schema.trim().required("Select or enter the printer's name on the agent PC"),
    otherwise: (schema) => schema.nullable(),
  }),
  paperWidth: Yup.string().required("Paper width is required"),
});

export default function AddPrinter({
  open,
  onOpenChange,
  onCreated,
  updateId = null,
  printers = [],
}) {
  const [show, setShow] = useState(open);
  const [agentPrinters, setAgentPrinters] = useState([]);
  const [detecting, setDetecting] = useState(false);
  const isUpdate = Boolean(updateId);

  useEffect(() => {
    setShow(open);
  }, [open]);

  // Asks the branch's print agent for the printers installed on its PC so
  // staff pick the exact OS printer name instead of typing it.
  const detectAgentPrinters = async () => {
    setDetecting(true);
    try {
      const result = await getAction(API.GET_AGENT_PRINTERS);
      if (result?.statusCode === 200) {
        const found = result?.data?.printers || [];
        setAgentPrinters(found);
        if (!found.length) message.info("No printers found on the agent PC");
      } else {
        message.error(result?.message || "Unable to reach the print agent");
      }
    } catch {
      message.error("Unable to reach the print agent");
    } finally {
      setDetecting(false);
    }
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        const isLan = values.connectionType === "lan";
        const isUsb = values.connectionType === "usb";
        const payload = {
          name: values.name.trim(),
          purpose: values.purpose,
          ...(values.purpose === "kot" && {
            kitchenSections: values.kitchenSections || [],
          }),
          connectionType: values.connectionType,
          ...(isLan && {
            ip: values.ip.trim(),
            port: Number(values.port),
          }),
          ...(isUsb && {
            printerName: values.printerName.trim(),
          }),
          paperWidth: values.paperWidth,
          isActive: values.isActive,
        };

        const result = await action(
          isUpdate
            ? `${API.UPDATE_PRINT_PRINTER}/${updateId}`
            : API.CREATE_PRINT_PRINTER,
          payload,
          isUpdate ? "PATCH" : "POST",
        );

        if (result?.statusCode === 200 || result?.statusCode === 201) {
          message.success(
            result?.message ||
              (isUpdate
                ? "Printer updated successfully"
                : "Printer added successfully"),
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
    formik.touched[field] && formik.errors[field] ? formik.errors[field] : "";

  const closeDrawer = () => {
    formik.resetForm();
    setShow(false);
    onOpenChange(false);
  };

  useEffect(() => {
    if (!open) return;
    if (updateId) {
      const p = printers.find((item) => item._id === updateId);
      if (p) {
        formik.setValues({
          name: p.name || "",
          purpose: p.purpose || undefined,
          kitchenSections: p.kitchenSections || [],
          connectionType: p.connectionType || undefined,
          ip: p.ip || "",
          port: p.port ? String(p.port) : "9100",
          printerName: p.printerName || "",
          paperWidth: p.paperWidth || "80mm",
          isActive: p.isActive ?? true,
        });
      }
    } else {
      formik.resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, updateId]);

  const isLanPrinter = formik.values.connectionType === "lan";
  const isUsbPrinter = formik.values.connectionType === "usb";
  const isKotPurpose = formik.values.purpose === "kot";

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
      <div className="flex-1 space-y-5 overflow-y-auto ">
        <AntInput
          label="Printer Name"
          name="name"
          placeholder="Eg: Kitchen Printer 1, Billing Counter"
          value={formik.values.name}
          error={getError("name")}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          required
        />

        <div className="grid gap-4 md:grid-cols-2">
          <AntSelect
            label="Purpose"
            placeholder="Select document type"
            value={formik.values.purpose}
            error={getError("purpose")}
            options={PURPOSE_TYPES}
            onChange={(value) => formik.setFieldValue("purpose", value)}
            onBlur={() => formik.setFieldTouched("purpose", true)}
            required
          />

          <AntSelect
            label="Connection Type"
            placeholder="Select connection type"
            value={formik.values.connectionType}
            error={getError("connectionType")}
            options={CONNECTION_TYPES}
            onChange={(value) => {
              formik.setFieldValue("connectionType", value);
              if (value !== "lan") {
                formik.setFieldValue("ip", "");
                formik.setFieldValue("port", "9100");
              }
              if (value !== "usb") {
                formik.setFieldValue("printerName", "");
              }
            }}
            onBlur={() => formik.setFieldTouched("connectionType", true)}
            required
          />
        </div>

        {isKotPurpose && (
          <AntSelect
            label="Kitchen Sections"
            wrapperClassName="w-full"
            placeholder="Leave empty to match every section"
            mode="tags"
            value={formik.values.kitchenSections}
            options={formik.values.kitchenSections.map((section) => ({
              label: section,
              value: section,
            }))}
            onChange={(value) => formik.setFieldValue("kitchenSections", value)}
          />
        )}

        {isLanPrinter && (
          <div className="grid gap-4 md:grid-cols-2">
            <AntInput
              label="IP Address "
              name="ip"
              placeholder="192.168.1.50"
              value={formik.values.ip}
              error={getError("ip")}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              required
            />
            <AntInput
              label="Port"
              name="port"
              type="number"
              placeholder="9100"
              value={formik.values.port}
              error={getError("port")}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              required
            />
          </div>
        )}

        {isUsbPrinter && (
          <div className="space-y-2">
            <div className="flex items-end gap-2">
              {agentPrinters.length > 0 ? (
                <AntSelect
                  label="Printer on Agent PC"
                  wrapperClassName="flex-1"
                  placeholder="Select the installed printer"
                  value={formik.values.printerName || undefined}
                  error={getError("printerName")}
                  options={agentPrinters.map((p) => ({
                    label: `${p.name}${p.isUsb ? " (USB)" : ""}${p.isDefault ? " · default" : ""}`,
                    value: p.name,
                  }))}
                  onChange={(value) => formik.setFieldValue("printerName", value)}
                  onBlur={() => formik.setFieldTouched("printerName", true)}
                  required
                />
              ) : (
                <AntInput
                  label="Printer Name on Agent PC"
                  name="printerName"
                  wrapperClassName="flex-1"
                  placeholder='Exactly as shown in Windows, e.g. "EPSON TM-T82"'
                  value={formik.values.printerName}
                  error={getError("printerName")}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  required
                />
              )}
              <button
                type="button"
                onClick={detectAgentPrinters}
                disabled={detecting}
                className="mb-0.5 shrink-0 rounded-lg border border-border px-3 py-2 text-xs font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
              >
                {detecting ? "Detecting…" : "Detect Printers"}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              The printer must be installed on the PC running the print agent,
              and the agent must be online. Click "Detect Printers" to pick it
              from a list.
            </p>
          </div>
        )}

        <AntSelect
          label="Paper Width"
          value={formik.values.paperWidth}
          error={getError("paperWidth")}
          options={PAPER_WIDTHS}
          onChange={(value) => formik.setFieldValue("paperWidth", value)}
          onBlur={() => formik.setFieldTouched("paperWidth", true)}
        />

        <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
          <div>
            <p className="text-sm font-medium">Active</p>
            <p className="text-xs text-muted-foreground">
              Inactive printers are skipped when dispatching prints
            </p>
          </div>
          <Switch
            checked={formik.values.isActive}
            onChange={(checked) => formik.setFieldValue("isActive", checked)}
          />
        </div>
      </div>
    </DrawerPop>
  );
}
