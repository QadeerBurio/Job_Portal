// hooks/useTheme.ts
// ─────────────────────────────────────────────────────────────────────────────
// Re-exports useTheme from ThemeContext so you can import from either location:
//   import { useTheme } from '../hooks/useTheme';   ← consistent hooks folder
//   import { useTheme } from '../context/ThemeContext';  ← also works
// Also persists the user's theme choice to AsyncStorage.
// ─────────────────────────────────────────────────────────────────────────────
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";
import { STORAGE_KEYS } from "../constants/API";
import { useTheme as useThemeCtx } from "../context/ThemeContext";

export function useTheme() {
  const ctx = useThemeCtx();

  // Persist theme mode to AsyncStorage whenever it changes
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEYS.THEME_MODE, ctx.themeMode).catch(
      () => {},
    );
  }, [ctx.themeMode]);

  return ctx;
}

// Re-export type
export type { ThemeColors } from "../constants/Colors";

