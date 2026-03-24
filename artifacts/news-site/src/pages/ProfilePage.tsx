import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useUserAuth } from "@/context/UserAuthContext";
import { useLang } from "@/context/LangContext";
import { t } from "@/i18n/ui";
import { useBookmarks } from "@/hooks/useBookmarks";
import { User, X, Calendar, BookOpen, Camera } from "lucide-react";

const FONT_CN = "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif";

const TAG_MAP: Record<string, { zh: string; en: string; href: string }> = {
  "杰夫●贝佐斯": { zh: "杰夫●贝佐斯", en: "Jeff Bezos", href: "/jiuye" },
  "人工智能与就业": { zh: "人工智能与就业", en: "AI & Employment", href: "/jiuye" },
  "中德贸易": { zh: "中德贸易", en: "China-Germany Trade", href: "/jinrong" },
  "华纳兄弟探索": { zh: "华纳兄弟探索", en: "Warner Bros. Discovery", href: "/shenghuo" },
  "医疗科学": { zh: "医疗科学", en: "Medical Science", href: "/yanglao" },
  "爱泼斯坦案": { zh: "爱泼斯坦案", en: "Epstein Case", href: "/shenghuo" },
  "jiuye": { zh: "就业", en: "Employment", href: "/jiuye" },
  "jiaoyu": { zh: "教育", en: "Education", href: "/jiaoyu" },
  "jinrong": { zh: "金融", en: "Finance", href: "/jinrong" },
  "yanglao": { zh: "养老", en: "Elderly Care", href: "/yanglao" },
  "shenghuo": { zh: "生活", en: "Life", href: "/shenghuo" },
  "keji": { zh: "科技", en: "Tech", href: "/keji" },
  "chuangxin": { zh: "创新", en: "Innovation", href: "/chuangxin" },
  "huanjing": { zh: "环境", en: "Environment", href: "/huanjing" },
  "renyuai": { zh: "人与AI", en: "Human & AI", href: "/renyuai" },
  "ubi": { zh: "UBI", en: "UBI", href: "/ubi" },
  "gongkaixin": { zh: "公开信", en: "Open Letter", href: "/gongkaixin" },
};

export default function ProfilePage() {
  const { user, updateAvatar } = useUserAuth();
  const { lang } = useLang();
  const en = lang === "en";
  const { bookmarks, toggleBookmark } = useBookmarks();
  const [, setLocation] = useLocation();
  const [dengjiStatus, setDengjiStatus] = useState<{ registered: boolean; fullName?: string; birthDate?: string; country?: string; registeredAt?: string } | null>(null);
  const [profileData, setProfileData] = useState<{ numericId?: string; avatarUrl?: string | null } | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/dengji/status?userId=${encodeURIComponent(user.id)}`)
      .then(r => r.json())
      .then(d => setDengjiStatus(d))
      .catch(() => {});
    fetch(`/api/auth/profile?userId=${encodeURIComponent(user.id)}`)
      .then(r => r.json())
      .then(d => setProfileData({ numericId: d.numericId, avatarUrl: d.avatarUrl }))
      .catch(() => {});
  }, [user]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 1.5 * 1024 * 1024) {
      alert(t("imageTooLarge", lang));
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const canvas = document.createElement("canvas");
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = dataUrl;
      });

      const size = 256;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d")!;
      const min = Math.min(img.width, img.height);
      const sx = (img.width - min) / 2;
      const sy = (img.height - min) / 2;
      ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
      const compressed = canvas.toDataURL("image/jpeg", 0.8);

      const res = await fetch("/api/auth/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, avatarData: compressed }),
      });
      const data = await res.json();
      if (data.success) {
        updateAvatar(data.avatarUrl);
        setProfileData(prev => prev ? { ...prev, avatarUrl: data.avatarUrl } : prev);
      }
    } catch {
      alert(t("uploadFailed", lang));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const accumulatedIncome = (() => {
    if (!dengjiStatus?.registered || !dengjiStatus.registeredAt) return 0;
    const regDate = new Date(dengjiStatus.registeredAt);
    const now = new Date();
    const regMidnight = new Date(regDate.getFullYear(), regDate.getMonth(), regDate.getDate());
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const daysPassed = Math.floor((todayMidnight.getTime() - regMidnight.getTime()) / (1000 * 60 * 60 * 24));
    const dailyRate = 40000 / 10000;
    return Math.max(0, daysPassed * dailyRate);
  })();

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center" style={{ fontFamily: FONT_CN }}>
            <p className="text-lg text-foreground/70 mb-4">{t("pleaseLoginToView", lang)}</p>
            <Link href="/login">
              <span className="inline-block bg-primary text-white px-6 py-2 rounded-lg font-bold cursor-pointer hover:opacity-90">
                {t("login", lang)}
              </span>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const avatarSrc = profileData?.avatarUrl || user.avatarUrl;
  const displayId = profileData?.numericId || user.numericId || user.id;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow max-w-[680px] mx-auto w-full px-4 md:px-8 py-10">
        <div className="flex items-center gap-4 mb-8">
          <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
            {avatarSrc ? (
              <img src={avatarSrc} alt="avatar" className="w-16 h-16 rounded-full object-cover border-2 border-primary/20" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                <User className="w-8 h-8 text-primary" />
              </div>
            )}
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-5 h-5 text-white" />
            </div>
            {uploading && (
              <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          <div style={{ fontFamily: FONT_CN }}>
            <h1 className="text-2xl font-black text-foreground">{user.username}</h1>
            <p className="text-sm text-foreground/50">{t("regularUser", lang)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
          <div className="bg-card border border-border/40 rounded-xl p-5" style={{ fontFamily: FONT_CN }}>
            <h3 className="text-sm font-bold text-foreground/60 mb-3 flex items-center gap-2">
              <User className="w-4 h-4" />
              {t("accountInfo", lang)}
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-foreground/50">{t("username", lang)}</span>
                <span className="font-medium text-foreground">{user.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground/50">ID</span>
                <span className="font-mono text-xs text-foreground/60">{displayId}</span>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border/40 rounded-xl p-5" style={{ fontFamily: FONT_CN }}>
            <h3 className="text-sm font-bold text-foreground/60 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {t("contractStatus", lang)}
            </h3>
            {dengjiStatus?.registered ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-foreground/50">{t("status", lang)}</span>
                  <span className="font-medium text-green-600">{t("registeredCheck", lang)}</span>
                </div>
              </div>
            ) : (
              <div className="text-sm">
                <p className="text-foreground/50 mb-2">{t("notRegisteredYet", lang)}</p>
                <Link href="/dengji">
                  <span className="text-primary font-bold text-sm cursor-pointer hover:underline">
                    {t("registerNowArrow", lang)}
                  </span>
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="bg-card border border-border/40 rounded-xl p-5" style={{ fontFamily: FONT_CN }}>
          <h3 className="text-sm font-bold text-foreground/60 mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            {t("myFavorites", lang)}
            <span className="ml-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{bookmarks.length}</span>
          </h3>
          {bookmarks.length === 0 ? (
            <p className="text-sm text-foreground/40 text-center py-6">
              {en ? 'You haven\'t saved any articles yet. Click the "☆ Save" button on articles to get started.' : '还没有收藏任何文章，点击文章上的「☆ 收藏」按钮开始收藏。'}
            </p>
          ) : (
            <div className="space-y-3">
              {bookmarks.map(bm => {
                const articleTitle = bm.title || bm.article_id;
                const href = bm.article_id.startsWith("letter-")
                  ? `/gongkaixin/${bm.article_id.replace("letter-", "")}`
                  : bm.article_id.startsWith("page-")
                  ? `/${bm.article_id.replace("page-", "")}`
                  : `/article/${bm.article_id}`;
                return (
                  <div key={bm.article_id} className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-lg px-4 py-3 group">
                    {bm.image_url && (
                      <img src={bm.image_url} alt="" className="w-12 h-12 rounded object-cover flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <Link href={href}>
                        <span className="text-sm text-foreground font-medium cursor-pointer hover:text-primary transition-colors line-clamp-1">
                          {articleTitle}
                        </span>
                      </Link>
                      {bm.category && (
                        <span className="text-xs text-foreground/40 mt-0.5 block">{TAG_MAP[bm.category] ? (en ? TAG_MAP[bm.category].en : TAG_MAP[bm.category].zh) : bm.category}</span>
                      )}
                    </div>
                    <button
                      onClick={() => toggleBookmark(bm.article_id)}
                      className="ml-1 w-5 h-5 flex items-center justify-center rounded-full text-foreground/30 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                      title={t("removeBookmark", lang)}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
