"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { AnimatePresence, motion } from "framer-motion";
import { MobileSidebar } from "./sidebar";
import { TopNav } from "./top-nav";
import SidebarNew from "./sidebarNew";
import {
  clearAuthData,
  getAccessToken,
  getPreferences,
  TAB_MARKER_KEY,
} from "@/lib/auth";
import { applyPreferences } from "@/lib/theme-helpers";
import { connectSocket } from "@/components/services/socket";
import { joinBranch } from "@/components/socket/kotSocketActions";
import { useIdleLogout } from "@/hooks/use-idle-logout";
import ModalAnt from "@/components/ui/ModalAnt";
import ButtonClick from "@/components/ui/ButtonClick";

// sessionStorage survives a same-tab refresh but is wiped when the tab/window
// actually closes, so a missing marker on boot means this tab is "new" against
// whatever session was left in localStorage — treat that as a closed-tab logout.
// The marker (TAB_MARKER_KEY) is set by saveAuthData on login and here on boot.


export function DashboardLayout({ children }) {
  const router = useRouter();
  const { setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  // Keyed onto <main> so the active page remounts (and refetches) on branch switch.
  const [branchKey, setBranchKey] = useState("");

  useEffect(() => {
    setBranchKey(localStorage.getItem("branchId") || "");
    const onBranchChanged = (e) => {
      const branchId = e.detail?.branchId ?? localStorage.getItem("branchId") ?? "";
      setBranchKey(branchId);
      if (branchId) joinBranch(branchId);
    };
    window.addEventListener("branchChanged", onBranchChanged);
    return () => window.removeEventListener("branchChanged", onBranchChanged);
  }, []);

  useEffect(() => {
    // Establish the realtime connection once per session so the bell (TopNav)
    // and any other dashboard page can receive notification:new / order events,
    // instead of relying on the Kitchen page happening to be open.
    const token = getAccessToken();
    if (!token) return;
    connectSocket({ token });
    const branchId = localStorage.getItem("branchId");
    if (branchId) joinBranch(branchId);
  }, []);

  useEffect(() => {
    // If this tab has no continuity marker, whatever session sits in localStorage
    // belongs to a tab that was previously closed — end it before checking the token.
    const hadTabMarker = sessionStorage.getItem(TAB_MARKER_KEY) === "1";
    sessionStorage.setItem(TAB_MARKER_KEY, "1");
    if (!hadTabMarker) {
      clearAuthData();
    }

    // Auth guard runs FIRST — if no token, redirect before rendering anything
    const token = getAccessToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    const prefs = getPreferences();
    applyPreferences(prefs);
    if (prefs.theme) setTheme(prefs.theme);
    setMounted(true);
  }, [router, setTheme]);

  const handleLogout = useCallback(() => {
    clearAuthData();
    router.replace("/login");
  }, [router]);

  const { idleOpen, idleCountdown, handleStayLoggedIn, handleIdleLogout } =
    useIdleLogout(handleLogout);

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
              <MobileSidebar
                onClose={() => setMobileMenuOpen(false)}
                onLogout={handleLogout}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rail sidebar is fixed-position and desktop-only — content offsets by
          its 80px width only at lg+; mobile navigates via the hamburger drawer */}
      <SidebarNew onLogout={handleLogout} />

      <div className="flex h-full flex-col overflow-hidden lg:ml-20">
        <TopNav
          onMenuToggle={() => setMobileMenuOpen((value) => !value)}
          onLogout={handleLogout}
        />
        <main
          key={branchKey}
          className="flex-1 overflow-y-auto bg-background p-2 sm:p-4"
        >
          {children}
        </main>
      </div>

      <ModalAnt
        isVisible={idleOpen}
        centered={true}
        padding="8px"
        showCancelButton={false}
        showOkButton={false}
        showCloseButton={false}
        width="440px"
      >
        <div className="flex flex-col gap-4 justify-center items-center pt-6 pb-2">
          <p className="text-xl font-semibold text-center">⏱️ Session Idle</p>
          <p className="text-sm text-center text-gray-500 dark:text-gray-400">
            You have been inactive for 1 hour. Do you want to stay logged in?
          </p>
          <p className="text-sm text-center font-medium text-red-500">
            Logging out in{" "}
            <span className="font-bold">{idleCountdown}</span> second
            {idleCountdown !== 1 ? "s" : ""}...
          </p>
          <div className="flex gap-3">
            <ButtonClick
              BtnType="primary"
              buttonName="Stay Logged In"
              handleSubmit={handleStayLoggedIn}
            />
            <ButtonClick
              BtnType="cancel"
              buttonName="Logout"
              handleSubmit={handleIdleLogout}
            />
          </div>
        </div>
      </ModalAnt>
    </div>
  );
}
