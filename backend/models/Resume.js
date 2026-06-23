// backend/models/Resume.js
// ─────────────────────────────────────────────────────────────────────────────
// Field names MUST match exactly what the frontend sends.
// Frontend (add-experience.tsx) sends: jobTitle, companyName, location,
//   startDate, endDate, isCurrent, description
// Frontend (add-project.tsx) sends: name, role, technologies, projectUrl,
//   description, startDate, endDate, isCurrent
// ─────────────────────────────────────────────────────────────────────────────
const mongoose = require("mongoose");

// ── Education ─────────────────────────────────────────────────────────────────
const educationSchema = new mongoose.Schema(
  {
    degree: { type: String, required: true },
    institution: { type: String, required: true },
    city: { type: String, default: "Karachi" },
    startDate: { type: Date, required: true },
    endDate: { type: Date, default: null },
    isCurrent: { type: Boolean, default: false },
    grade: { type: String, default: "" },
    icon: {
      type: String,
      enum: ["graduation", "institution", "school"],
      default: "graduation",
    },
  },
  { timestamps: true },
);

// ── Experience ────────────────────────────────────────────────────────────────
// ✅ Uses companyName (not company) — matches add-experience.tsx payload
const experienceSchema = new mongoose.Schema(
  {
    jobTitle: { type: String, required: true },
    companyName: { type: String, required: true }, // ← frontend sends companyName
    location: { type: String, default: "Karachi, Pakistan" },
    startDate: { type: Date, required: true },
    endDate: { type: Date, default: null },
    isCurrent: { type: Boolean, default: false },
    description: { type: String, required: true, minlength: 50 },
    bullets: [String], // auto-parsed from description on save
  },
  { timestamps: true },
);

// ── Skills ────────────────────────────────────────────────────────────────────
const skillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ["technical", "soft"], default: "technical" },
  },
  { timestamps: true },
);

// ── Projects ──────────────────────────────────────────────────────────────────
// ✅ No required company field — matches add-project.tsx payload exactly
const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    role: { type: String, default: "" },
    technologies: [String],
    projectUrl: { type: String, default: "" },
    description: { type: String, maxlength: 500, default: "" },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, default: null },
    isCurrent: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// ── Certifications ────────────────────────────────────────────────────────────
const certificationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    issuer: { type: String, required: true },
    dateIssued: { type: Date, required: true },
    expirationDate: { type: Date, default: null },
    doesNotExpire: { type: Boolean, default: false },
    credentialUrl: { type: String, default: "" },
    previewUrl: { type: String, default: "" },
    icon: {
      type: String,
      enum: ["verified", "academic", "code"],
      default: "verified",
    },
  },
  { timestamps: true },
);

// ── Personal Info (embedded, no _id) ─────────────────────────────────────────
const personalInfoSchema = new mongoose.Schema(
  {
    fullName: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    city: { type: String, default: "Karachi" },
    country: { type: String, default: "Pakistan" },
    linkedinUrl: { type: String, default: "" },
    portfolioUrl: { type: String, default: "" },
    summary: { type: String, maxlength: 500, default: "" },
    avatarUrl: { type: String, default: "" },
  },
  { _id: false },
);

// ── Root Resume Schema ────────────────────────────────────────────────────────
const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    personalInfo: { type: personalInfoSchema, default: () => ({}) },
    education: [educationSchema],
    experience: [experienceSchema],
    skills: [skillSchema],
    projects: [projectSchema],
    certifications: [certificationSchema],
    templateId: { type: String, default: "" }, // ← empty by default so completion.js can detect "not yet chosen"
    atsScore: { type: Number, default: 0 },
    lastScoredAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// ── Virtual: completionPercent ────────────────────────────────────────────────
// Calculated on every toJSON/toObject call — always up to date.
//
// ⚠️ CRITICAL: must call toObject({ virtuals: false }) here, NOT this.toObject().
// Since toObject/toJSON are configured below with { virtuals: true }, a plain
// this.toObject() call inside this very getter would re-include this virtual,
// which re-triggers the getter, forever — "Maximum call stack size exceeded."
// Passing { virtuals: false } gets the raw document data only, breaking the loop.
resumeSchema.virtual("completionPercent").get(function () {
  const { calculateCompletion } = require("../utils/completion");
  const raw = this.toObject({ virtuals: false });
  return calculateCompletion(raw).completionPercent;
});

resumeSchema.set("toJSON", { virtuals: true });
resumeSchema.set("toObject", { virtuals: true });

// Prevent model recompilation error in hot-reload environments
module.exports =
  mongoose.models.Resume || mongoose.model("Resume", resumeSchema);
