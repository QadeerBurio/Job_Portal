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
//
// ✅ NEW (Upload Existing Resume feature): POST /upload, GET /upload,
//    DELETE /upload, PUT /source — see bottom section.
// ─────────────────────────────────────────────────────────────────────────────
const express = require("express");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const Resume = require("../models/Resume");
const Job = require("../models/Job");
const { matchResumeToJobs } = require("../utils/atsMatcher");
const { calculateCompletion } = require("../utils/completion");
const {
  uploadResumeFile,
  UPLOAD_DIR,
  ALLOWED_MIME_TYPES,
} = require("../middleware/uploadMiddleware");
const { parseResumeFile } = require("../utils/geminiResumeParser");

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
      resume.toObject({ virtuals: false }),
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
  const result = calculateAtsScore(resume.toObject({ virtuals: false }));
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

    // ✅ atsMatcher.js's matchResumeToJobs expects an OPTIONS OBJECT as its
    // 3rd argument ({ limit, minScore }), not a bare number — passing a
    // number here silently became `options.limit` = undefined inside the
    // function, since destructuring a number gives you the defaults instead.
    const matches = await matchResumeToJobs(resume.toObject(), Job, {
      limit,
      minScore,
    });
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

    const { scoreResumeAgainstJob } = require("../utils/atsMatcher");
    const result = {
      score: scoreResumeAgainstJob(resume.toObject(), job),
      job: job._id,
    };
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// ✅ NEW — UPLOAD EXISTING RESUME
// ════════════════════════════════════════════════════════════════════════════

// ── POST /api/resume/upload — upload + parse a PDF/DOCX resume ─────────────
router.post("/upload", requireAuth, (req, res) => {
  uploadResumeFile(req, res, async (multerErr) => {
    // ── Multer-level errors (wrong type, too large, no file) ────────────────
    if (multerErr) {
      if (multerErr.message === "UNSUPPORTED_FILE_TYPE") {
        return res.status(400).json({
          error: "Unsupported file type. Please upload a PDF or DOCX file.",
        });
      }
      if (multerErr.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          error: "File is too large. Maximum size is 10MB.",
        });
      }
      return res.status(400).json({ error: multerErr.message });
    }
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    try {
      const resume = await getOrCreateResume(req.userId);
      const fileType = ALLOWED_MIME_TYPES[req.file.mimetype]; // "pdf" | "docx"
      const fileUrl = `/uploads/resumes/${req.file.filename}`; // served via express.static in server.js

      // ── Parse the file into the same shape the manual builder uses ───────
      const parsed = await parseResumeFile(req.file.path, fileType);

      resume.uploadedResume = {
        fileName: req.file.originalname,
        fileSize: req.file.size,
        fileUrl,
        fileType,
        uploadDate: new Date(),
        rawText: parsed.rawText,
        parseStatus: parsed.parseStatus,
        parsedSections: parsed.parsedSections,
      };

      // ── Best-effort write into the SAME arrays the manual builder uses ───
      // Per the product requirement: uploaded data must "be extracted and
      // stored in the resume collection... just like user creates resume
      // manually." We do NOT keep a separate parsed-data copy — we write
      // directly into personalInfo/experience/education/skills, exactly
      // like add-experience.tsx etc. do. The user reviews/edits afterward
      // on the normal section screens (no new "parsed data" UI needed).
      //
      // We only overwrite a section if the parser actually found something
      // for it, so we never blow away a manually-built section with an
      // empty parse result for a different section.
      if (parsed.data.personalInfo.fullName || parsed.data.personalInfo.email) {
        resume.personalInfo = {
          ...resume.personalInfo.toObject(),
          ...Object.fromEntries(
            Object.entries(parsed.data.personalInfo).filter(([, v]) => v),
          ),
        };
      }
      if (parsed.data.experience.length > 0) {
        resume.experience = parsed.data.experience.map((e) => {
          const { _dateRangeRaw, ...rest } = e;
          return rest;
        });
      }
      if (parsed.data.education.length > 0) {
        resume.education = parsed.data.education;
      }
      if (parsed.data.skills.length > 0) {
        resume.skills = parsed.data.skills;
      }

      if (parsed.data.projects?.length > 0) {
        resume.projects = parsed.data.projects.map((p) => {
          const { _dateRangeRaw, ...rest } = p;
          return rest;
        });
      }

      if (parsed.data.certifications?.length > 0) {
        resume.certifications = parsed.data.certifications;
      }

      // Newly uploaded resume becomes the active source automatically —
      // satisfies requirement #8 ("if uploaded resume exists, use it"),
      // and the source-select screen lets the user switch back later if
      // they also have a manually built resume.
      resume.activeSource = "uploaded";

      console.log("Saving resume:");
      console.log({
        experience: resume.experience.length,
        education: resume.education.length,
        skills: resume.skills.length,
        projects: resume.projects.length,
        certifications: resume.certifications.length,
      });

      await resume.save();
      await recalculateAtsScore(resume);

      res.status(201).json({
        uploadedResume: resume.uploadedResume,
        parsedData: parsed.data,
        activeSource: resume.activeSource,
        message:
          parsed.parseStatus === "failed"
            ? "File uploaded, but we couldn't extract readable text (likely a scanned/image-based file). Please fill in your resume manually."
            : parsed.parseStatus === "partial"
              ? "Resume uploaded. We filled in what we could find — please review and complete the rest."
              : "Resume uploaded and parsed successfully. Please review the imported details.",
      });
    } catch (err) {
      console.error("POST /api/resume/upload error:", err.message);
      // Clean up the orphaned file if parsing/saving failed after multer wrote it
      if (req.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ error: err.message });
    }
  });
});

// ── GET /api/resume/upload — fetch uploaded resume metadata ────────────────
router.get("/upload", requireAuth, async (req, res) => {
  try {
    const resume = await getOrCreateResume(req.userId);
    res.json(resume.uploadedResume);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE /api/resume/upload — remove uploaded resume + its file ──────────
router.delete("/upload", requireAuth, async (req, res) => {
  try {
    const resume = await getOrCreateResume(req.userId);
    const existingUrl = resume.uploadedResume?.fileUrl;

    if (existingUrl) {
      const filePath = path.join(UPLOAD_DIR, path.basename(existingUrl));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    resume.uploadedResume = {};
    if (resume.activeSource === "uploaded") {
      resume.activeSource = "manual";
    }
    await resume.save();
    res.json({ success: true, activeSource: resume.activeSource });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PUT /api/resume/source — switch between "manual" and "uploaded" ────────
// Used by the source-select screen when BOTH a manual and uploaded resume
// exist and the user needs to pick which one drives ATS scoring / matching.
router.put("/source", requireAuth, async (req, res) => {
  try {
    const { source } = req.body; // "manual" | "uploaded"
    if (!["manual", "uploaded"].includes(source)) {
      return res
        .status(400)
        .json({ error: "source must be 'manual' or 'uploaded'" });
    }
    const resume = await getOrCreateResume(req.userId);
    if (source === "uploaded" && !resume.uploadedResume?.fileName) {
      return res.status(400).json({ error: "No uploaded resume exists yet." });
    }
    resume.activeSource = source;
    await resume.save();
    res.json({ activeSource: resume.activeSource });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
