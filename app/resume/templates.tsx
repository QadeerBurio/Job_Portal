// app/resume/templates.tsx — Resume Templates Screen
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
import { fetchTemplates, selectTemplate } from "../../services/resumeService";
import { ResumeTemplate } from "../../types/resume";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.78;

const FEATURES = [
  { icon: "✅", label: "ATS Friendly" },
  { icon: "✏️", label: "Easy Edit" },
  { icon: "⬇️", label: "Free Export" },
  { icon: "🔗", label: "Direct Apply" },
];

export default function TemplatesScreen() {
  const { colors } = useTheme();
  const [templates, setTemplates] = useState<ResumeTemplate[]>([]);
  const [selected, setSelected] = useState<string>("simple-ats");

  useEffect(() => {
    fetchTemplates()
      .then(setTemplates)
      .catch(() => {});
  }, []);

  const handleSelect = async (id: string) => {
    setSelected(id);
    try {
      await selectTemplate(id);
      router.push("/resume/preview");
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

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
        <View style={[s.hero, { backgroundColor: colors.brandDark }]}>
          <Text style={s.heroTitle}>Build Your Future</Text>
          <Text style={s.heroSub}>
            Choose a template to showcase your expertise and land your dream job
            in Karachi's competitive market.
          </Text>
        </View>

        <View style={s.sectionHeader}>
          <Text style={[s.sectionTitle, { color: colors.textPrimary }]}>
            Resume Templates
          </Text>
          <View style={s.navBtns}>
            <View style={[s.navBtn, { borderColor: colors.border }]}>
              <Text>‹</Text>
            </View>
            <View style={[s.navBtn, { borderColor: colors.border }]}>
              <Text>›</Text>
            </View>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH + 16}
        >
          {templates.map((t) => (
            <View
              key={t._id}
              style={[
                s.templateCard,
                {
                  width: CARD_WIDTH,
                  borderColor:
                    selected === t._id ? colors.brand : colors.border,
                  backgroundColor: colors.bgCard,
                },
              ]}
            >
              <View style={[s.preview, { backgroundColor: colors.bgTertiary }]}>
                {[1, 2, 3, 4].map((i) => (
                  <View
                    key={i}
                    style={[
                      s.previewLine,
                      {
                        backgroundColor: colors.border,
                        width: `${90 - i * 8}%`,
                      },
                    ]}
                  />
                ))}
              </View>
              <Text style={[s.templateName, { color: colors.textPrimary }]}>
                {t.name}
              </Text>
              <Text style={[s.templateDesc, { color: colors.textSecondary }]}>
                {t.description}
              </Text>
              <TouchableOpacity
                style={[s.selectBtn, { backgroundColor: colors.brandDark }]}
                onPress={() => handleSelect(t._id)}
              >
                <Text style={s.selectBtnText}>✓ Select</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        <View style={s.featureGrid}>
          {FEATURES.map((f) => (
            <View
              key={f.label}
              style={[s.featureCard, { backgroundColor: colors.brandLight }]}
            >
              <Text style={{ fontSize: 20, marginBottom: 6 }}>{f.icon}</Text>
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
    hero: { borderRadius: 20, padding: 22, marginBottom: 24 },
    heroTitle: {
      color: "#fff",
      fontSize: 22,
      fontWeight: "700",
      marginBottom: 8,
    },
    heroSub: { color: "rgba(255,255,255,0.85)", fontSize: 13, lineHeight: 19 },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 14,
    },
    sectionTitle: { fontSize: 18, fontWeight: "700" },
    navBtns: { flexDirection: "row", gap: 8 },
    navBtn: {
      width: 28,
      height: 28,
      borderRadius: 14,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    templateCard: {
      borderWidth: 2,
      borderRadius: 18,
      padding: 16,
      marginRight: 16,
    },
    preview: {
      height: 220,
      borderRadius: 12,
      padding: 16,
      gap: 10,
      marginBottom: 14,
      justifyContent: "flex-start",
    },
    previewLine: { height: 8, borderRadius: 4 },
    templateName: { fontSize: 16, fontWeight: "700", marginBottom: 4 },
    templateDesc: { fontSize: 12, marginBottom: 14, lineHeight: 18 },
    selectBtn: {
      borderRadius: 12,
      height: 46,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 6,
    },
    selectBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
    featureGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
      marginTop: 24,
    },
    featureCard: {
      width: "47%",
      borderRadius: 14,
      padding: 18,
      alignItems: "center",
    },
    featureLabel: { fontSize: 13, fontWeight: "600" },
  });
