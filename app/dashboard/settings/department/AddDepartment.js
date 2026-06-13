"use client";

import { useEffect, useState } from "react";
import { message } from "antd";
import { useFormik } from "formik";
import * as Yup from "yup";
import { AntInput } from "@/components/ui/AntInput";
import { AntSelect } from "@/components/ui/AntSelect";
import AntTextArea from "@/components/ui/AntTextArea";
import DrawerPop from "@/components/ui/DrawerPop";
import { action, API, getAction } from "@/lib/API";

const initialValues = {
  departmentName: "",
  description: "",
  status: "active",
};

const validationSchema = Yup.object({
  departmentName: Yup.string()
    .trim()
    .min(2, "Department name must be at least 2 characters")
    .max(100, "Department name must be 100 characters or less")
    .required("Department name is required"),
  description: Yup.string().trim().max(300, "Max 300 characters").nullable(),
  status: Yup.string().oneOf(["active", "inactive"]).required(),
});

export default function AddDepartment({
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
          departmentName: values.departmentName.trim(),
          description: values.description?.trim() || undefined,
          status: values.status,
        };

        const result = await action(
          isUpdate
            ? `${API.UPDATE_DEPARTMENT}/${updateId}`
            : API.CREATE_DEPARTMENT,
          payload,
          isUpdate ? "PATCH" : "POST",
        );

        if (result?.statusCode === 200 || result?.statusCode === 201) {
          message.success(
            result?.message ||
              (isUpdate ? "Department updated" : "Department added"),
          );
          resetForm();
          onCreated?.(result?.data || payload);
          onOpenChange(false);
          return;
        }

        message.error(
          result?.message ||
            (isUpdate
              ? "Unable to update department"
              : "Unable to add department"),
        );
      } catch {
        message.error(
          isUpdate ? "Unable to update department" : "Unable to add department",
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

  const fetchDepartmentDetails = async (id) => {
    try {
      const result = await getAction(`${API.GET_DEPARTMENT_BY_ID}/${id}`);
      if (result?.statusCode === 200 && result.data) {
        const d = result.data;
        formik.setValues({
          departmentName: d.departmentName || d.name || "",
          description: d.description || "",
          status: d.status || "active",
        });
      }
    } catch {
      message.error("Unable to fetch department details");
    }
  };

  useEffect(() => {
    if (!open) return;
    if (updateId) {
      fetchDepartmentDetails(updateId);
    } else {
      formik.resetForm();
    }
  }, [open, updateId]);

  return (
    <DrawerPop
      open={show}
      close={closeDrawer}
      header={[
        isUpdate ? "Update Department" : "Add Department",
        isUpdate
          ? "Update department details."
          : "Create a new department for staff assignment.",
      ]}
      handleSubmit={formik.handleSubmit}
      footerBtn={["Cancel", "Save"]}
      footerBtnDisabled={formik.isSubmitting}
      loadingButton={formik.isSubmitting}
      width={600}
    >
      <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
        <AntInput
          label="Department Name *"
          name="departmentName"
          placeholder="Eg: Kitchen, Floor, Bar"
          value={formik.values.departmentName}
          error={getError("departmentName")}
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
          placeholder="Optional notes about this department"
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
