"use client";

import { motion } from "framer-motion";
import {
  Check,
  CheckCircle,
  ChefHat,
  Clock,
  Truck,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { action, API } from "@/lib/API";
import { useEffect, useState } from "react";

const orders = [
  {
    id: "#1234",
    table: "Table 5",
    items: 3,
    status: "preparing",
    time: "5 min",
    total: "$48.50",
  },
  {
    id: "#1233",
    table: "Table 12",
    items: 5,
    status: "ready",
    time: "12 min",
    total: "$92.00",
  },
  {
    id: "#1232",
    table: "Delivery",
    items: 2,
    status: "delivered",
    time: "18 min",
    total: "$34.00",
  },
  {
    id: "#1231",
    table: "Table 3",
    items: 4,
    status: "pending",
    time: "2 min",
    total: "$67.80",
  },
];

const statusConfig = {
  pending: {
    icon: Clock,
    color: "bg-warning/20 text-warning",
    label: "Pending",
  },
  preparing: {
    icon: ChefHat,
    color: "bg-primary/20 text-primary",
    label: "Preparing",
  },
  ready: { icon: Check, color: "bg-success/20 text-success", label: "Ready" },
  delivered: {
    icon: Truck,
    color: "bg-muted text-muted-foreground",
    label: "Delivered",
  },
  paid: {
    label: "Paid",
    color: "text-emerald-600",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-600",
    icon: XCircle,
  },
};

export function LiveOrders() {
  const [liveOrders, setLiveOrders] = useState([]);

  const getLiveOrdersList = async () => {
    try {
      const result = await action(API.TODAY_LIVE_ORDERS, {
        page: 1,
        limit: 20,
      });
      if (result.statusCode === 200) {
        const orders = result.data;
        setLiveOrders(orders);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getLiveOrdersList();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card h-full rounded-lg p-5"
    >
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Live Orders</h3>
          <p className="text-sm text-muted-foreground">Real-time tracking</p>
        </div>
        <span className="flex items-center gap-2 text-xs text-success">
          <span className="h-2 w-2 rounded-full bg-success pulse-live" />
          Live
        </span>
      </div>

      <div className="space-y-3">
        {liveOrders.map((order, index) => {
          const status = statusConfig[order.status];
          console.log(status, "status");
          const Icon = status?.icon;

          return (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-lg border border-border bg-muted/30 p-3"
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {Icon && <Icon className="h-4 w-4 text-primary" />}
                  <span className="font-medium">{order.billNo}</span>
                  <Badge variant="secondary">{order?.tableId?.tableName}</Badge>
                </div>
                <p className="font-semibold">{order.total}</p>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {order.items?.length} items •{" "}
                  {new Date(order.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span className={status?.color + " rounded-full px-2 py-0.5"}>
                  {status?.label}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <button className="mt-5 w-full rounded-lg border border-border py-2 text-sm font-medium hover:bg-muted">
        View all orders
      </button>
    </motion.div>
  );
}
