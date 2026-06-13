"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MobileSidebar, Sidebar } from "./sidebar";
import { TopNav } from "./top-nav";
import SidebarNew from "./sidebarNew";

export function DashboardLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-background text-foreground" />;
  }

  return (
    <div className="h-screen overflow-hidden bg-background text-foreground">
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              onClick={(event) => event.stopPropagation()}
            >
              <MobileSidebar onClose={() => setMobileMenuOpen(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex h-full">
        <div className="shrink-0 h-full">
          <SidebarNew
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed((value) => !value)}
          />
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopNav onMenuToggle={() => setMobileMenuOpen((value) => !value)} />
          <main className="flex-1 overflow-y-auto bg-background p-4">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
