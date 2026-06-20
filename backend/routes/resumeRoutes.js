// backend/routes/resumeRoutes.js
// ─────────────────────────────────────────────────────────────────────────────
// All resume-related endpoints. Mount in server.js with:
//   app.use("/api/resume", require("./routes/resumeRoutes"));
//
// Auth: expects req.userId to be set by an auth middleware (JWT decode).
// For now, a simple stub middleware is included — swap with real JWT auth.
// ─────────────────────────────────────────────────────────────────────────────
const express = require("express");
const router = express.Router();
const Resume = require("../models/Resume");
const Job = require("../models/Job"); // your existing Job model
const { calculateAtsScore } = require("../utils/atsScore");
const { getMatchedJobs } = require("../utils/jobMatcher");

// ── Stub auth middleware — REPLACE with real JWT verification ────────────────
function requireAuth(req, res, next) {
  // In production: verify JWT from Authorization header, set req.userId
  const userId = req.headers["x-user-id"]; // temporary — pass userId in header for testing
  if (!userId)
    return res.status(401).json({ error: "Unauthorized — missing user ID" });
  req.userId = userId;
  next();
}

// ── Helper: get or create resume for a user ───────────────────────────────────
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
    res.json(resume);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// PUT /api/resume/personal-info — update Personal Information screen
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
// EDUCATION — full CRUD
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
// EXPERIENCE — full CRUD
// ════════════════════════════════════════════════════════════════════════════
router.post("/experience", requireAuth, async (req, res) => {
  try {
    const resume = await getOrCreateResume(req.userId);

    // Auto-parse bullets from description (split by newline or period)
    const bullets = (req.body.description || "")
      .split(/\n|(?<=\.)\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 10);

    resume.experience.unshift({ ...req.body, bullets }); // newest first
    await resume.save();
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
// SKILLS — add / remove
// ════════════════════════════════════════════════════════════════════════════
router.post("/skills", requireAuth, async (req, res) => {
  try {
    const resume = await getOrCreateResume(req.userId);
    const { name, type = "technical" } = req.body;

    // Prevent duplicates (case-insensitive)
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

// Skill suggestions based on existing skills + popular Karachi market skills
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
// PROJECTS — full CRUD
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
// CERTIFICATIONS — full CRUD
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
// TEMPLATE selection
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
  // Static list — could be moved to DB if you add more templates later
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
// ATS SCORE — calculate and return
// ════════════════════════════════════════════════════════════════════════════
router.get("/ats-score", requireAuth, async (req, res) => {
  try {
    const resume = await getOrCreateResume(req.userId);
    const result = calculateAtsScore(resume.toObject());
    resume.atsScore = result.total;
    await resume.save();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// MATCHED JOBS — "Jobs Recommended For You" screen
// ════════════════════════════════════════════════════════════════════════════
router.get("/matched-jobs", requireAuth, async (req, res) => {
  try {
    const resume = await getOrCreateResume(req.userId);
    const matches = await getMatchedJobs(resume.toObject(), Job, 10);
    res.json(matches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
