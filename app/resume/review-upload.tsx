// app/resume/review-upload.tsx
// ─────────────────────────────────────────────────────────────────────────────
// After uploading a resume, show the user what was extracted, let them review
// and fix any missing data. The actual editing happens in the existing section
// screens (experience.tsx, education.tsx, etc.) — this screen is just a review
// + summary + navigation hub.
//
// ✅ UPDATED: Now includes Projects and Certifications sections
// ─────────────────────────────────────────────────────────────────────────────
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import { fetchResume } from "../../services/resumeService";

export default function ReviewUploadScreen() {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [resume, setResume] = useState<any>(null);

  const s = makeStyles(colors);

  React.useEffect(() => {
    fetchResume()
      .then((data) => {
        console.log("FETCHED RESUME:");
        console.log(JSON.stringify(data, null, 2));
        setResume(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <SafeAreaView
        style={[s.safe, { backgroundColor: colors.bgSecondary }]}
        edges={["top"]}
      >
        <View style={s.loader}>
          <Text style={{ color: colors.textSecondary }}>Loading review...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const hasPersonalInfo =
    resume?.personalInfo?.fullName && resume?.personalInfo?.email;
  const experienceCount = resume?.experience?.length ?? 0;
  const educationCount = resume?.education?.length ?? 0;
  const skillsCount = resume?.skills?.length ?? 0;
  const projectsCount = resume?.projects?.length ?? 0;
  const certificationsCount = resume?.certifications?.length ?? 0;

  const filledSections = [
    hasPersonalInfo,
    experienceCount > 0,
    educationCount > 0,
    skillsCount > 0,
  ].filter(Boolean).length;

  const parseStatusMessage =
    filledSections === 4
      ? "✅ Perfect! All sections imported."
      : filledSections >= 2
        ? "⚠️ Partial. Some data imported, but please review."
        : "❌ Limited extraction. Please review and add missing details.";

  const rawText = resume?.uploadedResume?.rawText || "";

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.brand} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: colors.textPrimary }]}>
          Review Import
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        {/* Status Card */}
        <View style={[s.statusCard, { backgroundColor: colors.bgCard }]}>
          <Text style={[s.statusMessage, { color: colors.textPrimary }]}>
            {parseStatusMessage}
          </Text>
        </View>

        {/* Data Summary Grid */}
        <View style={s.summaryGrid}>
          <SummaryBox
            label="Personal"
            value={hasPersonalInfo ? "✓" : "✗"}
            colors={colors}
            styles={s}
          />
          <SummaryBox
            label="Experience"
            value={`${experienceCount}`}
            colors={colors}
            styles={s}
          />
          <SummaryBox
            label="Education"
            value={`${educationCount}`}
            colors={colors}
            styles={s}
          />
          <SummaryBox
            label="Skills"
            value={`${skillsCount}`}
            colors={colors}
            styles={s}
          />
          <SummaryBox
            label="Projects"
            value={`${projectsCount}`}
            colors={colors}
            styles={s}
          />
          <SummaryBox
            label="Certifications"
            value={`${certificationsCount}`}
            colors={colors}
            styles={s}
          />
        </View>

        {/* Quick Review Actions */}
        <View style={s.section}>
          <Text style={[s.sectionTitle, { color: colors.textPrimary }]}>
            Review Sections
          </Text>
          <ReviewAction
            icon="person-circle-outline"
            label="Personal Info"
            colors={colors}
            styles={s}
            onPress={() => router.push("/resume/personal-info")}
          />
          <ReviewAction
            icon="briefcase-outline"
            label="Work Experience"
            colors={colors}
            styles={s}
            onPress={() => router.push("/resume/experience")}
          />
          <ReviewAction
            icon="school-outline"
            label="Education"
            colors={colors}
            styles={s}
            onPress={() => router.push("/resume/education")}
          />
          <ReviewAction
            icon="flash-outline"
            label="Skills"
            colors={colors}
            styles={s}
            onPress={() => router.push("/resume/skills")}
          />
          {projectsCount > 0 && (
            <ReviewAction
              icon="folder-open-outline"
              label="Projects"
              colors={colors}
              styles={s}
              onPress={() => router.push("/resume/projects")}
            />
          )}
          {certificationsCount > 0 && (
            <ReviewAction
              icon="checkmark-done-outline"
              label="Certifications"
              colors={colors}
              styles={s}
              onPress={() => router.push("/resume/certifications")}
            />
          )}
        </View>

        {/* Raw Text (for debugging/manual copy if needed) */}
        {rawText && (
          <View style={s.section}>
            <Text style={[s.sectionTitle, { color: colors.textPrimary }]}>
              Extracted Text (Raw)
            </Text>
            <View style={[s.rawText, { backgroundColor: colors.bgTertiary }]}>
              <Text style={[s.rawTextContent, { color: colors.textSecondary }]}>
                {rawText.slice(0, 300)}
                {rawText.length > 300 ? "..." : ""}
              </Text>
            </View>
            <Text style={[s.rawTextHint, { color: colors.textTertiary }]}>
              If the parser missed data, you can copy text from here and
              manually add it to the sections above.
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={s.actions}>
          <TouchableOpacity
            style={[s.cancelBtn, { borderColor: colors.border }]}
            onPress={() => router.push("/resume")}
          >
            <Text style={[s.cancelBtnText, { color: colors.brand }]}>
              Back to Hub
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.confirmBtn, { backgroundColor: colors.success }]}
            onPress={() => router.push("/resume")}
          >
            <Ionicons
              name="checkmark-circle"
              size={20}
              color="#fff"
              style={{ marginRight: 8 }}
            />
            <Text style={s.confirmBtnText}>Confirm & Continue</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function SummaryBox({ label, value, colors, styles }: any) {
  return (
    <View style={[{ backgroundColor: colors.bgCard }, styles.summaryBox]}>
      <Text style={[styles.summaryValue, { color: colors.brand }]}>
        {value}
      </Text>
      <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
        {label}
      </Text>
    </View>
  );
}

function ReviewAction({ icon, label, colors, styles, onPress }: any) {
  return (
    <TouchableOpacity
      style={[styles.action, { backgroundColor: colors.bgTertiary }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Ionicons name={icon as any} size={20} color={colors.brand} />
      <Text style={[styles.actionLabel, { color: colors.textPrimary }]}>
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
    </TouchableOpacity>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────

function makeStyles(colors: any) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bgSecondary },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.bgPrimary,
    },
    headerTitle: { fontSize: 18, fontWeight: "700" },
    scroll: { padding: 16 },
    loader: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    statusCard: {
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
      borderLeftWidth: 4,
      borderLeftColor: colors.brand,
    },
    statusMessage: { fontSize: 15, fontWeight: "600", lineHeight: 22 },
    summaryGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
      marginBottom: 24,
    },
    summaryBox: {
      width: "48%",
      borderRadius: 12,
      padding: 12,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    summaryValue: { fontSize: 18, fontWeight: "700", marginBottom: 4 },
    summaryLabel: { fontSize: 11, fontWeight: "600" },
    section: { marginBottom: 24 },
    sectionTitle: { fontSize: 15, fontWeight: "700", marginBottom: 12 },
    action: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderRadius: 10,
      marginBottom: 8,
    },
    actionLabel: { flex: 1, fontSize: 14, fontWeight: "600" },
    rawText: {
      borderRadius: 10,
      padding: 12,
      marginBottom: 10,
      maxHeight: 120,
    },
    rawTextContent: { fontSize: 12, lineHeight: 18, fontFamily: "monospace" },
    rawTextHint: { fontSize: 11, lineHeight: 16 },
    actions: {
      flexDirection: "row",
      gap: 12,
      marginTop: 20,
    },
    cancelBtn: {
      flex: 1,
      borderWidth: 1,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: "center",
    },
    cancelBtnText: { fontSize: 14, fontWeight: "700" },
    confirmBtn: {
      flex: 1,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
    },
    confirmBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  });
}
