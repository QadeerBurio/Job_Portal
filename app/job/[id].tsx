// app/job/[id].tsx — Job Detail Screen
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import { fetchJobById } from "../../services/jobsService";
import { Job } from "../../types";

export default function JobDetailScreen() {
  const { colors, isDark } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchJobById(id as string)
      .then((data) => {
        if (data) setJob(data);
        else setError("Job not found.");
      })
      .catch((e) => setError(e?.message ?? "Failed to load job"))
      .finally(() => setLoading(false));
  }, [id]);

  const s = makeStyles(colors);

  if (loading)
    return (
      <SafeAreaView style={s.safe} edges={["top"]}>
        <View style={s.center}>
          <ActivityIndicator size="large" color={colors.brand} />
          <Text style={[{ color: colors.textSecondary, marginTop: 12 }]}>
            Loading job…
          </Text>
        </View>
      </SafeAreaView>
    );

  if (error || !job)
    return (
      <SafeAreaView style={s.safe} edges={["top"]}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Text style={[s.backText, { color: colors.textPrimary }]}>
            ‹ Back
          </Text>
        </TouchableOpacity>
        <View style={s.center}>
          <Text style={{ fontSize: 40 }}>😕</Text>
          <Text
            style={[
              {
                color: colors.textSecondary,
                marginTop: 12,
                textAlign: "center",
              },
            ]}
          >
            {error ?? "Job not found"}
          </Text>
        </View>
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Top bar */}
      <View
        style={[
          s.topBar,
          {
            backgroundColor: colors.bgPrimary,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={[s.backText, { color: colors.textPrimary }]}>‹</Text>
        </TouchableOpacity>
        <Text style={[s.topTitle, { color: colors.textPrimary }]}>
          KarachiJobs
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        {/* Logo */}
        <View style={s.logoWrap}>
          <View style={[s.logo, { backgroundColor: colors.bgTertiary }]}>
            <Text style={{ fontSize: 32 }}>💼</Text>
          </View>
        </View>

        <Text style={[s.jobTitle, { color: colors.textPrimary }]}>
          {job.title}
        </Text>
        <Text style={[s.company, { color: colors.textSecondary }]}>
          {job.company}
        </Text>

        {/* Info pills */}
        <View style={s.pills}>
          {[
            { icon: "📍", text: job.area },
            { icon: "🕐", text: job.jobType },
            { icon: "💰", text: `${job.salaryMin}–${job.salaryMax} PKR` },
          ].map((p) => (
            <View
              key={p.text}
              style={[
                s.pill,
                { backgroundColor: colors.bgCard, borderColor: colors.border },
              ]}
            >
              <Text style={{ color: colors.brand }}>{p.icon}</Text>
              <Text style={[s.pillText, { color: colors.textSecondary }]}>
                {p.text}
              </Text>
            </View>
          ))}
        </View>

        {/* Badges */}
        <View style={s.badges}>
          {job.isInternship && (
            <View style={[s.badge, { backgroundColor: "#EC489922" }]}>
              <Text style={[s.badgeText, { color: "#EC4899" }]}>
                Internship
              </Text>
            </View>
          )}
          {job.isTrainee && (
            <View style={[s.badge, { backgroundColor: "#8B5CF622" }]}>
              <Text style={[s.badgeText, { color: "#8B5CF6" }]}>Trainee</Text>
            </View>
          )}
          <View style={[s.badge, { backgroundColor: colors.brandLight }]}>
            <Text style={[s.badgeText, { color: colors.brand }]}>
              {job.category}
            </Text>
          </View>
        </View>

        {/* About */}
        {job.description ? (
          <View
            style={[
              s.card,
              { backgroundColor: colors.bgCard, borderColor: colors.border },
            ]}
          >
            <Text style={[s.cardTitle, { color: colors.textPrimary }]}>
              About the Role
            </Text>
            <Text style={[s.cardBody, { color: colors.textSecondary }]}>
              {job.description}
            </Text>
            {job.responsibilities?.map((r, i) => (
              <View key={i} style={s.bulletRow}>
                <Text style={[s.bullet, { color: colors.brand }]}>✓</Text>
                <Text style={[s.bulletText, { color: colors.textSecondary }]}>
                  {r}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* Requirements */}
        {(job.requirements?.length > 0 || job.tags?.length > 0) && (
          <View
            style={[
              s.card,
              { backgroundColor: colors.bgCard, borderColor: colors.border },
            ]}
          >
            <Text style={[s.cardTitle, { color: colors.textPrimary }]}>
              Requirements
            </Text>
            <View style={s.tags}>
              {job.tags?.map((t) => (
                <View
                  key={t}
                  style={[s.tag, { backgroundColor: colors.brandLight }]}
                >
                  <Text style={[s.tagText, { color: colors.brand }]}>{t}</Text>
                </View>
              ))}
            </View>
            {job.requirements?.map((r, i) => (
              <View key={i} style={s.bulletRow}>
                <Text style={{ color: colors.textTertiary }}>○</Text>
                <Text style={[s.bulletText, { color: colors.textSecondary }]}>
                  {r}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Company */}
        <View
          style={[
            s.card,
            { backgroundColor: colors.bgCard, borderColor: colors.border },
          ]}
        >
          <View style={s.companyRow}>
            <View
              style={[s.companyLogo, { backgroundColor: colors.bgTertiary }]}
            >
              <Text style={{ fontSize: 22 }}>🏢</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.cardTitle, { color: colors.textPrimary }]}>
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
          onPress={() => {
            if (job.applyUrl) Linking.openURL(job.applyUrl as string);
          }}
        >
          <Text style={s.applyBtnText}>Apply Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (c: any) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bgSecondary },
    center: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
    },
    topBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
    },
    backBtn: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
    },
    backText: { fontSize: 28, fontWeight: "300" },
    topTitle: { fontSize: 16, fontWeight: "700" },
    scroll: { padding: 20 },
    logoWrap: { alignItems: "center", marginBottom: 16 },
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
    company: { fontSize: 15, textAlign: "center", marginBottom: 16 },
    pills: {
      flexDirection: "row",
      gap: 8,
      flexWrap: "wrap",
      marginBottom: 12,
      justifyContent: "center",
    },
    pill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    pillText: { fontSize: 13 },
    badges: {
      flexDirection: "row",
      gap: 8,
      flexWrap: "wrap",
      marginBottom: 20,
      justifyContent: "center",
    },
    badge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
    badgeText: { fontSize: 12, fontWeight: "600" },
    card: { borderWidth: 1, borderRadius: 16, padding: 18, marginBottom: 16 },
    cardTitle: { fontSize: 17, fontWeight: "700", marginBottom: 12 },
    cardBody: { fontSize: 14, lineHeight: 22, marginBottom: 12 },
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
    applyBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  });
