// components/ThemedFix.tsx
// ─────────────────────────────────────────────────────────────────────────────
// REPLACE the contents of your auto-generated `components/Themed.tsx` with this.
//
// Expo generates Themed.tsx when you run `create-expo-app`. Its default version
// imports useThemeColor from a local hook that uses Expo's own Colors constant,
// which doesn't know about our ThemeColors type — causing the 'background' error.
//
// This version imports useThemeColor from our ThemeContext instead.
// ─────────────────────────────────────────────────────────────────────────────
import { Text as DefaultText, View as DefaultView } from "react-native";
import { useThemeColor } from "../context/ThemeContext";

// ── Types ─────────────────────────────────────────────────────────────────────

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText["props"];
export type ViewProps = ThemeProps & DefaultView["props"];

// ── Themed components ─────────────────────────────────────────────────────────

export function Text({ style, lightColor, darkColor, ...rest }: TextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");
  return <DefaultText style={[{ color }, style]} {...rest} />;
}

export function View({ style, lightColor, darkColor, ...rest }: ViewProps) {
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background",
  );
  return <DefaultView style={[{ backgroundColor }, style]} {...rest} />;
}
