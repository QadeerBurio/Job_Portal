// backend/models/Resume.js
// ─────────────────────────────────────────────────────────────────────────────
// Mongoose schema for the Resume Builder feature.
// One Resume document per user (1:1 relationship via userId).
// ─────────────────────────────────────────────────────────────────────────────
const mongoose = require("mongoose");

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

const experienceSchema = new mongoose.Schema(
  {
    jobTitle: { type: String, required: true },
    companyName: { type: String, required: true },
    location: { type: String, default: "Karachi, Pakistan" },
    startDate: { type: Date, required: true },
    endDate: { type: Date, default: null },
    isCurrent: { type: Boolean, default: false },
    description: { type: String, required: true, minlength: 50 },
    bullets: [String],
  },
  { timestamps: true },
);

const skillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ["technical", "soft"], default: "technical" },
  },
  { timestamps: true },
);

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

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    personalInfo: { type: personalInfoSchema, default: () => ({}) },
    education: [educationSchema],
    experience: [experienceSchema],
    skills: [skillSchema],
    projects: [projectSchema],
    certifications: [certificationSchema],
    templateId: { type: String, default: "simple-ats" },
    atsScore: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// ── Resume completion % — calculated on every save ────────────────────────────
resumeSchema.methods.calculateCompletion = function () {
  const sections = [
    !!this.personalInfo?.fullName && !!this.personalInfo?.summary,
    this.education.length > 0,
    this.experience.length > 0,
    this.skills.length >= 3,
    this.projects.length > 0,
    this.certifications.length > 0,
  ];
  const filled = sections.filter(Boolean).length;
  return Math.round((filled / sections.length) * 100);
};

resumeSchema.virtual("completionPercent").get(function () {
  return this.calculateCompletion();
});

resumeSchema.set("toJSON", { virtuals: true });
resumeSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Resume", resumeSchema);
