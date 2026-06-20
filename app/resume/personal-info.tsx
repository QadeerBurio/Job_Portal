// app/resume/personal-info.tsx — Personal Information Screen
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Alert,
    Image,
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

export default function PersonalInfoScreen() {
  const { colors } = useTheme();
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

  useEffect(() => {
    fetchResume()
      .then((r) => {
        const p = r.personalInfo;
        setFullName(p.fullName ?? "");
        setEmail(p.email ?? "");
        setPhone(p.phone ?? "");
        setCityCountry(p.city && p.country ? `${p.city}, ${p.country}` : "");
        setLinkedinUrl(p.linkedinUrl ?? "");
        setPortfolioUrl(p.portfolioUrl ?? "");
        setSummary(p.summary ?? "");
        setAvatarUrl(p.avatarUrl ?? "");
      })
      .catch((e) => Alert.alert("Error", e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const [city, ...countryParts] = cityCountry
        .split(",")
        .map((s) => s.trim());
      await updatePersonalInfo({
        fullName,
        email,
        phone,
        city: city || "Karachi",
        country: countryParts.join(", ") || "Pakistan",
        linkedinUrl,
        portfolioUrl,
        summary,
      });
      router.back();
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setSaving(false);
    }
  };

  const s = makeStyles(colors);

  const Field = ({
    label,
    icon,
    value,
    onChangeText,
    placeholder,
    keyboardType,
  }: any) => (
    <View style={[s.field, { backgroundColor: colors.bgCard }]}>
      <Text style={[s.fieldLabel, { color: colors.textTertiary }]}>
        {label}
      </Text>
      <View style={s.fieldRow}>
        <Text style={s.fieldIcon}>{icon}</Text>
        <TextInput
          style={[
            s.fieldInput,
            { color: colors.textPrimary, borderBottomColor: colors.border },
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          keyboardType={keyboardType}
          autoCapitalize="none"
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[s.backArrow, { color: colors.textPrimary }]}>←</Text>
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: colors.textPrimary }]}>
          Personal Information
        </Text>
        <View style={[s.avatar, { backgroundColor: colors.brand }]}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={s.avatarImg} />
          ) : (
            <Text style={{ color: "#fff" }}>👤</Text>
          )}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        <Text style={[s.subtitle, { color: colors.textSecondary }]}>
          Update your details to help recruiters find you. Your summary should
          highlight your unique strengths in Karachi's job market.
        </Text>

        <Field
          label="FULL NAME"
          icon="👤"
          value={fullName}
          onChangeText={setFullName}
          placeholder="Your name"
        />
        <Field
          label="EMAIL ADDRESS"
          icon="✉️"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.pk"
          keyboardType="email-address"
        />
        <Field
          label="PHONE NUMBER"
          icon="📞"
          value={phone}
          onChangeText={setPhone}
          placeholder="+92 300 1234567"
          keyboardType="phone-pad"
        />
        <Field
          label="CITY & COUNTRY"
          icon="📍"
          value={cityCountry}
          onChangeText={setCityCountry}
          placeholder="Karachi, Pakistan"
        />
        <Field
          label="LINKEDIN URL"
          icon="🔗"
          value={linkedinUrl}
          onChangeText={setLinkedinUrl}
          placeholder="linkedin.com/in/you"
        />
        <Field
          label="PORTFOLIO WEBSITE"
          icon="🌐"
          value={portfolioUrl}
          onChangeText={setPortfolioUrl}
          placeholder="yourname.design"
        />

        {/* Summary */}
        <View style={[s.field, { backgroundColor: colors.bgCard }]}>
          <Text style={[s.fieldLabel, { color: colors.textTertiary }]}>
            PROFESSIONAL SUMMARY
          </Text>
          <TextInput
            style={[
              s.summaryInput,
              { backgroundColor: colors.brandLight, color: colors.textPrimary },
            ]}
            value={summary}
            onChangeText={(t) => t.length <= MAX_SUMMARY && setSummary(t)}
            placeholder="Dedicated professional with X years of experience…"
            placeholderTextColor={colors.textTertiary}
            multiline
            textAlignVertical="top"
          />
          <Text style={[s.charCount, { color: colors.textTertiary }]}>
            {summary.length} / {MAX_SUMMARY} characters
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={[s.footer, { backgroundColor: colors.bgPrimary }]}>
        <TouchableOpacity
          style={[
            s.saveBtn,
            { backgroundColor: colors.brandDark, opacity: saving ? 0.6 : 1 },
          ]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={s.saveBtnText}>
            {saving ? "Saving…" : "Save Changes"}
          </Text>
        </TouchableOpacity>
      </View>
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
    },
    summaryInput: {
      borderRadius: 10,
      padding: 14,
      minHeight: 130,
      fontSize: 14,
      lineHeight: 21,
    },
    charCount: { fontSize: 11, textAlign: "right", marginTop: 8 },
    footer: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 16 },
    saveBtn: {
      height: 56,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  });
