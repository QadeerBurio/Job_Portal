// app/filter.tsx  — Filter & Sort Sheet
import { router } from "expo-router";
import React, { useState } from "react";
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { JobType } from "../types";

const SORT_OPTIONS = ["Latest Jobs", "Relevant", "Salary (High to Low)"];
const AREAS = [
  "Clifton",
  "DHA",
  "Gulshan",
  "Korangi",
  "PECHS",
  "North Nazimabad",
];
const JOB_TYPES: JobType[] = [
  "Full-time",
  "Part-time",
  "Contract",
  "Internship",
  "Remote",
  "On-site",
  "Hybrid",
];

export default function FilterScreen() {
  const { colors, isDark } = useTheme();
  const [sortBy, setSortBy] = useState("Latest Jobs");
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<JobType[]>([]);
  const [salary, setSalary] = useState(50);

  const toggleArea = (a: string) =>
    setSelectedAreas((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a],
    );
  const toggleType = (t: JobType) =>
    setSelectedTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
    );

  const s = makeStyles(colors);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <View style={s.header}>
        <Text style={[s.title, { color: colors.textPrimary }]}>
          Filter & Sort
        </Text>
        <TouchableOpacity
          onPress={() => {
            setSelectedAreas([]);
            setSelectedTypes([]);
            setSortBy("Latest Jobs");
            setSalary(50);
          }}
        >
          <Text style={[s.clearAll, { color: colors.textSecondary }]}>
            Clear All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ fontSize: 20, color: colors.textTertiary }}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {/* Sort By */}
        <View style={s.block}>
          <Text style={[s.blockTitle, { color: colors.textPrimary }]}>
            ⇌ Sort By
          </Text>
          {SORT_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[s.radioRow, { borderColor: colors.border }]}
              onPress={() => setSortBy(opt)}
            >
              <Text style={[s.radioLabel, { color: colors.textPrimary }]}>
                {opt}
              </Text>
              <View style={[s.radio, { borderColor: colors.brand }]}>
                {sortBy === opt && (
                  <View
                    style={[s.radioDot, { backgroundColor: colors.brand }]}
                  />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Location */}
        <View style={s.block}>
          <Text style={[s.blockTitle, { color: colors.textPrimary }]}>
            📍 Location
          </Text>
          <View style={s.chips}>
            {AREAS.map((area) => (
              <TouchableOpacity
                key={area}
                style={[
                  s.chip,
                  {
                    backgroundColor: selectedAreas.includes(area)
                      ? colors.brand
                      : colors.bgSecondary,
                    borderColor: selectedAreas.includes(area)
                      ? colors.brand
                      : colors.border,
                  },
                ]}
                onPress={() => toggleArea(area)}
              >
                <Text
                  style={{
                    color: selectedAreas.includes(area)
                      ? "#fff"
                      : colors.textPrimary,
                    fontSize: 13,
                  }}
                >
                  {area}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Job Type */}
        <View style={s.block}>
          <Text style={[s.blockTitle, { color: colors.textPrimary }]}>
            🗂 Job Type
          </Text>
          <View style={s.typeGrid}>
            {JOB_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  s.typeCell,
                  {
                    backgroundColor: colors.bgSecondary,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => toggleType(type)}
              >
                <View
                  style={[
                    s.checkbox,
                    {
                      borderColor: selectedTypes.includes(type)
                        ? colors.brand
                        : colors.border,
                      backgroundColor: selectedTypes.includes(type)
                        ? colors.brand
                        : "transparent",
                    },
                  ]}
                >
                  {selectedTypes.includes(type) && (
                    <Text style={{ color: "#fff", fontSize: 11 }}>✓</Text>
                  )}
                </View>
                <Text style={[s.typeLabel, { color: colors.textPrimary }]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Salary */}
        <View style={s.block}>
          <View style={s.salaryHeader}>
            <Text style={[s.blockTitle, { color: colors.textPrimary }]}>
              💵 Salary Range
            </Text>
            <View
              style={[s.salaryBadge, { backgroundColor: colors.brandLight }]}
            >
              <Text
                style={[
                  { color: colors.brand, fontSize: 12, fontWeight: "600" },
                ]}
              >
                PKR {salary}k – 500k+
              </Text>
            </View>
          </View>
          <View style={[s.sliderTrack, { backgroundColor: colors.bgTertiary }]}>
            <View
              style={[
                s.sliderFill,
                {
                  width: `${(salary / 500) * 100}%`,
                  backgroundColor: colors.brand,
                },
              ]}
            />
          </View>
          <View style={s.sliderRow}>
            <Text style={[{ color: colors.textTertiary, fontSize: 12 }]}>
              30k
            </Text>
            <Text style={[{ color: colors.textTertiary, fontSize: 12 }]}>
              500k
            </Text>
          </View>
          <View style={s.salaryBtns}>
            {[30, 50, 80, 100, 150, 200].map((v) => (
              <TouchableOpacity
                key={v}
                style={[
                  s.salaryBtn,
                  {
                    borderColor: salary === v ? colors.brand : colors.border,
                    backgroundColor:
                      salary === v ? colors.brandLight : "transparent",
                  },
                ]}
                onPress={() => setSalary(v)}
              >
                <Text
                  style={[
                    {
                      color: salary === v ? colors.brand : colors.textSecondary,
                      fontSize: 12,
                    },
                  ]}
                >
                  {v}k+
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom actions */}
      <View
        style={[
          s.footer,
          { backgroundColor: colors.bgPrimary, borderTopColor: colors.border },
        ]}
      >
        <TouchableOpacity
          style={[s.clearBtn, { borderColor: colors.border }]}
          onPress={() => router.back()}
        >
          <Text style={[s.clearBtnText, { color: colors.textPrimary }]}>
            Clear Filters
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.applyBtn, { backgroundColor: colors.brandDark }]}
          onPress={() => router.back()}
        >
          <Text style={s.applyBtnText}>Apply Filters</Text>
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
      paddingVertical: 16,
      backgroundColor: c.bgPrimary,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    title: { flex: 1, fontSize: 20, fontWeight: "700" },
    clearAll: { fontSize: 14, marginRight: 16 },
    block: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 8 },
    blockTitle: { fontSize: 16, fontWeight: "700", marginBottom: 14 },
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
    chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    chip: {
      borderWidth: 1,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    typeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    typeCell: {
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
    typeLabel: { fontSize: 13 },
    salaryHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    salaryBadge: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 20,
    },
    sliderTrack: { height: 6, borderRadius: 3, marginBottom: 8 },
    sliderFill: { height: 6, borderRadius: 3 },
    sliderRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    salaryBtns: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    salaryBtn: {
      borderWidth: 1,
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 6,
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
    clearBtnText: { fontSize: 14, fontWeight: "600" },
    applyBtn: {
      flex: 2,
      borderRadius: 14,
      height: 52,
      alignItems: "center",
      justifyContent: "center",
    },
    applyBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  });
