// app/_layout.tsx
// ─────────────────────────────────────────────────────────────────────────────
// ROOT layout. ThemeProvider and AuthProvider MUST wrap the Stack here
// so EVERY screen (tabs + filter + job/[id] + login) gets the context.
// The "useTheme must be used within ThemeProvider" crash happens when
// filter.tsx or job/[id].tsx render outside this provider tree.
// ─────────────────────────────────────────────────────────────────────────────
import { Stack } from "expo-router";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
//import { AuthProvider } from "../context/AuthContext";
import { ThemeProvider } from "../context/ThemeContext";

export default function RootLayout() {
  return (
    // ✅ SafeAreaProvider must be the outermost wrapper
    <SafeAreaProvider>
      {/* ✅ ThemeProvider wraps Stack so ALL screens including
           filter.tsx and job/[id].tsx can call useTheme() */}
      <ThemeProvider>
        <Stack screenOptions={{ headerShown: false }}>
          {/* (tabs) group contains Home/Search/Saved/Profile with tab bar */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          {/* These screens slide in as full-screen Stack pages, no tab bar */}
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="signup" options={{ headerShown: false }} />
          <Stack.Screen
            name="filter"
            options={{ headerShown: false, presentation: "modal" }}
          />
          <Stack.Screen name="job/[id]" options={{ headerShown: false }} />
        </Stack>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
