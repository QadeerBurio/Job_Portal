// services/api.ts
// ─────────────────────────────────────────────────────────────────────────────
// Thin fetch wrapper that:
//   • Attaches Authorization header automatically from AsyncStorage
//   • Handles JSON parse + error throwing
//   • Enforces request timeout
// All other service files import from here — never call fetch() directly.
// ─────────────────────────────────────────────────────────────────────────────
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL, STORAGE_KEYS, TIMEOUT_MS } from "../constants/API";

// ── Helpers ───────────────────────────────────────────────────────────────────

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

// ── Core request ──────────────────────────────────────────────────────────────

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined | null>;
  authenticated?: boolean; // default true
}

export async function request<T = unknown>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, params, authenticated = true } = options;

  // Build URL with query params
  let url = `${API_BASE_URL}${endpoint}`;
  if (params) {
    const qs = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null && v !== "")
      .map(
        ([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`,
      )
      .join("&");
    if (qs) url += `?${qs}`;
  }

  // Build headers
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (authenticated) {
    const authHeader = await getAuthHeader();
    Object.assign(headers, authHeader);
  }

  const fetchPromise = fetch(url, {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const response = await withTimeout(fetchPromise, TIMEOUT_MS);

  // Parse response
  const text = await response.text();
  let data: unknown;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    const message =
      (data as any)?.message ??
      (data as any)?.error ??
      `HTTP ${response.status}`;
    throw new Error(message);
  }

  return data as T;
}

// ── Convenience wrappers ──────────────────────────────────────────────────────

export const api = {
  get: <T>(endpoint: string, params?: RequestOptions["params"]) =>
    request<T>(endpoint, { method: "GET", params }),

  post: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: "POST", body }),

  put: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: "PUT", body }),

  patch: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: "PATCH", body }),

  delete: <T>(endpoint: string) => request<T>(endpoint, { method: "DELETE" }),

  // Un-authenticated version (for login/register)
  postPublic: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: "POST", body, authenticated: false }),
};
