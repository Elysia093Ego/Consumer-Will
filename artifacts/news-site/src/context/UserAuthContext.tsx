import { createContext, useContext, useState, useCallback, ReactNode } from "react";

const SESSION_KEY = "willers_user_session";

export type SiteUser = {
  id: string;
  username: string;
  numericId?: string;
  avatarUrl?: string | null;
  canEdit?: boolean;
  canUpload?: boolean;
};

interface UserAuthContextValue {
  user: SiteUser | null;
  login: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  updateAvatar: (avatarUrl: string) => void;
}

const UserAuthContext = createContext<UserAuthContextValue | null>(null);

export function UserAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SiteUser | null>(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      return raw ? (JSON.parse(raw) as SiteUser) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback(async (username: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, error: data.error ?? "登录失败" };
      const u: SiteUser = { id: data.id, username: data.username, numericId: data.numericId, avatarUrl: data.avatarUrl, canEdit: !!data.canEdit, canUpload: !!data.canUpload };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(u));
      setUser(u);
      return { ok: true };
    } catch {
      return { ok: false, error: "网络错误，请重试" };
    }
  }, []);

  const register = useCallback(async (username: string, password: string) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, error: data.error ?? "注册失败" };
      const u: SiteUser = { id: data.id, username: data.username, numericId: data.numericId };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(u));
      setUser(u);
      return { ok: true };
    } catch {
      return { ok: false, error: "网络错误，请重试" };
    }
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  const updateAvatar = useCallback((avatarUrl: string) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, avatarUrl };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <UserAuthContext.Provider value={{ user, login, register, logout, updateAvatar }}>
      {children}
    </UserAuthContext.Provider>
  );
}

export function useUserAuth(): UserAuthContextValue {
  const ctx = useContext(UserAuthContext);
  if (!ctx) throw new Error("useUserAuth must be used inside UserAuthProvider");
  return ctx;
}
