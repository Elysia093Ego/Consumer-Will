import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X } from "lucide-react";
import { Link } from "wouter";
import { useLang } from "@/context/LangContext";
import { t } from "@/i18n/ui";

const FONT_CN = "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif";

interface SearchResult {
  id: string;
  title: string;
  content?: string;
  category?: string;
  type?: "article" | "page";
  route?: string;
}

export function SearchButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center text-white/70 hover:text-white transition-colors"
        aria-label="Search"
      >
        <Search className="w-4 h-4" />
      </button>
      {open && <SearchOverlay onClose={() => setOpen(false)} />}
    </>
  );
}

function SearchOverlay({ onClose }: { onClose: () => void }) {
  const { lang } = useLang();
  const en = lang === "en";
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    inputRef.current?.focus();
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/articles/search?q=${encodeURIComponent(q.trim())}`);
      if (res.ok) setResults(await res.json());
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  function handleChange(val: string) {
    setQuery(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => doSearch(val), 300);
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[10vh]" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{ fontFamily: FONT_CN }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border/30">
          <Search className="w-5 h-5 text-foreground/40 flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={en ? "Search articles by title or keyword..." : "搜索文章标题或关键词..."}
            className="flex-1 text-base bg-transparent outline-none placeholder:text-foreground/35 text-foreground"
          />
          <button onClick={onClose} className="text-foreground/40 hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-[50vh] overflow-y-auto">
          {loading && (
            <div className="px-5 py-8 text-center text-foreground/50 text-sm">
              {en ? "Searching..." : "搜索中..."}
            </div>
          )}
          {!loading && query.trim() && results.length === 0 && (
            <div className="px-5 py-8 text-center text-foreground/50 text-sm">
              {en ? "No articles found" : "未找到相关文章"}
            </div>
          )}
          {!loading && results.length > 0 && (
            <ul>
              {results.map((item) => {
                const href = item.type === "page" ? (item.route || `/${item.id}`) : `/article/${item.id}`;
                return (
                  <li key={`${item.type}-${item.id}`}>
                    <Link
                      href={href}
                      onClick={onClose}
                      className="block px-5 py-3 hover:bg-primary/5 transition-colors border-b border-border/10 last:border-b-0"
                    >
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-foreground leading-snug line-clamp-1 flex-1">{item.title}</p>
                        {item.type === "page" && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary flex-shrink-0">
                            {en ? "Page" : "页面"}
                          </span>
                        )}
                      </div>
                      {item.content && (
                        <p className="text-xs text-foreground/50 mt-1 line-clamp-1">
                          {item.content.replace(/<[^>]*>/g, "").slice(0, 100)}
                        </p>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
          {!loading && !query.trim() && (
            <div className="px-5 py-8 text-center text-foreground/35 text-sm">
              {en ? "Type to search articles" : "输入关键词搜索文章"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
