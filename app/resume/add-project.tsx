// app/resume/add-project.tsx — Project Details Form
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import { addProject, updateProject } from "../../services/resumeService";

const MAX_DESC = 500;

export default function AddProjectScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = !!id;

  const [name, setName] = useState("");
  const [techs, setTechs] = useState<string[]>([]);
  const [techInput, setTechInput] = useState("");
  const [projectUrl, setProjectUrl] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const s = makeStyles(colors);

  const addTech = () => {
    const t = techInput.trim();
    if (t && !techs.includes(t)) {
      setTechs([...techs, t]);
      setTechInput("");
    }
  };
  const removeTech = (t: string) => setTechs(techs.filter((x) => x !== t));

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Missing info", "Project name is required.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        role: "",
        technologies: techs,
        projectUrl: projectUrl.trim(),
        description: description.trim(),
        startDate: new Date().toISOString(),
        endDate: null,
        isCurrent: true,
      };
      if (isEditing) await updateProject(id, payload);
      else await addProject(payload);
      router.back();
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: colors.textPrimary }]}>
          Project Details
        </Text>
        <Text style={{ fontSize: 18, color: colors.textTertiary }}>
          <Ionicons name="folder-open" size={20} color={colors.brand} />
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        <View style={[s.banner, { backgroundColor: colors.brandDark }]}>
          <Text style={s.bannerIcon}>ⓘ</Text>
          <Text style={s.bannerText}>
            Highlight your technical expertise and problem-solving skills.
            Detailed projects increase your profile visibility to top employers
            in Karachi.
          </Text>
        </View>

        <Text style={[s.label, { color: colors.textPrimary }]}>
          PROJECT NAME
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
          placeholder="e.g. E-commerce Mobile App"
          placeholderTextColor={colors.textTertiary}
          value={name}
          onChangeText={setName}
        />

        <Text style={[s.label, { color: colors.textPrimary }]}>
          TECHNOLOGIES USED
        </Text>
        <View
          style={[
            s.techCard,
            { borderColor: colors.border, backgroundColor: colors.bgCard },
          ]}
        >
          <View style={s.techChips}>
            {techs.map((t) => (
              <View
                key={t}
                style={[s.techChip, { backgroundColor: colors.brandLight }]}
              >
                <Text style={[s.techChipText, { color: colors.brand }]}>
                  {t}
                </Text>
                <TouchableOpacity onPress={() => removeTech(t)}>
                  <Text style={[s.techChipX, { color: colors.brand }]}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
          <View style={[s.techInputRow, { borderTopColor: colors.border }]}>
            <TextInput
              style={[s.techInput, { color: colors.textPrimary }]}
              placeholder="Add technology…"
              placeholderTextColor={colors.textTertiary}
              value={techInput}
              onChangeText={setTechInput}
              onSubmitEditing={addTech}
            />
            <TouchableOpacity onPress={addTech}>
              <Text style={[s.addText, { color: colors.brand }]}>ADD</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={[s.hint, { color: colors.textTertiary }]}>
          Press Enter or click Add to insert a chip.
        </Text>

        <Text style={[s.label, { color: colors.textPrimary }]}>
          PROJECT LINK (GITHUB/PORTFOLIO)
        </Text>
        <View
          style={[
            s.inputRow,
            { borderColor: colors.border, backgroundColor: colors.bgCard },
          ]}
        >
          <Text style={s.inputIcon}>🔗</Text>
          <TextInput
            style={[
              s.input,
              { flex: 1, borderWidth: 0, color: colors.textPrimary },
            ]}
            placeholder="https://github.com/username/project"
            placeholderTextColor={colors.textTertiary}
            value={projectUrl}
            onChangeText={setProjectUrl}
            autoCapitalize="none"
          />
        </View>

        <Text style={[s.label, { color: colors.textPrimary }]}>
          DESCRIPTION
        </Text>
        <TextInput
          style={[
            s.textarea,
            {
              borderColor: colors.border,
              backgroundColor: colors.bgCard,
              color: colors.textPrimary,
            },
          ]}
          placeholder="Describe the problem you solved, the architecture used, and the impact of the project…"
          placeholderTextColor={colors.textTertiary}
          value={description}
          onChangeText={(t) => t.length <= MAX_DESC && setDescription(t)}
          multiline
          textAlignVertical="top"
        />
        <Text style={[s.charCount, { color: colors.textTertiary }]}>
          {description.length} / {MAX_DESC}
        </Text>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View
        style={[
          s.footer,
          { backgroundColor: colors.bgPrimary, borderTopColor: colors.border },
        ]}
      >
        <TouchableOpacity
          style={[s.cancelBtn, { borderColor: colors.border }]}
          onPress={() => router.back()}
        >
          <Text style={[s.cancelText, { color: colors.textPrimary }]}>
            Cancel
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            s.saveBtn,
            { backgroundColor: colors.brandDark, opacity: saving ? 0.6 : 1 },
          ]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={s.saveBtnText}>
            💾 {saving ? "Saving…" : "Save Project"}
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
      gap: 12,
      borderRadius: 16,
      padding: 18,
      marginBottom: 24,
    },
    bannerIcon: { fontSize: 16, color: "#fff" },
    bannerText: {
      flex: 1,
      color: "rgba(255,255,255,0.9)",
      fontSize: 13,
      lineHeight: 19,
    },
    label: {
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 0.6,
      marginBottom: 8,
      marginTop: 18,
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
    inputIcon: { fontSize: 14, marginRight: 8 },
    techCard: { borderWidth: 1, borderRadius: 12, padding: 12 },
    techChips: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 10,
    },
    techChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 7,
    },
    techChipText: { fontSize: 13, fontWeight: "600" },
    techChipX: { fontSize: 12 },
    techInputRow: {
      flexDirection: "row",
      alignItems: "center",
      borderTopWidth: 1,
      paddingTop: 10,
    },
    techInput: { flex: 1, fontSize: 13 },
    addText: { fontSize: 13, fontWeight: "700" },
    hint: { fontSize: 11, marginTop: 6 },
    textarea: {
      borderWidth: 1,
      borderRadius: 12,
      padding: 14,
      minHeight: 130,
      fontSize: 14,
    },
    charCount: { fontSize: 11, textAlign: "right", marginTop: 6 },
    footer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: "row",
      gap: 12,
      padding: 16,
      borderTopWidth: 1,
    },
    cancelBtn: {
      flex: 1,
      borderWidth: 1,
      borderRadius: 14,
      height: 54,
      alignItems: "center",
      justifyContent: "center",
    },
    cancelText: { fontSize: 15, fontWeight: "600" },
    saveBtn: {
      flex: 1,
      borderRadius: 14,
      height: 54,
      alignItems: "center",
      justifyContent: "center",
    },
    saveBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  });
