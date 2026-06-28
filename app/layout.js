import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import "./plugin.css";
import "@/components/assets/css/style.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ConfigProvider } from "antd";
import AntdApp from "@/components/AntdApp";

export const metadata = {
  title: "Flavor Hub | Restaurant Management",
  description: "Premium restaurant management dashboard for modern hospitality",
  generator: "v0.app",
};

export const viewport = {
  themeColor: "#1a1625",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ConfigProvider
          theme={{
            token: {
              // colorBgContainer: "var(--input)",
              // colorBorder: "var(--border)",
              // colorText: "var(--foreground)",
              // colorTextPlaceholder: "var(--muted-foreground)",
              // colorPrimary: "var(--primary)",
              // borderRadius: 6,
            },
            components: {
              Input: {
                // colorBgContainer: "var(--input)",
              },
              Button: {
                colorPrimary: "var(--primary)",
                colorPrimaryHover: "var(--primary)",
                colorPrimaryActive: "var(--primary)",
              },
              Table: {
                colorBgContainer: "var(--card)",
                headerBg: "var(--card)",
                headerColor: "var(--foreground)",
                borderColor: "var(--border)",
                colorText: "var(--foreground)",
              },
            },
          }}
        >
          <AntdApp>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem={false}
              disableTransitionOnChange
            >
              {children}
            </ThemeProvider>
          </AntdApp>
        </ConfigProvider>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}
