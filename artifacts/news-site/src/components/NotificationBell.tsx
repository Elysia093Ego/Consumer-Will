import { useState, useEffect, useRef, useCallback } from "react";
import { Bell, X, Check, CheckCheck } from "lucide-react";
import { useUserAuth } from "@/context/UserAuthContext";
import { useLang } from "@/context/LangContext";
import { t } from "@/i18n/ui";

const API = `${import.meta.env.BASE_URL}api`;
const FONT_CN = "'Noto Sans SC', 'PingFang SC', sans-serif";

type Notification = {
  id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

export function NotificationBell() {
  const { user } = useUserAuth();
  const { lang } = useLang();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  const fetchUnread = useCallback(() => {
    if (!user) return;
    fetch(`${API}/notifications/${user.id}/unread-count`)
      .then((r) => r.json())
      .then((d) => setUnreadCount(d.count || 0))
      .catch(() => {});
  }, [user]);

  const fetchAll = useCallback(() => {
    if (!user) return;
    fetch(`${API}/notifications/${user.id}`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setNotifications(data); })
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    fetchUnread();
    const iv = setInterval(fetchUnread, 30000);
    return () => clearInterval(iv);
  }, [fetchUnread]);

  useEffect(() => {
    if (open) fetchAll();
  }, [open, fetchAll]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  async function markRead(id: number) {
    await fetch(`${API}/notifications/${id}/read`, { method: "PUT" });
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount((c) => Math.max(0, c - 1));
  }

  async function markAllRead() {
    if (!user) return;
    await fetch(`${API}/notifications/read-all/${user.id}`, { method: "PUT" });
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  }

  async function deleteNotification(id: number, wasUnread: boolean) {
    await fetch(`${API}/notifications/${id}`, { method: "DELETE" });
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (wasUnread) setUnreadCount((c) => Math.max(0, c - 1));
  }

  if (!user) return null;

  const typeLabels: Record<string, Record<string, string>> = {
    feedback_reply: { zh: "反馈回复", en: "Feedback Reply", ja: "フィードバック返信", "zh-tw": "意見回覆" },
    broadcast: { zh: "系统公告", en: "Announcement", ja: "お知らせ", "zh-tw": "系統公告" },
  };
  const typeLabel = (type: string) =>
    typeLabels[type]?.[lang] ?? t("notifications", lang);

  const typeColor = (type: string) => {
    if (type === "feedback_reply") return "bg-blue-100 text-blue-700";
    if (type === "broadcast") return "bg-orange-100 text-orange-700";
    return "bg-gray-100 text-gray-700";
  };

  const localeMap: Record<string, string> = { zh: "zh-CN", en: "en-US", ja: "ja-JP", "zh-tw": "zh-TW" };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-1.5 text-foreground/60 hover:text-foreground transition-colors"
        title={t("notifications", lang)}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="fixed right-4 w-[340px] max-h-[420px] bg-card border border-border/60 rounded-xl shadow-2xl flex flex-col overflow-hidden"
          style={{ fontFamily: FONT_CN, zIndex: 9999, top: "36px" }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
            <h3 className="text-sm font-bold text-foreground">
              {t("notifications", lang)}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
              >
                <CheckCheck size={12} />
                {t("markAllRead", lang)}
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-foreground/30 text-sm">
                {t("noNotifications", lang)}
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 border-b border-border/20 hover:bg-muted/30 transition-colors ${!n.is_read ? "bg-primary/5" : ""}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${typeColor(n.type)}`}>
                          {typeLabel(n.type)}
                        </span>
                        {!n.is_read && <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />}
                      </div>
                      <p className="text-xs font-bold text-foreground mb-0.5 truncate">{n.title}</p>
                      <p className="text-xs text-foreground/70 leading-relaxed line-clamp-3 whitespace-pre-wrap">{n.message}</p>
                      <p className="text-[10px] text-foreground/30 mt-1">
                        {new Date(n.created_at).toLocaleString(localeMap[lang] || "zh-CN")}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1 flex-shrink-0">
                      {!n.is_read && (
                        <button onClick={() => markRead(n.id)} className="text-primary/60 hover:text-primary" title={lang === "en" ? "Mark read" : lang === "ja" ? "既読にする" : "标记已读"}>
                          <Check size={14} />
                        </button>
                      )}
                      <button onClick={() => deleteNotification(n.id, !n.is_read)} className="text-foreground/20 hover:text-red-500" title={t("delete", lang)}>
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
