// backend/utils/atsMatcher.js
// ─────────────────────────────────────────────────────────────────────────────
// Real-world ATS systems (Workday, Taleo, Greenhouse, iCIMS) score resumes
// against job postings using a combination of:
//   1. Keyword/skill overlap (exact + fuzzy matching against required skills)
//   2. Title/role similarity (parsed job titles vs resume experience titles)
//   3. Experience level matching (years required vs years on resume)
//   4. Location/work-mode compatibility
//   5. Education requirement matching
//
// ✅ FIXED: Added resume completeness penalty — sparse resumes no longer get
// 40%+ scores just from "neutral defaults." A resume with only personal info
// filled will score much lower, preventing false-positive matches.
// ─────────────────────────────────────────────────────────────────────────────

// ── Stopwords to strip before keyword extraction ──────────────────────────────
const STOPWORDS = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "but",
  "in",
  "on",
  "at",
  "to",
  "for",
  "of",
  "with",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "will",
  "would",
  "could",
  "should",
  "may",
  "might",
  "must",
  "can",
  "this",
  "that",
  "these",
  "those",
  "i",
  "you",
  "he",
  "she",
  "it",
  "we",
  "they",
  "as",
  "by",
  "from",
  "up",
  "about",
  "into",
  "through",
  "during",
  "before",
  "after",
  "experience",
  "years",
  "year",
  "strong",
  "good",
  "excellent",
  "ability",
  "skills",
]);

// ── Common skill synonyms — ATS systems normalize these before matching ───────
const SKILL_SYNONYMS = {
  js: "javascript",
  ts: "typescript",
  reactjs: "react",
  "react.js": "react",
  nodejs: "node",
  "node.js": "node",
  vuejs: "vue",
  "vue.js": "vue",
  py: "python",
  postgres: "postgresql",
  k8s: "kubernetes",
  ml: "machine learning",
  ai: "artificial intelligence",
  ui: "user interface",
  ux: "user experience",
  rn: "react native",
};

function normalizeTerm(term) {
  const lower = term.toLowerCase().trim();
  return SKILL_SYNONYMS[lower] ?? lower;
}

// ── Extract keywords from free text (job description, resume summary) ─────────
function extractKeywords(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s+#.]/g, " ") // keep + # . for C++, C#, Node.js
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 1 && !STOPWORDS.has(w))
    .map(normalizeTerm);
}

// ── Build a weighted keyword set from a job posting ───────────────────────────
function buildJobKeywordProfile(job) {
  const titleWords = extractKeywords(job.title ?? "");
  const tagWords = (job.tags ?? []).map(normalizeTerm);
  const descWords = extractKeywords(job.description ?? "");

  // Weight: explicit tags > title words > description words
  // (mirrors how real ATS weights "required skills" fields highest)
  return {
    tags: new Set(tagWords),
    title: new Set(titleWords),
    desc: new Set(descWords),
  };
}

// ── Build a weighted keyword set from a resume ────────────────────────────────
function buildResumeKeywordProfile(resume) {
  const skillWords = (resume.skills ?? []).map((s) => normalizeTerm(s.name));

  const expTitleWords = (resume.experience ?? []).flatMap((e) =>
    extractKeywords(e.jobTitle ?? ""),
  );

  const expDescWords = (resume.experience ?? []).flatMap((e) =>
    extractKeywords(e.description ?? ""),
  );

  const projectWords = (resume.projects ?? []).flatMap((p) => [
    ...(p.technologies ?? []).map(normalizeTerm),
    ...extractKeywords(p.description ?? ""),
  ]);

  const summaryWords = extractKeywords(resume.personalInfo?.summary ?? "");

  return {
    skills: new Set(skillWords),
    expTitle: new Set(expTitleWords),
    expDesc: new Set(expDescWords),
    projects: new Set(projectWords),
    summary: new Set(summaryWords),
  };
}

function setOverlap(setA, setB) {
  let count = 0;
  for (const item of setA) {
    if (setB.has(item)) count++;
  }
  return count;
}

function totalYearsExperience(resume) {
  const experience = resume.experience ?? [];
  let totalMonths = 0;
  for (const exp of experience) {
    const start = new Date(exp.startDate);
    const end = exp.isCurrent
      ? new Date()
      : new Date(exp.endDate ?? exp.startDate);
    const months = Math.max(
      0,
      (end.getFullYear() - start.getFullYear()) * 12 +
        (end.getMonth() - start.getMonth()),
    );
    totalMonths += months;
  }
  return Math.round(totalMonths / 12);
}

function inferRequiredYears(job) {
  const text =
    `${job.title ?? ""} ${job.experience ?? ""} ${job.description ?? ""}`.toLowerCase();
  const match = text.match(/(\d+)\+?\s*(?:years?|yrs?)/);
  if (match) return parseInt(match[1], 10);
  if (/senior|lead|principal|architect/i.test(text)) return 5;
  if (/junior|entry|fresh|intern|trainee/i.test(text)) return 0;
  return 2; // default mid-level assumption
}

// ✅ NEW: Calculate resume completeness (0-1) — penalizes sparse resumes
// A resume with only personal info filled = 1/6 completeness ≈ 0.17
// This gets squared/powered to penalize low completeness more
function calculateResumeCompleteness(resume) {
  let filledSections = 0;
  const totalSections = 6;

  if ((resume.personalInfo?.fullName ?? "").length > 2) filledSections++;
  if ((resume.experience ?? []).length > 0) filledSections++;
  if ((resume.education ?? []).length > 0) filledSections++;
  if ((resume.skills ?? []).length >= 3) filledSections++;
  if ((resume.projects ?? []).length > 0) filledSections++;
  if ((resume.certifications ?? []).length > 0) filledSections++;

  return filledSections / totalSections;
}

// ── Core scoring function — returns 0-100 ──────────────────────────────────────
function scoreResumeAgainstJob(resume, job) {
  const jobProfile = buildJobKeywordProfile(job);
  const resumeProfile = buildResumeKeywordProfile(resume);

  const breakdown = {};

  // ✅ Calculate penalty for sparse resume — if only 1/6 sections filled,
  // all scores are multiplied by (1/6)^1.5 ≈ 0.11, so 40% becomes ~4%.
  // This prevents empty resumes from matching at 40%+ just from defaults.
  const completeness = calculateResumeCompleteness(resume);
  const sparsenessPenalty = Math.pow(completeness, 1.5);

  // ── 1. Skill match against job's required tags (40% weight) ─────────────────
  // This is the single highest-weighted factor in real ATS systems —
  // recruiters configure "must-have" and "nice-to-have" skill lists.
  const allResumeTerms = new Set([
    ...resumeProfile.skills,
    ...resumeProfile.expTitle,
    ...resumeProfile.expDesc,
    ...resumeProfile.projects,
  ]);

  const tagMatches = setOverlap(jobProfile.tags, allResumeTerms);
  const tagScore =
    jobProfile.tags.size > 0 ? (tagMatches / jobProfile.tags.size) * 40 : 5; // ✅ FIXED: was 20, now 5 (neutral)
  breakdown.skillMatch = Math.round(tagScore * sparsenessPenalty);

  // ── 2. Title/role relevance (20% weight) ─────────────────────────────────────
  // Compares job title keywords against resume's past job titles —
  // mirrors "title matching" used by Workday/Taleo for role-fit scoring.
  const titleMatches = setOverlap(jobProfile.title, resumeProfile.expTitle);
  const titleScore =
    jobProfile.title.size > 0
      ? Math.min((titleMatches / jobProfile.title.size) * 20, 20)
      : 2; // ✅ FIXED: was 10, now 2 (neutral)
  breakdown.titleMatch = Math.round(titleScore * sparsenessPenalty);

  // ── 3. Description keyword density (15% weight) ──────────────────────────────
  // Broader text-similarity signal, similar to how ATS full-text indexes work.
  const descMatches = setOverlap(jobProfile.desc, allResumeTerms);
  const descScore =
    jobProfile.desc.size > 0
      ? Math.min((descMatches / jobProfile.desc.size) * 15, 15)
      : 0; // ✅ FIXED: was 7, now 0 (neutral — no content, no points)
  breakdown.contentMatch = Math.round(descScore * sparsenessPenalty);

  // ── 4. Experience level fit (15% weight) ──────────────────────────────────────
  const resumeYears = totalYearsExperience(resume);
  const requiredYears = inferRequiredYears(job);
  let expScore;
  if (resumeYears >= requiredYears) {
    expScore = 15; // meets or exceeds requirement
  } else if (resumeYears >= requiredYears - 1) {
    expScore = 10; // close enough — common ATS tolerance
  } else {
    expScore = Math.max(0, 15 - (requiredYears - resumeYears) * 4);
  }
  breakdown.experienceLevelMatch = Math.round(expScore * sparsenessPenalty);

  // ── 5. Location compatibility (10% weight) ────────────────────────────────────
  const resumeCity = (resume.personalInfo?.city ?? "").toLowerCase();
  const jobArea = (job.area ?? job.location ?? "").toLowerCase();
  const isRemote = job.isRemote || /remote/i.test(job.jobType ?? "");
  let locationScore;
  if (isRemote) locationScore = 10;
  else if (jobArea.includes(resumeCity) || resumeCity.includes(jobArea))
    locationScore = 10;
  else if (jobArea.includes("karachi") && resumeCity.includes("karachi"))
    locationScore = 8;
  else locationScore = 3;
  breakdown.locationMatch = Math.round(locationScore * sparsenessPenalty);

  const total = Math.min(
    Math.round(
      breakdown.skillMatch +
        breakdown.titleMatch +
        breakdown.contentMatch +
        breakdown.experienceLevelMatch +
        breakdown.locationMatch,
    ),
    99, // cap at 99 — 100% match feels untrustworthy to users, same as real ATS UX
  );

  return {
    score: total,
    breakdown,
    matchedSkills: [...jobProfile.tags].filter((t) => allResumeTerms.has(t)),
    missingSkills: [...jobProfile.tags].filter((t) => !allResumeTerms.has(t)),
    resumeYears,
    requiredYears,
    completeness, // ✅ NEW: expose completeness for debugging
  };
}

// ── Score a resume against ALL jobs in the DB, return ranked list ─────────────
async function matchResumeToJobs(resume, JobModel, options = {}) {
  const { limit = 10, minScore = 0 } = options;

  // Pull a reasonable pool — in production with 10k+ jobs you'd pre-filter
  // by category/location in the DB query before scoring, to avoid scoring
  // every single job on every request.
  const candidateJobs = await JobModel.find({
    isActive: true,
    expiresAt: { $gte: new Date() },
  })
    .limit(500)
    .lean();

  const scored = candidateJobs.map((job) => ({
    job,
    ...scoreResumeAgainstJob(resume, job),
  }));

  scored.sort((a, b) => b.score - a.score);

  return scored
    .filter((s) => s.score >= minScore)
    .slice(0, limit)
    .map((s) => ({
      jobId: s.job._id,
      title: s.job.title,
      company: s.job.company ?? s.job.company_name,
      companyLogo: s.job.companyLogo ?? "",
      matchPercent: s.score,
      matchedSkills: s.matchedSkills,
      missingSkills: s.missingSkills,
      jobType: s.job.jobType ?? s.job.job_type,
      workMode: s.job.isRemote ? "Remote" : (s.job.jobType ?? "On-site"),
      salaryMin:
        s.job.salaryMin ?? Math.round((s.job.salary_minimum ?? 0) / 1000),
      salaryMax:
        s.job.salaryMax ?? Math.round((s.job.salary_maximum ?? 0) / 1000),
      area: s.job.area ?? s.job.location ?? "Karachi",
      breakdown: s.breakdown,
    }));
}

module.exports = {
  scoreResumeAgainstJob,
  matchResumeToJobs,
  extractKeywords,
  totalYearsExperience,
  calculateResumeCompleteness, // ✅ Export for testing/debugging
};
