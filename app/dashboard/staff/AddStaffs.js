"use client";

import { useEffect, useState } from "react";
import { DatePicker, message } from "antd";
import { useFormik } from "formik";
import * as Yup from "yup";
import dayjs from "dayjs";
import { AntInput } from "@/components/ui/AntInput";
import { AntSelect } from "@/components/ui/AntSelect";
import AntTextArea from "@/components/ui/AntTextArea";
import DrawerPop from "@/components/ui/DrawerPop";
import { action, API, getAction } from "@/lib/API";

const initialValues = {
  name: "",
  email: "",
  phone: "",
  employeeCode: "",
  designation: "",
  departmentId: "",
  shiftId: "",
  branchIds: [],
  gender: null,
  dateOfBirth: null,
  dateOfJoining: null,
  address: "",
  status: "active",
  reportsTo: null,
  emergencyContact: {
    name: "",
    phone: "",
    relation: "",
  },
};

const validationSchema = Yup.object({
  name: Yup.string().trim().required("Name is required"),
  email: Yup.string()
    .trim()
    .email("Enter a valid email")
    .required("Email is required"),
  phone: Yup.string()
    .trim()
    .matches(/^[0-9+\-\s()]{7,16}$/, "Enter a valid phone number")
    .nullable(),
  status: Yup.string()
    .oneOf(["active", "inactive", "blocked"])
    .required("Status is required"),
});

const getStoredValue = (key) => {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(key) || "";
};

export default function AddStaffs({
  open,
  onOpenChange,
  onCreated,
  updateId = null,
}) {
  const [show, setShow] = useState(open);
  const [roleOptions, setRoleOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [designationOption, setDesignationOption] = useState([]);
  const [shiftOptions, setShiftOptions] = useState([]);
  const [branchOptions, setBranchOptions] = useState([]);
  const [supervisorOptions, setSupervisorOptions] = useState([]);

  const isUpdate = Boolean(updateId);

  useEffect(() => {
    setShow(open);
  }, [open]);

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      console.log(values, "values");

      try {
        const payload = {
          ...values,
          restaurantId: getStoredValue("restaurantId"),
          name: values.name.trim(),
          email: values.email.trim().toLowerCase(),
          phone: values.phone?.trim() || undefined,
          employeeCode: values.employeeCode?.trim() || undefined,
          designation: values.designation?.trim() || undefined,
          address: values.address?.trim() || undefined,
          roleId: values.roleId || undefined,
          departmentId: values.departmentId || undefined,
          shiftId: values.shiftId || undefined,
          reportsTo: values.reportsTo || null,
          dateOfBirth: values.dateOfBirth || undefined,
          dateOfJoining: values.dateOfJoining || undefined,
          gender: values.gender || undefined,
          emergencyContact:
            values.emergencyContact.name || values.emergencyContact.phone
              ? values.emergencyContact
              : undefined,
        };

        const result = await action(
          isUpdate ? `${API.UPDATE_STAFF}/${updateId}` : API.CREATE_STAFF,
          payload,
          isUpdate ? "PATCH" : "POST",
        );

        if (result?.statusCode === 200 || result?.statusCode === 201) {
          message.success(
            result?.message || (isUpdate ? "Staff updated" : "Staff added"),
          );
          resetForm();
          onCreated?.(result?.data || payload);
          onOpenChange(false);
          return;
        }

        message.error(
          result?.message ||
            (isUpdate ? "Unable to update staff" : "Unable to add staff"),
        );
      } catch {
        message.error(
          isUpdate ? "Unable to update staff" : "Unable to add staff",
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

  const fetchDropdowns = async () => {
    const [roles, departments, shifts, branches, designation, supervisors] =
      await Promise.allSettled([
        getAction(API.GET_ROLE_LIST),
        getAction(API.GET_DEPARTMENT_LIST),
        getAction(API.GET_STAFF_SHIFT_LIST),
        getAction(API.GET_BRANCH_LIST),
        getAction(API.GET_DESIGNATION_LIST),
        getAction(`${API.GET_STAFF_LIST}?status=active&limit=100`),
      ]);

    if (roles.value?.statusCode === 200) {
      setRoleOptions(
        (roles.value.data || []).map((r) => ({
          label: r.roleName,
          value: r._id,
        })),
      );
    }
    if (departments.value?.statusCode === 200) {
      setDepartmentOptions(
        (departments.value.data || []).map((d) => ({
          label: d.departmentName,
          value: d._id,
        })),
      );
    }
    if (shifts.value?.statusCode === 200) {
      setShiftOptions(
        (shifts.value.data || []).map((s) => ({
          label: s.shiftName,
          value: s._id,
        })),
      );
    }
    if (branches.value?.statusCode === 200) {
      setBranchOptions(
        (branches.value.data || []).map((b) => ({
          label: b.branchName,
          value: b._id,
        })),
      );
    }
    if (designation?.value?.statusCode === 200) {
      setDesignationOption(
        designation?.value?.data?.map((d) => ({
          label: d.designationName,
          value: d._id,
        })),
      );
    }
    if (supervisors?.value?.statusCode === 200) {
      setSupervisorOptions(
        (supervisors.value.data || []).map((s) => ({
          label: `${s.name} — ${s.role?.replace("_", " ") || "staff"}`,
          value: s._id,
        })),
      );
    }
  };

  const fetchStaffDetails = async (id) => {
    try {
      const result = await getAction(`${API.GET_STAFF_BY_ID}/${id}`);
      if (result?.statusCode === 200 && result.data) {
        const s = result.data;
        formik.setValues({
          name: s.name || "",
          email: s.email || "",
          phone: s.phone || "",
          employeeCode: s.employeeCode || "",
          designation: s.designation || "",
          roleId: s.roleId || "",
          departmentId: s.departmentId || "",
          shiftId: s.shiftId || "",
          branchIds: Array.isArray(s.branchIds) ? s.branchIds : [],
          gender: s.gender || null,
          dateOfBirth: s.dateOfBirth || null,
          dateOfJoining: s.dateOfJoining || null,
          address: s.address || "",
          status: s.status || "active",
          reportsTo: s.reportsTo?._id || null,
          emergencyContact: {
            name: s.emergencyContact?.name || "",
            phone: s.emergencyContact?.phone || "",
            relation: s.emergencyContact?.relation || "",
          },
        });
        // Remove self from supervisor options when editing
        setSupervisorOptions((prev) => prev.filter((o) => o.value !== id));
      }
    } catch {
      message.error("Unable to fetch staff details");
    }
  };

  useEffect(() => {
    if (!open) return;
    fetchDropdowns();

    if (updateId) {
      fetchStaffDetails(updateId);
    } else {
      formik.resetForm();
    }
  }, [open, updateId]);

  return (
    <DrawerPop
      open={show}
      close={closeDrawer}
      header={[
        isUpdate ? "Update Staff" : "Add Staff",
        isUpdate
          ? "Update staff profile, role, and assignment."
          : "Add a new staff member. A default password will be set automatically.",
      ]}
      handleSubmit={() => {
        console.log(formik.values, "values");
        formik.handleReset();
      }}
      footerBtn={["Cancel", "Save"]}
      footerBtnDisabled={formik.isSubmitting}
      loadingButton={formik.isSubmitting}
      width={860}
    >
      <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
        {/* Basic Info */}
        <section>
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Basic Information
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <AntInput
              label="Full Name *"
              name="name"
              placeholder="Eg: Raj Sharma"
              value={formik.values.name}
              error={getError("name")}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            <AntInput
              label="Email *"
              name="email"
              type="email"
              placeholder="staff@example.com"
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
            <AntInput
              label="Employee Code"
              name="employeeCode"
              placeholder="Eg: EMP-001"
              value={formik.values.employeeCode}
              error={getError("employeeCode")}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </div>
        </section>

        {/* Role & Access */}
        <section>
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Role & Access
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {/* <AntSelect
              label="Role *"
              value={formik.values.role}
              error={getError("role")}
              options={[
                { label: "Manager", value: "manager" },
                { label: "Cashier", value: "cashier" },
                { label: "Chef", value: "chef" },
                { label: "Waiter", value: "waiter" },
                { label: "Inventory Staff", value: "inventory_staff" },
              ]}
              onChange={(value) => formik.setFieldValue("role", value)}
              onBlur={() => formik.setFieldTouched("role", true)}
            /> */}
            {roleOptions.length > 0 && (
              <AntSelect
                label="Role"
                value={formik.values.roleId || undefined}
                allowClear
                placeholder="Select custom role"
                options={roleOptions}
                onChange={(value) =>
                  formik.setFieldValue("roleId", value || "")
                }
                onBlur={() => formik.setFieldTouched("roleId", true)}
              />
            )}
            <AntSelect
              label="Branch Access"
              mode="multiple"
              value={formik.values.branchIds}
              error={getError("branchIds")}
              placeholder="Select branches"
              options={branchOptions}
              onChange={(value) => formik.setFieldValue("branchIds", value)}
              onBlur={() => formik.setFieldTouched("branchIds", true)}
            />
            {/* <AntSelect
              label="Default Branch"
              value={formik.values.defaultBranchId || undefined}
              allowClear
              placeholder="Select default branch"
              options={branchOptions}
              onChange={(value) =>
                formik.setFieldValue("defaultBranchId", value || "")
              }
              onBlur={() => formik.setFieldTouched("defaultBranchId", true)}
            /> */}
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
        </section>

        {/* Work Assignment */}
        <section>
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Work Assignment
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <AntSelect
              label="Designation"
              name="designation"
              placeholder="Select Designation"
              allowClear
              options={designationOption}
              value={formik.values.designation || undefined}
              error={getError("designation")}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />

            <AntSelect
              label="Department"
              value={formik.values.departmentId || undefined}
              allowClear
              placeholder="Select department"
              options={departmentOptions}
              onChange={(value) =>
                formik.setFieldValue("departmentId", value || "")
              }
              onBlur={() => formik.setFieldTouched("departmentId", true)}
            />

            <AntSelect
              label="Shift"
              value={formik.values.shiftId || undefined}
              allowClear
              placeholder="Select shift"
              options={shiftOptions}
              onChange={(value) => formik.setFieldValue("shiftId", value || "")}
              onBlur={() => formik.setFieldTouched("shiftId", true)}
            />
            <AntSelect
              label="Reports To (Supervisor)"
              value={formik.values.reportsTo || undefined}
              allowClear
              showSearch
              placeholder="Select supervisor..."
              options={supervisorOptions}
              filterOption={(input, option) =>
                option?.label?.toLowerCase().includes(input.toLowerCase())
              }
              onChange={(value) =>
                formik.setFieldValue("reportsTo", value || null)
              }
              onBlur={() => formik.setFieldTouched("reportsTo", true)}
            />
          </div>
        </section>

        {/* Personal Details */}
        <section>
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Personal Details
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <AntSelect
              label="Gender"
              value={formik.values.gender || undefined}
              allowClear
              placeholder="Select gender"
              options={[
                { label: "Male", value: "male" },
                { label: "Female", value: "female" },
                { label: "Other", value: "other" },
              ]}
              onChange={(value) =>
                formik.setFieldValue("gender", value || null)
              }
              onBlur={() => formik.setFieldTouched("gender", true)}
            />
            <label className="block">
              <span className="mb-2 block text-sm font-medium">
                Date of Birth
              </span>
              <DatePicker
                size="large"
                className="w-full"
                value={
                  formik.values.dateOfBirth
                    ? dayjs(formik.values.dateOfBirth)
                    : null
                }
                onChange={(date) =>
                  formik.setFieldValue(
                    "dateOfBirth",
                    date ? date.toISOString() : null,
                  )
                }
                disabledDate={(current) =>
                  current && current > dayjs().endOf("day")
                }
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium">
                Date of Joining
              </span>
              <DatePicker
                size="large"
                className="w-full"
                value={
                  formik.values.dateOfJoining
                    ? dayjs(formik.values.dateOfJoining)
                    : null
                }
                onChange={(date) =>
                  formik.setFieldValue(
                    "dateOfJoining",
                    date ? date.toISOString() : null,
                  )
                }
              />
            </label>
          </div>
          <div className="mt-4">
            <AntTextArea
              label="Address"
              name="address"
              placeholder="Staff residential address"
              value={formik.values.address}
              error={getError("address")}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </div>
        </section>

        {/* Emergency Contact */}
        <section>
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Emergency Contact
          </h3>
          <div className="grid gap-4 md:grid-cols-3">
            <AntInput
              label="Contact Name"
              name="emergencyContact.name"
              placeholder="Eg: Priya Sharma"
              value={formik.values.emergencyContact.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            <AntInput
              label="Contact Phone"
              name="emergencyContact.phone"
              placeholder="+91 98765 43210"
              value={formik.values.emergencyContact.phone}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            <AntInput
              label="Relation"
              name="emergencyContact.relation"
              placeholder="Eg: Spouse, Parent"
              value={formik.values.emergencyContact.relation}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </div>
        </section>

        <p className="text-xs text-muted-foreground">
          A default password will be set automatically. Staff can reset it from
          their profile.
        </p>
      </div>
    </DrawerPop>
  );
}
