import { useState, useEffect, useCallback } from "react";
import { useParams, useLocation, Link } from "wouter";
import { ArrowLeft, Pencil, Eye, ThumbsUp, Bookmark } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ArticleEditor } from "@/components/ArticleEditor";
import { UserArticle, useArticles } from "@/hooks/useArticles";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { useUserAuth } from "@/context/UserAuthContext";
import { LeftSocialSidebar, ViewMode } from "@/components/LeftSocialSidebar";
import { useLang } from "@/context/LangContext";
import { t } from "@/i18n/ui";
import { useBookmarks } from "@/hooks/useBookmarks";

function useArticleStats(articleId: string | undefined) {
  const [views, setViews] = useState<number | null>(null);
  const [likes, setLikes] = useState<number | null>(null);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (!articleId) return;
    const key = `liked-${articleId}`;
    setLiked(localStorage.getItem(key) === "1");
    fetch(`/api/articles/${articleId}/stats`)
      .then((r) => r.json())
      .then((d) => { setViews(d.views); setLikes(d.likes); })
      .catch(() => {});
    fetch(`/api/articles/${articleId}/view`, { method: "POST" })
      .then((r) => r.json())
      .then((d) => setViews(d.views))
      .catch(() => {});
  }, [articleId]);

  const toggleLike = useCallback(async () => {
    if (!articleId) return;
    const key = `liked-${articleId}`;
    const next = !liked;
    setLiked(next);
    localStorage.setItem(key, next ? "1" : "0");
    const res = await fetch(`/api/articles/${articleId}/like`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ delta: next ? 1 : -1 }),
    });
    const d = await res.json();
    setLikes(d.likes);
  }, [articleId, liked]);

  return { views, likes, liked, toggleLike };
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

const CATEGORY_NAMES: Record<string, string> = {
  jiuye: "就业", jiaoyu: "教育", jinrong: "金融", yanglao: "养老",
  shenghuo: "生活", keji: "科技", chuangxin: "创新", huanjing: "环境",
  renyuai: "人与AI", ubi: "UBI", gongkaixin: "公开信",
};

export default function ArticlePage() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const [article, setArticle] = useState<UserArticle | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const { updateArticle, deleteArticle } = useArticles(article?.category);
  const { isAdmin } = useAdminAuth();
  const { user } = useUserAuth();
  const { views, likes, liked, toggleLike } = useArticleStats(article?.id);
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { lang } = useLang();
  const [viewMode, setViewMode] = useState<ViewMode>("zh");

  useEffect(() => {
    setViewMode(lang === "en" ? "en" : "zh");
  }, [lang]);

  useEffect(() => {
    if (!params.id) return;
    setNotFound(false);
    setArticle(null);
    fetch(`/api/articles/${params.id}`)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json();
      })
      .then((row) => {
        if (!row) return;
        setArticle({
          id: row.id,
          title: row.title,
          content: row.content ?? "",
          imageUrl: row.imageUrl ?? undefined,
          category: row.category,
          publishedAt: row.publishedAt,
          updatedAt: row.updatedAt,
          isPreset: Boolean(row.isPreset ?? row.is_preset ?? false),
        });
      })
      .catch(() => setNotFound(true));
  }, [params.id]);

  function handleUpdate(id: string, updates: Partial<Pick<UserArticle, "title" | "content" | "imageUrl">>) {
    updateArticle(id, updates);
    setArticle((prev) => prev ? { ...prev, ...updates, updatedAt: new Date().toISOString() } : prev);
  }

  function handleDelete(id: string) {
    deleteArticle(id);
    navigate(-1 as unknown as string);
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">文章不存在或已被删除</p>
            <button onClick={() => navigate(-1 as unknown as string)} className="text-primary text-sm hover:underline">返回上一页</button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <p className="text-muted-foreground text-sm">加载中……</p>
        </main>
        <Footer />
      </div>
    );
  }

  const categoryName = CATEGORY_NAMES[article.category] ?? article.category;
  const backPath = article.category === "gongkaixin" ? "/gongkaixin"
    : article.category === "ubi" ? "/ubi"
    : `/${article.category}`;

  const canEdit = isAdmin || !!user?.canEdit || !article.isPreset;
  const isSaved = isBookmarked(article.id);
  const en = lang === "en" || viewMode === "en";

  const showChinese = viewMode === "zh" || viewMode === "bilingual";
  const showEnglish = viewMode === "en" || viewMode === "bilingual";
  const isBilingual = viewMode === "bilingual";

  const zhTitle = article.title;
  const enTitle = article.titleEn || article.title;
  const zhContent = article.content;
  const enContent = article.contentEn || "";

  function renderContent(html: string, fallback: string) {
    if (!html) return null;
    if (html.includes("<")) return <div className="article-content text-base text-foreground leading-relaxed" style={{ fontFamily: "'Noto Sans SC', 'PingFang SC', sans-serif" }} dangerouslySetInnerHTML={{ __html: html }} />;
    return <div className="text-base text-foreground leading-relaxed whitespace-pre-wrap" style={{ fontFamily: "'Noto Sans SC', 'PingFang SC', sans-serif" }}>{html || fallback}</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-grow w-full max-w-[960px] mx-auto px-4 md:px-6 pt-8 pb-20">
        {/* Back */}
        <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
          <button onClick={() => navigate(backPath)} className="flex items-center gap-1 hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            {categoryName}
          </button>
          <span>/</span>
          <span className="text-foreground/50 truncate max-w-[280px]">{article.title}</span>
        </div>

        <div className="flex gap-4">
          {/* Left Social Sidebar */}
          <LeftSocialSidebar
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            isSaved={isSaved}
            onToggleSave={() => {
              if (!user) {
                alert(t("loginRegisterPrompt", lang));
                return;
              }
              toggleBookmark(article.id, article.title, article.imageUrl);
            }}
          />

          {/* Article Content */}
          <div className="flex-grow min-w-0">
            <div className="flex items-center gap-3 mb-4">
              {article.isPreset ? (
                <span className="text-xs font-black text-white bg-secondary px-2 py-0.5">话题</span>
              ) : (
                <span className="text-xs font-black text-white bg-primary px-2 py-0.5">用户投稿</span>
              )}
              <span className="text-xs text-muted-foreground">{categoryName}</span>
            </div>

            {/* Title */}
            {isBilingual ? (
              <div className="grid grid-cols-2 gap-6 mb-4">
                <h1 className="text-2xl font-black text-foreground leading-tight" style={{ fontFamily: "'Noto Sans SC', 'PingFang SC', sans-serif" }}>{zhTitle}</h1>
                <h1 className="text-2xl font-black text-foreground leading-tight">{enTitle}</h1>
              </div>
            ) : (
              <h1 className="text-3xl md:text-4xl font-black text-foreground leading-tight mb-4" style={{ fontFamily: "'Noto Sans SC', 'PingFang SC', sans-serif" }}>
                {showEnglish && !showChinese ? enTitle : zhTitle}
              </h1>
            )}

            <div className="flex items-center gap-4 mb-6 text-xs text-muted-foreground border-b border-border pb-4">
              <span>{viewMode === "en" ? "Published" : "发布于"} {formatDate(article.publishedAt)}</span>
              {article.updatedAt !== article.publishedAt && <span>{viewMode === "en" ? "Edited" : "最后编辑"} {formatDate(article.updatedAt)}</span>}
              <div className="ml-auto flex items-center gap-2">
                {user && (
                  <button
                    onClick={() => toggleBookmark(article.id, article.title, article.imageUrl)}
                    className={`flex items-center gap-1 border px-2.5 py-1 rounded-sm transition-colors text-xs font-medium ${
                      isSaved
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                    }`}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isSaved ? "fill-primary" : ""}`} />
                    {isSaved ? t("saved", lang) : t("save", lang)}
                  </button>
                )}
                {canEdit && (
                  <button onClick={() => setEditorOpen(true)} className="flex items-center gap-1 text-primary border border-primary/40 px-2.5 py-1 rounded-sm hover:bg-primary hover:text-white transition-colors text-xs font-medium">
                    <Pencil className="w-3.5 h-3.5" />
                    {t("edit", lang)}
                  </button>
                )}
              </div>
            </div>

            {article.imageUrl && (
              <div className="w-full mb-6 overflow-hidden rounded-sm">
                <img src={article.imageUrl} alt={article.title} className="w-full max-h-[480px] object-cover" />
              </div>
            )}

            {/* Article body */}
            {isBilingual ? (
              <div className="grid grid-cols-2 gap-8">
                <div>
                  {zhContent ? renderContent(zhContent, "") : <p className="text-muted-foreground italic text-sm">（暂无中文正文）</p>}
                </div>
                <div>
                  {enContent ? renderContent(enContent, "") : <p className="text-muted-foreground italic text-sm">(No English content yet)</p>}
                </div>
              </div>
            ) : showEnglish && !showChinese ? (
              enContent ? renderContent(enContent, "") : <p className="text-muted-foreground italic">(No English content yet — contact the editor to add it)</p>
            ) : (
              zhContent ? renderContent(zhContent, "") : <p className="text-muted-foreground italic">（暂无正文内容）</p>
            )}

            {/* ── 浏览量 & 点赞 ── */}
            <div className="mt-10 mb-2 flex items-center justify-between px-1" style={{ fontFamily: "'Noto Sans SC', 'PingFang SC', sans-serif" }}>
              <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                <Eye className="w-4 h-4" />
                <span>{views === null ? "…" : views.toLocaleString()} {viewMode === "en" ? "views" : "次浏览"}</span>
              </div>
              <button
                onClick={toggleLike}
                className={`flex items-center gap-2 px-5 py-2 rounded-full border-2 text-sm font-medium transition-all select-none ${
                  liked ? "border-primary bg-primary text-white shadow-sm" : "border-border text-foreground/60 hover:border-primary hover:text-primary"
                }`}
              >
                <ThumbsUp className={`w-4 h-4 transition-transform ${liked ? "scale-110" : ""}`} />
                <span>{viewMode === "en" ? "Good Idea" : "好想法"} {likes === null ? "" : `· ${likes.toLocaleString()}`}</span>
              </button>
            </div>

            {/* ── 版权声明 ── */}
            <div className="mt-6" style={{ fontFamily: "'Noto Sans SC', 'PingFang SC', sans-serif" }}>
              <div className="border border-secondary/40 px-6 py-4">
                <p className="text-sm text-foreground/70">
                  {viewMode === "en"
                    ? "Copyright Notice: You are welcome to share or republish this content, provided the mathematical logic of the original text remains unchanged."
                    : "版权声明：在不改变原文数学逻辑的前提下，欢迎转载与转发。"}
                </p>
              </div>
            </div>

            {/* ── 标配模块：果树表格 ── */}
            <Link href="/dengji">
              <div className="mt-6 mb-8 border border-border/40 overflow-hidden cursor-pointer hover:border-primary/50 transition-colors" style={{ fontFamily: "'Noto Sans SC', 'PingFang SC', sans-serif" }}>
                {isBilingual ? (
                  <div className="grid grid-cols-2 gap-0">
                    <table className="w-full border-collapse table-fixed border-r border-border/40">
                      <colgroup><col style={{ width: "26%" }} /><col style={{ width: "26%" }} /><col style={{ width: "25%" }} /><col style={{ width: "23%" }} /></colgroup>
                      <tbody>
                        <tr>{["软件","AI","利润"].map(c=><td key={c} className="border border-border/40 px-2 py-3 text-center text-foreground font-bold text-lg bg-card">{c}</td>)}<td className="border border-border/40 px-2 py-3 text-center font-black text-white text-lg" style={{backgroundColor:"#E8A020"}}>果</td></tr>
                        <tr><td className="border border-border/40 px-2 py-3 text-center text-foreground font-bold text-lg bg-card"><span className="hidden md:inline">电脑|智能手机</span><span className="md:hidden"><span className="underline underline-offset-4">电脑</span><br/>智能手机</span></td>{["休闲时间","消费"].map(c=><td key={c} className="border border-border/40 px-2 py-3 text-center text-foreground font-bold text-lg bg-card">{c}</td>)}<td className="border border-border/40 px-2 py-3 text-center font-black text-white text-lg" style={{backgroundColor:"#2D6A4F"}}>树</td></tr>
                      </tbody>
                    </table>
                    <table className="w-full border-collapse table-fixed">
                      <colgroup><col style={{ width: "26%" }} /><col style={{ width: "26%" }} /><col style={{ width: "25%" }} /><col style={{ width: "23%" }} /></colgroup>
                      <tbody>
                        <tr>{["Software","AI","Profit"].map(c=><td key={c} className="border border-border/40 px-2 py-3 text-center text-foreground font-bold text-lg bg-card">{c}</td>)}<td className="border border-border/40 px-2 py-3 text-center font-black text-white text-lg" style={{backgroundColor:"#E8A020"}}>Fruit</td></tr>
                        <tr>{["Devices","Leisure Time","Spending"].map(c=><td key={c} className="border border-border/40 px-2 py-3 text-center text-foreground font-bold text-lg bg-card">{c}</td>)}<td className="border border-border/40 px-2 py-3 text-center font-black text-white text-lg" style={{backgroundColor:"#2D6A4F"}}>Tree</td></tr>
                      </tbody>
                    </table>
                  </div>
                ) : showEnglish && !showChinese ? (
                  <table className="w-full border-collapse table-fixed">
                    <colgroup><col style={{ width: "26%" }} /><col style={{ width: "26%" }} /><col style={{ width: "25%" }} /><col style={{ width: "23%" }} /></colgroup>
                    <tbody>
                      <tr>{["Software","AI","Profit"].map(c=><td key={c} className="border border-border/40 px-4 py-5 text-center text-foreground font-bold text-2xl bg-card">{c}</td>)}<td className="border border-border/40 px-2 py-5 text-center font-black text-white text-2xl" style={{backgroundColor:"#E8A020"}}>Fruit</td></tr>
                      <tr>{["Devices","Leisure Time","Spending"].map(c=><td key={c} className="border border-border/40 px-4 py-5 text-center text-foreground font-bold text-2xl bg-card">{c}</td>)}<td className="border border-border/40 px-2 py-5 text-center font-black text-white text-2xl" style={{backgroundColor:"#2D6A4F"}}>Tree</td></tr>
                    </tbody>
                  </table>
                ) : (
                  <table className="w-full border-collapse table-fixed">
                    <colgroup><col style={{ width: "26%" }} /><col style={{ width: "26%" }} /><col style={{ width: "25%" }} /><col style={{ width: "23%" }} /></colgroup>
                    <tbody>
                      <tr>{["软件","AI","利润"].map(c=><td key={c} className="border border-border/40 px-4 py-5 text-center text-foreground font-bold text-2xl bg-card">{c}</td>)}<td className="border border-border/40 px-2 py-5 text-center font-black text-white text-2xl" style={{backgroundColor:"#E8A020"}}>果</td></tr>
                      <tr><td className="border border-border/40 px-4 py-5 text-center text-foreground font-bold text-2xl bg-card"><span className="hidden md:inline">电脑|智能手机</span><span className="md:hidden"><span className="underline underline-offset-4">电脑</span><br/>智能手机</span></td>{["休闲时间","消费"].map(c=><td key={c} className="border border-border/40 px-4 py-5 text-center text-foreground font-bold text-2xl bg-card">{c}</td>)}<td className="border border-border/40 px-2 py-5 text-center font-black text-white text-2xl" style={{backgroundColor:"#2D6A4F"}}>树</td></tr>
                    </tbody>
                  </table>
                )}
                <div className="px-5 py-4 bg-[#F8F4EE]">
                  {isBilingual ? (
                    <div className="grid grid-cols-2 gap-6">
                      <p className="text-sm md:text-base font-medium text-foreground leading-relaxed">股权开放共享80%取代免费共享，是科学技术造福人类的保障。</p>
                      <p className="text-sm md:text-base font-medium text-foreground leading-relaxed">80% open equity sharing replaces free sharing — the guarantee that science and technology serve humanity.</p>
                    </div>
                  ) : showEnglish && !showChinese ? (
                    <p className="text-base md:text-lg font-medium text-foreground leading-relaxed">80% open equity sharing replaces free sharing — the guarantee that science and technology serve humanity.</p>
                  ) : (
                    <p className="text-base md:text-lg font-medium text-foreground leading-relaxed">股权开放共享80%取代免费共享，是科学技术造福人类的保障。</p>
                  )}
                </div>
              </div>
            </Link>

          </div>
        </div>
      </main>

      <Footer />

      {editorOpen && (
        <ArticleEditor
          category={article.category}
          categoryName={categoryName}
          editing={article}
          onPublish={() => {}}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onClose={() => setEditorOpen(false)}
        />
      )}
    </div>
  );
}
