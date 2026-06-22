// app/resume/matches.tsx — "Resume Complete! Jobs Recommended" Screen
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import { fetchMatchedJobs } from "../../services/resumeService";
import { JobMatch } from "../../types/resume";

export default function MatchesScreen() {
  const { colors } = useTheme();
  const [matches, setMatches] = useState<JobMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatchedJobs()
      .then(setMatches)
      .catch((e) => Alert.alert("Error", e.message))
      .finally(() => setLoading(false));
  }, []);

  const topSkills = matches.length > 0 ? "React and UX Design" : "your skills"; // could derive from resume

  const s = makeStyles(colors);

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <View style={s.header}>
        <View style={[s.avatar, { backgroundColor: colors.brand }]}>
          <Text style={{ color: "#fff" }}>👤</Text>
        </View>
        <Text style={[s.headerTitle, { color: colors.textPrimary }]}>
          KarachiJobs
        </Text>
        <Text style={{ fontSize: 18 }}>🔔</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        <View style={s.completeRow}>
          <Text style={s.completeIcon}>✅</Text>
          <Text style={[s.completeTitle, { color: colors.textPrimary }]}>
            Resume Complete!
          </Text>
        </View>
        <Text style={[s.completeSub, { color: colors.textSecondary }]}>
          Based on your skills in {topSkills}, we've found these opportunities
          in Karachi.
        </Text>

        <View style={s.sectionHeader}>
          <Text style={[s.sectionTitle, { color: colors.textPrimary }]}>
            Jobs Recommended For You
          </Text>
          <TouchableOpacity onPress={() => router.push("/search")}>
            <Text style={[s.viewAll, { color: colors.brand }]}>View All</Text>
          </TouchableOpacity>
        </View>

        {matches.map((job, i) => (
          <React.Fragment key={job.jobId}>
            <View
              style={[
                s.jobCard,
                { backgroundColor: colors.bgCard, borderColor: colors.border },
              ]}
            >
              <View style={s.jobTop}>
                <View
                  style={[s.logoBox, { backgroundColor: colors.bgTertiary }]}
                >
                  <Text style={{ fontSize: 18 }}>🏢</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.jobTitle, { color: colors.textPrimary }]}>
                    {job.title}
                  </Text>
                  <Text style={[s.company, { color: colors.textSecondary }]}>
                    {job.company}
                  </Text>
                </View>
                <View style={[s.matchBadge, { backgroundColor: "#22C55E22" }]}>
                  <Text style={s.matchIcon}>⚡</Text>
                  <Text style={s.matchText}>{job.matchPercent}% Match</Text>
                </View>
              </View>

              <View style={s.badges}>
                <View style={[s.badge, { backgroundColor: colors.bgTertiary }]}>
                  <Text style={[s.badgeText, { color: colors.textSecondary }]}>
                    {job.workMode}
                  </Text>
                </View>
                <View style={[s.badge, { backgroundColor: colors.bgTertiary }]}>
                  <Text style={[s.badgeText, { color: colors.textSecondary }]}>
                    {job.jobType}
                  </Text>
                </View>
                <View style={[s.badge, { backgroundColor: colors.brandLight }]}>
                  <Text style={[s.badgeText, { color: colors.brand }]}>
                    PKR {job.salaryMin}k - {job.salaryMax}k
                  </Text>
                </View>
              </View>

              <View style={s.jobFooter}>
                <Text style={[s.location, { color: colors.textTertiary }]}>
                  📍 {job.area}, Karachi
                </Text>
                <TouchableOpacity
                  style={[s.applyBtn, { backgroundColor: colors.brandDark }]}
                  onPress={() => router.push(`/job/${job.jobId}`)}
                >
                  <Text style={s.applyText}>Apply Now</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Insert premium CTA after 2nd job */}
            {i === 1 && (
              <View
                style={[s.premiumCard, { backgroundColor: colors.brandDark }]}
              >
                <Text style={s.premiumTitle}>Unlock Premium Insights</Text>
                <Text style={s.premiumSub}>
                  See how you rank against other applicants for these roles.
                </Text>
                <TouchableOpacity style={s.upgradeBtn}>
                  <Text style={[s.upgradeText, { color: colors.brandDark }]}>
                    Upgrade Now
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </React.Fragment>
        ))}

        {!loading && matches.length === 0 && (
          <View style={s.emptyState}>
            <Text style={{ fontSize: 50 }}>🔍</Text>
            <Text style={[s.emptyText, { color: colors.textSecondary }]}>
              Complete more of your resume to get personalized matches.
            </Text>
          </View>
        )}

        <View style={{ height: 100 }} />
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
    avatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: { fontSize: 18, fontWeight: "700" },
    scroll: { padding: 20 },
    completeRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 8,
    },
    completeIcon: { fontSize: 22 },
    completeTitle: { fontSize: 21, fontWeight: "700" },
    completeSub: { fontSize: 13, lineHeight: 20, marginBottom: 22 },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 14,
    },
    sectionTitle: { fontSize: 17, fontWeight: "700" },
    viewAll: { fontSize: 13, fontWeight: "600" },
    jobCard: {
      borderWidth: 1,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
    },
    jobTop: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
      marginBottom: 12,
    },
    logoBox: {
      width: 42,
      height: 42,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    jobTitle: { fontSize: 15, fontWeight: "700" },
    company: { fontSize: 12, marginTop: 2 },
    matchBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    matchIcon: { fontSize: 11 },
    matchText: { color: "#16A34A", fontSize: 11, fontWeight: "700" },
    badges: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 14,
    },
    badge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
    badgeText: { fontSize: 11, fontWeight: "600" },
    jobFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    location: { fontSize: 12 },
    applyBtn: { borderRadius: 10, paddingHorizontal: 18, paddingVertical: 10 },
    applyText: { color: "#fff", fontSize: 13, fontWeight: "700" },
    premiumCard: { borderRadius: 18, padding: 22, marginBottom: 16 },
    premiumTitle: {
      color: "#fff",
      fontSize: 17,
      fontWeight: "700",
      marginBottom: 6,
    },
    premiumSub: {
      color: "rgba(255,255,255,0.8)",
      fontSize: 13,
      marginBottom: 16,
      lineHeight: 19,
    },
    upgradeBtn: {
      backgroundColor: "#fff",
      alignSelf: "flex-start",
      borderRadius: 12,
      paddingHorizontal: 18,
      paddingVertical: 10,
    },
    upgradeText: { fontSize: 13, fontWeight: "700" },
    emptyState: { alignItems: "center", paddingVertical: 40 },
    emptyText: {
      marginTop: 12,
      fontSize: 14,
      textAlign: "center",
      paddingHorizontal: 30,
    },
  });
