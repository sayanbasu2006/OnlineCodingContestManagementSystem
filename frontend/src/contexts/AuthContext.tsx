import { useState, createContext, useContext, useEffect } from "react";
import type { ReactNode } from "react";
import { fetchActiveParticipation } from "../api/api";

export interface User {
  user_id: number;
  username: string;
  email: string;
  role: string;
}

export interface ActiveContest {
  active_contest_id: number;
  start_time: string;
  duration_minutes: number;
}

interface AuthContextType {
  user: User | null;
  activeContest: ActiveContest | null;
  login: (user: User, token: string, remember?: boolean) => void;
  logout: () => void;
  refreshActiveContest: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const c = useContext(AuthContext);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const s = localStorage.getItem("user") || sessionStorage.getItem("user");
    return s ? JSON.parse(s) : null;
  });
  const [activeContest, setActiveContest] = useState<ActiveContest | null>(null);

  const refreshActiveContest = async () => {
    if (!user) {
      setActiveContest(null);
      return;
    }
    try {
      const res = await fetchActiveParticipation();
      setActiveContest(res.active_contest_id ? res : null);
    } catch {
      setActiveContest(null);
    }
  };

  useEffect(() => {
    refreshActiveContest();
  }, [user]);

  const login = (u: User, token: string, remember: boolean = true) => {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem("token", token);
    storage.setItem("user", JSON.stringify(u));
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setUser(null);
    setActiveContest(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        activeContest,
        login,
        logout,
        refreshActiveContest,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
