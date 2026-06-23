// app/resume/preview.tsx — Resume Preview + PDF Export + Share
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import { fetchAtsScore, fetchResume } from "../../services/resumeService";
import { Resume } from "../../types/resume";

// Install: npx expo install expo-print expo-sharing expo-file-system
let Print: any = null;
let Sharing: any = null;
let FileSystem: any = null;
try {
  Print = require("expo-print");
} catch {}
try {
  Sharing = require("expo-sharing");
} catch {}
try {
  FileSystem = require("expo-file-system/legacy");
} catch {}

function fmtDate(d: string | null): string {
  return d
    ? new Date(d).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "Present";
}

// ── HTML resume builder ───────────────────────────────────────────────────────
function buildResumeHTML(resume: Resume, template: string): string {
  const p = resume.personalInfo;
  const accentColor =
    template === "modern"
      ? "#0F3D35"
      : template === "minimal"
        ? "#1D9E75"
        : "#145244";

  const experienceHTML = resume.experience
    .map(
      (exp) => `
    <div class="exp-block">
      <div class="exp-header">
        <strong>${exp.jobTitle}</strong>
        <span class="date">${fmtDate(exp.startDate)} — ${exp.isCurrent ? "Present" : fmtDate(exp.endDate ?? null)}</span>
      </div>
      <div class="company" style="color:${accentColor}">${exp.companyName}${exp.location ? `, ${exp.location.split(",")[0]}` : ""}</div>
      ${(exp.bullets?.length ? exp.bullets : [exp.description]).map((b) => `<div class="bullet">• ${b}</div>`).join("")}
    </div>`,
    )
    .join("");

  const skillsHTML = resume.skills
    .map((s) => `<span class="skill-chip">${s.name}</span>`)
    .join("");
  const educationHTML = resume.education
    .map(
      (edu) => `
    <div class="exp-block">
      <div class="exp-header">
        <strong>${edu.degree}</strong>
        <span class="date">${new Date(edu.startDate).getFullYear()} — ${edu.isCurrent ? "Present" : edu.endDate ? new Date(edu.endDate).getFullYear() : ""}</span>
      </div>
      <div class="company" style="color:${accentColor}">${edu.institution}${edu.city ? `, ${edu.city}` : ""}</div>
      ${edu.grade ? `<div class="bullet">Grade: ${edu.grade}</div>` : ""}
    </div>`,
    )
    .join("");

  const projectsHTML = resume.projects
    .slice(0, 3)
    .map(
      (proj) => `
    <div class="exp-block">
      <div class="exp-header">
        <strong>${proj.name}</strong>
        ${proj.role ? `<span class="company" style="color:${accentColor}">${proj.role}</span>` : ""}
      </div>
      ${proj.description ? `<div class="bullet">${proj.description}</div>` : ""}
      ${proj.technologies?.length ? `<div class="tech-row">${proj.technologies.map((t) => `<span class="skill-chip">${t}</span>`).join("")}</div>` : ""}
    </div>`,
    )
    .join("");

  const certHTML = resume.certifications
    .map(
      (cert) => `
    <div class="exp-block">
      <div class="exp-header">
        <strong>${cert.name}</strong>
        <span class="date">Issued ${fmtDate(cert.dateIssued)}</span>
      </div>
      <div class="company" style="color:${accentColor}">${cert.issuer}</div>
    </div>`,
    )
    .join("");

  const modernSidebar =
    template === "modern"
      ? `
    <div class="sidebar" style="background:${accentColor}">
      <div class="sidebar-avatar"></div>
      <div class="sidebar-name">${p.fullName ?? ""}</div>
      <div class="sidebar-section">CONTACT</div>
      ${p.email ? `<div class="sidebar-item">✉ ${p.email}</div>` : ""}
      ${p.phone ? `<div class="sidebar-item">📞 ${p.phone}</div>` : ""}
      ${p.city ? `<div class="sidebar-item">📍 ${p.city}, ${p.country ?? "Pakistan"}</div>` : ""}
      ${p.linkedinUrl ? `<div class="sidebar-item">🔗 ${p.linkedinUrl}</div>` : ""}
      ${resume.skills.length ? `<div class="sidebar-section">SKILLS</div>${resume.skills.map((s) => `<div class="sidebar-item">• ${s.name}</div>`).join("")}` : ""}
    </div>`
      : "";

  const headerStyle =
    template === "minimal"
      ? `background:${accentColor}; color:white; padding:24px 30px; margin:-20px -20px 20px;`
      : "margin-bottom:16px; border-bottom:2px solid #E5E7EB; padding-bottom:12px;";

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 11pt; color: #111827; background: white; }
  .container { display:flex; min-height:100vh; }
  .sidebar { width:200px; min-height:100vh; padding:24px 16px; color:white; flex-shrink:0; }
  .sidebar-avatar { width:60px; height:60px; border-radius:50%; background:rgba(255,255,255,0.3); margin:0 auto 12px; }
  .sidebar-name { color:white; font-size:13pt; font-weight:800; text-align:center; margin-bottom:16px; }
  .sidebar-section { color:rgba(255,255,255,0.7); font-size:8pt; font-weight:700; letter-spacing:1px; margin:12px 0 6px; border-bottom:1px solid rgba(255,255,255,0.2); padding-bottom:4px; }
  .sidebar-item { color:rgba(255,255,255,0.9); font-size:9pt; margin-bottom:4px; }
  .main { flex:1; padding:20px; }
  .name-block { ${headerStyle} }
  .doc-name { font-size:${template === "minimal" ? "20" : "18"}pt; font-weight:800; letter-spacing:1px; color:${template === "minimal" ? "white" : "#111827"}; text-transform:uppercase; }
  .doc-title { font-size:11pt; font-weight:600; color:${template === "minimal" ? "rgba(255,255,255,0.9)" : accentColor}; margin-top:4px; }
  .contact-row { display:flex; flex-wrap:wrap; gap:12px; margin-top:${template === "minimal" ? "8px" : "10px"}; font-size:9pt; color:${template === "minimal" ? "rgba(255,255,255,0.85)" : "#4B5563"}; }
  .section-title { font-size:9pt; font-weight:800; letter-spacing:1.2px; color:${template === "minimal" ? accentColor : "#111827"}; text-transform:uppercase; margin:18px 0 8px; border-bottom:${template === "simple-ats" ? "1px solid #E5E7EB" : "none"}; padding-bottom:4px; }
  .exp-block { margin-bottom:12px; }
  .exp-header { display:flex; justify-content:space-between; align-items:baseline; }
  .exp-header strong { font-size:11pt; font-weight:700; }
  .date { font-size:9pt; color:#6B7280; white-space:nowrap; }
  .company { font-size:10pt; font-weight:600; margin:2px 0 4px; }
  .bullet { font-size:9.5pt; color:#374151; padding-left:12px; margin-bottom:3px; line-height:1.5; }
  .skills-row { display:flex; flex-wrap:wrap; gap:6px; }
  .skill-chip { background:#E1F5EE; color:#145244; font-size:8.5pt; font-weight:600; padding:3px 10px; border-radius:20px; }
  .tech-row { display:flex; flex-wrap:wrap; gap:4px; margin-top:4px; }
  .summary { font-size:10pt; color:#374151; line-height:1.7; }
</style></head><body>
<div class="container">
  ${modernSidebar}
  <div class="main">
    ${
      template !== "modern"
        ? `
    <div class="name-block">
      <div class="doc-name">${p.fullName ?? "YOUR NAME"}</div>
      <div class="doc-title">${resume.experience[0]?.jobTitle ?? ""}</div>
      <div class="contact-row">
        ${p.email ? `<span>✉ ${p.email}</span>` : ""}
        ${p.phone ? `<span>📞 ${p.phone}</span>` : ""}
        ${p.city ? `<span>📍 ${p.city}, ${p.country ?? "Pakistan"}</span>` : ""}
        ${p.linkedinUrl ? `<span>🔗 ${p.linkedinUrl}</span>` : ""}
      </div>
    </div>`
        : ""
    }
    ${p.summary ? `<div class="section-title">Professional Summary</div><div class="summary">${p.summary}</div>` : ""}
    ${resume.experience.length ? `<div class="section-title">Work Experience</div>${experienceHTML}` : ""}
    ${template !== "modern" && resume.skills.length ? `<div class="section-title">Technical Skills</div><div class="skills-row">${skillsHTML}</div>` : ""}
    ${resume.projects.length ? `<div class="section-title">Key Projects</div>${projectsHTML}` : ""}
    ${resume.education.length ? `<div class="section-title">Education</div>${educationHTML}` : ""}
    ${resume.certifications.length ? `<div class="section-title">Certifications</div>${certHTML}` : ""}
  </div>
</div></body></html>`;
}

// ── Screen ────────────────────────────────────────────────────────────────────
export default function ResumePreviewScreen() {
  const { colors } = useTheme();
  const [resume, setResume] = useState<Resume | null>(null);
  const [atsScore, setAtsScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    Promise.all([fetchResume(), fetchAtsScore()])
      .then(([r, ats]) => {
        setResume(r);
        setAtsScore(ats.total);
      })
      .catch((e) => Alert.alert("Error", e.message))
      .finally(() => setLoading(false));
  }, []);

  const requirePrint = (): boolean => {
    if (!Print) {
      Alert.alert(
        "Install Required",
        "Run this in your project terminal:\n\nnpx expo install expo-print expo-sharing expo-file-system\n\nThen restart the app.",
        [{ text: "OK" }],
      );
      return false;
    }
    return true;
  };

  // ── DOWNLOAD — saves PDF to device, does NOT open share sheet ──────────────
  const handleDownload = async () => {
    if (!requirePrint() || !resume) return;
    setExporting(true);
    try {
      const html = buildResumeHTML(resume, resume.templateId ?? "simple-ats");

      if (Platform.OS === "ios") {
        // iOS: native Print dialog → user taps "Save to Files" to save locally
        await Print.printAsync({ html });
      } else {
        // Android: write PDF to documentDirectory, notify user
        const { uri } = await Print.printToFileAsync({ html, base64: false });
        const safeName = (resume.personalInfo.fullName ?? "Resume").replace(
          /\s+/g,
          "_",
        );
        const fileName = `${safeName}_Resume.pdf`;
        const destUri = FileSystem
          ? `${FileSystem.documentDirectory}${fileName}`
          : uri;

        if (FileSystem && destUri !== uri) {
          await FileSystem.copyAsync({ from: uri, to: destUri });
        }

        Alert.alert(
          "✅ PDF Saved",
          `File: ${fileName}\n\nTap "Open & Share" to view or send it.`,
          [
            {
              text: "Open & Share",
              onPress: async () => {
                if (Sharing) {
                  await Sharing.shareAsync(destUri, {
                    mimeType: "application/pdf",
                    dialogTitle: "Open PDF with…",
                    UTI: "com.adobe.pdf",
                  });
                }
              },
            },
            { text: "OK", style: "cancel" },
          ],
        );
      }
    } catch (e: any) {
      Alert.alert("Download Error", e.message);
    } finally {
      setExporting(false);
    }
  };

  // ── SHARE — generates PDF and opens OS share sheet (WhatsApp, Gmail, etc.) ─
  const handleShare = async () => {
    if (!requirePrint() || !resume) return;
    setExporting(true);
    try {
      const html = buildResumeHTML(resume, resume.templateId ?? "simple-ats");
      const { uri } = await Print.printToFileAsync({ html, base64: false });
      const isAvailable = Sharing ? await Sharing.isAvailableAsync() : false;

      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: `Share ${resume.personalInfo.fullName ?? "Resume"}'s Resume`,
          UTI: "com.adobe.pdf",
        });
      } else {
        // Fallback: share as plain text summary via RN's built-in Share
        const { Share } = require("react-native");
        await Share.share({
          title: `${resume.personalInfo.fullName ?? "My"} Resume`,
          message: `📄 ${resume.personalInfo.fullName ?? "My Resume"}\n🔧 ${resume.experience[0]?.jobTitle ?? ""}\n✉️ ${resume.personalInfo.email ?? ""}\n📍 ${resume.personalInfo.city ?? "Karachi"}, Pakistan\n\nBuilt with KarachiJobs`,
        });
      }
    } catch (e: any) {
      Alert.alert("Share Error", e.message);
    } finally {
      setExporting(false);
    }
  };

  const s = makeStyles(colors);

  if (loading || !resume) {
    return (
      <SafeAreaView style={s.safe} edges={["top"]}>
        <View style={s.loadingBox}>
          <Text style={{ color: colors.textSecondary }}>Loading resume…</Text>
        </View>
      </SafeAreaView>
    );
  }

  const {
    personalInfo: p,
    experience = [],
    skills = [],
    projects = [],
    education = [],
    certifications = [],
  } = resume;

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: colors.textPrimary }]}>
          Resume Preview
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/resume/templates" as any)}
        >
          <Text
            style={[{ color: colors.brand, fontSize: 13, fontWeight: "600" }]}
          >
            Change
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        {/* ATS Score */}
        <View style={[s.atsBanner, { backgroundColor: colors.brandLight }]}>
          <Text style={s.atsCheck}>✓</Text>
          <View style={{ flex: 1 }}>
            <Text style={[s.atsScore, { color: colors.textPrimary }]}>
              ATS Score: {atsScore}/100
            </Text>
            <Text style={[s.atsSub, { color: colors.textSecondary }]}>
              {atsScore >= 75
                ? "Optimised for Karachi's top tech firms."
                : atsScore >= 50
                  ? "Good — add more skills to improve."
                  : "Add experience and skills to boost your score."}
            </Text>
          </View>
        </View>

        {/* Resume document */}
        <View style={[s.doc, { backgroundColor: colors.bgCard }]}>
          <Text style={[s.docName, { color: colors.textPrimary }]}>
            {p.fullName?.toUpperCase() || "YOUR NAME"}
          </Text>
          {experience[0] && (
            <Text style={[s.docJobTitle, { color: colors.brand }]}>
              {experience[0].jobTitle}
            </Text>
          )}

          <View style={s.contactRow}>
            {p.email && (
              <Text style={[s.contact, { color: colors.textSecondary }]}>
                ✉️ {p.email}
              </Text>
            )}
            {p.phone && (
              <Text style={[s.contact, { color: colors.textSecondary }]}>
                📞 {p.phone}
              </Text>
            )}
            {p.city && (
              <Text style={[s.contact, { color: colors.textSecondary }]}>
                📍 {p.city}, {p.country ?? "Pakistan"}
              </Text>
            )}
            {p.linkedinUrl && (
              <Text style={[s.contact, { color: colors.textSecondary }]}>
                🔗 {p.linkedinUrl}
              </Text>
            )}
          </View>

          <View style={[s.divider, { backgroundColor: colors.border }]} />

          {p.summary ? (
            <>
              <Text style={[s.secTitle, { color: colors.textPrimary }]}>
                PROFESSIONAL SUMMARY
              </Text>
              <Text style={[s.body, { color: colors.textSecondary }]}>
                {p.summary}
              </Text>
            </>
          ) : null}

          {experience.length > 0 && (
            <>
              <Text style={[s.secTitle, { color: colors.textPrimary }]}>
                WORK EXPERIENCE
              </Text>
              {experience.map((exp) => (
                <View key={exp._id} style={s.expBlock}>
                  <View style={s.expRow}>
                    <Text style={[s.expTitle, { color: colors.textPrimary }]}>
                      {exp.jobTitle}
                    </Text>
                    <Text style={[s.expDate, { color: colors.textTertiary }]}>
                      {fmtDate(exp.startDate)} —{" "}
                      {exp.isCurrent ? "Present" : fmtDate(exp.endDate ?? null)}
                    </Text>
                  </View>
                  <Text style={[s.expCompany, { color: colors.brand }]}>
                    {exp.companyName}
                    {exp.location ? `, ${exp.location.split(",")[0]}` : ""}
                  </Text>
                  {(exp.bullets?.length ? exp.bullets : [exp.description]).map(
                    (b, i) => (
                      <Text
                        key={i}
                        style={[s.bullet, { color: colors.textSecondary }]}
                      >
                        • {b}
                      </Text>
                    ),
                  )}
                </View>
              ))}
            </>
          )}

          {skills.length > 0 && (
            <>
              <Text style={[s.secTitle, { color: colors.textPrimary }]}>
                TECHNICAL SKILLS
              </Text>
              <View style={s.chipsWrap}>
                {skills.map((sk) => (
                  <View
                    key={sk._id}
                    style={[s.chip, { backgroundColor: colors.bgTertiary }]}
                  >
                    <Text style={[s.chipText, { color: colors.textPrimary }]}>
                      {sk.name}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {projects.length > 0 && (
            <>
              <Text style={[s.secTitle, { color: colors.textPrimary }]}>
                KEY PROJECTS
              </Text>
              {projects.slice(0, 3).map((proj) => (
                <View
                  key={proj._id}
                  style={[s.projBox, { backgroundColor: colors.bgTertiary }]}
                >
                  <Text style={[s.projName, { color: colors.textPrimary }]}>
                    {proj.name}
                  </Text>
                  {proj.description ? (
                    <Text
                      style={[s.body, { color: colors.textSecondary }]}
                      numberOfLines={2}
                    >
                      {proj.description}
                    </Text>
                  ) : null}
                  {(proj.technologies?.length ?? 0) > 0 && (
                    <View style={[s.chipsWrap, { marginTop: 6 }]}>
                      {proj.technologies.map((t) => (
                        <View
                          key={t}
                          style={[
                            s.chip,
                            { backgroundColor: colors.brandLight },
                          ]}
                        >
                          <Text style={[s.chipText, { color: colors.brand }]}>
                            {t}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </>
          )}

          {education.length > 0 && (
            <>
              <Text style={[s.secTitle, { color: colors.textPrimary }]}>
                EDUCATION
              </Text>
              {education.map((edu) => (
                <View key={edu._id} style={s.expBlock}>
                  <View style={s.expRow}>
                    <Text style={[s.expTitle, { color: colors.textPrimary }]}>
                      {edu.degree}
                    </Text>
                    <Text style={[s.expDate, { color: colors.textTertiary }]}>
                      {new Date(edu.startDate).getFullYear()} —{" "}
                      {edu.isCurrent
                        ? "Present"
                        : edu.endDate
                          ? new Date(edu.endDate).getFullYear()
                          : ""}
                    </Text>
                  </View>
                  <Text style={[s.expCompany, { color: colors.brand }]}>
                    {edu.institution}
                    {edu.city ? `, ${edu.city}` : ""}
                  </Text>
                  {edu.grade ? (
                    <Text style={[s.bullet, { color: colors.textSecondary }]}>
                      Grade: {edu.grade}
                    </Text>
                  ) : null}
                </View>
              ))}
            </>
          )}

          {certifications.length > 0 && (
            <>
              <Text style={[s.secTitle, { color: colors.textPrimary }]}>
                CERTIFICATIONS
              </Text>
              {certifications.map((cert) => (
                <View key={cert._id} style={s.expBlock}>
                  <View style={s.expRow}>
                    <Text style={[s.expTitle, { color: colors.textPrimary }]}>
                      {cert.name}
                    </Text>
                    <Text style={[s.expDate, { color: colors.textTertiary }]}>
                      Issued {fmtDate(cert.dateIssued)}
                    </Text>
                  </View>
                  <Text style={[s.expCompany, { color: colors.brand }]}>
                    {cert.issuer}
                  </Text>
                </View>
              ))}
            </>
          )}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Footer — 3 distinct action buttons */}
      <View
        style={[
          s.footer,
          { backgroundColor: colors.bgPrimary, borderTopColor: colors.border },
        ]}
      >
        <TouchableOpacity
          style={[s.outlineBtn, { borderColor: colors.border }]}
          onPress={() => router.push("/resume/personal-info" as any)}
        >
          <Text style={[s.outlineBtnText, { color: colors.textPrimary }]}>
            ✏️ Edit
          </Text>
        </TouchableOpacity>

        {/* DOWNLOAD — saves PDF locally, no share sheet */}
        <TouchableOpacity
          style={[
            s.solidBtn,
            { backgroundColor: "#2563EB", opacity: exporting ? 0.6 : 1 },
          ]}
          onPress={handleDownload}
          disabled={exporting}
        >
          <Text style={s.solidBtnText}>
            {exporting ? "Saving…" : "⬇️ Download"}
          </Text>
        </TouchableOpacity>

        {/* SHARE — opens OS share sheet with PDF */}
        <TouchableOpacity
          style={[
            s.solidBtn,
            { backgroundColor: colors.success, opacity: exporting ? 0.6 : 1 },
          ]}
          onPress={handleShare}
          disabled={exporting}
        >
          <Text style={s.solidBtnText}>🔗 Share PDF</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (c: any) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bgSecondary },
    loadingBox: { flex: 1, alignItems: "center", justifyContent: "center" },
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
    headerTitle: { fontSize: 17, fontWeight: "700" },
    scroll: { padding: 16 },
    atsBanner: {
      flexDirection: "row",
      gap: 12,
      borderRadius: 14,
      padding: 16,
      marginBottom: 16,
      alignItems: "center",
    },
    atsCheck: { fontSize: 22, color: "#22C55E" },
    atsScore: { fontSize: 15, fontWeight: "700" },
    atsSub: { fontSize: 12, marginTop: 2 },
    doc: { borderRadius: 16, padding: 20 },
    docName: {
      fontSize: 20,
      fontWeight: "800",
      letterSpacing: 0.5,
      marginBottom: 4,
    },
    docJobTitle: { fontSize: 13, fontWeight: "600", marginBottom: 12 },
    contactRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      marginBottom: 14,
    },
    contact: { fontSize: 11 },
    divider: { height: 1, marginBottom: 16 },
    secTitle: {
      fontSize: 11,
      fontWeight: "800",
      letterSpacing: 0.8,
      marginBottom: 10,
      marginTop: 16,
    },
    body: { fontSize: 12, lineHeight: 19, marginBottom: 8 },
    expBlock: { marginBottom: 14 },
    expRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "baseline",
    },
    expTitle: { fontSize: 13, fontWeight: "700", flex: 1 },
    expDate: { fontSize: 10, marginLeft: 8 },
    expCompany: { fontSize: 11, fontWeight: "600", marginBottom: 4 },
    bullet: { fontSize: 11, lineHeight: 18 },
    chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
    chip: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
    chipText: { fontSize: 11, fontWeight: "600" },
    projBox: { borderRadius: 10, padding: 12, marginBottom: 10 },
    projName: { fontSize: 13, fontWeight: "700", marginBottom: 4 },
    footer: { flexDirection: "row", gap: 8, padding: 14, borderTopWidth: 1 },
    outlineBtn: {
      flex: 1,
      borderWidth: 1,
      borderRadius: 12,
      height: 48,
      alignItems: "center",
      justifyContent: "center",
    },
    outlineBtnText: { fontSize: 12, fontWeight: "600" },
    solidBtn: {
      flex: 1.2,
      borderRadius: 12,
      height: 48,
      alignItems: "center",
      justifyContent: "center",
    },
    solidBtnText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  });
