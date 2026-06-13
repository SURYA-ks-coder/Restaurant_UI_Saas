"use client"

import { motion } from "framer-motion"
import { AlertCircle, ChefHat } from "lucide-react"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"

const stations = [
  { name: "Grill Station", orders: 5, capacity: 8 },
  { name: "Saute Station", orders: 3, capacity: 6 },
  { name: "Pastry Station", orders: 4, capacity: 5 },
  { name: "Cold Station", orders: 2, capacity: 6 },
]

const pendingOrders = [
  { id: "#1234", table: "T5", items: ["Wagyu Steak", "Truffle Pasta"], time: "5:23", urgent: false },
  { id: "#1235", table: "T12", items: ["Lobster Bisque", "Caesar Salad"], time: "3:45", urgent: true },
  { id: "#1236", table: "T3", items: ["Chocolate Lava"], time: "2:10", urgent: false },
]

export function KitchenStatus() {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-lg p-5">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <ChefHat className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Kitchen Status</h3>
            <p className="text-sm text-muted-foreground">Live station overview</p>
          </div>
        </div>
        <span className="text-xs text-success">All Systems Go</span>
      </div>

      <div className="space-y-4">
        {stations.map((station) => {
          const utilization = (station.orders / station.capacity) * 100
          return (
            <div key={station.name}>
              <div className="mb-2 flex justify-between text-sm">
                <span>{station.name}</span>
                <span className="text-muted-foreground">
                  {station.orders}/{station.capacity} orders
                </span>
              </div>
              <Progress value={utilization} className={cn(utilization >= 80 ? "[&>div]:bg-warning" : "[&>div]:bg-primary")} />
            </div>
          )
        })}
      </div>

      <div className="mt-5 space-y-2">
        <div className="flex justify-between text-sm">
          <span>Active Orders</span>
          <span className="text-muted-foreground">{pendingOrders.length} pending</span>
        </div>
        {pendingOrders.map((order) => (
          <div key={order.id} className="flex items-center justify-between rounded-lg bg-muted/30 p-3">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium">
                {order.id}
                <span className="text-xs text-muted-foreground">{order.time}</span>
              </div>
              <p className="text-xs text-muted-foreground">{order.items.join(", ")}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">{order.table}</span>
              {order.urgent && <AlertCircle className="h-4 w-4 text-warning" />}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
