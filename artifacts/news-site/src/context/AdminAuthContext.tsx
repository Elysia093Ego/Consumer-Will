import { createContext, useContext, useState, useCallback, ReactNode } from "react";

const ADMIN_SESSION_KEY = "willers_admin_authed";
const ADMIN_PASSWORD = "ggwl528123";

interface AdminAuthContextValue {
  isAdmin: boolean;
  password: string;
  login: (password: string) => boolean;
  logout: () => void;
  showLoginModal: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState<boolean>(
    () => sessionStorage.getItem(ADMIN_SESSION_KEY) === "true"
  );
  const [showLoginModal, setShowLoginModal] = useState(false);

  const login = useCallback((password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
      setIsAdmin(true);
      setShowLoginModal(false);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    setIsAdmin(false);
  }, []);

  const openLoginModal = useCallback(() => setShowLoginModal(true), []);
  const closeLoginModal = useCallback(() => setShowLoginModal(false), []);

  return (
    <AdminAuthContext.Provider value={{ isAdmin, password: isAdmin ? ADMIN_PASSWORD : "", login, logout, showLoginModal, openLoginModal, closeLoginModal }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuthContextValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used inside AdminAuthProvider");
  return ctx;
}
