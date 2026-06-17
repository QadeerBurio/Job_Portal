function transformJobs(rawJobs = []) {
  return rawJobs.map((job) => ({
    title: job.title || "",

    company: job.company_name || "",

    companyUrl: job.company_url || "",

    applyUrl: job.apply_url || "",

    location: job.location || "Karachi",

    area: job.location || "Karachi",

    salaryMin: job.salary_minimum ? Math.round(job.salary_minimum / 1000) : 0,

    salaryMax: job.salary_maximum ? Math.round(job.salary_maximum / 1000) : 0,

    jobType: job.job_type || "Full-time",

    category: detectCategory(job),

    isInternship: isInternship(job),

    isTrainee: isTrainee(job),

    description: job.description || "",

    requirements: [],

    responsibilities: [],

    tags: extractTags(job.skills),

    experience: "Not Specified",

    isRemote: job.is_remote || false,

    easyApply: job.easy_apply || false,

    postedAt: new Date(),

    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),

    isActive: true,

    views: 0,

    applications: 0,

    source: "apify",
  }));
}

function extractTags(skills) {
  if (!skills) return [];

  return skills
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function isInternship(job) {
  const text = `${job.title} ${job.job_type}`.toLowerCase();

  return text.includes("intern");
}

function isTrainee(job) {
  const text = `${job.title} ${job.job_type}`.toLowerCase();

  return text.includes("trainee");
}

function detectCategory(job) {
  const text = `${job.title} ${job.skills}`.toLowerCase();

  if (
    text.includes("finance") ||
    text.includes("accounting") ||
    text.includes("acca")
  ) {
    return "Finance";
  }

  if (
    text.includes("react") ||
    text.includes("flutter") ||
    text.includes("developer")
  ) {
    return "IT";
  }

  if (text.includes("marketing")) {
    return "Marketing";
  }

  return "General";
}

module.exports = transformJobs;
function transformJobs(rawJobs = []) {
  return rawJobs.map((job) => ({
    title: job.title || "",

    company: job.company_name || "",

    companyUrl: job.company_url || "",

    applyUrl: job.apply_url || "",

    location: job.location || "Karachi",

    area: job.location || "Karachi",

    salaryMin: job.salary_minimum ? Math.round(job.salary_minimum / 1000) : 0,

    salaryMax: job.salary_maximum ? Math.round(job.salary_maximum / 1000) : 0,

    jobType: job.job_type || "Full-time",

    category: detectCategory(job),

    isInternship: isInternship(job),

    isTrainee: isTrainee(job),

    description: job.description || "",

    requirements: [],

    responsibilities: [],

    tags: extractTags(job.skills),

    experience: "Not Specified",

    isRemote: job.is_remote || false,

    easyApply: job.easy_apply || false,

    postedAt: new Date(),

    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),

    isActive: true,

    views: 0,

    applications: 0,

    source: "apify",
  }));
}

function extractTags(skills) {
  if (!skills) return [];

  return skills
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function isInternship(job) {
  const text = `${job.title} ${job.job_type}`.toLowerCase();

  return text.includes("intern");
}

function isTrainee(job) {
  const text = `${job.title} ${job.job_type}`.toLowerCase();

  return text.includes("trainee");
}

function detectCategory(job) {
  const text = `${job.title} ${job.skills}`.toLowerCase();

  if (
    text.includes("finance") ||
    text.includes("accounting") ||
    text.includes("acca")
  ) {
    return "Finance";
  }

  if (
    text.includes("react") ||
    text.includes("flutter") ||
    text.includes("developer")
  ) {
    return "IT";
  }

  if (text.includes("marketing")) {
    return "Marketing";
  }

  return "General";
}

module.exports = transformJobs;
