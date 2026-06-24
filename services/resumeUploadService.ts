// services/resumeUploadService.ts
// ─────────────────────────────────────────────────────────────────────────────
// Upload-resume-specific API calls.
//
// WHY uploadResume() DOESN'T USE api.post() FROM services/Api.ts:
// request() in Api.ts always sets "Content-Type: application/json" and does
// JSON.stringify(body). Both are wrong for a file upload — multipart
// requests need fetch to set its OWN "Content-Type: multipart/form-data;
// boundary=..." header (which only happens if you don't set Content-Type
// yourself), and a FormData body must be passed as-is, never JSON.stringify'd
// (that would serialize it into "{}" and silently drop the file).
//
// So uploadResume() is the one sanctioned exception to "never call fetch()
// directly" — it reuses the exact same API_BASE_URL, auth-token storage key,
// and timeout behavior as Api.ts, just without the JSON-forcing wrapper.
//
// getUploadedResume / deleteUploadedResume / setResumeSource are plain JSON
// calls, so they use the normal `api` helper like every other resume service
// function — no special handling needed for those three.
// ─────────────────────────────────────────────────────────────────────────────
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL, STORAGE_KEYS, TIMEOUT_MS } from "../constants/API";
import { api } from "./Api";

async function getAuthHeader(): Promise<Record<string, string>> {
  try {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out")), ms),
    ),
  ]);
}

// ── Types ────────────────────────────────────────────────────────────────────
export interface UploadedResume {
  fileName: string;
  fileSize: number;
  fileUrl: string;
  fileType: "pdf" | "docx" | "";
  uploadDate: string | null;
  parseStatus: "pending" | "success" | "partial" | "failed";
  parsedSections: {
    personalInfo: boolean;
    experience: boolean;
    education: boolean;
    skills: boolean;
  };
}

export type ResumeSource = "manual" | "uploaded";

export interface UploadResumeResponse {
  uploadedResume: UploadedResume;
  activeSource: ResumeSource;
  message: string;
}

export interface PickedFile {
  uri: string;
  name: string;
  size: number;
  mimeType: string;
}

// ── uploadResume ─────────────────────────────────────────────────────────────
// Sends the picked file as multipart/form-data to POST /api/resume/upload.
// The backend parses it (best-effort) and writes the extracted data into the
// SAME personalInfo/experience/education/skills fields the manual builder
// uses — there is no separate "parsed resume" record to keep in sync.
export async function uploadResume(
  file: PickedFile,
): Promise<UploadResumeResponse> {
  const formData = new FormData();
  // Field name MUST be "resume" — matches uploadResumeFile.single("resume")
  // in backend/middleware/uploadMiddleware.js.
  formData.append("resume", {
    uri: file.uri,
    name: file.name,
    type: file.mimeType,
  } as any);

  const authHeader = await getAuthHeader();

  const fetchPromise = fetch(`${API_BASE_URL}/resume/upload`, {
    method: "POST",
    headers: {
      ...authHeader,
      // Deliberately NOT setting Content-Type — fetch assigns the correct
      // multipart boundary automatically when body is a FormData instance.
      // Setting it manually here is the #1 cause of "multer sees no file."
    },
    body: formData,
  });

  const response = await withTimeout(fetchPromise, TIMEOUT_MS);
  const text = await response.text();
  let data: any;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    const message = data?.error ?? data?.message ?? `HTTP ${response.status}`;
    throw new Error(message);
  }
  return data as UploadResumeResponse;
}

// ── getUploadedResume ─────────────────────────────────────────────────────────
export async function getUploadedResume(): Promise<UploadedResume> {
  return api.get<UploadedResume>("/resume/upload");
}

// ── deleteUploadedResume ──────────────────────────────────────────────────────
export async function deleteUploadedResume(): Promise<{
  success: boolean;
  activeSource: ResumeSource;
}> {
  return api.delete<{ success: boolean; activeSource: ResumeSource }>(
    "/resume/upload",
  );
}

// ── setResumeSource ───────────────────────────────────────────────────────────
// Switches activeSource between "manual" and "uploaded" — used when both
// exist and the user needs to pick which drives ATS scoring + job matching.
export async function setResumeSource(
  source: ResumeSource,
): Promise<{ activeSource: ResumeSource }> {
  return api.put<{ activeSource: ResumeSource }>("/resume/source", { source });
}
