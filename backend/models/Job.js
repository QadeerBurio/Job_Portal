const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    company: {
      type: String,
      required: true,
      trim: true,
    },

    companyUrl: {
      type: String,
      default: "",
    },

    applyUrl: {
      type: String,
      default: "",
    },

    location: {
      type: String,
      default: "",
    },

    area: {
      type: String,
      default: "",
    },

    salaryMin: {
      type: Number,
      default: 0,
    },

    salaryMax: {
      type: Number,
      default: 0,
    },

    jobType: {
      type: String,
      default: "Full-time",
    },

    category: {
      type: String,
      default: "",
    },

    isInternship: {
      type: Boolean,
      default: false,
    },

    isTrainee: {
      type: Boolean,
      default: false,
    },

    description: {
      type: String,
      default: "",
    },

    requirements: {
      type: [String],
      default: [],
    },

    responsibilities: {
      type: [String],
      default: [],
    },

    tags: {
      type: [String],
      default: [],
    },

    experience: {
      type: String,
      default: "",
    },

    isRemote: {
      type: Boolean,
      default: false,
    },

    easyApply: {
      type: Boolean,
      default: false,
    },

    postedAt: {
      type: Date,
    },

    expiresAt: {
      type: Date,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    views: {
      type: Number,
      default: 0,
    },

    applications: {
      type: Number,
      default: 0,
    },

    source: {
      type: String,
      default: "apify",
    },
  },
  {
    timestamps: true,
  },
);

// Prevent duplicate jobs
JobSchema.index(
  {
    title: 1,
    company: 1,
    applyUrl: 1,
  },
  {
    unique: true,
  },
);

// Useful indexes for searching/filtering
JobSchema.index({ location: 1 });
JobSchema.index({ category: 1 });
JobSchema.index({ isInternship: 1 });
JobSchema.index({ isRemote: 1 });
JobSchema.index({ postedAt: -1 });

module.exports = mongoose.model("Job", JobSchema);
