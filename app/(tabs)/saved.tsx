// app/saved.tsx  — Saved Jobs Screen
import { router } from "expo-router";
import React, { useState } from "react";
import {
    FlatList,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import JobCard from "../../components/JobCard";
import ThemeToggle from "../../components/ThemeToggle";
import { useTheme } from "../../context/ThemeContext";
import { MOCK_JOBS } from "../../services/mockData";

const TABS = ["All Saved", "Software", "Finance", "Marketing", "Healthcare"];

export default function SavedScreen() {
  const { colors, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState("All Saved");

  // For demo: show first 5 mock jobs as "saved"
  const saved = MOCK_JOBS.slice(0, 5).map((j) => ({ ...j, isSaved: true }));
  const filtered =
    activeTab === "All Saved"
      ? saved
      : saved.filter(
          (j) => j.category.toLowerCase() === activeTab.toLowerCase(),
        );

  const s = makeStyles(colors);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Header */}
      <View style={s.header}>
        <View style={s.logoRow}>
          <View style={s.logoIcon}>
            <Text style={{ fontSize: 16 }}>💼</Text>
          </View>
          <Text style={s.logoText}>KarachiJobs</Text>
        </View>
        <ThemeToggle />
      </View>

      <View style={s.titleBlock}>
        <Text style={[s.title, { color: colors.textPrimary }]}>Saved Jobs</Text>
        <Text style={[s.subtitle, { color: colors.textSecondary }]}>
          Manage your bookmarked opportunities in Karachi.
        </Text>
      </View>

      {/* Category tabs */}
      <FlatList
        horizontal
        data={TABS}
        keyExtractor={(t) => t}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.tabs}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              s.tab,
              {
                backgroundColor:
                  activeTab === item ? colors.brand : colors.bgTertiary,
                borderColor: activeTab === item ? colors.brand : colors.border,
              },
            ]}
            onPress={() => setActiveTab(item)}
          >
            <Text
              style={{
                color: activeTab === item ? "#fff" : colors.textSecondary,
                fontSize: 13,
                fontWeight: "500",
              }}
            >
              {item}
              {item === "All Saved" ? ` (${saved.length})` : ""}
            </Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        data={filtered}
        keyExtractor={(j) => j._id}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <JobCard job={item} onPress={() => router.push(`/job/${item._id}`)} />
        )}
        ListFooterComponent={
          <View
            style={[
              s.alertCard,
              { backgroundColor: colors.bgCard, borderColor: colors.border },
            ]}
          >
            <Text style={[s.alertTitle, { color: colors.textPrimary }]}>
              Find more jobs like these?
            </Text>
            <Text style={[s.alertSub, { color: colors.textSecondary }]}>
              We can alert you when similar positions open in Karachi.
            </Text>
            <TouchableOpacity
              style={[s.alertBtn, { borderColor: colors.border }]}
            >
              <Text style={[s.alertBtnText, { color: colors.textPrimary }]}>
                Set Alert
              </Text>
            </TouchableOpacity>
          </View>
        }
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={{ fontSize: 40 }}>🔖</Text>
            <Text style={[{ color: colors.textSecondary, marginTop: 12 }]}>
              No saved jobs in this category.
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
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 10,
      backgroundColor: c.bgPrimary,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    logoRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    logoIcon: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: c.brand,
      alignItems: "center",
      justifyContent: "center",
    },
    logoText: { fontSize: 17, fontWeight: "700", color: c.textPrimary },
    titleBlock: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 },
    title: { fontSize: 24, fontWeight: "700" },
    subtitle: { fontSize: 13, marginTop: 4 },
    tabs: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
    tab: {
      borderWidth: 1,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    list: { paddingHorizontal: 16, paddingBottom: 100 },
    alertCard: { borderWidth: 1, borderRadius: 16, padding: 20, marginTop: 8 },
    alertTitle: { fontSize: 16, fontWeight: "600", marginBottom: 6 },
    alertSub: { fontSize: 13, marginBottom: 16 },
    alertBtn: {
      borderWidth: 1,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: "center",
    },
    alertBtnText: { fontSize: 14, fontWeight: "600" },
    empty: { alignItems: "center", paddingTop: 60 },
  });
