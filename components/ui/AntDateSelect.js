"use client";

import { DatePicker } from "antd";
import { cn } from "@/lib/utils";
import { FieldIcon } from "@/components/ui/field-icons";

const pickerThemeClass =
  "w-full !border-border !bg-card !text-foreground placeholder:!text-muted-foreground hover:!bg-card focus:!border-primary focus:!bg-card [&_.ant-picker-suffix]:!text-primary [&_.ant-picker-clear]:!text-destructive";

export function AntDateSelect({
  label,
  error,
  className,
  wrapperClassName,
  placeholder = "Select date",
  size = "large",
  variant = "filled",
  format = "DD/MM/YYYY",
  required = false,
  icon,
  ...props
}) {
  return (
    <label className={cn("block", wrapperClassName)}>
      {label && (
        <span className="mb-2 block text-sm font-medium">
          {label}
          {required && <span className="ml-0.5 text-destructive">*</span>}
        </span>
      )}
      <DatePicker
        size={size}
        variant={variant}
        status={error ? "error" : undefined}
        format={format}
        placeholder={placeholder}
        prefix={icon ? <FieldIcon icon={icon} error={!!error} /> : undefined}
        className={cn(pickerThemeClass, className)}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </label>
  );
}

export function AntDateRangeSelect({
  label,
  error,
  className,
  wrapperClassName,
  placeholder = ["From date", "To date"],
  size = "large",
  variant = "filled",
  format = "DD/MM/YYYY",
  required = false,
  ...props
}) {
  return (
    <label className={cn("block", wrapperClassName)}>
      {label && (
        <span className="mb-2 block text-sm font-medium">
          {label}
          {required && <span className="ml-0.5 text-destructive">*</span>}
        </span>
      )}
      <DatePicker.RangePicker
        size={size}
        variant={variant}
        status={error ? "error" : undefined}
        format={format}
        placeholder={placeholder}
        className={cn(pickerThemeClass, className)}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </label>
  );
}

export default AntDateSelect;
