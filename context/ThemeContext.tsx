// context/ThemeContext.tsx
import React, { createContext, useCallback, useContext, useState } from "react";
import { useColorScheme } from "react-native";
import { darkColors, lightColors, ThemeColors } from "../constants/Colors";

type ThemeMode = "light" | "dark" | "system";

type ThemeContextType = {
  colors: ThemeColors;
  isDark: boolean;
  themeMode: ThemeMode;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>("system");

  const isDark =
    themeMode === "dark" || (themeMode === "system" && systemScheme === "dark");

  const colors = isDark ? darkColors : lightColors;

  const toggleTheme = useCallback(() => {
    setThemeMode((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  return (
    <ThemeContext.Provider
      value={{ colors, isDark, themeMode, toggleTheme, setThemeMode }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

// useThemeColor — used by Expo's auto-generated Themed.tsx
// Signature: useThemeColor({ light: '#fff', dark: '#000' }, 'background')
export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof ThemeColors,
): string {
  const { colors, isDark } = useTheme();
  const colorFromProps = isDark ? props.dark : props.light;
  if (colorFromProps) return colorFromProps;
  return colors[colorName] as string;
}
