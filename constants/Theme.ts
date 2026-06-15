// constants/Theme.ts
// ─────────────────────────────────────────────────────────────────────────────
// Spacing, typography, border radius, shadows used across the app.
// Import alongside Colors.ts for a complete design system.
// ─────────────────────────────────────────────────────────────────────────────

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 40,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
} as const;

export const fontSize = {
  xs: 11,
  sm: 12,
  md: 14,
  lg: 15,
  xl: 17,
  xxl: 20,
  xxxl: 24,
  hero: 28,
} as const;

export const fontWeight = {
  regular: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
};

export const lineHeight = {
  tight: 1.3,
  normal: 1.6,
  loose: 1.8,
} as const;

export const iconSize = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
} as const;

// Component-level size constants
export const componentHeight = {
  input: 52,
  button: 54,
  tab: 64,
  header: 56,
  card: 80,
} as const;

// Subtle shadow for cards (iOS + Android)
export const shadow = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
} as const;
