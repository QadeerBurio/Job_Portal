// backend/models/Resume.js
// ─────────────────────────────────────────────────────────────────────────────
// One Resume document per user (1:1 with userId). All sub-sections are
// Mongoose subdocument arrays so that .id(), .pull(), .push(), .unshift()
// (used in resumeRoutes.js) work directly on them.
// ─────────────────────────────────────────────────────────────────────────────
const mongoose = require("mongoose");
const { Schema } = mongoose;

// ── Personal Information ──────────────────────────────────────────────────
const PersonalInfoSchema = new Schema(
  {
    fullName: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    city: { type: String, default: "" }, // used directly in jobMatcher location match
    address: { type: String, default: "" },
    summary: { type: String, default: "" }, // scored in atsScore.js (length + quantifiable claims)
    linkedinUrl: { type: String, default: "" },
    portfolioUrl: { type: String, default: "" },
    profilePhotoUrl: { type: String, default: "" },
  },
  { _id: false }, // it's a single nested object, not a list — no need for its own _id
);

// ── Education ──────────────────────────────────────────────────────────────
const EducationSchema = new Schema({
  institution: { type: String, required: true },
  degree: { type: String, required: true },
  fieldOfStudy: { type: String, default: "" },
  startDate: { type: Date },
  endDate: { type: Date }, // null/undefined = "currently studying"
  isCurrent: { type: Boolean, default: false },
  grade: { type: String, default: "" }, // GPA / percentage / division
  description: { type: String, default: "" },
});

// ── Experience ───────────────────────────────────────────────────────────
const ExperienceSchema = new Schema({
  jobTitle: { type: String, required: true }, // read directly in jobMatcher.js
  company: { type: String, required: true },
  location: { type: String, default: "" },
  startDate: { type: Date },
  endDate: { type: Date },
  isCurrent: { type: Boolean, default: false },
  description: { type: String, default: "" }, // raw text the user typed
  bullets: [{ type: String }], // auto-parsed from description in resumeRoutes.js
});

// ── Skills ───────────────────────────────────────────────────────────────
const SkillSchema = new Schema({
  name: { type: String, required: true }, // matched in jobMatcher.js against job.tags
  type: {
    type: String,
    enum: ["technical", "soft", "language", "tool"],
    default: "technical",
  },
});

// ── Projects ─────────────────────────────────────────────────────────────
const ProjectSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  techStack: [{ type: String }],
  projectUrl: { type: String, default: "" }, // checked in atsScore.js
  startDate: { type: Date },
  endDate: { type: Date },
});

// ── Certifications ───────────────────────────────────────────────────────
const CertificationSchema = new Schema({
  name: { type: String, required: true },
  issuingOrganization: { type: String, default: "" },
  issueDate: { type: Date },
  expiryDate: { type: Date },
  credentialUrl: { type: String, default: "" },
});

// ── Top-level Resume ─────────────────────────────────────────────────────
const ResumeSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },

    personalInfo: { type: PersonalInfoSchema, default: () => ({}) },
    education: [EducationSchema],
    experience: [ExperienceSchema],
    skills: [SkillSchema],
    projects: [ProjectSchema],
    certifications: [CertificationSchema],

    templateId: { type: String, default: "simple-ats" },
    atsScore: { type: Number, default: 0 },

    // populated whenever /ats-score or /matched-jobs is called,
    // handy for "last updated" UI on the resume dashboard
    lastScoredAt: { type: Date },
  },
  { timestamps: true }, // adds createdAt / updatedAt
);

module.exports = mongoose.model("Resume", ResumeSchema);
