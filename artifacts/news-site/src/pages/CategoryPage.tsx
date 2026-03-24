import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Plus, Upload, Pencil, Trash2, ExternalLink, Check, X, Lock } from "lucide-react";
import { ArticleEditor } from "@/components/ArticleEditor";
import { UserArticleList } from "@/components/UserArticleList";
import { useArticles, UserArticle } from "@/hooks/useArticles";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { useUserAuth } from "@/context/UserAuthContext";

import { useLang } from "@/context/LangContext";
import { t } from "@/i18n/ui";
import { useFollows } from "@/hooks/useFollows";
import { useAdminPresence } from "@/hooks/useAdminPresence";

const ADMIN_PASSWORD = "ggwl528123";

type SidebarLink = { position: number; title: string; url: string };

function useSidebarLinks(category: string) {
  const [links, setLinks] = useState<SidebarLink[]>([]);
  useEffect(() => {
    fetch(`/api/sidebar-links/${category}`)
      .then((r) => r.json())
      .then(setLinks)
      .catch(() => {});
  }, [category]);

  async function updateLink(position: number, title: string, url: string) {
    await fetch(`/api/sidebar-links/${category}/${position}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-admin-password": ADMIN_PASSWORD },
      body: JSON.stringify({ title, url }),
    });
    setLinks((prev) => prev.map((l) => l.position === position ? { ...l, title, url } : l));
  }

  return { links, updateLink };
}

type CategoryConfig = {
  name: string;
  nameEn: string;
  description: string;
};

const categoryData: Record<string, CategoryConfig & { descriptionEn: string }> = {
  gongkaixin: { name: "公开信", nameEn: "Open Letters", description: "面向社会、政府与企业的公开倡议", descriptionEn: "Open initiatives for society, government, and enterprises" },
  jiuye:      { name: "就业",   nameEn: "Employment",   description: "劳动市场、职业转型与未来工作", descriptionEn: "Labor market, career transitions, and the future of work" },
  jiaoyu:     { name: "教育",   nameEn: "Education",    description: "教育改革、学习科技与人才培养", descriptionEn: "Education reform, learning technology, and talent development" },
  jinrong:    { name: "金融",   nameEn: "Finance",      description: "市场动态、投资策略与货币政策", descriptionEn: "Market trends, investment strategies, and monetary policy" },
  yanglao:    { name: "养老",   nameEn: "Elder Care",   description: "老龄化社会、养老政策与退休生活", descriptionEn: "Aging society, elderly care policy, and retirement life" },
  shenghuo:   { name: "生活",   nameEn: "Lifestyle",    description: "生活方式、消费文化与社会趋势", descriptionEn: "Lifestyle, consumer culture, and social trends" },
  keji:       { name: "科技",   nameEn: "Technology",   description: "前沿技术、数字转型与科技政策", descriptionEn: "Cutting-edge technology, digital transformation, and tech policy" },
  chuangxin:  { name: "创新",   nameEn: "Innovation",   description: "商业创新、创业生态与颠覆性变革", descriptionEn: "Business innovation, startup ecosystems, and disruptive change" },
  huanjing:   { name: "环境",   nameEn: "Environment",  description: "气候变化、能源转型与生态保护", descriptionEn: "Climate change, energy transition, and ecological conservation" },
  renyuai:    { name: "人与AI", nameEn: "Human & AI",   description: "人工智能的社会影响、伦理与未来", descriptionEn: "Social impact, ethics, and future of artificial intelligence" },
};

function formatDate(iso: string, en?: boolean) {
  const d = new Date(iso);
  if (en) {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  }
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

interface PresetArticleCardProps {
  article: UserArticle;
  featured?: boolean;
  isAdmin: boolean;
  onEdit: (a: UserArticle) => void;
  onDelete: (id: string) => void;
  lockedByOther?: boolean;
}

function extractText(html: string) {
  if (!html.includes("<")) return html;
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.innerText.replace(/\s+/g, " ").trim();
}

function AdminActions({ article, en, onEdit, onDelete, lockedByOther }: { article: UserArticle; en: boolean; onEdit: (a: UserArticle) => void; onDelete: (id: string) => void; lockedByOther: boolean }) {
  const { lang } = useLang();
  return (
    <div className="ml-auto flex items-center gap-1.5">
      {lockedByOther ? (
        <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded-md">
          <Lock className="w-3 h-3" />
          {t("beingEdited", lang)}
        </span>
      ) : (
        <button onClick={() => onEdit(article)} className="flex items-center gap-1 text-xs text-primary border border-primary/40 px-2 py-1 rounded-md hover:bg-primary hover:text-white transition-colors">
          <Pencil className="w-3 h-3" />
          {t("edit", lang)}
        </button>
      )}
      <button onClick={() => onDelete(article.id)} className="flex items-center gap-1 text-xs text-red-500 border border-red-300 px-2 py-1 rounded-md hover:bg-red-500 hover:text-white transition-colors">
        <Trash2 className="w-3 h-3" />
        {t("delete", lang)}
      </button>
    </div>
  );
}

function PresetArticleCard({ article, featured, isAdmin, onEdit, onDelete, lockedByOther }: PresetArticleCardProps) {
  const { lang: cardLang } = useLang();
  const cardEn = cardLang === "en";
  const displayTitle = cardEn && article.titleEn ? article.titleEn : article.title;
  const displayContent = cardEn && article.contentEn ? article.contentEn : article.content;

  if (featured) {
    return (
      <article className="mb-8 pb-8 border-b border-border">
        {article.imageUrl && (
          <Link href={`/article/${article.id}`}>
            <div className="w-full aspect-[2/1] overflow-hidden mb-4 bg-muted cursor-pointer">
              <img
                src={article.imageUrl}
                alt={displayTitle}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          </Link>
        )}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-muted-foreground">{formatDate(article.publishedAt, cardEn)}</span>
          {isAdmin && (
            <div className="ml-auto flex items-center gap-1.5">
              {lockedByOther ? (
                <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded-md">
                  <Lock className="w-3 h-3" />
                  {cardEn ? "Being edited" : "正在被修改"}
                </span>
              ) : (
                <button
                  onClick={() => onEdit(article)}
                  className="flex items-center gap-1 text-xs text-primary border border-primary/40 px-2 py-1 rounded-md hover:bg-primary hover:text-white transition-colors"
                >
                  <Pencil className="w-3 h-3" />
                  {cardEn ? "Edit" : "编辑"}
                </button>
              )}
              <button
                onClick={() => onDelete(article.id)}
                className="flex items-center gap-1 text-xs text-red-500 border border-red-300 px-2 py-1 rounded-md hover:bg-red-500 hover:text-white transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                {cardEn ? "Delete" : "删除"}
              </button>
            </div>
          )}
        </div>
        <Link href={`/article/${article.id}`}>
          <h2 className="text-xl md:text-2xl font-black text-foreground mb-3 leading-snug hover:text-primary transition-colors cursor-pointer"
            style={{ fontFamily: "'Noto Sans SC', 'PingFang SC', sans-serif" }}>
            {displayTitle}
          </h2>
        </Link>
        {displayContent && (
          <p className="text-sm text-foreground/70 leading-relaxed line-clamp-3">
            {extractText(displayContent)}
          </p>
        )}
      </article>
    );
  }

  return (
    <article className="py-5 flex gap-4">
      {article.imageUrl && (
        <Link href={`/article/${article.id}`}>
          <div className="w-28 h-20 flex-shrink-0 overflow-hidden bg-muted cursor-pointer">
            <img
              src={article.imageUrl}
              alt={displayTitle}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        </Link>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-xs text-muted-foreground">{formatDate(article.publishedAt, cardEn)}</span>
          {isAdmin && (
            <div className="ml-auto flex items-center gap-1.5">
              {lockedByOther ? (
                <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded-md">
                  <Lock className="w-3 h-3" />
                  {cardEn ? "Being edited" : "正在被修改"}
                </span>
              ) : (
                <button
                  onClick={() => onEdit(article)}
                  className="flex items-center gap-1 text-xs text-primary border border-primary/40 px-2 py-1 rounded-md hover:bg-primary hover:text-white transition-colors"
                >
                  <Pencil className="w-3 h-3" />
                  {cardEn ? "Edit" : "编辑"}
                </button>
              )}
              <button
                onClick={() => onDelete(article.id)}
                className="flex items-center gap-1 text-xs text-red-500 border border-red-300 px-2 py-1 rounded-md hover:bg-red-500 hover:text-white transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                {cardEn ? "Delete" : "删除"}
              </button>
            </div>
          )}
        </div>
        <Link href={`/article/${article.id}`}>
          <h3 className="text-base font-bold text-foreground mb-1.5 leading-snug hover:text-primary transition-colors cursor-pointer"
            style={{ fontFamily: "'Noto Sans SC', 'PingFang SC', sans-serif" }}>
            {displayTitle}
          </h3>
        </Link>
        {displayContent && (
          <p className="text-xs text-foreground/65 leading-relaxed line-clamp-2">
            {extractText(displayContent)}
          </p>
        )}
      </div>
    </article>
  );
}

interface CategoryPageProps {
  slug: string;
}

export default function CategoryPage({ slug }: CategoryPageProps) {
  const config = categoryData[slug];
  const { articles: allArticles, publishArticle, updateArticle, deleteArticle } = useArticles(slug);
  const { isAdmin } = useAdminAuth();
  const { user } = useUserAuth();
  const { lang } = useLang();
  const en = lang === "en";
  const { isFollowing, toggleFollow } = useFollows();
  const categoryFollowed = isFollowing(slug);
  const { links: sidebarLinks, updateLink } = useSidebarLinks(slug);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<UserArticle | null>(null);
  const [editingLink, setEditingLink] = useState<SidebarLink | null>(null);
  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const { articleLocks, sessionId, lockArticle, unlockArticle } = useAdminPresence();

  const presetArticles = allArticles.filter((a) => a.isPreset);
  const userArticles = allArticles.filter((a) => !a.isPreset);

  function openNew() { setEditingArticle(null); setEditorOpen(true); }
  async function openEdit(a: UserArticle) {
    if (isAdmin) {
      const locked = await lockArticle(a.id);
      if (!locked) {
        alert(t("articleBeingEdited", lang));
        return;
      }
    }
    setEditingArticle(a);
    setEditorOpen(true);
  }

  if (!config) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <p className="text-muted-foreground">{t("pageNotFound", lang)}</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-grow w-full max-w-[1200px] mx-auto px-4 md:px-6 py-6">
        {/* Category Header */}
        <div className="flex items-center gap-3 mb-1">
          <h1
            className="text-2xl font-black"
            style={{ color: "#8B1A1A", fontFamily: "'Noto Sans SC', 'PingFang SC', sans-serif" }}
          >{en ? config.nameEn : config.name}</h1>
          <button
            onClick={() => { if (user) toggleFollow(slug); }}
            className={`flex items-center gap-1 border text-xs px-2.5 py-1 rounded-md transition-colors ${
              categoryFollowed
                ? "border-primary/40 bg-primary/10 text-primary font-medium"
                : "border-border text-muted-foreground hover:border-primary hover:text-primary"
            }`}
          >
            {categoryFollowed ? (
              <>{t("saved", lang)} ✓</>
            ) : (
              <><Plus className="w-3 h-3" />{t("save", lang)}</>
            )}
          </button>
          {isAdmin && (
            <button
              className="ml-auto flex items-center gap-1.5 bg-primary text-white text-xs font-bold px-3.5 py-1.5 rounded-md hover:bg-primary/90 transition-colors"
              onClick={openNew}
            >
              <Upload className="w-3.5 h-3.5" />
              {t("uploadArticle", lang)}
            </button>
          )}
        </div>
        <p className="text-xs text-muted-foreground mb-5">{en ? config.descriptionEn : config.description}</p>
        <div className="w-full h-px bg-border mb-6" />

        <div className="flex gap-6">
          {/* Main Content — newspaper-style layout */}
          <div className="flex-1 min-w-0">
            {presetArticles.length > 0 && (
              <>
                {/* Hero row: featured large + stacked medium */}
                <div className="flex gap-5 mb-6">
                  {/* Left: featured article with big image */}
                  {presetArticles[0] && (
                    <div className="flex-1 min-w-0 border-b border-border pb-5">
                      {presetArticles[0].imageUrl && (
                        <Link href={`/article/${presetArticles[0].id}`}>
                          <div className="w-full aspect-[16/10] overflow-hidden mb-3 bg-muted cursor-pointer">
                            <img src={presetArticles[0].imageUrl} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                          </div>
                        </Link>
                      )}
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-muted-foreground">{formatDate(presetArticles[0].publishedAt, en)}</span>
                        {isAdmin && <AdminActions article={presetArticles[0]} en={en} onEdit={openEdit} onDelete={deleteArticle} lockedByOther={!!(articleLocks[String(presetArticles[0].id)] && articleLocks[String(presetArticles[0].id)].sessionId !== sessionId)} />}
                      </div>
                      <Link href={`/article/${presetArticles[0].id}`}>
                        <h2 className="text-lg md:text-xl font-black text-foreground mb-2 leading-snug hover:text-primary transition-colors cursor-pointer" style={{ fontFamily: "'Noto Sans SC', 'PingFang SC', sans-serif" }}>
                          {en && presetArticles[0].titleEn ? presetArticles[0].titleEn : presetArticles[0].title}
                        </h2>
                      </Link>
                      {(en ? presetArticles[0].contentEn || presetArticles[0].content : presetArticles[0].content) && (
                        <p className="text-sm text-foreground/70 leading-relaxed line-clamp-3">
                          {extractText(en && presetArticles[0].contentEn ? presetArticles[0].contentEn : presetArticles[0].content)}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Right stack: 2nd and 3rd articles */}
                  {presetArticles.length > 1 && (
                    <div className="hidden md:flex flex-col gap-4 w-[280px] flex-shrink-0">
                      {presetArticles.slice(1, 3).map((article) => (
                        <div key={article.id} className="border-b border-border/60 pb-4">
                          {article.imageUrl && (
                            <Link href={`/article/${article.id}`}>
                              <div className="w-full aspect-[16/9] overflow-hidden mb-2 bg-muted cursor-pointer">
                                <img src={article.imageUrl} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                              </div>
                            </Link>
                          )}
                          <Link href={`/article/${article.id}`}>
                            <h3 className="text-sm font-bold text-foreground leading-snug hover:text-primary transition-colors cursor-pointer mb-1" style={{ fontFamily: "'Noto Sans SC', 'PingFang SC', sans-serif" }}>
                              {en && article.titleEn ? article.titleEn : article.title}
                            </h3>
                          </Link>
                          {(en ? article.contentEn || article.content : article.content) && (
                            <p className="text-xs text-foreground/60 leading-relaxed line-clamp-2">
                              {extractText(en && article.contentEn ? article.contentEn : article.content)}
                            </p>
                          )}
                          {isAdmin && <AdminActions article={article} en={en} onEdit={openEdit} onDelete={deleteArticle} lockedByOther={!!(articleLocks[String(article.id)] && articleLocks[String(article.id)].sessionId !== sessionId)} />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </>
            )}

            {(() => {
              const remainingPreset = presetArticles.slice(3);
              const allCards = [...remainingPreset, ...userArticles];
              if (allCards.length === 0) return null;
              return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-2">
                  {allCards.map((article) => {
                    const displayTitle = en && article.titleEn ? article.titleEn : article.title;
                    const displayContent = en && article.contentEn ? article.contentEn : article.content;
                    return (
                      <article key={article.id} className="flex flex-col">
                        {article.imageUrl && (
                          <Link href={`/article/${article.id}`}>
                            <div className="w-full aspect-[16/10] overflow-hidden bg-muted cursor-pointer">
                              <img src={article.imageUrl} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                            </div>
                          </Link>
                        )}
                        <div className="pt-3 flex flex-col gap-1.5">
                          <span className="text-xs font-bold text-primary">{en ? config.nameEn : config.name}</span>
                          <Link href={`/article/${article.id}`}>
                            <h3 className="text-sm font-black text-foreground leading-snug hover:text-primary transition-colors cursor-pointer" style={{ fontFamily: "'Noto Sans SC', 'PingFang SC', sans-serif" }}>
                              {displayTitle}
                            </h3>
                          </Link>
                          {displayContent && (
                            <p className="text-xs text-foreground/60 leading-relaxed line-clamp-2">
                              {extractText(displayContent)}
                            </p>
                          )}
                          {isAdmin && <AdminActions article={article} en={en} onEdit={openEdit} onDelete={deleteArticle} lockedByOther={!!(articleLocks[String(article.id)] && articleLocks[String(article.id)].sessionId !== sessionId)} />}
                        </div>
                      </article>
                    );
                  })}
                </div>
              );
            })()}
          </div>

          {/* Right Sidebar — 热门文章 (sticky) */}
          <aside className="hidden lg:block w-[240px] flex-shrink-0 border-l border-border/40 pl-5 self-start sticky top-4">
            <h3 className="text-base font-black text-foreground pb-2 mb-4 border-b-2 border-foreground" style={{ fontFamily: "'Noto Sans SC', 'PingFang SC', sans-serif" }}>
              {t("trending", lang)}
            </h3>
            <ol className="flex flex-col gap-0">
              {sidebarLinks.map((link, idx) => (
                <li key={link.position} className="group relative py-2.5 border-b border-border/30">
                  {editingLink?.position === link.position ? (
                    <div className="flex flex-col gap-1.5">
                      <input className="w-full text-xs border border-border rounded px-2 py-1 bg-background" placeholder="标题" value={linkTitle} onChange={(e) => setLinkTitle(e.target.value)} />
                      <input className="w-full text-xs border border-border rounded px-2 py-1 bg-background" placeholder="链接 URL" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} />
                      <div className="flex gap-1">
                        <button onClick={async () => { await updateLink(link.position, linkTitle, linkUrl); setEditingLink(null); }} className="flex items-center gap-0.5 text-xs text-white bg-primary px-2 py-0.5 rounded"><Check className="w-3 h-3" /> {t("saveDone", lang)}</button>
                        <button onClick={() => setEditingLink(null)} className="flex items-center gap-0.5 text-xs text-muted-foreground border border-border px-2 py-0.5 rounded"><X className="w-3 h-3" /> {t("cancel", lang)}</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2">
                      <span className="text-lg font-black text-primary/70 w-5 flex-shrink-0 leading-tight">{idx + 1}.</span>
                      <div className="flex-1 min-w-0">
                        {link.url ? (
                          <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-foreground font-bold hover:text-primary transition-colors leading-snug block">
                            {link.title}
                          </a>
                        ) : (
                          <span className="text-sm text-foreground/70 leading-snug block">{link.title}</span>
                        )}
                      </div>
                      {isAdmin && (
                        <button onClick={() => { setEditingLink(link); setLinkTitle(link.title); setLinkUrl(link.url); }} className="opacity-0 group-hover:opacity-100 transition-opacity text-primary flex-shrink-0" title={t("edit", lang)}>
                          <Pencil className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </aside>
        </div>

      </main>

      <Footer />

      {editorOpen && (
        <ArticleEditor
          category={slug}
          categoryName={config.name}
          editing={editingArticle}
          onPublish={publishArticle}
          onUpdate={updateArticle}
          onDelete={deleteArticle}
          onClose={() => {
            if (editingArticle && isAdmin) unlockArticle(editingArticle.id);
            setEditorOpen(false);
          }}
        />
      )}
    </div>
  );
}
