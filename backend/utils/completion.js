// backend/utils/completion.js
// ─────────────────────────────────────────────────────────────────────────────
// Resume COMPLETION % — "have you filled this section in at all?"
// This is intentionally separate from atsScore.js, which grades QUALITY
// (action verbs, quantified metrics, link presence). A resume can be 100%
// complete here while still scoring low on ATS quality, and vice versa.
//
// Weights mirror the section list on the Resume Hub screen (resume.tsx):
// Personal Info, Experience, Education, Skills, Projects, Certifications,
// Template chosen. Certifications/Projects are optional in real resumes,
// so they carry less weight than the core sections.
// ─────────────────────────────────────────────────────────────────────────────

const WEIGHTS = {
  personalInfo: 25, // core contact fields
  experience: 25, // at least one entry
  education: 20, // at least one entry
  skills: 15, // at least 3 skills
  projects: 5, // optional but nice to have
  certifications: 5, // optional
  template: 5, // user picked a template (not still default)
};

function calculateCompletion(resume) {
  let percent = 0;
  const sections = {};

  // ── Personal Information ──────────────────────────────────────────────
  // Counts as "filled" only once the core identity + contact fields exist —
  // matches what the Personal Information screen actually asks for.
  const pi = resume.personalInfo ?? {};
  const piFields = ["fullName", "email", "phone", "city", "summary"];
  const piFilled = piFields.filter(
    (f) => (pi[f] ?? "").toString().trim().length > 0,
  ).length;
  const piScore = Math.round(
    (piFilled / piFields.length) * WEIGHTS.personalInfo,
  );
  sections.personalInfo = piScore;
  percent += piScore;

  // ── Experience ───────────────────────────────────────────────────────
  const experience = resume.experience ?? [];
  sections.experience = experience.length > 0 ? WEIGHTS.experience : 0;
  percent += sections.experience;

  // ── Education ────────────────────────────────────────────────────────
  const education = resume.education ?? [];
  sections.education = education.length > 0 ? WEIGHTS.education : 0;
  percent += sections.education;

  // ── Skills ───────────────────────────────────────────────────────────
  const skills = resume.skills ?? [];
  let skillScore = 0;
  if (skills.length >= 1) skillScore = WEIGHTS.skills * 0.5;
  if (skills.length >= 3) skillScore = WEIGHTS.skills;
  sections.skills = Math.round(skillScore);
  percent += sections.skills;

  // ── Projects (optional) ──────────────────────────────────────────────
  const projects = resume.projects ?? [];
  sections.projects = projects.length > 0 ? WEIGHTS.projects : 0;
  percent += sections.projects;

  // ── Certifications (optional) ────────────────────────────────────────
  const certifications = resume.certifications ?? [];
  sections.certifications =
    certifications.length > 0 ? WEIGHTS.certifications : 0;
  percent += sections.certifications;

  // ── Template chosen ──────────────────────────────────────────────────
  // "simple-ats" is the schema default, so only count it once the user has
  // actually visited the Templates screen and saved a choice. If you'd
  // rather treat the default as a valid pick, just delete this block and
  // always award WEIGHTS.template.
  sections.template = resume.templateId ? WEIGHTS.template : 0;
  percent += sections.template;

  return {
    completionPercent: Math.min(Math.round(percent), 100),
    sections, // exposed in case you want a per-section breakdown bar later
  };
}

module.exports = { calculateCompletion };
