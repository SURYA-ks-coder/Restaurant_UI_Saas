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
import { API, action, getAction, patchAction } from "@/lib/API";
import { getPreferences, getRestaurantId, setCachedPreferences } from "@/lib/auth";
import { message } from "@/lib/message";
import {
  ACCENT_COLORS,
  applyAccentColor,
  applyDirection,
  applyFontSize,
  applyLanguageAttr,
  applyRadius,
} from "@/lib/theme-helpers";

/* ─── Constants ─────────────────────────────────────────────────────────── */

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

// Maps this page's local QR toggle state to the qrSiteConfig field the
// server persists on the Restaurant document.
const QR_FIELD_MAP = {
  qrEnabled: "enabled",
  qrSiteName: "siteName",
  qrWelcome: "welcomeMessage",
  qrShowPrices: "showPrices",
  qrAllowOrders: "allowOrders",
  qrShowImages: "showImages",
  qrTableMode: "tableMode",
};

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

    // Paint instantly from the copy cached at login, then reconcile with the
    // server in case it changed on another device since then.
    const cached = getPreferences();
    applyFromPreferences(cached);

    (async () => {
      const result = await getAction(API.GET_PREFERENCES);
      if (result?.statusCode === 200 && result.data) {
        setCachedPreferences(result.data);
        applyFromPreferences(result.data);
        if (result.data.theme) setTheme(result.data.theme);
      }
    })();

    const restaurantId = getRestaurantId();
    if (!restaurantId) return;
    (async () => {
      const result = await getAction(`${API.GET_RESTAURANT_BY_ID}/${restaurantId}`);
      const qr = result?.data?.qrSiteConfig;
      if (result?.statusCode === 200 && qr) {
        setQrEnabled(qr.enabled !== false);
        setQrSiteName(qr.siteName || "");
        setQrWelcome(qr.welcomeMessage || "");
        setQrShowPrices(qr.showPrices !== false);
        setQrAllowOrders(qr.allowOrders !== false);
        setQrShowImages(qr.showImages !== false);
        setQrTableMode(qr.tableMode !== false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applyFromPreferences(prefs) {
    if (!prefs) return;
    if (prefs.accentHue != null) setAccentHue(prefs.accentHue);
    if (prefs.radius) setRadius(prefs.radius);
    if (prefs.fontSize) setFontSize(prefs.fontSize);
    if (prefs.language) setLanguage(prefs.language);
    if (prefs.direction) setDirection(prefs.direction);

    applyAccentColor(
      prefs.accentHue ?? 260,
      prefs.accentHex || ACCENT_COLORS.find((c) => c.hue === prefs.accentHue)?.hex,
    );
    applyRadius(prefs.radius);
    applyFontSize(prefs.fontSize);
    applyDirection(prefs.direction);
    applyLanguageAttr(prefs.language);
  }

  const savePreferences = async (partial) => {
    setCachedPreferences(partial);
    try {
      const result = await patchAction(API.UPDATE_PREFERENCES, partial);
      if (result?.statusCode !== 200) {
        message.error(result?.message || "Unable to save preference");
      }
    } catch {
      message.error("Unable to save preference");
    }
  };

  const handleThemeChange = (key) => {
    setTheme(key);
    savePreferences({ theme: key });
  };

  const handleAccent = (hue, hex) => {
    setAccentHue(hue);
    applyAccentColor(hue, hex);
    savePreferences({ accentHue: hue, accentHex: hex });
  };

  const handleRadius = (val) => {
    setRadius(val);
    applyRadius(val);
    savePreferences({ radius: val });
  };

  const handleFontSize = (val) => {
    setFontSize(val);
    applyFontSize(val);
    savePreferences({ fontSize: val });
  };

  const handleLanguage = (val) => {
    setLanguage(val);
    applyLanguageAttr(val);
    savePreferences({ language: val });
  };

  const handleDirection = (dir) => {
    setDirection(dir);
    applyDirection(dir);
    savePreferences({ direction: dir });
  };

  const saveQr = async (stateKey, value) => {
    const restaurantId = getRestaurantId();
    if (!restaurantId) return;
    const field = QR_FIELD_MAP[stateKey];
    try {
      const result = await action(
        `${API.UPDATE_RESTAURANT}/${restaurantId}`,
        { qrSiteConfig: { [field]: value } },
        "PATCH",
      );
      if (result?.statusCode !== 200) {
        message.error(result?.message || "Unable to save QR site setting");
      }
    } catch {
      message.error("Unable to save QR site setting");
    }
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
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { key: "light", label: "Light", Icon: Sun },
            { key: "dark", label: "Dark", Icon: Moon },
            { key: "system", label: "System", Icon: Monitor },
          ].map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => handleThemeChange(key)}
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
              onClick={() => handleAccent(color.hue, color.hex)}
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
                onChange={(e) => setQrSiteName(e.target.value)}
                onBlur={() => saveQr("qrSiteName", qrSiteName)}
              />
            </div>

            <AntTextArea
              label="Welcome Message"
              placeholder="Eg: Welcome! Scan to browse our menu and order directly from your table."
              rows={2}
              value={qrWelcome}
              onChange={(e) => setQrWelcome(e.target.value)}
              onBlur={() => saveQr("qrWelcome", qrWelcome)}
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
