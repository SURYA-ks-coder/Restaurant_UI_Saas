"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const IDLE_LIMIT_MS = 60 * 60 * 1000; // show the warning after 1 hour of inactivity
const COUNTDOWN_SECONDS = 60; // grace period on the modal before auto logout
const ACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "scroll",
  "touchstart",
  "wheel",
];

export function useIdleLogout(onLogout) {
  const [idleOpen, setIdleOpen] = useState(false);
  const [idleCountdown, setIdleCountdown] = useState(COUNTDOWN_SECONDS);
  const lastActivityRef = useRef(Date.now());
  const idleOpenRef = useRef(false);

  useEffect(() => {
    idleOpenRef.current = idleOpen;
  }, [idleOpen]);

  const resetIdleTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  // Any interaction resets the idle clock, but only while the warning isn't showing —
  // once it's up, only the modal buttons should be able to dismiss it.
  useEffect(() => {
    const handler = () => {
      if (!idleOpenRef.current) resetIdleTimer();
    };
    ACTIVITY_EVENTS.forEach((evt) =>
      window.addEventListener(evt, handler, { passive: true }),
    );
    return () => {
      ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, handler));
    };
  }, [resetIdleTimer]);

  useEffect(() => {
    const check = setInterval(() => {
      if (idleOpenRef.current) return;
      if (Date.now() - lastActivityRef.current >= IDLE_LIMIT_MS) {
        setIdleCountdown(COUNTDOWN_SECONDS);
        setIdleOpen(true);
      }
    }, 1000);
    return () => clearInterval(check);
  }, []);

  useEffect(() => {
    if (!idleOpen) return;
    if (idleCountdown <= 0) {
      setIdleOpen(false);
      onLogout();
      return;
    }
    const timer = setTimeout(() => setIdleCountdown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [idleOpen, idleCountdown, onLogout]);

  const handleStayLoggedIn = useCallback(() => {
    resetIdleTimer();
    setIdleCountdown(COUNTDOWN_SECONDS);
    setIdleOpen(false);
  }, [resetIdleTimer]);

  const handleIdleLogout = useCallback(() => {
    setIdleOpen(false);
    onLogout();
  }, [onLogout]);

  return { idleOpen, idleCountdown, handleStayLoggedIn, handleIdleLogout };
}
