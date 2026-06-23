// app/resume/add-education.tsx — Add Education Form
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
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
import { addEducation, updateEducation } from "../../services/resumeService";

export default function AddEducationScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = !!id;

  const [degree, setDegree] = useState("");
  const [institution, setInstitution] = useState("");
  const [city, setCity] = useState("Karachi");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isCurrent, setIsCurrent] = useState(false);
  const [grade, setGrade] = useState("");
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const s = makeStyles(colors);

  const handleSave = async () => {
    if (!degree.trim() || !institution.trim() || !startDate) {
      Alert.alert(
        "Missing info",
        "Degree, institution, and start date are required.",
      );
      return;
    }
    setSaving(true);
    try {
      const payload = {
        degree: degree.trim(),
        institution: institution.trim(),
        city: city.trim() || "Karachi",
        startDate: startDate.toISOString(),
        endDate: isCurrent ? null : (endDate?.toISOString() ?? null),
        isCurrent,
        grade: grade.trim(),
      };
      if (isEditing) await updateEducation(id, payload);
      else await addEducation(payload);
      router.back();
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setSaving(false);
    }
  };

  const fmtDate = (d: Date | null) =>
    d
      ? `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`
      : "---------- ----";

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: colors.textPrimary }]}>
          Add Education
        </Text>
        <Text style={{ fontSize: 20, color: colors.textTertiary }}>⋮</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        {/* Academic Profile banner */}
        <View
          style={[
            s.banner,
            { backgroundColor: colors.bgCard, borderColor: colors.border },
          ]}
        >
          <View style={[s.bannerIcon, { backgroundColor: colors.brandDark }]}>
            <Text style={{ fontSize: 22 }}>🎓</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[s.bannerTitle, { color: colors.textPrimary }]}>
              Academic Profile
            </Text>
            <Text style={[s.bannerSub, { color: colors.textSecondary }]}>
              Detail your educational background to help employers understand
              your qualifications better.
            </Text>
          </View>
        </View>

        <Text style={[s.label, { color: colors.textPrimary }]}>
          DEGREE / QUALIFICATION
        </Text>
        <TextInput
          style={[
            s.input,
            {
              borderColor: colors.border,
              backgroundColor: colors.bgCard,
              color: colors.textPrimary,
            },
          ]}
          placeholder="e.g. BS in Computer Science"
          placeholderTextColor={colors.textTertiary}
          value={degree}
          onChangeText={setDegree}
        />

        <Text style={[s.label, { color: colors.textPrimary }]}>
          INSTITUTION NAME
        </Text>
        <TextInput
          style={[
            s.input,
            {
              borderColor: colors.border,
              backgroundColor: colors.bgCard,
              color: colors.textPrimary,
            },
          ]}
          placeholder="e.g. IBA Karachi"
          placeholderTextColor={colors.textTertiary}
          value={institution}
          onChangeText={setInstitution}
        />

        <Text style={[s.label, { color: colors.textPrimary }]}>CITY</Text>
        <View
          style={[
            s.inputRow,
            { borderColor: colors.border, backgroundColor: colors.bgCard },
          ]}
        >
          <TextInput
            style={[
              s.input,
              { flex: 1, borderWidth: 0, color: colors.textPrimary },
            ]}
            placeholder="e.g. Karachi"
            placeholderTextColor={colors.textTertiary}
            value={city}
            onChangeText={setCity}
          />
          <Text style={{ color: colors.textTertiary }}>📍</Text>
        </View>

        <View style={s.dateRow}>
          <View style={{ flex: 1 }}>
            <Text style={[s.label, { color: colors.textPrimary }]}>
              START DATE
            </Text>
            <TouchableOpacity
              style={[
                s.input,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.bgCard,
                  justifyContent: "center",
                },
              ]}
              onPress={() => setShowStartPicker(true)}
            >
              <Text
                style={{
                  color: startDate ? colors.textPrimary : colors.textTertiary,
                  fontSize: 13,
                }}
              >
                {fmtDate(startDate)} 📅
              </Text>
            </TouchableOpacity>
          </View>
          <View style={{ width: 12 }} />
          <View style={{ flex: 1 }}>
            <Text style={[s.label, { color: colors.textPrimary }]}>
              END DATE
            </Text>
            <TouchableOpacity
              style={[
                s.input,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.bgCard,
                  justifyContent: "center",
                },
              ]}
              onPress={() => !isCurrent && setShowEndPicker(true)}
            >
              <Text
                style={{
                  color: endDate ? colors.textPrimary : colors.textTertiary,
                  fontSize: 13,
                }}
              >
                {fmtDate(endDate)} 📅
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {showStartPicker && (
          <DateTimePicker
            value={startDate ?? new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(_, d) => {
              setShowStartPicker(false);
              if (d) setStartDate(d);
            }}
          />
        )}
        {showEndPicker && (
          <DateTimePicker
            value={endDate ?? new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(_, d) => {
              setShowEndPicker(false);
              if (d) setEndDate(d);
            }}
          />
        )}

        <TouchableOpacity
          style={s.checkRow}
          onPress={() => setIsCurrent(!isCurrent)}
        >
          <View
            style={[
              s.checkbox,
              {
                borderColor: colors.border,
                backgroundColor: isCurrent ? colors.brand : "transparent",
              },
            ]}
          >
            {isCurrent && (
              <Text style={{ color: "#fff", fontSize: 11 }}>✓</Text>
            )}
          </View>
          <Text style={[s.checkLabel, { color: colors.textPrimary }]}>
            I AM CURRENTLY STUDYING HERE
          </Text>
        </TouchableOpacity>

        <Text style={[s.label, { color: colors.textPrimary }]}>
          CGPA / PERCENTAGE
        </Text>
        <View
          style={[
            s.inputRow,
            { borderColor: colors.border, backgroundColor: colors.bgCard },
          ]}
        >
          <TextInput
            style={[
              s.input,
              { flex: 1, borderWidth: 0, color: colors.textPrimary },
            ]}
            placeholder="e.g. 3.8 or 85%"
            placeholderTextColor={colors.textTertiary}
            value={grade}
            onChangeText={setGrade}
          />
          <Text style={{ color: colors.textTertiary }}>⭐</Text>
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
            {saving ? "Saving…" : "Save Education"} 💾
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
    headerTitle: { fontSize: 18, fontWeight: "700" },
    scroll: { padding: 20 },
    banner: {
      flexDirection: "row",
      gap: 14,
      borderWidth: 1,
      borderRadius: 16,
      padding: 16,
      marginBottom: 24,
    },
    bannerIcon: {
      width: 48,
      height: 48,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    bannerTitle: { fontSize: 16, fontWeight: "700", marginBottom: 4 },
    bannerSub: { fontSize: 12, lineHeight: 18 },
    label: {
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 0.5,
      marginBottom: 8,
      marginTop: 16,
    },
    input: {
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 14,
      height: 50,
      fontSize: 14,
    },
    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 14,
      height: 50,
    },
    dateRow: { flexDirection: "row" },
    checkRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginTop: 18,
    },
    checkbox: {
      width: 20,
      height: 20,
      borderRadius: 5,
      borderWidth: 1.5,
      alignItems: "center",
      justifyContent: "center",
    },
    checkLabel: { fontSize: 12, fontWeight: "600", letterSpacing: 0.3 },
    footer: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 16 },
    saveBtn: {
      height: 56,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  });
