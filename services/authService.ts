// services/authService.ts
// ─────────────────────────────────────────────────────────────────────────────
// Connects to your authController.js which signs JWT as { id } and
// returns { token, user: { _id, name, email } }
//
// KEY FIX: saves the token to AsyncStorage under '@karachijobs/token'
// which is the EXACT same key api.ts reads in getAuthHeader().
// Without this, resume screens get "no token provided" even after login.
// ─────────────────────────────────────────────────────────────────────────────
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://192.168.100.4:5000/api";

// Storage keys — must match constants/API.ts STORAGE_KEYS exactly
const TOKEN_KEY = "@karachijobs/token";
const USER_KEY = "@karachijobs/user";

// ─────────────────────────────────────────────────────────────────────────────
// REGISTER
// ─────────────────────────────────────────────────────────────────────────────
export const registerUser = async (
  name: string,
  email: string,
  password: string,
) => {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message ?? "Registration failed");
  }

  // ✅ Save token so api.ts can read it for all future requests
  if (data.token) {
    await AsyncStorage.setItem(TOKEN_KEY, data.token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
  }

  return data; // { token, user: { _id, name, email } }
};

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────────────────────────────────────
export const loginUser = async (email: string, password: string) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message ?? "Login failed");
  }

  // ✅ Save token so api.ts can read it for all future requests
  if (data.token) {
    await AsyncStorage.setItem(TOKEN_KEY, data.token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
  }

  return data; // { token, user: { _id, name, email } }
};

// ─────────────────────────────────────────────────────────────────────────────
// LOGOUT
// ─────────────────────────────────────────────────────────────────────────────
export const logoutUser = async () => {
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem(USER_KEY);
};

// ─────────────────────────────────────────────────────────────────────────────
// GET STORED TOKEN (for AuthContext to restore session on app start)
// ─────────────────────────────────────────────────────────────────────────────
export const getStoredToken = async (): Promise<string | null> => {
  return AsyncStorage.getItem(TOKEN_KEY);
};

export const getStoredUser = async () => {
  const raw = await AsyncStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
};

// ─────────────────────────────────────────────────────────────────────────────
// AuthContext-compatible named exports
// AuthContext imports { login, register } and expects { user, token } shape
// ─────────────────────────────────────────────────────────────────────────────
export const login = async (payload: { email: string; password: string }) => {
  const data = await loginUser(payload.email, payload.password);
  return {
    token: data.token,
    user: {
      _id: data.user._id,
      name: data.user.name,
      email: data.user.email,
      title: data.user.title ?? "KarachiJobs Member",
      level: data.user.level ?? "Junior",
      isAvailable: data.user.isAvailable ?? true,
      appliedCount: data.user.appliedCount ?? 0,
      interviewCount: data.user.interviewCount ?? 0,
      savedJobIds: data.user.savedJobIds ?? [],
    },
  };
};

export const register = async (payload: {
  name: string;
  email: string;
  password: string;
}) => {
  const data = await registerUser(
    payload.name,
    payload.email,
    payload.password,
  );
  return {
    token: data.token,
    user: {
      _id: data.user._id,
      name: data.user.name,
      email: data.user.email,
      title: data.user.title ?? "KarachiJobs Member",
      level: data.user.level ?? "Junior",
      isAvailable: data.user.isAvailable ?? true,
      appliedCount: data.user.appliedCount ?? 0,
      interviewCount: data.user.interviewCount ?? 0,
      savedJobIds: data.user.savedJobIds ?? [],
    },
  };
};
