import { useState, useEffect } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { useLang } from "@/context/LangContext";
import { t } from "@/i18n/ui";
import { ArticleEditor } from "@/components/ArticleEditor";
import { ArrowLeft, Edit3, Check, X, Eye, ThumbsUp } from "lucide-react";
import { LeftSocialSidebar } from "@/components/LeftSocialSidebar";
import { useUserAuth } from "@/context/UserAuthContext";
import { useBookmarks } from "@/hooks/useBookmarks";
import { FruitTreeTable } from "@/components/FruitTreeTable";

const defaultLetters: Record<string, { recipient: string; subtitle: string }> = {
  "1": {
    recipient: "致杰弗里.辛顿先生的一封公开信；",
    subtitle: "——与辛顿先生探讨如何使AI产生母性问题。",
  },
  "2": {
    recipient: "致埃隆.马斯克先生的一封公开信；",
    subtitle: "——与马斯克先生探讨如何解决美国债务危机问题。",
  },
  "3": {
    recipient: "致戴比斯.哈萨比斯先生的一封公开信；",
    subtitle: "——与哈萨比斯先生探讨产生AGI另外50%的源代码问题。",
  },
  "4": {
    recipient: "致安东尼奥·古特雷斯先生的一封公开信；",
    subtitle: "——与古特雷斯先生探讨如何通过市场解决气候危机问题。",
  },
  "5": {
    recipient: "致比尔.盖茨先生的一封公开信；",
    subtitle: "——与盖茨先生探讨如何通过市场福利推动人类的福利事业发展。",
  },
  "6": {
    recipient: "致谷歌公司的一封公开信；",
    subtitle: "——探讨硅基文明与碳基文明的关系",
  },
  "7": {
    recipient: "致马云先生的一封公开信；",
    subtitle: "——探讨市场是否能创生比私有制企业效率更高的公有制企业",
  },
  "8": { recipient: "致剑桥大学师生的一封公开信；", subtitle: "" },
  "9": { recipient: "致牛津大学师生的一封公开信；", subtitle: "" },
  "10": { recipient: "致曼彻斯特大学师生的一封公开信；", subtitle: "" },
  "11": { recipient: "致全球消费者的一封公开信；", subtitle: "" },
  "12": { recipient: "致全球企业家的一封公开信；", subtitle: "" },
  "13": { recipient: "致全球政治家的一封公开信；", subtitle: "" },
  "14": { recipient: "致全球科学家的一封公开信；", subtitle: "" },
  "15": { recipient: "致全球青年的一封公开信；", subtitle: "" },
};

const API = `${import.meta.env.BASE_URL}api`;

export default function OpenLetterPage() {
  const [, params] = useRoute("/gongkaixin/:id");
  const [, navigate] = useLocation();
  const { isAdmin, password } = useAdminAuth();
  const { lang } = useLang();
  const en = lang === "en";
  const { user } = useUserAuth();
  const canEditContent = isAdmin || !!user?.canEdit;
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const letterId = params?.id || "1";
  const defaults = defaultLetters[letterId];

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [content, setContent] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [subtitleEn, setSubtitleEn] = useState("");
  const [contentEn, setContentEn] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [editingTitle, setEditingTitle] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [editingSubtitle, setEditingSubtitle] = useState(false);
  const [draftSubtitle, setDraftSubtitle] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/open-letters/${letterId}`)
      .then((r) => r.json())
      .then((data) => {
        setTitle(data.title || defaults?.recipient || "");
        setSubtitle(data.subtitle || defaults?.subtitle || "");
        setContent(data.content || "");
        setTitleEn(data.titleEn || "");
        setSubtitleEn(data.subtitleEn || "");
        setContentEn(data.contentEn || "");
      })
      .catch(() => {
        setTitle(defaults?.recipient || "");
        setSubtitle(defaults?.subtitle || "");
      })
      .finally(() => setLoading(false));
  }, [letterId]);

  async function saveToApi(updates: {
    title?: string; subtitle?: string; content?: string;
    titleEn?: string; subtitleEn?: string; contentEn?: string;
  }) {
    const payload = {
      title: updates.title ?? title,
      subtitle: updates.subtitle ?? subtitle,
      content: updates.content ?? content,
      titleEn: updates.titleEn ?? titleEn,
      subtitleEn: updates.subtitleEn ?? subtitleEn,
      contentEn: updates.contentEn ?? contentEn,
    };
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (password) headers["x-admin-password"] = password;
      if (user?.id) headers["x-user-id"] = user.id;
      await fetch(`${API}/open-letters/${letterId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(payload),
      });
    } catch {}
  }

  function handleSaveTitle() {
    setTitle(draftTitle);
    saveToApi({ title: draftTitle });
    setEditingTitle(false);
  }

  function handleSaveSubtitle() {
    setSubtitle(draftSubtitle);
    saveToApi({ subtitle: draftSubtitle });
    setEditingSubtitle(false);
  }

  async function handleSaveFromEditor(data: {
    title: string; content: string;
    titleEn?: string; contentEn?: string;
  }) {
    setTitle(data.title);
    setContent(data.content);
    if (data.titleEn !== undefined) setTitleEn(data.titleEn);
    if (data.contentEn !== undefined) setContentEn(data.contentEn);
    await saveToApi({
      title: data.title,
      content: data.content,
      titleEn: data.titleEn || titleEn,
      contentEn: data.contentEn || contentEn,
    });
  }

  if (!defaults) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <p className="text-foreground/60">{t("letterNotFound", lang)}</p>
        </main>
        <Footer />
      </div>
    );
  }

  const displayTitle = title || defaults.recipient;
  const displaySubtitle = subtitle || defaults.subtitle;
  const displayTitleFinal = en && titleEn ? titleEn : displayTitle;
  const displaySubtitleFinal = en && subtitleEn ? subtitleEn : displaySubtitle;
  const displayContent = en && contentEn ? contentEn : content;

  return (
    <div className="min-h-screen flex flex-col w-full overflow-x-hidden bg-background">
      <Header />
      <main className="flex-grow w-full max-w-[960px] mx-auto px-4 md:px-8 pt-8 pb-20">
        <div className="flex gap-4">
          <LeftSocialSidebar
            isSaved={isBookmarked(`letter-${letterId}`)}
            onToggleSave={() => {
              if (!user) { alert(t("loginRegisterPrompt", lang)); return; }
              toggleBookmark(`letter-${letterId}`, title || defaults?.recipient || `公开信 ${letterId}`);
            }}
          />
          <motion.div
            className="flex-1 min-w-0"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
          <button
            onClick={() => navigate("/gongkaixin")}
            className="flex items-center gap-1 text-sm text-foreground/60 hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft size={16} />
            {t("backToOpenLetters", lang)}
          </button>

          {editingTitle ? (
            <div className="flex items-center gap-2 mb-3">
              <input
                autoFocus
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                className="flex-1 text-2xl md:text-3xl font-black text-foreground bg-white border border-primary/40 rounded px-3 py-1 focus:outline-none focus:border-primary"
                style={{ fontFamily: "'Noto Sans SC', 'PingFang SC', sans-serif" }}
                onKeyDown={(e) => { if (e.key === "Enter") handleSaveTitle(); if (e.key === "Escape") setEditingTitle(false); }}
              />
              <button onClick={handleSaveTitle} className="text-primary hover:text-primary/80"><Check size={20} /></button>
              <button onClick={() => setEditingTitle(false)} className="text-foreground/40 hover:text-foreground/60"><X size={20} /></button>
            </div>
          ) : (
            <h1
              className="text-2xl md:text-3xl font-black text-foreground mb-3 leading-tight group cursor-default"
              style={{ fontFamily: "'Noto Sans SC', 'PingFang SC', sans-serif" }}
              onClick={() => {
                if (canEditContent) {
                  setDraftTitle(displayTitle);
                  setEditingTitle(true);
                }
              }}
            >
              {letterId}、{displayTitleFinal}
              {canEditContent && <Edit3 size={14} className="inline ml-2 opacity-0 group-hover:opacity-60 transition-opacity" />}
            </h1>
          )}

          {editingSubtitle ? (
            <div className="flex items-center gap-2 mb-8">
              <input
                autoFocus
                value={draftSubtitle}
                onChange={(e) => setDraftSubtitle(e.target.value)}
                className="flex-1 text-base text-foreground/60 bg-white border border-primary/40 rounded px-3 py-1 focus:outline-none focus:border-primary"
                placeholder="输入副标题..."
                onKeyDown={(e) => { if (e.key === "Enter") handleSaveSubtitle(); if (e.key === "Escape") setEditingSubtitle(false); }}
              />
              <button onClick={handleSaveSubtitle} className="text-primary hover:text-primary/80"><Check size={20} /></button>
              <button onClick={() => setEditingSubtitle(false)} className="text-foreground/40 hover:text-foreground/60"><X size={20} /></button>
            </div>
          ) : (
            <p
              className="text-base text-foreground/60 mb-8 leading-relaxed group cursor-default"
              onClick={() => {
                if (canEditContent) {
                  setDraftSubtitle(displaySubtitle);
                  setEditingSubtitle(true);
                }
              }}
            >
              {displaySubtitleFinal || (canEditContent ? t("clickToAddSubtitle", lang) : "")}
              {canEditContent && <Edit3 size={12} className="inline ml-2 opacity-0 group-hover:opacity-60 transition-opacity" />}
            </p>
          )}


          {canEditContent && (
            <button
              onClick={() => setEditorOpen(true)}
              className="flex items-center gap-1.5 bg-primary text-white text-sm font-bold px-4 py-2 rounded-sm hover:bg-primary/90 transition-colors mb-6 mt-8"
            >
              <Edit3 size={14} />
              {t("editContent", lang)}
            </button>
          )}

          {loading ? (
            <div className="py-12 text-center text-foreground/40">{t("loading", lang)}</div>
          ) : displayContent ? (
            <div
              className="article-content text-base text-foreground leading-relaxed"
              style={{ fontFamily: "'Noto Sans SC', 'PingFang SC', sans-serif" }}
              dangerouslySetInnerHTML={{ __html: displayContent }}
            />
          ) : (
            <div className="py-16 text-center text-foreground/30 text-base border border-dashed border-border/40 rounded-sm">
              {t("noContentYet", lang)}
              {canEditContent && `，${t("clickEditAbove", lang)}`}
            </div>
          )}

          {/* ── 版权声明 ── */}
          <div className="mt-6" style={{ fontFamily: "'Noto Sans SC', 'PingFang SC', sans-serif" }}>
            <div className="border border-secondary/40 px-6 py-4">
              <p className="text-sm text-foreground/70">
                {en
                  ? "Copyright Notice: You are welcome to share or republish this content, provided the mathematical logic of the original text remains unchanged."
                  : "版权声明：在不改变原文数学逻辑的前提下，欢迎转载与转发。"}
              </p>
            </div>
          </div>

          {/* ── 标配模块：果树表格 ── */}
          <FruitTreeTable />
        </motion.div>
        </div>
      </main>
      <Footer />

      {editorOpen && (
        <ArticleEditor
          category="gongkaixin"
          categoryName={t("openLetterLabel", lang)}
          editing={{
            id: `open-letter-${letterId}`,
            title: displayTitle,
            titleEn: titleEn,
            content: content,
            contentEn: contentEn,
            category: "gongkaixin",
            publishedAt: "",
            updatedAt: "",
          }}
          onPublish={() => {}}
          onUpdate={(_id, data) => {
            handleSaveFromEditor({
              title: data.title,
              content: data.content,
              titleEn: data.titleEn,
              contentEn: data.contentEn,
            });
          }}
          onDelete={() => {}}
          onClose={() => setEditorOpen(false)}
        />
      )}
    </div>
  );
}
