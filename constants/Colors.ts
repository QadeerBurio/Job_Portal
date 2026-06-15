// constants/Colors.ts

export const palette = {
  teal900: "#0D2B26",
  teal800: "#0F3D35",
  teal700: "#145244",
  teal600: "#1A6E5A",
  teal500: "#1D9E75",
  teal400: "#5DCAA5",
  teal100: "#9FE1CB",
  teal50: "#E1F5EE",
  green500: "#22C55E",
  red500: "#EF4444",
  gray900: "#111827",
  gray800: "#1F2937",
  gray700: "#374151",
  gray600: "#4B5563",
  gray400: "#9CA3AF",
  gray300: "#D1D5DB",
  gray200: "#E5E7EB",
  gray100: "#F3F4F6",
  gray50: "#F9FAFB",
  white: "#FFFFFF",
  black: "#000000",
};

export type ThemeColors = {
  // ── Core aliases (required by Expo's Themed.tsx) ──────────────
  background: string; // ← 'background' key
  text: string; // ← 'text' key
  tint: string;
  icon: string;
  tabIconDefault: string;
  tabIconSelected: string;

  // ── Backgrounds ───────────────────────────────────────────────
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  bgCard: string;

  // ── Text ─────────────────────────────────────────────────────
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;

  // ── Brand ─────────────────────────────────────────────────────
  brand: string;
  brandDark: string;
  brandLight: string;

  // ── Borders ───────────────────────────────────────────────────
  border: string;
  borderStrong: string;

  // ── Status ────────────────────────────────────────────────────
  success: string;
  danger: string;

  // ── Tab bar ───────────────────────────────────────────────────
  tabActive: string;
  tabInactive: string;
};

export const lightColors: ThemeColors = {
  // Core aliases
  background: "#F9FAFB",
  text: "#111827",
  tint: "#1D9E75",
  icon: "#4B5563",
  tabIconDefault: "#9CA3AF",
  tabIconSelected: "#1D9E75",

  // Backgrounds
  bgPrimary: "#FFFFFF",
  bgSecondary: "#F9FAFB",
  bgTertiary: "#F3F4F6",
  bgCard: "#FFFFFF",

  // Text
  textPrimary: "#111827",
  textSecondary: "#4B5563",
  textTertiary: "#9CA3AF",
  textInverse: "#FFFFFF",

  // Brand
  brand: "#1D9E75",
  brandDark: "#145244",
  brandLight: "#E1F5EE",

  // Borders
  border: "#E5E7EB",
  borderStrong: "#D1D5DB",

  // Status
  success: "#22C55E",
  danger: "#EF4444",

  // Tab bar
  tabActive: "#0F3D35",
  tabInactive: "#9CA3AF",
};

export const darkColors: ThemeColors = {
  // Core aliases
  background: "#111827",
  text: "#FFFFFF",
  tint: "#5DCAA5",
  icon: "#9CA3AF",
  tabIconDefault: "#4B5563",
  tabIconSelected: "#5DCAA5",

  // Backgrounds
  bgPrimary: "#111827",
  bgSecondary: "#1F2937",
  bgTertiary: "#374151",
  bgCard: "#1F2937",

  // Text
  textPrimary: "#FFFFFF",
  textSecondary: "#D1D5DB",
  textTertiary: "#9CA3AF",
  textInverse: "#111827",

  // Brand
  brand: "#5DCAA5",
  brandDark: "#1D9E75",
  brandLight: "#0D2B26",

  // Borders
  border: "#374151",
  borderStrong: "#4B5563",

  // Status
  success: "#22C55E",
  danger: "#EF4444",

  // Tab bar
  tabActive: "#5DCAA5",
  tabInactive: "#4B5563",
};
