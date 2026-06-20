// services/resumeService.ts
import {
    Certification,
    Education,
    Experience,
    JobMatch,
    PersonalInfo,
    Project,
    Resume,
    ResumeTemplate,
    Skill,
} from "../types/resume";
import { api } from "./Api";

// ── Fetch full resume ─────────────────────────────────────────────────────────
export async function fetchResume(): Promise<Resume> {
  return api.get<Resume>("/resume");
}

// ── Personal Info ──────────────────────────────────────────────────────────────
export async function updatePersonalInfo(
  data: Partial<PersonalInfo>,
): Promise<PersonalInfo> {
  return api.put<PersonalInfo>("/resume/personal-info", data);
}

// ── Education ─────────────────────────────────────────────────────────────────
export async function addEducation(
  data: Omit<Education, "_id">,
): Promise<Education> {
  return api.post<Education>("/resume/education", data);
}
export async function updateEducation(
  id: string,
  data: Partial<Education>,
): Promise<Education> {
  return api.put<Education>(`/resume/education/${id}`, data);
}
export async function deleteEducation(id: string): Promise<void> {
  await api.delete(`/resume/education/${id}`);
}

// ── Experience ────────────────────────────────────────────────────────────────
export async function addExperience(
  data: Omit<Experience, "_id" | "bullets">,
): Promise<Experience> {
  return api.post<Experience>("/resume/experience", data);
}
export async function updateExperience(
  id: string,
  data: Partial<Experience>,
): Promise<Experience> {
  return api.put<Experience>(`/resume/experience/${id}`, data);
}
export async function deleteExperience(id: string): Promise<void> {
  await api.delete(`/resume/experience/${id}`);
}

// ── Skills ────────────────────────────────────────────────────────────────────
export async function addSkill(
  name: string,
  type: "technical" | "soft" = "technical",
): Promise<Skill[]> {
  return api.post<Skill[]>("/resume/skills", { name, type });
}
export async function deleteSkill(id: string): Promise<Skill[]> {
  return api.delete<Skill[]>(`/resume/skills/${id}`);
}
export async function fetchSkillSuggestions(): Promise<string[]> {
  return api.get<string[]>("/resume/skills/suggestions");
}

// ── Projects ──────────────────────────────────────────────────────────────────
export async function addProject(data: Omit<Project, "_id">): Promise<Project> {
  return api.post<Project>("/resume/projects", data);
}
export async function updateProject(
  id: string,
  data: Partial<Project>,
): Promise<Project> {
  return api.put<Project>(`/resume/projects/${id}`, data);
}
export async function deleteProject(id: string): Promise<void> {
  await api.delete(`/resume/projects/${id}`);
}

// ── Certifications ────────────────────────────────────────────────────────────
export async function addCertification(
  data: Omit<Certification, "_id">,
): Promise<Certification> {
  return api.post<Certification>("/resume/certifications", data);
}
export async function updateCertification(
  id: string,
  data: Partial<Certification>,
): Promise<Certification> {
  return api.put<Certification>(`/resume/certifications/${id}`, data);
}
export async function deleteCertification(id: string): Promise<void> {
  await api.delete(`/resume/certifications/${id}`);
}

// ── Templates ─────────────────────────────────────────────────────────────────
export async function fetchTemplates(): Promise<ResumeTemplate[]> {
  return api.get<ResumeTemplate[]>("/resume/templates");
}
export async function selectTemplate(templateId: string): Promise<void> {
  await api.put("/resume/template", { templateId });
}

// ── ATS Score ─────────────────────────────────────────────────────────────────
export async function fetchAtsScore(): Promise<{
  total: number;
  breakdown: Record<string, number>;
  suggestions: string[];
}> {
  return api.get("/resume/ats-score");
}

// ── Matched Jobs ──────────────────────────────────────────────────────────────
export async function fetchMatchedJobs(): Promise<JobMatch[]> {
  return api.get<JobMatch[]>("/resume/matched-jobs");
}
