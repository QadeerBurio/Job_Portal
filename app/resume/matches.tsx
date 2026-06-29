// app/resume/matches.tsx — "Resume Complete! Jobs Recommended" Screen
// ✅ NEW: Gemini AI Skill Gap card — aggregates missingSkills from all matched
//         jobs, calls Gemini to prioritise and explain them, shows one-tap add.
import ThemeToggle from "@/components/ThemeToggle";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_BASE_URL, STORAGE_KEYS, TIMEOUT_MS } from "../../constants/API";
import { useTheme } from "../../context/ThemeContext";
import {
  addSkill,
  fetchMatchedJobs,
  fetchResume,
} from "../../services/resumeService";
import { JobMatch, Skill } from "../../types/resume";

// ── Gemini skill-gap analysis ─────────────────────────────────────────────────
// Called once after matches load. Sends the user's current skills + the
// aggregated missing skills from matched jobs to Gemini and asks it to:
//   1. Pick the top 5 most impactful missing skills
//   2. Write a one-sentence personalised reason for each
//   3. Estimate impact on match score
// Returns ONLY JSON so we can parse it safely.
//
// Calls the backend POST /api/resume/skill-gap which proxies to Gemini —
// we never put the Gemini API key in the frontend bundle.
console.log("Calling skill-gap URL:", `${API_BASE_URL}/resume/skill-gap`);
async function analyseSkillGap(
  currentSkills: string[],
  missingSkills: string[],
  topJobTitles: string[],
): Promise<SkillSuggestion[]> {
  const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}/resume/skill-gap`, {
      method: "POST",
      headers,
      signal: controller.signal,
      body: JSON.stringify({ currentSkills, missingSkills, topJobTitles }),
    });
    clearTimeout(timer);
    const text = await response.text();

    console.log("Skill Gap Raw:", text);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = JSON.parse(text);

    console.log("Skill Gap API Response:", data);
    // Backend returns { suggestions: [...] }
    return data.suggestions as SkillSuggestion[];
  } catch (err: any) {
    clearTimeout(timer);
    throw err;
  }
}

interface SkillSuggestion {
  name: string;
  reason: string;
  impact: number;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function MatchesScreen() {
  const { colors } = useTheme();
  const [matches, setMatches] = useState<JobMatch[]>([]);
  const [loading, setLoading] = useState(true);

  // Skill gap state
  const [currentSkills, setCurrentSkills] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<SkillSuggestion[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(false);
  const [addedSkills, setAddedSkills] = useState<Set<string>>(new Set());
  const [addingSkill, setAddingSkill] = useState<string | null>(null);

  // Shimmer animation for loading state
  const shimmer = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (aiLoading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmer, {
            toValue: 1,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(shimmer, {
            toValue: 0,
            duration: 900,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      shimmer.stopAnimation();
      shimmer.setValue(0);
    }
  }, [aiLoading]);

  useEffect(() => {
    // Load matches + current skills in parallel
    Promise.all([fetchMatchedJobs(), fetchResume()])
      .then(([jobMatches, resume]) => {
        setMatches(jobMatches);
        console.log("First match missingSkills:", matches[0]?.missingSkills);
        console.log("First match matchedSkills:", matches[0]?.matchedSkills);
        const skills = (resume.skills ?? []).map((s: Skill) => s.name);
        setCurrentSkills(skills);

        // Only run Gemini analysis if there are matches to draw from
        if (jobMatches.length > 0) {
          runSkillAnalysis(jobMatches, skills);
        }
      })
      .catch((e) => Alert.alert("Error", e.message))
      .finally(() => setLoading(false));
  }, []);

  async function runSkillAnalysis(jobMatches: JobMatch[], skills: string[]) {
    setAiLoading(true);
    setAiError(false);
    try {
      // Aggregate all missingSkills across every matched job, weighted by
      // match score so high-relevance jobs contribute more signal.
      const missingMap: Record<string, number> = {};
      for (const job of jobMatches) {
        const weight = job.matchPercent / 100;
        for (const skill of job.missingSkills ?? []) {
          missingMap[skill] = (missingMap[skill] ?? 0) + weight;
        }
      }
      // Sort by weighted frequency descending
      const aggregatedMissing = Object.entries(missingMap)
        .sort((a, b) => b[1] - a[1])
        .map(([skill]) => skill)
        .slice(0, 15); // send top 15 to Gemini for it to filter to 5

      const topTitles = jobMatches.slice(0, 5).map((j) => j.title);
      const result = await analyseSkillGap(
        skills,
        aggregatedMissing,
        topTitles,
      );
      console.log("Job Matches:", jobMatches);
      console.log("Aggregated Missing:", aggregatedMissing);
      console.log("Gemini Suggestions:", result);
      setSuggestions(result);
    } catch (e: any) {
      console.error("Skill gap error:", e?.message ?? e);
      setAiError(true);
    } finally {
      setAiLoading(false);
    }
  }

  async function handleAddSkill(skillName: string) {
    if (addedSkills.has(skillName) || addingSkill === skillName) return;
    setAddingSkill(skillName);
    try {
      await addSkill(skillName, "technical");
      setAddedSkills((prev) => new Set([...prev, skillName]));
      setCurrentSkills((prev) => [...prev, skillName]);
    } catch (e: any) {
      // "Skill already added" from server is fine — just mark it
      if (e.message?.includes("already")) {
        setAddedSkills((prev) => new Set([...prev, skillName]));
      } else {
        Alert.alert("Couldn't add skill", e.message);
      }
    } finally {
      setAddingSkill(null);
    }
  }

  const topSkills =
    currentSkills.length > 0
      ? currentSkills.slice(0, 2).join(" and ")
      : "your skills";

  const s = makeStyles(colors);
  const shimmerOpacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 1],
  });

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <View style={s.header}>
        <View style={[s.avatar, { backgroundColor: colors.brand }]}>
          <Ionicons name="briefcase" size={20} color="#fff" />
        </View>
        <Text style={[s.headerTitle, { color: colors.textPrimary }]}>
          KarachiJobs
        </Text>
        <ThemeToggle />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        <View style={s.completeRow}>
          <Text style={s.completeIcon}>✅</Text>
          <Text style={[s.completeTitle, { color: colors.textPrimary }]}>
            Resume Complete!
          </Text>
        </View>
        <Text style={[s.completeSub, { color: colors.textSecondary }]}>
          Based on your skills in {topSkills}, we've found these opportunities
          in Karachi.
        </Text>

        {/* ── AI Skill Gap Card ─────────────────────────────────────────────
            Shown whenever there are matched jobs to draw signal from.
            Loading state uses a shimmer pulse so it feels alive, not frozen. */}
        {(aiLoading || suggestions.length > 0 || aiError) && (
          <View
            style={[
              s.aiCard,
              { backgroundColor: colors.bgCard, borderColor: colors.border },
            ]}
          >
            {/* Card header */}
            <View style={s.aiCardHeader}>
              <View
                style={[s.aiIconBox, { backgroundColor: colors.brandLight }]}
              >
                <Text style={{ fontSize: 16 }}>✨</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.aiCardTitle, { color: colors.textPrimary }]}>
                  AI Skill Gap Analysis
                </Text>
                <Text style={[s.aiCardSub, { color: colors.textSecondary }]}>
                  Based on your {matches.length} matched jobs
                </Text>
              </View>
              {aiLoading && (
                <Text style={[s.aiLoadingLabel, { color: colors.brand }]}>
                  Analysing…
                </Text>
              )}
            </View>

            {/* Loading shimmer rows */}
            {aiLoading && (
              <Animated.View style={{ opacity: shimmerOpacity }}>
                {[1, 2, 3].map((i) => (
                  <View
                    key={i}
                    style={[
                      s.shimmerRow,
                      { backgroundColor: colors.bgTertiary },
                    ]}
                  />
                ))}
              </Animated.View>
            )}

            {/* Error state */}
            {aiError && !aiLoading && (
              <View style={s.aiErrorRow}>
                <Text style={[s.aiErrorText, { color: colors.textSecondary }]}>
                  Couldn't load AI analysis.
                </Text>
                <TouchableOpacity
                  onPress={() => runSkillAnalysis(matches, currentSkills)}
                >
                  <Text style={[s.aiRetry, { color: colors.brand }]}>
                    Retry
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Skill suggestions */}
            {!aiLoading &&
              !aiError &&
              suggestions.map((sug, idx) => {
                const isAdded = addedSkills.has(sug.name);
                const isAdding = addingSkill === sug.name;
                return (
                  <View
                    key={idx}
                    style={[
                      s.sugRow,
                      idx < suggestions.length - 1 && {
                        borderBottomWidth: 1,
                        borderBottomColor: colors.border,
                      },
                    ]}
                  >
                    {/* Left: skill info */}
                    <View style={{ flex: 1 }}>
                      <View style={s.sugNameRow}>
                        <Text
                          style={[s.sugName, { color: colors.textPrimary }]}
                        >
                          {sug.name}
                        </Text>
                        {/* Impact badge */}
                        <View
                          style={[
                            s.impactBadge,
                            { backgroundColor: colors.brandLight },
                          ]}
                        >
                          <Text style={[s.impactText, { color: colors.brand }]}>
                            +{sug.impact}% match
                          </Text>
                        </View>
                      </View>
                      <Text
                        style={[s.sugReason, { color: colors.textSecondary }]}
                        numberOfLines={2}
                      >
                        {sug.reason}
                      </Text>
                    </View>

                    {/* Right: add button */}
                    <TouchableOpacity
                      style={[
                        s.addBtn,
                        isAdded
                          ? { backgroundColor: colors.success + "22" }
                          : { backgroundColor: colors.brandLight },
                      ]}
                      onPress={() => handleAddSkill(sug.name)}
                      disabled={isAdded || isAdding}
                      activeOpacity={0.75}
                    >
                      {isAdding ? (
                        <Text style={[s.addBtnText, { color: colors.brand }]}>
                          …
                        </Text>
                      ) : isAdded ? (
                        <Ionicons
                          name="checkmark"
                          size={16}
                          color={colors.success}
                        />
                      ) : (
                        <Text style={[s.addBtnText, { color: colors.brand }]}>
                          + Add
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                );
              })}

            {/* Footer CTA — only shown once at least one skill is added */}
            {addedSkills.size > 0 && (
              <TouchableOpacity
                style={[s.aiFooterBtn, { backgroundColor: colors.brandDark }]}
                onPress={() => router.push("/resume/skills" as any)}
              >
                <Text style={s.aiFooterBtnText}>
                  ✓ {addedSkills.size} skill
                  {addedSkills.size > 1 ? "s" : ""} added — View Skills →
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* ── Job list ────────────────────────────────────────────────────── */}
        <View style={s.sectionHeader}>
          <Text style={[s.sectionTitle, { color: colors.textPrimary }]}>
            Jobs Recommended For You
          </Text>
          <TouchableOpacity onPress={() => router.push("/search")}>
            <Text style={[s.viewAll, { color: colors.brand }]}>View All</Text>
          </TouchableOpacity>
        </View>

        {matches.map((job, i) => (
          <React.Fragment key={job.jobId}>
            <View
              style={[
                s.jobCard,
                { backgroundColor: colors.bgCard, borderColor: colors.border },
              ]}
            >
              <View style={s.jobTop}>
                <View
                  style={[s.logoBox, { backgroundColor: colors.bgTertiary }]}
                >
                  <Text style={{ fontSize: 18 }}>🏢</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.jobTitle, { color: colors.textPrimary }]}>
                    {job.title}
                  </Text>
                  <Text style={[s.company, { color: colors.textSecondary }]}>
                    {job.company}
                  </Text>
                </View>
                <View style={[s.matchBadge, { backgroundColor: "#22C55E22" }]}>
                  <Text style={s.matchIcon}>⚡</Text>
                  <Text style={s.matchText}>{job.matchPercent}% Match</Text>
                </View>
              </View>

              <View style={s.badges}>
                <View style={[s.badge, { backgroundColor: colors.bgTertiary }]}>
                  <Text style={[s.badgeText, { color: colors.textSecondary }]}>
                    {job.workMode}
                  </Text>
                </View>
                <View style={[s.badge, { backgroundColor: colors.bgTertiary }]}>
                  <Text style={[s.badgeText, { color: colors.textSecondary }]}>
                    {job.jobType}
                  </Text>
                </View>
                <View style={[s.badge, { backgroundColor: colors.brandLight }]}>
                  <Text style={[s.badgeText, { color: colors.brand }]}>
                    PKR {job.salaryMin}k - {job.salaryMax}k
                  </Text>
                </View>
              </View>

              <View style={s.jobFooter}>
                <Text style={[s.location, { color: colors.textTertiary }]}>
                  📍 {job.area}, Karachi
                </Text>
                <TouchableOpacity
                  style={[s.applyBtn, { backgroundColor: colors.brandDark }]}
                  onPress={() => router.push(`/job/${job.jobId}`)}
                >
                  <Text style={s.applyText}>Apply Now</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Insert premium CTA after 2nd job */}
            {i === 1 && (
              <View
                style={[s.premiumCard, { backgroundColor: colors.brandDark }]}
              >
                <Text style={s.premiumTitle}>Unlock Premium Insights</Text>
                <Text style={s.premiumSub}>
                  See how you rank against other applicants for these roles.
                </Text>
                <TouchableOpacity style={s.upgradeBtn}>
                  <Text style={[s.upgradeText, { color: colors.brandDark }]}>
                    Upgrade Now
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </React.Fragment>
        ))}

        {!loading && matches.length === 0 && (
          <View style={s.emptyState}>
            <Text style={{ fontSize: 50 }}>🔍</Text>
            <Text style={[s.emptyText, { color: colors.textSecondary }]}>
              Complete more of your resume to get personalized matches.
            </Text>
          </View>
        )}

        <View style={{ height: 100 }} />
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
    avatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: { fontSize: 18, fontWeight: "700" },
    scroll: { padding: 20 },
    completeRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 8,
    },
    completeIcon: { fontSize: 22 },
    completeTitle: { fontSize: 21, fontWeight: "700" },
    completeSub: { fontSize: 13, lineHeight: 20, marginBottom: 20 },

    // ── AI Skill Gap card ──────────────────────────────────────────────────
    aiCard: {
      borderWidth: 1,
      borderRadius: 18,
      padding: 16,
      marginBottom: 24,
    },
    aiCardHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 14,
    },
    aiIconBox: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    aiCardTitle: { fontSize: 15, fontWeight: "700" },
    aiCardSub: { fontSize: 12, marginTop: 1 },
    aiLoadingLabel: { fontSize: 11, fontWeight: "600" },
    shimmerRow: {
      height: 48,
      borderRadius: 10,
      marginBottom: 8,
    },
    aiErrorRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingVertical: 8,
    },
    aiErrorText: { fontSize: 13, flex: 1 },
    aiRetry: { fontSize: 13, fontWeight: "700" },

    // Each suggested skill row
    sugRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 12,
    },
    sugNameRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 3,
      flexWrap: "wrap",
    },
    sugName: { fontSize: 14, fontWeight: "700" },
    impactBadge: {
      borderRadius: 6,
      paddingHorizontal: 7,
      paddingVertical: 2,
    },
    impactText: { fontSize: 10, fontWeight: "700" },
    sugReason: { fontSize: 12, lineHeight: 17 },
    addBtn: {
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 8,
      minWidth: 62,
      alignItems: "center",
      justifyContent: "center",
    },
    addBtnText: { fontSize: 13, fontWeight: "700" },

    // Footer CTA after skills are added
    aiFooterBtn: {
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: "center",
      marginTop: 12,
    },
    aiFooterBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },

    // ── Job list ───────────────────────────────────────────────────────────
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 14,
    },
    sectionTitle: { fontSize: 17, fontWeight: "700" },
    viewAll: { fontSize: 13, fontWeight: "600" },
    jobCard: {
      borderWidth: 1,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
    },
    jobTop: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
      marginBottom: 12,
    },
    logoBox: {
      width: 42,
      height: 42,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    jobTitle: { fontSize: 15, fontWeight: "700" },
    company: { fontSize: 12, marginTop: 2 },
    matchBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    matchIcon: { fontSize: 11 },
    matchText: { color: "#16A34A", fontSize: 11, fontWeight: "700" },
    badges: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 14,
    },
    badge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
    badgeText: { fontSize: 11, fontWeight: "600" },
    jobFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    location: { fontSize: 12 },
    applyBtn: { borderRadius: 10, paddingHorizontal: 18, paddingVertical: 10 },
    applyText: { color: "#fff", fontSize: 13, fontWeight: "700" },
    premiumCard: { borderRadius: 18, padding: 22, marginBottom: 16 },
    premiumTitle: {
      color: "#fff",
      fontSize: 17,
      fontWeight: "700",
      marginBottom: 6,
    },
    premiumSub: {
      color: "rgba(255,255,255,0.8)",
      fontSize: 13,
      marginBottom: 16,
      lineHeight: 19,
    },
    upgradeBtn: {
      backgroundColor: "#fff",
      alignSelf: "flex-start",
      borderRadius: 12,
      paddingHorizontal: 18,
      paddingVertical: 10,
    },
    upgradeText: { fontSize: 13, fontWeight: "700" },
    emptyState: { alignItems: "center", paddingVertical: 40 },
    emptyText: {
      marginTop: 12,
      fontSize: 14,
      textAlign: "center",
      paddingHorizontal: 30,
    },
  });
