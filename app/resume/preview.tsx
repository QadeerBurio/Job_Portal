// app/resume/preview.tsx — Resume Preview Screen
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Alert,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import { fetchAtsScore, fetchResume } from "../../services/resumeService";
import { Resume } from "../../types/resume";

function fmtMonthYear(d: string | null): string {
  return d
    ? new Date(d).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "Present";
}

export default function ResumePreviewScreen() {
  const { colors } = useTheme();
  const [resume, setResume] = useState<Resume | null>(null);
  const [atsScore, setAtsScore] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchResume(), fetchAtsScore()])
      .then(([r, ats]) => {
        setResume(r);
        setAtsScore(ats.total);
      })
      .catch((e) => Alert.alert("Error", e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${resume?.personalInfo.fullName}'s resume on KarachiJobs!`,
      });
    } catch {}
  };

  const s = makeStyles(colors);

  if (loading || !resume) {
    return (
      <SafeAreaView style={s.safe} edges={["top"]}>
        <View style={s.loadingBox}>
          <Text style={{ color: colors.textSecondary }}>Loading resume…</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { personalInfo, experience, skills, projects, education } = resume;

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[s.backArrow, { color: colors.textPrimary }]}>←</Text>
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: colors.textPrimary }]}>
          Resume Preview
        </Text>
        <Text style={{ fontSize: 18, color: colors.textTertiary }}>⋮</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        {/* ATS Score banner */}
        <View style={[s.atsBanner, { backgroundColor: colors.brandLight }]}>
          <Text style={s.atsCheck}>✓</Text>
          <View style={{ flex: 1 }}>
            <Text style={[s.atsScore, { color: colors.textPrimary }]}>
              ATS Score: {atsScore}/100
            </Text>
            <Text style={[s.atsSub, { color: colors.textSecondary }]}>
              Your resume is optimized for large tech firms in Karachi.
            </Text>
          </View>
        </View>

        {/* Resume document */}
        <View style={[s.doc, { backgroundColor: colors.bgCard }]}>
          <Text style={[s.docName, { color: colors.textPrimary }]}>
            {personalInfo.fullName?.toUpperCase() || "YOUR NAME"}
          </Text>
          <Text style={[s.docTitle, { color: colors.brand }]}>
            {experience[0]?.jobTitle ?? "Your Title"}
          </Text>

          <View style={s.contactRow}>
            {personalInfo.email && (
              <Text style={[s.contactItem, { color: colors.textSecondary }]}>
                ✉️ {personalInfo.email}
              </Text>
            )}
            {personalInfo.phone && (
              <Text style={[s.contactItem, { color: colors.textSecondary }]}>
                📞 {personalInfo.phone}
              </Text>
            )}
            <Text style={[s.contactItem, { color: colors.textSecondary }]}>
              📍 {personalInfo.city}, {personalInfo.country}
            </Text>
            {personalInfo.linkedinUrl && (
              <Text style={[s.contactItem, { color: colors.textSecondary }]}>
                ∞ {personalInfo.linkedinUrl}
              </Text>
            )}
          </View>

          <View style={[s.divider, { backgroundColor: colors.border }]} />

          {personalInfo.summary ? (
            <>
              <Text style={[s.docSectionTitle, { color: colors.textPrimary }]}>
                PROFESSIONAL SUMMARY
              </Text>
              <Text style={[s.docBody, { color: colors.textSecondary }]}>
                {personalInfo.summary}
              </Text>
            </>
          ) : null}

          {experience.length > 0 && (
            <>
              <Text
                style={[
                  s.docSectionTitle,
                  { color: colors.textPrimary, marginTop: 18 },
                ]}
              >
                WORK EXPERIENCE
              </Text>
              {experience.map((exp) => (
                <View key={exp._id} style={{ marginBottom: 14 }}>
                  <View style={s.expRow}>
                    <Text style={[s.expTitle, { color: colors.textPrimary }]}>
                      {exp.jobTitle}
                    </Text>
                    <Text style={[s.expDate, { color: colors.textTertiary }]}>
                      {fmtMonthYear(exp.startDate)} —{" "}
                      {exp.isCurrent ? "Present" : fmtMonthYear(exp.endDate)}
                    </Text>
                  </View>
                  <Text style={[s.expCompany, { color: colors.brand }]}>
                    {exp.companyName}, {exp.location?.split(",")[0]}
                  </Text>
                  {(exp.bullets?.length ? exp.bullets : [exp.description]).map(
                    (b, i) => (
                      <Text
                        key={i}
                        style={[s.bullet, { color: colors.textSecondary }]}
                      >
                        • {b}
                      </Text>
                    ),
                  )}
                </View>
              ))}
            </>
          )}

          {skills.length > 0 && (
            <>
              <Text style={[s.docSectionTitle, { color: colors.textPrimary }]}>
                TECHNICAL SKILLS
              </Text>
              <View style={s.skillsWrap}>
                {skills.map((sk) => (
                  <View
                    key={sk._id}
                    style={[
                      s.skillChip,
                      { backgroundColor: colors.bgTertiary },
                    ]}
                  >
                    <Text style={[s.skillText, { color: colors.textPrimary }]}>
                      {sk.name}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {projects.length > 0 && (
            <>
              <Text
                style={[
                  s.docSectionTitle,
                  { color: colors.textPrimary, marginTop: 18 },
                ]}
              >
                KEY PROJECTS
              </Text>
              {projects.slice(0, 3).map((p) => (
                <View
                  key={p._id}
                  style={[s.projectBox, { backgroundColor: colors.bgTertiary }]}
                >
                  <Text style={[s.projectName, { color: colors.textPrimary }]}>
                    {p.name}
                  </Text>
                  <Text
                    style={[s.projectDesc, { color: colors.textSecondary }]}
                    numberOfLines={2}
                  >
                    {p.description}
                  </Text>
                </View>
              ))}
            </>
          )}

          {education.length > 0 && (
            <>
              <Text
                style={[
                  s.docSectionTitle,
                  { color: colors.textPrimary, marginTop: 18 },
                ]}
              >
                EDUCATION
              </Text>
              <View style={s.expRow}>
                <Text style={[s.expTitle, { color: colors.textPrimary }]}>
                  {education[0].degree}
                </Text>
                <Text style={[s.expDate, { color: colors.textTertiary }]}>
                  Graduated{" "}
                  {new Date(
                    education[0].endDate ?? education[0].startDate,
                  ).getFullYear()}
                </Text>
              </View>
            </>
          )}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      <View
        style={[
          s.footer,
          { backgroundColor: colors.bgPrimary, borderTopColor: colors.border },
        ]}
      >
        <TouchableOpacity
          style={[s.outlineBtn, { borderColor: colors.border }]}
          onPress={() => router.push("/resume/personal-info")}
        >
          <Text style={[s.outlineBtnText, { color: colors.textPrimary }]}>
            ✏️ Edit Resume
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.solidBtn, { backgroundColor: colors.success }]}
          onPress={() => Alert.alert("Download", "PDF export coming soon")}
        >
          <Text style={s.solidBtnText}>⬇️ Download PDF</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.outlineBtn, { borderColor: colors.border }]}
          onPress={handleShare}
        >
          <Text style={[s.outlineBtnText, { color: colors.textPrimary }]}>
            🔗 Share
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (c: any) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bgSecondary },
    loadingBox: { flex: 1, alignItems: "center", justifyContent: "center" },
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
    headerTitle: { fontSize: 17, fontWeight: "700" },
    scroll: { padding: 16 },
    atsBanner: {
      flexDirection: "row",
      gap: 12,
      borderRadius: 14,
      padding: 16,
      marginBottom: 16,
      alignItems: "center",
    },
    atsCheck: { fontSize: 20, color: "#22C55E" },
    atsScore: { fontSize: 15, fontWeight: "700" },
    atsSub: { fontSize: 12, marginTop: 2 },
    doc: { borderRadius: 16, padding: 22 },
    docName: {
      fontSize: 20,
      fontWeight: "800",
      letterSpacing: 0.5,
      marginBottom: 4,
    },
    docTitle: { fontSize: 14, fontWeight: "600", marginBottom: 12 },
    contactRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
      marginBottom: 14,
    },
    contactItem: { fontSize: 11 },
    divider: { height: 1, marginBottom: 16 },
    docSectionTitle: {
      fontSize: 12,
      fontWeight: "800",
      letterSpacing: 0.8,
      marginBottom: 10,
    },
    docBody: { fontSize: 12, lineHeight: 19 },
    expRow: { flexDirection: "row", justifyContent: "space-between" },
    expTitle: { fontSize: 13, fontWeight: "700" },
    expDate: { fontSize: 11 },
    expCompany: { fontSize: 12, fontWeight: "600", marginBottom: 6 },
    bullet: { fontSize: 11, lineHeight: 18 },
    skillsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    skillChip: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
    skillText: { fontSize: 11, fontWeight: "600" },
    projectBox: { borderRadius: 10, padding: 12, marginBottom: 8 },
    projectName: { fontSize: 12, fontWeight: "700", marginBottom: 4 },
    projectDesc: { fontSize: 11, lineHeight: 16 },
    footer: { flexDirection: "row", gap: 8, padding: 16, borderTopWidth: 1 },
    outlineBtn: {
      flex: 1,
      borderWidth: 1,
      borderRadius: 12,
      height: 48,
      alignItems: "center",
      justifyContent: "center",
    },
    outlineBtnText: { fontSize: 12, fontWeight: "600" },
    solidBtn: {
      flex: 1.3,
      borderRadius: 12,
      height: 48,
      alignItems: "center",
      justifyContent: "center",
    },
    solidBtnText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  });
