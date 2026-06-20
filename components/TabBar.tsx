import { Ionicons } from "@expo/vector-icons";
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

const TABS = [
  { name: "index", label: "Home", icon: "home-outline", activeIcon: "home" },
  {
    name: "search",
    label: "Search",
    icon: "search-outline",
    activeIcon: "search",
  },
  {
    name: "saved",
    label: "Saved",
    icon: "bookmark-outline",
    activeIcon: "bookmark",
  },
  {
    name: "resume",
    label: "Resume",
    icon: "document-text-outline",
    activeIcon: "document-text",
  },
  {
    name: "profile",
    label: "Profile",
    icon: "person-outline",
    activeIcon: "person",
  },
] as const;

export default function TabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const { colors } = useTheme();

  const visibleRoutes = state.routes.filter((r) =>
    TABS.some((t) => t.name === r.name),
  );

  return (
    <SafeAreaView
      edges={["bottom"]}
      style={[
        s.safe,
        {
          backgroundColor: colors.bgCard,
          borderTopColor: colors.border,
        },
      ]}
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

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={
                options.tabBarAccessibilityLabel ?? tabConfig.label
              }
              onPress={onPress}
              activeOpacity={0.8}
              style={s.tab}
            >
              <Ionicons
                name={
                  (isFocused
                    ? tabConfig.activeIcon
                    : tabConfig.icon) as keyof typeof Ionicons.glyphMap
                }
                size={24}
                color={isFocused ? colors.brand : colors.textSecondary}
              />

              <Text
                style={[
                  s.tabLabel,
                  {
                    color: isFocused ? colors.brand : colors.textSecondary,
                  },
                ]}
              >
                {tabConfig.label}
              </Text>
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
    height: 65,
    paddingTop: 6,
    paddingBottom: Platform.OS === "android" ? 8 : 4,
  },

  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },

  tabLabel: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "500",
  },
});
