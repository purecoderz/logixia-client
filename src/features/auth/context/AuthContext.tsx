import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { LoginPayload, User } from "../../../services/authservice";
import authservices from "../../../services/authservice";
import {
  AUTH_EXPIRED_EVENT,
  SESSION_INTENT_KEY,
  markSessionActive,
  markSessionLoggedOut,
  wasExplicitlyLoggedOut,
} from "../../../lib/http";

interface AuthContextType {
  profile: User | null;
  login: (payload: LoginPayload) => Promise<User | null>;
  isLoading: boolean;
  updateProfile: (changes: Pick<User, "username">) => void;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [profile, setProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (payload: LoginPayload) => {
    await authservices.userLogin(payload);
    markSessionActive();
    const response = await authservices.getCurrentUser();
    setProfile(response);
    return response;
  };

  const updateProfile = (changes: Pick<User, "username">) => {
    setProfile((current) => (current ? { ...current, ...changes } : current));
  };

  const logout = async () => {
    await authservices.logout();
    markSessionLoggedOut();
    setProfile(null);
    queryClient.clear();
  };

  useEffect(() => {
    const checkLogin = async () => {
      if (wasExplicitlyLoggedOut()) {
        setProfile(null);
        setIsLoading(false);
        return;
      }
      try {
        const res = await authservices.getCurrentUser();
        setProfile(res);
      } catch {
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkLogin();
  }, []);

  // session really expired (refresh failed): clear everything, the protected route redirects
  useEffect(() => {
    const onExpired = () => {
      setProfile(null);
      queryClient.clear();
    };
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
  }, [queryClient]);

  useEffect(() => {
    const syncLogout = (event: StorageEvent) => {
      if (event.key !== SESSION_INTENT_KEY || event.newValue !== "logged-out") {
        return;
      }
      setProfile(null);
      queryClient.clear();
    };
    window.addEventListener("storage", syncLogout);
    return () => window.removeEventListener("storage", syncLogout);
  }, [queryClient]);

  return (
    <AuthContext value={{ profile, login, isLoading, logout, updateProfile }}>
      {children}
    </AuthContext>
  );
}

export { AuthProvider };

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
