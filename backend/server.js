// backend/server.js
// ─────────────────────────────────────────────────────────────────────────────
// Node.js + Express backend for KarachiJobs.
// Connects to MongoDB Atlas and serves jobs to the React Native app.
//
// Setup:
//   cd backend
//   npm init -y
//   npm install express mongoose cors dotenv
//   node server.js
// ─────────────────────────────────────────────────────────────────────────────
// backend/server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

if (!process.env.MONGODB_URI) {
  console.error("❌ MONGODB_URI missing from .env");
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Atlas connected"))
  .catch((err) => {
    console.error("❌ MongoDB error:", err.message);
    process.exit(1);
  });

// ── Schema — strict:false so ANY field in your document is returned ───────────
// This is the key fix: strict:false means documents that don't have
// isActive / salaryMin / jobType etc. still get returned correctly.
const jobSchema = new mongoose.Schema({}, { strict: false, timestamps: true });

// Text index for search (run once, Atlas creates it automatically)
jobSchema.index(
  {
    title: "text",
    description: "text",
    company_name: "text",
    company: "text",
    skills: "text",
  },
  { default_language: "english" },
);

const Job = mongoose.model("Job", jobSchema, "jobs"); // "jobs" = exact collection name

// ── Debug endpoint — call this first to confirm data exists ──────────────────
app.get("/api/debug", async (req, res) => {
  try {
    const total = await Job.countDocuments({});
    const sample = await Job.findOne({}).lean();
    const fields = sample ? Object.keys(sample) : [];
    res.json({
      totalDocuments: total,
      sampleFields: fields,
      sampleTitle: sample?.title ?? sample?.Title ?? "no title field found",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/jobs ─────────────────────────────────────────────────────────────
app.get("/api/jobs", async (req, res) => {
  try {
    const {
      q,
      jobType,
      category,
      isInternship,
      salaryMin,
      area,
      sortBy,
      page = 1,
      limit = 20,
    } = req.query;

    // ✅ NO isActive filter — works even if your docs don't have that field
    const filter = {};

    if (q) {
      // Try text search first; fall back to regex if no text index yet
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { company: { $regex: q, $options: "i" } },
        { company_name: { $regex: q, $options: "i" } },
        { skills: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }

    // jobType filter — handle both field names
    if (jobType) {
      const types = jobType.split(",");
      filter.$or = [
        ...(filter.$or ?? []),
        { jobType: { $in: types } },
        { job_type: { $in: types } },
      ];
    }

    if (category) filter.category = category;
    if (area)
      filter.$or = [
        ...(filter.$or ?? []),
        { area: { $regex: area, $options: "i" } },
        { location: { $regex: area, $options: "i" } },
      ];

    if (isInternship === "true")
      filter.$or = [
        ...(filter.$or ?? []),
        { isInternship: true },
        { job_type: { $regex: /intern/i } },
      ];

    // Salary filter — handle both raw PKR and thousands
    if (salaryMin) {
      const minVal = Number(salaryMin);
      filter.$or = [
        ...(filter.$or ?? []),
        { salaryMax: { $gte: minVal } },
        { salary_maximum: { $gte: minVal > 1000 ? minVal : minVal * 1000 } },
      ];
    }

    const sort =
      sortBy === "Salary"
        ? { salary_maximum: -1, salaryMax: -1 }
        : { createdAt: -1, postedAt: -1, _id: -1 };

    const jobs = await Job.find(filter)
      .sort(sort)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .lean();

    const total = await Job.countDocuments(filter);

    console.log(
      `GET /api/jobs — filter: ${JSON.stringify(filter)} — found: ${jobs.length}`,
    );

    res.json({ data: jobs, total, page: Number(page) });
  } catch (err) {
    console.error("GET /api/jobs error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/jobs/recommended ─────────────────────────────────────────────────
app.get("/api/jobs/recommended", async (req, res) => {
  try {
    const jobs = await Job.find({})
      .sort({ createdAt: -1, _id: -1 })
      .limit(6)
      .lean();
    console.log(`GET /api/jobs/recommended — found: ${jobs.length}`);
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/jobs/:id ─────────────────────────────────────────────────────────
app.get("/api/jobs/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).lean();
    if (!job) return res.status(404).json({ error: "Job not found" });
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/api/health", async (_, res) => {
  const count = await Job.countDocuments({}).catch(() => -1);
  res.json({ status: "ok", totalJobs: count });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server on http://localhost:${PORT}`));
