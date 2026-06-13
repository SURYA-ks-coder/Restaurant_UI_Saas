"use client"

import { motion } from "framer-motion"
import { AlertTriangle, Clock, Sparkles, TrendingUp, Users } from "lucide-react"

const insights = [
  {
    icon: TrendingUp,
    title: "Revenue Forecast",
    description: "Projected 18% increase this weekend based on historical data",
    color: "text-success bg-success/10",
  },
  {
    icon: Users,
    title: "Staff Optimization",
    description: "Schedule 2 extra servers for Saturday dinner rush",
    color: "text-primary bg-primary/10",
  },
  {
    icon: AlertTriangle,
    title: "Inventory Alert",
    description: "Fresh salmon stock will need reordering by Thursday",
    color: "text-warning bg-warning/10",
  },
  {
    icon: Clock,
    title: "Peak Hours",
    description: "Busiest period: 7-9 PM. Average table turnover: 1.2 hours",
    color: "text-accent bg-accent/10",
  },
]

export function AIInsights() {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-lg p-5">
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">AI Insights</h3>
          <p className="text-sm text-muted-foreground">Smart recommendations</p>
        </div>
      </div>

      <div className="space-y-3">
        {insights.map((insight, index) => {
          const Icon = insight.icon
          return (
            <motion.div
              key={insight.title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              className="flex gap-3 rounded-lg bg-muted/30 p-3"
            >
              <div className={`h-fit rounded-lg p-2 ${insight.color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">{insight.title}</p>
                <p className="text-xs text-muted-foreground">{insight.description}</p>
              </div>
            </motion.div>
          )
        })}
      </div>

      <button className="mt-5 w-full rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground">
        Generate Full Report
      </button>
    </motion.div>
  )
}
