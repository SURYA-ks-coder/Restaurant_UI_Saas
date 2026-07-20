"use client";

import { Input } from "antd";
import { cn } from "@/lib/utils";
import {
  FieldIcon,
  resolveFieldIcon,
  TextAreaFallbackIcon,
} from "@/components/ui/field-icons";

const textAreaThemeClass =
  "w-full !border-border !bg-card !text-foreground placeholder:!text-muted-foreground focus:!border-primary focus:!bg-card";

export function AntTextArea({
  label,
  error,
  className,
  wrapperClassName,
  rows = 4,
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
          placeholder: props.placeholder,
          fallback: TextAreaFallbackIcon,
        })
      : icon;

  return (
    <label className={cn("block", wrapperClassName)}>
      {label && (
        <span className="mb-2 flex items-center gap-1.5 text-sm font-medium">
          <FieldIcon icon={resolvedIcon} error={!!error} />
          <span>
            {label}
            {required && <span className="ml-0.5 text-destructive">*</span>}
          </span>
        </span>
      )}
      <Input.TextArea
        rows={rows}
        variant={variant}
        status={error ? "error" : undefined}
        className={cn(textAreaThemeClass, className)}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </label>
  );
}

export default AntTextArea;
