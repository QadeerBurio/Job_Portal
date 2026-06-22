// context/AuthContext.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { STORAGE_KEYS } from "../constants/API"; // ← add this import

interface User {
  id?: string;
  name: string;
  email: string;
}

interface LoginData {
  user: User;
  token: string;
}

interface AuthContextType {
  user: User | null;
  login: (data: LoginData) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER); // was "user"
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.log("Auth restore error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (data: LoginData) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user)); // was "user"
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.token); // was "token"
      setUser(data.user);
    } catch (error) {
      console.log("Login error:", error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER); // was "user"
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN); // was "token"
      setUser(null);
    } catch (error) {
      console.log("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isLoading, isLoggedIn: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
