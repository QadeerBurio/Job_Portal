// constants/API.ts
// ─────────────────────────────────────────────────────────────────────────────
// In Expo (React Native), environment variables are accessed via
// process.env at BUILD TIME — but TypeScript doesn't know about them
// unless you declare them. We declare them below instead of installing
// @types/node (which causes conflicts in React Native projects).
// ─────────────────────────────────────────────────────────────────────────────

// ── Declare Expo env vars so TypeScript stops complaining ─────────────────────
// This tells TS "these globals exist at runtime" without pulling in all of Node.
declare const process: {
  env: {
    EXPO_PUBLIC_API_URL: string | undefined;
    EXPO_PUBLIC_USE_MOCK: string | undefined;
  };
};

// ── Base URL ──────────────────────────────────────────────────────────────────
export const API_BASE_URL: string =
  process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:5000/api";

console.log("API_BASE_URL =", API_BASE_URL);

// ── Feature flag ──────────────────────────────────────────────────────────────
// Set EXPO_PUBLIC_USE_MOCK=true in your .env to use local mock data.
export const USE_MOCK: boolean = process.env.EXPO_PUBLIC_USE_MOCK === "true";

// ── Endpoints ─────────────────────────────────────────────────────────────────
export const ENDPOINTS = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  LOGOUT: "/auth/logout",
  ME: "/auth/me",

  JOBS: "/jobs",
  JOB_BY_ID: (id: string) => `/jobs/${id}`,
  RECOMMENDED: "/jobs/recommended",
  SAVED_JOBS: "/jobs/saved",
  SAVE_JOB: (id: string) => `/jobs/${id}/save`,
  UNSAVE_JOB: (id: string) => `/jobs/${id}/unsave`,
  APPLY: (id: string) => `/jobs/${id}/apply`,

  PROFILE: "/user/profile",
  UPDATE_PROFILE: "/user/profile",
  JOB_ALERTS: "/user/alerts",
  APPLICATIONS: "/user/applications",
} as const;

// ── Request config ────────────────────────────────────────────────────────────
export const TIMEOUT_MS = 10_000;
export const PAGE_SIZE = 500;

// ── AsyncStorage keys ─────────────────────────────────────────────────────────
export const STORAGE_KEYS = {
  AUTH_TOKEN: "@karachijobs/token",
  USER: "@karachijobs/user",
  SAVED_JOBS: "@karachijobs/saved_jobs",
  THEME_MODE: "@karachijobs/theme",
} as const;
