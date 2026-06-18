// app/index.tsx  — Home Screen
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import ThemeToggle from "../../components/ThemeToggle";
import { useTheme } from "../../context/ThemeContext";
import { fetchJobs, fetchRecommended } from "../../services/jobsService";
import { Job } from "../../types";

const POPULAR = [
  "IT",
  "Internships",
  "AI/ML",
  "Design",
  "Healthcare",
  "Finance",
  "Remote",
];

export default function HomeScreen() {
  const { colors, isDark } = useTheme();
  const [search, setSearch] = useState("");
  const [recommended, setRecommended] = useState<Job[]>([]);
  const [recent, setRecent] = useState<Job[]>([]);

  useEffect(() => {
    fetchRecommended().then(setRecommended);
    fetchJobs("", {}).then((jobs) => setRecent(jobs));
  }, []);

  const s = makeStyles(colors);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Header */}
      <View style={s.header}>
        <View style={s.logoRow}>
          <View style={s.logoIcon}>
            <Text style={{ fontSize: 18 }}>💼</Text>
          </View>
          <Text style={s.logoText}>KarachiJobs</Text>
        </View>
        <ThemeToggle />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={s.hero}>
          <Text style={s.heroHeadline}>Find your dream career</Text>
          <Text style={s.heroSub}>
            Over 500+ new jobs posted today in Karachi
          </Text>
        </View>

        {/* Search bar */}
        <View style={s.searchRow}>
          <View
            style={[
              s.searchBox,
              { backgroundColor: colors.bgCard, borderColor: colors.border },
            ]}
          >
            <Text
              style={{
                fontSize: 16,
                marginRight: 8,
                color: colors.textTertiary,
              }}
            >
              🔍
            </Text>
            <TextInput
              style={[s.searchInput, { color: colors.textPrimary }]}
              placeholder="Search jobs, companies…"
              placeholderTextColor={colors.textTertiary}
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={() =>
                router.push({ pathname: "/search", params: { q: search } })
              }
              returnKeyType="search"
            />
          </View>
          <TouchableOpacity
            style={[s.searchBtn, { backgroundColor: colors.brand }]}
            onPress={() =>
              router.push({ pathname: "/search", params: { q: search } })
            }
          >
            <Text style={s.searchBtnText}>Search</Text>
          </TouchableOpacity>
        </View>

        {/* Popular chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={s.chips}
        >
          {POPULAR.map((tag) => (
            <TouchableOpacity
              key={tag}
              style={[
                s.chip,
                {
                  backgroundColor: colors.bgTertiary,
                  borderColor: colors.border,
                },
              ]}
              onPress={() =>
                router.push({ pathname: "/search", params: { q: tag } })
              }
            >
              <Text style={[s.chipText, { color: colors.textSecondary }]}>
                {tag}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Recommended */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={[s.sectionTitle, { color: colors.textPrimary }]}>
              Recommended for You
            </Text>
            <TouchableOpacity onPress={() => router.push("/search")}>
              <Text style={[s.viewAll, { color: colors.brand }]}>View All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {recommended.map((job) => (
              <TouchableOpacity
                key={job._id}
                style={[
                  s.recCard,
                  {
                    backgroundColor: colors.bgCard,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => router.push(`/job/${job._id}`)}
                activeOpacity={0.8}
              >
                <View
                  style={[s.recIcon, { backgroundColor: colors.bgTertiary }]}
                >
                  <Text style={{ fontSize: 22 }}>
                    {job.category === "AI/ML"
                      ? "🤖"
                      : job.category === "Design"
                        ? "🎨"
                        : "💻"}
                  </Text>
                </View>
                <View style={[s.recBadge, { backgroundColor: colors.brand }]}>
                  <Text style={s.recBadgeText}>{job.jobType}</Text>
                </View>
                <Text
                  style={[s.recTitle, { color: colors.textPrimary }]}
                  numberOfLines={2}
                >
                  {job.title}
                </Text>
                <Text style={[s.recCompany, { color: colors.textSecondary }]}>
                  {job.company} · {job.area}
                </Text>
                <Text style={[s.recSalary, { color: colors.textPrimary }]}>
                  {job.salaryMin}k – {job.salaryMax}k{" "}
                  <Text style={{ fontSize: 12, color: colors.textTertiary }}>
                    PKR
                  </Text>
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Recent Jobs */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={[s.sectionTitle, { color: colors.textPrimary }]}>
              All Jobs in Karachi
            </Text>
            <Text style={[s.count, { color: colors.textTertiary }]}>
              {recent.length} Found
            </Text>
          </View>
          {recent.map((job) => (
            <TouchableOpacity
              key={job._id}
              style={[
                s.recentRow,
                { backgroundColor: colors.bgCard, borderColor: colors.border },
              ]}
              onPress={() => router.push(`/job/${job._id}`)}
              activeOpacity={0.8}
            >
              <View
                style={[s.recentIcon, { backgroundColor: colors.bgTertiary }]}
              >
                <Text style={{ fontSize: 16 }}>
                  {job.isInternship ? "🎓" : job.isTrainee ? "📋" : "💼"}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[s.recentTitle, { color: colors.textPrimary }]}
                  numberOfLines={1}
                >
                  {job.title}
                </Text>
                <Text style={[s.recentMeta, { color: colors.textSecondary }]}>
                  {job.company} · {job.area}
                </Text>
                <View style={s.recentBadges}>
                  <View
                    style={[
                      s.smallBadge,
                      { backgroundColor: colors.bgTertiary },
                    ]}
                  >
                    <Text
                      style={[
                        s.smallBadgeText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {job.jobType}
                    </Text>
                  </View>
                  <Text style={[s.recentSalary, { color: colors.brand }]}>
                    {job.salaryMin}k–{job.salaryMax}k PKR
                  </Text>
                </View>
              </View>
              <View style={[s.arrowBtn, { backgroundColor: colors.brand }]}>
                <Text style={{ color: "#fff" }}>›</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 32 }} />
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
      paddingTop: 12,
      paddingBottom: 8,
      backgroundColor: c.bgPrimary,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    logoRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    logoIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: c.brand,
      alignItems: "center",
      justifyContent: "center",
    },
    logoText: { fontSize: 18, fontWeight: "700", color: c.textPrimary },
    hero: {
      backgroundColor: c.brand,
      margin: 16,
      borderRadius: 20,
      padding: 24,
    },
    heroHeadline: {
      fontSize: 22,
      fontWeight: "700",
      color: "#fff",
      marginBottom: 4,
    },
    heroSub: { fontSize: 13, color: "rgba(255,255,255,0.85)" },
    searchRow: {
      flexDirection: "row",
      gap: 10,
      paddingHorizontal: 16,
      marginBottom: 12,
    },
    searchBox: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderRadius: 14,
      paddingHorizontal: 14,
      height: 48,
    },
    searchInput: { flex: 1, fontSize: 14 },
    searchBtn: {
      height: 48,
      paddingHorizontal: 18,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
    },
    searchBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
    chips: { paddingLeft: 16, marginBottom: 20 },
    chip: {
      borderWidth: 1,
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 7,
      marginRight: 8,
    },
    chipText: { fontSize: 13 },
    section: { paddingHorizontal: 16, marginBottom: 20 },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 14,
    },
    sectionTitle: { fontSize: 17, fontWeight: "700" },
    viewAll: { fontSize: 14, fontWeight: "500" },
    count: { fontSize: 13 },
    recCard: {
      width: 190,
      borderRadius: 16,
      borderWidth: 1,
      padding: 14,
      marginRight: 12,
      minHeight: 170,
    },
    recIcon: {
      width: 44,
      height: 44,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 8,
    },
    recBadge: {
      alignSelf: "flex-start",
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 3,
      marginBottom: 8,
    },
    recBadgeText: { color: "#fff", fontSize: 11, fontWeight: "600" },
    recTitle: { fontSize: 14, fontWeight: "600", marginBottom: 4 },
    recCompany: { fontSize: 12, marginBottom: 8 },
    recSalary: { fontSize: 15, fontWeight: "700" },
    recentRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      borderWidth: 1,
      borderRadius: 14,
      padding: 14,
      marginBottom: 10,
    },
    recentIcon: {
      width: 44,
      height: 44,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    recentTitle: { fontSize: 14, fontWeight: "600" },
    recentMeta: { fontSize: 12, marginTop: 2 },
    recentBadges: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 4,
    },
    smallBadge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
    smallBadgeText: { fontSize: 11 },
    recentSalary: { fontSize: 12, fontWeight: "600" },
    arrowBtn: {
      width: 32,
      height: 32,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },
  });
