// app/(tabs)/resume.tsx — Resume Hub (the "Resume" tab in bottom nav)
// This is what shows when the user taps "Resume" in the tab bar.
// It redirects to Work Experience by default (matches the screenshots),
// with quick links to every other resume section.
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ThemeToggle from "../../components/ThemeToggle";
import { useTheme } from "../../context/ThemeContext";
import { fetchResume } from "../../services/resumeService";

const SECTIONS = [
  {
    key: "personal-info",
    label: "Personal Information",
    icon: "person-circle-outline",
    route: "/resume/personal-info",
  },
  {
    key: "experience",
    label: "Work Experience",
    icon: "briefcase-outline",
    route: "/resume/experience",
  },
  {
    key: "education",
    label: "Education",
    icon: "school-outline",
    route: "/resume/education",
  },
  {
    key: "skills",
    label: "Skills",
    icon: "flash-outline",
    route: "/resume/skills",
  },

  {
    key: "projects",
    label: "Projects",
    icon: "folder-open-outline",
    route: "/resume/projects",
  },
  {
    key: "certifications",
    label: "Certifications",
    icon: "ribbon-outline",
    route: "/resume/certifications",
  },
  {
    key: "templates",
    label: "Resume Templates",
    icon: "document-text-outline",
    route: "/resume/templates",
  },
  {
    key: "preview",
    label: "Preview & Download",
    icon: "eye-outline",
    route: "/resume/preview",
  },
];

export default function ResumeHubScreen() {
  const { colors } = useTheme();
  const [completion, setCompletion] = useState(0);

  useFocusEffect(
    useCallback(() => {
      fetchResume()
        .then((r) => setCompletion(r.completionPercent ?? 0))
        .catch(() => {});
    }, []),
  );
  const s = makeStyles(colors);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <View style={s.header}>
        <Text style={[s.headerTitle, { color: colors.textPrimary }]}>
          My Resume
        </Text>
        <ThemeToggle />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        <View style={[s.progressCard, { backgroundColor: colors.brandDark }]}>
          <Text style={s.progressLabel}>Resume Strength</Text>
          <Text style={s.progressPercent}>{completion}% Complete</Text>
          <View style={s.progressTrack}>
            <View style={[s.progressFill, { width: `${completion}%` }]} />
          </View>
        </View>

        <View style={s.grid}>
          {SECTIONS.map((sec) => (
            <TouchableOpacity
              key={sec.key}
              style={[
                s.card,
                { backgroundColor: colors.bgCard, borderColor: colors.border },
              ]}
              onPress={() => router.push(sec.route as any)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={sec.icon as any}
                size={30}
                color={colors.brand}
                style={{ marginBottom: 10 }}
              />
              <Text style={[s.cardLabel, { color: colors.textPrimary }]}>
                {sec.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[s.matchesBtn, { backgroundColor: colors.success }]}
          onPress={() => router.push("/resume/matches" as any)}
        >
          <Text style={s.matchesBtnText}>⚡ See Matched Jobs</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
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
      paddingVertical: 14,
      backgroundColor: c.bgPrimary,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    headerTitle: { fontSize: 22, fontWeight: "700" },
    scroll: { padding: 20 },
    progressCard: { borderRadius: 18, padding: 20, marginBottom: 24 },
    progressLabel: {
      color: "rgba(255,255,255,0.8)",
      fontSize: 12,
      fontWeight: "600",
      letterSpacing: 0.5,
      marginBottom: 6,
    },
    progressPercent: {
      color: "#fff",
      fontSize: 22,
      fontWeight: "700",
      marginBottom: 14,
    },
    progressTrack: {
      height: 8,
      backgroundColor: "rgba(255,255,255,0.25)",
      borderRadius: 4,
    },
    progressFill: { height: 8, backgroundColor: "#fff", borderRadius: 4 },
    grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
    card: {
      width: "47%",
      borderWidth: 1,
      borderRadius: 16,
      padding: 18,
      alignItems: "center",
    },
    cardIcon: { fontSize: 28, marginBottom: 10 },
    cardLabel: { fontSize: 13, fontWeight: "600", textAlign: "center" },
    matchesBtn: {
      borderRadius: 16,
      height: 54,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 24,
    },
    matchesBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  });
