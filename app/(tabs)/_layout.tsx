// app/(tabs)/_layout.tsx
// Controls ONLY the 4 bottom-tab screens.
// No ThemeProvider here — it's already in the root _layout.tsx above.
import { Tabs } from "expo-router";
import React from "react";
import TabBar from "../../components/TabBar";

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="search" options={{ title: "Search" }} />
      <Tabs.Screen name="saved" options={{ title: "Saved" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
