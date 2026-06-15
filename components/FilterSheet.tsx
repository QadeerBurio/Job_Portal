// components/FilterSheet.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Bottom-sheet-style filter panel. Can be used as a modal overlay OR as a
// full-screen sheet (the filter.tsx screen renders it full-screen).
//
// Usage as modal overlay:
//   <FilterSheet
//     visible={showFilter}
//     onClose={() => setShowFilter(false)}
//     onApply={(filters) => applyFilters(filters)}
//     initialFilters={filters}
//   />
// ─────────────────────────────────────────────────────────────────────────────
import React, { useEffect, useState } from "react";
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { FilterState, JobType } from "../types";

// ── Constants ─────────────────────────────────────────────────────────────────

const SORT_OPTIONS: FilterState["sortBy"][] = ["Latest", "Relevant", "Salary"];
const SORT_LABELS: Record<FilterState["sortBy"], string> = {
  Latest: "Latest Jobs",
  Relevant: "Relevant",
  Salary: "Salary (High to Low)",
};

const AREAS = [
  "Clifton",
  "DHA",
  "Gulshan",
  "Korangi",
  "PECHS",
  "North Nazimabad",
  "Saddar",
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

const DEFAULT_FILTERS: FilterState = {
  sortBy: "Latest",
  location: [],
  jobType: [],
  salaryMin: 0,
  salaryMax: 500,
  category: null,
  isInternship: null,
};

// ── Props ─────────────────────────────────────────────────────────────────────

interface FilterSheetProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  initialFilters?: Partial<FilterState>;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function FilterSheet({
  visible,
  onClose,
  onApply,
  initialFilters = {},
}: FilterSheetProps) {
  const { colors } = useTheme();

  const [sortBy, setSortBy] = useState<FilterState["sortBy"]>(
    initialFilters.sortBy ?? "Latest",
  );
  const [locations, setLocations] = useState<string[]>(
    initialFilters.location ?? [],
  );
  const [jobTypes, setJobTypes] = useState<JobType[]>(
    initialFilters.jobType ?? [],
  );
  const [salaryMin, setSalaryMin] = useState(initialFilters.salaryMin ?? 0);
  const [isInternship, setIsInternship] = useState<boolean | null>(
    initialFilters.isInternship ?? null,
  );

  // Sync when initialFilters change from outside
  useEffect(() => {
    if (visible) {
      setSortBy(initialFilters.sortBy ?? "Latest");
      setLocations(initialFilters.location ?? []);
      setJobTypes(initialFilters.jobType ?? []);
      setSalaryMin(initialFilters.salaryMin ?? 0);
      setIsInternship(initialFilters.isInternship ?? null);
    }
  }, [visible]);

  const toggleLocation = (area: string) =>
    setLocations((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area],
    );

  const toggleJobType = (type: JobType) =>
    setJobTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );

  const clearAll = () => {
    setSortBy("Latest");
    setLocations([]);
    setJobTypes([]);
    setSalaryMin(0);
    setIsInternship(null);
  };

  const handleApply = () => {
    onApply({
      sortBy,
      location: locations,
      jobType: jobTypes,
      salaryMin,
      salaryMax: 500,
      category: null,
      isInternship,
    });
    onClose();
  };

  // ── Helpers ──────────────────────────────────────────────────────────────

  const Chip = ({
    label,
    active,
    onPress,
  }: {
    label: string;
    active: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      style={[
        s.chip,
        {
          backgroundColor: active ? colors.brand : colors.bgSecondary,
          borderColor: active ? colors.brand : colors.border,
        },
      ]}
      onPress={onPress}
    >
      <Text
        style={[s.chipText, { color: active ? "#fff" : colors.textPrimary }]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const CheckRow = ({
    label,
    checked,
    onPress,
  }: {
    label: string;
    checked: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      style={[
        s.checkRow,
        { backgroundColor: colors.bgSecondary, borderColor: colors.border },
      ]}
      onPress={onPress}
    >
      <View
        style={[
          s.checkbox,
          {
            borderColor: checked ? colors.brand : colors.border,
            backgroundColor: checked ? colors.brand : "transparent",
          },
        ]}
      >
        {checked && (
          <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>
            ✓
          </Text>
        )}
      </View>
      <Text style={[s.checkLabel, { color: colors.textPrimary }]}>{label}</Text>
    </TouchableOpacity>
  );

  const s = makeStyles(colors);

  // ── Content (shared between modal and full-screen use) ────────────────────

  const content = (
    <View style={[s.sheet, { backgroundColor: colors.bgSecondary }]}>
      {/* Header */}
      <View
        style={[
          s.header,
          {
            borderBottomColor: colors.border,
            backgroundColor: colors.bgPrimary,
          },
        ]}
      >
        <Text style={[s.title, { color: colors.textPrimary }]}>
          Filter & Sort
        </Text>
        <TouchableOpacity onPress={clearAll}>
          <Text style={[s.clearAll, { color: colors.textSecondary }]}>
            Clear All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onClose}>
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
              key={opt}
              style={[s.radioRow, { borderColor: colors.border }]}
              onPress={() => setSortBy(opt)}
            >
              <Text style={[s.radioLabel, { color: colors.textPrimary }]}>
                {SORT_LABELS[opt]}
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
        <View style={s.section}>
          <Text style={[s.sectionTitle, { color: colors.textPrimary }]}>
            📍 Location
          </Text>
          <View style={s.chipWrap}>
            {AREAS.map((a) => (
              <Chip
                key={a}
                label={a}
                active={locations.includes(a)}
                onPress={() => toggleLocation(a)}
              />
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
              <CheckRow
                key={t}
                label={t}
                checked={jobTypes.includes(t)}
                onPress={() => toggleJobType(t)}
              />
            ))}
          </View>
        </View>

        {/* Internship / Trainee toggle */}
        <View style={s.section}>
          <Text style={[s.sectionTitle, { color: colors.textPrimary }]}>
            🎓 Role Type
          </Text>
          <View style={s.chipWrap}>
            {[
              { label: "All Roles", value: null },
              { label: "Internships Only", value: true },
              { label: "Full Roles Only", value: false },
            ].map((opt) => (
              <Chip
                key={String(opt.value)}
                label={opt.label}
                active={isInternship === opt.value}
                onPress={() => setIsInternship(opt.value)}
              />
            ))}
          </View>
        </View>

        {/* Salary */}
        <View style={s.section}>
          <View style={s.salaryHeader}>
            <Text style={[s.sectionTitle, { color: colors.textPrimary }]}>
              💵 Minimum Salary
            </Text>
            <View
              style={[s.salaryBadge, { backgroundColor: colors.brandLight }]}
            >
              <Text style={[s.salaryBadgeText, { color: colors.brand }]}>
                PKR {salaryMin}k+
              </Text>
            </View>
          </View>
          <View style={s.salaryBtns}>
            {[0, 30, 50, 80, 100, 150, 200].map((v) => (
              <TouchableOpacity
                key={v}
                style={[
                  s.salaryBtn,
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
          <Text style={[s.clearBtnText, { color: colors.textPrimary }]}>
            Clear Filters
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.applyBtn, { backgroundColor: colors.brandDark }]}
          onPress={handleApply}
        >
          <Text style={s.applyBtnText}>Apply Filters</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={s.overlay}>
        <TouchableOpacity
          style={s.backdrop}
          onPress={onClose}
          activeOpacity={1}
        />
        {content}
      </View>
    </Modal>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const makeStyles = (c: any) =>
  StyleSheet.create({
    overlay: { flex: 1, justifyContent: "flex-end" },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.45)",
    },
    sheet: {
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: "92%",
      overflow: "hidden",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
    },
    title: { flex: 1, fontSize: 18, fontWeight: "700" },
    clearAll: { fontSize: 14, marginRight: 16 },
    close: { fontSize: 20, paddingLeft: 4 },
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
    chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    chip: {
      borderWidth: 1,
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 8,
    },
    chipText: { fontSize: 13 },
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
    salaryBadgeText: { fontSize: 12, fontWeight: "600" },
    salaryBtns: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    salaryBtn: {
      borderWidth: 1,
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 7,
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
