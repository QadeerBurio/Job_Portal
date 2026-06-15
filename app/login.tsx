// app/login.tsx  — Login Screen
import { router } from "expo-router";
import React, { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import ThemeToggle from "../components/ThemeToggle";
import { useTheme } from "../context/ThemeContext";

export default function LoginScreen() {
  const { colors, isDark } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);

  const s = makeStyles(colors);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <View style={s.topBar}>
        <View />
        <ThemeToggle />
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={s.logoSection}>
            <View style={[s.logoBox, { backgroundColor: colors.brand }]}>
              <Text style={{ fontSize: 28 }}>💼</Text>
            </View>
            <Text style={[s.appName, { color: colors.textPrimary }]}>
              KarachiJobs
            </Text>
            <Text style={[s.tagline, { color: colors.textSecondary }]}>
              Connecting Karachi's talent to top opportunities
            </Text>
          </View>

          <View
            style={[
              s.card,
              { backgroundColor: colors.bgCard, borderColor: colors.border },
            ]}
          >
            <Text style={[s.fieldLabel, { color: colors.textPrimary }]}>
              EMAIL ADDRESS
            </Text>
            <View
              style={[
                s.inputRow,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.bgSecondary,
                },
              ]}
            >
              <Text
                style={{
                  fontSize: 16,
                  marginRight: 10,
                  color: colors.textTertiary,
                }}
              >
                ✉️
              </Text>
              <TextInput
                style={[s.input, { color: colors.textPrimary }]}
                placeholder="name@company.com"
                placeholderTextColor={colors.textTertiary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={s.pwHeader}>
              <Text style={[s.fieldLabel, { color: colors.textPrimary }]}>
                PASSWORD
              </Text>
              <TouchableOpacity>
                <Text style={[s.forgotText, { color: colors.brand }]}>
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            </View>
            <View
              style={[
                s.inputRow,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.bgSecondary,
                },
              ]}
            >
              <Text
                style={{
                  fontSize: 16,
                  marginRight: 10,
                  color: colors.textTertiary,
                }}
              >
                🔒
              </Text>
              <TextInput
                style={[s.input, { color: colors.textPrimary }]}
                placeholder="••••••••"
                placeholderTextColor={colors.textTertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPw}
              />
              <TouchableOpacity onPress={() => setShowPw(!showPw)}>
                <Text style={{ color: colors.textTertiary, fontSize: 16 }}>
                  {showPw ? "🙈" : "👁️"}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={s.rememberRow}
              onPress={() => setRemember(!remember)}
            >
              <View
                style={[
                  s.checkbox,
                  {
                    borderColor: colors.border,
                    backgroundColor: remember ? colors.brand : "transparent",
                  },
                ]}
              >
                {remember && (
                  <Text style={{ color: "#fff", fontSize: 12 }}>✓</Text>
                )}
              </View>
              <Text style={[s.rememberText, { color: colors.textSecondary }]}>
                Remember this device
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.loginBtn, { backgroundColor: colors.brandDark }]}
              onPress={() => router.replace("/")}
            >
              <Text style={s.loginBtnText}>Login →</Text>
            </TouchableOpacity>

            <View style={s.orRow}>
              <View style={[s.divider, { backgroundColor: colors.border }]} />
              <Text style={[s.orText, { color: colors.textTertiary }]}>
                OR CONTINUE WITH
              </Text>
              <View style={[s.divider, { backgroundColor: colors.border }]} />
            </View>

            <View style={s.socialRow}>
              <TouchableOpacity
                style={[s.socialBtn, { borderColor: colors.border }]}
              >
                <Text style={{ fontSize: 16, marginRight: 8 }}>G</Text>
                <Text
                  style={[{ color: colors.textPrimary, fontWeight: "500" }]}
                >
                  Google
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.socialBtn, { borderColor: colors.border }]}
              >
                <Text style={{ fontSize: 16, marginRight: 8 }}>f</Text>
                <Text
                  style={[{ color: colors.textPrimary, fontWeight: "500" }]}
                >
                  Facebook
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={s.signupRow}>
            <Text style={[{ color: colors.textSecondary }]}>
              Don't have an account yet?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.push("/signup")}>
              <Text style={[s.signupLink, { color: colors.brand }]}>
                Sign Up for Free
              </Text>
            </TouchableOpacity>
          </View>

          <View style={s.footerRow}>
            <Text style={[s.footerItem, { color: colors.textTertiary }]}>
              🛡️ Secure Authentication
            </Text>
            <Text style={{ color: colors.textTertiary }}>•</Text>
            <Text style={[s.footerItem, { color: colors.textTertiary }]}>
              🛡️ GDPR Compliant
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (c: any) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bgSecondary },
    topBar: { flexDirection: "row", justifyContent: "flex-end", padding: 16 },
    scroll: { padding: 20, paddingTop: 0, flexGrow: 1 },
    logoSection: { alignItems: "center", marginBottom: 28 },
    logoBox: {
      width: 72,
      height: 72,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
    },
    appName: { fontSize: 26, fontWeight: "700", marginBottom: 4 },
    tagline: { fontSize: 14, textAlign: "center" },
    card: { borderWidth: 1, borderRadius: 20, padding: 22, marginBottom: 24 },
    fieldLabel: {
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 0.8,
      marginBottom: 8,
    },
    pwHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 16,
      marginBottom: 8,
    },
    forgotText: { fontSize: 13, fontWeight: "600" },
    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 14,
      height: 52,
      marginBottom: 4,
    },
    input: { flex: 1, fontSize: 14 },
    rememberRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginTop: 14,
      marginBottom: 20,
    },
    checkbox: {
      width: 20,
      height: 20,
      borderRadius: 5,
      borderWidth: 1.5,
      alignItems: "center",
      justifyContent: "center",
    },
    rememberText: { fontSize: 14 },
    loginBtn: {
      height: 54,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 24,
    },
    loginBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
    orRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 16,
    },
    divider: { flex: 1, height: 1 },
    orText: { fontSize: 11, fontWeight: "600", letterSpacing: 0.5 },
    socialRow: { flexDirection: "row", gap: 12 },
    socialBtn: {
      flex: 1,
      flexDirection: "row",
      borderWidth: 1,
      borderRadius: 12,
      height: 48,
      alignItems: "center",
      justifyContent: "center",
    },
    signupRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
    },
    signupLink: { fontWeight: "700", fontSize: 15 },
    footerRow: { flexDirection: "row", justifyContent: "center", gap: 12 },
    footerItem: { fontSize: 12 },
  });
