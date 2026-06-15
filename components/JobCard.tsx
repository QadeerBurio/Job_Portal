// components/JobCard.tsx
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { Job } from "../types";

type Props = {
  job: Job;
  onPress: () => void;
  onSave?: () => void;
  compact?: boolean;
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return "Yesterday";
  if (d < 7) return `${d} days ago`;
  return "1 week ago";
}

const TYPE_COLORS: Record<string, string> = {
  "Full-time": "#1D9E75",
  "Part-time": "#8B5CF6",
  Remote: "#3B82F6",
  "On-site": "#F59E0B",
  Hybrid: "#6366F1",
  Internship: "#EC4899",
  Contract: "#64748B",
};

export default function JobCard({ job, onPress, onSave, compact }: Props) {
  const { colors } = useTheme();

  const typeColor = TYPE_COLORS[job.jobType] ?? colors.brand;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: colors.bgCard, borderColor: colors.border },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={[styles.logoBox, { backgroundColor: colors.bgTertiary }]}>
          <Text style={[styles.logoText, { color: colors.textSecondary }]}>
            {job.company.charAt(0)}
          </Text>
        </View>
        <View style={styles.titleBlock}>
          <Text
            style={[styles.jobTitle, { color: colors.textPrimary }]}
            numberOfLines={1}
          >
            {job.title}
          </Text>
          <Text
            style={[styles.company, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {job.company}
          </Text>
        </View>
        {onSave && (
          <TouchableOpacity onPress={onSave} style={styles.saveBtn}>
            <Text
              style={{
                fontSize: 18,
                color: job.isSaved ? colors.brand : colors.textTertiary,
              }}
            >
              {job.isSaved ? "🔖" : "🔖"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {!compact && (
        <View style={styles.badges}>
          <View style={[styles.badge, { backgroundColor: typeColor + "22" }]}>
            <Text style={[styles.badgeText, { color: typeColor }]}>
              {job.jobType}
            </Text>
          </View>
          {job.isInternship && (
            <View style={[styles.badge, { backgroundColor: "#EC4899" + "22" }]}>
              <Text style={[styles.badgeText, { color: "#EC4899" }]}>
                Intern
              </Text>
            </View>
          )}
          {job.isTrainee && (
            <View style={[styles.badge, { backgroundColor: "#8B5CF6" + "22" }]}>
              <Text style={[styles.badgeText, { color: "#8B5CF6" }]}>
                Trainee
              </Text>
            </View>
          )}
          <View style={[styles.badge, { backgroundColor: colors.brandLight }]}>
            <Text style={[styles.badgeText, { color: colors.brand }]}>
              Rs. {job.salaryMin}k – {job.salaryMax}k
            </Text>
          </View>
        </View>
      )}

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textTertiary }]}>
          📍 {job.area}, Karachi
        </Text>
        <Text style={[styles.footerText, { color: colors.textTertiary }]}>
          {timeAgo(job.postedAt)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  logoBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  logoText: {
    fontSize: 18,
    fontWeight: "700",
  },
  titleBlock: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  company: {
    fontSize: 13,
    marginTop: 2,
  },
  saveBtn: {
    padding: 4,
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 10,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.06)",
    paddingTop: 10,
  },
  footerText: {
    fontSize: 12,
  },
});
