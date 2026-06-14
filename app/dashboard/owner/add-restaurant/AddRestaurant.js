"use client";

import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { message } from "antd";
import { fileUpload, API } from "@/lib/API";
import DrawerPop from "@/components/ui/DrawerPop";
import { AntInput, AntPasswordInput } from "@/components/ui/AntInput";
import { AntSelect } from "@/components/ui/AntSelect";

export default function AddRestaurant({ open, onOpenChange, onCreated, updateId }) {
  const [show, setShow] = useState(open);
  const isUpdate = Boolean(updateId);

  useEffect(() => {
    setShow(open);
  }, [open]);

  const close = (val) => {
    setShow(val);
    onOpenChange?.(val);
  };

  const baseFields = {
    restaurantName: "",
    ownerName: "",
    email: "",
    password: "",
    mobileNumber: "",
    GSTNumber: "",
    address: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
    currency: "",
    timezone: "",
    subscriptionPlan: "",
    subdomain: "",
    customDomain: "",
    branchName: "",
    branchCode: "",
    branchAddress: "",
    branchCity: "",
    branchState: "",
    branchPincode: "",
  };

  const validationSchema = Yup.object({
    restaurantName: Yup.string().trim().min(2, "Too short").required("Restaurant name is required"),
    ownerName: Yup.string().trim().min(2, "Too short").required("Owner name is required"),
    email: Yup.string().trim().email("Enter a valid email").required("Email is required"),
    ...(!isUpdate && {
      password: Yup.string().min(6, "Min. 6 characters").required("Password is required"),
    }),
    mobileNumber: Yup.string()
      .matches(/^[0-9]{10}$/, "Enter a valid 10-digit number")
      .required("Mobile number is required"),
    city: Yup.string().trim().required("City is required"),
    state: Yup.string().trim().required("State is required"),
    country: Yup.string().trim().required("Country is required"),
    subscriptionPlan: Yup.string().required("Subscription plan is required"),
    ...(!isUpdate && {
      branchName: Yup.string().trim().required("Branch name is required"),
      branchCode: Yup.string().trim().required("Branch code is required"),
    }),
  });

  const formik = useFormik({
    initialValues: baseFields,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const formData = new FormData();
        Object.entries(values).forEach(([key, val]) => {
          if (val !== "" && val != null) formData.append(key, val);
        });

        const endpoint = isUpdate
          ? `${API.UPDATE_RESTAURANT}/${updateId}`
          : API.CREATE_RESTAURANT;
        const response = await fileUpload(endpoint, formData);

        if (response?.statusCode === 200 || response?.statusCode === 201) {
          message.success(
            response?.message ||
              (isUpdate ? "Restaurant updated." : "Restaurant registered successfully.")
          );
          resetForm();
          onCreated?.();
          close(false);
        } else {
          message.error(response?.message || "Something went wrong.");
        }
      } catch (err) {
        message.error(err?.response?.data?.message || "Request failed.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  const field = (name) => ({
    name,
    value: formik.values[name],
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
    error: formik.touched[name] ? formik.errors[name] : undefined,
  });

  return (
    <DrawerPop
      open={show}
      close={close}
      header={[
        isUpdate ? "Edit Restaurant" : "Register Restaurant",
        isUpdate
          ? "Update restaurant details."
          : "Fill in business, location, and initial branch info.",
      ]}
      footerBtn={["Cancel", isUpdate ? "Update" : "Register"]}
      handleSubmit={formik.submitForm}
      updateBtn={isUpdate}
      updateFun={formik.submitForm}
      loadingButton={formik.isSubmitting}
      width={900}
    >
      <form onSubmit={formik.handleSubmit} className="space-y-6 p-1">
        <SectionTitle>Business Details</SectionTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AntInput
            label="Restaurant Name"
            placeholder="e.g. Flavor Hub"
            {...field("restaurantName")}
          />
          <AntInput
            label="Owner Name"
            placeholder="e.g. John Doe"
            {...field("ownerName")}
          />
          <AntInput
            label="Email"
            type="email"
            placeholder="owner@restaurant.com"
            {...field("email")}
          />
          {!isUpdate && (
            <AntPasswordInput
              label="Password"
              placeholder="Min. 6 characters"
              {...field("password")}
            />
          )}
          <AntInput
            label="Mobile Number"
            placeholder="10-digit number"
            {...field("mobileNumber")}
          />
          <AntInput
            label="GST Number"
            placeholder="e.g. 33ABCDE1234F1Z5"
            {...field("GSTNumber")}
          />
        </div>

        <SectionTitle>Location & Settings</SectionTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AntInput
            label="Address"
            placeholder="Street address"
            wrapperClassName="sm:col-span-2"
            {...field("address")}
          />
          <AntInput label="City" placeholder="City" {...field("city")} />
          <AntInput label="State" placeholder="State" {...field("state")} />
          <AntInput label="Country" placeholder="Country" {...field("country")} />
          <AntInput label="Pincode" placeholder="6-digit pincode" {...field("pincode")} />
          <AntSelect
            label="Currency"
            placeholder="Select currency"
            options={[
              { value: "INR", label: "INR" },
              { value: "USD", label: "USD" },
              { value: "EUR", label: "EUR" },
            ]}
            value={formik.values.currency || undefined}
            onChange={(val) => formik.setFieldValue("currency", val)}
            error={formik.touched.currency ? formik.errors.currency : undefined}
          />
          <AntSelect
            label="Timezone"
            placeholder="Select timezone"
            options={[
              { value: "Asia/Kolkata", label: "Asia/Kolkata" },
              { value: "UTC", label: "UTC" },
              { value: "Asia/Dubai", label: "Asia/Dubai" },
            ]}
            value={formik.values.timezone || undefined}
            onChange={(val) => formik.setFieldValue("timezone", val)}
            error={formik.touched.timezone ? formik.errors.timezone : undefined}
          />
          <AntSelect
            label="Subscription Plan"
            placeholder="Select plan"
            options={[
              { value: "basic", label: "Basic" },
              { value: "standard", label: "Standard" },
              { value: "premium", label: "Premium" },
            ]}
            value={formik.values.subscriptionPlan || undefined}
            onChange={(val) => formik.setFieldValue("subscriptionPlan", val)}
            error={
              formik.touched.subscriptionPlan ? formik.errors.subscriptionPlan : undefined
            }
          />
          <AntInput
            label="Subdomain"
            placeholder="e.g. my-restaurant"
            {...field("subdomain")}
          />
          <AntInput
            label="Custom Domain (Optional)"
            placeholder="e.g. orders.restaurant.com"
            {...field("customDomain")}
          />
        </div>

        {!isUpdate && (
          <>
            <SectionTitle>Initial Branch Details</SectionTitle>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <AntInput
                label="Branch Name"
                placeholder="e.g. Main Branch"
                {...field("branchName")}
              />
              <AntInput
                label="Branch Code"
                placeholder="e.g. BLR-01"
                {...field("branchCode")}
              />
              <AntInput
                label="Branch Address"
                placeholder="Branch street address"
                wrapperClassName="sm:col-span-2"
                {...field("branchAddress")}
              />
              <AntInput label="Branch City" placeholder="City" {...field("branchCity")} />
              <AntInput label="Branch State" placeholder="State" {...field("branchState")} />
              <AntInput
                label="Branch Pincode"
                placeholder="6-digit pincode"
                {...field("branchPincode")}
              />
            </div>
          </>
        )}
      </form>
    </DrawerPop>
  );
}

function SectionTitle({ children }) {
  return (
    <h3 className="border-b border-border pb-2 text-sm font-semibold text-foreground">
      {children}
    </h3>
  );
}
