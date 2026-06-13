"use client"

import { motion } from "framer-motion"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  { name: "Mon", revenue: 4200, orders: 45 },
  { name: "Tue", revenue: 5800, orders: 62 },
  { name: "Wed", revenue: 4900, orders: 51 },
  { name: "Thu", revenue: 7200, orders: 78 },
  { name: "Fri", revenue: 8900, orders: 95 },
  { name: "Sat", revenue: 9800, orders: 110 },
  { name: "Sun", revenue: 7500, orders: 82 },
]

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-xl">
      <p className="font-medium">{label}</p>
      <p className="text-sm text-primary">Revenue: ${payload[0]?.value?.toLocaleString()}</p>
      <p className="text-sm text-accent">Orders: {payload[1]?.value}</p>
    </div>
  )
}

export function RevenueChart() {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card h-full rounded-lg p-5">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Weekly Revenue</h3>
          <p className="text-sm text-muted-foreground">Sales performance</p>
        </div>
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary" />
            Revenue
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-accent" />
            Orders
          </span>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.25} />
                <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="name" stroke="var(--muted-foreground)" />
            <YAxis stroke="var(--muted-foreground)" tickFormatter={(value) => `$${value / 1000}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="revenue" stroke="var(--primary)" fill="url(#revenueGradient)" strokeWidth={2} />
            <Area type="monotone" dataKey="orders" stroke="var(--accent)" fill="url(#ordersGradient)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
