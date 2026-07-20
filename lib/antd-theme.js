import { theme as antdTheme } from "antd";

/**
 * Antd's design-token algorithm derives ~50 dependent shades (dropdown
 * selected-option bg, Empty illustration colors, hover fills, ...) from a
 * handful of seed tokens using real color math (FastColor/tinycolor). That
 * math cannot parse CSS custom properties like "var(--primary)" — passing
 * one in silently corrupts every shade derived from it (they resolve to
 * black). So these tokens must be real, resolved colors, not CSS vars.
 *
 * Values below are the sRGB hex equivalents of the OKLCH tokens in
 * app/globals.css (:root / .dark). Keep the two in sync if the palette
 * there changes.
 */

export const lightTheme = {
  algorithm: antdTheme.defaultAlgorithm,
  token: {
    borderRadius: 6,
    colorPrimary: "#3375e3",
    colorError: "#de3b3d",
    colorBgContainer: "#ffffff",
    colorBgElevated: "#ffffff",
    colorBorder: "#d3d8de",
    colorText: "#0f1117",
    colorTextPlaceholder: "#5b5d63",
    colorFillTertiary: "#ffffff",
    colorFillSecondary: "#f1f1f1",
  },
  components: {
    Input: {
      colorBgContainer: "#ffffff",
    },
    Select: {
      colorBgContainer: "#ffffff",
      optionSelectedBg: "#ebf1fc",
      optionActiveBg: "#f3f7fd",
    },
    Button: {
      colorPrimary: "#3375e3",
      colorPrimaryHover: "#3375e3",
      colorPrimaryActive: "#3375e3",
    },
    Table: {
      colorBgContainer: "#ffffff",
      headerBg: "#ffffff",
      headerColor: "#0f1117",
      borderColor: "#d3d8de",
      colorText: "#0f1117",
    },
  },
};

/**
 * The Appearance page lets users pick an accent color, applied to
 * Tailwind-styled UI via the --primary CSS var. AntD components don't read
 * CSS vars (see comment above), so that selection is re-applied here as a
 * real hex override on top of the base theme's colorPrimary.
 */
export function withAccentColor(theme, accentHex) {
  if (!accentHex) return theme;
  return {
    ...theme,
    token: { ...theme.token, colorPrimary: accentHex },
    components: {
      ...theme.components,
      Button: {
        ...theme.components?.Button,
        colorPrimary: accentHex,
        colorPrimaryHover: accentHex,
        colorPrimaryActive: accentHex,
      },
    },
  };
}

export const darkTheme = {
  algorithm: antdTheme.darkAlgorithm,
  token: {
    borderRadius: 6,
    colorPrimary: "#579bff",
    colorError: "#de3b3d",
    colorBgContainer: "#0c0d11",
    colorBgElevated: "#08090c",
    colorBorder: "#202127",
    colorText: "#f8f8f8",
    colorTextPlaceholder: "#808080",
    colorFillTertiary: "#0c0d11",
    colorFillSecondary: "#242528",
  },
  components: {
    Input: {
      colorBgContainer: "#0c0d11",
    },
    Select: {
      colorBgContainer: "#0c0d11",
      optionSelectedBg: "#1a273c",
      optionActiveBg: "#141b29",
    },
    Button: {
      colorPrimary: "#579bff",
      colorPrimaryHover: "#579bff",
      colorPrimaryActive: "#579bff",
    },
    Table: {
      colorBgContainer: "#0c0d11",
      headerBg: "#0c0d11",
      headerColor: "#f8f8f8",
      borderColor: "#202127",
      colorText: "#f8f8f8",
    },
  },
};
