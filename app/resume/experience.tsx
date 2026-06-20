// app/resume/experience.tsx — Work Experience Screen
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
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
import { deleteExperience, fetchResume } from "../../services/resumeService";
import { Experience } from "../../types/resume";

function formatDateRange(
  start: string,
  end: string | null,
  isCurrent: boolean,
): string {
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  return `${fmt(start)} - ${isCurrent ? "Present" : end ? fmt(end) : ""}`;
}

export default function WorkExperienceScreen() {
  const { colors } = useTheme();
  const [experience, setExperience] = useState<Experience[]>([]);
  const [completion, setCompletion] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    fetchResume()
      .then((resume) => {
        setExperience(resume.experience);
        setCompletion(resume.completionPercent ?? 0);
      })
      .catch((err) => Alert.alert("Error", err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = (id: string, title: string) => {
    Alert.alert("Delete Experience", `Remove "${title}" from your resume?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteExperience(id);
            load();
          } catch (e: any) {
            Alert.alert("Error", e.message);
          }
        },
      },
    ]);
  };

  const s = makeStyles(colors);

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[s.backArrow, { color: colors.textPrimary }]}>←</Text>
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: colors.textPrimary }]}>
          Work Experience
        </Text>
        <View style={[s.avatar, { backgroundColor: colors.brand }]}>
          <Text style={{ color: "#fff", fontWeight: "700" }}>A</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        {/* Resume strength bar */}
        <View style={s.strengthRow}>
          <Text style={[s.strengthLabel, { color: colors.textSecondary }]}>
            RESUME STRENGTH
          </Text>
          <Text style={[s.strengthPercent, { color: colors.textPrimary }]}>
            {completion}% Complete
          </Text>
        </View>
        <View style={[s.progressTrack, { backgroundColor: colors.bgTertiary }]}>
          <View
            style={[
              s.progressFill,
              { width: `${completion}%`, backgroundColor: colors.brandDark },
            ]}
          />
        </View>

        {/* Experience cards */}
        {experience.map((exp) => (
          <View
            key={exp._id}
            style={[
              s.card,
              { backgroundColor: colors.bgCard, borderColor: colors.border },
            ]}
          >
            <View style={s.cardTop}>
              <View style={[s.iconBox, { backgroundColor: colors.bgTertiary }]}>
                <Text style={{ fontSize: 18 }}>🏢</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.jobTitle, { color: colors.textPrimary }]}>
                  {exp.jobTitle}
                </Text>
                <Text style={[s.companyLine, { color: colors.textSecondary }]}>
                  {exp.companyName} • {exp.location?.split(",")[0] ?? "Karachi"}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/resume/add-experience",
                    params: { id: exp._id },
                  })
                }
              >
                <Text style={s.editIcon}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDelete(exp._id, exp.jobTitle)}
                style={{ marginLeft: 8 }}
              >
                <Text style={s.deleteIcon}>🗑️</Text>
              </TouchableOpacity>
            </View>

            <View style={[s.dateBadge, { backgroundColor: colors.bgTertiary }]}>
              <Text style={[s.dateText, { color: colors.textSecondary }]}>
                {formatDateRange(exp.startDate, exp.endDate, exp.isCurrent)}
              </Text>
            </View>

            <View style={[s.bulletWrap, { borderLeftColor: colors.brand }]}>
              {(exp.bullets?.length ? exp.bullets : [exp.description]).map(
                (b, i) => (
                  <View key={i} style={s.bulletRow}>
                    <Text style={[s.bulletDot, { color: colors.textTertiary }]}>
                      •
                    </Text>
                    <Text
                      style={[s.bulletText, { color: colors.textSecondary }]}
                    >
                      {b}
                    </Text>
                  </View>
                ),
              )}
            </View>
          </View>
        ))}

        {!loading && experience.length === 0 && (
          <View style={s.emptyState}>
            <Text style={{ fontSize: 40 }}>💼</Text>
            <Text style={[s.emptyText, { color: colors.textSecondary }]}>
              No work experience added yet.
            </Text>
          </View>
        )}

        {/* Missing anything CTA */}
        <View style={[s.ctaCard, { backgroundColor: colors.brandDark }]}>
          <View style={{ flex: 1 }}>
            <Text style={s.ctaTitle}>Missing anything?</Text>
            <Text style={s.ctaSub}>
              Add your internships or volunteer work to stand out to employers
              in Karachi's tech hub.
            </Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating add button */}
      <TouchableOpacity
        style={[s.fab, { backgroundColor: colors.success }]}
        onPress={() => router.push("/resume/add-experience")}
      >
        <Text style={s.fabIcon}>+</Text>
      </TouchableOpacity>
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
    backArrow: { fontSize: 24 },
    headerTitle: { fontSize: 19, fontWeight: "700" },
    avatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
    },
    scroll: { padding: 20 },
    strengthRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    strengthLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5 },
    strengthPercent: { fontSize: 13, fontWeight: "600" },
    progressTrack: { height: 6, borderRadius: 3, marginBottom: 24 },
    progressFill: { height: 6, borderRadius: 3 },
    card: { borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 16 },
    cardTop: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
      marginBottom: 10,
    },
    iconBox: {
      width: 40,
      height: 40,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    jobTitle: { fontSize: 16, fontWeight: "700" },
    companyLine: { fontSize: 13, marginTop: 2 },
    editIcon: { fontSize: 16 },
    deleteIcon: { fontSize: 16 },
    dateBadge: {
      alignSelf: "flex-start",
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 4,
      marginBottom: 12,
    },
    dateText: { fontSize: 12, fontWeight: "500" },
    bulletWrap: { borderLeftWidth: 2, paddingLeft: 12, gap: 8 },
    bulletRow: { flexDirection: "row", gap: 8 },
    bulletDot: { fontSize: 14 },
    bulletText: { flex: 1, fontSize: 13, lineHeight: 20 },
    emptyState: { alignItems: "center", paddingVertical: 40 },
    emptyText: { marginTop: 12, fontSize: 14 },
    ctaCard: { borderRadius: 18, padding: 20, marginTop: 8 },
    ctaTitle: {
      color: "#fff",
      fontSize: 17,
      fontWeight: "700",
      marginBottom: 6,
    },
    ctaSub: { color: "rgba(255,255,255,0.8)", fontSize: 13, lineHeight: 19 },
    fab: {
      position: "absolute",
      bottom: 24,
      right: 20,
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: "center",
      justifyContent: "center",
      elevation: 4,
      shadowColor: "#000",
      shadowOpacity: 0.2,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
    },
    fabIcon: { color: "#fff", fontSize: 28, fontWeight: "300", marginTop: -2 },
  });
