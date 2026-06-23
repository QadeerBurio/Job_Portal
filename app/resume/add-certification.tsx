// app/resume/add-certification.tsx — Add Certification Form
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as DocumentPicker from "expo-document-picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import {
  addCertification,
  updateCertification,
} from "../../services/resumeService";

export default function AddCertificationScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = !!id;

  const [name, setName] = useState("");
  const [issuer, setIssuer] = useState("");
  const [dateIssued, setDateIssued] = useState<Date | null>(null);
  const [expirationDate, setExpirationDate] = useState<Date | null>(null);
  const [doesNotExpire, setDoesNotExpire] = useState(false);
  const [credentialUrl, setCredentialUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [showIssuedPicker, setShowIssuedPicker] = useState(false);
  const [showExpiryPicker, setShowExpiryPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const s = makeStyles(colors);

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "application/pdf"],
      });
      if (!result.canceled && result.assets?.[0]) {
        setPreviewUrl(result.assets[0].uri);
      }
    } catch {
      Alert.alert("Upload failed", "Could not select file.");
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !issuer.trim() || !dateIssued) {
      Alert.alert(
        "Missing info",
        "Certificate name, issuer, and date issued are required.",
      );
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        issuer: issuer.trim(),
        dateIssued: dateIssued.toISOString(),
        expirationDate: doesNotExpire
          ? null
          : (expirationDate?.toISOString() ?? null),
        doesNotExpire,
        credentialUrl: credentialUrl.trim(),
        previewUrl,
      };
      if (isEditing) await updateCertification(id, payload);
      else await addCertification(payload);
      router.back();
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setSaving(false);
    }
  };

  const fmtDate = (d: Date | null) =>
    d
      ? `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`
      : "mm/dd/yyyy";

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: colors.textPrimary }]}>
          Add Certification
        </Text>
        <Text style={{ fontSize: 18 }}>
          <Ionicons name="ribbon" size={20} color={colors.brand} />
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        <View
          style={[
            s.card,
            { backgroundColor: colors.bgCard, borderColor: colors.border },
          ]}
        >
          <Text style={[s.label, { color: colors.textPrimary }]}>
            Certificate Name *
          </Text>
          <TextInput
            style={[
              s.input,
              { borderColor: colors.border, color: colors.textPrimary },
            ]}
            placeholder="e.g. AWS Certified Solutions Architect"
            placeholderTextColor={colors.textTertiary}
            value={name}
            onChangeText={setName}
          />

          <Text style={[s.label, { color: colors.textPrimary }]}>
            Issuing Authority *
          </Text>
          <TextInput
            style={[
              s.input,
              { borderColor: colors.border, color: colors.textPrimary },
            ]}
            placeholder="e.g. Amazon Web Services"
            placeholderTextColor={colors.textTertiary}
            value={issuer}
            onChangeText={setIssuer}
          />

          <Text style={[s.label, { color: colors.textPrimary }]}>
            Date Issued *
          </Text>
          <TouchableOpacity
            style={[s.inputRow, { borderColor: colors.border }]}
            onPress={() => setShowIssuedPicker(true)}
          >
            <Text
              style={{
                color: dateIssued ? colors.textPrimary : colors.textTertiary,
                fontSize: 14,
              }}
            >
              {fmtDate(dateIssued)}
            </Text>
            <Text>📅</Text>
          </TouchableOpacity>
          {showIssuedPicker && (
            <DateTimePicker
              value={dateIssued ?? new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(_, d) => {
                setShowIssuedPicker(false);
                if (d) setDateIssued(d);
              }}
            />
          )}

          {!doesNotExpire && (
            <>
              <Text style={[s.label, { color: colors.textPrimary }]}>
                Expiration Date (Optional)
              </Text>
              <TouchableOpacity
                style={[s.inputRow, { borderColor: colors.border }]}
                onPress={() => setShowExpiryPicker(true)}
              >
                <Text
                  style={{
                    color: expirationDate
                      ? colors.textPrimary
                      : colors.textTertiary,
                    fontSize: 14,
                  }}
                >
                  {fmtDate(expirationDate)}
                </Text>
                <Text>📅</Text>
              </TouchableOpacity>
              {showExpiryPicker && (
                <DateTimePicker
                  value={expirationDate ?? new Date()}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={(_, d) => {
                    setShowExpiryPicker(false);
                    if (d) setExpirationDate(d);
                  }}
                />
              )}
            </>
          )}

          <TouchableOpacity
            style={s.checkRow}
            onPress={() => setDoesNotExpire(!doesNotExpire)}
          >
            <View
              style={[
                s.checkbox,
                {
                  borderColor: colors.border,
                  backgroundColor: doesNotExpire ? colors.brand : "transparent",
                },
              ]}
            >
              {doesNotExpire && (
                <Text style={{ color: "#fff", fontSize: 11 }}>✓</Text>
              )}
            </View>
            <Text style={[s.checkLabel, { color: colors.textPrimary }]}>
              This credential does not expire
            </Text>
          </TouchableOpacity>

          <Text style={[s.label, { color: colors.textPrimary }]}>
            Credential URL or ID
          </Text>
          <View style={[s.inputRow, { borderColor: colors.border }]}>
            <Text style={{ marginRight: 8 }}>🔗</Text>
            <TextInput
              style={[s.urlInput, { color: colors.textPrimary }]}
              placeholder="https://example.com/verify/123"
              placeholderTextColor={colors.textTertiary}
              value={credentialUrl}
              onChangeText={setCredentialUrl}
              autoCapitalize="none"
            />
          </View>
          <Text style={[s.hint, { color: colors.textTertiary }]}>
            Add a link to the certificate or verification page.
          </Text>

          <Text style={[s.label, { color: colors.textPrimary, marginTop: 24 }]}>
            Certificate Preview (Optional)
          </Text>
          <TouchableOpacity
            style={[
              s.uploadBox,
              { borderColor: colors.brand, backgroundColor: colors.brandLight },
            ]}
            onPress={handleUpload}
          >
            <Text style={{ fontSize: 28, marginBottom: 8 }}>📤</Text>
            <Text style={[s.uploadText, { color: colors.textSecondary }]}>
              {previewUrl
                ? "File selected ✓"
                : "Tap to upload certificate image or PDF"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={[s.footer, { backgroundColor: colors.bgPrimary }]}>
        <TouchableOpacity
          style={[s.discardBtn, { backgroundColor: colors.bgTertiary }]}
          onPress={() => router.back()}
        >
          <Text style={[s.discardText, { color: colors.textPrimary }]}>
            Discard
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            s.saveBtn,
            { backgroundColor: colors.brandDark, opacity: saving ? 0.6 : 1 },
          ]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={s.saveBtnText}>
            ✓ {saving ? "Saving…" : "Save Certification"}
          </Text>
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
      paddingVertical: 14,
      backgroundColor: c.bgPrimary,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    backArrow: { fontSize: 24 },
    headerTitle: { fontSize: 18, fontWeight: "700" },
    scroll: { padding: 20 },
    card: { borderWidth: 1, borderRadius: 18, padding: 20 },
    label: { fontSize: 14, fontWeight: "600", marginBottom: 8, marginTop: 16 },
    input: {
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 14,
      height: 50,
      fontSize: 14,
    },
    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 14,
      height: 50,
    },
    urlInput: { flex: 1, fontSize: 14 },
    hint: { fontSize: 11, marginTop: 6 },
    checkRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginTop: 16,
    },
    checkbox: {
      width: 20,
      height: 20,
      borderRadius: 5,
      borderWidth: 1.5,
      alignItems: "center",
      justifyContent: "center",
    },
    checkLabel: { fontSize: 14 },
    uploadBox: {
      borderWidth: 2,
      borderStyle: "dashed",
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 36,
    },
    uploadText: {
      fontSize: 13,
      fontWeight: "500",
      textAlign: "center",
      paddingHorizontal: 20,
    },
    footer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: "row",
      gap: 12,
      padding: 16,
    },
    discardBtn: {
      flex: 1,
      borderRadius: 14,
      height: 54,
      alignItems: "center",
      justifyContent: "center",
    },
    discardText: { fontSize: 15, fontWeight: "600" },
    saveBtn: {
      flex: 2,
      borderRadius: 14,
      height: 54,
      alignItems: "center",
      justifyContent: "center",
    },
    saveBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  });
