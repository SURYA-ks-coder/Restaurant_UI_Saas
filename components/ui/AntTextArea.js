"use client";

import { Input } from "antd";
import { cn } from "@/lib/utils";

const textAreaThemeClass =
  "w-full !border-border !text-foreground placeholder:!text-muted-foreground  focus:!border-primary ";

export function AntTextArea({
  label,
  error,
  className,
  wrapperClassName,
  rows = 4,
  variant = "filled",
  ...props
}) {
  return (
    <label className={cn("block", wrapperClassName)}>
      {label && <span className="mb-2 block text-sm font-medium">{label}</span>}
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
