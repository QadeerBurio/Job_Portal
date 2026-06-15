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
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

console.log("MONGODB_URI:", process.env.MONGODB_URI);

// ── Connect to MongoDB Atlas ──────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Atlas connected"))
  .catch((err) => {
    console.error("❌ MongoDB error:", err);
    process.exit(1);
  });

// ── Job Schema (matches your JSON fields exactly) ─────────────────────────────
const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    companyUrl: String,
    applyUrl: String,
    location: { type: String, default: "Karachi" },
    area: { type: String, default: "Karachi" },
    salaryMin: { type: Number, default: 30 }, // in thousands PKR
    salaryMax: { type: Number, default: 80 },
    jobType: {
      type: String,
      enum: [
        "Full-time",
        "Part-time",
        "Contract",
        "Internship",
        "Remote",
        "On-site",
        "Hybrid",
        "Trainee",
      ],
      default: "Full-time",
    },
    category: { type: String, default: "Other" },
    isInternship: { type: Boolean, default: false },
    isTrainee: { type: Boolean, default: false },
    description: String,
    requirements: [String],
    responsibilities: [String],
    tags: [String],
    experience: String,
    isRemote: { type: Boolean, default: false },
    easyApply: { type: Boolean, default: false },
    postedAt: { type: Date, default: Date.now },
    expiresAt: Date,
    //isActive: { type: Boolean, default: true },
    views: { type: Number, default: 0 },
    applications: { type: Number, default: 0 },
    source: String,
  },
  { timestamps: true },
);

// Text index for full-text search
jobSchema.index({
  title: "text",
  description: "text",
  tags: "text",
  company: "text",
});
// Compound index for filters
jobSchema.index({ jobType: 1, category: 1, postedAt: -1 });
jobSchema.index({ isInternship: 1, isActive: 1 });

const Job = mongoose.model("Job", jobSchema);

// ── GET /api/jobs — list with search + filters + pagination ───────────────────
app.get("/api/jobs", async (req, res) => {
  try {
    const {
      q, // text search
      jobType, // comma-separated: "Internship,Remote"
      category,
      isInternship,
      isTrainee,
      salaryMin,
      area,
      sortBy, // "Latest" | "Salary"
      page = 1,
      limit = 20,
    } = req.query;

    const filter = { isActive: true };

    // Full-text search
    if (q) filter.$text = { $search: q };

    // Filters
    if (jobType) filter.jobType = { $in: jobType.split(",") };
    if (category) filter.category = category;
    if (isInternship !== undefined)
      filter.isInternship = isInternship === "true";
    if (isTrainee !== undefined) filter.isTrainee = isTrainee === "true";
    if (area) filter.area = { $regex: area, $options: "i" };
    if (salaryMin) filter.salaryMax = { $gte: Number(salaryMin) };

    // Sort
    const sort = sortBy === "Salary" ? { salaryMax: -1 } : { postedAt: -1 };

    const jobs = await Job.find(filter)
      .sort(sort)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .lean();

    console.log("JOBS FOUND:", jobs.length);
    const total = await Job.countDocuments(filter);

    res.json({ data: jobs, total, page: Number(page) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/jobs/recommended ─────────────────────────────────────────────────
app.get("/api/jobs/recommended", async (req, res) => {
  try {
    const jobs = await Job.find({ isActive: true })
      .sort({ postedAt: -1 })
      .limit(6)
      .lean();
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/jobs/:id ─────────────────────────────────────────────────────────
app.get("/api/jobs/:id", async (req, res) => {
  console.log("QUERY:", req.query);
  try {
    const job = await Job.findById(req.params.id).lean();
    if (!job) return res.status(404).json({ error: "Job not found" });
    // Increment view count
    Job.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }).exec();
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/api/health", (_, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`),
);
