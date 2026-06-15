// app/signup.tsx  — Signup Screen
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

export default function SignupScreen() {
  const { colors, isDark } = useTheme();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const s = makeStyles(colors);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <View style={s.topBar}>
        <Text style={[s.logoLabel, { color: colors.textPrimary }]}>
          KarachiJobs
        </Text>
        <View style={s.topRight}>
          <TouchableOpacity onPress={() => router.push("/login")}>
            <Text style={[s.helpText, { color: colors.textSecondary }]}>
              Help Center
            </Text>
          </TouchableOpacity>
          <ThemeToggle />
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.scroll}
        >
          {/* Hero image placeholder */}
          <View style={[s.heroImg, { backgroundColor: colors.brand }]}>
            <Text style={s.heroEmoji}>🏙️</Text>
            <Text style={s.heroText}>Join Karachi's professional hub</Text>
          </View>

          <View style={s.formBlock}>
            <Text style={[s.heading, { color: colors.textPrimary }]}>
              Join the Network
            </Text>
            <Text style={[s.sub, { color: colors.textSecondary }]}>
              Connect with top employers in Karachi's professional hub.
            </Text>

            {/* Full Name */}
            <Text style={[s.label, { color: colors.textPrimary }]}>
              Full Name
            </Text>
            <View style={[s.inputRow, { borderColor: colors.border }]}>
              <Text style={{ marginRight: 10, color: colors.textTertiary }}>
                👤
              </Text>
              <TextInput
                style={[s.input, { color: colors.textPrimary }]}
                placeholder="Ali Ahmed"
                placeholderTextColor={colors.textTertiary}
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Email */}
            <Text style={[s.label, { color: colors.textPrimary }]}>
              Email Address
            </Text>
            <View style={[s.inputRow, { borderColor: colors.border }]}>
              <Text style={{ marginRight: 10, color: colors.textTertiary }}>
                ✉️
              </Text>
              <TextInput
                style={[s.input, { color: colors.textPrimary }]}
                placeholder="ali.ahmed@example.pk"
                placeholderTextColor={colors.textTertiary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Password */}
            <Text style={[s.label, { color: colors.textPrimary }]}>
              Password
            </Text>
            <View style={[s.inputRow, { borderColor: colors.border }]}>
              <Text style={{ marginRight: 10, color: colors.textTertiary }}>
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
                <Text style={{ color: colors.textTertiary }}>
                  {showPw ? "🙈" : "👁️"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Terms */}
            <TouchableOpacity
              style={s.termsRow}
              onPress={() => setAgreed(!agreed)}
            >
              <View
                style={[
                  s.checkbox,
                  {
                    borderColor: colors.border,
                    backgroundColor: agreed ? colors.brand : "transparent",
                  },
                ]}
              >
                {agreed && (
                  <Text style={{ color: "#fff", fontSize: 11 }}>✓</Text>
                )}
              </View>
              <Text style={[s.termsText, { color: colors.textSecondary }]}>
                By creating an account, I agree to KarachiJobs'{" "}
                <Text style={{ color: colors.brand, fontWeight: "600" }}>
                  Terms of Service
                </Text>{" "}
                and{" "}
                <Text style={{ color: colors.brand, fontWeight: "600" }}>
                  Privacy Policy
                </Text>
                .
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                s.createBtn,
                {
                  backgroundColor: colors.brandDark,
                  opacity: agreed ? 1 : 0.6,
                },
              ]}
              disabled={!agreed}
              onPress={() => router.replace("/")}
            >
              <Text style={s.createBtnText}>Create Account</Text>
            </TouchableOpacity>

            {/* Or divider */}
            <View style={s.orRow}>
              <View style={[s.divider, { backgroundColor: colors.border }]} />
              <Text style={[s.orText, { color: colors.textTertiary }]}>OR</Text>
              <View style={[s.divider, { backgroundColor: colors.border }]} />
            </View>

            <View style={s.socialRow}>
              <TouchableOpacity
                style={[s.socialBtn, { borderColor: colors.border }]}
              >
                <Text
                  style={{
                    fontWeight: "700",
                    marginRight: 8,
                    color: "#4285F4",
                  }}
                >
                  G
                </Text>
                <Text style={[{ color: colors.textPrimary }]}>Google</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.socialBtn, { borderColor: colors.border }]}
              >
                <Text
                  style={{
                    fontWeight: "700",
                    marginRight: 8,
                    color: "#0077B5",
                  }}
                >
                  in
                </Text>
                <Text style={[{ color: colors.textPrimary }]}>LinkedIn</Text>
              </TouchableOpacity>
            </View>

            <View style={s.loginRow}>
              <Text style={[{ color: colors.textSecondary }]}>
                Already have an account?{" "}
              </Text>
              <TouchableOpacity onPress={() => router.push("/login")}>
                <Text style={[{ color: colors.brand, fontWeight: "700" }]}>
                  Login here
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={[s.footer, { color: colors.textTertiary }]}>
            © 2024 KarachiJobs. All rights reserved.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (c: any) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bgSecondary },
    topBar: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    logoLabel: { fontSize: 17, fontWeight: "700" },
    topRight: { flexDirection: "row", alignItems: "center", gap: 12 },
    helpText: { fontSize: 14 },
    scroll: { paddingBottom: 40 },
    heroImg: {
      height: 180,
      alignItems: "center",
      justifyContent: "flex-end",
      paddingBottom: 20,
      marginHorizontal: 16,
      borderRadius: 20,
      marginBottom: 24,
    },
    heroEmoji: { fontSize: 40, marginBottom: 8 },
    heroText: { color: "#fff", fontSize: 15, fontWeight: "500" },
    formBlock: { paddingHorizontal: 20 },
    heading: { fontSize: 26, fontWeight: "700", marginBottom: 8 },
    sub: { fontSize: 14, marginBottom: 24, lineHeight: 20 },
    label: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 14,
      height: 52,
      marginBottom: 16,
    },
    input: { flex: 1, fontSize: 14 },
    termsRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
      marginBottom: 20,
    },
    checkbox: {
      width: 20,
      height: 20,
      borderRadius: 5,
      borderWidth: 1.5,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 2,
    },
    termsText: { flex: 1, fontSize: 13, lineHeight: 20 },
    createBtn: {
      height: 54,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 24,
    },
    createBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
    orRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 16,
    },
    divider: { flex: 1, height: 1 },
    orText: { fontSize: 13 },
    socialRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
    socialBtn: {
      flex: 1,
      flexDirection: "row",
      borderWidth: 1,
      borderRadius: 12,
      height: 48,
      alignItems: "center",
      justifyContent: "center",
    },
    loginRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    },
    footer: { textAlign: "center", fontSize: 12, marginTop: 32 },
  });
