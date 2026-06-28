"use client";

import { message } from "@/lib/message";

import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { AntInput } from "@/components/ui/AntInput";
import { AntSelect } from "@/components/ui/AntSelect";
import AntTextArea from "@/components/ui/AntTextArea";
import DrawerPop from "@/components/ui/DrawerPop";
import { action, API, getAction } from "@/lib/API";

const initialValues = {
  designationName: "",
  description: "",
  status: "active",
};

const validationSchema = Yup.object({
  designationName: Yup.string()
    .trim()
    .min(2, "Designation name must be at least 2 characters")
    .max(100, "Designation name must be 100 characters or less")
    .required("Designation name is required"),
  description: Yup.string().trim().max(300, "Max 300 characters").nullable(),
  status: Yup.string().oneOf(["active", "inactive"]).required(),
});

export default function AddDesignation({
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
        const payload = {
          designationName: values.designationName.trim(),
          description: values.description?.trim() || undefined,
          status: values.status,
        };

        const result = await action(
          isUpdate
            ? `${API.UPDATE_DESIGNATION}/${updateId}`
            : API.CREATE_DESIGNATION,
          payload,
          isUpdate ? "PATCH" : "POST",
        );

        if (result?.statusCode === 200 || result?.statusCode === 201) {
          message.success(
            result?.message ||
              (isUpdate ? "Designation updated" : "Designation added"),
          );
          resetForm();
          onCreated?.(result?.data || payload);
          onOpenChange(false);
          return;
        }

        message.error(
          result?.message ||
            (isUpdate
              ? "Unable to update designation"
              : "Unable to add designation"),
        );
      } catch {
        message.error(
          isUpdate
            ? "Unable to update designation"
            : "Unable to add designation",
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

  const fetchDesignationDetails = async (id) => {
    try {
      const result = await getAction(`${API.GET_DESIGNATION_BY_ID}/${id}`);
      if (result?.statusCode === 200 && result.data) {
        const d = result.data;
        formik.setValues({
          designationName: d.designationName || d.name || "",
          description: d.description || "",
          status: d.status || "active",
        });
      }
    } catch {
      message.error("Unable to fetch designation details");
    }
  };

  useEffect(() => {
    if (!open) return;
    if (updateId) {
      fetchDesignationDetails(updateId);
    } else {
      formik.resetForm();
    }
  }, [open, updateId]);

  return (
    <DrawerPop
      open={show}
      close={closeDrawer}
      header={[
        isUpdate ? "Update Designation" : "Add Designation",
        isUpdate
          ? "Update designation details."
          : "Create a new staff designation.",
      ]}
      handleSubmit={formik.handleSubmit}
      footerBtn={["Cancel", "Save"]}
      footerBtnDisabled={formik.isSubmitting}
      loadingButton={formik.isSubmitting}
      width={600}
    >
      <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
        <AntInput
          label="Designation Name *"
          name="designationName"
          placeholder="Eg: Head Chef, Senior Waiter, Supervisor"
          value={formik.values.designationName}
          error={getError("designationName")}
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
        <AntTextArea
          label="Description"
          name="description"
          placeholder="Optional notes about this designation"
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
