import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { useLang } from "@/context/LangContext";
import { useAdminPresence } from "@/hooks/useAdminPresence";
import { Users, FileText, Bookmark, ClipboardList, Shield, Plus, Trash2, GripVertical, Save, Image as ImageIcon, MessageSquare, Mail, Send, Megaphone, Reply, Pencil, Search } from "lucide-react";

const FONT_CN = "'Noto Sans SC', 'PingFang SC', sans-serif";
const API = `${import.meta.env.BASE_URL}api`;

function AdminLoginGate() {
  const { login } = useAdminAuth();
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);
  const { lang } = useLang();
  const en = lang === "en";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (login(pw)) {
      setError(false);
    } else {
      setError(true);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="flex-1 flex items-center justify-center">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm" style={{ fontFamily: FONT_CN }}>
          <h2 className="text-xl font-bold text-foreground mb-6 text-center">{en ? "Admin Login" : "管理员登录"}</h2>
          <input
            type="password"
            value={pw}
            onChange={(e) => { setPw(e.target.value); setError(false); }}
            placeholder={en ? "Enter admin password" : "请输入管理员密码"}
            className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 mb-4"
            autoFocus
          />
          {error && <p className="text-red-500 text-xs mb-3 text-center">{en ? "Wrong password" : "密码错误"}</p>}
          <button
            type="submit"
            className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-primary/90 transition-colors"
          >
            {en ? "Login" : "登录"}
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
}

type Stats = {
  counts: { users: number; dengji: number; articles: number; follows: number };
  recentUsers: { id: string; username: string; numericId: string | null; avatarUrl: string | null; createdAt: string }[];
  recentDengji: { id: number; fullName: string; country: string; birthDate: string; createdAt: string; username: string }[];
};

type SlideData = {
  kind: "chart" | "article";
  title: string;
  titleEn: string;
  subtitle: string;
  subtitleEn: string;
  label: string;
  labelEn: string;
  imageUrl: string;
  href: string;
};

type FeedbackItem = {
  id: number;
  user_id: string | null;
  username: string;
  email: string;
  subject: string;
  message: string;
  admin_reply: string;
  replied_at: string | null;
  created_at: string;
};

const EMPTY_SLIDE: SlideData = {
  kind: "article", title: "", titleEn: "", subtitle: "", subtitleEn: "",
  label: "🔥 热搜", labelEn: "🔥 Trending", imageUrl: "", href: "",
};

export default function AdminDashboard() {
  const { isAdmin, password } = useAdminAuth();
  const [, navigate] = useLocation();
  const { lang } = useLang();
  const en = lang === "en";
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [slides, setSlides] = useState<SlideData[]>([]);
  const [slidesLoading, setSlidesLoading] = useState(true);
  const [slidesSaving, setSlidesSaving] = useState(false);
  const [slidesSaved, setSlidesSaved] = useState(false);
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [feedbackLoading, setFeedbackLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "slides" | "feedback" | "broadcast" | "editperms">("overview");
  const [replyingId, setReplyingId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replySending, setReplySending] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [broadcastSending, setBroadcastSending] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState("");
  const { onlineAdmins } = useAdminPresence();
  const [editPermUsers, setEditPermUsers] = useState<{ id: string; username: string; numericId: string | null; avatarUrl: string | null; canEdit: boolean; createdAt: string }[]>([]);
  const [editPermLoading, setEditPermLoading] = useState(true);
  const [editPermSearch, setEditPermSearch] = useState("");
  const [editPermToggling, setEditPermToggling] = useState<string | null>(null);

  const fetchFeedback = useCallback(() => {
    fetch(`${API}/feedback`, { headers: { "x-admin-password": password } })
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setFeedbackList(data); })
      .catch(() => {})
      .finally(() => setFeedbackLoading(false));
  }, [password]);

  useEffect(() => {
    if (!isAdmin) return;
    fetch(`${API}/admin/stats`, { headers: { "x-admin-password": password } })
      .then((r) => { if (!r.ok) throw new Error("Unauthorized"); return r.json(); })
      .then((d) => { setStats(d); setLoading(false); })
      .catch(() => setLoading(false));

    fetchFeedback();

    fetch(`${API}/admin/users-edit-perms`, { headers: { "x-admin-password": password } })
      .then((r) => r.json())
      .then((data: any[]) => { if (Array.isArray(data)) setEditPermUsers(data); })
      .catch(() => {})
      .finally(() => setEditPermLoading(false));

    fetch(`${API}/hero-slides`)
      .then((r) => r.json())
      .then((data: any[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setSlides(data.map((s) => ({
            kind: s.kind || "article",
            title: s.title || "",
            titleEn: s.titleEn || "",
            subtitle: s.subtitle || "",
            subtitleEn: s.subtitleEn || "",
            label: s.label || "",
            labelEn: s.labelEn || "",
            imageUrl: s.imageUrl || "",
            href: s.href || "",
          })));
        }
        setSlidesLoading(false);
      })
      .catch(() => setSlidesLoading(false));
  }, [isAdmin, navigate, password]);

  const updateSlide = useCallback((index: number, field: keyof SlideData, value: string) => {
    setSlides((prev) => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
    setSlidesSaved(false);
  }, []);

  const addSlide = useCallback(() => {
    setSlides((prev) => [...prev, { ...EMPTY_SLIDE }]);
    setSlidesSaved(false);
  }, []);

  const removeSlide = useCallback((index: number) => {
    setSlides((prev) => prev.filter((_, i) => i !== index));
    setSlidesSaved(false);
  }, []);

  const moveSlide = useCallback((from: number, to: number) => {
    setSlides((prev) => {
      const arr = [...prev];
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return arr;
    });
    setSlidesSaved(false);
  }, []);

  const saveSlides = useCallback(async () => {
    setSlidesSaving(true);
    try {
      const res = await fetch(`${API}/hero-slides`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-admin-password": password },
        body: JSON.stringify({ slides }),
      });
      if (res.ok) setSlidesSaved(true);
    } catch {}
    setSlidesSaving(false);
  }, [slides, password]);

  const handleCoverUpload = useCallback(async (index: number, file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        updateSlide(index, "imageUrl", reader.result);
      }
    };
    reader.readAsDataURL(file);
  }, [updateSlide]);

  const handleReply = useCallback(async (fb: FeedbackItem) => {
    if (!replyText.trim()) return;
    setReplySending(true);
    try {
      await fetch(`${API}/notifications/reply-feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": password },
        body: JSON.stringify({ feedbackId: fb.id, userId: fb.user_id, message: replyText }),
      });
      setFeedbackList((prev) => prev.map((f) => f.id === fb.id ? { ...f, admin_reply: replyText, replied_at: new Date().toISOString() } : f));
      setReplyingId(null);
      setReplyText("");
    } catch {}
    setReplySending(false);
  }, [replyText, password]);

  const handleToggleEditPerm = useCallback(async (userId: string, newVal: boolean) => {
    setEditPermToggling(userId);
    try {
      await fetch(`${API}/admin/users-edit-perms/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-admin-password": password },
        body: JSON.stringify({ canEdit: newVal }),
      });
      setEditPermUsers((prev) => prev.map((u) => u.id === userId ? { ...u, canEdit: newVal } : u));
    } catch {}
    setEditPermToggling(null);
  }, [password]);

  const handleBroadcast = useCallback(async () => {
    if (!broadcastMsg.trim()) return;
    setBroadcastSending(true);
    setBroadcastResult("");
    try {
      const res = await fetch(`${API}/notifications/broadcast`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": password },
        body: JSON.stringify({ title: broadcastTitle || "系统通知", message: broadcastMsg }),
      });
      const data = await res.json();
      if (data.ok) {
        setBroadcastResult(en ? `Sent to ${data.sent} user(s)` : `已发送给 ${data.sent} 位用户`);
        setBroadcastTitle("");
        setBroadcastMsg("");
      }
    } catch {}
    setBroadcastSending(false);
  }, [broadcastTitle, broadcastMsg, password, en]);

  if (!isAdmin) {
    return <AdminLoginGate />;
  }

  function formatDate(d: string) {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" });
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow w-full max-w-[960px] mx-auto px-4 md:px-6 pt-8 pb-20" style={{ fontFamily: FONT_CN }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-black text-foreground">
              {en ? "Admin Dashboard" : "管理员后台"}
            </h1>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-200">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-bold text-green-700">
              {en ? `${onlineAdmins} admin(s) online` : `${onlineAdmins} 位管理员在线`}
            </span>
          </div>
        </div>

        <div className="flex gap-2 mb-8 border-b border-border/40">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 text-sm font-bold transition-colors border-b-2 -mb-[1px] ${activeTab === "overview" ? "border-primary text-primary" : "border-transparent text-foreground/50 hover:text-foreground/70"}`}
          >
            {en ? "Overview" : "数据概览"}
          </button>
          <button
            onClick={() => setActiveTab("slides")}
            className={`px-4 py-2 text-sm font-bold transition-colors border-b-2 -mb-[1px] ${activeTab === "slides" ? "border-primary text-primary" : "border-transparent text-foreground/50 hover:text-foreground/70"}`}
          >
            {en ? "Hero Slides" : "首页滑动板块"}
          </button>
          <button
            onClick={() => setActiveTab("feedback")}
            className={`px-4 py-2 text-sm font-bold transition-colors border-b-2 -mb-[1px] ${activeTab === "feedback" ? "border-primary text-primary" : "border-transparent text-foreground/50 hover:text-foreground/70"}`}
          >
            {en ? "Feedback" : "用户反馈"}
            {feedbackList.length > 0 && (
              <span className="ml-1.5 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{feedbackList.length}</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("broadcast")}
            className={`px-4 py-2 text-sm font-bold transition-colors border-b-2 -mb-[1px] flex items-center gap-1.5 ${activeTab === "broadcast" ? "border-primary text-primary" : "border-transparent text-foreground/50 hover:text-foreground/70"}`}
          >
            <Megaphone size={14} />
            {en ? "Broadcast" : "全员通知"}
          </button>
          <button
            onClick={() => setActiveTab("editperms")}
            className={`px-4 py-2 text-sm font-bold transition-colors border-b-2 -mb-[1px] flex items-center gap-1.5 ${activeTab === "editperms" ? "border-primary text-primary" : "border-transparent text-foreground/50 hover:text-foreground/70"}`}
          >
            <Pencil size={14} />
            {en ? "Edit Perms" : "编辑权限"}
          </button>
        </div>

        {activeTab === "overview" && (
          <>
            {loading ? (
              <div className="text-center py-20 text-muted-foreground text-sm">
                {en ? "Loading..." : "加载中……"}
              </div>
            ) : stats ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                  <StatCard icon={<Users className="w-5 h-5" />} label={en ? "Registered Users" : "注册用户"} value={stats.counts.users} color="blue" />
                  <StatCard icon={<ClipboardList className="w-5 h-5" />} label={en ? "Dengji Records" : "登记人数"} value={stats.counts.dengji} color="green" />
                  <StatCard icon={<FileText className="w-5 h-5" />} label={en ? "Total Articles" : "文章总数"} value={stats.counts.articles} color="orange" />
                  <StatCard icon={<Bookmark className="w-5 h-5" />} label={en ? "Total Saves" : "收藏总数"} value={stats.counts.follows} color="violet" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-card border border-border/40 rounded-xl p-5">
                    <h3 className="text-sm font-bold text-foreground/60 mb-4 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {en ? "Recent Registrations" : "最近注册用户"}
                      <span className="ml-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{stats.counts.users}</span>
                    </h3>
                    {stats.recentUsers.length === 0 ? (
                      <p className="text-sm text-foreground/40 text-center py-6">
                        {en ? "No registered users yet" : "暂无注册用户"}
                      </p>
                    ) : (
                      <div className="space-y-2.5 max-h-[400px] overflow-y-auto">
                        {stats.recentUsers.map((u) => (
                          <div key={u.id} className="flex items-center justify-between py-2 px-3 bg-background/60 rounded-lg border border-border/20">
                            <div className="flex items-center gap-3">
                              {u.avatarUrl ? (
                                <img src={u.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                                  {u.username.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-medium text-foreground">{u.username}</p>
                                <p className="text-[11px] text-foreground/40 font-mono">ID: {u.numericId || "-"}</p>
                              </div>
                            </div>
                            <span className="text-[11px] text-foreground/40">{formatDate(u.createdAt)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-card border border-border/40 rounded-xl p-5">
                    <h3 className="text-sm font-bold text-foreground/60 mb-4 flex items-center gap-2">
                      <ClipboardList className="w-4 h-4" />
                      {en ? "Recent Dengji Records" : "最近登记记录"}
                      <span className="ml-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{stats.counts.dengji}</span>
                    </h3>
                    {stats.recentDengji.length === 0 ? (
                      <p className="text-sm text-foreground/40 text-center py-6">
                        {en ? "No dengji records yet" : "暂无登记记录"}
                      </p>
                    ) : (
                      <div className="space-y-2.5 max-h-[400px] overflow-y-auto">
                        {stats.recentDengji.map((d) => (
                          <div key={d.id} className="py-2 px-3 bg-background/60 rounded-lg border border-border/20">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-medium text-foreground">{d.fullName}</p>
                              <span className="text-[11px] text-foreground/40">{formatDate(d.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-foreground/50">
                              {d.username && <span>{en ? "User" : "账号"}: {d.username}</span>}
                              <span>{en ? "Country" : "国家"}: {d.country}</span>
                              <span>{en ? "Born" : "出生"}: {formatDate(d.birthDate)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-20 text-red-500 text-sm">
                {en ? "Failed to load data" : "加载失败"}
              </div>
            )}
          </>
        )}

        {activeTab === "slides" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-foreground/60">
                {en ? "Manage the hero slideshow on the homepage. Changes take effect after saving." : "管理首页顶部的滑动板块。修改后需点击保存生效。"}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={addSlide}
                  className="flex items-center gap-1.5 bg-green-600 text-white text-sm font-bold px-3 py-1.5 rounded-md hover:bg-green-700 transition-colors"
                >
                  <Plus size={14} />
                  {en ? "Add Slide" : "添加幻灯片"}
                </button>
                <button
                  onClick={saveSlides}
                  disabled={slidesSaving}
                  className="flex items-center gap-1.5 bg-primary text-white text-sm font-bold px-4 py-1.5 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  <Save size={14} />
                  {slidesSaving ? (en ? "Saving..." : "保存中...") : slidesSaved ? (en ? "Saved ✓" : "已保存 ✓") : (en ? "Save" : "保存")}
                </button>
              </div>
            </div>

            {slidesLoading ? (
              <div className="text-center py-12 text-muted-foreground text-sm">{en ? "Loading..." : "加载中..."}</div>
            ) : slides.length === 0 ? (
              <div className="text-center py-12 text-foreground/40">
                <p className="mb-3">{en ? "No slides configured. Using defaults." : "暂无自定义幻灯片，使用默认内容。"}</p>
                <button onClick={addSlide} className="text-primary text-sm font-bold hover:underline">
                  {en ? "Add your first slide" : "添加第一张幻灯片"}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {slides.map((slide, idx) => (
                  <div key={idx} className="bg-card border border-border/40 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col gap-0.5">
                          {idx > 0 && (
                            <button onClick={() => moveSlide(idx, idx - 1)} className="text-foreground/30 hover:text-foreground/60 text-xs">▲</button>
                          )}
                          <GripVertical size={14} className="text-foreground/30" />
                          {idx < slides.length - 1 && (
                            <button onClick={() => moveSlide(idx, idx + 1)} className="text-foreground/30 hover:text-foreground/60 text-xs">▼</button>
                          )}
                        </div>
                        <span className="text-sm font-bold text-foreground/70">
                          {en ? `Slide ${idx + 1}` : `幻灯片 ${idx + 1}`}
                        </span>
                        <select
                          value={slide.kind}
                          onChange={(e) => updateSlide(idx, "kind", e.target.value)}
                          className="text-xs bg-background border border-border/40 rounded px-2 py-1 text-foreground/70"
                        >
                          <option value="article">{en ? "Article (with image)" : "文章（带图片）"}</option>
                          <option value="chart">{en ? "Chart (data insight)" : "图表（数据洞察）"}</option>
                        </select>
                      </div>
                      <button
                        onClick={() => removeSlide(idx)}
                        className="text-red-400 hover:text-red-600 transition-colors p-1"
                        title={en ? "Delete" : "删除"}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-foreground/50 mb-1 block">{en ? "Title (CN)" : "标题（中文）"}</label>
                        <input
                          value={slide.title}
                          onChange={(e) => updateSlide(idx, "title", e.target.value)}
                          className="w-full text-sm bg-background border border-border/40 rounded px-3 py-1.5 focus:outline-none focus:border-primary"
                          placeholder={en ? "Chinese title" : "中文标题"}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-foreground/50 mb-1 block">{en ? "Title (EN)" : "标题（英文）"}</label>
                        <input
                          value={slide.titleEn}
                          onChange={(e) => updateSlide(idx, "titleEn", e.target.value)}
                          className="w-full text-sm bg-background border border-border/40 rounded px-3 py-1.5 focus:outline-none focus:border-primary"
                          placeholder={en ? "English title" : "英文标题"}
                        />
                      </div>

                      {slide.kind === "chart" ? (
                        <>
                          <div>
                            <label className="text-xs text-foreground/50 mb-1 block">{en ? "Subtitle (CN)" : "副标题（中文）"}</label>
                            <input
                              value={slide.subtitle}
                              onChange={(e) => updateSlide(idx, "subtitle", e.target.value)}
                              className="w-full text-sm bg-background border border-border/40 rounded px-3 py-1.5 focus:outline-none focus:border-primary"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-foreground/50 mb-1 block">{en ? "Subtitle (EN)" : "副标题（英文）"}</label>
                            <input
                              value={slide.subtitleEn}
                              onChange={(e) => updateSlide(idx, "subtitleEn", e.target.value)}
                              className="w-full text-sm bg-background border border-border/40 rounded px-3 py-1.5 focus:outline-none focus:border-primary"
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <label className="text-xs text-foreground/50 mb-1 block">{en ? "Label (CN)" : "标签（中文）"}</label>
                            <input
                              value={slide.label}
                              onChange={(e) => updateSlide(idx, "label", e.target.value)}
                              className="w-full text-sm bg-background border border-border/40 rounded px-3 py-1.5 focus:outline-none focus:border-primary"
                              placeholder="🔥 热搜"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-foreground/50 mb-1 block">{en ? "Label (EN)" : "标签（英文）"}</label>
                            <input
                              value={slide.labelEn}
                              onChange={(e) => updateSlide(idx, "labelEn", e.target.value)}
                              className="w-full text-sm bg-background border border-border/40 rounded px-3 py-1.5 focus:outline-none focus:border-primary"
                              placeholder="🔥 Trending"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-foreground/50 mb-1 block">{en ? "Link URL" : "链接地址"}</label>
                            <input
                              value={slide.href}
                              onChange={(e) => updateSlide(idx, "href", e.target.value)}
                              className="w-full text-sm bg-background border border-border/40 rounded px-3 py-1.5 focus:outline-none focus:border-primary"
                              placeholder="/qingnian/xuedai"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-foreground/50 mb-1 block">{en ? "Cover Image" : "封面图片"}</label>
                            <div className="flex gap-2">
                              <input
                                value={slide.imageUrl}
                                onChange={(e) => updateSlide(idx, "imageUrl", e.target.value)}
                                className="flex-1 text-sm bg-background border border-border/40 rounded px-3 py-1.5 focus:outline-none focus:border-primary"
                                placeholder={en ? "Image URL or upload" : "图片URL或上传"}
                              />
                              <label className="flex items-center gap-1 bg-foreground/10 text-foreground/60 text-xs font-bold px-3 py-1.5 rounded cursor-pointer hover:bg-foreground/20 transition-colors">
                                <ImageIcon size={12} />
                                {en ? "Upload" : "上传"}
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleCoverUpload(idx, file);
                                    e.target.value = "";
                                  }}
                                />
                              </label>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {slide.kind === "article" && slide.imageUrl && (
                      <div className="mt-3 rounded-lg overflow-hidden border border-border/20" style={{ aspectRatio: "16/9", maxHeight: 160 }}>
                        <img src={slide.imageUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "feedback" && (
          <div>
            <div className="bg-primary/10 border border-primary/20 rounded-lg px-5 py-3 mb-6 flex items-center justify-between">
              <p className="text-sm text-foreground/70" style={{ fontFamily: FONT_CN }}>
                {en ? `${feedbackList.length} feedback message(s) received` : `共收到 ${feedbackList.length} 条用户反馈`}
              </p>
            </div>
            {feedbackLoading ? (
              <div className="text-center py-12 text-foreground/40">{en ? "Loading..." : "加载中..."}</div>
            ) : feedbackList.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-foreground/20 mx-auto mb-3" />
                <p className="text-foreground/40 font-medium">{en ? "No feedback yet" : "暂无反馈信息"}</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {feedbackList.map((fb) => (
                  <div key={fb.id} className="bg-card border border-border/50 rounded-xl p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Mail className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">{fb.username || (en ? "Anonymous" : "匿名用户")}</p>
                          <p className="text-xs text-muted-foreground">{fb.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {new Date(fb.created_at).toLocaleString(en ? "en-US" : "zh-CN")}
                        </span>
                        <button
                          onClick={async () => {
                            if (!confirm(en ? "Delete this feedback?" : "确认删除该反馈？")) return;
                            await fetch(`${API}/feedback/${fb.id}`, {
                              method: "DELETE",
                              headers: { "x-admin-password": password },
                            });
                            setFeedbackList((prev) => prev.filter((f) => f.id !== fb.id));
                          }}
                          className="text-red-400 hover:text-red-600 transition-colors"
                          title={en ? "Delete" : "删除"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {fb.subject && (
                      <span className="inline-block text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded mb-2">
                        {fb.subject}
                      </span>
                    )}
                    <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{fb.message}</p>

                    {fb.admin_reply && (
                      <div className="mt-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                        <p className="text-xs font-bold text-green-700 mb-1 flex items-center gap-1">
                          <Reply size={12} />
                          {en ? "Admin Reply" : "管理员回复"}
                          {fb.replied_at && <span className="font-normal text-green-600 ml-2">{new Date(fb.replied_at).toLocaleString(en ? "en-US" : "zh-CN")}</span>}
                        </p>
                        <p className="text-sm text-green-800 whitespace-pre-wrap">{fb.admin_reply}</p>
                      </div>
                    )}

                    {fb.user_id && (
                      <div className="mt-3">
                        {replyingId === fb.id ? (
                          <div className="flex flex-col gap-2">
                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder={en ? "Type your reply..." : "输入回复内容..."}
                              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[80px] resize-y"
                              autoFocus
                            />
                            <div className="flex items-center gap-2 justify-end">
                              <button
                                onClick={() => { setReplyingId(null); setReplyText(""); }}
                                className="px-3 py-1.5 text-xs border border-border rounded-md hover:bg-muted transition-colors"
                              >
                                {en ? "Cancel" : "取消"}
                              </button>
                              <button
                                onClick={() => handleReply(fb)}
                                disabled={replySending || !replyText.trim()}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                              >
                                <Send size={12} />
                                {replySending ? (en ? "Sending..." : "发送中...") : (en ? "Send Reply" : "发送回复")}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setReplyingId(fb.id); setReplyText(fb.admin_reply || ""); }}
                            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
                          >
                            <Reply size={12} />
                            {fb.admin_reply ? (en ? "Edit Reply" : "修改回复") : (en ? "Reply" : "回复")}
                          </button>
                        )}
                      </div>
                    )}
                    {!fb.user_id && (
                      <p className="mt-2 text-[10px] text-foreground/30">{en ? "Anonymous user, cannot reply" : "匿名用户，无法回复"}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "broadcast" && (
          <div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg px-5 py-3 mb-6">
              <p className="text-sm text-orange-800 flex items-center gap-2">
                <Megaphone size={16} />
                {en ? "Send a notification to all registered users" : "向所有注册用户发送通知"}
              </p>
            </div>

            <div className="bg-card border border-border/50 rounded-xl p-6">
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-bold text-foreground/60 mb-1">
                    {en ? "Notification Title" : "通知标题"}
                  </label>
                  <input
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                    placeholder={en ? "System Notification" : "系统通知"}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground/60 mb-1">
                    {en ? "Notification Content" : "通知内容"} *
                  </label>
                  <textarea
                    value={broadcastMsg}
                    onChange={(e) => setBroadcastMsg(e.target.value)}
                    placeholder={en ? "Enter the message to broadcast..." : "输入要发送的通知内容..."}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[120px] resize-y"
                  />
                </div>
                <div className="flex items-center justify-between">
                  {broadcastResult && (
                    <span className="text-sm text-green-600 font-medium">{broadcastResult}</span>
                  )}
                  <button
                    onClick={handleBroadcast}
                    disabled={broadcastSending || !broadcastMsg.trim()}
                    className="flex items-center gap-1.5 ml-auto px-5 py-2 bg-primary text-white text-sm font-bold rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    <Send size={14} />
                    {broadcastSending ? (en ? "Sending..." : "发送中...") : (en ? "Send to All Users" : "发送给全部用户")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "editperms" && (
          <div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-5 py-3 mb-6">
              <p className="text-sm text-blue-800 flex items-center gap-2">
                <Pencil size={16} />
                {en ? "Grant or revoke article editing permissions for registered users" : "为已注册用户开放或撤销文章编辑权限"}
              </p>
            </div>

            <div className="relative mb-4">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30" />
              <input
                value={editPermSearch}
                onChange={(e) => setEditPermSearch(e.target.value)}
                placeholder={en ? "Search by username or ID..." : "搜索用户名或ID..."}
                className="w-full border border-border rounded-lg pl-9 pr-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div className="bg-primary/10 border border-primary/20 rounded-lg px-5 py-2 mb-4 flex items-center justify-between">
              <span className="text-xs text-foreground/60">
                {en
                  ? `${editPermUsers.filter((u) => u.canEdit).length} user(s) with edit permission`
                  : `${editPermUsers.filter((u) => u.canEdit).length} 位用户拥有编辑权限`}
              </span>
              <span className="text-xs text-foreground/40">
                {en ? `${editPermUsers.length} total users` : `共 ${editPermUsers.length} 位用户`}
              </span>
            </div>

            {editPermLoading ? (
              <div className="text-center py-12 text-foreground/40">{en ? "Loading..." : "加载中..."}</div>
            ) : editPermUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-foreground/20 mx-auto mb-3" />
                <p className="text-foreground/40 font-medium">{en ? "No registered users" : "暂无注册用户"}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {editPermUsers
                  .filter((u) => {
                    if (!editPermSearch.trim()) return true;
                    const q = editPermSearch.toLowerCase();
                    return u.username.toLowerCase().includes(q) || (u.numericId && u.numericId.includes(q));
                  })
                  .map((u) => (
                    <div key={u.id} className="flex items-center justify-between py-3 px-4 bg-card border border-border/40 rounded-xl">
                      <div className="flex items-center gap-3">
                        {u.avatarUrl ? (
                          <img src={u.avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                            {u.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-bold text-foreground">{u.username}</p>
                          <p className="text-[11px] text-foreground/40 font-mono">ID: {u.numericId || u.id.slice(0, 8)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {u.canEdit && (
                          <span className="text-[11px] font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                            {en ? "Editor" : "编辑者"}
                          </span>
                        )}
                        <button
                          onClick={() => handleToggleEditPerm(u.id, !u.canEdit)}
                          disabled={editPermToggling === u.id}
                          className={`text-xs font-bold px-4 py-1.5 rounded-md transition-colors disabled:opacity-50 ${
                            u.canEdit
                              ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                              : "bg-green-600 text-white hover:bg-green-700"
                          }`}
                        >
                          {editPermToggling === u.id
                            ? (en ? "..." : "...")
                            : u.canEdit
                              ? (en ? "Revoke" : "撤销权限")
                              : (en ? "Grant Edit" : "开放权限")}
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    green: "bg-green-50 text-green-600 border-green-200",
    orange: "bg-orange-50 text-orange-600 border-orange-200",
    violet: "bg-violet-50 text-violet-600 border-violet-200",
  };
  const cls = colorMap[color] || colorMap.blue;

  return (
    <div className={`rounded-xl border p-4 ${cls}`}>
      <div className="flex items-center gap-2 mb-2 opacity-70">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="text-3xl font-black">{value}</p>
    </div>
  );
}
