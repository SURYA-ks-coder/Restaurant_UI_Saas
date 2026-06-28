"use client";

import { Switch } from "antd";
import { message } from "@/lib/message";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import * as Yup from "yup";

import DrawerPop from "@/components/ui/DrawerPop";
import {
  AntInput,
  AntSelect,
  AntTextArea,
} from "@/components/ui/antd-components";
import { action, API, getAction } from "@/lib/API";

const initialValues = {
  planName: "",
  price: "",
  billingCycle: "monthly",
  trialDays: 0,
  maxBranches: 1,
  maxUsers: 3,
  maxOrders: 100,
  features: "",
  status: "active",
  isSystem: false,
};

const validationSchema = Yup.object({
  planName: Yup.string().trim().required("Plan name is required"),

  price: Yup.number()
    .typeError("Price must be a number")
    .min(0)
    .required("Price is required"),

  billingCycle: Yup.string()
    .oneOf(["trial", "monthly", "yearly", "custom"])
    .required("Billing cycle is required"),

  trialDays: Yup.number().typeError("Trial days must be a number").min(0),

  maxBranches: Yup.number()
    .typeError("Max branches must be a number")
    .min(1)
    .required(),

  maxUsers: Yup.number()
    .typeError("Max users must be a number")
    .min(1)
    .required(),

  maxOrders: Yup.number()
    .typeError("Max orders must be a number")
    .min(0)
    .required(),

  status: Yup.string().oneOf(["active", "inactive", "archived"]).required(),
});

function SectionTitle({ children }) {
  return (
    <div className="border-b border-border pb-2 pt-2 text-sm font-semibold text-primary">
      {children}
    </div>
  );
}

export default function AddSubscriptionPlan({
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
          planName: values.planName.trim(),
          price: Number(values.price),
          billingCycle: values.billingCycle,
          trialDays: Number(values.trialDays || 0),
          maxBranches: Number(values.maxBranches),
          maxUsers: Number(values.maxUsers),
          maxOrders: Number(values.maxOrders),
          features: values.features
            ? values.features
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean)
            : [],
          status: values.status,
          isSystem: values.isSystem,
        };

        const result = await action(
          isUpdate
            ? `${API.UPDATE_SUBSCRIPTION_PLAN}/${updateId}`
            : API.CREATE_SUBSCRIPTION_PLAN,
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

        message.error(result?.message);
      } catch (error) {
        message.error(
          isUpdate ? "Unable to update plan" : "Unable to create plan",
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

  const getPlanDetails = async (id) => {
    try {
      const result = await getAction(
        `${API.GET_SUBSCRIPTION_PLAN_BY_ID}/${id}`,
      );

      if (result?.statusCode === 200) {
        const plan = result.data;

        formik.setValues({
          planName: plan.planName || "",
          price: plan.price || "",
          billingCycle: plan.billingCycle || "monthly",
          trialDays: plan.trialDays || 0,
          maxBranches: plan.maxBranches || 1,
          maxUsers: plan.maxUsers || 3,
          maxOrders: plan.maxOrders || 100,
          features: (plan.features || []).join(", "),
          status: plan.status || "active",
          isSystem: plan.isSystem || false,
        });
      }
    } catch (error) {
      message.error("Unable to fetch plan details");
    }
  };

  useEffect(() => {
    if (!open) return;

    if (updateId) {
      getPlanDetails(updateId);
    } else {
      formik.resetForm();
    }
  }, [open, updateId]);

  return (
    <DrawerPop
      open={show}
      close={closeDrawer}
      header={[
        isUpdate ? "Update Subscription Plan" : "Add Subscription Plan",
        isUpdate
          ? "Update subscription plan details."
          : "Create a new subscription plan.",
      ]}
      handleSubmit={formik.handleSubmit}
      footerBtn={["Cancel", "Save"]}
      footerBtnDisabled={formik.isSubmitting}
      loadingButton={formik.isSubmitting}
      width={700}
    >
      <div className="space-y-5">
        <SectionTitle>Plan Information</SectionTitle>

        <div className="grid gap-4 md:grid-cols-2">
          <AntInput
            label="Plan Name"
            name="planName"
            value={formik.values.planName}
            error={getError("planName")}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />

          <AntInput
            label="Price"
            name="price"
            type="number"
            min={0}
            value={formik.values.price}
            error={getError("price")}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />

          <AntSelect
            label="Billing Cycle"
            value={formik.values.billingCycle}
            error={getError("billingCycle")}
            options={[
              { label: "Trial", value: "trial" },
              { label: "Monthly", value: "monthly" },
              { label: "Yearly", value: "yearly" },
              { label: "Custom", value: "custom" },
            ]}
            onChange={(value) => formik.setFieldValue("billingCycle", value)}
          />

          <AntInput
            label="Trial Days"
            name="trialDays"
            type="number"
            min={0}
            value={formik.values.trialDays}
            error={getError("trialDays")}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
        </div>

        <SectionTitle>Limits</SectionTitle>

        <div className="grid gap-4 md:grid-cols-3">
          <AntInput
            label="Max Branches"
            name="maxBranches"
            type="number"
            min={1}
            value={formik.values.maxBranches}
            error={getError("maxBranches")}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />

          <AntInput
            label="Max Users"
            name="maxUsers"
            type="number"
            min={1}
            value={formik.values.maxUsers}
            error={getError("maxUsers")}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />

          <AntInput
            label="Max Orders"
            name="maxOrders"
            type="number"
            min={0}
            value={formik.values.maxOrders}
            error={getError("maxOrders")}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
        </div>

        <SectionTitle>Features</SectionTitle>

        <AntTextArea
          label="Features"
          name="features"
          rows={4}
          placeholder="Inventory Management, POS Billing, Reports"
          value={formik.values.features}
          onChange={formik.handleChange}
        />

        <p className="text-xs text-muted-foreground">
          Enter features separated by commas.
        </p>

        <SectionTitle>Settings</SectionTitle>

        <div className="grid gap-4 md:grid-cols-2">
          <AntSelect
            label="Status"
            value={formik.values.status}
            error={getError("status")}
            options={[
              {
                label: "Active",
                value: "active",
              },
              {
                label: "Inactive",
                value: "inactive",
              },
              {
                label: "Archived",
                value: "archived",
              },
            ]}
            onChange={(value) => formik.setFieldValue("status", value)}
          />

          <label className="block">
            <span className="mb-2 block text-sm font-medium">System Plan</span>

            <Switch
              checked={formik.values.isSystem}
              onChange={(checked) => formik.setFieldValue("isSystem", checked)}
            />
          </label>
        </div>
      </div>
    </DrawerPop>
  );
}
