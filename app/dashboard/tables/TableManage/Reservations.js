"use client";

import { message } from "@/lib/message";

import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
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

dayjs.extend(customParseFormat);

const initialValues = {
  restaurantId: "",
  branchId: "",
  guestName: "",
  phone: "",
  email: "",
  partySize: "",
  reservationDate: "",
  reservationTime: "",
  tableId: "",
  status: "reserved",
  specialRequests: "",
};

const reservationValidationSchema = Yup.object({
  guestName: Yup.string()
    .trim()
    .min(2, "Guest name must be at least 2 characters")
    .max(80, "Guest name must be 80 characters or less")
    .required("Guest name is required"),
  phone: Yup.string()
    .trim()
    .min(7, "Phone number must be at least 7 characters")
    .max(20, "Phone number must be 20 characters or less")
    .required("Phone number is required"),
  email: Yup.string()
    .trim()
    .email("Enter a valid email")
    .nullable()
    .notRequired(),
  partySize: Yup.number()
    .typeError("Party size must be a number")
    .integer("Party size must be a whole number")
    .min(1, "Party size must be at least 1")
    .required("Party size is required"),
  reservationDate: Yup.string().required("Reservation date is required"),
  reservationTime: Yup.string().required("Reservation time is required"),
  tableId: Yup.string().required("Table is required"),
  status: Yup.string()
    .oneOf(
      ["reserved", "confirmed", "seated", "cancelled"],
      "Select a valid status",
    )
    .required("Status is required"),
  specialRequests: Yup.string()
    .trim()
    .max(300, "Special requests must be 300 characters or less")
    .nullable()
    .notRequired(),
});

const statusOptions = [
  { label: "Reserved", value: "reserved" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Seated", value: "seated" },
  { label: "Cancelled", value: "cancelled" },
];

const numberOrEmpty = (value) => (value || value === 0 ? value : "");

function SectionTitle({ children }) {
  return (
    <div className="border-b border-border pb-2 pt-2 text-sm font-semibold text-accent">
      {children}
    </div>
  );
}

export default function Reservations({
  open,
  onOpenChange,
  onCreated,
  updateId = null,
}) {
  const [show, setShow] = useState(open);
  const [tables, setTables] = useState([]);
  const isUpdate = Boolean(updateId);

  useEffect(() => {
    setShow(open);
  }, [open]);

  const tableOptions = useMemo(() => {
    return tables.map((table) => ({
      label: `${table.tableName || "Table"} ${table.tableNumber || ""} - ${
        table.capacity || table.seats || 0
      } seats`,
      value: String(table._id || table.id),
    }));
  }, [tables]);

  const formik = useFormik({
    initialValues,
    validationSchema: reservationValidationSchema,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        const selectedTable = tables.find(
          (table) => String(table._id || table.id) === values.tableId,
        );
        const payload = {
          ...values,
          restaurantId: LocalStorageData.restaurantId,
          branchId: LocalStorageData.branchId,
          guestName: values.guestName.trim(),
          phone: values.phone.trim(),
          email: values.email.trim(),
          partySize: Number(values.partySize),
          tableName: selectedTable?.tableName || "",
          tableNumber: selectedTable?.tableNumber || selectedTable?.number || "",
          specialRequests: values.specialRequests.trim(),
        };

        const result = await action(
          isUpdate
            ? `${API.UPDATE_RESERVATION}/${updateId}`
            : API.CREATE_RESERVATION,
          payload,
          isUpdate ? "PATCH" : "POST",
        );

        if (result?.statusCode === 200 || result?.statusCode === 201) {
          message.success(result?.message);
          resetForm();
          onCreated?.(result?.data || payload);
          onOpenChange(false);
          return;
        }

        message.error(
          result?.message ||
            (isUpdate
              ? "Unable to update reservation"
              : "Unable to create reservation"),
        );
      } catch (error) {
        message.error(
          isUpdate
            ? "Unable to update reservation"
            : "Unable to create reservation",
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

  const getTableList = async () => {
    try {
      const result = await getAction(API.GET_TABLE_LIST);
      if (result?.statusCode === 200) {
        setTables(result?.data || []);
      }
    } catch (error) {
      message.error("Unable to fetch tables");
    }
  };

  const getReservationDetails = async (id) => {
    try {
      const result = await getAction(`${API.GET_RESERVATION_BY_ID}/${id}`);
      if (result?.statusCode === 200) {
        const reservation = result?.data;

        if (reservation) {
          formik.setValues({
            restaurantId: reservation.restaurantId || "",
            branchId: reservation.branchId || "",
            guestName: reservation.guestName || reservation.guest || "",
            phone: reservation.phone || "",
            email: reservation.email || "",
            partySize: numberOrEmpty(
              reservation.partySize || reservation.seats || reservation.guests,
            ),
            reservationDate: reservation.reservationDate || reservation.date || "",
            reservationTime: reservation.reservationTime || reservation.time || "",
            tableId:
              reservation.tableId ||
              reservation.table?._id ||
              reservation.table ||
              "",
            status: reservation.status || "reserved",
            specialRequests:
              reservation.specialRequests || reservation.notes || "",
          });
        }
      }
    } catch (error) {
      message.error("Unable to fetch reservation details");
    }
  };

  useEffect(() => {
    if (!open) return;

    getTableList();

    if (updateId) {
      getReservationDetails(updateId);
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
        isUpdate ? "Update Reservation" : "New Reservation",
        isUpdate
          ? "Update this guest reservation and table assignment."
          : "Create a guest reservation for this restaurant branch.",
      ]}
      handleSubmit={formik.handleSubmit}
      footerBtn={["Cancel", "Save"]}
      footerBtnDisabled={formik.isSubmitting}
      loadingButton={formik.isSubmitting}
      width={720}
    >
      <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
        <SectionTitle>Guest Details</SectionTitle>
        <div className="grid gap-4 md:grid-cols-2">
          <AntInput
            label="Guest Name"
            name="guestName"
            placeholder="Eg: Priya Mehta"
            value={formik.values.guestName}
            error={getError("guestName")}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          <AntInput
            label="Phone Number"
            name="phone"
            placeholder="Eg: +91 98765 43210"
            value={formik.values.phone}
            error={getError("phone")}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          <AntInput
            label="Email"
            name="email"
            type="email"
            placeholder="guest@example.com"
            value={formik.values.email}
            error={getError("email")}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          <AntInput
            label="Party Size"
            name="partySize"
            type="number"
            min={1}
            placeholder="Number of guests"
            value={formik.values.partySize}
            error={getError("partySize")}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
        </div>

        <SectionTitle>Reservation Details</SectionTitle>
        <div className="grid gap-4 md:grid-cols-2">
          <AntInput
            label="Reservation Date"
            name="reservationDate"
            type="date"
            value={formik.values.reservationDate}
            error={getError("reservationDate")}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          <AntTimeSelect
            label="Reservation Time"
            value={
              formik.values.reservationTime
                ? dayjs(formik.values.reservationTime, "hh:mm A")
                : null
            }
            error={getError("reservationTime")}
            onChange={(value) =>
              formik.setFieldValue(
                "reservationTime",
                value ? value.format("hh:mm A") : "",
              )
            }
            onBlur={() => formik.setFieldTouched("reservationTime", true)}
          />
          <AntSelect
            label="Table"
            value={formik.values.tableId || undefined}
            error={getError("tableId")}
            options={tableOptions}
            placeholder="Select table"
            onChange={(value) => formik.setFieldValue("tableId", value)}
            onBlur={() => formik.setFieldTouched("tableId", true)}
          />
          <AntSelect
            label="Status"
            value={formik.values.status}
            error={getError("status")}
            options={statusOptions}
            placeholder="Select status"
            onChange={(value) => formik.setFieldValue("status", value)}
            onBlur={() => formik.setFieldTouched("status", true)}
          />
        </div>

        <AntTextArea
          label="Special Requests"
          name="specialRequests"
          placeholder="Dietary notes, seating preference, celebration details"
          value={formik.values.specialRequests}
          error={getError("specialRequests")}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
      </div>
    </DrawerPop>
  );
}
