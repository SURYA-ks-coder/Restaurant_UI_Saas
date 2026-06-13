"use client"

import { motion } from "framer-motion"
import { TrendingUp } from "lucide-react"

const items = [
  { name: "Wagyu Beef Steak", category: "Main Course", orders: 142, revenue: "$4,260", trend: "+12%" },
  { name: "Truffle Pasta", category: "Pasta", orders: 98, revenue: "$2,940", trend: "+8%" },
  { name: "Lobster Bisque", category: "Soup", orders: 87, revenue: "$2,175", trend: "+15%" },
  { name: "Chocolate Lava", category: "Dessert", orders: 76, revenue: "$1,140", trend: "+5%" },
]

export function PopularItems() {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-lg p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Popular Items</h3>
          <p className="text-sm text-muted-foreground">Top selling dishes</p>
        </div>
        <button className="text-sm text-primary">View menu</button>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center justify-between rounded-lg bg-muted/30 p-3"
          >
            <div>
              <p className="text-sm font-medium">{item.name}</p>
              <p className="text-xs text-muted-foreground">
                {item.category} • {item.orders} orders
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold">{item.revenue}</p>
              <span className="inline-flex items-center gap-1 text-xs text-success">
                <TrendingUp className="h-3 w-3" />
                {item.trend}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
