// app/resume/education.tsx — Education Screen
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
import { deleteEducation, fetchResume } from "../../services/resumeService";
import { Education } from "../../types/resume";

const ICONS: Record<string, string> = {
  graduation: "🎓",
  institution: "🏛️",
  school: "🏫",
};

function yearRange(start: string, end: string | null): string {
  const y = (d: string) => new Date(d).getFullYear();
  return `${y(start)} - ${end ? y(end) : "Present"}`;
}

export default function EducationScreen() {
  const { colors } = useTheme();
  const [education, setEducation] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    fetchResume()
      .then((r) => setEducation(r.education))
      .catch((e) => Alert.alert("Error", e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = (id: string, degree: string) => {
    Alert.alert("Delete Education", `Remove "${degree}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteEducation(id);
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
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[s.backArrow, { color: colors.textPrimary }]}>←</Text>
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: colors.textPrimary }]}>
          Education
        </Text>
        <View style={[s.avatar, { backgroundColor: colors.brand }]}>
          <Text style={{ color: "#fff", fontWeight: "700" }}>A</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        <View style={[s.infoBox, { backgroundColor: colors.bgTertiary }]}>
          <Text style={s.infoIcon}>ⓘ</Text>
          <Text style={[s.infoText, { color: colors.textSecondary }]}>
            Your educational background helps employers in Karachi understand
            your academic foundation and expertise level.
          </Text>
        </View>

        {education.map((edu) => (
          <View
            key={edu._id}
            style={[
              s.card,
              { backgroundColor: colors.bgCard, borderColor: colors.border },
            ]}
          >
            <View style={s.cardTop}>
              <View style={[s.iconBox, { backgroundColor: colors.brandLight }]}>
                <Text style={{ fontSize: 18 }}>
                  {ICONS[edu.icon ?? "graduation"]}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.degree, { color: colors.textPrimary }]}>
                  {edu.degree}
                </Text>
                <Text style={[s.institution, { color: colors.textSecondary }]}>
                  {edu.institution}
                </Text>
                <View style={s.badges}>
                  <View
                    style={[
                      s.dateBadge,
                      { backgroundColor: colors.bgTertiary },
                    ]}
                  >
                    <Text style={[s.dateText, { color: colors.textSecondary }]}>
                      📅 {yearRange(edu.startDate, edu.endDate)}
                    </Text>
                  </View>
                  {edu.grade ? (
                    <View
                      style={[
                        s.gradeBadge,
                        { backgroundColor: colors.brandLight },
                      ]}
                    >
                      <Text style={[s.gradeText, { color: colors.brand }]}>
                        ⭐ {edu.grade}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>
              <View style={s.actions}>
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: "/resume/add-education",
                      params: { id: edu._id },
                    })
                  }
                >
                  <Text style={s.editIcon}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDelete(edu._id, edu.degree)}
                  style={{ marginTop: 12 }}
                >
                  <Text style={s.deleteIcon}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}

        {!loading && education.length === 0 && (
          <View style={s.emptyState}>
            <Text style={{ fontSize: 60 }}>🎓</Text>
            <Text style={[s.emptyText, { color: colors.textSecondary }]}>
              No education added yet.
            </Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <TouchableOpacity
        style={[s.addBtn, { backgroundColor: colors.brandDark }]}
        onPress={() => router.push("/resume/add-education")}
      >
        <Text style={s.addBtnText}>+ ADD EDUCATION</Text>
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
    infoBox: {
      flexDirection: "row",
      gap: 10,
      borderRadius: 14,
      padding: 16,
      marginBottom: 20,
    },
    infoIcon: { fontSize: 16 },
    infoText: { flex: 1, fontSize: 13, lineHeight: 19 },
    card: { borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 14 },
    cardTop: { flexDirection: "row", gap: 12 },
    iconBox: {
      width: 44,
      height: 44,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    degree: { fontSize: 16, fontWeight: "700", marginBottom: 2 },
    institution: { fontSize: 13, marginBottom: 10 },
    badges: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
    dateBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
    dateText: { fontSize: 11, fontWeight: "500" },
    gradeBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
    gradeText: { fontSize: 11, fontWeight: "600" },
    actions: { alignItems: "center" },
    editIcon: { fontSize: 16 },
    deleteIcon: { fontSize: 16 },
    emptyState: { alignItems: "center", paddingVertical: 40 },
    emptyText: { marginTop: 12, fontSize: 14 },
    addBtn: {
      position: "absolute",
      bottom: 90,
      alignSelf: "center",
      borderRadius: 28,
      paddingHorizontal: 28,
      paddingVertical: 16,
      flexDirection: "row",
      alignItems: "center",
      elevation: 4,
    },
    addBtnText: {
      color: "#fff",
      fontSize: 14,
      fontWeight: "700",
      letterSpacing: 0.5,
    },
  });
