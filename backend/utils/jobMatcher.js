// backend/utils/jobMatcher.js
// ─────────────────────────────────────────────────────────────────────────────
// Computes a match % between a user's resume (skills + experience) and
// open job postings. Powers the "Jobs Recommended For You" screen.
// ─────────────────────────────────────────────────────────────────────────────

function calculateMatchPercent(resume, job) {
  const resumeSkills = (resume.skills ?? []).map((s) => s.name.toLowerCase());
  const jobTags = (job.tags ?? []).map((t) => t.toLowerCase());

  if (jobTags.length === 0) return 50; // neutral if job has no tags

  // ── Skill overlap (60% weight) ──────────────────────────────────────────
  const overlap = jobTags.filter((tag) =>
    resumeSkills.some((skill) => skill.includes(tag) || tag.includes(skill)),
  ).length;
  const skillMatch = (overlap / jobTags.length) * 60;

  // ── Category match from experience titles (25% weight) ─────────────────
  const expTitles = (resume.experience ?? [])
    .map((e) => e.jobTitle.toLowerCase())
    .join(" ");
  const categoryMatch =
    expTitles.includes(job.category?.toLowerCase() ?? "") ||
    jobTags.some((tag) => expTitles.includes(tag))
      ? 25
      : 0;

  // ── Location bonus — same city (15% weight) ─────────────────────────────
  const locationMatch =
    (resume.personalInfo?.city ?? "").toLowerCase() ===
    (job.area ?? "").toLowerCase()
      ? 15
      : (job.location ?? "").toLowerCase().includes("karachi")
        ? 10
        : 0;

  const total = Math.round(skillMatch + categoryMatch + locationMatch);
  return Math.min(total, 99); // cap at 99% — 100% feels artificial/untrustworthy
}

// ── Get top N matched jobs for a resume ───────────────────────────────────────
async function getMatchedJobs(resume, Job, limit = 10) {
  const jobs = await Job.find({}).limit(200).lean(); // pool to score from

  const scored = jobs.map((job) => ({
    job,
    matchPercent: calculateMatchPercent(resume, job),
  }));

  scored.sort((a, b) => b.matchPercent - a.matchPercent);

  return scored.slice(0, limit).map(({ job, matchPercent }) => ({
    jobId: job._id,
    title: job.title,
    company: job.company ?? job.company_name,
    companyLogo: job.companyLogo ?? "",
    matchPercent,
    jobType: job.jobType ?? job.job_type,
    workMode: job.isRemote ? "Remote" : (job.jobType ?? "On-site"),
    salaryMin: job.salaryMin ?? Math.round((job.salary_minimum ?? 0) / 1000),
    salaryMax: job.salaryMax ?? Math.round((job.salary_maximum ?? 0) / 1000),
    area: job.area ?? job.location ?? "Karachi",
  }));
}

module.exports = { calculateMatchPercent, getMatchedJobs };
