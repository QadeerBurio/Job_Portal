// types/index.ts

export type JobType =
  | "Full-time"
  | "Part-time"
  | "Contract"
  | "Internship"
  | "Remote"
  | "On-site"
  | "Hybrid";

export type JobCategory =
  | "Software"
  | "AI/ML"
  | "Design"
  | "Marketing"
  | "Finance"
  | "Healthcare"
  | "Operations"
  | "Management"
  | "Architecture"
  | "Urban Planning"
  | "Pharmacy"
  | "Clinical Research"
  | "Other";

export type Job = {
  _id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  area: string; // e.g. 'DHA Phase 6', 'Clifton'
  salaryMin: number; // in PKR (thousands)
  salaryMax: number;
  jobType: JobType;
  category: JobCategory;
  isInternship: boolean;
  isTrainee: boolean;
  description: string;
  requirements: string[];
  responsibilities: string[];
  tags: string[]; // e.g. ['React', 'Node.js', 'AWS']
  experience: string; // e.g. '5+ Years'
  postedAt: string; // ISO date string
  isSaved?: boolean;
  isNew?: boolean;
  applyUrl: String;
};

export type User = {
  _id: string;
  name: string;
  email: string;
  title: string;
  avatarUrl?: string;
  level: "Junior" | "Mid" | "Senior";
  isAvailable: boolean;
  appliedCount: number;
  interviewCount: number;
  savedJobIds?: string[];
};

// Add these to your types/index.ts

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

export type FilterState = {
  sortBy: "Latest" | "Relevant" | "Salary";
  location: string[];
  jobType: JobType[];
  salaryMin: number;
  salaryMax: number;
  category: JobCategory | null;
  isInternship: boolean | null;
};
export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    token: string;
  };
  error?: string;
}
