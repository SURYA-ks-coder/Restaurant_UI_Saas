"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { API, getAction } from "@/lib/API";
import { useEffect, useState } from "react";

const tables = [
  { id: 1, seats: 2, status: "occupied", time: "45m" },
  { id: 2, seats: 4, status: "available" },
  { id: 3, seats: 4, status: "occupied", time: "1h 20m" },
  { id: 4, seats: 6, status: "reserved", time: "7:30 PM" },
  { id: 5, seats: 2, status: "occupied", time: "25m" },
  { id: 6, seats: 4, status: "available" },
  { id: 7, seats: 8, status: "reserved", time: "8:00 PM" },
  { id: 8, seats: 2, status: "cleaning", time: "5m" },
  { id: 9, seats: 4, status: "occupied", time: "55m" },
  { id: 10, seats: 6, status: "available" },
  { id: 11, seats: 4, status: "occupied", time: "30m" },
  { id: 12, seats: 2, status: "reserved", time: "8:30 PM" },
];

const statusConfig = {
  available: { color: "bg-success/20 border-success/40", dot: "bg-success" },
  occupied: { color: "bg-primary/20 border-primary/40", dot: "bg-primary" },
  reserved: { color: "bg-warning/20 border-warning/40", dot: "bg-warning" },
  cleaning: {
    color: "bg-muted border-muted-foreground/20",
    dot: "bg-muted-foreground",
  },
};

export function TableStatus() {
  // const statusCounts = {
  //   available: tables.filter((table) => table.status === "available").length,
  //   occupied: tables.filter((table) => table.status === "occupied").length,
  //   reserved: tables.filter((table) => table.status === "reserved").length,
  //   cleaning: tables.filter((table) => table.status === "cleaning").length,
  // };
  const [tableList, setTableList] = useState([]);
  const [statusCounts, setStatusCounts] = useState({});

  const getTableListList = async () => {
    try {
      const result = await getAction(API.GET_ACTIVE_TABLES);
      if (result.statusCode === 200) {
        const table = result.data;
        setTableList(table);
        setStatusCounts({
          available: table.filter((table) => table.status === "available")
            .length,
          occupied: table.filter((table) => table.status === "occupied").length,
          reserved: table.filter((table) => table.status === "reserved").length,
          cleaning: table.filter((table) => table.status === "cleaning").length,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getTableListList();
  }, []);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-lg p-5"
    >
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Table Status</h3>
          <p className="text-sm text-muted-foreground">Floor overview</p>
        </div>
        <button className="text-sm text-primary">Manage</button>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        {Object.entries(statusCounts).map(([status, count]) => (
          <span key={status} className="capitalize">
            {status} ({count})
          </span>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-2">
        {tableList?.map((table, index) => {
          const config = statusConfig[table.status];
          return (
            <motion.button
              key={table.tableNumber}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.02 }}
              className={cn(
                "aspect-square rounded-lg border p-2 text-left",
                config.color,
              )}
            >
              <span className="flex items-center justify-between text-sm font-semibold">
                {table.tableNumber}
                <span className={cn("h-2 w-2 rounded-full", config.dot)} />
              </span>
              <span className="mt-3 block text-xs text-muted-foreground">
                {new Date(table.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }) || `${table.capacity}p`}
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
