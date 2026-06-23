// backend/utils/completion.js
// ─────────────────────────────────────────────────────────────────────────────
// Resume COMPLETION % — tracks whether each section has been filled in.
// Called as a virtual on the Resume model (always live) and also by the
// GET /api/resume endpoint so the frontend progress bar is always accurate.
//
// Weights (total = 100):
//   Personal Info  25 — proportional to how many of the 5 core fields are filled
//   Experience     25 — at least 1 entry
//   Education      20 — at least 1 entry
//   Skills         15 — at least 3 skills
//   Projects        5 — at least 1 project
//   Certifications  5 — at least 1 certification
//   Template        5 — user explicitly selected a template (not the default "")
// ─────────────────────────────────────────────────────────────────────────────

const WEIGHTS = {
  personalInfo: 25,
  experience: 25,
  education: 20,
  skills: 15,
  projects: 5,
  certifications: 5,
  template: 5,
};

function calculateCompletion(resume) {
  let percent = 0;
  const sections = {};

  // ── Personal Information ──────────────────────────────────────────────────
  // Score is proportional — each filled field adds (25 / 5) = 5 points
  const pi = resume.personalInfo ?? {};
  const coreFields = ["fullName", "email", "phone", "city", "summary"];
  const filled = coreFields.filter(
    (f) => (pi[f] ?? "").toString().trim().length > 0,
  ).length;
  sections.personalInfo = Math.round(
    (filled / coreFields.length) * WEIGHTS.personalInfo,
  );
  percent += sections.personalInfo;

  // ── Experience ────────────────────────────────────────────────────────────
  const experience = resume.experience ?? [];
  sections.experience = experience.length >= 1 ? WEIGHTS.experience : 0;
  percent += sections.experience;

  // ── Education ─────────────────────────────────────────────────────────────
  const education = resume.education ?? [];
  sections.education = education.length >= 1 ? WEIGHTS.education : 0;
  percent += sections.education;

  // ── Skills ────────────────────────────────────────────────────────────────
  // Partial credit: 1-2 skills = half marks, 3+ = full marks
  const skills = resume.skills ?? [];
  if (skills.length >= 3) sections.skills = WEIGHTS.skills;
  else if (skills.length >= 1)
    sections.skills = Math.round(WEIGHTS.skills * 0.5);
  else sections.skills = 0;
  percent += sections.skills;

  // ── Projects ──────────────────────────────────────────────────────────────
  const projects = resume.projects ?? [];
  sections.projects = projects.length >= 1 ? WEIGHTS.projects : 0;
  percent += sections.projects;

  // ── Certifications ────────────────────────────────────────────────────────
  const certifications = resume.certifications ?? [];
  sections.certifications =
    certifications.length >= 1 ? WEIGHTS.certifications : 0;
  percent += sections.certifications;

  // ── Template ──────────────────────────────────────────────────────────────
  // ✅ FIX: templateId defaults to "" in the schema (not "simple-ats")
  // so this correctly returns 0 until the user visits Templates and saves.
  // "simple-ats" is only set when the user explicitly selects it.
  const hasChosen = resume.templateId && resume.templateId.trim().length > 0;
  sections.template = hasChosen ? WEIGHTS.template : 0;
  percent += sections.template;

  return {
    completionPercent: Math.min(Math.round(percent), 100),
    sections, // per-section breakdown — useful for a future progress detail screen
    missing: Object.entries(sections)
      .filter(([, v]) => v === 0)
      .map(([k]) => k), // list of incomplete section names
  };
}

module.exports = { calculateCompletion };
