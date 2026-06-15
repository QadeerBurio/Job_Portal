// services/jobsService.ts
import { ENDPOINTS, PAGE_SIZE, USE_MOCK } from "../constants/API";
import { FilterState, Job } from "../types";
import { api } from "./Api";
import { MOCK_JOBS } from "./mockData";

// ── Mock helpers ──────────────────────────────────────────────────────────────
function applyMockFilters(
  jobs: Job[],
  query: string,
  filters: Partial<FilterState>,
): Job[] {
  let result = [...jobs];
  if (query) {
    const q = query.toLowerCase();
    result = result.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.tags.some((t) => t.toLowerCase().includes(q)) ||
        j.category.toLowerCase().includes(q),
    );
  }
  if (filters.location?.length)
    result = result.filter((j) =>
      filters.location!.some((l) =>
        j.area.toLowerCase().includes(l.toLowerCase()),
      ),
    );
  if (filters.jobType?.length)
    result = result.filter((j) => filters.jobType!.includes(j.jobType));
  if (filters.category)
    result = result.filter((j) => j.category === filters.category);
  if (filters.isInternship != null)
    result = result.filter((j) => j.isInternship === filters.isInternship);
  if (filters.salaryMin)
    result = result.filter((j) => j.salaryMax >= filters.salaryMin!);
  result.sort((a, b) =>
    filters.sortBy === "Salary"
      ? b.salaryMax - a.salaryMax
      : new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime(),
  );
  return result;
}

function delay<T>(v: T, ms = 300): Promise<T> {
  return new Promise((r) => setTimeout(() => r(v), ms));
}

// ── Map Atlas document → Job type ─────────────────────────────────────────────
// Atlas returns _id as a nested { $oid: "..." } object in some drivers.
// This normalises it to a plain string.
function normaliseJob(doc: any): Job {
  return {
    ...doc,
    _id: doc._id?.$oid ?? doc._id?.toString?.() ?? String(doc._id),
  };
}

// ── Public API ────────────────────────────────────────────────────────────────
export async function fetchJobs(
  query = "",
  filters: Partial<FilterState> = {},
  page = 1,
): Promise<Job[]> {
  if (USE_MOCK) {
    const results = applyMockFilters(MOCK_JOBS, query, filters);
    const start = (page - 1) * PAGE_SIZE;
    return delay(results.slice(start, start + PAGE_SIZE));
  }

  // Real Atlas API — returns { data: Job[], total: number, page: number }
  try {
    const response = await api.get<{ data: any[]; total: number }>(
      ENDPOINTS.JOBS,
      {
        q: query || undefined,
        sortBy: filters.sortBy,
        area: filters.location?.join(","),
        jobType: filters.jobType?.join(","),
        category: filters.category ?? undefined,
        isInternship: filters.isInternship ?? undefined,
        salaryMin: filters.salaryMin,
        page,
        limit: PAGE_SIZE,
      },
    );

    console.log("FETCH RESPONSE:", JSON.stringify(response, null, 2));

    const raw = Array.isArray(response) ? response : (response.data ?? []);

    return raw.map(normaliseJob);
  } catch (err) {
    console.error("FETCH JOBS ERROR:", err);
    throw err;
  }
}
/*const response = await api.get<{ data: any[]; total: number }>(
    ENDPOINTS.JOBS,
    {
      q: query || undefined,
      sortBy: filters.sortBy,
      //location: filters.location?.join(","),
      //changed above line to-->
      area: filters.location?.join(","),
      jobType: filters.jobType?.join(","),
      category: filters.category ?? undefined,
      isInternship: filters.isInternship ?? undefined,
      salaryMin: filters.salaryMin,
      page,
      limit: PAGE_SIZE,
    },
  );

  console.log("RESPONSE =", response);

  // Handle both response shapes: array or { data: [] }
  const raw = Array.isArray(response) ? response : (response.data ?? []);
  return raw.map(normaliseJob);
}*/

export async function fetchJobById(id: string): Promise<Job | null> {
  if (USE_MOCK) return delay(MOCK_JOBS.find((j) => j._id === id) ?? null);
  try {
    const doc = await api.get<any>(ENDPOINTS.JOB_BY_ID(id));
    return normaliseJob(doc);
  } catch {
    return null;
  }
}

export async function fetchRecommended(category?: string): Promise<Job[]> {
  if (USE_MOCK) {
    let jobs = MOCK_JOBS.slice(0, 6);
    if (category) jobs = jobs.filter((j) => j.category === category);
    return delay(jobs);
  }
  const raw = await api.get<any[]>(ENDPOINTS.RECOMMENDED, { category });
  return (Array.isArray(raw) ? raw : []).map(normaliseJob);
}

export async function fetchSavedJobs(): Promise<Job[]> {
  if (USE_MOCK)
    return delay(MOCK_JOBS.slice(0, 5).map((j) => ({ ...j, isSaved: true })));
  const raw = await api.get<any[]>(ENDPOINTS.SAVED_JOBS);
  return (Array.isArray(raw) ? raw : []).map(normaliseJob);
}

export async function saveJob(id: string): Promise<void> {
  if (USE_MOCK) return delay(undefined);
  await api.post(ENDPOINTS.SAVE_JOB(id), {});
}

export async function unsaveJob(id: string): Promise<void> {
  if (USE_MOCK) return delay(undefined);
  await api.delete(ENDPOINTS.UNSAVE_JOB(id));
}

export async function applyToJob(id: string): Promise<void> {
  if (USE_MOCK) return delay(undefined);
  await api.post(ENDPOINTS.APPLY(id), {});
}
