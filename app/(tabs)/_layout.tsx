// app/(tabs)/_layout.tsx
// Controls ONLY the 5 bottom-tab screens.
// ✅ "resume" screen added so it's recognized as a tab route.
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
      <Tabs.Screen name="resume" options={{ title: "Resume" }} />
      <Tabs.Screen name="saved" options={{ title: "Saved" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
