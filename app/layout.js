import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import "./plugin.css";
import "@/components/assets/css/style.css";
import { ThemeProvider } from "@/components/theme-provider";
import AntdConfigProvider from "@/components/AntdConfigProvider";
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
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AntdConfigProvider>
            <AntdApp>{children}</AntdApp>
          </AntdConfigProvider>
        </ThemeProvider>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}
