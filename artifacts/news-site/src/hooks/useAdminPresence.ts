import { useState, useEffect, useRef, useCallback } from "react";
import { useAdminAuth } from "@/context/AdminAuthContext";

const API = `${import.meta.env.BASE_URL}api`;

export function useAdminPresence() {
  const { isAdmin, password } = useAdminAuth();
  const [onlineAdmins, setOnlineAdmins] = useState(1);
  const [articleLocks, setArticleLocks] = useState<Record<string, { sessionId: string; lockedAt: number }>>({});
  const sessionIdRef = useRef<string>("");

  if (!sessionIdRef.current) {
    sessionIdRef.current = `admin_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  useEffect(() => {
    if (!isAdmin) return;
    const sendHeartbeat = () => {
      fetch(`${API}/admin/heartbeat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": password },
        body: JSON.stringify({ sessionId: sessionIdRef.current }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.onlineCount) setOnlineAdmins(data.onlineCount);
          if (data.locks) setArticleLocks(data.locks);
        })
        .catch(() => {});
    };
    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 10_000);
    return () => clearInterval(interval);
  }, [isAdmin, password]);

  const lockArticle = useCallback(async (articleId: string | number): Promise<boolean> => {
    try {
      const r = await fetch(`${API}/admin/lock-article`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": password },
        body: JSON.stringify({ sessionId: sessionIdRef.current, articleId: String(articleId) }),
      });
      return r.ok;
    } catch {
      return false;
    }
  }, [password]);

  const unlockArticle = useCallback(async (articleId: string | number) => {
    try {
      await fetch(`${API}/admin/lock-article`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "x-admin-password": password },
        body: JSON.stringify({ sessionId: sessionIdRef.current, articleId: String(articleId) }),
      });
    } catch {}
  }, [password]);

  return {
    onlineAdmins,
    articleLocks,
    sessionId: sessionIdRef.current,
    lockArticle,
    unlockArticle,
  };
}
