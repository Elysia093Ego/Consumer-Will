import { Pencil, Trash2, Lock } from "lucide-react";
import { Link } from "wouter";
import { UserArticle } from "@/hooks/useArticles";
import { useLang } from "@/context/LangContext";

function formatDate(iso: string, en?: boolean) {
  const d = new Date(iso);
  if (en) {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  }
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

function extractText(html: string) {
  if (!html.includes("<")) return html;
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.innerText.replace(/\s+/g, " ").trim();
}

type Props = {
  articles: UserArticle[];
  onEdit: (article: UserArticle) => void;
  isAdmin?: boolean;
  articleLocks?: Record<string, { sessionId: string; lockedAt: number }>;
  mySessionId?: string;
};

export function UserArticleList({ articles, onEdit, isAdmin, articleLocks = {}, mySessionId = "" }: Props) {
  const { lang } = useLang();
  const en = lang === "en";

  if (articles.length === 0) return null;

  return (
    <section className="mb-6">
      <div className="grid grid-cols-3 gap-5">
        {articles.map((article) => {
          const displayTitle = en && article.titleEn ? article.titleEn : article.title;
          const displayContent = en && article.contentEn ? article.contentEn : article.content;
          const lock = articleLocks[String(article.id)];
          const lockedByOther = lock && lock.sessionId !== mySessionId;
          return (
            <article key={article.id} className="flex flex-col">
              {article.imageUrl && (
                <Link href={`/article/${article.id}`}>
                  <div className="w-full aspect-[16/10] overflow-hidden bg-muted cursor-pointer">
                    <img
                      src={article.imageUrl}
                      alt={displayTitle}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </Link>
              )}
              <div className="pt-3 flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{formatDate(article.updatedAt, en)}</span>
                </div>
                <Link href={`/article/${article.id}`}>
                  <h3
                    className="text-sm font-black text-foreground leading-snug hover:text-primary transition-colors cursor-pointer line-clamp-2"
                    style={{ fontFamily: "'Noto Sans SC', 'PingFang SC', sans-serif" }}
                  >
                    {displayTitle}
                  </h3>
                </Link>
                {displayContent && (
                  <p className="text-xs text-foreground/60 leading-relaxed line-clamp-2">
                    {extractText(displayContent)}
                  </p>
                )}
                {isAdmin && (
                  <div className="flex items-center gap-1.5 mt-1">
                    {lockedByOther ? (
                      <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded-md">
                        <Lock className="w-3 h-3" />
                        {en ? "Being edited" : "正在被修改"}
                      </span>
                    ) : (
                      <button
                        onClick={() => onEdit(article)}
                        className="flex items-center gap-1 text-xs text-primary border border-primary/40 px-2 py-1 rounded-md hover:bg-primary hover:text-white transition-colors"
                      >
                        <Pencil className="w-3 h-3" />
                        {en ? "Edit" : "编辑"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
      <div className="w-full h-px bg-border mt-4 mb-2" />
    </section>
  );
}
