// context/AuthContext.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Provides auth state (user, token) and actions (login, register, logout)
// to the whole app. Persists token in AsyncStorage.
// ─────────────────────────────────────────────────────────────────────────────
/*
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import { STORAGE_KEYS } from "../constants/API";
import {
    login as apiLogin,
    register as apiRegister,
} from "../services/authService";
import { LoginPayload, RegisterPayload, User } from "../types";

// ── Types ─────────────────────────────────────────────────────────────────────

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean; // true while restoring from storage on app start
  isLoggedIn: boolean;
}

interface AuthContextType extends AuthState {
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
}

// ── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from AsyncStorage on app start
  useEffect(() => {
    (async () => {
      try {
        const [storedToken, storedUser] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN),
          AsyncStorage.getItem(STORAGE_KEYS.USER),
        ]);
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.warn("Failed to restore auth session", e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // ── Persist helpers ────────────────────────────────────────────────────────

  const persist = async (u: User, t: string) => {
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, t),
      AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(u)),
    ]);
    setUser(u);
    setToken(t);
  };

  const clear = async () => {
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN),
      AsyncStorage.removeItem(STORAGE_KEYS.USER),
    ]);
    setUser(null);
    setToken(null);
  };

  // ── Actions ────────────────────────────────────────────────────────────────

  const login = useCallback(async (payload: LoginPayload) => {
   // const { user: u, token: t } = await apiLogin(payload);
    //await persist(u, t);
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
  //  const { user: u, token: t } = await apiRegister(payload);
  //  await persist(u, t);
  }, []);

  const logout = useCallback(async () => {
    await clear();
  }, []);

  // ── Value ──────────────────────────────────────────────────────────────────

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isLoggedIn: !!user && !!token,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
*/
