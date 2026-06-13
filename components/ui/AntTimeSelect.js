"use client";

import { TimePicker } from "antd";
import { cn } from "@/lib/utils";

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
  ...props
}) {
  const selectThemeClass =
    "w-full !border-border !bg-muted/40 !text-foreground placeholder:!text-muted-foreground hover:!bg-muted/50 focus:!border-primary focus:!bg-muted/40 ";

  return (
    <label className={cn("block", wrapperClassName)}>
      {label && <span className="mb-2 block text-sm font-medium">{label}</span>}
      <TimePicker
        size={size}
        variant={variant}
        status={error ? "error" : undefined}
        format={format}
        // minuteStep={minuteStep}
        placeholder={placeholder}
        use12Hours={use12Hours}
        className={cn(selectThemeClass, className)}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </label>
  );
}
