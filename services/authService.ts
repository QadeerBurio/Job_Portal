// services/authService.ts
// ─────────────────────────────────────────────────────────────────────────────
// Handles login, register, logout. Switches between mock and real API.
// ─────────────────────────────────────────────────────────────────────────────

/*

import { ENDPOINTS, USE_MOCK } from "../constants/API";
import { AuthResponse, LoginPayload, RegisterPayload, User } from "../types";
import { api } from "./Api";

// ── Mock helpers ──────────────────────────────────────────────────────────────

const MOCK_USER: User = {
  _id: "mock_user_001",
  name: "Ahmed Ali",
  email: "ahmed@example.pk",
  title: "Software Developer",
  level: "Senior",
  isAvailable: true,
  appliedCount: 12,
  interviewCount: 4,
  savedJobIds: [],
  token: "mock_token_abc123",
};

function mockDelay<T>(value: T, ms = 600): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

// ── Auth service ──────────────────────────────────────────────────────────────

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  if (USE_MOCK) {
    // Accept any email/password in mock mode
    if (!payload.email || !payload.password) {
      throw new Error("Email and password are required.");
    }
    return mockDelay({
      user: { ...MOCK_USER, email: payload.email },
      token: "mock_token_abc123",
    });
  }

  return api.postPublic<AuthResponse>(ENDPOINTS.LOGIN, payload);
}

export async function register(
  payload: RegisterPayload,
): Promise<AuthResponse> {
  if (USE_MOCK) {
    if (!payload.email || !payload.password || !payload.name) {
      throw new Error("All fields are required.");
    }
    return mockDelay({
      user: { ...MOCK_USER, name: payload.name, email: payload.email },
      token: "mock_token_newuser",
    });
  }

  return api.postPublic<AuthResponse>(ENDPOINTS.REGISTER, payload);
}

export async function logout(): Promise<void> {
  if (USE_MOCK) return mockDelay(undefined);
  try {
    await api.post(ENDPOINTS.LOGOUT, {});
  } catch {
    // Ignore logout errors — local state will be cleared by AuthContext
  }
}

export async function getMe(): Promise<User> {
  if (USE_MOCK) return mockDelay(MOCK_USER);
  return api.get<User>(ENDPOINTS.ME);
}


*/
