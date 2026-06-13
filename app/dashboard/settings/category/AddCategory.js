"use client";

import { message } from "antd";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  AntInput,
  AntSelect,
  AntTextArea,
} from "@/components/ui/antd-components";
import ButtonClick from "@/components/ui/ButtonClick";
import DrawerPop from "@/components/ui/DrawerPop";

import { action, API, getAction } from "@/lib/API";
import { LocalStorageData } from "@/lib/LocalStoragekeyvalue";
import { useEffect, useState } from "react";

const initialValues = {
  restaurantId: "",
  branchId: "",
  categoryName: "",
  image: "",
  displayOrder: 0,
  status: "active",
  description: "",
};

const objectIdValidation = /^[a-f\d]{24}$/i;

const categoryValidationSchema = Yup.object({
  // restaurantId: Yup.string()
  //   .trim()
  //   .matches(objectIdValidation, "Enter a valid restaurant ObjectId")
  //   .required("Restaurant ID is required"),
  // branchId: Yup.string()
  //   .trim()
  //   .matches(objectIdValidation, "Enter a valid branch ObjectId")
  //   .required("Branch ID is required"),
  categoryName: Yup.string()
    .trim()
    .min(2, "Category name must be at least 2 characters")
    .max(80, "Category name must be 80 characters or less")
    .required("Category name is required"),
  // image: Yup.string()
  //   .trim()
  //   .url("Enter a valid image URL")
  //   .nullable()
  //   .notRequired(),
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

export default function AddCategory({
  open,
  onOpenChange,
  onCreated,
  updateId = null,
}) {
  const [show, setShow] = useState(open);

  useEffect(() => {
    setShow(open);
  }, [open]);
  const isUpdate = Boolean(updateId);

  const formik = useFormik({
    initialValues,
    validationSchema: categoryValidationSchema,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        const payload = {
          ...values,
          restaurantId: LocalStorageData.restaurantId,
          branchId: LocalStorageData.branchId,
          categoryName: values.categoryName.trim(),
          image: values.image.trim(),
          description: values.description.trim(),
          displayOrder: Number(values.displayOrder) || 0,
        };

        const result = await action(
          isUpdate ? `${API.UPDATE_CATEGORY}/${updateId}` : API.CREATE_CATEGORY,
          payload,
          isUpdate ? "PATCH" : "POST",
        );

        if (result?.statusCode === 200 || result?.statusCode === 201) {
          message.success(result?.message);
          resetForm();
          onCreated?.();
          onOpenChange(false);
          return;
        } else {
          message.error(
            result?.message ||
              (isUpdate
                ? "Unable to update category"
                : "Unable to create category"),
          );
        }
      } catch (error) {
        message.error(
          isUpdate ? "Unable to update category" : "Unable to create category",
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

  const getCategoryDetails = async (id) => {
    try {
      const result = await getAction(`${API.GET_CATEGORY_BY_ID}/${id}`);
      if (result?.statusCode === 200) {
        const category = result?.data;

        if (category) {
          formik.setValues({
            restaurantId: category.restaurantId || "",
            branchId: category.branchId || "",
            categoryName: category.categoryName || "",
            image: category.image || "",
            displayOrder: category.displayOrder || 0,
            status: category.status || "active",
            description: category.description || "",
          });
        }
      }
    } catch (error) {
      message.error("Unable to fetch category details");
    }
  };

  useEffect(() => {
    if (!open) return;

    if (updateId) {
      getCategoryDetails(updateId);
      return;
    }

    formik.resetForm();
  }, [open, updateId]);
  {
    /* <DrawerHeader>
            <DrawerTitle>
              {isUpdate ? "Update Category" : "Add Category"}
            </DrawerTitle>
            <DrawerDescription>
              {isUpdate
                ? "Update this menu category for this restaurant branch."
                : "Create a menu category for this restaurant branch."}
            </DrawerDescription>
          </DrawerHeader> */
  }
  return (
    <DrawerPop
      open={show}
      close={(nextOpen) => {
        closeDrawer();
      }}
      header={[
        isUpdate ? "Update Category" : "Add Category",
        isUpdate
          ? "Update this menu category for this restaurant branch."
          : "Create a menu category for this restaurant branch.",
      ]}
      handleSubmit={formik.handleSubmit}
      footerBtn={["Cancel", "Save"]}
      footerBtnDisabled={formik.isSubmitting}
      loadingButton={formik.isSubmitting}
    >
      <div className="flex-1 space-y-5 overflow-y-auto">
        <div className="grid gap-4 md:grid-cols-2">
          {/* <AntInput
                label="Restaurant ID"
                name="restaurantId"
                placeholder="Restaurant ObjectId"
                value={formik.values.restaurantId}
                error={getError("restaurantId")}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              /> */}
          {/* <AntInput
              label="Branch ID"
              name="branchId"
              placeholder="Branch ObjectId"
              value={formik.values.branchId}
              error={getError("branchId")}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            /> */}
        </div>

        <AntInput
          label="Category Name"
          name="categoryName"
          placeholder="Eg: Starters"
          value={formik.values.categoryName}
          error={getError("categoryName")}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />

        <AntInput
          label="Image URL"
          name="image"
          placeholder="https://example.com/category.jpg"
          value={formik.values.image}
          error={getError("image")}
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
          placeholder="Short description for this category"
          value={formik.values.description}
          error={getError("description")}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
      </div>
    </DrawerPop>
  );
}
