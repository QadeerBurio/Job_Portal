// app/filter.tsx
// Renders as a modal Stack screen — ThemeProvider is in root _layout.tsx
// so useTheme() works here without any extra wrapper.
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { FilterState, JobType } from "../types";

const SORT_OPTIONS: { key: FilterState["sortBy"]; label: string }[] = [
  { key: "Latest", label: "Latest Jobs" },
  { key: "Relevant", label: "Relevant" },
  { key: "Salary", label: "Salary (High to Low)" },
];

const AREAS = [
  "Clifton",
  "DHA",
  "Gulshan",
  "Korangi",
  "PECHS",
  "North Nazimabad",
  "Saddar",
  "I.I. Chundrigar",
];
const JOB_TYPES: JobType[] = [
  "Full-time",
  "Part-time",
  "Internship",
  "Remote",
  "On-site",
  "Hybrid",
  "Contract",
];
const SALARY_OPTS = [0, 30, 50, 80, 100, 150, 200];

export default function FilterScreen() {
  const { colors, isDark } = useTheme();

  const [sortBy, setSortBy] = useState<FilterState["sortBy"]>("Latest");
  const [locations, setLocations] = useState<string[]>([]);
  const [jobTypes, setJobTypes] = useState<JobType[]>([]);
  const [salaryMin, setSalaryMin] = useState(0);
  const [isInternship, setIsInternship] = useState<boolean | null>(null);

  const toggleArr = <T,>(arr: T[], item: T, set: (v: T[]) => void) =>
    set(arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item]);

  const clearAll = () => {
    setSortBy("Latest");
    setLocations([]);
    setJobTypes([]);
    setSalaryMin(0);
    setIsInternship(null);
  };

  const apply = () => {
    // Pass filters back via router params
    router.back();
  };

  const s = makeStyles(colors);

  return (
    <SafeAreaView style={s.safe} edges={["top", "bottom"]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Header */}
      <View style={s.header}>
        <Text style={[s.title, { color: colors.textPrimary }]}>
          Filter & Sort
        </Text>
        <TouchableOpacity onPress={clearAll}>
          <Text style={[s.clearAll, { color: colors.textSecondary }]}>
            Clear All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[s.close, { color: colors.textTertiary }]}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Sort By */}
        <View style={s.section}>
          <Text style={[s.sectionTitle, { color: colors.textPrimary }]}>
            ⇌ Sort By
          </Text>
          {SORT_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              style={[s.radioRow, { borderColor: colors.border }]}
              onPress={() => setSortBy(opt.key)}
            >
              <Text style={[s.radioLabel, { color: colors.textPrimary }]}>
                {opt.label}
              </Text>
              <View style={[s.radio, { borderColor: colors.brand }]}>
                {sortBy === opt.key && (
                  <View
                    style={[s.radioDot, { backgroundColor: colors.brand }]}
                  />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Location */}
        <View style={s.section}>
          <Text style={[s.sectionTitle, { color: colors.textPrimary }]}>
            📍 Location
          </Text>
          <View style={s.wrap}>
            {AREAS.map((a) => (
              <TouchableOpacity
                key={a}
                style={[
                  s.chip,
                  {
                    backgroundColor: locations.includes(a)
                      ? colors.brand
                      : colors.bgSecondary,
                    borderColor: locations.includes(a)
                      ? colors.brand
                      : colors.border,
                  },
                ]}
                onPress={() => toggleArr(locations, a, setLocations)}
              >
                <Text
                  style={{
                    color: locations.includes(a) ? "#fff" : colors.textPrimary,
                    fontSize: 13,
                  }}
                >
                  {a}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Job Type */}
        <View style={s.section}>
          <Text style={[s.sectionTitle, { color: colors.textPrimary }]}>
            🗂 Job Type
          </Text>
          <View style={s.checkGrid}>
            {JOB_TYPES.map((t) => (
              <TouchableOpacity
                key={t}
                style={[
                  s.checkRow,
                  {
                    backgroundColor: colors.bgSecondary,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => toggleArr(jobTypes, t, setJobTypes)}
              >
                <View
                  style={[
                    s.checkbox,
                    {
                      borderColor: jobTypes.includes(t)
                        ? colors.brand
                        : colors.border,
                      backgroundColor: jobTypes.includes(t)
                        ? colors.brand
                        : "transparent",
                    },
                  ]}
                >
                  {jobTypes.includes(t) && (
                    <Text style={{ color: "#fff", fontSize: 11 }}>✓</Text>
                  )}
                </View>
                <Text style={[s.checkLabel, { color: colors.textPrimary }]}>
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Role Type */}
        <View style={s.section}>
          <Text style={[s.sectionTitle, { color: colors.textPrimary }]}>
            🎓 Role Type
          </Text>
          <View style={s.wrap}>
            {(
              [
                { label: "All Roles", value: null },
                { label: "Internships Only", value: true },
                { label: "Full Roles Only", value: false },
              ] as const
            ).map((opt) => (
              <TouchableOpacity
                key={String(opt.value)}
                style={[
                  s.chip,
                  {
                    backgroundColor:
                      isInternship === opt.value
                        ? colors.brand
                        : colors.bgSecondary,
                    borderColor:
                      isInternship === opt.value ? colors.brand : colors.border,
                  },
                ]}
                onPress={() => setIsInternship(opt.value)}
              >
                <Text
                  style={{
                    color:
                      isInternship === opt.value ? "#fff" : colors.textPrimary,
                    fontSize: 13,
                  }}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Salary */}
        <View style={s.section}>
          <View style={s.salaryHeader}>
            <Text style={[s.sectionTitle, { color: colors.textPrimary }]}>
              💵 Min Salary
            </Text>
            <View
              style={[s.salaryBadge, { backgroundColor: colors.brandLight }]}
            >
              <Text
                style={[
                  { color: colors.brand, fontSize: 12, fontWeight: "600" },
                ]}
              >
                {salaryMin === 0 ? "Any" : `PKR ${salaryMin}k+`}
              </Text>
            </View>
          </View>
          <View style={s.wrap}>
            {SALARY_OPTS.map((v) => (
              <TouchableOpacity
                key={v}
                style={[
                  s.chip,
                  {
                    borderColor: salaryMin === v ? colors.brand : colors.border,
                    backgroundColor:
                      salaryMin === v ? colors.brandLight : "transparent",
                  },
                ]}
                onPress={() => setSalaryMin(v)}
              >
                <Text
                  style={{
                    color:
                      salaryMin === v ? colors.brand : colors.textSecondary,
                    fontSize: 13,
                  }}
                >
                  {v === 0 ? "Any" : `${v}k+`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Footer */}
      <View
        style={[
          s.footer,
          { backgroundColor: colors.bgPrimary, borderTopColor: colors.border },
        ]}
      >
        <TouchableOpacity
          style={[s.clearBtn, { borderColor: colors.border }]}
          onPress={clearAll}
        >
          <Text style={[{ color: colors.textPrimary, fontWeight: "600" }]}>
            Clear Filters
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.applyBtn, { backgroundColor: colors.brandDark }]}
          onPress={apply}
        >
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>
            Apply Filters
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
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: c.bgPrimary,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    title: { flex: 1, fontSize: 20, fontWeight: "700" },
    clearAll: { fontSize: 14, marginRight: 16 },
    close: { fontSize: 22, paddingLeft: 4 },
    section: { paddingHorizontal: 20, paddingTop: 22, paddingBottom: 4 },
    sectionTitle: { fontSize: 15, fontWeight: "700", marginBottom: 14 },
    radioRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      marginBottom: 8,
    },
    radioLabel: { fontSize: 14 },
    radio: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      alignItems: "center",
      justifyContent: "center",
    },
    radioDot: { width: 10, height: 10, borderRadius: 5 },
    wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    chip: {
      borderWidth: 1,
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 8,
    },
    checkGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    checkRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      minWidth: "45%",
    },
    checkbox: {
      width: 20,
      height: 20,
      borderRadius: 5,
      borderWidth: 1.5,
      alignItems: "center",
      justifyContent: "center",
    },
    checkLabel: { fontSize: 13 },
    salaryHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    salaryBadge: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 20,
    },
    footer: { flexDirection: "row", gap: 12, padding: 16, borderTopWidth: 1 },
    clearBtn: {
      flex: 1,
      borderWidth: 1,
      borderRadius: 14,
      height: 52,
      alignItems: "center",
      justifyContent: "center",
    },
    applyBtn: {
      flex: 2,
      borderRadius: 14,
      height: 52,
      alignItems: "center",
      justifyContent: "center",
    },
  });
