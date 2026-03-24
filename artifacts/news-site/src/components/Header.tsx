import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ChevronDown, ShieldCheck, LogOut, User } from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { useUserAuth } from "@/context/UserAuthContext";
import { useLang } from "@/context/LangContext";
import { useEditMode } from "@/context/EditModeContext";
import { NotificationBell } from "@/components/NotificationBell";
import { SearchButton } from "@/components/SearchModal";
import { t, LANG_LABELS } from "@/i18n/ui";
import type { Lang } from "@/i18n/ui";

const standaloneItems = [
  { key: "home",       href: "/" },
  { key: "simMarket",  href: "/monishichang" },
  { key: "principle",  href: "/shuxueyuanli" },
  { key: "openLetter", href: "/gongkaixin" },
  { key: "UBI",        href: "/ubi", literal: true },
];

const topicItems = [
  { key: "employment",  href: "/jiuye" },
  { key: "education",   href: "/jiaoyu" },
  { key: "finance",     href: "/jinrong" },
  { key: "elderCare",   href: "/yanglao" },
  { key: "life",        href: "/shenghuo" },
  { key: "tech",        href: "/keji" },
  { key: "innovation",  href: "/chuangxin" },
  { key: "environment", href: "/huanjing" },
  { key: "humanAI",     href: "/renyuai", highlight: true },
];

function NavLink({ item, location, lang }: { item: { key: string; href: string; highlight?: boolean; literal?: boolean }; location: string; lang: Lang }) {
  const { overrides } = useEditMode();
  const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
  const resolvedLabel = item.literal ? item.key : (lang === "ja" && overrides[item.key] ? overrides[item.key] : t(item.key, lang));
  return (
    <li className="flex items-center">
      <Link
        href={item.href}
        className={`
          relative py-3 transition-colors duration-200 block whitespace-nowrap
          ${isActive ? "text-white" : "text-white/65 hover:text-white"}
          ${item.highlight ? "font-bold " + (isActive ? "text-primary" : "text-primary/80 hover:text-primary") : ""}
        `}
      >
        {resolvedLabel}
        {isActive && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white rounded-t-sm" />}
      </Link>
    </li>
  );
}

const LANG_ORDER: Lang[] = ["zh", "zh-tw", "en", "ja"];

function EditModeToggle() {
  const { lang } = useLang();
  const { editMode, enableEditMode, disableEditMode } = useEditMode();
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [keyValue, setKeyValue] = useState("");
  const [error, setError] = useState(false);

  if (lang !== "ja") return null;

  if (editMode) {
    return (
      <button
        onClick={disableEditMode}
        className="flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
        編集中
      </button>
    );
  }

  if (showKeyInput) {
    return (
      <div className="flex items-center gap-1">
        <input
          className={`text-xs border rounded px-1.5 py-0.5 w-20 ${error ? "border-red-500" : "border-gray-300"}`}
          placeholder="密钥..."
          value={keyValue}
          autoFocus
          onChange={(e) => { setKeyValue(e.target.value); setError(false); }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              if (enableEditMode(keyValue)) {
                setShowKeyInput(false);
                setKeyValue("");
              } else {
                setError(true);
              }
            }
            if (e.key === "Escape") {
              setShowKeyInput(false);
              setKeyValue("");
              setError(false);
            }
          }}
        />
        <button className="text-xs text-gray-400 hover:text-gray-600" onClick={() => { setShowKeyInput(false); setKeyValue(""); setError(false); }}>✕</button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowKeyInput(true)}
      className="flex items-center gap-1 text-xs text-[#FF9800]/60 hover:text-[#FF9800] transition-colors"
      title="编辑页面模式"
    >
      ✏️ 編集
    </button>
  );
}

export function Header() {
  const [location] = useLocation();
  const { isAdmin, logout: adminLogout } = useAdminAuth();
  const { user, logout: userLogout } = useUserAuth();
  const { lang, setLang } = useLang();
  const en = lang === "en";
  const [topicOpen, setTopicOpen] = useState(false);
  const topicRef = useRef<HTMLLIElement>(null);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  const topicActive = topicItems.some(
    (item) => location === item.href || (item.href !== "/" && location.startsWith(item.href))
  );

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
      if (topicRef.current && !topicRef.current.contains(e.target as Node)) {
        setTopicOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const brandMain: Record<Lang, string> = {
    zh: "我们的意志",
    en: "Our Will:",
    ja: "私たちの意志",
    "zh-tw": "我們的意志",
  };
  const brandSep: Record<Lang, string> = {
    zh: "：",
    en: " ",
    ja: "：",
    "zh-tw": "：",
  };
  const brandSub: Record<Lang, string> = {
    zh: "照亮人类前行的脚步",
    en: "Lighting the Way Forward for Humanity",
    ja: "人類の歩みを照らす",
    "zh-tw": "照亮人類前行的腳步",
  };

  return (
    <header className="w-full flex flex-col">
      <div className="w-full bg-background py-1.5 px-4 md:px-8 flex justify-end items-center gap-3 text-xs font-medium text-muted-foreground border-b border-border/40">

        {user ? (
          <div className="flex items-center gap-2">
            <NotificationBell />
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="w-4 h-4 rounded-full object-cover" />
            ) : (
              <User className="w-3 h-3 text-primary" />
            )}
            <Link href="/profile" className="text-foreground/80 font-medium hover:text-primary transition-colors">
              {user.username}
            </Link>
            <button
              onClick={userLogout}
              className="flex items-center gap-1 hover:text-foreground transition-colors"
              title={t("logout", lang)}
            >
              <LogOut className="w-3 h-3" />
              {t("logout", lang)}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link href="/login" className="hover:text-primary transition-colors duration-200">
              {t("login", lang)}
            </Link>
            <Link href="/register" className="hover:text-primary transition-colors duration-200">
              {t("register", lang)}
            </Link>
          </div>
        )}

        {isAdmin && (
          <>
            <span className="text-border/60 select-none">|</span>
            <div className="flex items-center gap-2">
              <Link href="/ggwl-chs-528123" className="flex items-center gap-1 text-[#FF9800] hover:text-[#e68900] transition-colors font-bold">
                <ShieldCheck className="w-3 h-3" />
                {t("adminDashboard", lang)}
              </Link>
              <EditModeToggle />
              <button
                onClick={adminLogout}
                className="flex items-center gap-1 text-[#FF9800]/60 hover:text-[#e68900] transition-colors"
                title={t("logout", lang)}
              >
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          </>
        )}
      </div>

      <div className="w-full bg-background py-5 px-4 md:px-8 max-w-[1200px] mx-auto w-full">
        <Link href="/">
          <h1 className="font-black text-foreground cursor-pointer hover:opacity-80 transition-opacity"
            style={{ fontSize: lang === "en" ? "clamp(0.55rem, 2.2vw, 1.2rem)" : "clamp(0.6rem, 3.3vw, 1.85rem)", fontFamily: lang === "en" ? "'Georgia', 'Times New Roman', serif" : "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif", letterSpacing: lang === "en" ? "0.03em" : undefined }}>
            {lang === "en" ? (
              <>
                <span className="font-bold italic whitespace-nowrap">{brandMain[lang]}</span>
                <br className="md:hidden" />
                <span className="font-normal text-foreground/55 whitespace-nowrap" style={{ letterSpacing: "0.05em" }}>{brandSub[lang]}</span>
              </>
            ) : (
              <span className="whitespace-nowrap">
                <span className="font-black">{brandMain[lang]}</span>
                <span className="font-normal text-foreground/70">{brandSep[lang]}{brandSub[lang]}</span>
              </span>
            )}
          </h1>
        </Link>
      </div>

      <nav className="w-full bg-secondary text-secondary-foreground sticky top-0 z-50 shadow-lg">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 flex flex-wrap lg:flex-nowrap items-center justify-between">
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 py-2 lg:py-0 text-sm lg:text-base font-medium">
            {standaloneItems.map((item) => (
              <NavLink key={item.href} item={item} location={location} lang={lang} />
            ))}

            <li
              ref={topicRef}
              className="relative flex items-center"
              onMouseEnter={() => setTopicOpen(true)}
              onMouseLeave={() => setTopicOpen(false)}
            >
              <button
                className={`
                  relative py-3 transition-colors duration-200 flex items-center gap-1 whitespace-nowrap
                  ${topicActive || topicOpen ? "text-white" : "text-white/65 hover:text-white"}
                `}
              >
                {t("topics", lang)}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${topicOpen ? "rotate-180" : ""}`} />
              </button>
              {topicOpen && (
                <div className="absolute top-full left-0 mt-0 bg-secondary border border-white/10 shadow-xl z-50 rounded-b-md min-w-[140px]">
                  <ul className="py-1">
                    {topicItems.map((item) => {
                      const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
                      const label = t(item.key, lang);
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={() => setTopicOpen(false)}
                            className={`
                              block px-4 py-2 text-sm transition-colors duration-150 whitespace-nowrap
                              ${isActive ? "text-white bg-white/10" : "text-white/70 hover:text-white hover:bg-white/5"}
                              ${item.highlight ? "font-bold text-primary" : ""}
                            `}
                          >
                            {label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </li>
          </ul>

          <div className="flex items-center gap-4 flex-shrink-0">
          <SearchButton />
          <div ref={langRef} className="relative">
            <button
              onClick={() => setLangOpen((v) => !v)}
              className="flex items-center gap-1 text-sm text-white/70 hover:text-white transition-colors py-3 lg:py-0"
            >
              {LANG_LABELS[lang]} <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${langOpen ? "rotate-180" : ""}`} />
            </button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-1 bg-secondary border border-white/10 shadow-xl z-50 rounded-md min-w-[120px] py-1">
                {LANG_ORDER.map((l) => (
                  <button
                    key={l}
                    onClick={() => { setLang(l); setLangOpen(false); }}
                    className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-150 ${l === lang ? "text-white bg-white/10 font-bold" : "text-white/70 hover:text-white hover:bg-white/5"}`}
                  >
                    {LANG_LABELS[l]}
                  </button>
                ))}
              </div>
            )}
          </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
