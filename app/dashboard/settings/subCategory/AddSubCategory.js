"use client";

import { message } from "antd";
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
  categoryId: "",
  subCategoryName: "",
  displayOrder: 0,
  status: "active",
  description: "",
};

const subCategoryValidationSchema = Yup.object({
  categoryId: Yup.string().trim().required("Category is required"),
  subCategoryName: Yup.string()
    .trim()
    .min(2, "Subcategory name must be at least 2 characters")
    .max(80, "Subcategory name must be 80 characters or less")
    .required("Subcategory name is required"),
  displayOrder: Yup.number()
    .typeError("Display order must be a number")
    .min(0, "Display order cannot be negative")
    .integer("Display order must be a whole number")
    .required("Display order is required"),
  status: Yup.string()
    .oneOf(["active", "inactive"], "Select a valid status")
    .required("Status is required"),
  description: Yup.string()
    .trim()
    .max(300, "Description must be 300 characters or less")
    .nullable()
    .notRequired(),
});

export default function AddSubCategory({
  open,
  onOpenChange,
  onCreated,
  updateId = null,
}) {
  const [show, setShow] = useState(open);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const isUpdate = Boolean(updateId);

  useEffect(() => {
    setShow(open);
  }, [open]);

  const formik = useFormik({
    initialValues,
    validationSchema: subCategoryValidationSchema,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        const payload = {
          ...values,
          restaurantId: LocalStorageData.restaurantId,
          branchId: LocalStorageData.branchId,
          categoryId: values.categoryId,
          subCategoryName: values.subCategoryName.trim(),
          description: values.description.trim(),
          displayOrder: Number(values.displayOrder) || 0,
        };

        const result = await action(
          isUpdate
            ? `${API.UPDATE_SUB_CATEGORY}/${updateId}`
            : API.CREATE_SUB_CATEGORY,
          payload,
          isUpdate ? "PATCH" : "POST",
        );

        if (result?.statusCode === 200 || result?.statusCode === 201) {
          message.success(result?.message);
          resetForm();
          onCreated?.();
          onOpenChange(false);
          return;
        }

        message.error(
          result?.message ||
            (isUpdate
              ? "Unable to update subcategory"
              : "Unable to create subcategory"),
        );
      } catch (error) {
        message.error(
          isUpdate
            ? "Unable to update subcategory"
            : "Unable to create subcategory",
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

  const getCategoryList = async () => {
    try {
      const result = await getAction(API.GET_CATEGORY_LIST, {});
      if (result?.statusCode === 200) {
        setCategoryOptions(
          (result?.data || []).map((category) => ({
            label: category.categoryName,
            value: category._id,
          })),
        );
      }
    } catch (error) {
      message.error("Unable to fetch categories");
    }
  };

  const getSubCategoryDetails = async (id) => {
    try {
      const result = await getAction(`${API.GET_SUB_CATEGORY_BY_ID}/${id}`);
      if (result?.statusCode === 200) {
        const subCategory = result?.data;

        if (subCategory) {
          formik.setValues({
            restaurantId: subCategory?.restaurantId || "",
            branchId: subCategory?.branchId || "",
            categoryId: subCategory?.categoryId?._id,
            subCategoryName: subCategory?.subCategoryName || "",
            displayOrder: subCategory?.displayOrder || 0,
            status: subCategory?.status,
            description: subCategory?.description || "",
          });
        }
      }
    } catch (error) {
      message.error("Unable to fetch subcategory details");
    }
  };

  useEffect(() => {
    getCategoryList();

    if (updateId) {
      getSubCategoryDetails(updateId);
      return;
    }
  }, [updateId]);

  return (
    <DrawerPop
      open={show}
      close={() => {
        closeDrawer();
      }}
      header={[
        isUpdate ? "Update SubCategory" : "Add SubCategory",
        isUpdate
          ? "Update this menu subcategory for this restaurant branch."
          : "Create a menu subcategory for this restaurant branch.",
      ]}
      handleSubmit={formik.handleSubmit}
      footerBtn={["Cancel", "Save"]}
      footerBtnDisabled={formik.isSubmitting}
      loadingButton={formik.isSubmitting}
    >
      <div className="flex-1 space-y-5 overflow-y-auto">
        <AntSelect
          label="Category"
          value={formik.values.categoryId || undefined}
          error={getError("categoryId")}
          options={categoryOptions}
          placeholder="Select category"
          onChange={(value) => formik.setFieldValue("categoryId", value)}
          onBlur={() => formik.setFieldTouched("categoryId", true)}
        />

        <AntInput
          label="SubCategory Name"
          name="subCategoryName"
          placeholder="Eg: Veg Starters"
          value={formik.values.subCategoryName}
          error={getError("subCategoryName")}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <AntInput
            label="Display Order"
            name="displayOrder"
            type="number"
            min={0}
            value={formik.values.displayOrder}
            error={getError("displayOrder")}
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
          label="Description"
          name="description"
          placeholder="Short description for this subcategory"
          value={formik.values.description}
          error={getError("description")}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
      </div>
    </DrawerPop>
  );
}
