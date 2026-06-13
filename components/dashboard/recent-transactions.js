"use client"

import { motion } from "framer-motion"
import { Banknote, CreditCard, Smartphone } from "lucide-react"

const transactions = [
  { id: "TXN-001", type: "card", amount: "$156.80", table: "Table 5", time: "2 min ago", card: "Card 4242" },
  { id: "TXN-002", type: "cash", amount: "$48.50", table: "Table 12", time: "8 min ago", card: "Cash payment" },
  { id: "TXN-003", type: "mobile", amount: "$92.00", table: "Table 3", time: "15 min ago", card: "Apple Pay" },
  { id: "TXN-004", type: "card", amount: "$234.20", table: "Table 8", time: "22 min ago", card: "Card 1234" },
  { id: "TXN-005", type: "mobile", amount: "$67.40", table: "Delivery", time: "35 min ago", card: "Google Pay" },
]

const typeConfig = {
  card: { icon: CreditCard, color: "text-primary bg-primary/10" },
  cash: { icon: Banknote, color: "text-success bg-success/10" },
  mobile: { icon: Smartphone, color: "text-accent bg-accent/10" },
}

export function RecentTransactions() {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-lg p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Recent Transactions</h3>
          <p className="text-sm text-muted-foreground">Latest payments</p>
        </div>
        <button className="text-sm text-primary">View all</button>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {transactions.map((transaction, index) => {
          const config = typeConfig[transaction.type]
          const Icon = config.icon
          return (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="rounded-lg bg-muted/30 p-3"
            >
              <div className={`mb-3 inline-flex rounded-lg p-2 ${config.color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-sm font-medium">{transaction.table}</p>
              <p className="text-xs text-muted-foreground">{transaction.card}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{transaction.time}</span>
                <span className="font-semibold">{transaction.amount}</span>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
