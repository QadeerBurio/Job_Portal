// app/profile.tsx  — Profile Screen
import { router } from "expo-router";
import React from "react";

import { useAuth } from "@/context/AuthContext";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ThemeToggle from "../../components/ThemeToggle";
import { useTheme } from "../../context/ThemeContext";

const MENU_ITEMS = [
  { icon: "👤", label: "Personal Information" },
  { icon: "📄", label: "My Resume" },
  { icon: "🕐", label: "Application History", badge: "2 NEW" },
  { icon: "🔔", label: "Job Alerts" },
  { icon: "⚙️", label: "Account Settings" },
];

export default function ProfileScreen() {
  const { colors, isDark } = useTheme();
  const s = makeStyles(colors);

  const { logout } = useAuth();

  <TouchableOpacity
    onPress={async () => {
      await logout();
      router.replace("/login");
    }}
  >
    <Text>Logout</Text>
  </TouchableOpacity>;

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Header */}
      <View style={s.header}>
        <View style={s.logoRow}>
          <View style={s.logoIcon}>
            <Text style={{ fontSize: 16 }}>💼</Text>
          </View>
          <Text style={s.logoText}>KarachiJobs</Text>
        </View>
        <ThemeToggle />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Avatar + Info */}
        <View style={s.avatarSection}>
          <View style={s.avatarWrapper}>
            <View style={[s.avatar, { backgroundColor: colors.brand }]}>
              <Text style={s.avatarInitial}>A</Text>
            </View>
            <TouchableOpacity
              style={[s.editBadge, { backgroundColor: colors.brand }]}
            >
              <Text style={{ color: "#fff", fontSize: 12 }}>✏️</Text>
            </TouchableOpacity>
          </View>
          <Text style={[s.name, { color: colors.textPrimary }]}>Ahmed Ali</Text>
          <Text style={[s.jobTitle, { color: colors.textSecondary }]}>
            Software Developer
          </Text>
          <View style={s.badges}>
            <View style={[s.greenBadge]}>
              <Text style={s.greenBadgeText}>Available for Hire</Text>
            </View>
            <View style={[s.grayBadge, { borderColor: colors.border }]}>
              <Text style={[s.grayBadgeText, { color: colors.textSecondary }]}>
                Senior Level
              </Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={s.stats}>
          <View
            style={[
              s.statCard,
              { backgroundColor: colors.bgCard, borderColor: colors.border },
            ]}
          >
            <Text style={[s.statNum, { color: colors.textPrimary }]}>12</Text>
            <Text style={[s.statLabel, { color: colors.textTertiary }]}>
              APPLIED
            </Text>
          </View>
          <View
            style={[
              s.statCard,
              { backgroundColor: colors.bgCard, borderColor: colors.border },
            ]}
          >
            <Text style={[s.statNum, { color: colors.brand }]}>4</Text>
            <Text style={[s.statLabel, { color: colors.textTertiary }]}>
              INTERVIEWS
            </Text>
          </View>
        </View>

        {/* Menu */}
        <View style={s.menuSection}>
          <Text style={[s.menuLabel, { color: colors.textTertiary }]}>
            MANAGEMENT
          </Text>
          <View
            style={[
              s.menuCard,
              { backgroundColor: colors.bgCard, borderColor: colors.border },
            ]}
          >
            {MENU_ITEMS.map((item, i) => (
              <TouchableOpacity
                key={item.label}
                style={[
                  s.menuRow,
                  i < MENU_ITEMS.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  },
                ]}
              >
                <View
                  style={[s.menuIcon, { backgroundColor: colors.bgTertiary }]}
                >
                  <Text style={{ fontSize: 16 }}>{item.icon}</Text>
                </View>
                <Text style={[s.menuText, { color: colors.textPrimary }]}>
                  {item.label}
                </Text>
                {item.badge && (
                  <View style={s.newBadge}>
                    <Text style={s.newBadgeText}>{item.badge}</Text>
                  </View>
                )}
                <Text style={[s.chevron, { color: colors.textTertiary }]}>
                  ›
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Log out */}
        <TouchableOpacity
          style={s.logoutRow}
          onPress={() => router.replace("/login")}
        >
          <Text style={{ fontSize: 18 }}>🚪</Text>
          <Text style={s.logoutText}>Log out</Text>
        </TouchableOpacity>

        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (c: any) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bgSecondary },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 10,
      backgroundColor: c.bgPrimary,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    logoRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    logoIcon: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: c.brand,
      alignItems: "center",
      justifyContent: "center",
    },
    logoText: { fontSize: 17, fontWeight: "700", color: c.textPrimary },
    avatarSection: { alignItems: "center", paddingTop: 32, paddingBottom: 24 },
    avatarWrapper: { position: "relative", marginBottom: 16 },
    avatar: {
      width: 90,
      height: 90,
      borderRadius: 45,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarInitial: { color: "#fff", fontSize: 36, fontWeight: "700" },
    editBadge: {
      position: "absolute",
      bottom: 0,
      right: 0,
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
    },
    name: { fontSize: 24, fontWeight: "700", marginBottom: 4 },
    jobTitle: { fontSize: 15, marginBottom: 12 },
    badges: { flexDirection: "row", gap: 10 },
    greenBadge: {
      backgroundColor: "#22C55E",
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 6,
    },
    greenBadgeText: { color: "#fff", fontSize: 13, fontWeight: "600" },
    grayBadge: {
      borderWidth: 1,
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 6,
    },
    grayBadgeText: { fontSize: 13 },
    stats: {
      flexDirection: "row",
      gap: 12,
      paddingHorizontal: 20,
      marginBottom: 24,
    },
    statCard: {
      flex: 1,
      borderWidth: 1,
      borderRadius: 16,
      padding: 20,
      alignItems: "center",
    },
    statNum: { fontSize: 28, fontWeight: "700", marginBottom: 4 },
    statLabel: { fontSize: 11, fontWeight: "600", letterSpacing: 0.5 },
    menuSection: { paddingHorizontal: 20, marginBottom: 16 },
    menuLabel: {
      fontSize: 11,
      fontWeight: "600",
      letterSpacing: 1,
      marginBottom: 10,
    },
    menuCard: { borderWidth: 1, borderRadius: 16, overflow: "hidden" },
    menuRow: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      gap: 12,
    },
    menuIcon: {
      width: 38,
      height: 38,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    menuText: { flex: 1, fontSize: 15 },
    newBadge: {
      backgroundColor: "#EF4444",
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 3,
    },
    newBadgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
    chevron: { fontSize: 20 },
    logoutRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingHorizontal: 28,
      paddingVertical: 20,
    },
    logoutText: { fontSize: 15, fontWeight: "600", color: "#EF4444" },
  });
