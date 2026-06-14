import React from "react";

export default function AddRestaurant() {
  const restaurantInitialValues = {
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
    <section className="glass-card rounded-lg p-5">
      <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Register Restaurant</h2>
          <p className="text-sm text-muted-foreground">
            Submit restaurant, owner, subscription, branch, and logo details to
            the API.
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
            {formik.isSubmitting ? "Registering..." : "Register Restaurant"}
          </button>
        </div>
      </form>
    </section>
  );
}
