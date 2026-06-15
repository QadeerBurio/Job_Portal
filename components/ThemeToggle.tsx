// components/ThemeToggle.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { isDark, toggleTheme, colors } = useTheme();

  return (
    <TouchableOpacity
      onPress={toggleTheme}
      style={[
        styles.btn,
        {
          backgroundColor: colors.bgTertiary,
          borderColor: colors.border,
        },
      ]}
      activeOpacity={0.75}
    >
      <Ionicons
        name={isDark ? "sunny" : "moon"}
        size={26}
        color={colors.tabIconSelected}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 18,
  },
});
