"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
  AlignLeft,
  AlignRight,
  Check,
  Globe,
  Monitor,
  Moon,
  Palette,
  QrCode,
  Sun,
  Type,
} from "lucide-react";
import { Switch } from "antd";
import { cn } from "@/lib/utils";
import Heading from "@/components/ui/Heading";
import { AntInput } from "@/components/ui/AntInput";
import { AntSelect } from "@/components/ui/AntSelect";
import AntTextArea from "@/components/ui/AntTextArea";

/* ─── Constants ─────────────────────────────────────────────────────────── */

const ACCENT_COLORS = [
  { name: "Indigo", hue: 260, hex: "#6366f1" },
  { name: "Blue", hue: 230, hex: "#3b82f6" },
  { name: "Cyan", hue: 200, hex: "#06b6d4" },
  { name: "Teal", hue: 180, hex: "#14b8a6" },
  { name: "Green", hue: 145, hex: "#22c55e" },
  { name: "Orange", hue: 50, hex: "#f97316" },
  { name: "Red", hue: 25, hex: "#ef4444" },
  { name: "Rose", hue: 355, hex: "#f43f5e" },
  { name: "Violet", hue: 290, hex: "#a855f7" },
  { name: "Pink", hue: 320, hex: "#ec4899" },
];

const RADIUS_OPTIONS = [
  { label: "Sharp", value: "0rem" },
  { label: "Default", value: "0.75rem" },
  { label: "Rounded", value: "1.25rem" },
  { label: "Pill", value: "2rem" },
];

const FONT_SIZE_OPTIONS = [
  { label: "Small", value: "14px" },
  { label: "Default", value: "16px" },
  { label: "Large", value: "18px" },
];

const LANGUAGES = [
  { label: "English", value: "en" },
  { label: "Arabic (عربي)", value: "ar" },
  { label: "Hindi (हिंदी)", value: "hi" },
  { label: "Tamil (தமிழ்)", value: "ta" },
  { label: "French (Français)", value: "fr" },
  { label: "Spanish (Español)", value: "es" },
  { label: "German (Deutsch)", value: "de" },
];

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function applyAccentColor(hue) {
  const root = document.documentElement;
  const isDark = root.classList.contains("dark");
  const L = isDark ? "0.7" : "0.58";
  const C = "0.2";
  const val = `oklch(${L} ${C} ${hue})`;
  root.style.setProperty("--primary", val);
  root.style.setProperty("--ring", val);
  root.style.setProperty("--sidebar-primary", val);
  root.style.setProperty("--sidebar-ring", val);
}

function applyRadius(radius) {
  document.documentElement.style.setProperty("--radius", radius);
}

function applyFontSize(size) {
  document.documentElement.style.fontSize = size;
}

function applyDirection(dir) {
  document.documentElement.setAttribute("dir", dir);
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function AppearancePage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [accentHue, setAccentHue] = useState(260);
  const [radius, setRadius] = useState("0.75rem");
  const [fontSize, setFontSize] = useState("16px");
  const [language, setLanguage] = useState("en");
  const [direction, setDirection] = useState("ltr");

  // QR Order Site settings
  const [qrEnabled, setQrEnabled] = useState(true);
  const [qrSiteName, setQrSiteName] = useState("");
  const [qrWelcome, setQrWelcome] = useState("");
  const [qrShowPrices, setQrShowPrices] = useState(true);
  const [qrAllowOrders, setQrAllowOrders] = useState(true);
  const [qrShowImages, setQrShowImages] = useState(true);
  const [qrTableMode, setQrTableMode] = useState(true);

  useEffect(() => {
    setMounted(true);

    const h = Number(localStorage.getItem("themeHue")) || 260;
    const r = localStorage.getItem("themeRadius") || "0.75rem";
    const f = localStorage.getItem("themeFontSize") || "16px";
    const lang = localStorage.getItem("appLanguage") || "en";
    const dir = localStorage.getItem("appDirection") || "ltr";
    const qrOn = localStorage.getItem("qrEnabled") !== "false";
    const qrName = localStorage.getItem("qrSiteName") || "";
    const qrMsg = localStorage.getItem("qrWelcome") || "";
    const qrPrices = localStorage.getItem("qrShowPrices") !== "false";
    const qrOrders = localStorage.getItem("qrAllowOrders") !== "false";
    const qrImgs = localStorage.getItem("qrShowImages") !== "false";
    const qrTable = localStorage.getItem("qrTableMode") !== "false";

    setAccentHue(h);
    setRadius(r);
    setFontSize(f);
    setLanguage(lang);
    setDirection(dir);
    setQrEnabled(qrOn);
    setQrSiteName(qrName);
    setQrWelcome(qrMsg);
    setQrShowPrices(qrPrices);
    setQrAllowOrders(qrOrders);
    setQrShowImages(qrImgs);
    setQrTableMode(qrTable);

    applyAccentColor(h);
    applyRadius(r);
    applyFontSize(f);
    applyDirection(dir);
  }, []);

  const handleAccent = (hue) => {
    setAccentHue(hue);
    applyAccentColor(hue);
    localStorage.setItem("themeHue", String(hue));
  };

  const handleRadius = (val) => {
    setRadius(val);
    applyRadius(val);
    localStorage.setItem("themeRadius", val);
  };

  const handleFontSize = (val) => {
    setFontSize(val);
    applyFontSize(val);
    localStorage.setItem("themeFontSize", val);
  };

  const handleLanguage = (val) => {
    setLanguage(val);
    document.documentElement.setAttribute("lang", val);
    localStorage.setItem("appLanguage", val);
  };

  const handleDirection = (dir) => {
    setDirection(dir);
    applyDirection(dir);
    localStorage.setItem("appDirection", dir);
  };

  const saveQr = (key, value) => {
    localStorage.setItem(key, String(value));
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-8 max-w-3xl pb-16">
      <Heading
        title="Appearance"
        description="Customize the look and feel of your dashboard"
      />

      {/* ── Theme ── */}
      <SettingsCard>
        <SectionHeader
          icon={Sun}
          title="Theme"
          description="Switch between light, dark, or follow your system preference"
        />
        <div className="mt-5 grid grid-cols-3 gap-4">
          {[
            { key: "light", label: "Light", Icon: Sun },
            { key: "dark", label: "Dark", Icon: Moon },
            { key: "system", label: "System", Icon: Monitor },
          ].map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setTheme(key)}
              className={cn(
                "flex flex-col items-center gap-3 rounded-xl border-2 p-4 transition-all",
                theme === key
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40 hover:bg-muted/40",
              )}
            >
              <ThemePreview mode={key} />
              <span className="flex items-center gap-1.5 text-sm font-medium">
                <Icon className="h-3.5 w-3.5" />
                {label}
              </span>
              {theme === key && (
                <span className="text-[10px] font-semibold uppercase tracking-wide text-primary">
                  Active
                </span>
              )}
            </button>
          ))}
        </div>
      </SettingsCard>

      {/* ── Accent Color ── */}
      <SettingsCard>
        <SectionHeader
          icon={Palette}
          title="Accent Color"
          description="Changes the primary color used for buttons, links, and highlights"
        />
        <div className="mt-5 flex flex-wrap gap-3">
          {ACCENT_COLORS.map((color) => (
            <button
              key={color.hue}
              onClick={() => handleAccent(color.hue)}
              title={color.name}
              className={cn(
                "relative h-9 w-9 rounded-lg transition-all",
                accentHue === color.hue
                  ? "scale-110 ring-2 ring-offset-2 ring-foreground"
                  : "hover:scale-105",
              )}
              style={{ backgroundColor: color.hex }}
            >
              {accentHue === color.hue && (
                <Check className="absolute inset-0 m-auto h-4 w-4 text-white drop-shadow-sm" />
              )}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Selected:{" "}
          <span className="font-medium">
            {ACCENT_COLORS.find((c) => c.hue === accentHue)?.name || "Custom"}
          </span>
        </p>
      </SettingsCard>

      {/* ── Layout ── */}
      <SettingsCard>
        <SectionHeader
          icon={Type}
          title="Layout"
          description="Border radius and font size for the entire interface"
        />
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-medium">Corner Style</p>
            <div className="flex gap-2">
              {RADIUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleRadius(opt.value)}
                  className={cn(
                    "flex-1 rounded-lg border px-2 py-2 text-xs font-medium transition-all",
                    radius === opt.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/40",
                  )}
                  style={{ borderRadius: opt.value }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">Font Size</p>
            <div className="flex gap-2">
              {FONT_SIZE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleFontSize(opt.value)}
                  className={cn(
                    "flex-1 rounded-lg border px-2 py-2 text-xs font-medium transition-all",
                    fontSize === opt.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/40",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </SettingsCard>

      {/* ── Language & Direction ── */}
      <SettingsCard>
        <SectionHeader
          icon={Globe}
          title="Language & Direction"
          description="Display language and text flow direction"
        />
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <AntSelect
            label="Language"
            value={language}
            options={LANGUAGES}
            onChange={handleLanguage}
          />

          <div>
            <p className="mb-2 text-sm font-medium">Text Direction</p>
            <div className="flex gap-3">
              {[
                {
                  dir: "ltr",
                  label: "LTR",
                  sub: "Left to Right",
                  Icon: AlignLeft,
                },
                {
                  dir: "rtl",
                  label: "RTL",
                  sub: "Right to Left",
                  Icon: AlignRight,
                },
              ].map(({ dir, label, sub, Icon }) => (
                <button
                  key={dir}
                  onClick={() => handleDirection(dir)}
                  className={cn(
                    "flex flex-1 items-center gap-2.5 rounded-xl border px-4 py-3 text-left transition-all",
                    direction === dir
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0",
                      direction === dir
                        ? "text-primary"
                        : "text-muted-foreground",
                    )}
                  />
                  <div>
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        direction === dir ? "text-primary" : "",
                      )}
                    >
                      {label}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{sub}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </SettingsCard>

      {/* ── QR Order Site ── */}
      <SettingsCard>
        <div className="flex items-start justify-between gap-4">
          <SectionHeader
            icon={QrCode}
            title="QR Order Site"
            description="Configure the customer-facing QR menu and ordering experience"
          />
          <Switch
            checked={qrEnabled}
            onChange={(v) => {
              setQrEnabled(v);
              saveQr("qrEnabled", v);
            }}
          />
        </div>

        {qrEnabled && (
          <div className="mt-5 space-y-5 rounded-xl border border-border bg-muted/30 p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <AntInput
                label="Site Name"
                placeholder="Eg: FlavorHub Menu"
                value={qrSiteName}
                onChange={(e) => {
                  setQrSiteName(e.target.value);
                  saveQr("qrSiteName", e.target.value);
                }}
              />
            </div>

            <AntTextArea
              label="Welcome Message"
              placeholder="Eg: Welcome! Scan to browse our menu and order directly from your table."
              rows={2}
              value={qrWelcome}
              onChange={(e) => {
                setQrWelcome(e.target.value);
                saveQr("qrWelcome", e.target.value);
              }}
            />

            <div className="space-y-3 pt-1">
              <p className="text-sm font-medium">Features</p>
              <ToggleRow
                label="Show Prices"
                description="Display item prices on the QR menu"
                checked={qrShowPrices}
                onChange={(v) => {
                  setQrShowPrices(v);
                  saveQr("qrShowPrices", v);
                }}
              />
              <ToggleRow
                label="Allow Ordering"
                description="Customers can place orders directly via QR scan"
                checked={qrAllowOrders}
                onChange={(v) => {
                  setQrAllowOrders(v);
                  saveQr("qrAllowOrders", v);
                }}
              />
              <ToggleRow
                label="Show Item Images"
                description="Display food photos on the digital menu"
                checked={qrShowImages}
                onChange={(v) => {
                  setQrShowImages(v);
                  saveQr("qrShowImages", v);
                }}
              />
              <ToggleRow
                label="Table-Specific Mode"
                description="QR links are tied to individual table numbers"
                checked={qrTableMode}
                onChange={(v) => {
                  setQrTableMode(v);
                  saveQr("qrTableMode", v);
                }}
              />
            </div>
          </div>
        )}
      </SettingsCard>
    </div>
  );
}

/* ─── Sub-components ─────────────────────────────────────────────────────── */

function SettingsCard({ children }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">{children}</div>
  );
}

function SectionHeader({ icon: Icon, title, description }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 rounded-lg bg-primary/10 p-2">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div>
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-background px-4 py-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onChange={onChange} size="small" />
    </div>
  );
}

function ThemePreview({ mode }) {
  const isDark = mode === "dark";
  const isSys = mode === "system";

  if (isSys) {
    return (
      <div className="relative h-14 w-full overflow-hidden rounded-lg border border-border">
        <div className="absolute inset-0 left-0 w-1/2 bg-white" />
        <div className="absolute inset-0 right-0 left-1/2 bg-[#0f172a]" />
        <div className="absolute inset-x-0 bottom-2 mx-2 flex gap-1">
          <div className="h-2 flex-1 rounded bg-gray-200/60" />
          <div className="h-2 flex-1 rounded bg-gray-600/40" />
        </div>
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border" />
        <Monitor className="absolute inset-0 m-auto h-5 w-5 text-muted-foreground opacity-50" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "h-14 w-full rounded-lg border border-border overflow-hidden flex flex-col gap-1 p-2",
        isDark ? "bg-[#0f172a]" : "bg-white",
      )}
    >
      <div
        className={cn(
          "h-2 w-3/4 rounded-sm",
          isDark ? "bg-slate-700" : "bg-gray-200",
        )}
      />
      <div
        className={cn(
          "h-2 w-1/2 rounded-sm",
          isDark ? "bg-slate-800" : "bg-gray-100",
        )}
      />
      <div
        className={cn(
          "mt-1 h-3 w-2/3 rounded-sm",
          isDark ? "bg-indigo-500/50" : "bg-indigo-400/40",
        )}
      />
    </div>
  );
}
