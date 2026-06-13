"use client";

import { Input } from "antd";
import { cn } from "@/lib/utils";

const inputThemeClass =
  "w-full !border-border  !text-foreground placeholder:!text-muted-foreground  focus:!border-primary  [&_input]:!bg-transparent [&_input]:!text-foreground [&_input::placeholder]:!text-muted-foreground";

export function AntInput({
  label,
  error,
  className,
  wrapperClassName,
  size = "large",
  variant = "filled",
  ...props
}) {
  return (
    <label className={cn("block", wrapperClassName)}>
      {label && <span className="mb-2 block text-sm font-medium">{label}</span>}
      <Input
        size={size}
        variant={variant}
        status={error ? "error" : undefined}
        className={cn(inputThemeClass, className, error && "!border-rose-400")}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </label>
  );
}

export function AntPasswordInput({
  label,
  error,
  className,
  wrapperClassName,
  size = "large",
  variant = "filled",
  ...props
}) {
  return (
    <label className={cn("block", wrapperClassName)}>
      {label && <span className="mb-2 block text-sm font-medium">{label}</span>}
      <Input.Password
        size={size}
        variant={variant}
        status={error ? "error" : undefined}
        className={cn(inputThemeClass, className)}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </label>
  );
}
