"use client";

import { Select } from "antd";
import { cn } from "@/lib/utils";

const selectThemeClass =
  "w-full !bg-card !border-border !text-foreground placeholder:!text-muted-foreground hover:!bg-card hover:!border-primary focus:!bg-card focus:!border-primary [&_.ant-select-selector]:!bg-transparent";

export function AntSelect({
  label,
  error,
  className,
  popupClassName,
  wrapperClassName,
  options = [],
  placeholder = "Select",
  size = "large",
  variant = "filled",
  ...props
}) {
  return (
    <label className={cn("block", wrapperClassName)}>
      {label && (
        <span className="mb-2 block text-sm font-medium ">{label}</span>
      )}
      <Select
        size={size}
        variant={variant}
        status={error ? "error" : undefined}
        options={options}
        placeholder={placeholder}
        className={cn(selectThemeClass, className)}
        classNames={{
          popup: { root: cn("app-ant-select-popup", popupClassName) },
        }}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </label>
  );
}
