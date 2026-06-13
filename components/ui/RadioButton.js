"use client";

import { Radio } from "antd";
import { cn } from "@/lib/utils";

export default function RadioButton({
  label,
  error,
  options = [],
  wrapperClassName,
  className,
  onBlur = () => {},
  change = () => {},
  value = null,
  ...props
}) {
  return (
    <label className={cn("block", wrapperClassName)}>
      {label && <span className="mb-2 block text-sm font-medium">{label}</span>}

      <Radio.Group
        className={cn("flex flex-wrap gap-4", className)}
        {...props}
        value={value}
        onChange={(event) => change(event.target.value)}
        onBlur={() => onBlur()}
      >
        {options.map((item) => (
          <Radio key={item.value} value={item.value}>
            {item.label}
          </Radio>
        ))}
      </Radio.Group>

      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </label>
  );
}
