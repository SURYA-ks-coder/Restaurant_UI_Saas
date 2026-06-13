"use client";

import React, { useEffect, useState } from "react";
import { message } from "antd";
import { useFormik } from "formik";
import * as yup from "yup";
import DrawerPop from "@/components/ui/DrawerPop";
import { AntInput, AntPasswordInput } from "@/components/ui/AntInput";
import { AntSelect } from "@/components/ui/AntSelect";
import AntTextArea from "@/components/ui/AntTextArea";
import { action, API, getAction } from "@/lib/API";

const managerInitialValues = {
  restaurantId: "",
  branchIds: [],
  defaultBranchId: "",
  name: "",
  ownerName: "",
  email: "",
  phone: "",
  password: "",
  role: "manager",
  permissions: "",
  status: "active",
};

const managerValidationSchema = yup.object({
  name: yup.string().trim().required("Manager name is required"),
  ownerName: yup.string().trim(),
  email: yup
    .string()
    .trim()
    .email("Enter a valid email")
    .required("Email is required"),
  phone: yup.string().trim(),
  password: yup.string(),
  role: yup
    .string()
    .oneOf(
      ["owner", "manager", "cashier", "chef", "waiter", "inventory_staff"],
      "Select a valid role",
    )
    .required("Role is required"),
  status: yup
    .string()
    .oneOf(["active", "inactive", "blocked"], "Select a valid status")
    .required("Status is required"),
});

const getStoredValue = (key) => {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(key) || "";
};

const getEntityId = (item) =>
  item?._id || item?.id || item?.code || item?.email;

export default function AddManager({
  open,
  onOpenChange,
  onSaved,
  updateId,
  branches,
  managers,
}) {
  const [show, setShow] = useState(open);
  const isUpdate = Boolean(updateId);

  useEffect(() => {
    setShow(open);
  }, [open]);

  const formik = useFormik({
    initialValues: managerInitialValues,
    validationSchema: managerValidationSchema,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      if (!isUpdate && !values.password) {
        formik.setFieldTouched("password", true);
        formik.setFieldError("password", "Password is required");
        setSubmitting(false);
        return;
      }

      try {
        const payload = {
          ...values,
          restaurantId: values.restaurantId || getStoredValue("restaurantId"),
          name: values.name.trim(),
          ownerName: values.ownerName.trim(),
          email: values.email.trim().toLowerCase(),
          phone: values.phone.trim(),
          permissions: values.permissions
            ? values.permissions
                .split(",")
                .map((permission) => permission.trim())
                .filter(Boolean)
            : [],
        };

        if (isUpdate && !payload.password) {
          delete payload.password;
        }

        const result = await action(
          isUpdate ? `${API.UPDATE_STAFF}/${updateId}` : API.CREATE_STAFF,
          payload,
          isUpdate ? "PATCH" : "POST",
        );

        if (result?.statusCode === 200 || result?.statusCode === 201) {
          message.success(
            result?.message || (isUpdate ? "Manager updated" : "Manager added"),
          );
          resetForm();
          onSaved?.();
          onOpenChange(false);
          return;
        } else {
          message.error(
            result?.message ||
              (isUpdate ? "Unable to update manager" : "Unable to add manager"),
          );
        }
      } catch (error) {
        message.error(
          isUpdate ? "Unable to update manager" : "Unable to add manager",
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

  const getManagerDetails = async (id) => {
    try {
      const result = await getAction(`${API.GET_USER_BY_ID}/${id}`);
      const manager = result?.data;
      if (
        (result?.statusCode === 200 || result?.statusCode === 201) &&
        manager
      ) {
        formik.setValues({
          restaurantId: manager.restaurantId || getStoredValue("restaurantId"),
          branchIds: Array.isArray(manager.branchIds) ? manager.branchIds : [],
          defaultBranchId: manager.defaultBranchId || "",
          name: manager.name || "",
          ownerName: manager.ownerName || "",
          email: manager.email || "",
          phone: manager.phone || "",
          password: "",
          role: manager.role || "manager",
          permissions: Array.isArray(manager.permissions)
            ? manager.permissions.join(", ")
            : "",
          status: manager.status || "active",
        });
      }
    } catch (error) {
      message.error("Unable to fetch manager details");
    }
  };

  useEffect(() => {
    if (!open) return;

    if (updateId && String(updateId).startsWith("sample-")) {
      const manager = managers.find((item) => getEntityId(item) === updateId);
      formik.setValues({
        restaurantId: manager?.restaurantId || getStoredValue("restaurantId"),
        branchIds: Array.isArray(manager?.branchIds) ? manager.branchIds : [],
        defaultBranchId: manager?.defaultBranchId || "",
        name: manager?.name || "",
        ownerName: manager?.ownerName || "",
        email: manager?.email || "",
        phone: manager?.phone || "",
        password: "",
        role: manager?.role || "manager",
        permissions: Array.isArray(manager?.permissions)
          ? manager.permissions.join(", ")
          : "",
        status: manager?.status || "active",
      });
      return;
    }

    if (updateId) {
      getManagerDetails(updateId);
      return;
    }

    formik.setValues({
      ...managerInitialValues,
      restaurantId: getStoredValue("restaurantId"),
    });
  }, [open, updateId]);

  const branchOptions = branches.map((branch) => ({
    label: branch.name,
    value: getEntityId(branch),
  }));

  return (
    <DrawerPop
      open={show}
      close={closeDrawer}
      header={[
        isUpdate ? "Update Manager" : "Add Manager",
        isUpdate
          ? "Update manager profile, role, access, and branch assignment."
          : "Create manager access for one or more branches.",
      ]}
      handleSubmit={formik.handleSubmit}
      footerBtn={["Cancel", "Save"]}
      footerBtnDisabled={formik.isSubmitting}
      loadingButton={formik.isSubmitting}
    >
      <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
        <div className="grid gap-4 md:grid-cols-2">
          <AntInput
            label="Name"
            name="name"
            placeholder="Manager name"
            value={formik.values.name}
            error={getError("name")}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {/* <AntInput
            label="Owner Name"
            name="ownerName"
            placeholder="Optional owner name"
            value={formik.values.ownerName}
            error={getError("ownerName")}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          /> */}
          <AntInput
            label="Email"
            name="email"
            type="email"
            placeholder="manager@example.com"
            value={formik.values.email}
            error={getError("email")}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          <AntInput
            label="Phone"
            name="phone"
            placeholder="+91 98765 43210"
            value={formik.values.phone}
            error={getError("phone")}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          <AntPasswordInput
            label={isUpdate ? "Password (optional)" : "Password"}
            name="password"
            placeholder={
              isUpdate
                ? "Leave blank to keep current password"
                : "Create password"
            }
            value={formik.values.password}
            error={getError("password")}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          <AntSelect
            label="Role"
            value={formik.values.role}
            error={getError("role")}
            options={[
              { label: "Manager", value: "manager" },
              { label: "Cashier", value: "cashier" },
              { label: "Chef", value: "chef" },
              { label: "Waiter", value: "waiter" },
              { label: "Inventory Staff", value: "inventory_staff" },
              { label: "Owner", value: "owner" },
            ]}
            onChange={(value) => formik.setFieldValue("role", value)}
            onBlur={() => formik.setFieldTouched("role", true)}
          />
          <AntSelect
            label="Branch Access"
            mode="multiple"
            value={formik.values.branchIds}
            error={getError("branchIds")}
            options={branchOptions}
            placeholder="Select branches"
            onChange={(value) => formik.setFieldValue("branchIds", value)}
            onBlur={() => formik.setFieldTouched("branchIds", true)}
          />
          <AntSelect
            label="Default Branch"
            value={formik.values.defaultBranchId || undefined}
            allowClear
            options={branchOptions}
            placeholder="Select default branch"
            onChange={(value) =>
              formik.setFieldValue("defaultBranchId", value || "")
            }
            onBlur={() => formik.setFieldTouched("defaultBranchId", true)}
          />
          <AntSelect
            label="Status"
            value={formik.values.status}
            error={getError("status")}
            options={[
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
              { label: "Blocked", value: "blocked" },
            ]}
            onChange={(value) => formik.setFieldValue("status", value)}
            onBlur={() => formik.setFieldTouched("status", true)}
          />
        </div>

        <AntTextArea
          label="Permissions"
          name="permissions"
          placeholder="Comma separated permissions, eg: orders.read, staff.manage"
          value={formik.values.permissions}
          error={getError("permissions")}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
      </div>
    </DrawerPop>
  );
}
