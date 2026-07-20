"use client";

import { TimePicker } from "antd";
import { cn } from "@/lib/utils";
import { FieldIcon } from "@/components/ui/field-icons";

const selectThemeClass =
  "w-full !border-border !bg-card !text-foreground placeholder:!text-muted-foreground hover:!bg-card focus:!border-primary focus:!bg-card [&_.ant-picker-suffix]:!text-primary [&_.ant-picker-clear]:!text-destructive";

export function AntTimeSelect({
  label,
  error,
  className,
  wrapperClassName,
  format = "hh:mm",
  // minuteStep = 5,
  placeholder = "Select time",
  size = "large",
  variant = "filled",
  use12Hours = true,
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
      <TimePicker
        size={size}
        variant={variant}
        status={error ? "error" : undefined}
        format={format}
        // minuteStep={minuteStep}
        placeholder={placeholder}
        use12Hours={use12Hours}
        prefix={icon ? <FieldIcon icon={icon} error={!!error} /> : undefined}
        className={cn(selectThemeClass, className)}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </label>
  );
}
