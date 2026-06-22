// app/resume/certifications.tsx — Certifications Screen
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
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
import { deleteCertification, fetchResume } from "../../services/resumeService";
import { Certification } from "../../types/resume";

const ICONS: Record<string, string> = {
  verified: "✅",
  academic: "🎓",
  code: "💻",
};

function fmtMonthYear(d: string): string {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export default function CertificationsScreen() {
  const { colors } = useTheme();
  const [certs, setCerts] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    fetchResume()
      .then((r) => setCerts(r.certifications))
      .catch((e) => Alert.alert("Error", e.message))
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );
  const handleDelete = (id: string, name: string) => {
    Alert.alert("Delete Certification", `Remove "${name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteCertification(id);
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
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[s.backArrow, { color: colors.textPrimary }]}>←</Text>
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: colors.textPrimary }]}>
          Certifications
        </Text>
        <View style={[s.avatar, { backgroundColor: colors.brand }]}>
          <Text style={{ color: "#fff" }}>👤</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        <View style={s.topRow}>
          <Text style={[s.count, { color: colors.textSecondary }]}>
            {certs.length} TOTAL CERTIFICATION{certs.length !== 1 ? "S" : ""}
          </Text>
          <TouchableOpacity
            style={[s.filterBtn, { backgroundColor: colors.brandDark }]}
          >
            <Text style={s.filterText}>☰ Filter</Text>
          </TouchableOpacity>
        </View>

        {certs.map((cert) => {
          const isActive =
            cert.doesNotExpire ||
            (cert.expirationDate && new Date(cert.expirationDate) > new Date());
          return (
            <View
              key={cert._id}
              style={[
                s.card,
                { backgroundColor: colors.bgCard, borderColor: colors.border },
              ]}
            >
              <View style={s.cardTop}>
                <View
                  style={[s.iconBox, { backgroundColor: colors.brandLight }]}
                >
                  <Text style={{ fontSize: 18 }}>
                    {ICONS[cert.icon ?? "verified"]}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.certName, { color: colors.textPrimary }]}>
                    {cert.name}
                  </Text>
                  <Text style={[s.issuer, { color: colors.textSecondary }]}>
                    🏢 {cert.issuer}
                  </Text>
                  <View style={s.metaRow}>
                    <Text style={[s.dateText, { color: colors.textTertiary }]}>
                      📅 Issued {fmtMonthYear(cert.dateIssued)}
                    </Text>
                    {isActive && (
                      <View style={s.activeBadge}>
                        <Text style={s.activeText}>ACTIVE</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
              <View style={s.actions}>
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: "/resume/add-certification",
                      params: { id: cert._id },
                    } as any)
                  }
                >
                  <Text style={s.editIcon}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDelete(cert._id, cert.name)}
                  style={{ marginLeft: 14 }}
                >
                  <Text style={s.deleteIcon}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {!loading && certs.length === 0 && (
          <View style={s.emptyState}>
            <Text style={{ fontSize: 60 }}>🏅</Text>
            <Text style={[s.emptyText, { color: colors.textSecondary }]}>
              No certifications added yet.
            </Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <TouchableOpacity
        style={[s.addBtn, { backgroundColor: colors.brandDark }]}
        onPress={() => router.push("/resume/add-certification" as any)}
      >
        <Text style={s.addBtnText}>+ ADD CERTIFICATION</Text>
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
    backArrow: { fontSize: 24 },
    headerTitle: { fontSize: 19, fontWeight: "700" },
    avatar: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: "center",
      justifyContent: "center",
    },
    scroll: { padding: 20 },
    topRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 18,
    },
    count: { fontSize: 12, fontWeight: "700", letterSpacing: 0.5 },
    filterBtn: { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 9 },
    filterText: { color: "#fff", fontSize: 13, fontWeight: "600" },
    card: {
      flexDirection: "row",
      borderWidth: 1,
      borderRadius: 16,
      padding: 16,
      marginBottom: 14,
      justifyContent: "space-between",
    },
    cardTop: { flexDirection: "row", gap: 12, flex: 1 },
    iconBox: {
      width: 44,
      height: 44,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    certName: { fontSize: 16, fontWeight: "700", marginBottom: 4 },
    issuer: { fontSize: 13, marginBottom: 8 },
    metaRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    dateText: { fontSize: 12 },
    activeBadge: {
      backgroundColor: "#22C55E22",
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 3,
    },
    activeText: { color: "#16A34A", fontSize: 10, fontWeight: "700" },
    actions: { justifyContent: "space-between", alignItems: "flex-end" },
    editIcon: { fontSize: 16 },
    deleteIcon: { fontSize: 16 },
    emptyState: { alignItems: "center", paddingVertical: 40 },
    emptyText: { marginTop: 12, fontSize: 14 },
    addBtn: {
      position: "absolute",
      bottom: 90,
      alignSelf: "center",
      borderRadius: 28,
      paddingHorizontal: 24,
      paddingVertical: 16,
      elevation: 4,
    },
    addBtnText: {
      color: "#fff",
      fontSize: 14,
      fontWeight: "700",
      letterSpacing: 0.5,
    },
  });
