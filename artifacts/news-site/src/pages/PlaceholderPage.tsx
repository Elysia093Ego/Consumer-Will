import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Link } from "wouter";
import { ArrowLeft, FileText, Edit3, Check, X, Eye, ThumbsUp } from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { useLang } from "@/context/LangContext";
import { t } from "@/i18n/ui";
import { ArticleEditor } from "@/components/ArticleEditor";
import { LeftSocialSidebar } from "@/components/LeftSocialSidebar";
import { useUserAuth } from "@/context/UserAuthContext";
import { useBookmarks } from "@/hooks/useBookmarks";
import { FruitTreeTable } from "@/components/FruitTreeTable";

const FONT_CN = "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif";
const API = "/api";

interface PlaceholderPageProps {
  title: string;
  titleEn?: string;
  tag?: string;
  tagEn?: string;
  description?: string;
  descriptionEn?: string;
  pageId: string;
  noStandardModules?: boolean;
}

export default function PlaceholderPage({ title: defaultTitle, titleEn: defaultTitleEn, tag: defaultTag, tagEn: defaultTagEn, description: defaultDesc, descriptionEn: defaultDescEn, pageId, noStandardModules }: PlaceholderPageProps) {
  const { isAdmin, password } = useAdminAuth();
  const { lang } = useLang();
  const en = lang === "en";
  const { user } = useUserAuth();
  const canEditContent = isAdmin || !!user?.canEdit;
  const { isBookmarked, toggleBookmark } = useBookmarks();

  const [savedTitle, setSavedTitle] = useState("");
  const [savedTitleEn, setSavedTitleEn] = useState("");
  const [savedDesc, setSavedDesc] = useState("");
  const [savedDescEn, setSavedDescEn] = useState("");
  const [savedTag, setSavedTag] = useState("");
  const [savedTagEn, setSavedTagEn] = useState("");
  const [savedImage, setSavedImage] = useState("");
  const [content, setContent] = useState("");
  const [contentEn, setContentEn] = useState("");
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);

  const [editingDesc, setEditingDesc] = useState(false);
  const [draftDesc, setDraftDesc] = useState("");
  const [editingDescEn, setEditingDescEn] = useState(false);
  const [draftDescEn, setDraftDescEn] = useState("");

  const [editingTag, setEditingTag] = useState(false);
  const [draftTag, setDraftTag] = useState("");
  const [editingTagEn, setEditingTagEn] = useState(false);
  const [draftTagEn, setDraftTagEn] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/page-content/${encodeURIComponent(pageId)}`)
      .then((r) => r.json())
      .then((data) => {
        setSavedTitle(data.title || "");
        setSavedTitleEn(data.titleEn || "");
        setSavedDesc(data.description || "");
        setSavedDescEn(data.descriptionEn || "");
        setSavedTag(data.tag || "");
        setSavedTagEn(data.tagEn || "");
        setSavedImage(data.imageUrl || "");
        setContent(data.content || "");
        setContentEn(data.contentEn || "");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [pageId]);

  const displayTitle = savedTitle || defaultTitle;
  const displayTitleEn = savedTitleEn || defaultTitleEn;
  const displayDesc = savedDesc || defaultDesc || "";
  const displayDescEn = savedDescEn || defaultDescEn || "";
  const displayTag = savedTag || defaultTag || "";
  const displayTagEn = savedTagEn || defaultTagEn || "";

  async function saveToApi(updates: Record<string, string>) {
    const payload = {
      title: updates.title ?? savedTitle,
      titleEn: updates.titleEn ?? savedTitleEn,
      description: updates.description ?? savedDesc,
      descriptionEn: updates.descriptionEn ?? savedDescEn,
      tag: updates.tag ?? savedTag,
      tagEn: updates.tagEn ?? savedTagEn,
      imageUrl: updates.imageUrl ?? savedImage,
      content: updates.content ?? content,
      contentEn: updates.contentEn ?? contentEn,
    };
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (password) headers["x-admin-password"] = password;
      if (user?.id) headers["x-user-id"] = user.id;
      await fetch(`${API}/page-content/${encodeURIComponent(pageId)}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(payload),
      });
    } catch {}
  }

  function handleSaveDesc() { setSavedDesc(draftDesc); saveToApi({ description: draftDesc }); setEditingDesc(false); }
  function handleSaveDescEn() { setSavedDescEn(draftDescEn); saveToApi({ descriptionEn: draftDescEn }); setEditingDescEn(false); }
  function handleSaveTag() { setSavedTag(draftTag); saveToApi({ tag: draftTag }); setEditingTag(false); }
  function handleSaveTagEn() { setSavedTagEn(draftTagEn); saveToApi({ tagEn: draftTagEn }); setEditingTagEn(false); }

  async function handleEditorSave(data: { title: string; content: string; titleEn?: string; contentEn?: string; imageUrl?: string }) {
    if (data.title) setSavedTitle(data.title);
    setContent(data.content);
    if (data.titleEn !== undefined) setSavedTitleEn(data.titleEn);
    if (data.contentEn !== undefined) setContentEn(data.contentEn);
    if (data.imageUrl !== undefined) setSavedImage(data.imageUrl);
    await saveToApi({
      title: data.title || savedTitle,
      titleEn: data.titleEn ?? savedTitleEn,
      content: data.content,
      contentEn: data.contentEn ?? contentEn,
      imageUrl: data.imageUrl ?? savedImage,
    });
  }

  const finalTitle = en && displayTitleEn ? displayTitleEn : displayTitle;
  const finalDesc = en && displayDescEn ? displayDescEn : displayDesc;
  const finalTag = en && displayTagEn ? displayTagEn : displayTag;
  const displayContent = en && contentEn ? contentEn : content;

  function renderInlineEdit(
    isEditing: boolean,
    draft: string,
    setDraft: (v: string) => void,
    onSave: () => void,
    onCancel: () => void,
    displayValue: string,
    onStartEdit: () => void,
    placeholder: string,
    className: string,
    style?: React.CSSProperties,
  ) {
    if (isEditing) {
      return (
        <div className="flex items-center gap-2 mb-2">
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="flex-1 bg-white border border-primary/40 rounded px-3 py-1 focus:outline-none focus:border-primary text-sm"
            placeholder={placeholder}
            onKeyDown={(e) => { if (e.key === "Enter") onSave(); if (e.key === "Escape") onCancel(); }}
          />
          <button onClick={onSave} className="text-primary hover:text-primary/80"><Check size={16} /></button>
          <button onClick={onCancel} className="text-foreground/40 hover:text-foreground/60"><X size={16} /></button>
        </div>
      );
    }
    return (
      <p
        className={`group ${canEditContent ? "cursor-pointer" : ""} ${className}`}
        style={style}
        onClick={() => { if (canEditContent) onStartEdit(); }}
      >
        {displayValue || (canEditContent ? placeholder : "")}
        {canEditContent && <Edit3 size={10} className="inline ml-1.5 opacity-0 group-hover:opacity-60 transition-opacity" />}
      </p>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-grow max-w-[960px] mx-auto w-full px-4 md:px-8 py-12">
        <div className="flex gap-4">
          {!noStandardModules && <LeftSocialSidebar
            isSaved={isBookmarked(`page-${pageId}`)}
            onToggleSave={() => {
              if (!user) { alert(t("loginRegisterPrompt", lang)); return; }
              toggleBookmark(`page-${pageId}`, displayTitle);
            }}
          />}
          <div className="flex-1 min-w-0">
        <Link href="/">
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mb-8 cursor-pointer">
            <ArrowLeft className="w-3.5 h-3.5" />
            {t("backHome", lang)}
          </span>
        </Link>

        {renderInlineEdit(
          en ? editingTagEn : editingTag,
          en ? draftTagEn : draftTag,
          en ? setDraftTagEn : setDraftTag,
          en ? handleSaveTagEn : handleSaveTag,
          () => en ? setEditingTagEn(false) : setEditingTag(false),
          finalTag,
          () => {
            if (en) { setDraftTagEn(displayTagEn); setEditingTagEn(true); }
            else { setDraftTag(displayTag); setEditingTag(true); }
          },
          t("enterTag", lang),
          "text-xs font-bold text-primary mb-2 tracking-wide",
          { fontFamily: FONT_CN }
        )}

        <h1
          className="text-2xl md:text-3xl font-black text-foreground mb-4 leading-snug"
          style={{ fontFamily: FONT_CN }}
        >
          {finalTitle}
        </h1>

        {renderInlineEdit(
          en ? editingDescEn : editingDesc,
          en ? draftDescEn : draftDesc,
          en ? setDraftDescEn : setDraftDesc,
          en ? handleSaveDescEn : handleSaveDesc,
          () => en ? setEditingDescEn(false) : setEditingDesc(false),
          finalDesc,
          () => {
            if (en) { setDraftDescEn(displayDescEn); setEditingDescEn(true); }
            else { setDraftDesc(displayDesc); setEditingDesc(true); }
          },
          t("enterDescription", lang),
          "text-base text-foreground/60 mb-8",
          { fontFamily: FONT_CN }
        )}

        {savedImage && (
          <div className="mb-8 rounded-lg overflow-hidden">
            <img src={savedImage} alt="" className="w-full max-h-[400px] object-cover" />
          </div>
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
            style={{ fontFamily: FONT_CN }}
            dangerouslySetInnerHTML={{ __html: displayContent }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-border/20 flex items-center justify-center">
              <FileText className="w-7 h-7 text-muted-foreground/40" />
            </div>
            <p className="text-lg font-bold text-foreground/30" style={{ fontFamily: FONT_CN }}>
              {t("contentComingSoon", lang)}
            </p>
            <p className="text-sm text-muted-foreground/40" style={{ fontFamily: FONT_CN }}>
              {t("pageBeingPrepared", lang)}
            </p>
            {canEditContent && (
              <p className="text-sm text-primary/60" style={{ fontFamily: FONT_CN }}>
                {t("clickEditAbove", lang)}
              </p>
            )}
          </div>
        )}

        {!noStandardModules && (
        <>
        <div className="mt-6" style={{ fontFamily: FONT_CN }}>
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
        </>
        )}
          </div>
        </div>
      </main>

      <Footer />

      {editorOpen && (
        <ArticleEditor
          category="page"
          categoryName={t("page", lang)}
          editing={{
            id: pageId,
            title: displayTitle,
            titleEn: displayTitleEn,
            content: content,
            contentEn: contentEn,
            imageUrl: savedImage,
            category: "page",
            publishedAt: "",
            updatedAt: "",
          }}
          onPublish={() => {}}
          onUpdate={(_id, data) => {
            handleEditorSave(data);
          }}
          onDelete={() => {}}
          onClose={() => setEditorOpen(false)}
        />
      )}
    </div>
  );
}
