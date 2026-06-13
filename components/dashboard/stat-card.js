"use client"

import { motion } from "framer-motion"
import { TrendingDown, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

export function StatCard({ title, value, change, changeType = "neutral", icon: Icon, className, delay = 0 }) {
  const PositiveIcon = changeType === "negative" ? TrendingDown : TrendingUp

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className={cn("glass-card rounded-lg p-5", className)}
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="rounded-lg bg-primary/10 p-3 text-primary">{Icon && <Icon className="h-5 w-5" />}</div>
        {change && (
          <div
            className={cn(
              "flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
              changeType === "negative" ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"
            )}
          >
            <PositiveIcon className="h-3 w-3" />
            {change}
          </div>
        )}
      </div>
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </motion.div>
  )
}
