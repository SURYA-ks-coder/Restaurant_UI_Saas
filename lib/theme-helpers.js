// Shared visual-preference appliers — used by both the Appearance settings
// page and the dashboard layout's on-load sync, so a preference saved on one
// device (persisted server-side via /auth/preferences) paints correctly the
// next time this user logs in on any device/browser.

export const ACCENT_COLORS = [
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

export function applyAccentColor(hue, hex) {
  const root = document.documentElement;
  const isDark = root.classList.contains("dark");
  const L = isDark ? "0.7" : "0.58";
  const C = "0.2";
  const val = `oklch(${L} ${C} ${hue})`;
  root.style.setProperty("--primary", val);
  root.style.setProperty("--ring", val);
  root.style.setProperty("--sidebar-primary", val);
  root.style.setProperty("--sidebar-ring", val);

  // AntD components (Switch, Checkbox, Radio, Button, ...) can't read the
  // CSS var above, so hand them the resolved hex via a global event.
  if (hex) {
    localStorage.setItem("themeAccentHex", hex);
    window.dispatchEvent(
      new CustomEvent("accent-color-change", { detail: { hex } }),
    );
  }
}

export function applyRadius(radius) {
  if (radius) document.documentElement.style.setProperty("--radius", radius);
}

export function applyFontSize(size) {
  if (size) document.documentElement.style.fontSize = size;
}

export function applyDirection(dir) {
  if (dir) document.documentElement.setAttribute("dir", dir);
}

export function applyLanguageAttr(lang) {
  if (lang) document.documentElement.setAttribute("lang", lang);
}

// Applies every visual preference except `theme` (light/dark/system), which
// the caller applies separately via next-themes' setTheme so it stays in
// sync with next-themes' own persistence/class handling.
export function applyPreferences(prefs = {}) {
  if (!prefs) return;
  applyAccentColor(
    prefs.accentHue ?? 260,
    prefs.accentHex || ACCENT_COLORS.find((c) => c.hue === prefs.accentHue)?.hex,
  );
  applyRadius(prefs.radius);
  applyFontSize(prefs.fontSize);
  applyDirection(prefs.direction);
  applyLanguageAttr(prefs.language);
}
