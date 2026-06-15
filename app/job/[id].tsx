// app/job/[id].tsx  — Job Detail Screen
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { fetchJobById } from "../../services/jobsService";
import { Job } from "../../types";

export default function JobDetailScreen() {
  const { colors, isDark } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);

  useEffect(() => {
    if (id) fetchJobById(id).then(setJob);
  }, [id]);

  if (!job) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: colors.bgSecondary,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator color={colors.brand} size="large" />
      </SafeAreaView>
    );
  }

  const s = makeStyles(colors);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Top bar */}
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={[s.backText, { color: colors.textPrimary }]}>‹</Text>
        </TouchableOpacity>
        <View style={s.logoRow}>
          <Text style={[s.logoLabel, { color: colors.textPrimary }]}>
            KarachiJobs
          </Text>
        </View>
        <TouchableOpacity>
          <Text style={{ fontSize: 20, color: colors.textTertiary }}>🔖</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        {/* Company logo placeholder */}
        <View style={s.logoSection}>
          <View style={[s.logo, { backgroundColor: colors.bgTertiary }]}>
            <Text style={{ fontSize: 28 }}>💼</Text>
          </View>
        </View>

        <Text style={[s.jobTitle, { color: colors.textPrimary }]}>
          {job.title}
        </Text>
        <Text style={[s.company, { color: colors.textSecondary }]}>
          {job.company}
        </Text>

        {/* Info pills */}
        <View style={s.infoPills}>
          {[
            { icon: "📍", text: job.area },
            { icon: "🕐", text: job.jobType },
            { icon: "💰", text: `${job.salaryMin}k – ${job.salaryMax}k` },
          ].map((pill) => (
            <View
              key={pill.text}
              style={[
                s.pill,
                { backgroundColor: colors.bgCard, borderColor: colors.border },
              ]}
            >
              <Text style={{ fontSize: 18, color: colors.brand }}>
                {pill.icon}
              </Text>
              <Text style={[s.pillText, { color: colors.textSecondary }]}>
                {pill.text}
              </Text>
            </View>
          ))}
        </View>

        {/* About */}
        <View
          style={[
            s.section,
            { backgroundColor: colors.bgCard, borderColor: colors.border },
          ]}
        >
          <Text style={[s.sectionTitle, { color: colors.textPrimary }]}>
            About the Role
          </Text>
          <Text style={[s.description, { color: colors.textSecondary }]}>
            {job.description}
          </Text>
          {job.responsibilities.map((r) => (
            <View key={r} style={s.bulletRow}>
              <Text style={[s.bullet, { color: colors.brand }]}>✓</Text>
              <Text style={[s.bulletText, { color: colors.textSecondary }]}>
                {r}
              </Text>
            </View>
          ))}
        </View>

        {/* Requirements */}
        <View
          style={[
            s.section,
            { backgroundColor: colors.bgCard, borderColor: colors.border },
          ]}
        >
          <Text style={[s.sectionTitle, { color: colors.textPrimary }]}>
            Requirements
          </Text>
          <View style={s.tags}>
            <View style={[s.tag, { backgroundColor: colors.brandLight }]}>
              <Text style={[s.tagText, { color: colors.brand }]}>
                {job.experience}
              </Text>
            </View>
            {job.tags.map((t) => (
              <View
                key={t}
                style={[s.tag, { backgroundColor: colors.brandLight }]}
              >
                <Text style={[s.tagText, { color: colors.brand }]}>{t}</Text>
              </View>
            ))}
          </View>
          {job.requirements.map((r) => (
            <View key={r} style={s.bulletRow}>
              <Text style={[{ color: colors.textTertiary }]}>○</Text>
              <Text style={[s.bulletText, { color: colors.textSecondary }]}>
                {r}
              </Text>
            </View>
          ))}
        </View>

        {/* Company */}
        <View
          style={[
            s.section,
            { backgroundColor: colors.bgCard, borderColor: colors.border },
          ]}
        >
          <View style={s.companyRow}>
            <View
              style={[s.companyLogo, { backgroundColor: colors.bgTertiary }]}
            >
              <Text style={{ fontSize: 20 }}>🏢</Text>
            </View>
            <View>
              <Text style={[s.sectionTitle, { color: colors.textPrimary }]}>
                {job.company}
              </Text>
              <Text
                style={[
                  { color: colors.brand, fontSize: 12, fontWeight: "600" },
                ]}
              >
                {job.category} · Karachi
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Apply button */}
      <View
        style={[
          s.applyBar,
          { backgroundColor: colors.bgPrimary, borderTopColor: colors.border },
        ]}
      >
        <TouchableOpacity
          style={[s.applyBtn, { backgroundColor: colors.brandDark }]}
        >
          <Text style={s.applyText}>Apply Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (c: any) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bgSecondary },
    topBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: c.bgPrimary,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    backBtn: {
      width: 36,
      height: 36,
      alignItems: "center",
      justifyContent: "center",
    },
    backText: { fontSize: 26, fontWeight: "300" },
    logoRow: { flex: 1, alignItems: "center" },
    logoLabel: { fontSize: 16, fontWeight: "700" },
    scroll: { padding: 20 },
    logoSection: { alignItems: "center", marginBottom: 16 },
    logo: {
      width: 80,
      height: 80,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    jobTitle: {
      fontSize: 22,
      fontWeight: "700",
      textAlign: "center",
      marginBottom: 4,
    },
    company: { fontSize: 15, textAlign: "center", marginBottom: 20 },
    infoPills: {
      flexDirection: "row",
      gap: 10,
      marginBottom: 20,
      flexWrap: "wrap",
    },
    pill: {
      flex: 1,
      minWidth: 90,
      flexDirection: "column",
      alignItems: "center",
      gap: 4,
      borderWidth: 1,
      borderRadius: 14,
      padding: 12,
    },
    pillText: { fontSize: 12, textAlign: "center" },
    section: {
      borderWidth: 1,
      borderRadius: 16,
      padding: 18,
      marginBottom: 16,
    },
    sectionTitle: { fontSize: 17, fontWeight: "700", marginBottom: 12 },
    description: { fontSize: 14, lineHeight: 22, marginBottom: 12 },
    bulletRow: {
      flexDirection: "row",
      gap: 10,
      marginBottom: 8,
      alignItems: "flex-start",
    },
    bullet: { fontSize: 16, marginTop: 1 },
    bulletText: { flex: 1, fontSize: 14, lineHeight: 20 },
    tags: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14 },
    tag: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
    tagText: { fontSize: 12, fontWeight: "600" },
    companyRow: { flexDirection: "row", alignItems: "center", gap: 14 },
    companyLogo: {
      width: 52,
      height: 52,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
    },
    applyBar: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      padding: 16,
      borderTopWidth: 1,
    },
    applyBtn: {
      height: 54,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    applyText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  });
