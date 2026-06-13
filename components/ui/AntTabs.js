"use client"

import { Tabs } from "antd"
import { cn } from "@/lib/utils"

export function AntTabs({
  items = [],
  className,
  size = "middle",
  type = "line",
  ...props
}) {
  return (
    <Tabs
      items={items}
      size={size}
      type={type}
      className={cn("restaurant-tabs", className)}
      {...props}
    />
  )
}
