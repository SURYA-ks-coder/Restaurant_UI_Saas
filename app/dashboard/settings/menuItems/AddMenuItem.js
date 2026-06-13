"use client";

import { message, Radio, Switch, Upload } from "antd";
import { UploadIcon } from "lucide-react";
import { useFormik } from "formik";
import { useEffect, useMemo, useState } from "react";
import * as Yup from "yup";
import {
  AntInput,
  AntSelect,
  AntTextArea,
  AntTimeSelect,
} from "@/components/ui/antd-components";
import DrawerPop from "@/components/ui/DrawerPop";
import { action, API, getAction } from "@/lib/API";
import { LocalStorageData } from "@/lib/LocalStoragekeyvalue";
import RadioButton from "@/components/ui/RadioButton";

const initialValues = {
  restaurantId: "",
  branchId: "",
  itemName: "",
  itemCode: "",
  barcode: "",
  categoryId: "",
  subCategoryId: "",
  description: "",
  dineInPrice: "",
  parcelPrice: "",
  onlinePrice: "",
  discountPrice: "",
  itemType: "veg",
  foodType: "",
  spicyLevel: "",
  stockEnabled: false,
  currentStock: "",
  minStockAlert: "",
  unitType: "",
  kitchenSection: "",
  prepTime: "",
  itemImage: null,
  gstPercentage: "",
  availabilityStatus: "available",
};

const optionalNumber = (label) =>
  Yup.number()
    .transform((value, originalValue) =>
      originalValue === "" || originalValue === null ? undefined : value,
    )
    .typeError(`${label} must be a number`)
    .min(0, `${label} cannot be negative`)
    .nullable()
    .notRequired();

const menuItemValidationSchema = Yup.object({
  itemName: Yup.string()
    .trim()
    .min(2, "Item name must be at least 2 characters")
    .max(100, "Item name must be 100 characters or less")
    .required("Item name is required"),
  itemCode: Yup.string()
    .trim()
    .max(40, "Item code must be 40 characters or less")
    .required("Item code is required"),
  barcode: Yup.string()
    .trim()
    .max(80, "Barcode must be 80 characters or less")
    .nullable()
    .notRequired(),
  categoryId: Yup.string().trim().required("Category is required"),
  subCategoryId: Yup.string().trim().nullable().notRequired(),
  description: Yup.string()
    .trim()
    .max(500, "Description must be 500 characters or less")
    .nullable()
    .notRequired(),
  dineInPrice: Yup.number()
    .typeError("Dine in price must be a number")
    .min(0, "Dine in price cannot be negative")
    .required("Dine in price is required"),
  parcelPrice: optionalNumber("Parcel price"),
  onlinePrice: optionalNumber("Swiggy/Zomato price"),
  discountPrice: optionalNumber("Discount price"),
  itemType: Yup.string()
    .oneOf(["veg", "non_veg", "egg"], "Select a valid item type")
    .required("Item type is required"),
  foodType: Yup.string().trim().nullable().notRequired(),
  spicyLevel: Yup.string().trim().nullable().notRequired(),
  stockEnabled: Yup.boolean(),
  currentStock: Yup.number().when("stockEnabled", {
    is: true,
    then: (schema) =>
      schema
        .typeError("Current stock must be a number")
        .min(0, "Current stock cannot be negative")
        .required("Current stock is required"),
    otherwise: () => optionalNumber("Current stock"),
  }),
  minStockAlert: Yup.number().when("stockEnabled", {
    is: true,
    then: (schema) =>
      schema
        .typeError("Minimum stock alert must be a number")
        .min(0, "Minimum stock alert cannot be negative")
        .required("Minimum stock alert is required"),
    otherwise: () => optionalNumber("Minimum stock alert"),
  }),
  unitType: Yup.string().when("stockEnabled", {
    is: true,
    then: (schema) => schema.trim().required("Unit type is required"),
    otherwise: (schema) => schema.trim().nullable().notRequired(),
  }),
  kitchenSection: Yup.string().trim().nullable().notRequired(),
  prepTime: optionalNumber("Prep time"),
  // itemImage: Yup.mixed()
  //   .nullable()
  //   .test("fileSize", "Image must be 2MB or less", (file) => {
  //     if (!file || typeof file === "string") return true;
  //     return file.size <= 2 * 1024 * 1024;
  //   })
  //   .test("fileType", "Upload a JPG or PNG image", (file) => {
  //     if (!file || typeof file === "string") return true;
  //     return ["image/jpeg", "image/png"].includes(file.type);
  //   }),
  gstPercentage: Yup.number()
    .typeError("GST must be a number")
    .oneOf([0, 5, 12, 18, 28], "Select a valid GST percentage")
    .required("GST is required"),
  availabilityStatus: Yup.string()
    .oneOf(["available", "out_of_stock"], "Select a valid availability status")
    .required("Availability status is required"),
});

const getId = (value) => value?._id || value || "";
const numberOrEmpty = (value) => (value || value === 0 ? value : "");
const toNumberOrNull = (value) => (value || value === 0 ? Number(value) : null);

const foodTypeOptions = [
  { label: "Starter", value: "starter" },
  { label: "Main", value: "main" },
  { label: "Dessert", value: "dessert" },
  { label: "Drink", value: "drink" },
];

const spicyLevelOptions = [
  { label: "Mild", value: "mild" },
  { label: "Medium", value: "medium" },
  { label: "Hot", value: "hot" },
  { label: "Extra Hot", value: "extra_hot" },
];

const unitTypeOptions = [
  { label: "Plate", value: "plate" },
  { label: "Bowl", value: "bowl" },
  { label: "Glass", value: "glass" },
  { label: "Piece", value: "piece" },
];

const kitchenSectionOptions = [
  { label: "Main Kitchen", value: "main_kitchen" },
  { label: "Grill", value: "grill" },
  { label: "Cold Station", value: "cold_station" },
];

function SectionTitle({ children }) {
  return (
    <div className="border-b border-border pb-2 pt-2 text-sm font-semibold text-accent">
      {children}
    </div>
  );
}

export default function AddMenuItem({
  open,
  onOpenChange,
  onCreated,
  updateId = null,
}) {
  const [show, setShow] = useState(open);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const isUpdate = Boolean(updateId);

  useEffect(() => {
    setShow(open);
  }, [open]);

  const [categoryData, setCategoryData] = useState([]);
  const [categoryDrawerOpen, setCategoryDrawerOpen] = useState(false);
  const [categoryId, setCategoryId] = useState(null);

  const formik = useFormik({
    initialValues,
    validationSchema: menuItemValidationSchema,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        const payload = {
          ...values,
          restaurantId: LocalStorageData.restaurantId,
          branchId: LocalStorageData.branchId,
          itemName: values.itemName.trim(),
          itemCode: values.itemCode.trim(),
          barcode: values.barcode.trim(),
          categoryId: values.categoryId,
          subCategoryId: values.subCategoryId || null,
          description: values.description.trim(),
          dineInPrice: Number(values.dineInPrice) || 0,
          parcelPrice: toNumberOrNull(values.parcelPrice),
          onlinePrice: toNumberOrNull(values.onlinePrice),
          discountPrice: toNumberOrNull(values.discountPrice),
          price: Number(values.dineInPrice) || 0,
          stockEnabled: values.stockEnabled,
          currentStock: values.stockEnabled
            ? Number(values.currentStock) || 0
            : null,
          minimumStock: values.stockEnabled
            ? Number(values.minStockAlert) || 0
            : null,
          spicyLevel: values.spicyLevel,
          unitType: values.stockEnabled ? values.unitType : "",
          prepTime: toNumberOrNull(values.prepTime),
          gstPercentage: Number(values.gstPercentage),
          itemImage:
            typeof values.itemImage === "string" ? values.itemImage : undefined,
          availabilityStatus: values.availabilityStatus,
          status: "active",
        };

        const result = await action(
          isUpdate
            ? `${API.UPDATE_MENU_ITEM}/${updateId}`
            : API.CREATE_MENU_ITEM,
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
              ? "Unable to update menu item"
              : "Unable to create menu item"),
        );
      } catch (error) {
        message.error(
          isUpdate
            ? "Unable to update menu item"
            : "Unable to create menu item",
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  const subCategoryOptions = useMemo(() => {
    return subCategories
      .filter((subCategory) => {
        const categoryId = getId(subCategory.categoryId);
        return (
          !formik.values.categoryId || categoryId === formik.values.categoryId
        );
      })
      .map((subCategory) => ({
        label: subCategory.subCategoryName,
        value: subCategory._id,
      }));
  }, [formik.values.categoryId, subCategories]);

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

  const getSubCategoryList = async () => {
    try {
      const result = await getAction(API.GET_SUB_CATEGORY_LIST, {});
      if (result?.statusCode === 200) {
        setSubCategories(result?.data || []);
      }
    } catch (error) {
      message.error("Unable to fetch subcategories");
    }
  };

  const getMenuItemDetails = async (id) => {
    try {
      const result = await getAction(`${API.GET_MENU_ITEM_BY_ID}/${id}`);
      if (result?.statusCode === 200) {
        const item = result?.data;

        if (item) {
          formik.setValues({
            restaurantId: item.restaurantId || "",
            branchId: item.branchId || "",
            itemName: item.itemName || item.name || "",
            itemCode: item.itemCode || "",
            barcode: item.barcode || "",
            categoryId: getId(item.categoryId),
            subCategoryId: getId(item.subCategoryId),
            description: item.description || "",
            dineInPrice: numberOrEmpty(item.prices.dineInPrice ?? item.price),
            parcelPrice: numberOrEmpty(item.prices.parcelPrice),
            onlinePrice: numberOrEmpty(item.prices.onlinePrice),
            discountPrice: numberOrEmpty(item.prices.discountPrice),
            itemType: item.itemType || "veg",
            foodType: item.foodType || "",
            spicyLevel: item.spicyLevel || "",
            stockEnabled: Boolean(item.stockEnabled),
            currentStock: numberOrEmpty(item.currentStock),
            minStockAlert: numberOrEmpty(item.minimumStock),
            unitType: item.unitType || "",
            kitchenSection: item.kitchenSection || "",
            prepTime: numberOrEmpty(item.prepTime),
            itemImage: item.itemImage || null,
            gstPercentage: numberOrEmpty(item.gstPercentage),
            availabilityStatus: item.availabilityStatus || "available",
            status: "active",
          });
        }
      }
    } catch (error) {
      message.error("Unable to fetch menu item details");
    }
  };

  useEffect(() => {
    if (!open) return;

    getCategoryList();
    getSubCategoryList();

    if (updateId) {
      getMenuItemDetails(updateId);
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
        isUpdate ? "Update Menu Item" : "Add Menu Item",
        isUpdate
          ? "Update this menu item for this restaurant branch."
          : "Create a menu item for this restaurant branch.",
      ]}
      handleSubmit={formik.handleSubmit}
      footerBtn={["Cancel", "Save"]}
      footerBtnDisabled={formik.isSubmitting}
      loadingButton={formik.isSubmitting}
      width={920}
    >
      <div className="flex-1 space-y-5 overflow-y-auto ">
        <SectionTitle>Basic Info</SectionTitle>
        <div className="grid gap-4 md:grid-cols-2">
          <AntInput
            label="Item Name"
            name="itemName"
            placeholder="Eg: Paneer Tikka"
            value={formik.values.itemName}
            error={getError("itemName")}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          <AntInput
            label="Item Code"
            name="itemCode"
            placeholder="Eg: ITM-001"
            value={formik.values.itemCode}
            error={getError("itemCode")}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          <AntInput
            label="Barcode"
            name="barcode"
            placeholder="Scan or type barcode"
            value={formik.values.barcode}
            error={getError("barcode")}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          <AntSelect
            label="Category"
            value={formik.values.categoryId || undefined}
            error={getError("categoryId")}
            options={categoryOptions}
            placeholder="Select category"
            onChange={(value) => {
              formik.setFieldValue("categoryId", value);
              formik.setFieldValue("subCategoryId", "");
            }}
            onBlur={() => formik.setFieldTouched("categoryId", true)}
          />
          <AntSelect
            label="Subcategory"
            value={formik.values.subCategoryId || undefined}
            error={getError("subCategoryId")}
            options={subCategoryOptions}
            placeholder="Select subcategory"
            allowClear
            onChange={(value) =>
              formik.setFieldValue("subCategoryId", value || "")
            }
            onBlur={() => formik.setFieldTouched("subCategoryId", true)}
          />
        </div>
        <AntTextArea
          label="Description"
          name="description"
          placeholder="Short description for this menu item"
          value={formik.values.description}
          error={getError("description")}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />

        <SectionTitle>Pricing</SectionTitle>
        <div className="grid gap-4 md:grid-cols-2">
          <AntInput
            label="Dine In Price"
            name="dineInPrice"
            type="number"
            min={0}
            value={formik.values.dineInPrice}
            error={getError("dineInPrice")}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          <AntInput
            label="Parcel Price"
            name="parcelPrice"
            type="number"
            min={0}
            placeholder="Defaults to dine in if blank"
            value={formik.values.parcelPrice}
            error={getError("parcelPrice")}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          <AntInput
            label="Swiggy/Zomato"
            name="onlinePrice"
            type="number"
            min={0}
            value={formik.values.onlinePrice}
            error={getError("onlinePrice")}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          <AntInput
            label="Discount Price"
            name="discountPrice"
            type="number"
            min={0}
            value={formik.values.discountPrice}
            error={getError("discountPrice")}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
        </div>

        <SectionTitle>Item Type</SectionTitle>
        <div className="grid gap-4 md:grid-cols-3">
          {/* <label className="block">
            <span className="mb-2 block text-sm font-medium">
              Veg / Non-Veg
            </span>
            <Radio.Group
              value={formik.values.itemType}
              onChange={(event) =>
                formik.setFieldValue("itemType", event.target.value)
              }
              onBlur={() => formik.setFieldTouched("itemType", true)}
            >
              <Radio value="veg">Veg</Radio>
              <Radio value="non_veg">Non-Veg</Radio>
              <Radio value="egg">Egg</Radio>
            </Radio.Group>
            {getError("itemType") && (
              <p className="mt-1 text-xs text-destructive">
                {getError("itemType")}
              </p>
            )}
          </label> */}
          <RadioButton
            label="Veg / Non-Veg"
            options={[
              { value: "veg", label: "Veg" },
              { value: "non_veg", label: "Non-Veg" },
              // { value: "egg", label: "Egg" },
            ]}
            // wrapperClassName="col-span-2"
            value={formik.values.itemType}
            change={(event) => formik.setFieldValue("itemType", event)}
            onBlur={() => formik.setFieldTouched("itemType", true)}
            error={getError("itemType")}
          />
          <AntSelect
            label="Food Type"
            value={formik.values.foodType || undefined}
            options={foodTypeOptions}
            placeholder="Select food type"
            allowClear
            onChange={(value) => formik.setFieldValue("foodType", value || "")}
          />
          <AntSelect
            label="Spicy Level"
            value={formik.values.spicyLevel || undefined}
            options={spicyLevelOptions}
            placeholder="Select spicy level"
            allowClear
            onChange={(value) =>
              formik.setFieldValue("spicyLevel", value || "")
            }
          />
        </div>

        <SectionTitle>Stock</SectionTitle>
        <div className="grid gap-4 md:grid-cols-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium">
              Stock Enabled
            </span>
            <Switch
              checked={formik.values.stockEnabled}
              onChange={(checked) =>
                formik.setFieldValue("stockEnabled", checked)
              }
            />
          </label>
          <AntInput
            label="Current Stock"
            name="currentStock"
            type="number"
            min={0}
            disabled={!formik.values.stockEnabled}
            value={formik.values.currentStock}
            error={getError("currentStock")}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          <AntInput
            label="Min Stock Alert"
            name="minStockAlert"
            type="number"
            min={0}
            disabled={!formik.values.stockEnabled}
            value={formik.values.minStockAlert}
            error={getError("minStockAlert")}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          <AntSelect
            label="Unit Type"
            value={formik.values.unitType || undefined}
            error={getError("unitType")}
            options={unitTypeOptions}
            disabled={!formik.values.stockEnabled}
            placeholder="Select unit"
            onChange={(value) => formik.setFieldValue("unitType", value)}
            onBlur={() => formik.setFieldTouched("unitType", true)}
          />
        </div>

        <SectionTitle>Kitchen</SectionTitle>
        <div className="grid gap-4 md:grid-cols-2">
          <AntSelect
            label="Kitchen Section"
            value={formik.values.kitchenSection || undefined}
            options={kitchenSectionOptions}
            placeholder="Select kitchen section"
            allowClear
            onChange={(value) =>
              formik.setFieldValue("kitchenSection", value || "")
            }
          />
          <AntInput
            label="Prep Time (min)"
            name="prepTime"
            // type="number"
            // min={0}
            value={formik.values.prepTime}
            error={getError("prepTime")}
            onChange={formik.handleChange}
            // onBlur={formik.handleBlur}
          />
        </div>

        <SectionTitle>Image & Tax</SectionTitle>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Item Image</span>
            <Upload
              accept=".jpg,.jpeg,.png"
              maxCount={1}
              beforeUpload={(file) => {
                formik.setFieldTouched("itemImage", true);
                formik.setFieldValue("itemImage", file);
                return false;
              }}
              onRemove={() => formik.setFieldValue("itemImage", null)}
            >
              <button
                type="button"
                className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-muted/40 px-3 text-sm text-foreground hover:bg-muted/60"
              >
                <UploadIcon size={16} />
                Upload Image
              </button>
            </Upload>
            {getError("itemImage") && (
              <p className="mt-1 text-xs text-destructive">
                {getError("itemImage")}
              </p>
            )}
          </label>
          <AntSelect
            label="GST %"
            value={
              formik.values.gstPercentage === ""
                ? undefined
                : Number(formik.values.gstPercentage)
            }
            error={getError("gstPercentage")}
            options={[
              { label: "0%", value: 0 },
              { label: "5%", value: 5 },
              { label: "12%", value: 12 },
              { label: "18%", value: 18 },
              { label: "28%", value: 28 },
            ]}
            placeholder="Select GST"
            onChange={(value) => formik.setFieldValue("gstPercentage", value)}
            onBlur={() => formik.setFieldTouched("gstPercentage", true)}
          />
        </div>

        <SectionTitle>Status</SectionTitle>
        <AntSelect
          label="Status"
          value={formik.values.availabilityStatus}
          error={getError("availabilityStatus")}
          options={[
            { label: "Available", value: "available" },
            { label: "Out of Stock", value: "out_of_stock" },
          ]}
          onChange={(value) =>
            formik.setFieldValue("availabilityStatus", value)
          }
          onBlur={() => formik.setFieldTouched("availabilityStatus", true)}
        />
      </div>
    </DrawerPop>
  );
}
