// scripts/transformJobs.js
// Run: node scripts/transformJobs.js jobs_raw.json jobs_ready.json
const fs = require("fs");

const inputFile = process.argv[2] || "jobs_raw.json";
const outputFile = process.argv[3] || "jobs_ready.json";

function detectCategory(raw) {
  const text = `${raw.title} ${raw.skills || ""}`.toLowerCase();
  if (
    text.match(
      /software|developer|engineer|mern|react|node|flutter|qa|devops|full.?stack/,
    )
  )
    return "Software";
  if (text.match(/\bai\b|ml|machine learning|prompt|data science/))
    return "AI/ML";
  if (text.match(/design|ui|ux|figma|graphic/)) return "Design";
  if (
    text.match(
      /market|seo|content|social media|growth|pr|influencer|copywriter/,
    )
  )
    return "Marketing";
  if (text.match(/account|finance|acca|audit|tax|banking|cash/))
    return "Finance";
  if (text.match(/clinical|pharma|medical|health/)) return "Healthcare";
  if (text.match(/operation|logistics|supply|ecommerce|warehouse/))
    return "Operations";
  if (text.match(/manag|trainee|mto|mtp/)) return "Management";
  if (text.match(/architect|drafts|autocad|revit/)) return "Architecture";
  if (text.match(/urban|planning|gis|zoning/)) return "Urban Planning";
  if (text.match(/pharmacy|pharmd/)) return "Pharmacy";
  if (text.match(/cra|clinical research/)) return "Clinical Research";
  return "Other";
}

function transformJob(raw) {
  const jt = (raw.job_type || "").toLowerCase();
  const isInternship = jt.includes("intern");
  const isTrainee =
    jt.includes("trainee") || jt.includes("graduate") || jt.includes("mto");
  let jobType = "Full-time";
  if (isInternship) jobType = "Internship";
  else if (jt.includes("part")) jobType = "Part-time";
  else if (jt.includes("contract")) jobType = "Contract";
  else if (raw.is_remote) jobType = "Remote";

  return {
    title: raw.title || "Untitled",
    company: raw.company_name || "Unknown",
    companyUrl: raw.company_url || "",
    applyUrl: raw.apply_url || "",
    location: raw.location || "Karachi",
    area: raw.area || raw.location || "Karachi",
    salaryMin: raw.salary_minimum ? Math.round(raw.salary_minimum / 1000) : 30,
    salaryMax: raw.salary_maximum ? Math.round(raw.salary_maximum / 1000) : 80,
    jobType,
    category: detectCategory(raw),
    isInternship,
    isTrainee,
    description: raw.description || "",
    requirements: raw.requirements || [],
    responsibilities: raw.responsibilities || [],
    tags: (raw.skills || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    experience: isInternship
      ? "Fresh"
      : isTrainee
        ? "Fresh / 0-1 Years"
        : "1-3 Years",
    isRemote: raw.is_remote || false,
    easyApply: raw.easy_apply || false,
    postedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 3600000).toISOString(),
    isActive: true,
    views: 0,
    applications: 0,
    source: "manual",
  };
}

const raw = JSON.parse(fs.readFileSync(inputFile, "utf8"));
const jobs = Array.isArray(raw) ? raw : [raw];
const transformed = jobs.map(transformJob);

fs.writeFileSync(outputFile, JSON.stringify(transformed, null, 2), "utf8");
console.log(`✅ ${transformed.length} jobs saved to ${outputFile}`);
console.log(
  `Categories: ${[...new Set(transformed.map((j) => j.category))].join(", ")}`,
);
