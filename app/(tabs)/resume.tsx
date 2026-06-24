// app/(tabs)/resume.tsx — Resume Hub (the "Resume" tab in bottom nav)
// This is what shows when the user taps "Resume" in the tab bar.
// It redirects to Work Experience by default (matches the screenshots),
// with quick links to every other resume section.
//
// ✅ NEW: "Upload Existing Resume" card, placed below the section grid and
// above "See Matched Jobs" (per product decision). Picking + uploading a
// file reuses the same completion/ATS/job-matching pipeline as the manual
// builder — there is no separate UI state for "uploaded resume data," it's
// written into the same resume document the rest of this screen reads.
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ThemeToggle from "../../components/ThemeToggle";
import { useTheme } from "../../context/ThemeContext";
import { fetchResume } from "../../services/resumeService";
import { uploadResume } from "../../services/resumeUploadService";

const SECTIONS = [
  {
    key: "personal-info",
    label: "Personal Information",
    icon: "person-circle-outline",
    route: "/resume/personal-info",
  },
  {
    key: "experience",
    label: "Work Experience",
    icon: "briefcase-outline",
    route: "/resume/experience",
  },
  {
    key: "education",
    label: "Education",
    icon: "school-outline",
    route: "/resume/education",
  },
  {
    key: "skills",
    label: "Skills",
    icon: "flash-outline",
    route: "/resume/skills",
  },

  {
    key: "projects",
    label: "Projects",
    icon: "folder-open-outline",
    route: "/resume/projects",
  },
  {
    key: "certifications",
    label: "Certifications",
    icon: "ribbon-outline",
    route: "/resume/certifications",
  },
  {
    key: "templates",
    label: "Resume Templates",
    icon: "document-text-outline",
    route: "/resume/templates",
  },
  {
    key: "preview",
    label: "Preview & Download",
    icon: "eye-outline",
    route: "/resume/preview",
  },
];

// Accepted MIME types — anything else is rejected before it ever reaches
// the network call, so the user gets instant feedback.
const ACCEPTED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
];

// Key under which we persist the last-uploaded resume metadata in AsyncStorage.
// This lets the hub card survive navigation and app restarts without needing
// the backend to return uploadedResume fields on GET /resume.
const UPLOAD_META_KEY = "resume_upload_meta";

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Format a Date (or ISO string) into a compact "Jun 24, 2026" label. */
function formatUploadDate(raw: string | Date | undefined): string {
  if (!raw) return "";
  const d = typeof raw === "string" ? new Date(raw) : raw;
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Truncate a long filename so it doesn't overflow the card. */
function truncateFilename(name: string, maxLen = 28): string {
  if (name.length <= maxLen) return name;
  const ext = name.lastIndexOf(".");
  const suffix = ext !== -1 ? name.slice(ext) : "";
  return name.slice(0, maxLen - suffix.length - 1) + "…" + suffix;
}

export default function ResumeHubScreen() {
  const { colors } = useTheme();
  const [completion, setCompletion] = useState(0);
  const [uploading, setUploading] = useState(false);

  // ── Uploaded-resume metadata ─────────────────────────────────────────────
  // These come from fetchResume() so they stay in sync with the rest of the
  // resume data — no separate storage needed.
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedAt, setUploadedAt] = useState<string | null>(null);

  const loadCompletion = useCallback(() => {
    // Load completion % from the server
    fetchResume()
      .then((r) => setCompletion(r.completionPercent ?? 0))
      .catch(() => {});

    // Load persisted upload metadata from AsyncStorage — this survives
    // navigation and app restarts without requiring the backend to return
    // uploadedResume fields on GET /resume (which the Resume type doesn't have).
    AsyncStorage.getItem(UPLOAD_META_KEY)
      .then((raw) => {
        if (!raw) return;
        const meta = JSON.parse(raw);
        if (meta?.fileName) setUploadedFileName(meta.fileName);
        if (meta?.uploadedAt) setUploadedAt(meta.uploadedAt);
      })
      .catch(() => {});
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCompletion();
    }, [loadCompletion]),
  );

  // ── Upload Existing Resume ──────────────────────────────────────────────
  const handleUploadResume = async () => {
    let result: DocumentPicker.DocumentPickerResult;
    try {
      result = await DocumentPicker.getDocumentAsync({
        type: ACCEPTED_MIME_TYPES,
        copyToCacheDirectory: true,
        multiple: false,
      });
    } catch (e: any) {
      Alert.alert("Error", "Couldn't open the file picker. Please try again.");
      return;
    }

    if (result.canceled || !result.assets?.length) {
      return; // user backed out — not an error, just do nothing
    }

    const file = result.assets[0];

    // Defensive re-check: some Android pickers let the user select files
    // outside the `type` filter via "Browse" — reject anything that slips
    // through with a clear message rather than sending it to the server.
    if (file.mimeType && !ACCEPTED_MIME_TYPES.includes(file.mimeType)) {
      Alert.alert(
        "Unsupported file type",
        "Please select a PDF (.pdf) or Word (.docx) file.",
      );
      return;
    }

    const MAX_SIZE = 10 * 1024 * 1024; // 10MB — matches backend multer limit
    if (file.size && file.size > MAX_SIZE) {
      Alert.alert("File too large", "Please upload a file under 10MB.");
      return;
    }

    setUploading(true);
    try {
      const response = await uploadResume({
        uri: file.uri,
        name: file.name,
        size: file.size ?? 0,
        mimeType: file.mimeType ?? "application/pdf",
      });

      // Persist upload metadata to AsyncStorage so the hub card survives
      // navigation back from the review screen and app restarts.
      const uploadedAt = new Date().toISOString();
      const meta = { fileName: file.name, uploadedAt };
      AsyncStorage.setItem(UPLOAD_META_KEY, JSON.stringify(meta)).catch(
        () => {},
      );

      // Also update state immediately so the card re-renders right now
      setUploadedFileName(file.name);
      setUploadedAt(uploadedAt);

      // ✅ FIX: Navigate to review screen instead of just showing alert.
      // User can verify the import, see what sections were found, fix any missing
      // data, then confirm to go back to hub with updated completion %.
      // @ts-ignore — review-upload route type will exist once the file is created
      router.push("/resume/review-upload");
    } catch (e: any) {
      Alert.alert("Upload Failed", e.message || "Something went wrong.");
    } finally {
      setUploading(false);
    }
  };

  const s = makeStyles(colors);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Whether to show the "already uploaded" status row inside the card.
  const hasUpload = !!uploadedFileName;

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <View style={s.header}>
        <Text style={[s.headerTitle, { color: colors.textPrimary }]}>
          My Resume
        </Text>
        <ThemeToggle />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        <View style={[s.progressCard, { backgroundColor: colors.brandDark }]}>
          <Text style={s.progressLabel}>Resume Strength</Text>
          <Text style={s.progressPercent}>{completion}% Complete</Text>
          <View style={s.progressTrack}>
            <View style={[s.progressFill, { width: `${completion}%` }]} />
          </View>
        </View>

        <View style={s.grid}>
          {SECTIONS.map((sec) => (
            <TouchableOpacity
              key={sec.key}
              style={[
                s.card,
                { backgroundColor: colors.bgCard, borderColor: colors.border },
              ]}
              onPress={() => router.push(sec.route as any)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={sec.icon as any}
                size={30}
                color={colors.brand}
                style={{ marginBottom: 10 }}
              />
              <Text style={[s.cardLabel, { color: colors.textPrimary }]}>
                {sec.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ✅ Upload Existing Resume card — shows upload status when a file
            has already been imported. */}
        <TouchableOpacity
          style={[
            s.uploadCard,
            { backgroundColor: colors.bgCard, borderColor: colors.border },
            // Tint the border green when a resume is already on file so the
            // card itself signals "done" at a glance.
            hasUpload && { borderColor: colors.success },
          ]}
          onPress={handleUploadResume}
          activeOpacity={0.8}
          disabled={uploading}
        >
          {/* Left icon box */}
          <View
            style={[
              s.uploadIconBox,
              {
                backgroundColor: hasUpload
                  ? // Slight green tint when uploaded, brand tint otherwise.
                    colors.success + "1A" // 10 % opacity
                  : colors.brandLight,
              },
            ]}
          >
            {uploading ? (
              <ActivityIndicator size="small" color={colors.brand} />
            ) : (
              <Ionicons
                name={
                  hasUpload ? "document-attach-outline" : "cloud-upload-outline"
                }
                size={26}
                color={hasUpload ? colors.success : colors.brand}
              />
            )}
          </View>

          {/* Text column */}
          <View style={{ flex: 1 }}>
            <Text style={[s.uploadTitle, { color: colors.textPrimary }]}>
              {uploading
                ? "Uploading…"
                : hasUpload
                  ? "Resume Uploaded"
                  : "Upload Existing Resume"}
            </Text>

            {/* ── Status row (only when a file exists) ── */}
            {hasUpload && !uploading ? (
              <View style={s.uploadStatusRow}>
                {/* Green dot */}
                <View
                  style={[s.uploadDot, { backgroundColor: colors.success }]}
                />
                <Text
                  style={[s.uploadStatusText, { color: colors.success }]}
                  numberOfLines={1}
                >
                  {truncateFilename(uploadedFileName!)}
                </Text>
                {uploadedAt ? (
                  <Text
                    style={[s.uploadDateText, { color: colors.textTertiary }]}
                  >
                    · {formatUploadDate(uploadedAt)}
                  </Text>
                ) : null}
              </View>
            ) : (
              /* Default subtitle when no file has been uploaded yet */
              !uploading && (
                <Text
                  style={[s.uploadSubtitle, { color: colors.textSecondary }]}
                >
                  Upload PDF or DOCX and instantly match jobs
                </Text>
              )
            )}

            {/* "Replace file" hint — shown under the status row so the user
                knows they can tap again to swap the file out. */}
            {hasUpload && !uploading && (
              <Text
                style={[s.uploadReplaceHint, { color: colors.textTertiary }]}
              >
                Tap to replace
              </Text>
            )}
          </View>

          {/* Right chevron — hidden while uploading */}
          {!uploading && (
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textTertiary}
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.matchesBtn, { backgroundColor: colors.success }]}
          onPress={() => router.push("/resume/matches" as any)}
        >
          <Text style={s.matchesBtnText}>⚡ See Matched Jobs</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
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
    headerTitle: { fontSize: 22, fontWeight: "700" },
    scroll: { padding: 20 },
    progressCard: { borderRadius: 18, padding: 20, marginBottom: 24 },
    progressLabel: {
      color: "rgba(255,255,255,0.8)",
      fontSize: 12,
      fontWeight: "600",
      letterSpacing: 0.5,
      marginBottom: 6,
    },
    progressPercent: {
      color: "#fff",
      fontSize: 22,
      fontWeight: "700",
      marginBottom: 14,
    },
    progressTrack: {
      height: 8,
      backgroundColor: "rgba(255,255,255,0.25)",
      borderRadius: 4,
    },
    progressFill: { height: 8, backgroundColor: "#fff", borderRadius: 4 },
    grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
    card: {
      width: "47%",
      borderWidth: 1,
      borderRadius: 16,
      padding: 18,
      alignItems: "center",
    },
    cardIcon: { fontSize: 28, marginBottom: 10 },
    cardLabel: { fontSize: 13, fontWeight: "600", textAlign: "center" },

    // ── Upload card ────────────────────────────────────────────────────────
    uploadCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      borderWidth: 1,
      borderRadius: 16,
      padding: 16,
      marginTop: 16,
    },
    uploadIconBox: {
      width: 48,
      height: 48,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    uploadTitle: { fontSize: 15, fontWeight: "700", marginBottom: 2 },
    uploadSubtitle: { fontSize: 12 },

    // ── Uploaded-status row ────────────────────────────────────────────────
    uploadStatusRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 2,
      flexShrink: 1,
    },
    uploadDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginRight: 5,
    },
    uploadStatusText: {
      fontSize: 12,
      fontWeight: "600",
      flexShrink: 1,
    },
    uploadDateText: {
      fontSize: 12,
      marginLeft: 2,
      flexShrink: 0,
    },
    uploadReplaceHint: {
      fontSize: 11,
      marginTop: 3,
    },

    // ── Matches button ─────────────────────────────────────────────────────
    matchesBtn: {
      borderRadius: 16,
      height: 54,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 24,
    },
    matchesBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  });
