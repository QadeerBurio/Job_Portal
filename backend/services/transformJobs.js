function transformJobs(rawJobs = []) {
  return rawJobs.map((job) => ({
    title: job.title || "",

    company: job.company_name || "",

    companyUrl: job.company_url || "",

    applyUrl: job.apply_url || "",

    location: job.location || "Karachi",

    // Extract DHA, Clifton, Gulshan etc.
    area: job.location ? extractArea(job.location) : "Karachi",

    // Store actual salary values
    salaryMin: Number(job.salary_minimum) || 0,

    salaryMax: Number(job.salary_maximum) || 0,

    jobType: job.job_type || "Full-time",

    category: detectCategory(job),

    isInternship: isInternship(job),

    isTrainee: isTrainee(job),

    description: job.description || "",

    requirements: [],

    responsibilities: [],

    tags: extractTags(job.skills),

    experience: job.experience_range || "Not Specified",

    isRemote: job.is_remote || false,

    easyApply: job.easy_apply || false,

    postedAt: job.posted_date ? new Date(job.posted_date) : new Date(),

    expiresAt: job.valid_through
      ? new Date(job.valid_through)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),

    isActive: true,

    views: 0,

    applications: job.applicant_count || 0,

    source: job.platform || "apify",
  }));
}

// ────────────────────────────────────────────
// Tags
// ────────────────────────────────────────────

function extractTags(skills) {
  if (!skills) return [];

  return skills
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

// ────────────────────────────────────────────
// Internship / Trainee Detection
// ────────────────────────────────────────────

function isInternship(job) {
  const text = `${job.title} ${job.job_type}`.toLowerCase();

  return text.includes("intern");
}

function isTrainee(job) {
  const text = `${job.title} ${job.job_type}`.toLowerCase();

  return text.includes("trainee");
}

// ────────────────────────────────────────────
// Category Detection
// ────────────────────────────────────────────

function detectCategory(job) {
  const text = `${job.title} ${job.skills} ${job.description}`.toLowerCase();

  // IT / Software
  if (
    text.includes("react") ||
    text.includes("react native") ||
    text.includes("flutter") ||
    text.includes("software") ||
    text.includes("developer") ||
    text.includes("engineer") ||
    text.includes("mern") ||
    text.includes("api") ||
    text.includes("full stack") ||
    text.includes("frontend") ||
    text.includes("backend")
  ) {
    return "IT";
  }

  // AI / Data
  if (
    text.includes("ai") ||
    text.includes("artificial intelligence") ||
    text.includes("machine learning") ||
    text.includes("data engineer") ||
    text.includes("data science")
  ) {
    return "AI & Data";
  }

  // Finance
  if (
    text.includes("finance") ||
    text.includes("accounting") ||
    text.includes("acca") ||
    text.includes("accountant") ||
    text.includes("audit")
  ) {
    return "Finance";
  }

  // Marketing
  if (
    text.includes("marketing") ||
    text.includes("digital marketing") ||
    text.includes("seo")
  ) {
    return "Marketing";
  }

  // HR
  if (
    text.includes("human resource") ||
    text.includes("human resources") ||
    text.includes("hr")
  ) {
    return "HR";
  }

  // Sales
  if (text.includes("sales") || text.includes("business development")) {
    return "Sales";
  }

  // Architecture
  if (text.includes("architect") || text.includes("architectural")) {
    return "Architecture";
  }

  // Urban Planning
  if (text.includes("urban planning") || text.includes("town planning")) {
    return "Urban Planning";
  }

  // Pharmacy
  if (text.includes("pharmacy") || text.includes("pharmacist")) {
    return "Pharmacy";
  }

  // Clinical Research
  if (
    text.includes("clinical") ||
    text.includes("research associate") ||
    text.includes("cra")
  ) {
    return "Clinical Research";
  }

  // Internship
  if (text.includes("intern")) {
    return "Internship";
  }

  // Trainee
  if (text.includes("trainee")) {
    return "Trainee";
  }

  return "General";
}

// ────────────────────────────────────────────
// Karachi Area Detection
// ────────────────────────────────────────────

function extractArea(location = "") {
  const loc = location.toLowerCase();

  if (loc.includes("dha")) return "DHA";
  if (loc.includes("clifton")) return "Clifton";
  if (loc.includes("gulshan")) return "Gulshan";
  if (loc.includes("gulistan")) return "Gulistan-e-Johar";
  if (loc.includes("johar")) return "Gulistan-e-Johar";
  if (loc.includes("north nazimabad")) return "North Nazimabad";
  if (loc.includes("nazimabad")) return "Nazimabad";
  if (loc.includes("shahra")) return "Shahrah-e-Faisal";
  if (loc.includes("korangi")) return "Korangi";
  if (loc.includes("malir")) return "Malir";
  if (loc.includes("saddar")) return "Saddar";
  if (loc.includes("pechs")) return "PECHS";
  if (loc.includes("bahadurabad")) return "Bahadurabad";

  return "Karachi";
}

module.exports = transformJobs;
