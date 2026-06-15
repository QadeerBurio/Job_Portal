// app/search.tsx  — Search Screen
import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import JobCard from "../../components/JobCard";
import ThemeToggle from "../../components/ThemeToggle";
import { useTheme } from "../../context/ThemeContext";
import { fetchJobs } from "../../services/jobsService";
import { Job } from "../../types";

const QUICK_FILTERS = [
  "All",
  "Internships",
  "Trainees",
  "Remote",
  "AI/ML",
  "Design",
  "Finance",
];

export default function SearchScreen() {
  const { colors, isDark } = useTheme();
  const params = useLocalSearchParams<{ q?: string }>();
  const [query, setQuery] = useState(params.q ?? "");
  const [activeFilter, setActiveFilter] = useState("All");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (q: string, filter: string) => {
    setLoading(true);
    try {
      const filters: any = {};
      if (filter === "Internships") filters.isInternship = true;
      if (filter === "Remote") filters.jobType = ["Remote"];
      if (filter === "AI/ML") filters.category = "AI/ML";
      if (filter === "Design") filters.category = "Design";
      if (filter === "Finance") filters.category = "Finance";
      if (filter === "Trainees") filters.isInternship = false;

      const data = await fetchJobs(q, filters);
      setJobs(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(query, activeFilter);
  }, [query, activeFilter]);

  const s = makeStyles(colors);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Header */}
      <View style={s.header}>
        <View
          style={[
            s.searchBox,
            { backgroundColor: colors.bgCard, borderColor: colors.border },
          ]}
        >
          <Text
            style={{ fontSize: 16, color: colors.textTertiary, marginRight: 8 }}
          >
            🔍
          </Text>
          <TextInput
            style={[s.input, { color: colors.textPrimary }]}
            placeholder="Search job titles or companies"
            placeholderTextColor={colors.textTertiary}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            autoFocus={!query}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <Text style={{ color: colors.textTertiary, fontSize: 16 }}>
                ✕
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[s.filterBtn, { backgroundColor: colors.brand }]}
          onPress={() => router.push("/filter")}
        >
          <MaterialIcons name="filter-list" size={24} color="#fff" />
        </TouchableOpacity>
        <ThemeToggle />
      </View>

      {/* Quick filter chips */}
      <FlatList
        horizontal
        data={QUICK_FILTERS}
        keyExtractor={(i) => i}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.chips}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              s.chip,
              {
                backgroundColor:
                  activeFilter === item ? colors.brand : colors.bgTertiary,
                borderColor:
                  activeFilter === item ? colors.brand : colors.border,
              },
            ]}
            onPress={() => setActiveFilter(item)}
          >
            <Text
              style={{
                color: activeFilter === item ? "#fff" : colors.textSecondary,
                fontSize: 13,
              }}
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Results header */}
      <View style={s.resultsHeader}>
        <Text style={[s.resultsTitle, { color: colors.textPrimary }]}>
          {query ? `"${query}"` : "All Jobs in Karachi"}
        </Text>
        <Text style={[s.resultsCount, { color: colors.textTertiary }]}>
          {jobs.length} Results
        </Text>
      </View>

      {/* Job list */}
      <FlatList
        data={jobs}
        keyExtractor={(j) => j._id}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <JobCard
            job={item}
            onPress={() => router.push(`/job/${item._id}`)}
            onSave={() => {}}
          />
        )}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={{ fontSize: 40 }}>🔍</Text>
            <Text style={[s.emptyText, { color: colors.textSecondary }]}>
              {loading
                ? "Searching…"
                : "No jobs found. Try a different keyword."}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const makeStyles = (c: any) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bgSecondary },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: c.bgPrimary,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    searchBox: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderRadius: 14,
      paddingHorizontal: 14,
      height: 44,
    },
    input: { flex: 1, fontSize: 14 },
    filterBtn: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
    },
    filterIcon: { fontSize: 18 },
    chips: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
    chip: {
      borderWidth: 1,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    resultsHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingBottom: 12,
    },
    resultsTitle: { fontSize: 16, fontWeight: "700" },
    resultsCount: { fontSize: 13 },
    list: { paddingHorizontal: 16, paddingBottom: 100 },
    empty: { alignItems: "center", paddingTop: 60, gap: 12 },
    emptyText: { fontSize: 14, textAlign: "center" },
  });
