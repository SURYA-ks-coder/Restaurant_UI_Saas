"use client";

import { Select } from "antd";
import { cn } from "@/lib/utils";
import {
  FieldIcon,
  resolveFieldIcon,
  SelectFallbackIcon,
} from "@/components/ui/field-icons";

const selectThemeClass =
  "w-full !bg-card !border-border !text-foreground placeholder:!text-muted-foreground hover:!bg-card hover:!border-primary focus:!bg-card focus:!border-primary [&_.ant-select-selector]:!bg-transparent [&_.ant-select-arrow]:!text-primary [&_.ant-select-prefix]:!me-2";

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
  required = false,
  icon,
  ...props
}) {
  const resolvedIcon =
    icon === undefined
      ? resolveFieldIcon({
          label,
          name: props.name,
          placeholder,
          fallback: SelectFallbackIcon,
        })
      : icon;

  return (
    <label className={cn("block", wrapperClassName)}>
      {label && (
        <span className="mb-2 block text-sm font-medium">
          {label}
          {required && <span className="ml-0.5 text-destructive">*</span>}
        </span>
      )}
      <Select
        size={size}
        variant={variant}
        status={error ? "error" : undefined}
        options={options}
        placeholder={placeholder}
        prefix={
          resolvedIcon ? (
            <FieldIcon icon={resolvedIcon} error={!!error} />
          ) : undefined
        }
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
