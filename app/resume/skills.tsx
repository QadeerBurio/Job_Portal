// app/resume/skills.tsx — Skills Screen
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
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
import {
  addSkill,
  deleteSkill,
  fetchResume,
  fetchSkillSuggestions,
} from "../../services/resumeService";
import { Skill } from "../../types/resume";

export default function SkillsScreen() {
  const { colors } = useTheme();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [adding, setAdding] = useState(false);

  const load = useCallback(() => {
    fetchResume()
      .then((r) => setSkills(r.skills))
      .catch((e) => Alert.alert("Error", e.message));
    fetchSkillSuggestions()
      .then(setSuggestions)
      .catch(() => {});
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdd = async (skillName?: string) => {
    const name = (skillName ?? newSkill).trim();
    if (!name) return;
    setAdding(true);
    try {
      const updated = await addSkill(name);
      setSkills(updated);
      setNewSkill("");
      fetchSkillSuggestions()
        .then(setSuggestions)
        .catch(() => {});
    } catch (e: any) {
      if (e.message?.includes("already"))
        Alert.alert("Already added", `"${name}" is already in your skills.`);
      else Alert.alert("Error", e.message);
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      const updated = await deleteSkill(id);
      setSkills(updated);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  const s = makeStyles(colors);

  // Alternate skill chip colors like the design (dark / light)
  const chipStyle = (i: number) =>
    i % 5 === 1 || i % 5 === 3
      ? { backgroundColor: colors.bgTertiary, textColor: colors.textPrimary }
      : { backgroundColor: colors.brandDark, textColor: "#fff" };

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: colors.textPrimary }]}>
          Skills
        </Text>
        <View style={[s.avatar, { backgroundColor: colors.brand }]}>
          <Text style={{ color: "#fff" }}>
            <Ionicons name="flash" size={20} color={colors.text} />
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        <View
          style={[
            s.card,
            { backgroundColor: colors.bgCard, borderColor: colors.border },
          ]}
        >
          <Text style={[s.cardTitle, { color: colors.textPrimary }]}>
            Professional Expertise
          </Text>
          <Text style={[s.cardSub, { color: colors.textSecondary }]}>
            Manage the technical and soft skills that make you a strong
            candidate for Karachi's leading firms.
          </Text>

          <View style={s.chipsWrap}>
            {skills.map((skill, i) => {
              const style = chipStyle(i);
              return (
                <View
                  key={skill._id}
                  style={[s.chip, { backgroundColor: style.backgroundColor }]}
                >
                  <Text style={[s.chipText, { color: style.textColor }]}>
                    {skill.name}
                  </Text>
                  <TouchableOpacity onPress={() => handleRemove(skill._id)}>
                    <Text style={[s.chipX, { color: style.textColor }]}>✕</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>

          <View style={[s.divider, { backgroundColor: colors.border }]} />

          <Text style={[s.addLabel, { color: colors.textPrimary }]}>
            Add New Skill
          </Text>
          <View style={s.addRow}>
            <View
              style={[
                s.addInputWrap,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.bgSecondary,
                },
              ]}
            >
              <Text style={s.addIcon}>{"</>"}</Text>
              <TextInput
                style={[s.addInput, { color: colors.textPrimary }]}
                placeholder="e.g. Graphic Design, Financial…"
                placeholderTextColor={colors.textTertiary}
                value={newSkill}
                onChangeText={setNewSkill}
                onSubmitEditing={() => handleAdd()}
              />
            </View>
            <TouchableOpacity
              style={[
                s.addBtn,
                {
                  backgroundColor: colors.brandDark,
                  opacity: adding ? 0.6 : 1,
                },
              ]}
              onPress={() => handleAdd()}
              disabled={adding}
            >
              <Text style={s.addBtnIcon}>+</Text>
            </TouchableOpacity>
          </View>

          {suggestions.length > 0 && (
            <View style={s.suggestRow}>
              <Text style={[s.suggestLabel, { color: colors.textTertiary }]}>
                Suggestions:{" "}
              </Text>
              {suggestions.map((sg, i) => (
                <TouchableOpacity key={sg} onPress={() => handleAdd(sg)}>
                  <Text style={[s.suggestItem, { color: colors.brand }]}>
                    {sg}
                    {i < suggestions.length - 1 ? "  " : ""}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View
          style={[
            s.tipCard,
            {
              backgroundColor: colors.brandLight,
              borderColor: colors.brand + "33",
            },
          ]}
        >
          <Text style={s.tipIcon}>ⓘ</Text>
          <View style={{ flex: 1 }}>
            <Text style={[s.tipTitle, { color: colors.textPrimary }]}>
              Pro Tip
            </Text>
            <Text style={[s.tipText, { color: colors.textSecondary }]}>
              Listing at least 5 relevant skills increases your profile
              visibility to Karachi-based recruiters by up to 40%.
            </Text>
          </View>
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
    backArrow: { fontSize: 24 },
    headerTitle: { fontSize: 22, fontWeight: "700" },
    avatar: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: "center",
      justifyContent: "center",
    },
    scroll: { padding: 20 },
    card: { borderWidth: 1, borderRadius: 18, padding: 20 },
    cardTitle: { fontSize: 19, fontWeight: "700", marginBottom: 8 },
    cardSub: { fontSize: 13, lineHeight: 20, marginBottom: 18 },
    chipsWrap: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      marginBottom: 18,
    },
    chip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 9,
    },
    chipText: { fontSize: 14, fontWeight: "600" },
    chipX: { fontSize: 13 },
    divider: { height: 1, marginBottom: 18 },
    addLabel: { fontSize: 14, fontWeight: "700", marginBottom: 10 },
    addRow: { flexDirection: "row", gap: 10 },
    addInputWrap: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 14,
      height: 50,
    },
    addIcon: { fontSize: 14, opacity: 0.6 },
    addInput: { flex: 1, fontSize: 13 },
    addBtn: {
      width: 50,
      height: 50,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    addBtnIcon: { color: "#fff", fontSize: 24, fontWeight: "300" },
    suggestRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: 14,
      alignItems: "center",
    },
    suggestLabel: { fontSize: 13 },
    suggestItem: {
      fontSize: 13,
      fontWeight: "600",
      textDecorationLine: "underline",
    },
    tipCard: {
      flexDirection: "row",
      gap: 12,
      borderWidth: 1,
      borderRadius: 14,
      padding: 16,
      marginTop: 16,
    },
    tipIcon: { fontSize: 18, color: "#22C55E" },
    tipTitle: { fontSize: 14, fontWeight: "700", marginBottom: 4 },
    tipText: { fontSize: 12, lineHeight: 18 },
  });
