// backend/utils/atsScore.js
// ─────────────────────────────────────────────────────────────────────────────
// Simple rule-based ATS (Applicant Tracking System) score calculator.
// Real ATS tools use NLP; this gives a reasonable approximation using
// keyword density, section completeness, and formatting checks.
// ─────────────────────────────────────────────────────────────────────────────

const ACTION_VERBS = [
  "led",
  "developed",
  "built",
  "designed",
  "implemented",
  "managed",
  "optimized",
  "reduced",
  "increased",
  "improved",
  "created",
  "launched",
  "architected",
  "delivered",
  "collaborated",
  "mentored",
  "automated",
];

function calculateAtsScore(resume) {
  let score = 0;
  const breakdown = {};

  // ── Contact info completeness (15 pts) ──────────────────────────────────
  const { personalInfo } = resume;
  let contactScore = 0;
  if (personalInfo?.fullName) contactScore += 4;
  if (personalInfo?.email) contactScore += 4;
  if (personalInfo?.phone) contactScore += 4;
  if (personalInfo?.city) contactScore += 3;
  breakdown.contactInfo = contactScore;
  score += contactScore;

  // ── Professional summary quality (15 pts) ───────────────────────────────
  const summary = personalInfo?.summary ?? "";
  let summaryScore = 0;
  if (summary.length >= 100) summaryScore += 8;
  if (summary.length >= 200) summaryScore += 4;
  // Bonus for quantifiable claims (numbers, %, years)
  if (/\d+(\+|%|\syears?)/i.test(summary)) summaryScore += 3;
  breakdown.summary = Math.min(summaryScore, 15);
  score += breakdown.summary;

  // ── Work experience (25 pts) ────────────────────────────────────────────
  let expScore = 0;
  const experience = resume.experience ?? [];
  if (experience.length >= 1) expScore += 8;
  if (experience.length >= 2) expScore += 4;

  // Check for action verbs and quantified achievements in descriptions
  const allDescriptions = experience
    .map((e) => e.description ?? "")
    .join(" ")
    .toLowerCase();
  const verbsFound = ACTION_VERBS.filter((v) =>
    allDescriptions.includes(v),
  ).length;
  expScore += Math.min(verbsFound * 1.5, 8);

  const hasMetrics = /\d+(\+|%|x\b)/i.test(allDescriptions);
  if (hasMetrics) expScore += 5;

  breakdown.experience = Math.min(Math.round(expScore), 25);
  score += breakdown.experience;

  // ── Skills (15 pts) ──────────────────────────────────────────────────────
  const skills = resume.skills ?? [];
  let skillScore = 0;
  if (skills.length >= 3) skillScore += 6;
  if (skills.length >= 5) skillScore += 5;
  if (skills.length >= 8) skillScore += 4;
  breakdown.skills = Math.min(skillScore, 15);
  score += breakdown.skills;

  // ── Education (10 pts) ───────────────────────────────────────────────────
  const education = resume.education ?? [];
  breakdown.education = education.length > 0 ? 10 : 0;
  score += breakdown.education;

  // ── Projects (10 pts) ────────────────────────────────────────────────────
  const projects = resume.projects ?? [];
  let projScore = 0;
  if (projects.length >= 1) projScore += 5;
  if (projects.length >= 2) projScore += 3;
  if (projects.some((p) => p.projectUrl)) projScore += 2;
  breakdown.projects = Math.min(projScore, 10);
  score += breakdown.projects;

  // ── Certifications (5 pts) ───────────────────────────────────────────────
  breakdown.certifications = (resume.certifications?.length ?? 0) > 0 ? 5 : 0;
  score += breakdown.certifications;

  // ── Links/URLs present (5 pts) ───────────────────────────────────────────
  let linkScore = 0;
  if (personalInfo?.linkedinUrl) linkScore += 3;
  if (personalInfo?.portfolioUrl) linkScore += 2;
  breakdown.links = linkScore;
  score += linkScore;

  return {
    total: Math.min(Math.round(score), 100),
    breakdown,
    suggestions: generateSuggestions(breakdown, resume),
  };
}

function generateSuggestions(breakdown, resume) {
  const tips = [];
  if (breakdown.summary < 10)
    tips.push(
      "Expand your professional summary to 150-300 characters with quantifiable achievements.",
    );
  if (breakdown.experience < 18)
    tips.push(
      "Use more action verbs (Led, Developed, Optimized) and include measurable results (%, numbers).",
    );
  if (breakdown.skills < 10)
    tips.push(
      "Add at least 5 relevant skills to improve recruiter visibility by up to 40%.",
    );
  if (breakdown.projects < 5)
    tips.push(
      "Add 1-2 projects with live links to demonstrate hands-on experience.",
    );
  if (breakdown.links < 5)
    tips.push(
      "Add your LinkedIn profile URL — most recruiters check it first.",
    );
  if ((resume.certifications?.length ?? 0) === 0)
    tips.push(
      "Certifications boost credibility — even free ones from Coursera or freeCodeCamp help.",
    );
  return tips;
}

module.exports = { calculateAtsScore };
