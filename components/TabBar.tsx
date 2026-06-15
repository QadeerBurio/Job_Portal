// components/TabBar.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Custom bottom tab bar matching the KarachiJobs design exactly.
// Pass this as the `tabBar` prop to expo-router's <Tabs>:
//
//   <Tabs tabBar={(props) => <TabBar {...props} />}>
//
// The active tab gets a filled dark pill background, inactive tabs are icon-only.
// ─────────────────────────────────────────────────────────────────────────────
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import React from "react";
import {
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";

// Tab configuration
const TABS = [
  { name: "index", label: "Home", icon: "🏠" },
  { name: "search", label: "Search", icon: "🔍" },
  { name: "saved", label: "Saved", icon: "🔖" },
  { name: "profile", label: "Profile", icon: "👤" },
] as const;

export default function TabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const { colors } = useTheme();

  // Only render the 4 main tabs (skip hidden routes like login, signup, etc.)
  const visibleRoutes = state.routes.filter((r) =>
    TABS.some((t) => t.name === r.name),
  );

  return (
    <SafeAreaView
      style={[
        s.safe,
        { backgroundColor: colors.bgCard, borderTopColor: colors.border },
      ]}
      edges={["bottom"]}
    >
      <View style={s.container}>
        {visibleRoutes.map((route) => {
          const tabConfig = TABS.find((t) => t.name === route.name);
          if (!tabConfig) return null;

          const isFocused = state.routes[state.index].name === route.name;
          const { options } = descriptors[route.key];

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: "tabLongPress", target: route.key });
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={
                options.tabBarAccessibilityLabel ?? tabConfig.label
              }
              onPress={onPress}
              onLongPress={onLongPress}
              style={[
                s.tab,
                isFocused && [
                  s.tabActive,
                  { backgroundColor: colors.tabActive },
                ],
              ]}
              activeOpacity={0.8}
            >
              <Text style={[s.tabIcon, { opacity: isFocused ? 1 : 0.55 }]}>
                {tabConfig.icon}
              </Text>
              {isFocused && (
                <Text style={[s.tabLabel, { color: colors.textInverse }]}>
                  {tabConfig.label}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: {
    borderTopWidth: 1,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: Platform.OS === "android" ? 10 : 6,
    height: 60,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    gap: 6,
    minWidth: 48,
  },
  tabActive: {
    paddingHorizontal: 18,
  },
  tabIcon: {
    fontSize: 20,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
});
