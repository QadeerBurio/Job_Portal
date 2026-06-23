// app/resume/add-experience.tsx — Add Experience Form (Step 2 of 4)
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import { addExperience, updateExperience } from "../../services/resumeService";

export default function AddExperienceScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = !!id;

  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isCurrent, setIsCurrent] = useState(false);
  const [description, setDescription] = useState("");
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const s = makeStyles(colors);

  const handleSave = async () => {
    if (!jobTitle.trim() || !companyName.trim() || !startDate) {
      Alert.alert(
        "Missing info",
        "Job title, company, and start date are required.",
      );
      return;
    }
    if (description.trim().length < 50) {
      Alert.alert(
        "Description too short",
        "Please write at least 50 characters describing your role.",
      );
      return;
    }

    setSaving(true);
    try {
      const payload = {
        jobTitle: jobTitle.trim(),
        companyName: companyName.trim(),
        location: location.trim() || "Karachi, Pakistan",
        startDate: startDate.toISOString(),
        endDate: isCurrent ? null : (endDate?.toISOString() ?? null),
        isCurrent,
        description: description.trim(),
      };

      if (isEditing) await updateExperience(id, payload);
      else await addExperience(payload);

      router.back();
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setSaving(false);
    }
  };

  const fmtDate = (d: Date | null) =>
    d
      ? d.toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
        })
      : "mm/dd/yyyy";

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: colors.textPrimary }]}>
          Add Experience
        </Text>
        <View style={[s.stepBadge, { backgroundColor: colors.bgTertiary }]}>
          <Text style={[s.stepText, { color: colors.textSecondary }]}>
            Step 2 of 4
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        <View
          style={[
            s.formCard,
            { backgroundColor: colors.bgCard, borderColor: colors.border },
          ]}
        >
          <Text style={[s.label, { color: colors.textPrimary }]}>
            Job Title
          </Text>
          <View
            style={[
              s.inputRow,
              {
                borderColor: colors.border,
                backgroundColor: colors.bgSecondary,
              },
            ]}
          >
            <Text style={s.inputIcon}>💼</Text>
            <TextInput
              style={[s.input, { color: colors.textPrimary }]}
              placeholder="e.g. Senior Software Engineer"
              placeholderTextColor={colors.textTertiary}
              value={jobTitle}
              onChangeText={setJobTitle}
            />
          </View>

          <Text style={[s.label, { color: colors.textPrimary }]}>
            Company Name
          </Text>
          <View
            style={[
              s.inputRow,
              {
                borderColor: colors.border,
                backgroundColor: colors.bgSecondary,
              },
            ]}
          >
            <Text style={s.inputIcon}>🏢</Text>
            <TextInput
              style={[s.input, { color: colors.textPrimary }]}
              placeholder="e.g. Systems Limited"
              placeholderTextColor={colors.textTertiary}
              value={companyName}
              onChangeText={setCompanyName}
            />
          </View>

          <Text style={[s.label, { color: colors.textPrimary }]}>Location</Text>
          <View
            style={[
              s.inputRow,
              {
                borderColor: colors.border,
                backgroundColor: colors.bgSecondary,
              },
            ]}
          >
            <Text style={s.inputIcon}>📍</Text>
            <TextInput
              style={[s.input, { color: colors.textPrimary }]}
              placeholder="e.g. Karachi, Pakistan"
              placeholderTextColor={colors.textTertiary}
              value={location}
              onChangeText={setLocation}
            />
          </View>

          <Text style={[s.label, { color: colors.textPrimary }]}>
            Start Date
          </Text>
          <TouchableOpacity
            style={[
              s.inputRow,
              {
                borderColor: colors.border,
                backgroundColor: colors.bgSecondary,
              },
            ]}
            onPress={() => setShowStartPicker(true)}
          >
            <Text style={s.inputIcon}>📅</Text>
            <Text
              style={[
                s.input,
                { color: startDate ? colors.textPrimary : colors.textTertiary },
              ]}
            >
              {fmtDate(startDate)}
            </Text>
          </TouchableOpacity>
          {showStartPicker && (
            <DateTimePicker
              value={startDate ?? new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(_, date) => {
                setShowStartPicker(false);
                if (date) setStartDate(date);
              }}
            />
          )}

          {!isCurrent && (
            <>
              <Text style={[s.label, { color: colors.textPrimary }]}>
                End Date
              </Text>
              <TouchableOpacity
                style={[
                  s.inputRow,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.bgSecondary,
                  },
                ]}
                onPress={() => setShowEndPicker(true)}
              >
                <Text style={s.inputIcon}>📅</Text>
                <Text
                  style={[
                    s.input,
                    {
                      color: endDate ? colors.textPrimary : colors.textTertiary,
                    },
                  ]}
                >
                  {fmtDate(endDate)}
                </Text>
              </TouchableOpacity>
              {showEndPicker && (
                <DateTimePicker
                  value={endDate ?? new Date()}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={(_, date) => {
                    setShowEndPicker(false);
                    if (date) setEndDate(date);
                  }}
                />
              )}
            </>
          )}

          <View style={s.switchRow}>
            <Switch
              value={isCurrent}
              onValueChange={setIsCurrent}
              trackColor={{ false: colors.border, true: colors.brand }}
            />
            <Text style={[s.switchLabel, { color: colors.textPrimary }]}>
              I currently work here
            </Text>
          </View>

          <Text style={[s.label, { color: colors.textPrimary }]}>
            Job Description
          </Text>
          <TextInput
            style={[
              s.textarea,
              {
                borderColor: colors.border,
                backgroundColor: colors.bgSecondary,
                color: colors.textPrimary,
              },
            ]}
            placeholder="Highlight your responsibilities and achievements in this role…"
            placeholderTextColor={colors.textTertiary}
            value={description}
            onChangeText={setDescription}
            multiline
            textAlignVertical="top"
          />
          <Text
            style={[
              s.charCount,
              {
                color:
                  description.length >= 50
                    ? colors.success
                    : colors.textTertiary,
              },
            ]}
          >
            {description.length < 50
              ? `Min 50 characters (${description.length}/50)`
              : `${description.length} characters`}
          </Text>
        </View>

        <Text style={[s.quote, { color: colors.textSecondary }]}>
          "Karachi's tech sector is booming. Precise descriptions help local
          recruiters understand your impact."
        </Text>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Save button */}
      <View
        style={[
          s.footer,
          { backgroundColor: colors.bgPrimary, borderTopColor: colors.border },
        ]}
      >
        <TouchableOpacity
          style={[
            s.saveBtn,
            { backgroundColor: colors.brandDark, opacity: saving ? 0.6 : 1 },
          ]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={s.saveBtnText}>
            {saving ? "Saving…" : "Save Experience"} 💾
          </Text>
        </TouchableOpacity>
        <Text style={[s.footerNote, { color: colors.textTertiary }]}>
          You can add more experiences after saving this one.
        </Text>
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
    stepBadge: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
    stepText: { fontSize: 12, fontWeight: "600" },
    scroll: { padding: 20 },
    formCard: { borderWidth: 1, borderRadius: 18, padding: 20 },
    label: { fontSize: 14, fontWeight: "600", marginBottom: 8, marginTop: 16 },
    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 14,
      height: 52,
      gap: 10,
    },
    inputIcon: { fontSize: 16 },
    input: { flex: 1, fontSize: 14 },
    switchRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginTop: 18,
    },
    switchLabel: { fontSize: 14 },
    textarea: {
      borderWidth: 1,
      borderRadius: 12,
      padding: 14,
      minHeight: 110,
      fontSize: 14,
    },
    charCount: { fontSize: 11, textAlign: "right", marginTop: 6 },
    quote: {
      fontSize: 13,
      fontStyle: "italic",
      textAlign: "center",
      paddingHorizontal: 24,
      marginTop: 20,
      lineHeight: 20,
    },
    footer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      padding: 16,
      borderTopWidth: 1,
    },
    saveBtn: {
      height: 54,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
    footerNote: { fontSize: 11, textAlign: "center", marginTop: 8 },
  });
