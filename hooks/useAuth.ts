// hooks/useAuth.ts
// ─────────────────────────────────────────────────────────────────────────────
// Wraps useAuth from AuthContext with extra UI-layer helpers:
//   • form state management for login / register
//   • loading + error state local to the form
//   • navigation after success (caller passes onSuccess callback)
// ─────────────────────────────────────────────────────────────────────────────
/*
import { useCallback, useState } from "react";
import { useAuth as useAuthCtx } from "../context/AuthContext";

// Re-export base hook for simple use (e.g. reading user, isLoggedIn)
export { useAuth } from "../context/AuthContext";

/*
// ── useLoginForm ──────────────────────────────────────────────────────────────

interface UseLoginFormOptions {
  onSuccess?: () => void;
}

export function useLoginForm(options: UseLoginFormOptions = {}) {
  const { login } = useAuthCtx();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = (): string | null => {
    if (!email.trim()) return "Email is required.";
    if (!email.includes("@")) return "Enter a valid email address.";
    if (!password) return "Password is required.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    return null;
  };

  const submit = useCallback(async () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await login({ email: email.trim().toLowerCase(), password });
      options.onSuccess?.();
    } catch (e: any) {
      setError(e?.message ?? "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [email, password, login, options]);

  return {
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    error,
    submit,
    clearError: () => setError(null),
  };
}

// ── useRegisterForm ───────────────────────────────────────────────────────────

interface UseRegisterFormOptions {
  onSuccess?: () => void;
}

export function useRegisterForm(options: UseRegisterFormOptions = {}) {
  const { register } = useAuthCtx();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = (): string | null => {
    if (!name.trim()) return "Full name is required.";
    if (!email.trim()) return "Email is required.";
    if (!email.includes("@")) return "Enter a valid email address.";
    if (!password) return "Password is required.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    if (!agreed) return "You must agree to the Terms of Service.";
    return null;
  };

  const submit = useCallback(async () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
      options.onSuccess?.();
    } catch (e: any) {
      setError(e?.message ?? "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [name, email, password, agreed, register, options]);

  return {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    agreed,
    setAgreed,
    isLoading,
    error,
    submit,
    clearError: () => setError(null),
  };
}

*/
