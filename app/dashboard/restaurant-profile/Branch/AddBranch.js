import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { action, getAction, API } from "@/lib/API";
import DrawerPop from "@/components/ui/DrawerPop";
import { AntInput } from "@/components/ui/AntInput";
import { AntSelect } from "@/components/ui/AntSelect";
import AntTextArea from "@/components/ui/AntTextArea";
import { LocalStorageData } from "@/lib/LocalStoragekeyvalue";

export default function AddBranch({
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

  const getEntityId = (item) =>
    item?._id || item?.id || item?.code || item?.email;

  const getStoredValue = (key) => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem(key) || "";
  };

  const branchInitialValues = {
    restaurantId: getStoredValue("restaurantId"),
    branchName: "",
    branchCode: "",
    code: "",
    phone: "",
    address: "",
    manager: "",
    isDefault: false,
    status: "active",
  };

  const branchValidationSchema = yup.object({
    branchName: yup.string().trim().required("Branch name is required"),
    branchCode: yup.string().trim(),
    code: yup.string().trim().required("Code is required"),
    phone: yup.string().trim(),
    address: yup.string().trim().required("Address is required"),
    manager: yup.string().trim(),
    status: yup
      .string()
      .oneOf(["active", "inactive"], "Select a valid status")
      .required("Status is required"),
  });

  const formik = useFormik({
    initialValues: branchInitialValues,
    validationSchema: branchValidationSchema,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        const payload = {
          ...values,
          restaurantId: LocalStorageData.restaurantId,
          branchName: values.branchName.trim(),
          branchCode: values.branchCode.trim().toUpperCase(),
          code: values.code.trim().toUpperCase(),
          phone: values.phone.trim(),
          address: values.address.trim(),
          manager: null, // values.manager ,
          isDefault: Boolean(values.isDefault),
        };

        const result = await action(
          isUpdate ? `${API.UPDATE_BRANCH}/${updateId}` : API.CREATE_BRANCH,
          payload,
          isUpdate ? "PATCH" : "POST",
        );

        if (result?.statusCode === 200 || result?.statusCode === 201) {
          message.success(
            result?.message || (isUpdate ? "Branch updated" : "Branch added"),
          );
          resetForm();
          onSaved?.();
          onOpenChange(false);
          return;
        }

        message.error(
          result?.message ||
            (isUpdate ? "Unable to update branch" : "Unable to add branch"),
        );
      } catch (error) {
        message.error(
          isUpdate ? "Unable to update branch" : "Unable to add branch",
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

  const getBranchDetails = async (id) => {
    try {
      const result = await getAction(`${API.GET_BRANCH_BY_ID}/${id}`);
      const branch = result?.data;
      if (
        (result?.statusCode === 200 || result?.statusCode === 201) &&
        branch
      ) {
        formik.setValues({
          restaurantId: getStoredValue("restaurantId"),
          branchName: branch.branchName || branch.name || "",
          branchCode: branch.branchCode || branch.code || "",
          code: branch.code || branch.branchCode || "",
          phone: branch.phone || "",
          address: branch.address || "",
          manager:
            typeof branch.manager === "object"
              ? getEntityId(branch.manager)
              : branch.manager || "",
          isDefault: Boolean(branch.isDefault),
          status: branch.status || "active",
        });
      }
    } catch (error) {
      message.error("Unable to fetch branch details");
    }
  };

  useEffect(() => {
    if (!open) return;

    if (updateId && String(updateId).startsWith("sample-")) {
      const branch = branches.find((item) => getEntityId(item) === updateId);
      formik.setValues({
        restaurantId: getStoredValue("restaurantId"),
        branchName: branch?.branchName || branch?.name || "",
        branchCode: branch?.branchCode || branch?.code || "",
        code: branch?.code || branch?.branchCode || "",
        phone: branch?.phone || "",
        address: branch?.address || "",
        manager: branch?.managerId || "",
        isDefault: Boolean(branch?.isDefault),
        status: branch?.status || "active",
      });
      return;
    }

    if (updateId) {
      getBranchDetails(updateId);
      return;
    }

    formik.setValues({
      ...branchInitialValues,
      restaurantId: getStoredValue("restaurantId"),
    });
  }, [open, updateId]);

  return (
    <DrawerPop
      open={show}
      close={closeDrawer}
      header={[
        isUpdate ? "Update Branch" : "Add Branch",
        isUpdate
          ? "Update branch contact, code, status, and manager assignment."
          : "Create a new restaurant branch with manager assignment.",
      ]}
      handleSubmit={formik.handleSubmit}
      footerBtn={["Cancel", "Save"]}
      footerBtnDisabled={formik.isSubmitting}
      loadingButton={formik.isSubmitting}
    >
      <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
        <div className="grid gap-4 md:grid-cols-2">
          <AntInput
            label="Branch Name"
            name="branchName"
            placeholder="Eg: Indiranagar Flagship"
            value={formik.values.branchName}
            error={getError("branchName")}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          <AntInput
            label="Code"
            name="code"
            placeholder="Eg: BLR-01"
            value={formik.values.code}
            error={getError("code")}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          <AntInput
            label="Branch Code"
            name="branchCode"
            placeholder="Eg: BLR-01"
            value={formik.values.branchCode}
            error={getError("branchCode")}
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
          <AntSelect
            label="Manager"
            value={formik.values.manager || undefined}
            error={getError("manager")}
            allowClear
            showSearch
            optionFilterProp="label"
            placeholder="Select manager"
            options={managers.map((manager) => ({
              label: manager.name,
              value: getEntityId(manager),
            }))}
            onChange={(value) => formik.setFieldValue("manager", value || "")}
            onBlur={() => formik.setFieldTouched("manager", true)}
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

        <AntSelect
          label="Default Branch"
          value={formik.values.isDefault}
          options={[
            { label: "No", value: false },
            { label: "Yes", value: true },
          ]}
          onChange={(value) => formik.setFieldValue("isDefault", value)}
        />

        <AntTextArea
          label="Address"
          name="address"
          placeholder="Full branch address"
          value={formik.values.address}
          error={getError("address")}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
      </div>
    </DrawerPop>
  );
}
