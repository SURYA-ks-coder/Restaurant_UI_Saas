"use client";

import { useEffect, useState } from "react";
import { DatePicker } from "antd";
import { useFormik } from "formik";
import * as yup from "yup";
import dayjs from "dayjs";
import DrawerPop from "@/components/ui/DrawerPop";
import { AntInput, AntPasswordInput } from "@/components/ui/AntInput";
import { AntSelect } from "@/components/ui/AntSelect";
import AntTextArea from "@/components/ui/AntTextArea";
import { action, API, getAction } from "@/lib/API";
import { message } from "@/lib/message";
import { getRestaurantId } from "@/lib/auth";

const initialValues = {
  name: "",
  email: "",
  phone: "",
  password: "",
  employeeCode: "",
  roleId: "",
  departmentId: "",
  designationId: "",
  shiftId: "",
  branchIds: [],
  reportsTo: null,
  gender: null,
  dateOfBirth: null,
  dateOfJoining: null,
  address: "",
  status: "active",
  emergencyContact: { name: "", phone: "", relation: "" },
};

const validationSchema = yup.object({
  name: yup.string().trim().required("Name is required"),
  email: yup.string().trim().email("Enter a valid email").required("Email is required"),
  phone: yup
    .string()
    .trim()
    .matches(/^[0-9+\-\s()]{7,16}$/, "Enter a valid phone number")
    .nullable(),
  status: yup
    .string()
    .oneOf(["active", "inactive", "blocked"])
    .required("Status is required"),
});

const GENDER_OPTIONS = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Other", value: "other" },
];

const STATUS_OPTIONS = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Blocked", value: "blocked" },
];

const RELATION_OPTIONS = [
  { label: "Parent", value: "parent" },
  { label: "Spouse", value: "spouse" },
  { label: "Sibling", value: "sibling" },
  { label: "Child", value: "child" },
  { label: "Friend", value: "friend" },
  { label: "Other", value: "other" },
];

export default function AddManager({ open, onOpenChange, onSaved, updateId }) {
  const [show, setShow] = useState(open);
  const isUpdate = Boolean(updateId);

  const [roleOptions, setRoleOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [designationOptions, setDesignationOptions] = useState([]);
  const [shiftOptions, setShiftOptions] = useState([]);
  const [branchOptions, setBranchOptions] = useState([]);
  const [supervisorOptions, setSupervisorOptions] = useState([]);

  useEffect(() => { setShow(open); }, [open]);

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      if (!isUpdate && !values.password) {
        formik.setFieldError("password", "Password is required for new users");
        formik.setFieldTouched("password", true);
        setSubmitting(false);
        return;
      }

      try {
        const payload = {
          restaurantId: getRestaurantId(),
          name: values.name.trim(),
          email: values.email.trim().toLowerCase(),
          phone: values.phone?.trim() || undefined,
          employeeCode: values.employeeCode?.trim() || undefined,
          roleId: values.roleId || undefined,
          departmentId: values.departmentId || undefined,
          designationId: values.designationId || undefined,
          shiftId: values.shiftId || undefined,
          branchIds: values.branchIds,
          reportsTo: values.reportsTo || null,
          gender: values.gender || undefined,
          dateOfBirth: values.dateOfBirth || undefined,
          dateOfJoining: values.dateOfJoining || undefined,
          address: values.address?.trim() || undefined,
          status: values.status,
          emergencyContact:
            values.emergencyContact.name || values.emergencyContact.phone
              ? values.emergencyContact
              : undefined,
        };

        if (values.password) payload.password = values.password;

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
        }

        message.error(
          result?.message ||
            (isUpdate ? "Unable to update manager" : "Unable to add manager"),
        );
      } catch {
        message.error(isUpdate ? "Unable to update manager" : "Unable to add manager");
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
    const [roles, departments, designations, shifts, branches, supervisors] =
      await Promise.allSettled([
        getAction(API.GET_ROLE_LIST),
        getAction(API.GET_DEPARTMENT_LIST),
        getAction(API.GET_DESIGNATION_LIST),
        getAction(API.GET_STAFF_SHIFT_LIST),
        getAction(API.GET_BRANCH_LIST),
        getAction(`${API.GET_STAFF_LIST}?status=active&limit=100`),
      ]);

    if (roles.value?.statusCode === 200)
      setRoleOptions(
        (roles.value.data || []).map((r) => ({ label: r.roleName, value: r._id })),
      );
    if (departments.value?.statusCode === 200)
      setDepartmentOptions(
        (departments.value.data || []).map((d) => ({ label: d.departmentName, value: d._id })),
      );
    if (designations.value?.statusCode === 200)
      setDesignationOptions(
        (designations.value.data || []).map((d) => ({ label: d.designationName, value: d._id })),
      );
    if (shifts.value?.statusCode === 200)
      setShiftOptions(
        (shifts.value.data || []).map((s) => ({ label: s.shiftName, value: s._id })),
      );
    if (branches.value?.statusCode === 200)
      setBranchOptions(
        (branches.value.data || []).map((b) => ({ label: b.branchName, value: b._id })),
      );
    if (supervisors.value?.statusCode === 200)
      setSupervisorOptions(
        (supervisors.value.data || []).map((s) => ({
          label: `${s.name} — ${s.role?.replace("_", " ") || "staff"}`,
          value: s._id,
        })),
      );
  };

  const fetchManagerDetails = async (id) => {
    try {
      const result = await getAction(`${API.GET_STAFF_BY_ID}/${id}`);
      if (result?.statusCode === 200 && result.data) {
        const m = result.data;
        formik.setValues({
          name: m.name || "",
          email: m.email || "",
          phone: m.phone || "",
          password: "",
          employeeCode: m.employeeCode || "",
          roleId: m.roleId?._id || m.roleId || "",
          departmentId: m.departmentId?._id || m.departmentId || "",
          designationId: m.designationId?._id || m.designationId || "",
          shiftId: m.shiftId?._id || m.shiftId || "",
          branchIds: Array.isArray(m.branchIds) ? m.branchIds : [],
          reportsTo: m.reportsTo?._id || null,
          gender: m.gender || null,
          dateOfBirth: m.dateOfBirth || null,
          dateOfJoining: m.dateOfJoining || null,
          address: m.address || "",
          status: m.status || "active",
          emergencyContact: {
            name: m.emergencyContact?.name || "",
            phone: m.emergencyContact?.phone || "",
            relation: m.emergencyContact?.relation || "",
          },
        });
        setSupervisorOptions((prev) => prev.filter((o) => o.value !== id));
      }
    } catch {
      message.error("Unable to fetch manager details");
    }
  };

  useEffect(() => {
    if (!open) return;
    fetchDropdowns();
    if (updateId) {
      fetchManagerDetails(updateId);
    } else {
      formik.resetForm();
    }
  }, [open, updateId]);

  return (
    <DrawerPop
      open={show}
      close={closeDrawer}
      header={[
        isUpdate ? "Update Manager" : "Add Manager",
        isUpdate
          ? "Update manager profile, role, and branch assignment."
          : "Add a new manager. A default password will be set automatically.",
      ]}
      handleSubmit={formik.handleSubmit}
      footerBtn={["Cancel", "Save"]}
      footerBtnDisabled={formik.isSubmitting}
      loadingButton={formik.isSubmitting}
      width={860}
    >
      <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">

        {/* Basic Information */}
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
            <AntInput
              label="Employee Code"
              name="employeeCode"
              placeholder="Eg: EMP-001"
              value={formik.values.employeeCode}
              error={getError("employeeCode")}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            <AntPasswordInput
              label={isUpdate ? "New Password (leave blank to keep)" : "Password *"}
              name="password"
              placeholder="••••••••"
              value={formik.values.password}
              error={getError("password")}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            <AntSelect
              label="Status"
              value={formik.values.status}
              error={getError("status")}
              options={STATUS_OPTIONS}
              onChange={(value) => formik.setFieldValue("status", value)}
              onBlur={() => formik.setFieldTouched("status", true)}
            />
          </div>
        </section>

        {/* Role & Access */}
        <section>
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Role & Access
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <AntSelect
              label="Role"
              value={formik.values.roleId || undefined}
              allowClear
              placeholder="Select role"
              options={roleOptions}
              error={getError("roleId")}
              onChange={(value) => formik.setFieldValue("roleId", value || "")}
              onBlur={() => formik.setFieldTouched("roleId", true)}
            />
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
          </div>
        </section>

        {/* Work Assignment */}
        <section>
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Work Assignment
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <AntSelect
              label="Department"
              value={formik.values.departmentId || undefined}
              allowClear
              placeholder="Select department"
              options={departmentOptions}
              onChange={(value) => formik.setFieldValue("departmentId", value || "")}
              onBlur={() => formik.setFieldTouched("departmentId", true)}
            />
            <AntSelect
              label="Designation"
              value={formik.values.designationId || undefined}
              allowClear
              placeholder="Select designation"
              options={designationOptions}
              onChange={(value) => formik.setFieldValue("designationId", value || "")}
              onBlur={() => formik.setFieldTouched("designationId", true)}
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
              placeholder="Select supervisor"
              options={supervisorOptions}
              filterOption={(input, option) =>
                option?.label?.toLowerCase().includes(input.toLowerCase())
              }
              onChange={(value) => formik.setFieldValue("reportsTo", value || null)}
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
              options={GENDER_OPTIONS}
              onChange={(value) => formik.setFieldValue("gender", value || null)}
              onBlur={() => formik.setFieldTouched("gender", true)}
            />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Date of Birth</label>
              <DatePicker
                className="w-full"
                value={formik.values.dateOfBirth ? dayjs(formik.values.dateOfBirth) : null}
                onChange={(date) =>
                  formik.setFieldValue("dateOfBirth", date ? date.toISOString() : null)
                }
                disabledDate={(d) => d && d > dayjs().endOf("day")}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Date of Joining</label>
              <DatePicker
                className="w-full"
                value={formik.values.dateOfJoining ? dayjs(formik.values.dateOfJoining) : null}
                onChange={(date) =>
                  formik.setFieldValue("dateOfJoining", date ? date.toISOString() : null)
                }
              />
            </div>
            <AntTextArea
              label="Address"
              name="address"
              placeholder="Full address"
              value={formik.values.address}
              error={getError("address")}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              rows={2}
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
              placeholder="Contact person name"
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
            <AntSelect
              label="Relation"
              value={formik.values.emergencyContact.relation || undefined}
              allowClear
              placeholder="Select relation"
              options={RELATION_OPTIONS}
              onChange={(value) =>
                formik.setFieldValue("emergencyContact.relation", value || "")
              }
            />
          </div>
        </section>

      </div>
    </DrawerPop>
  );
}
