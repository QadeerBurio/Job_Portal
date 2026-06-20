// types/resume.ts
// ─────────────────────────────────────────────────────────────────────────────
// Add these to your existing types/index.ts (or import from this file).
// ─────────────────────────────────────────────────────────────────────────────

export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  summary: string; // max 500 chars
  avatarUrl?: string;
}

export interface Education {
  _id: string;
  degree: string; // "BS in Computer Science"
  institution: string; // "Institute of Business Administration (IBA)"
  city: string;
  startDate: string; // ISO date
  endDate: string | null; // null if currently studying
  isCurrent: boolean;
  grade: string; // "3.82 CGPA" or "84% Grade A"
  icon?: "graduation" | "institution" | "school";
}

export interface Experience {
  _id: string;
  jobTitle: string;
  companyName: string;
  location: string;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  description: string; // min 50 chars
  bullets: string[]; // parsed from description, shown as bullet points
}

export interface Skill {
  _id: string;
  name: string;
  type: "technical" | "soft";
}

export interface Project {
  _id: string;
  name: string;
  role: string; // "Lead Backend Developer"
  technologies: string[];
  projectUrl?: string;
  description: string; // max 500 chars
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
}

export interface Certification {
  _id: string;
  name: string;
  issuer: string;
  dateIssued: string;
  expirationDate?: string | null;
  doesNotExpire: boolean;
  credentialUrl?: string;
  previewUrl?: string; // uploaded image/PDF
  icon?: "verified" | "academic" | "code";
}

export interface ResumeTemplate {
  _id: string;
  name: string; // "Simple ATS Template"
  description: string;
  thumbnailUrl: string;
  isAtsFriendly: boolean;
}

export interface Resume {
  _id: string;
  userId: string;
  personalInfo: PersonalInfo;
  education: Education[];
  experience: Experience[];
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
  templateId: string;
  completionPercent: number; // 0-100
  atsScore?: number; // 0-100
  updatedAt: string;
}

export interface JobMatch {
  jobId: string;
  title: string;
  company: string;
  companyLogo?: string;
  matchPercent: number; // 0-100
  jobType: string;
  workMode: string; // "Hybrid" | "On-site" | "Remote"
  salaryMin: number;
  salaryMax: number;
  area: string;
}
