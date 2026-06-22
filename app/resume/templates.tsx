// app/resume/templates.tsx — Resume Templates Screen
// 3 real templates with live preview of user's actual data
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import { fetchResume, selectTemplate } from "../../services/resumeService";
import { Resume, ResumeTemplate } from "../../types/resume";

const { width } = Dimensions.get("window");
const CARD_W = width * 0.75;

const TEMPLATES: ResumeTemplate[] = [
  {
    _id: "simple-ats",
    name: "Simple ATS",
    description:
      "Clean, single-column layout optimised for applicant tracking systems. Best for corporate roles.",
    thumbnailUrl: "",
    isAtsFriendly: true,
  },
  {
    _id: "modern",
    name: "Modern Two-Column",
    description:
      "Side panel for skills and contact. Professional look for tech and design roles.",
    thumbnailUrl: "",
    isAtsFriendly: false,
  },
  {
    _id: "minimal",
    name: "Minimal Creative",
    description:
      "Accent colour header, compact spacing. Stands out for creative and startup positions.",
    thumbnailUrl: "",
    isAtsFriendly: false,
  },
];

const FEATURES = [
  { icon: "✅", label: "ATS Friendly" },
  { icon: "✏️", label: "Easy Edit" },
  { icon: "⬇️", label: "Free Export" },
  { icon: "🔗", label: "Direct Apply" },
];

// ── Mini resume previews rendered from real user data ─────────────────────────

function ATSPreview({
  resume,
  colors,
}: {
  resume: Resume | null;
  colors: any;
}) {
  const p = resume?.personalInfo;
  return (
    <View style={[prev.doc, { backgroundColor: "#fff" }]}>
      <Text style={prev.atsName}>
        {p?.fullName?.toUpperCase() || "YOUR NAME"}
      </Text>
      <Text style={[prev.atsTitle, { color: "#1D9E75" }]}>
        {resume?.experience[0]?.jobTitle ?? "Job Title"}
      </Text>
      <Text style={prev.atsContact}>
        {p?.email || "email@example.pk"} • {p?.phone || "+92 300 0000000"}
      </Text>
      <View style={prev.divider} />
      {[1, 2, 3].map((i) => (
        <View key={i} style={[prev.line, { width: `${100 - i * 10}%` }]} />
      ))}
      <Text style={prev.sectionLabel}>EXPERIENCE</Text>
      {[1, 2].map((i) => (
        <View key={i} style={{ marginBottom: 6 }}>
          <View style={[prev.line, { width: "80%", height: 6 }]} />
          <View
            style={[prev.line, { width: "60%", height: 5, marginTop: 3 }]}
          />
        </View>
      ))}
      <Text style={prev.sectionLabel}>SKILLS</Text>
      <View style={{ flexDirection: "row", gap: 4, flexWrap: "wrap" }}>
        {(resume?.skills.slice(0, 4) ?? []).map((s, i) => (
          <View key={i} style={prev.skillChip}>
            <Text style={prev.skillText}>{s.name}</Text>
          </View>
        ))}
        {(resume?.skills.length ?? 0) === 0 &&
          ["React", "Node.js", "SQL"].map((s) => (
            <View key={s} style={prev.skillChip}>
              <Text style={prev.skillText}>{s}</Text>
            </View>
          ))}
      </View>
    </View>
  );
}

function ModernPreview({
  resume,
  colors,
}: {
  resume: Resume | null;
  colors: any;
}) {
  const p = resume?.personalInfo;
  return (
    <View
      style={[
        prev.doc,
        {
          flexDirection: "row",
          backgroundColor: "#fff",
          padding: 0,
          overflow: "hidden",
        },
      ]}
    >
      <View style={[prev.sidebar, { backgroundColor: "#0F3D35" }]}>
        <View style={prev.avatarCircle} />
        <Text style={prev.sidebarName}>
          {p?.fullName?.split(" ")[0] ?? "Name"}
        </Text>
        <Text style={[prev.sectionLabel, { color: "#9FE1CB", marginTop: 12 }]}>
          SKILLS
        </Text>
        {["React", "Node", "SQL", "AWS"].map((s) => (
          <Text key={s} style={prev.sidebarItem}>
            • {s}
          </Text>
        ))}
        <Text style={[prev.sectionLabel, { color: "#9FE1CB", marginTop: 10 }]}>
          CONTACT
        </Text>
        {[1, 2].map((i) => (
          <View
            key={i}
            style={[
              prev.line,
              {
                width: "90%",
                height: 5,
                backgroundColor: "rgba(255,255,255,0.3)",
                marginBottom: 4,
              },
            ]}
          />
        ))}
      </View>
      <View style={{ flex: 1, padding: 10 }}>
        <Text style={prev.modernTitle}>
          {resume?.experience[0]?.jobTitle ?? "Job Title"}
        </Text>
        <Text style={[prev.sectionLabel, { marginTop: 10 }]}>EXPERIENCE</Text>
        {[1, 2, 3].map((i) => (
          <View key={i} style={[prev.line, { width: `${90 - i * 10}%` }]} />
        ))}
        <Text style={[prev.sectionLabel, { marginTop: 10 }]}>EDUCATION</Text>
        {[1, 2].map((i) => (
          <View key={i} style={[prev.line, { width: `${80 - i * 10}%` }]} />
        ))}
      </View>
    </View>
  );
}

function MinimalPreview({
  resume,
  colors,
}: {
  resume: Resume | null;
  colors: any;
}) {
  const p = resume?.personalInfo;
  return (
    <View
      style={[
        prev.doc,
        { backgroundColor: "#fff", padding: 0, overflow: "hidden" },
      ]}
    >
      <View style={{ backgroundColor: "#1D9E75", padding: 14 }}>
        <Text style={[prev.atsName, { color: "#fff", fontSize: 13 }]}>
          {p?.fullName?.toUpperCase() ?? "YOUR NAME"}
        </Text>
        <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 9 }}>
          {resume?.experience[0]?.jobTitle ?? "Job Title"}
        </Text>
      </View>
      <View style={{ padding: 10 }}>
        <Text style={prev.sectionLabel}>ABOUT</Text>
        {[1, 2, 3].map((i) => (
          <View key={i} style={[prev.line, { width: `${95 - i * 8}%` }]} />
        ))}
        <Text style={[prev.sectionLabel, { marginTop: 8 }]}>EXPERIENCE</Text>
        {[1, 2].map((i) => (
          <View key={i} style={{ marginBottom: 5 }}>
            <View style={[prev.line, { width: "75%", height: 6 }]} />
            <View
              style={[prev.line, { width: "55%", height: 5, marginTop: 2 }]}
            />
          </View>
        ))}
        <View
          style={{
            flexDirection: "row",
            gap: 4,
            marginTop: 6,
            flexWrap: "wrap",
          }}
        >
          {["Python", "Figma", "AWS"].map((s) => (
            <View
              key={s}
              style={[
                prev.skillChip,
                {
                  borderColor: "#1D9E75",
                  borderWidth: 1,
                  backgroundColor: "#E1F5EE",
                },
              ]}
            >
              <Text style={[prev.skillText, { color: "#145244" }]}>{s}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const PREVIEWS = {
  "simple-ats": ATSPreview,
  modern: ModernPreview,
  minimal: MinimalPreview,
};

export default function TemplatesScreen() {
  const { colors } = useTheme();
  const [selected, setSelected] = useState("simple-ats");
  const [resume, setResume] = useState<Resume | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchResume()
      .then(setResume)
      .catch(() => {});
  }, []);

  const handleSelect = async (id: string) => {
    setSelected(id);
    setSaving(true);
    try {
      await selectTemplate(id);
      router.push("/resume/preview" as any);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setSaving(false);
    }
  };

  const s = makeStyles(colors);

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[s.back, { color: colors.textPrimary }]}>←</Text>
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: colors.textPrimary }]}>
          Resume Templates
        </Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        <View style={[s.hero, { backgroundColor: colors.brandDark }]}>
          <Text style={s.heroTitle}>Build Your Future</Text>
          <Text style={s.heroSub}>
            Choose a template to showcase your expertise and land your dream job
            in Karachi's competitive market.
          </Text>
        </View>

        <Text style={[s.sectionTitle, { color: colors.textPrimary }]}>
          Choose Your Template
        </Text>
        <Text style={[s.sectionSub, { color: colors.textSecondary }]}>
          Previews below show your real resume data.
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_W + 16}
          decelerationRate="fast"
        >
          {TEMPLATES.map((t) => {
            const PreviewComp = PREVIEWS[t._id as keyof typeof PREVIEWS];
            const isSelected = selected === t._id;
            return (
              <View
                key={t._id}
                style={[
                  s.card,
                  {
                    width: CARD_W,
                    borderColor: isSelected ? colors.brand : colors.border,
                    backgroundColor: colors.bgCard,
                  },
                ]}
              >
                {/* Live preview */}
                <View style={s.previewWrap}>
                  <PreviewComp resume={resume} colors={colors} />
                </View>

                {isSelected && (
                  <View
                    style={[s.selectedBadge, { backgroundColor: colors.brand }]}
                  >
                    <Text style={s.selectedBadgeText}>✓ Selected</Text>
                  </View>
                )}

                <Text style={[s.cardName, { color: colors.textPrimary }]}>
                  {t.name}
                </Text>
                <Text style={[s.cardDesc, { color: colors.textSecondary }]}>
                  {t.description}
                </Text>

                {t.isAtsFriendly && (
                  <View
                    style={[s.atsBadge, { backgroundColor: colors.brandLight }]}
                  >
                    <Text style={[s.atsBadgeText, { color: colors.brand }]}>
                      ✅ ATS Optimised
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  style={[
                    s.selectBtn,
                    {
                      backgroundColor: isSelected
                        ? colors.success
                        : colors.brandDark,
                    },
                  ]}
                  onPress={() => handleSelect(t._id)}
                  disabled={saving}
                >
                  <Text style={s.selectBtnText}>
                    {isSelected ? "✓ Use This Template" : "Select & Preview"}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>

        <View style={s.featureGrid}>
          {FEATURES.map((f) => (
            <View
              key={f.label}
              style={[s.featureCard, { backgroundColor: colors.brandLight }]}
            >
              <Text style={{ fontSize: 22, marginBottom: 8 }}>{f.icon}</Text>
              <Text style={[s.featureLabel, { color: colors.textPrimary }]}>
                {f.label}
              </Text>
            </View>
          ))}
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const prev = StyleSheet.create({
  doc: { flex: 1, padding: 12 },
  atsName: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
    color: "#111",
  },
  atsTitle: { fontSize: 8, fontWeight: "600", marginBottom: 5 },
  atsContact: { fontSize: 6, color: "#666", marginBottom: 6 },
  divider: { height: 1, backgroundColor: "#E5E7EB", marginBottom: 8 },
  line: {
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    marginBottom: 5,
  },
  sectionLabel: {
    fontSize: 7,
    fontWeight: "800",
    letterSpacing: 0.8,
    color: "#374151",
    marginBottom: 5,
    marginTop: 4,
  },
  skillChip: {
    backgroundColor: "#E1F5EE",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  skillText: { fontSize: 6, fontWeight: "600", color: "#145244" },
  sidebar: { width: 70, padding: 10 },
  avatarCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginBottom: 6,
  },
  sidebarName: {
    color: "#fff",
    fontSize: 7,
    fontWeight: "700",
    textAlign: "center",
  },
  sidebarItem: { color: "rgba(255,255,255,0.8)", fontSize: 6, marginBottom: 2 },
  modernTitle: { fontSize: 9, fontWeight: "700", color: "#111" },
});

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
    back: { fontSize: 24 },
    headerTitle: { fontSize: 18, fontWeight: "700" },
    scroll: { padding: 20 },
    hero: { borderRadius: 20, padding: 22, marginBottom: 24 },
    heroTitle: {
      color: "#fff",
      fontSize: 22,
      fontWeight: "700",
      marginBottom: 8,
    },
    heroSub: { color: "rgba(255,255,255,0.85)", fontSize: 13, lineHeight: 19 },
    sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 4 },
    sectionSub: { fontSize: 13, marginBottom: 16 },
    card: {
      borderWidth: 2,
      borderRadius: 18,
      marginRight: 16,
      overflow: "hidden",
    },
    previewWrap: {
      height: 220,
      margin: 12,
      borderRadius: 12,
      overflow: "hidden",
      backgroundColor: "#fff",
      borderWidth: 1,
      borderColor: "#E5E7EB",
    },
    selectedBadge: {
      position: "absolute",
      top: 16,
      right: 16,
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    selectedBadgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
    cardName: {
      fontSize: 16,
      fontWeight: "700",
      paddingHorizontal: 14,
      marginBottom: 4,
    },
    cardDesc: {
      fontSize: 12,
      paddingHorizontal: 14,
      marginBottom: 10,
      lineHeight: 18,
    },
    atsBadge: {
      alignSelf: "flex-start",
      marginHorizontal: 14,
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 4,
      marginBottom: 12,
    },
    atsBadgeText: { fontSize: 11, fontWeight: "600" },
    selectBtn: {
      margin: 14,
      marginTop: 0,
      borderRadius: 12,
      height: 46,
      alignItems: "center",
      justifyContent: "center",
    },
    selectBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
    featureGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
      marginTop: 28,
    },
    featureCard: {
      width: "47%",
      borderRadius: 14,
      padding: 18,
      alignItems: "center",
    },
    featureLabel: { fontSize: 13, fontWeight: "600" },
  });
