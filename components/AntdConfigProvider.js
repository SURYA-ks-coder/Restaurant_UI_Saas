"use client";

import { useEffect, useState } from "react";
import { ConfigProvider } from "antd";
import { useTheme } from "next-themes";
import { lightTheme, darkTheme } from "@/lib/antd-theme";

export default function AntdConfigProvider({ children }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Matches ThemeProvider's defaultTheme="dark" until the client mounts,
  // so the antd theme never flashes/mismatches the .dark class on <html>.
  const mode = mounted ? resolvedTheme : "dark";

  return (
    <ConfigProvider theme={mode === "dark" ? darkTheme : lightTheme}>
      {children}
    </ConfigProvider>
  );
}
