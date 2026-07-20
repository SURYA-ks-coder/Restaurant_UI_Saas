"use client";

import { useEffect, useState } from "react";
import { ConfigProvider } from "antd";
import { useTheme } from "next-themes";
import { lightTheme, darkTheme, withAccentColor } from "@/lib/antd-theme";

export default function AntdConfigProvider({ children }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [accentHex, setAccentHex] = useState(null);

  useEffect(() => {
    setMounted(true);
    setAccentHex(localStorage.getItem("themeAccentHex"));

    // Fired by the Appearance page whenever the user picks a new accent
    // color, so AntD components update without a full page reload.
    const handleAccentChange = (e) => setAccentHex(e.detail.hex);
    window.addEventListener("accent-color-change", handleAccentChange);
    return () =>
      window.removeEventListener("accent-color-change", handleAccentChange);
  }, []);

  // Matches ThemeProvider's defaultTheme="dark" until the client mounts,
  // so the antd theme never flashes/mismatches the .dark class on <html>.
  const mode = mounted ? resolvedTheme : "dark";
  const baseTheme = mode === "dark" ? darkTheme : lightTheme;

  return (
    <ConfigProvider theme={withAccentColor(baseTheme, accentHex)}>
      {children}
    </ConfigProvider>
  );
}
