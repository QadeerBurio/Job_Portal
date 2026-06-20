// app/resume/projects.tsx — Projects Screen
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import { deleteProject, fetchResume } from "../../services/resumeService";
import { Project } from "../../types/resume";

function fmtDuration(
  start: string,
  end: string | null,
  isCurrent: boolean,
): string {
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  const startStr = fmt(start);
  const endStr = isCurrent ? "Present" : end ? fmt(end) : "";
  const months = Math.max(
    1,
    Math.round(
      (new Date(end ?? Date.now()).getTime() - new Date(start).getTime()) /
        (1000 * 60 * 60 * 24 * 30),
    ),
  );
  return `${startStr} — ${endStr} (${months} month${months !== 1 ? "s" : ""})`;
}

export default function ProjectsScreen() {
  const { colors } = useTheme();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    fetchResume()
      .then((r) => setProjects(r.projects))
      .catch((e) => Alert.alert("Error", e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = (id: string, name: string) => {
    Alert.alert("Delete Project", `Remove "${name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteProject(id);
            load();
          } catch (e: any) {
            Alert.alert("Error", e.message);
          }
        },
      },
    ]);
  };

  const s = makeStyles(colors);

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <View style={s.header}>
        <Text style={[s.headerTitle, { color: colors.textPrimary }]}>
          KarachiJobs
        </Text>
        <View style={s.headerRight}>
          <Text style={{ fontSize: 18 }}>🔔</Text>
          <View style={[s.avatar, { backgroundColor: colors.brand }]}>
            <Text style={{ color: "#fff" }}>👤</Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        <View style={s.titleRow}>
          <Text style={[s.title, { color: colors.textPrimary }]}>Projects</Text>
          <TouchableOpacity
            style={[s.sortBtn, { backgroundColor: colors.bgTertiary }]}
          >
            <Text style={[s.sortText, { color: colors.textPrimary }]}>
              ☰ Sort
            </Text>
          </TouchableOpacity>
        </View>

        {projects.map((project) => (
          <View
            key={project._id}
            style={[
              s.card,
              { backgroundColor: colors.bgCard, borderColor: colors.border },
            ]}
          >
            <View style={s.cardHeader}>
              <Text style={[s.projectName, { color: colors.textPrimary }]}>
                {project.name}
              </Text>
              <View style={s.actions}>
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: "/resume/add-project",
                      params: { id: project._id },
                    } as any)
                  }
                >
                  <Text style={s.editIcon}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDelete(project._id, project.name)}
                  style={{ marginLeft: 10 }}
                >
                  <Text style={s.deleteIcon}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>

            {project.role ? (
              <View style={[s.roleBadge, { backgroundColor: "#22C55E22" }]}>
                <Text style={[s.roleText, { color: "#16A34A" }]}>
                  {project.role}
                </Text>
              </View>
            ) : null}

            <Text style={[s.duration, { color: colors.textTertiary }]}>
              📅{" "}
              {fmtDuration(
                project.startDate,
                project.endDate,
                project.isCurrent,
              )}
            </Text>

            <Text
              style={[s.description, { color: colors.textSecondary }]}
              numberOfLines={2}
            >
              {project.description}
            </Text>

            {project.technologies.length > 0 && (
              <View style={s.techRow}>
                {project.technologies.map((tech) => (
                  <View
                    key={tech}
                    style={[s.techChip, { backgroundColor: colors.bgTertiary }]}
                  >
                    <Text style={[s.techText, { color: colors.textSecondary }]}>
                      {tech}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}

        {!loading && projects.length === 0 && (
          <View style={s.emptyState}>
            <Text style={{ fontSize: 50 }}>🗂️</Text>
            <Text style={[s.emptyText, { color: colors.textSecondary }]}>
              No projects added yet.
            </Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <TouchableOpacity
        style={[s.fab, { backgroundColor: colors.brandDark }]}
        onPress={() => router.push("/resume/add-project" as any)}
      >
        <Text style={s.fabIcon}>+</Text>
      </TouchableOpacity>
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
    headerTitle: { fontSize: 20, fontWeight: "700" },
    headerRight: { flexDirection: "row", alignItems: "center", gap: 14 },
    avatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    scroll: { padding: 20 },
    titleRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 18,
    },
    title: { fontSize: 26, fontWeight: "700" },
    sortBtn: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 8,
    },
    sortText: { fontSize: 13, fontWeight: "600" },
    card: { borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 14 },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 8,
    },
    projectName: { fontSize: 17, fontWeight: "700", flex: 1 },
    actions: { flexDirection: "row" },
    editIcon: { fontSize: 16 },
    deleteIcon: { fontSize: 16 },
    roleBadge: {
      alignSelf: "flex-start",
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 4,
      marginBottom: 8,
    },
    roleText: { fontSize: 12, fontWeight: "600" },
    duration: { fontSize: 12, marginBottom: 10 },
    description: { fontSize: 13, lineHeight: 19, marginBottom: 12 },
    techRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      borderTopWidth: 1,
      borderTopColor: "rgba(0,0,0,0.06)",
      paddingTop: 12,
    },
    techChip: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
    techText: { fontSize: 11, fontWeight: "600" },
    emptyState: { alignItems: "center", paddingVertical: 40 },
    emptyText: { marginTop: 12, fontSize: 14 },
    fab: {
      position: "absolute",
      bottom: 24,
      right: 20,
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: "center",
      justifyContent: "center",
      elevation: 4,
    },
    fabIcon: { color: "#fff", fontSize: 28, fontWeight: "300", marginTop: -2 },
  });
