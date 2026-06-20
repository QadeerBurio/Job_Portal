// app/_layout.tsx
import { Stack } from "expo-router";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { ThemeProvider } from "../context/ThemeContext";

function RootNavigator() {
  const { user } = useAuth();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="filter" />
          <Stack.Screen name="job/[id]" />

          {/* Resume routes - use nested layout instead */}
          <Stack.Screen
            name="resume/addexperience"
            options={{ title: "Add Experience", headerShown: true }}
          />
          <Stack.Screen
            name="resume/addeducation"
            options={{ title: "Add Education", headerShown: true }}
          />
        </>
      ) : (
        <>
          <Stack.Screen name="login" />
          <Stack.Screen name="signup" />
        </>
      )}
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
