// hooks/useJobs.ts
// ─────────────────────────────────────────────────────────────────────────────
// Custom hook that manages job listing state: loading, error, pagination,
// filtering, and saved-job toggling. Keeps all data-fetching logic out of
// screen components so they stay clean.
// ─────────────────────────────────────────────────────────────────────────────

/*
import { useCallback, useEffect, useRef, useState } from "react";
import {
    fetchJobById,
    fetchJobs,
    fetchRecommended,
    saveJob,
    unsaveJob,
} from "../services/jobsService";
import { FilterState, Job } from "../types";

// ─────────────────────────────────────────────────────────────────────────────
// useJobList — paginated, filterable list of jobs
// ─────────────────────────────────────────────────────────────────────────────

interface UseJobListOptions {
  initialQuery?: string;
  initialFilters?: Partial<FilterState>;
  autoFetch?: boolean;
}

export function useJobList(options: UseJobListOptions = {}) {
  const { initialQuery = "", initialFilters = {}, autoFetch = true } = options;

  const [jobs, setJobs] = useState<Job[]>([]);
  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<Partial<FilterState>>(initialFilters);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Use a ref to avoid stale closure in loadMore
  const pageRef = useRef(page);
  pageRef.current = page;

  const load = useCallback(
    async (q: string, f: Partial<FilterState>, p: number, append = false) => {
      if (p === 1) setIsLoading(true);
      setError(null);
      try {
        const data = await fetchJobs(q, f, p);
        setJobs((prev) => (append ? [...prev, ...data] : data));
        setHasMore(data.length === 20);
        setPage(p);
      } catch (e: any) {
        setError(e?.message ?? "Failed to load jobs");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [],
  );

  // Initial load + re-load when query or filters change
  useEffect(() => {
    if (autoFetch) load(query, filters, 1, false);
  }, [query, filters, autoFetch]); // eslint-disable-line react-hooks/exhaustive-deps

  const refresh = useCallback(() => {
    setIsRefreshing(true);
    load(query, filters, 1, false);
  }, [query, filters, load]);

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      load(query, filters, pageRef.current + 1, true);
    }
  }, [isLoading, hasMore, query, filters, load]);

  const search = useCallback((q: string) => {
    setQuery(q);
  }, []);

  const applyFilters = useCallback((f: Partial<FilterState>) => {
    setFilters(f);
  }, []);

  // Toggle saved state locally (optimistic UI)
  const toggleSave = useCallback(
    async (jobId: string) => {
      setJobs((prev) =>
        prev.map((j) => (j._id === jobId ? { ...j, isSaved: !j.isSaved } : j)),
      );
      try {
        const job = jobs.find((j) => j._id === jobId);
        if (job?.isSaved) {
          await unsaveJob(jobId);
        } else {
          await saveJob(jobId);
        }
      } catch {
        // Revert on error
        setJobs((prev) =>
          prev.map((j) =>
            j._id === jobId ? { ...j, isSaved: !j.isSaved } : j,
          ),
        );
      }
    },
    [jobs],
  );

  return {
    jobs,
    query,
    filters,
    isLoading,
    isRefreshing,
    error,
    hasMore,
    search,
    applyFilters,
    refresh,
    loadMore,
    toggleSave,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// useJobDetail — single job, with save toggle
// ─────────────────────────────────────────────────────────────────────────────

export function useJobDetail(id: string) {
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    fetchJobById(id)
      .then((data) => {
        setJob(data);
        setError(null);
      })
      .catch((e) => setError(e?.message ?? "Failed to load job"))
      .finally(() => setIsLoading(false));
  }, [id]);

  const toggleSave = useCallback(async () => {
    if (!job) return;
    const wasSaved = job.isSaved;
    setJob((prev) => (prev ? { ...prev, isSaved: !wasSaved } : prev));
    try {
      wasSaved ? await unsaveJob(job._id) : await saveJob(job._id);
    } catch {
      setJob((prev) => (prev ? { ...prev, isSaved: wasSaved } : prev));
    }
  }, [job]);

  return { job, isLoading, error, toggleSave };
}

// ─────────────────────────────────────────────────────────────────────────────
// useRecommended — small horizontal list for home screen
// ─────────────────────────────────────────────────────────────────────────────

export function useRecommended(category?: string) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRecommended(category)
      .then(setJobs)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [category]);

  return { jobs, isLoading };
}
*/
