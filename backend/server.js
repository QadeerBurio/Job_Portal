// backend/server.js

require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cron = require("node-cron");

const syncJobs = require("./services/syncJobs");
const Job = require("./models/Job");

if (!process.env.MONGODB_URI) {
  console.error("❌ MONGODB_URI missing from .env");
  process.exit(1);
}

const app = express();

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB Atlas connected");
  })
  .catch((err) => {
    console.error("❌ MongoDB error:", err.message);
    process.exit(1);
  });

// ─────────────────────────────────────────────────────────────
// Initial Apify Sync
// ─────────────────────────────────────────────────────────────

mongoose.connection.once("open", async () => {
  try {
    console.log("🔄 Starting initial sync...");
    await syncJobs();
    console.log("✅ Initial sync completed");
  } catch (err) {
    console.error("❌ Initial sync failed:", err.message);
  }
});

// ─────────────────────────────────────────────────────────────
// Run every 6 hours
// ─────────────────────────────────────────────────────────────

cron.schedule("0 */6 * * *", async () => {
  try {
    console.log("🔄 Scheduled sync started...");
    await syncJobs();
    console.log("✅ Scheduled sync completed");
  } catch (err) {
    console.error("❌ Scheduled sync failed:", err.message);
  }
});

// ─────────────────────────────────────────────────────────────
// Debug Endpoint
// ─────────────────────────────────────────────────────────────

app.get("/api/debug", async (req, res) => {
  try {
    const total = await Job.countDocuments({});
    const sample = await Job.findOne({}).lean();

    res.json({
      totalDocuments: total,
      sampleFields: sample ? Object.keys(sample) : [],
      sampleTitle: sample?.title ?? sample?.Title ?? "No title field found",
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

// ─────────────────────────────────────────────────────────────
// Get Jobs
// ─────────────────────────────────────────────────────────────

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

    const filter = {};

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { company: { $regex: q, $options: "i" } },
        { company_name: { $regex: q, $options: "i" } },
        { skills: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }

    if (jobType) {
      const types = jobType.split(",");

      filter.$or = [
        ...(filter.$or || []),
        { jobType: { $in: types } },
        { job_type: { $in: types } },
      ];
    }

    if (category) {
      filter.category = category;
    }

    if (area) {
      filter.$or = [
        ...(filter.$or || []),
        { area: { $regex: area, $options: "i" } },
        { location: { $regex: area, $options: "i" } },
      ];
    }

    if (isInternship === "true") {
      filter.$or = [
        ...(filter.$or || []),
        { isInternship: true },
        { job_type: { $regex: /intern/i } },
      ];
    }

    if (salaryMin) {
      const minVal = Number(salaryMin);

      filter.$or = [
        ...(filter.$or || []),
        { salaryMax: { $gte: minVal } },
        {
          salary_maximum: {
            $gte: minVal > 1000 ? minVal : minVal * 1000,
          },
        },
      ];
    }

    const sort =
      sortBy === "Salary"
        ? {
            salary_maximum: -1,
            salaryMax: -1,
          }
        : {
            createdAt: -1,
            postedAt: -1,
            _id: -1,
          };

    const jobs = await Job.find(filter)
      .sort(sort)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .lean();

    const total = await Job.countDocuments(filter);

    res.json({
      data: jobs,
      total,
      page: Number(page),
    });
  } catch (err) {
    console.error("GET /api/jobs error:", err.message);

    res.status(500).json({
      error: err.message,
    });
  }
});

// ─────────────────────────────────────────────────────────────
// Recommended Jobs
// ─────────────────────────────────────────────────────────────

app.get("/api/jobs/recommended", async (req, res) => {
  try {
    const jobs = await Job.find({})
      .sort({
        createdAt: -1,
        _id: -1,
      })
      .limit(6)
      .lean();

    res.json(jobs);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

// ─────────────────────────────────────────────────────────────
// Single Job
// ─────────────────────────────────────────────────────────────

app.get("/api/jobs/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).lean();

    if (!job) {
      return res.status(404).json({
        error: "Job not found",
      });
    }

    res.json(job);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

// ─────────────────────────────────────────────────────────────
// Manual Sync
// ─────────────────────────────────────────────────────────────

app.post("/api/sync", async (req, res) => {
  try {
    await syncJobs();

    res.json({
      success: true,
      message: "Jobs synced successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// ─────────────────────────────────────────────────────────────
// Sync Status
// ─────────────────────────────────────────────────────────────

app.get("/api/sync-status", async (req, res) => {
  try {
    const latestJob = await Job.findOne({})
      .sort({
        updatedAt: -1,
      })
      .lean();

    res.json({
      success: true,
      lastUpdate: latestJob?.updatedAt || null,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// ─────────────────────────────────────────────────────────────
// Health Check
// ─────────────────────────────────────────────────────────────

app.get("/api/health", async (_, res) => {
  try {
    const count = await Job.countDocuments({});

    res.json({
      status: "ok",
      totalJobs: count,
    });
  } catch {
    res.json({
      status: "error",
      totalJobs: -1,
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
