"use client";

import { useEffect, useState } from "react";
import { Checkbox, message } from "antd";
import { useFormik } from "formik";
import * as Yup from "yup";
import { AntInput } from "@/components/ui/AntInput";
import DrawerPop from "@/components/ui/DrawerPop";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { action, API, getAction } from "@/lib/API";
import Stepper from "@/components/ui/Stepper";
import AssignEmployees from "./AssignEmployees";

const FALLBACK_MENU_LIST = [
  { id: 1, title: "Dashboard" },
  { id: 2, title: "Sales" },
  { id: 3, title: "POS Ordering" },
  { id: 4, title: "Orders" },
  { id: 5, title: "Billing" },
  { id: 6, title: "Restaurant" },
  { id: 7, title: "Tables" },
  { id: 8, title: "Kitchen KOT" },
  { id: 9, title: "Menus" },
  { id: 10, title: "QR Orders" },
  { id: 11, title: "Inventory & Finance" },
  { id: 12, title: "Inventory" },
  { id: 13, title: "Expenses" },
  { id: 14, title: "Administration" },
  { id: 15, title: "Staff" },
  { id: 16, title: "Reports" },
  { id: 17, title: "Restaurant Profile" },
  { id: 18, title: "Settings" },
  { id: 19, title: "Privileges" },
];

const PARENT_TITLES = new Set([
  "Dashboard",
  "Sales",
  "Restaurant",
  "Inventory & Finance",
  "Administration",
]);

function groupMenuItems(items) {
  const groups = [];
  let current = null;
  items.forEach((item) => {
    if (PARENT_TITLES.has(item.title)) {
      if (current) groups.push(current);
      current = { ...item, children: [] };
    } else if (current) {
      current.children.push(item);
    }
  });
  if (current) groups.push(current);
  return groups;
}

const validationSchema = Yup.object({
  roleName: Yup.string()
    .trim()
    .min(2, "Role name must be at least 2 characters")
    .max(80, "Role name must be 80 characters or less")
    .required("Role name is required"),
});

const steps = [
  { id: 1, title: "Roles" },
  { id: 2, title: "Assign Roles" },
];

export default function CreateUpdateRole({
  open,
  roleId,
  onOpenChange,
  onSaved,
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [menuGroups, setMenuGroups] = useState([]);
  const [permissions, setPermissions] = useState(new Set());
  const [loadingMenus, setLoadingMenus] = useState(false);

  // Tracks the actual role ID to use for assignment (may come from API response on create)
  const [savedRoleId, setSavedRoleId] = useState(roleId || null);

  // Staff list for AssignEmployees
  const [staffList, setStaffList] = useState([]);
  const [staffLoading, setStaffLoading] = useState(false);

  // Currently selected user IDs in AssignEmployees
  const [assignedUserIds, setAssignedUserIds] = useState([]);

  // Loading state for the assignment API call
  const [isSavingAssignment, setIsSavingAssignment] = useState(false);

  const isUpdate = Boolean(roleId);

  /* ── Formik: step 0 — create / update role ── */
  const formik = useFormik({
    initialValues: { roleName: "" },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const payload = {
          roleName: values.roleName.trim(),
          menus: [...permissions],
        };

        const result = await action(
          isUpdate ? `${API.UPDATE_ROLE}/${roleId}` : API.CREATE_ROLE,
          payload,
          isUpdate ? "PATCH" : "POST",
        );

        if (result?.statusCode === 200 || result?.statusCode === 201) {
          message.success(
            result?.message || (isUpdate ? "Role updated" : "Role created"),
          );
          const newId = result.data?._id || result.data?.id || roleId;
          setSavedRoleId(newId);
          setCurrentStep(1);
        } else {
          message.error(result?.message || "Unable to save role");
        }
      } catch {
        message.error("Unable to save role");
      } finally {
        setSubmitting(false);
      }
    },
  });

  /* ── Step 1 save: assign users to role ── */
  const handleAssignSave = async () => {
    if (!savedRoleId) {
      message.error("Role ID not found. Please save the role first.");
      return;
    }
    setIsSavingAssignment(true);
    try {
      const result = await action(
        API.ASSIGN_USER_BY_ROLE,
        { roleId: savedRoleId, userIds: assignedUserIds },
        "PATCH",
      );

      if (result?.statusCode === 200 || result?.statusCode === 201) {
        message.success(result?.message || "Employees assigned successfully");
        onSaved?.();
        handleClose();
      } else {
        message.error(result?.message || "Unable to assign employees");
      }
    } catch {
      message.error("Unable to assign employees");
    } finally {
      setIsSavingAssignment(false);
    }
  };

  /* ── Unified footer save handler ── */
  const handleFooterSave = () => {
    if (currentStep === 0) {
      formik.handleSubmit();
    } else {
      handleAssignSave();
    }
  };

  /* ── Fetch menus ── */
  const fetchMenuList = async () => {
    setLoadingMenus(true);
    try {
      const result = await getAction(API.GET_MENU_LIST);
      if (result?.statusCode === 200 && result.data?.length) {
        setMenuGroups(groupMenuItems(result.data));
      } else {
        setMenuGroups(groupMenuItems(FALLBACK_MENU_LIST));
      }
    } catch {
      setMenuGroups(groupMenuItems(FALLBACK_MENU_LIST));
    } finally {
      setLoadingMenus(false);
    }
  };

  /* ── Fetch staff for assignment panel ── */
  const fetchStaff = async () => {
    setStaffLoading(true);
    try {
      const result = await getAction(API.GET_STAFF_LIST);
      if (result?.statusCode === 200) {
        setStaffList(result.data || []);
      }
    } catch {
    } finally {
      setStaffLoading(false);
    }
  };

  /* ── Fetch role details when editing ── */
  const fetchRole = async (id) => {
    try {
      const result = await getAction(`${API.GET_ROLE_BY_ID}/${id}`);
      if (result?.statusCode === 200 && result.data) {
        const role = result.data;
        formik.setValues({ roleName: role.roleName || "" });
        if (Array.isArray(role.menus)) {
          setPermissions(new Set(role.menus));
        }
        // Pre-populate assigned users if the role carries them
        if (Array.isArray(role.userIds)) {
          setAssignedUserIds(role.userIds);
        } else if (Array.isArray(role.users)) {
          setAssignedUserIds(role.users.map((u) => u._id || u));
        }
      }
    } catch {
      message.error("Unable to fetch role details");
    }
  };

  useEffect(() => {
    if (!open) return;
    setCurrentStep(0);
    setSavedRoleId(roleId || null);
    fetchMenuList();
    fetchStaff();

    if (roleId) {
      fetchRole(roleId);
    } else {
      formik.resetForm();
      setPermissions(new Set());
      setAssignedUserIds([]);
    }
  }, [open, roleId]);

  /* ── Close ── */
  const handleClose = () => {
    formik.resetForm();
    setPermissions(new Set());
    setCurrentStep(0);
    setSavedRoleId(null);
    setAssignedUserIds([]);
    onOpenChange(false);
  };

  /* ── Permission helpers ── */
  const toggleItem = (id) => {
    setPermissions((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleGroup = (group, checked) => {
    setPermissions((prev) => {
      const next = new Set(prev);
      const ids = [group.id, ...group.children.map((c) => c.id)];
      ids.forEach((id) => (checked ? next.add(id) : next.delete(id)));
      return next;
    });
  };

  const isGroupAllChecked = (group) => {
    const ids = [group.id, ...group.children.map((c) => c.id)];
    return ids.every((id) => permissions.has(id));
  };

  const isGroupIndeterminate = (group) => {
    const ids = [group.id, ...group.children.map((c) => c.id)];
    const some = ids.some((id) => permissions.has(id));
    return some && !isGroupAllChecked(group);
  };

  const getError = (field) =>
    formik.touched[field] && formik.errors[field] ? formik.errors[field] : "";

  const defaultOpenValues = menuGroups.map((g) => String(g.id));
  const isBusy = formik.isSubmitting || isSavingAssignment;

  return (
    <DrawerPop
      open={open}
      close={handleClose}
      size="large"
      headerTitle={["Create New Role", "Manage your companies roles here"]}
      isFooter={true}
      bodyPadding="0"
      footerBtn={["Cancel", currentStep === 0 ? "Save & Next" : "Save"]}
      footerBtnDisabled={isBusy}
      loadingButton={isBusy}
      handleSubmit={handleFooterSave}
    >
      <div className="flex flex-col gap-6 h-full mx-auto">
        {/* Stepper */}
        <div className="px-10 py-5 bg-background">
          <Stepper steps={steps} currentStep={currentStep} />
        </div>

        {currentStep === 0 ? (
          <div className="flex-1 overflow-y-auto px-10 py-8 bg-[#f9fafb] dark:bg-[#0f172a]">
            {/* Role Name */}
            <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-border p-6 mb-6">
              <div className="mb-5">
                <h2 className="text-xl font-bold text-foreground">
                  {isUpdate ? "Update Role" : "Create Role"}
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Configure the company access based on the role
                </p>
              </div>
              <AntInput
                label="Role Name *"
                name="roleName"
                placeholder="Your text"
                value={formik.values.roleName}
                error={getError("roleName")}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </div>

            {/* Privileges */}
            <div className="mb-6">
              <h3 className="text-base font-bold text-foreground">
                Privileges
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5 mb-4">
                Configure the company role
              </p>

              {loadingMenus ? (
                <div className="flex items-center justify-center h-24 text-sm text-muted-foreground">
                  Loading menus…
                </div>
              ) : (
                <Accordion
                  type="multiple"
                  defaultValue={defaultOpenValues}
                  className="gap-3"
                >
                  {menuGroups.map((group) => {
                    const allChecked = isGroupAllChecked(group);
                    const indeterminate = isGroupIndeterminate(group);

                    return (
                      <AccordionItem key={group.id} value={String(group.id)}>
                        <AccordionTrigger
                          rightSlot={
                            <Checkbox
                              checked={allChecked}
                              indeterminate={indeterminate}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) =>
                                toggleGroup(group, e.target.checked)
                              }
                              className="text-xs"
                            >
                              Enable All
                            </Checkbox>
                          }
                        >
                          {group.title}
                        </AccordionTrigger>

                        <AccordionContent>
                          {group.children.length > 0 ? (
                            <div className="grid grid-cols-2 gap-x-8">
                              <div className="flex items-center py-2.5 border-b border-border/60">
                                <Checkbox
                                  checked={permissions.has(group.id)}
                                  onChange={() => toggleItem(group.id)}
                                  className={`text-sm ${permissions.has(group.id) ? "font-medium" : ""}`}
                                >
                                  {group.title}
                                </Checkbox>
                              </div>
                              {group.children.map((child) => (
                                <div
                                  key={child.id}
                                  className={`flex items-center py-2.5 border-b border-border/60 last:border-0 ${
                                    permissions.has(child.id)
                                      ? "bg-primary/5 -mx-5 px-5 rounded"
                                      : ""
                                  }`}
                                >
                                  <Checkbox
                                    checked={permissions.has(child.id)}
                                    onChange={() => toggleItem(child.id)}
                                    className="text-sm"
                                  >
                                    {child.title}
                                  </Checkbox>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex items-center py-2">
                              <Checkbox
                                checked={permissions.has(group.id)}
                                onChange={() => toggleItem(group.id)}
                                className="text-sm"
                              >
                                {group.title}
                              </Checkbox>
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-10 py-8 bg-[#f9fafb] dark:bg-[#0f172a]">
            <AssignEmployees
              employees={staffList}
              initialAssignedIds={assignedUserIds}
              loading={staffLoading}
              onSave={setAssignedUserIds}
            />
          </div>
        )}
      </div>
    </DrawerPop>
  );
}
