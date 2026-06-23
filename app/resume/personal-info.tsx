// app/resume/personal-info.tsx — Personal Information Screen
// ─────────────────────────────────────────────────────────────────────────────
// FIX: Field component is defined OUTSIDE PersonalInfoScreen so React never
// unmounts/remounts TextInputs on re-render → no glitching, no lost input.
// ─────────────────────────────────────────────────────────────────────────────
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import { fetchResume, updatePersonalInfo } from "../../services/resumeService";

const MAX_SUMMARY = 500;

// ── Field component defined at MODULE level (not inside the screen) ───────────
// This is the critical fix. When Field is defined inside a component,
// React treats it as a new component type on every render and unmounts
// the old TextInput (losing focus + cursor position = glitching).
type FieldProps = {
  label: string;
  icon: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  keyboardType?: any;
  colors: any;
};

function Field({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  colors,
}: FieldProps) {
  return (
    <View style={[styles.field, { backgroundColor: colors.bgCard }]}>
      <Text style={[styles.fieldLabel, { color: colors.textTertiary }]}>
        {label}
      </Text>
      <View style={styles.fieldRow}>
        <Text style={styles.fieldIcon}>{icon}</Text>
        <TextInput
          style={[
            styles.fieldInput,
            { color: colors.textPrimary, borderBottomColor: colors.border },
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          keyboardType={keyboardType ?? "default"}
          autoCapitalize="none"
          autoCorrect={false}
          // ↑ Prevent autocorrect from stealing cursor focus mid-word
        />
      </View>
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function PersonalInfoScreen() {
  const { colors } = useTheme();

  // ── Form state ─────────────────────────────────────────────────────────────
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cityCountry, setCityCountry] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [summary, setSummary] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load existing resume data on mount
  useEffect(() => {
    fetchResume()
      .then((r) => {
        const p = r.personalInfo;
        if (!p) return;
        setFullName(p.fullName ?? "");
        setEmail(p.email ?? "");
        setPhone(p.phone ?? "");
        setCityCountry(
          p.city && p.country ? `${p.city}, ${p.country}` : (p.city ?? ""),
        );
        setLinkedinUrl(p.linkedinUrl ?? "");
        setPortfolioUrl(p.portfolioUrl ?? "");
        setSummary(p.summary ?? "");
        setAvatarUrl(p.avatarUrl ?? "");
      })
      .catch((e) => Alert.alert("Load Error", e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert("Required", "Please enter your full name.");
      return;
    }
    setSaving(true);
    try {
      // Parse "Karachi, Pakistan" → city: "Karachi", country: "Pakistan"
      const parts = cityCountry.split(",").map((s) => s.trim());
      const city = parts[0] || "Karachi";
      const country = parts.slice(1).join(", ") || "Pakistan";

      await updatePersonalInfo({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        city,
        country,
        linkedinUrl: linkedinUrl.trim(),
        portfolioUrl: portfolioUrl.trim(),
        summary: summary.trim(),
      });

      Alert.alert("Saved ✓", "Your personal information has been updated.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert("Save Error", e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.bgSecondary }]}
      edges={["top"]}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.bgPrimary,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          Personal Information
        </Text>
        <View style={[styles.avatar, { backgroundColor: colors.brand }]}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarImg} />
          ) : (
            <Text style={{ color: "#fff" }}>
              <Ionicons name="person" size={20} color={colors.text} />
            </Text>
          )}
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          // ↑ Prevents keyboard from dismissing when tapping between fields
        >
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Update your details to help recruiters find you. Your summary should
            highlight your unique strengths in Karachi's job market.
          </Text>

          {/* ── Fields — pass colors as prop so Field doesn't need context ── */}
          <Field
            label="FULL NAME"
            icon="👤"
            colors={colors}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Your full name"
          />
          <Field
            label="EMAIL ADDRESS"
            icon="✉️"
            colors={colors}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.pk"
            keyboardType="email-address"
          />
          <Field
            label="PHONE NUMBER"
            icon="📞"
            colors={colors}
            value={phone}
            onChangeText={setPhone}
            placeholder="+92 300 1234567"
            keyboardType="phone-pad"
          />
          <Field
            label="CITY & COUNTRY"
            icon="📍"
            colors={colors}
            value={cityCountry}
            onChangeText={setCityCountry}
            placeholder="Karachi, Pakistan"
          />
          <Field
            label="LINKEDIN URL"
            icon="🔗"
            colors={colors}
            value={linkedinUrl}
            onChangeText={setLinkedinUrl}
            placeholder="linkedin.com/in/you"
          />
          <Field
            label="PORTFOLIO WEBSITE"
            icon="🌐"
            colors={colors}
            value={portfolioUrl}
            onChangeText={setPortfolioUrl}
            placeholder="yourname.design"
          />

          {/* Summary (multiline — stays inline) */}
          <View style={[styles.field, { backgroundColor: colors.bgCard }]}>
            <Text style={[styles.fieldLabel, { color: colors.textTertiary }]}>
              PROFESSIONAL SUMMARY
            </Text>
            <TextInput
              style={[
                styles.summaryInput,
                {
                  backgroundColor: colors.brandLight,
                  color: colors.textPrimary,
                },
              ]}
              value={summary}
              onChangeText={(t) => t.length <= MAX_SUMMARY && setSummary(t)}
              placeholder="Dedicated professional with X years of experience…"
              placeholderTextColor={colors.textTertiary}
              multiline
              textAlignVertical="top"
              autoCorrect={false}
            />
            <Text
              style={[
                styles.charCount,
                {
                  color:
                    summary.length >= MAX_SUMMARY - 50
                      ? colors.danger
                      : colors.textTertiary,
                },
              ]}
            >
              {summary.length} / {MAX_SUMMARY} characters
            </Text>
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Save button */}
      <View
        style={[
          styles.footer,
          { backgroundColor: colors.bgPrimary, borderTopColor: colors.border },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.saveBtn,
            { backgroundColor: colors.brandDark, opacity: saving ? 0.6 : 1 },
          ]}
          onPress={handleSave}
          disabled={saving || loading}
        >
          <Text style={styles.saveBtnText}>
            {saving ? "Saving…" : "Save Changes"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ── Styles at module level (stable across renders) ────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backArrow: { fontSize: 24 },
  headerTitle: { fontSize: 17, fontWeight: "700" },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImg: { width: 36, height: 36 },
  scroll: { padding: 20 },
  subtitle: { fontSize: 14, lineHeight: 21, marginBottom: 20 },
  field: { borderRadius: 14, padding: 16, marginBottom: 14 },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  fieldRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  fieldIcon: { fontSize: 16 },
  fieldInput: {
    flex: 1,
    fontSize: 15,
    borderBottomWidth: 1,
    paddingBottom: 8,
    paddingVertical: 4,
  },
  summaryInput: {
    borderRadius: 10,
    padding: 14,
    minHeight: 130,
    fontSize: 14,
    lineHeight: 21,
  },
  charCount: { fontSize: 11, textAlign: "right", marginTop: 8 },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
  },
  saveBtn: {
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
