"use client";

import { useEffect, useState } from "react";
import { message } from "antd";
import { useFormik } from "formik";
import * as Yup from "yup";
import dayjs from "dayjs";
import { AntInput } from "@/components/ui/AntInput";
import { AntSelect } from "@/components/ui/AntSelect";
import AntTextArea from "@/components/ui/AntTextArea";
import { AntTimeSelect } from "@/components/ui/AntTimeSelect";
import DrawerPop from "@/components/ui/DrawerPop";
import { action, API, getAction } from "@/lib/API";

const initialValues = {
  shiftName: "",
  startTime: null,
  endTime: null,
  description: "",
  status: "active",
};

const validationSchema = Yup.object({
  shiftName: Yup.string()
    .trim()
    .min(2, "Shift name must be at least 2 characters")
    .max(100, "Shift name must be 100 characters or less")
    .required("Shift name is required"),
  startTime: Yup.string().nullable().required("Start time is required"),
  endTime: Yup.string().nullable().required("End time is required"),
  description: Yup.string().trim().max(300, "Max 300 characters").nullable(),
  status: Yup.string().oneOf(["active", "inactive"]).required(),
});

export default function AddShift({
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
          shiftName: values.shiftName.trim(),
          startTime: values.startTime,
          endTime: values.endTime,
          description: values.description?.trim() || undefined,
          status: values.status,
        };

        const result = await action(
          isUpdate
            ? `${API.UPDATE_STAFF_SHIFT}/${updateId}`
            : API.CREATE_STAFF_SHIFT,
          payload,
          isUpdate ? "PATCH" : "POST",
        );

        if (result?.statusCode === 200 || result?.statusCode === 201) {
          message.success(
            result?.message || (isUpdate ? "Shift updated" : "Shift added"),
          );
          resetForm();
          onCreated?.(result?.data || payload);
          onOpenChange(false);
          return;
        }

        message.error(
          result?.message ||
            (isUpdate ? "Unable to update shift" : "Unable to add shift"),
        );
      } catch {
        message.error(isUpdate ? "Unable to update shift" : "Unable to add shift");
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

  const fetchShiftDetails = async (id) => {
    try {
      const result = await getAction(`${API.GET_STAFF_SHIFT_BY_ID}/${id}`);
      if (result?.statusCode === 200 && result.data) {
        const s = result.data;
        formik.setValues({
          shiftName: s.shiftName || s.name || "",
          startTime: s.startTime || null,
          endTime: s.endTime || null,
          description: s.description || "",
          status: s.status || "active",
        });
      }
    } catch {
      message.error("Unable to fetch shift details");
    }
  };

  useEffect(() => {
    if (!open) return;
    if (updateId) {
      fetchShiftDetails(updateId);
    } else {
      formik.resetForm();
    }
  }, [open, updateId]);

  return (
    <DrawerPop
      open={show}
      close={closeDrawer}
      header={[
        isUpdate ? "Update Shift" : "Add Shift",
        isUpdate
          ? "Update shift timing and details."
          : "Create a new shift with start and end times.",
      ]}
      handleSubmit={formik.handleSubmit}
      footerBtn={["Cancel", "Save"]}
      footerBtnDisabled={formik.isSubmitting}
      loadingButton={formik.isSubmitting}
      width={640}
    >
      <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
        <AntInput
          label="Shift Name *"
          name="shiftName"
          placeholder="Eg: Morning Shift, Evening Shift"
          value={formik.values.shiftName}
          error={getError("shiftName")}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <AntTimeSelect
            label="Start Time *"
            value={formik.values.startTime ? dayjs(formik.values.startTime, "HH:mm") : null}
            error={getError("startTime")}
            format="hh:mm A"
            placeholder="Select start time"
            onChange={(time) =>
              formik.setFieldValue(
                "startTime",
                time ? time.format("HH:mm") : null,
              )
            }
            onBlur={() => formik.setFieldTouched("startTime", true)}
          />
          <AntTimeSelect
            label="End Time *"
            value={formik.values.endTime ? dayjs(formik.values.endTime, "HH:mm") : null}
            error={getError("endTime")}
            format="hh:mm A"
            placeholder="Select end time"
            onChange={(time) =>
              formik.setFieldValue(
                "endTime",
                time ? time.format("HH:mm") : null,
              )
            }
            onBlur={() => formik.setFieldTouched("endTime", true)}
          />
        </div>

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
          placeholder="Optional notes about this shift"
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
