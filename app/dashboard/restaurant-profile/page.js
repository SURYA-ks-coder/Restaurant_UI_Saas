"use client";

import { useEffect, useMemo, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { message } from "antd";
import {
  AlertCircle,
  BadgeCheck,
  Building2,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Edit3,
  Globe2,
  ImagePlus,
  Landmark,
  Loader2,
  MapPin,
  Mail,
  MoreHorizontal,
  Phone,
  Plus,
  Save,
  Search,
  ShieldCheck,
  Store,
  Utensils,
  Wifi,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { action, fileUpload, getAction, URL, API } from "@/lib/API";
import DrawerPop from "@/components/ui/DrawerPop";
import { AntInput, AntPasswordInput } from "@/components/ui/AntInput";
import { AntSelect } from "@/components/ui/AntSelect";
import AntTextArea from "@/components/ui/AntTextArea";
import AddBranch from "./Branch/AddBranch";
import AddManager from "./Manager/AddManager";
import { FaHandDots, FaPen } from "react-icons/fa6";

const restaurantApiUrl = `${URL}${API.CREATE_RESTAURANT}`;

const branches = [
  {
    _id: "sample-branch-1",
    name: "Indiranagar Flagship",
    branchName: "Indiranagar Flagship",
    code: "BLR-01",
    branchCode: "BLR-01",
    address: "100 Feet Road, Indiranagar, Bengaluru",
    manager: "Anika Rao",
    managerId: "sample-manager-1",
    phone: "+91 98765 43210",
    status: "active",
    isDefault: true,
    service: "Dine-in, delivery, takeaway",
    revenue: "Rs 4.8L",
    orders: 384,
  },
  {
    _id: "sample-branch-2",
    name: "Koramangala Express",
    branchName: "Koramangala Express",
    code: "BLR-02",
    branchCode: "BLR-02",
    address: "5th Block, Koramangala, Bengaluru",
    manager: "Rohan Mehta",
    managerId: "sample-manager-2",
    phone: "+91 98765 41023",
    status: "active",
    isDefault: false,
    service: "Delivery and takeaway",
    revenue: "Rs 3.1L",
    orders: 246,
  },
  {
    _id: "sample-branch-3",
    name: "Whitefield Bistro",
    branchName: "Whitefield Bistro",
    code: "BLR-03",
    branchCode: "BLR-03",
    address: "Phoenix Marketcity, Whitefield, Bengaluru",
    manager: "Neha S.",
    managerId: "sample-manager-3",
    phone: "+91 98765 49821",
    status: "inactive",
    isDefault: false,
    service: "Opening soon",
    revenue: "Rs 0",
    orders: 0,
  },
];

const sampleManagers = [
  {
    _id: "sample-manager-1",
    name: "Anika Rao",
    ownerName: "",
    email: "anika@flavorhub.test",
    phone: "+91 98765 43210",
    role: "manager",
    status: "active",
    branchIds: ["sample-branch-1"],
    defaultBranchId: "sample-branch-1",
  },
  {
    _id: "sample-manager-2",
    name: "Rohan Mehta",
    ownerName: "",
    email: "rohan@flavorhub.test",
    phone: "+91 98765 41023",
    role: "manager",
    status: "active",
    branchIds: ["sample-branch-2"],
    defaultBranchId: "sample-branch-2",
  },
  {
    _id: "sample-manager-3",
    name: "Neha S.",
    ownerName: "",
    email: "neha@flavorhub.test",
    phone: "+91 98765 49821",
    role: "manager",
    status: "inactive",
    branchIds: ["sample-branch-3"],
    defaultBranchId: "sample-branch-3",
  },
];

const restaurantInitialValues = {
  restaurantName: "Surya Restaurant",
  ownerName: "Surya K S",
  email: "surya@gmail.com",
  password: "123456",
  mobileNumber: "9876543210",
  GSTNumber: "33ABCDE1234F1Z5",
  address: "123 Main Road",
  city: "Chennai",
  state: "Tamil Nadu",
  country: "India",
  pincode: "600001",
  currency: "INR",
  timezone: "Asia/Kolkata",
  subscriptionPlan: "basic",
  subdomain: "surya-food",
  customDomain: "",
  branchName: "Main Branch",
  branchCode: "MB001",
  branchAddress: "123 Main Road",
  branchCity: "Chennai",
  branchState: "Tamil Nadu",
  branchPincode: "600001",
  logo: null,
};

const restaurantValidationSchema = Yup.object({
  restaurantName: Yup.string()
    .trim()
    .min(2, "Restaurant name is too short")
    .required("Restaurant name is required"),
  ownerName: Yup.string()
    .trim()
    .min(2, "Owner name is too short")
    .required("Owner name is required"),
  email: Yup.string()
    .trim()
    .email("Enter a valid email")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  mobileNumber: Yup.string()
    .matches(/^[0-9]{10}$/, "Enter a valid 10 digit mobile number")
    .required("Mobile number is required"),
  GSTNumber: Yup.string()
    .matches(
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/,
      "Enter a valid GST number",
    )
    .required("GST number is required"),
  address: Yup.string().trim().required("Address is required"),
  city: Yup.string().trim().required("City is required"),
  state: Yup.string().trim().required("State is required"),
  country: Yup.string().trim().required("Country is required"),
  pincode: Yup.string()
    .matches(/^[0-9]{6}$/, "Enter a valid 6 digit pincode")
    .required("Pincode is required"),
  currency: Yup.string().required("Currency is required"),
  timezone: Yup.string().required("Timezone is required"),
  subscriptionPlan: Yup.string().required("Subscription plan is required"),
  subdomain: Yup.string()
    .matches(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Use lowercase letters, numbers, and hyphens",
    )
    .required("Subdomain is required"),
  customDomain: Yup.string().trim(),
  branchName: Yup.string().trim().required("Branch name is required"),
  branchCode: Yup.string().trim().required("Branch code is required"),
  branchAddress: Yup.string().trim().required("Branch address is required"),
  branchCity: Yup.string().trim().required("Branch city is required"),
  branchState: Yup.string().trim().required("Branch state is required"),
  branchPincode: Yup.string()
    .matches(/^[0-9]{6}$/, "Enter a valid 6 digit pincode")
    .required("Branch pincode is required"),
  logo: Yup.mixed()
    .nullable()
    .test(
      "fileSize",
      "Logo must be 2 MB or smaller",
      (file) => !file || file.size <= 2 * 1024 * 1024,
    )
    .test("fileType", "Upload a JPG, PNG, SVG, or WEBP logo", (file) => {
      if (!file) return true;
      return [
        "image/jpeg",
        "image/png",
        "image/svg+xml",
        "image/webp",
      ].includes(file.type);
    }),
});

const managerInitialValues = {
  restaurantId: "",
  branchIds: [],
  defaultBranchId: "",
  name: "",
  ownerName: "",
  email: "",
  phone: "",
  password: "",
  role: "manager",
  permissions: "",
  status: "active",
};

const managerValidationSchema = Yup.object({
  name: Yup.string().trim().required("Manager name is required"),
  ownerName: Yup.string().trim(),
  email: Yup.string()
    .trim()
    .email("Enter a valid email")
    .required("Email is required"),
  phone: Yup.string().trim(),
  password: Yup.string().when("$isUpdate", {
    is: false,
    then: (schema) =>
      schema
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
    otherwise: (schema) =>
      schema.test(
        "optional-password-length",
        "Password must be at least 6 characters",
        (value) => !value || value.length >= 6,
      ),
  }),
  role: Yup.string()
    .oneOf(
      ["owner", "manager", "cashier", "chef", "waiter", "inventory_staff"],
      "Select a valid role",
    )
    .required("Role is required"),
  status: Yup.string()
    .oneOf(["active", "inactive", "blocked"], "Select a valid status")
    .required("Status is required"),
});

const getStoredValue = (key) => {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(key) || "";
};

const getEntityId = (item) =>
  item?._id || item?.id || item?.code || item?.email;

const normalizeList = (result, fallback = []) => {
  const data = result?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.docs)) return data.docs;
  if (Array.isArray(data?.list)) return data.list;
  if (Array.isArray(data?.branches)) return data.branches;
  if (Array.isArray(data?.users)) return data.users;
  return fallback;
};

const normalizeBranch = (branch, managers = []) => {
  const managerId =
    typeof branch?.manager === "object"
      ? getEntityId(branch.manager)
      : branch?.manager;
  const managerName =
    typeof branch?.manager === "object"
      ? branch.manager?.name
      : managers.find((manager) => getEntityId(manager) === managerId)?.name;

  return {
    ...branch,
    _id: getEntityId(branch),
    name: branch?.branchName || branch?.name || "Unnamed branch",
    branchName: branch?.branchName || branch?.name || "",
    branchCode: branch?.branchCode || branch?.code || "",
    code: branch?.code || branch?.branchCode || "",
    manager: managerName || "Unassigned",
    managerId: managerId || "",
    status: branch?.status || "active",
    service: branch?.service || "Dine-in, delivery, takeaway",
    revenue: branch?.revenue || "Rs 0",
    orders: branch?.orders ?? 0,
  };
};

const normalizeManager = (manager) => ({
  ...manager,
  _id: getEntityId(manager),
  name: manager?.name || manager?.ownerName || "Unnamed manager",
  role: manager?.role || "manager",
  status: manager?.status || "active",
  branchIds: Array.isArray(manager?.branchIds) ? manager.branchIds : [],
});

const serviceHours = [
  { day: "Mon - Thu", time: "11:00 AM - 11:00 PM" },
  { day: "Fri", time: "11:00 AM - 12:30 AM" },
  { day: "Sat - Sun", time: "10:30 AM - 12:30 AM" },
];

const channels = [
  {
    label: "QR Menu",
    detail: "Published to all live tables",
    icon: Utensils,
    status: "Active",
  },
  {
    label: "Delivery Apps",
    detail: "Swiggy and Zomato mapped",
    icon: Wifi,
    status: "Synced",
  },
  {
    label: "Table Bookings",
    detail: "Accepting reservations",
    icon: CalendarClock,
    status: "Active",
  },
];

export default function RestaurantProfilePage() {
  const [branchRows, setBranchRows] = useState(branches);
  const [managerRows, setManagerRows] = useState(sampleManagers);
  const [selectedBranch, setSelectedBranch] = useState(branches[0].code);
  const [branchSearch, setBranchSearch] = useState("");
  const [branchDrawerOpen, setBranchDrawerOpen] = useState(false);
  const [managerDrawerOpen, setManagerDrawerOpen] = useState(false);
  const [branchUpdateId, setBranchUpdateId] = useState(null);
  const [managerUpdateId, setManagerUpdateId] = useState(null);
  const [submitStatus, setSubmitStatus] = useState(null);
  const normalizedBranches = useMemo(
    () => branchRows.map((branch) => normalizeBranch(branch, managerRows)),
    [branchRows, managerRows],
  );
  const normalizedManagers = useMemo(
    () => managerRows.map((manager) => normalizeManager(manager)),
    [managerRows],
  );
  const filteredBranches = normalizedBranches.filter((branch) =>
    `${branch.name} ${branch.code} ${branch.address}`
      .toLowerCase()
      .includes(branchSearch.toLowerCase()),
  );
  const activeBranch =
    normalizedBranches.find(
      (branch) => getEntityId(branch) === selectedBranch,
    ) ?? normalizedBranches[0];

  const fetchManagers = async () => {
    try {
      const result = await action(API.GET_STAFF_LIST, { role: "manager" });
      if (result?.statusCode === 200 || result?.statusCode === 201) {
        const users = normalizeList(result, sampleManagers)
          .filter((user) => (user?.role || "manager") === "manager")
          .map(normalizeManager);
        setManagerRows(users.length ? users : sampleManagers);
      }
    } catch (error) {
      setManagerRows(sampleManagers);
    }
  };

  const fetchBranches = async () => {
    try {
      const result = await getAction(API.GET_BRANCH_LIST, {});
      if (result?.statusCode === 200 || result?.statusCode === 201) {
        const nextBranches = normalizeList(result, branches);
        setBranchRows(nextBranches.length ? nextBranches : branches);
        const firstBranch = nextBranches[0];
        if (firstBranch) {
          setSelectedBranch(getEntityId(firstBranch));
        }
      }
    } catch (error) {
      setBranchRows(branches);
    }
  };

  useEffect(() => {
    fetchManagers();
    fetchBranches();
  }, []);

  const formik = useFormik({
    initialValues: restaurantInitialValues,
    validationSchema: restaurantValidationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitStatus(null);

      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (key === "logo") {
          if (value) formData.append("logo", value);
          return;
        }

        formData.append(key, value ?? "");
      });

      try {
        const response = await fileUpload(API.CREATE_RESTAURANT, formData);

        if (response?.statusCode === 200) {
          localStorage.setItem(
            "accessToken",
            JSON.stringify(response.tokens.accessToken),
          );
          localStorage.setItem(
            "refreshToken",
            JSON.stringify(response.tokens.refreshToken),
          );

          setSubmitStatus({
            type: "success",
            message: response?.message || "Restaurant registered successfully.",
          });
        }
      } catch (error) {
        setSubmitStatus({
          type: "error",
          message:
            error.response?.data?.message ||
            error.response?.data?.error ||
            "Restaurant registration failed.",
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-screen bg-background ">
      <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="mb-2 text-sm font-medium text-accent">
            Restaurant setup
          </p>
          <h1 className="text-3xl font-bold md:text-4xl">
            Restaurant Profile & Branches
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Manage the public business profile, branch identity, operating
            hours, and channel readiness from one place.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted"
          >
            <Edit3 className="h-4 w-4" />
            Edit Profile
          </button>
          <button
            type="submit"
            form="restaurant-register-form"
            disabled={formik.isSubmitting}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-70"
          >
            {formik.isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {formik.isSubmitting ? "Registering..." : "Register Restaurant"}
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.75fr]">
        <main className="space-y-6">
          <section className="glass-card overflow-hidden rounded-lg">
            <div className="grid gap-0 lg:grid-cols-[18rem_1fr]">
              <div className="border-b border-border p-5 lg:border-b-0 lg:border-r">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">Branches</h2>
                    <p className="text-sm text-muted-foreground">
                      Choose a location to review.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setBranchUpdateId(null);
                      setBranchDrawerOpen(true);
                    }}
                    className="rounded-lg bg-primary p-2 text-primary-foreground"
                    title="Create branch"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={branchSearch}
                    onChange={(event) => setBranchSearch(event.target.value)}
                    placeholder="Search branch"
                    className="h-10 w-full rounded-lg border border-border bg-muted pl-10 pr-3 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  {filteredBranches.map((branch) => {
                    const branchId = getEntityId(branch);
                    const active = selectedBranch === branchId;

                    return (
                      <button
                        key={branchId}
                        type="button"
                        onClick={() => setSelectedBranch(branchId)}
                        className={cn(
                          "w-full rounded-lg border p-3 text-left transition-colors",
                          active
                            ? "border-primary bg-primary/10"
                            : "border-border bg-muted/20 hover:bg-muted/40",
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold">
                              {branch.name}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {branch.code}
                            </p>
                          </div>

                          <FaPen
                            className=" text-sm cursor-pointer text-gray-600"
                            onClick={() => {
                              setBranchUpdateId(getEntityId(activeBranch));
                              setBranchDrawerOpen(true);
                            }}
                          />
                        </div>
                        <div className=" flex items-center justify-between">
                          <p className="mt-3 line-clamp-2 text-xs text-muted-foreground">
                            {branch.address}
                          </p>
                          <span
                            className={cn(
                              "rounded-full px-2 py-1 text-xs font-medium",
                              branch.status === "active"
                                ? "bg-success/10 text-success"
                                : "bg-warning/10 text-warning",
                            )}
                          >
                            {branch.status === "active" ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-5">
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Store className="h-7 w-7" />
                    </div>
                    <h2 className="text-2xl font-semibold">
                      {activeBranch.name}
                    </h2>
                    <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {activeBranch.address}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <MetricCard
                    label="Today Revenue"
                    value={activeBranch.revenue}
                  />
                  <MetricCard label="Orders" value={activeBranch.orders} />
                  <MetricCard label="Branch Code" value={activeBranch.code} />
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <InfoPanel title="Branch Contact">
                    <DetailRow
                      icon={Store}
                      label="Manager"
                      value={activeBranch.manager}
                    />
                    <DetailRow
                      icon={Phone}
                      label="Phone"
                      value={activeBranch.phone}
                    />
                    <DetailRow
                      icon={Utensils}
                      label="Service"
                      value={activeBranch.service}
                    />
                  </InfoPanel>

                  <InfoPanel title="Operating Hours">
                    {serviceHours.map((slot) => (
                      <div
                        key={slot.day}
                        className="flex items-center justify-between rounded-lg bg-muted/30 p-3"
                      >
                        <span className="text-sm font-medium">{slot.day}</span>
                        <span className="text-sm text-muted-foreground">
                          {slot.time}
                        </span>
                      </div>
                    ))}
                  </InfoPanel>
                </div>
              </div>
            </div>
          </section>

          <section className="glass-card rounded-lg p-5">
            <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold">Register Restaurant</h2>
                <p className="text-sm text-muted-foreground">
                  Submit restaurant, owner, subscription, branch, and logo
                  details to the API.
                </p>
              </div>
              <span className="flex w-fit items-center gap-2 rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
                <BadgeCheck className="h-3.5 w-3.5" />
                Formik + Yup
              </span>
            </div>

            <form
              id="restaurant-register-form"
              onSubmit={formik.handleSubmit}
              className="space-y-6"
            >
              {submitStatus && (
                <div
                  className={cn(
                    "flex items-start gap-3 rounded-lg border p-3 text-sm",
                    submitStatus.type === "success"
                      ? "border-success/30 bg-success/10 text-success"
                      : "border-destructive/30 bg-destructive/10 text-destructive",
                  )}
                >
                  {submitStatus.type === "success" ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4" />
                  ) : (
                    <AlertCircle className="mt-0.5 h-4 w-4" />
                  )}
                  <span>{submitStatus.message}</span>
                </div>
              )}

              <FormGroup title="Business Details">
                <FormikInput
                  formik={formik}
                  name="restaurantName"
                  label="Restaurant Name"
                  icon={Store}
                />
                <FormikInput
                  formik={formik}
                  name="ownerName"
                  label="Owner Name"
                  icon={Building2}
                />
                <FormikInput
                  formik={formik}
                  name="email"
                  label="Email"
                  type="email"
                  icon={Globe2}
                />
                <FormikInput
                  formik={formik}
                  name="password"
                  label="Password"
                  type="password"
                  icon={ShieldCheck}
                />
                <FormikInput
                  formik={formik}
                  name="mobileNumber"
                  label="Mobile Number"
                  icon={Phone}
                />
                <FormikInput
                  formik={formik}
                  name="GSTNumber"
                  label="GST Number"
                  icon={Landmark}
                />
              </FormGroup>

              <FormGroup title="Location & Settings">
                <FormikInput
                  formik={formik}
                  name="address"
                  label="Address"
                  icon={MapPin}
                  wrapperClassName="md:col-span-2"
                />
                <FormikInput
                  formik={formik}
                  name="city"
                  label="City"
                  icon={Building2}
                />
                <FormikInput
                  formik={formik}
                  name="state"
                  label="State"
                  icon={MapPin}
                />
                <FormikInput
                  formik={formik}
                  name="country"
                  label="Country"
                  icon={Globe2}
                />
                <FormikInput
                  formik={formik}
                  name="pincode"
                  label="Pincode"
                  icon={MapPin}
                />
                <FormikSelect
                  formik={formik}
                  name="currency"
                  label="Currency"
                  options={["INR", "USD", "EUR"]}
                />
                <FormikSelect
                  formik={formik}
                  name="timezone"
                  label="Timezone"
                  options={["Asia/Kolkata", "UTC", "Asia/Dubai"]}
                />
                <FormikSelect
                  formik={formik}
                  name="subscriptionPlan"
                  label="Subscription Plan"
                  options={["basic", "standard", "premium"]}
                />
                <FormikInput
                  formik={formik}
                  name="subdomain"
                  label="Subdomain"
                  icon={Globe2}
                />
                <FormikInput
                  formik={formik}
                  name="customDomain"
                  label="Custom Domain"
                  icon={Globe2}
                />
              </FormGroup>

              <FormGroup title="Branch Details">
                <FormikInput
                  formik={formik}
                  name="branchName"
                  label="Branch Name"
                  icon={Store}
                />
                <FormikInput
                  formik={formik}
                  name="branchCode"
                  label="Branch Code"
                  icon={BadgeCheck}
                />
                <FormikInput
                  formik={formik}
                  name="branchAddress"
                  label="Branch Address"
                  icon={MapPin}
                  wrapperClassName="md:col-span-2"
                />
                <FormikInput
                  formik={formik}
                  name="branchCity"
                  label="Branch City"
                  icon={Building2}
                />
                <FormikInput
                  formik={formik}
                  name="branchState"
                  label="Branch State"
                  icon={MapPin}
                />
                <FormikInput
                  formik={formik}
                  name="branchPincode"
                  label="Branch Pincode"
                  icon={MapPin}
                />
                <LogoInput formik={formik} />
              </FormGroup>

              <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  API endpoint: {restaurantApiUrl}
                </p>
                <button
                  type="submit"
                  disabled={formik.isSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-70 sm:w-fit"
                >
                  {formik.isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {formik.isSubmitting
                    ? "Registering..."
                    : "Register Restaurant"}
                </button>
              </div>
            </form>
          </section>
        </main>

        <aside className="space-y-6">
          {/* <section className="glass-card rounded-lg p-5">
            <h2 className="text-lg font-semibold">Profile Completion</h2>
            <p className="mb-5 text-sm text-muted-foreground">
              Ready to publish across guest touchpoints.
            </p>
            <div className="mb-4 h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full w-[86%] rounded-full bg-primary" />
            </div>
            <div className="space-y-3">
              <ChecklistItem label="Business details added" complete />
              <ChecklistItem label="Primary branch live" complete />
              <ChecklistItem label="Compliance numbers verified" complete />
              <ChecklistItem label="Cover image pending" />
            </div>
          </section>

          <section className="glass-card rounded-lg p-5">
            <h2 className="text-lg font-semibold">Channel Status</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Where this profile is currently used.
            </p>
            <div className="space-y-3">
              {channels.map((channel) => (
                <div key={channel.label} className="rounded-lg bg-muted/30 p-3">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="rounded-lg bg-primary/10 p-2 text-primary">
                        <channel.icon className="h-4 w-4" />
                      </span>
                      <p className="text-sm font-medium">{channel.label}</p>
                    </div>
                    <span className="rounded-full bg-success/10 px-2 py-1 text-xs text-success">
                      {channel.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {channel.detail}
                  </p>
                </div>
              ))}
            </div>
          </section> */}

          <section className="glass-card rounded-lg p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Managers</h2>
                <p className="text-sm text-muted-foreground">
                  Branch manager access and assignments.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setManagerUpdateId(null);
                  setManagerDrawerOpen(true);
                }}
                className="rounded-lg bg-primary p-2 text-primary-foreground"
                title="Add manager"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              {normalizedManagers.map((manager) => (
                <div
                  key={getEntityId(manager)}
                  className="rounded-lg border border-border bg-muted/20 p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
                        {manager.name
                          .split(" ")
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)}
                      </span>
                      <div>
                        <p className="text-sm font-semibold">{manager.name}</p>
                        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {manager.email || "No email"}
                        </p>
                        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {manager.phone || "No phone"}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setManagerUpdateId(getEntityId(manager));
                        setManagerDrawerOpen(true);
                      }}
                      className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                      title="Manage manager"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="rounded-full bg-primary/10 px-2 py-1 text-primary">
                      {manager.role}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-1",
                        manager.status === "active"
                          ? "bg-success/10 text-success"
                          : "bg-warning/10 text-warning",
                      )}
                    >
                      {manager.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="glass-card rounded-lg p-5">
            <h2 className="text-lg font-semibold">Receipt Header</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Preview for this branch.
            </p>
            <div className="rounded-lg bg-muted/30 p-4 text-center">
              <p className="text-lg font-semibold">Flavor Hub</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {activeBranch.name}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {activeBranch.address}
              </p>
              <div className="my-4 border-t border-dashed border-border" />
              <p className="text-xs text-muted-foreground">
                GSTIN: 29ABCDE1234F1Z5
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Thank you for dining with us
              </p>
            </div>
          </section>
        </aside>
      </div>

      <AddBranch
        open={branchDrawerOpen}
        updateId={branchUpdateId}
        branches={normalizedBranches}
        managers={normalizedManagers}
        onOpenChange={(nextOpen) => {
          setBranchDrawerOpen(nextOpen);
          if (!nextOpen) setBranchUpdateId(null);
        }}
        onSaved={() => {
          fetchBranches();
          fetchManagers();
        }}
      />

      <AddManager
        open={managerDrawerOpen}
        updateId={managerUpdateId}
        branches={normalizedBranches}
        managers={normalizedManagers}
        onOpenChange={(nextOpen) => {
          setManagerDrawerOpen(nextOpen);
          if (!nextOpen) setManagerUpdateId(null);
        }}
        onSaved={() => {
          fetchManagers();
          fetchBranches();
        }}
      />
    </div>
  );
}

function ManagerDrawer({
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

  const formik = useFormik({
    initialValues: managerInitialValues,
    validationSchema: managerValidationSchema,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      if (!isUpdate && !values.password) {
        formik.setFieldTouched("password", true);
        formik.setFieldError("password", "Password is required");
        setSubmitting(false);
        return;
      }

      try {
        const payload = {
          ...values,
          restaurantId: values.restaurantId || getStoredValue("restaurantId"),
          name: values.name.trim(),
          ownerName: values.ownerName.trim(),
          email: values.email.trim().toLowerCase(),
          phone: values.phone.trim(),
          permissions: values.permissions
            ? values.permissions
                .split(",")
                .map((permission) => permission.trim())
                .filter(Boolean)
            : [],
        };

        if (isUpdate && !payload.password) {
          delete payload.password;
        }

        const result = await action(
          isUpdate ? `${API.UPDATE_USER}/${updateId}` : API.CREATE_USER,
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

        message?.error(
          result?.message ||
            (isUpdate ? "Unable to update manager" : "Unable to add manager"),
        );
      } catch (error) {
        message.error(
          isUpdate ? "Unable to update manager" : "Unable to add manager",
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

  const getManagerDetails = async (id) => {
    try {
      const result = await getAction(`${API.GET_USER_BY_ID}/${id}`);
      const manager = result?.data;
      if (
        (result?.statusCode === 200 || result?.statusCode === 201) &&
        manager
      ) {
        formik.setValues({
          restaurantId: manager.restaurantId || getStoredValue("restaurantId"),
          branchIds: Array.isArray(manager.branchIds) ? manager.branchIds : [],
          defaultBranchId: manager.defaultBranchId || "",
          name: manager.name || "",
          ownerName: manager.ownerName || "",
          email: manager.email || "",
          phone: manager.phone || "",
          password: "",
          role: manager.role || "manager",
          permissions: Array.isArray(manager.permissions)
            ? manager.permissions.join(", ")
            : "",
          status: manager.status || "active",
        });
      }
    } catch (error) {
      message.error("Unable to fetch manager details");
    }
  };

  useEffect(() => {
    if (!open) return;

    if (updateId && String(updateId).startsWith("sample-")) {
      const manager = managers.find((item) => getEntityId(item) === updateId);
      formik.setValues({
        restaurantId: manager?.restaurantId || getStoredValue("restaurantId"),
        branchIds: Array.isArray(manager?.branchIds) ? manager.branchIds : [],
        defaultBranchId: manager?.defaultBranchId || "",
        name: manager?.name || "",
        ownerName: manager?.ownerName || "",
        email: manager?.email || "",
        phone: manager?.phone || "",
        password: "",
        role: manager?.role || "manager",
        permissions: Array.isArray(manager?.permissions)
          ? manager.permissions.join(", ")
          : "",
        status: manager?.status || "active",
      });
      return;
    }

    if (updateId) {
      getManagerDetails(updateId);
      return;
    }

    formik.setValues({
      ...managerInitialValues,
      restaurantId: getStoredValue("restaurantId"),
    });
  }, [open, updateId]);

  const branchOptions = branches.map((branch) => ({
    label: branch.name,
    value: getEntityId(branch),
  }));

  return (
    <DrawerPop
      open={show}
      close={closeDrawer}
      header={[
        isUpdate ? "Update Manager" : "Add Manager",
        isUpdate
          ? "Update manager profile, role, access, and branch assignment."
          : "Create manager access for one or more branches.",
      ]}
      handleSubmit={formik.handleSubmit}
      footerBtn={["Cancel", "Save"]}
      footerBtnDisabled={formik.isSubmitting}
      loadingButton={formik.isSubmitting}
    >
      <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
        <div className="grid gap-4 md:grid-cols-2">
          <AntInput
            label="Name"
            name="name"
            placeholder="Manager name"
            value={formik.values.name}
            error={getError("name")}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          <AntInput
            label="Owner Name"
            name="ownerName"
            placeholder="Optional owner name"
            value={formik.values.ownerName}
            error={getError("ownerName")}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          <AntInput
            label="Email"
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
          <AntPasswordInput
            label={isUpdate ? "Password (optional)" : "Password"}
            name="password"
            placeholder={
              isUpdate
                ? "Leave blank to keep current password"
                : "Create password"
            }
            value={formik.values.password}
            error={getError("password")}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          <AntSelect
            label="Role"
            value={formik.values.role}
            error={getError("role")}
            options={[
              { label: "Manager", value: "manager" },
              { label: "Cashier", value: "cashier" },
              { label: "Chef", value: "chef" },
              { label: "Waiter", value: "waiter" },
              { label: "Inventory Staff", value: "inventory_staff" },
              { label: "Owner", value: "owner" },
            ]}
            onChange={(value) => formik.setFieldValue("role", value)}
            onBlur={() => formik.setFieldTouched("role", true)}
          />
          <AntSelect
            label="Branch Access"
            mode="multiple"
            value={formik.values.branchIds}
            error={getError("branchIds")}
            options={branchOptions}
            placeholder="Select branches"
            onChange={(value) => formik.setFieldValue("branchIds", value)}
            onBlur={() => formik.setFieldTouched("branchIds", true)}
          />
          <AntSelect
            label="Default Branch"
            value={formik.values.defaultBranchId || undefined}
            allowClear
            options={branchOptions}
            placeholder="Select default branch"
            onChange={(value) =>
              formik.setFieldValue("defaultBranchId", value || "")
            }
            onBlur={() => formik.setFieldTouched("defaultBranchId", true)}
          />
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

        <AntTextArea
          label="Permissions"
          name="permissions"
          placeholder="Comma separated permissions, eg: orders.read, staff.manage"
          value={formik.values.permissions}
          error={getError("permissions")}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
      </div>
    </DrawerPop>
  );
}

function FormGroup({ title, children }) {
  return (
    <fieldset>
      <legend className="mb-4 text-sm font-semibold">{title}</legend>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{children}</div>
    </fieldset>
  );
}

function FormikInput({
  formik,
  name,
  label,
  icon: Icon,
  type = "text",
  wrapperClassName,
}) {
  const showError = Boolean(formik.touched[name] && formik.errors[name]);

  return (
    <label className={cn("block", wrapperClassName)}>
      <span className="mb-2 block text-sm font-medium">{label}</span>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          name={name}
          type={type}
          value={formik.values[name]}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={cn(
            "h-10 w-full rounded-lg border bg-muted px-3 pl-10 text-sm outline-none focus:border-primary",
            showError ? "border-destructive" : "border-border",
          )}
        />
      </div>
      {showError && (
        <p className="mt-1 text-xs text-destructive">{formik.errors[name]}</p>
      )}
    </label>
  );
}

function FormikSelect({ formik, name, label, options }) {
  const showError = Boolean(formik.touched[name] && formik.errors[name]);

  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium">{label}</span>
      <select
        name={name}
        value={formik.values[name]}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        className={cn(
          "h-10 w-full rounded-lg border bg-muted px-3 text-sm outline-none focus:border-primary",
          showError ? "border-destructive" : "border-border",
        )}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {showError && (
        <p className="mt-1 text-xs text-destructive">{formik.errors[name]}</p>
      )}
    </label>
  );
}

function LogoInput({ formik }) {
  const showError = Boolean(formik.touched.logo && formik.errors.logo);

  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium">Logo</span>
      <div
        className={cn(
          "flex min-h-10 items-center gap-3 rounded-lg border bg-muted px-3 py-2",
          showError ? "border-destructive" : "border-border",
        )}
      >
        <ImagePlus className="h-4 w-4 text-muted-foreground" />
        <input
          name="logo"
          type="file"
          accept="image/png,image/jpeg,image/svg+xml,image/webp"
          onBlur={formik.handleBlur}
          onChange={(event) => {
            formik.setFieldValue(
              "logo",
              event.currentTarget.files?.[0] ?? null,
            );
          }}
          className="w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground"
        />
      </div>
      {showError && (
        <p className="mt-1 text-xs text-destructive">{formik.errors.logo}</p>
      )}
    </label>
  );
}

function MetricCard({ label, value }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function InfoPanel({ title, children }) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 p-4">
      <h3 className="mb-4 text-sm font-semibold">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-muted/30 p-3">
      <span className="rounded-lg bg-primary/10 p-2 text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

function ChecklistItem({ label, complete = false }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-muted/30 p-3">
      <span className="flex items-center gap-3 text-sm">
        {complete ? (
          <CheckCircle2 className="h-4 w-4 text-success" />
        ) : (
          <Clock3 className="h-4 w-4 text-warning" />
        )}
        {label}
      </span>
      <span
        className={cn("text-xs", complete ? "text-success" : "text-warning")}
      >
        {complete ? "Done" : "Pending"}
      </span>
    </div>
  );
}
