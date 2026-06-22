// backend/routes/resumeRoutes.js
// ─────────────────────────────────────────────────────────────────────────────
// Full Resume Builder + ATS matching API.
//
// AUTH NOTE: This expects your authRoutes.js to issue a JWT on login/register
// that's verifiable with process.env.JWT_SECRET, and that the JWT payload
// contains a `userId` (or `id` / `_id` — all three are checked below).
//
// If your authRoutes.js uses a different JWT payload shape, open the
// requireAuth function below and adjust the `decoded.userId ?? decoded.id ...`
// line to match your actual token payload field name.
// ─────────────────────────────────────────────────────────────────────────────
const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

const Resume = require("../models/Resume");
const Job = require("../models/Job");
const { matchResumeToJobs } = require("../utils/Atsmatcher");
const { calculateCompletion } = require("../utils/completion");

// ════════════════════════════════════════════════════════════════════════════
// AUTH MIDDLEWARE — verifies JWT from Authorization header
// ════════════════════════════════════════════════════════════════════════════
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized — no token provided" });
  }

  // ✅ MUST match authController.js exactly:
  // jwt.sign({ id }, process.env.JWT_SECRET || "karachijobs_secret", ...)
  const secret = process.env.JWT_SECRET || "karachijobs_secret";

  try {
    const decoded = jwt.verify(token, secret);
    // Support whichever field name your authRoutes.js puts the user ID under
    req.userId = decoded.id ?? decoded.userId ?? decoded._id;
    if (!req.userId) {
      return res
        .status(401)
        .json({ error: "Invalid token payload — no user ID found" });
    }
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// ── Helper: get or create resume for a user (1:1 relationship) ────────────────
async function getOrCreateResume(userId) {
  let resume = await Resume.findOne({ userId });
  if (!resume) {
    resume = await Resume.create({ userId });
  }
  return resume;
}

// ════════════════════════════════════════════════════════════════════════════
// GET /api/resume — fetch full resume for logged-in user
// ════════════════════════════════════════════════════════════════════════════
router.get("/", requireAuth, async (req, res) => {
  try {
    const resume = await getOrCreateResume(req.userId);

    // completionPercent powers the "Resume Strength" bar on resume.tsx —
    // a presence check (did you fill the section), not an ATS quality score.
    const { completionPercent, sections } = calculateCompletion(
      resume.toObject(),
    );

    res.json({
      ...resume.toObject(),
      completionPercent,
      completionSections: sections,
    });
  } catch (err) {
    console.error("GET /api/resume error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// PUT /api/resume/personal-info
// ════════════════════════════════════════════════════════════════════════════
router.put("/personal-info", requireAuth, async (req, res) => {
  try {
    const resume = await getOrCreateResume(req.userId);
    resume.personalInfo = { ...resume.personalInfo.toObject(), ...req.body };
    await resume.save();
    res.json(resume.personalInfo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// EDUCATION
// ════════════════════════════════════════════════════════════════════════════
router.post("/education", requireAuth, async (req, res) => {
  try {
    const resume = await getOrCreateResume(req.userId);
    resume.education.push(req.body);
    await resume.save();
    res.status(201).json(resume.education[resume.education.length - 1]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/education/:eduId", requireAuth, async (req, res) => {
  try {
    const resume = await getOrCreateResume(req.userId);
    const edu = resume.education.id(req.params.eduId);
    if (!edu)
      return res.status(404).json({ error: "Education entry not found" });
    Object.assign(edu, req.body);
    await resume.save();
    res.json(edu);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/education/:eduId", requireAuth, async (req, res) => {
  try {
    const resume = await getOrCreateResume(req.userId);
    resume.education.pull({ _id: req.params.eduId });
    await resume.save();
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// EXPERIENCE
// ════════════════════════════════════════════════════════════════════════════
router.post("/experience", requireAuth, async (req, res) => {
  try {
    const resume = await getOrCreateResume(req.userId);
    const bullets = (req.body.description || "")
      .split(/\n|(?<=\.)\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 10);
    resume.experience.unshift({ ...req.body, bullets });
    await resume.save();
    await recalculateAtsScore(resume);
    res.status(201).json(resume.experience[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/experience/:expId", requireAuth, async (req, res) => {
  try {
    const resume = await getOrCreateResume(req.userId);
    const exp = resume.experience.id(req.params.expId);
    if (!exp)
      return res.status(404).json({ error: "Experience entry not found" });
    Object.assign(exp, req.body);
    if (req.body.description) {
      exp.bullets = req.body.description
        .split(/\n|(?<=\.)\s+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 10);
    }
    await resume.save();
    await recalculateAtsScore(resume);
    res.json(exp);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/experience/:expId", requireAuth, async (req, res) => {
  try {
    const resume = await getOrCreateResume(req.userId);
    resume.experience.pull({ _id: req.params.expId });
    await resume.save();
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// SKILLS
// ════════════════════════════════════════════════════════════════════════════
router.post("/skills", requireAuth, async (req, res) => {
  try {
    const resume = await getOrCreateResume(req.userId);
    const { name, type = "technical" } = req.body;
    const exists = resume.skills.some(
      (s) => s.name.toLowerCase() === name.toLowerCase(),
    );
    if (exists) return res.status(409).json({ error: "Skill already added" });
    resume.skills.push({ name, type });
    await resume.save();
    res.status(201).json(resume.skills);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/skills/:skillId", requireAuth, async (req, res) => {
  try {
    const resume = await getOrCreateResume(req.userId);
    resume.skills.pull({ _id: req.params.skillId });
    await resume.save();
    res.json(resume.skills);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/skills/suggestions", requireAuth, async (req, res) => {
  const POPULAR_SKILLS = [
    "JavaScript",
    "TypeScript",
    "SQL",
    "Digital Marketing",
    "Python",
    "React.js",
    "Node.js",
    "AWS",
    "Docker",
    "Project Management",
    "Communication",
    "Figma",
    "Data Analysis",
    "Flutter",
  ];
  try {
    const resume = await getOrCreateResume(req.userId);
    const existing = resume.skills.map((s) => s.name.toLowerCase());
    const suggestions = POPULAR_SKILLS.filter(
      (s) => !existing.includes(s.toLowerCase()),
    ).slice(0, 5);
    res.json(suggestions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// PROJECTS
// ════════════════════════════════════════════════════════════════════════════
router.post("/projects", requireAuth, async (req, res) => {
  try {
    const resume = await getOrCreateResume(req.userId);
    resume.projects.unshift(req.body);
    await resume.save();
    res.status(201).json(resume.projects[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/projects/:projectId", requireAuth, async (req, res) => {
  try {
    const resume = await getOrCreateResume(req.userId);
    const project = resume.projects.id(req.params.projectId);
    if (!project) return res.status(404).json({ error: "Project not found" });
    Object.assign(project, req.body);
    await resume.save();
    res.json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/projects/:projectId", requireAuth, async (req, res) => {
  try {
    const resume = await getOrCreateResume(req.userId);
    resume.projects.pull({ _id: req.params.projectId });
    await resume.save();
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// CERTIFICATIONS
// ════════════════════════════════════════════════════════════════════════════
router.post("/certifications", requireAuth, async (req, res) => {
  try {
    const resume = await getOrCreateResume(req.userId);
    resume.certifications.unshift(req.body);
    await resume.save();
    res.status(201).json(resume.certifications[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/certifications/:certId", requireAuth, async (req, res) => {
  try {
    const resume = await getOrCreateResume(req.userId);
    const cert = resume.certifications.id(req.params.certId);
    if (!cert)
      return res.status(404).json({ error: "Certification not found" });
    Object.assign(cert, req.body);
    await resume.save();
    res.json(cert);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/certifications/:certId", requireAuth, async (req, res) => {
  try {
    const resume = await getOrCreateResume(req.userId);
    resume.certifications.pull({ _id: req.params.certId });
    await resume.save();
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// TEMPLATE
// ════════════════════════════════════════════════════════════════════════════
router.put("/template", requireAuth, async (req, res) => {
  try {
    const resume = await getOrCreateResume(req.userId);
    resume.templateId = req.body.templateId;
    await resume.save();
    res.json({ templateId: resume.templateId });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/templates", async (req, res) => {
  res.json([
    {
      _id: "simple-ats",
      name: "Simple ATS Template",
      description: "Optimized for scanning systems and clarity.",
      isAtsFriendly: true,
      thumbnailUrl: "",
    },
    {
      _id: "modern",
      name: "Modern Template",
      description: "Highlights skills with a bold visual layout.",
      isAtsFriendly: false,
      thumbnailUrl: "",
    },
  ]);
});

// ════════════════════════════════════════════════════════════════════════════
// ATS SCORE — real keyword + structure based scoring (see utils/Atsscore.js)
// ════════════════════════════════════════════════════════════════════════════
const { calculateAtsScore } = require("../utils/Atsscore");

async function recalculateAtsScore(resume) {
  const result = calculateAtsScore(resume.toObject());
  resume.atsScore = result.total;
  resume.lastScoredAt = new Date();
  await resume.save();
  return result;
}

router.get("/ats-score", requireAuth, async (req, res) => {
  try {
    const resume = await getOrCreateResume(req.userId);
    const result = await recalculateAtsScore(resume);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// MATCHED JOBS — real ATS-style resume-to-job matching
// ════════════════════════════════════════════════════════════════════════════
router.get("/matched-jobs", requireAuth, async (req, res) => {
  try {
    const resume = await getOrCreateResume(req.userId);
    const limit = Number(req.query.limit) || 10;
    const minScore = Number(req.query.minScore) || 0;

    const matches = await matchResumeToJobs(resume.toObject(), Job, limit);
    res.json(matches);
  } catch (err) {
    console.error("GET /api/resume/matched-jobs error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/resume/match-score/:jobId — score against ONE specific job ───────
// Useful for showing match % on a single job detail screen.
router.get("/match-score/:jobId", requireAuth, async (req, res) => {
  try {
    const resume = await getOrCreateResume(req.userId);
    const job = await Job.findById(req.params.jobId).lean();
    if (!job) return res.status(404).json({ error: "Job not found" });

    const { scoreResumeAgainstJob } = require("../utils/Atsmatcher");
    const result = {
      score: scoreResumeAgainstJob(resume.toObject(), job),
      job: job._id,
    };
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
