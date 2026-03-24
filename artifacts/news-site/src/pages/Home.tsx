import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useLang } from "@/context/LangContext";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useUserAuth } from "@/context/UserAuthContext";
import { t } from "@/i18n/ui";

type HeroSlide = {
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

const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    kind: "chart",
    title: "现代文明的困境",
    titleEn: "The Predicament of Modern Civilization",
    subtitle: "我们丢失面对未知的能力",
    subtitleEn: "We have lost our ability to face the unknown",
    label: "", labelEn: "", imageUrl: "", href: "",
  },
  {
    kind: "article",
    label: "🔥 热搜", labelEn: "🔥 Trending",
    title: "【青年】就业难如何解决？",
    titleEn: "[Youth] How Do We Solve Unemployment?",
    imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=900&q=80",
    href: "/qingnian/jiuye-nan",
    subtitle: "", subtitleEn: "",
  },
  {
    kind: "article",
    label: "🔥 热搜", labelEn: "🔥 Trending",
    title: "【青年】上学贷如何解决？",
    titleEn: "[Youth] How Do We Solve Student Debt?",
    imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=900&q=80",
    href: "/qingnian/xuedai",
    subtitle: "", subtitleEn: "",
  },
  {
    kind: "article",
    label: "🔥 热搜", labelEn: "🔥 Trending",
    title: "【青年】如何在AI时代学习？",
    titleEn: "[Youth] How to Learn in the Age of AI?",
    imageUrl: "https://images.unsplash.com/photo-1494412651409-8963ce7935a7?w=900&q=80",
    href: "/qingnian/ai-xuexi",
    subtitle: "", subtitleEn: "",
  },
];

const rowOne = [
  {
    tag: "杰夫●贝佐斯", tagEn: "Jeff Bezos",
    title: "【青年】就业难如何解决？", titleEn: "[Youth] How Do We Solve Unemployment?",
    desc: "行业薪资的激增导致顶尖人才流向私营部门，离开公共部门。",
    descEn: "Surging industry wages are pulling top talent away from the public sector.",
    imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&q=80",
    href: "/qingnian/jiuye-nan",
    badge: "编辑推荐", badgeEn: "Editor's Pick",
    time: "1小时前", timeEn: "1h ago",
  },
  {
    tag: "人工智能与就业", tagEn: "AI & Employment",
    title: "【青年】上学贷如何解决？", titleEn: "[Youth] How Do We Solve Student Debt?",
    desc: "当战略要道陷入瘫痪，其后果将远远超出海运领域。",
    descEn: "When critical trade routes are paralyzed, the consequences extend far beyond shipping.",
    imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80",
    href: "/qingnian/xuedai",
    badge: "编辑推荐", badgeEn: "Editor's Pick",
    time: "", timeEn: "",
  },
  {
    tag: "中德贸易", tagEn: "China-Germany Trade",
    title: "【青年】如何在AI时代学习？", titleEn: "[Youth] How to Learn in the Age of AI?",
    desc: "英国的债务高企将束缚新任首相的施政选择。",
    descEn: "Britain's soaring debt will constrain the new PM's policy choices.",
    imageUrl: "https://images.unsplash.com/photo-1494412651409-8963ce7935a7?w=600&q=80",
    href: "/qingnian/ai-xuexi",
    badge: "", badgeEn: "",
    time: "1小时前", timeEn: "1h ago",
  },
];

const rowTwo = [
  {
    tag: "华纳兄弟探索", tagEn: "Warner Bros. Discovery",
    title: "【政府】如何解决债务危机？", titleEn: "[Government] How to Solve the Debt Crisis?",
    desc: "全球债务危机的根源与解决路径分析。",
    descEn: "Analyzing the root causes and solutions for the global debt crisis.",
    imageUrl: "https://images.unsplash.com/photo-1554224155-1696413565d3?w=600&q=80",
    href: "/zhengfu/zhaiwu-weiji",
    badge: "编辑推荐", badgeEn: "Editor's Pick",
    time: "", timeEn: "",
  },
  {
    tag: "医疗科学", tagEn: "Medical Science",
    title: "【政府】如何解决养老难？", titleEn: "[Government] How to Solve the Elder Care Crisis?",
    desc: "老龄化社会中养老体系的重构与创新。",
    descEn: "Restructuring and innovating elder care systems in an aging society.",
    imageUrl: "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=600&q=80",
    href: "/zhengfu/yanglao-nan",
    badge: "", badgeEn: "",
    time: "2小时前", timeEn: "2h ago",
  },
  {
    tag: "爱泼斯坦案", tagEn: "Epstein Case",
    title: "【政府】如何解决就业难？", titleEn: "[Government] How to Solve Unemployment?",
    desc: "就业市场的结构性挑战与政策应对。",
    descEn: "Structural challenges in the job market and policy responses.",
    imageUrl: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=80",
    href: "/zhengfu/jiuye-nan",
    badge: "编辑推荐", badgeEn: "Editor's Pick",
    time: "3小时前", timeEn: "3h ago",
  },
];

const SLIDE_INTERVAL = 4000;

const API = `${import.meta.env.BASE_URL}api`;

function hrefToPageId(href: string): string {
  return href.replace(/^\//, "").replace(/\//g, "-");
}

type CardOverrides = Record<string, { title?: string; titleEn?: string; desc?: string; descEn?: string; imageUrl?: string; tag?: string; tagEn?: string }>;

function applyOverrides<T extends { href: string; title: string; titleEn: string; desc: string; descEn: string; imageUrl: string; tag: string; tagEn: string }>(cards: T[], overrides: CardOverrides): T[] {
  return cards.map((c) => {
    const pid = hrefToPageId(c.href);
    const o = overrides[pid];
    if (!o) return c;
    return {
      ...c,
      title: o.title || c.title,
      titleEn: o.titleEn || c.titleEn,
      desc: o.desc || c.desc,
      descEn: o.descEn || c.descEn,
      imageUrl: o.imageUrl || c.imageUrl,
      tag: o.tag || c.tag,
      tagEn: o.tagEn || c.tagEn,
    };
  });
}

export default function Home() {
  const [activeSlide, setActiveSlide] = useState(0);
  const { lang } = useLang();
  const en = lang === "en";
  const { user } = useUserAuth();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const [cardOverrides, setCardOverrides] = useState<CardOverrides>({});
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(DEFAULT_HERO_SLIDES);

  useEffect(() => {
    fetch(`${API}/hero-slides`)
      .then((r) => r.json())
      .then((slides: HeroSlide[]) => {
        if (Array.isArray(slides) && slides.length > 0) {
          setHeroSlides(slides);
        }
      })
      .catch(() => {});

    const allHrefs = [...rowOne, ...rowTwo].map((c) => hrefToPageId(c.href));
    fetch(`${API}/page-content-batch?ids=${allHrefs.join(",")}`)
      .then((r) => r.json())
      .then((items: any[]) => {
        const map: CardOverrides = {};
        for (const item of items) {
          if (item.title || item.titleEn || item.description || item.descriptionEn || item.imageUrl || item.tag || item.tagEn) {
            map[item.pageId] = {
              title: item.title || undefined,
              titleEn: item.titleEn || undefined,
              desc: item.description || undefined,
              descEn: item.descriptionEn || undefined,
              imageUrl: item.imageUrl || undefined,
              tag: item.tag || undefined,
              tagEn: item.tagEn || undefined,
            };
          }
        }
        setCardOverrides(map);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    }, SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const mergedRowOne = applyOverrides(rowOne, cardOverrides);
  const mergedRowTwo = applyOverrides(rowTwo, cardOverrides);

  const slide = heroSlides[activeSlide];

  return (
    <div className="min-h-screen flex flex-col w-full overflow-x-hidden bg-background">
      <Header />

      <main className="flex-grow w-full max-w-[1200px] mx-auto px-4 md:px-6 pt-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ── LEFT COLUMN ── */}
          <div className="lg:col-span-9 flex flex-col gap-6">

            {/* HERO */}
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative w-full overflow-hidden border border-border/40 rounded-xl"
              style={{ aspectRatio: "16/9", backgroundColor: slide.kind === "article" ? "#111" : "#F0EAE0" }}
            >
            <>
              <AnimatePresence mode="popLayout">
                {slide.kind === "chart" ? (
                  <motion.div
                    key="chart"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(135deg, #F5F0E6 0%, #EDE4D3 50%, #E8DCC8 100%)" }}
                  >
                    <div className="absolute top-0 right-0 w-[40%] h-full opacity-[0.04] z-0"
                      style={{ background: "radial-gradient(circle at 80% 30%, #D2691E 0%, transparent 60%)" }} />
                    <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-between z-10">
                      <div className="max-w-[55%]">
                        <div className="inline-block px-3 py-1 mb-4 rounded-md text-xs font-bold tracking-wide text-white"
                          style={{ backgroundColor: "#D2691E" }}>
                          {t("insight", lang)}
                        </div>
                        <h2
                          className="text-3xl md:text-4xl lg:text-5xl font-black leading-[1.1] mb-3"
                          style={{ fontFamily: "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif", color: "#2C2418" }}
                        >
                          {en ? slide.titleEn : slide.title}
                        </h2>
                        <p className="text-sm md:text-base font-medium" style={{ color: "#6B5D4F" }}>
                          {en ? slide.subtitleEn : slide.subtitle}
                        </p>
                      </div>
                    </div>
                    <div
                      className="absolute bottom-0 left-0 right-0 flex items-end gap-[6px] px-[2px] z-0"
                      style={{ height: "72%" }}
                    >
                      {Array.from({ length: 14 }, (_, i) => {
                        const h = Math.round(6 + i * 6.8);
                        const opacity = 0.7 + (i / 13) * 0.3;
                        return (
                          <div key={i} className="flex-1 rounded-t-sm transition-all" style={{
                            height: `${h}%`,
                            background: `linear-gradient(to top, #3D2E1E, #2C2418)`,
                            opacity,
                          }} />
                        );
                      })}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-[1px] z-[1]" style={{ backgroundColor: "#C4B8A4" }} />
                  </motion.div>
                ) : (
                  <motion.div
                    key={slide.href || `article-${activeSlide}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="absolute inset-0"
                  >
                    <img src={slide.imageUrl} alt={en ? slide.titleEn : slide.title}
                      className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
                    <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-between z-10">
                      <div>
                        <span className="inline-block text-xs font-bold text-white bg-primary px-2.5 py-1 rounded-md mb-3">
                          {en ? slide.labelEn : slide.label}
                        </span>
                      </div>
                      <div>
                        <h2
                          className="text-2xl md:text-3xl lg:text-4xl font-black text-white leading-snug mb-4"
                          style={{ fontFamily: "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif" }}
                        >
                          {en ? slide.titleEn : slide.title}
                        </h2>
                        {slide.href && (
                          <Link href={slide.href}>
                            <span className="inline-block bg-white text-foreground text-sm font-bold px-5 py-2 rounded-md hover:bg-primary hover:text-white transition-colors cursor-pointer">
                              {t("readFullArrow", lang)}
                            </span>
                          </Link>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Slide buttons */}
              <div className="absolute bottom-4 right-4 flex items-center gap-2 z-20">
                {heroSlides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveSlide(i)}
                    className={`w-8 h-8 rounded-md flex items-center justify-center font-bold text-sm transition-all duration-200 ${
                      i === activeSlide ? "bg-primary text-white" : "text-white hover:opacity-90"
                    }`}
                    style={i !== activeSlide ? { backgroundColor: "hsl(152, 38%, 28%)" } : {}}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </>
            </motion.section>

            {/* ROW 1 */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mergedRowOne.map((article, i) => (
                <ArticleCard key={i} {...article} delay={0.05 + i * 0.08} en={en} followed={isBookmarked(`page-${hrefToPageId(article.href)}`)} onToggleFollow={() => toggleBookmark(`page-${hrefToPageId(article.href)}`, article.title, article.imageUrl)} loggedIn={!!user} />
              ))}
            </section>

            {/* BANNER 1 */}
            <OrangeBanner
              text="利润领先是因，还是技术领先是原因？"
              textEn="Is profit the cause, or is technology leadership?"
              href="/lilun"
              en={en}
            />

            {/* ROW 2 */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mergedRowTwo.map((article, i) => (
                <ArticleCard key={i} {...article} delay={0.1 + i * 0.08} en={en} followed={isBookmarked(`page-${hrefToPageId(article.href)}`)} onToggleFollow={() => toggleBookmark(`page-${hrefToPageId(article.href)}`, article.title, article.imageUrl)} loggedIn={!!user} />
              ))}
            </section>

            {/* BANNER 2 */}
            <OrangeBanner
              text="利润领先是因，还是技术领先是原因？"
              textEn="Is profit the cause, or is technology leadership?"
              href="/lilun"
              en={en}
            />
          </div>

          {/* ── RIGHT COLUMN ── */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-3 flex flex-col gap-3"
          >
            {/* Principles */}
            <div className="bg-card border border-border/50 overflow-hidden rounded-xl">
              <div className="bg-primary py-3 px-5">
                <h3 className="text-base font-bold text-white tracking-wide text-center">
                  {t("threePillars", lang)}
                </h3>
              </div>
              <ul className="flex flex-col">
                {(en ? [
                  "Smartphone = Land of the Internet World",
                  "Leisure Time = Labor of the Internet World",
                  "Consumption = Oxygen of the Market",
                ] : [
                  "智能手机 ＝ 互联网世界的土地",
                  "休闲时间 ＝ 互联网世界的劳动力",
                  "消费 ＝ 市场的氧气",
                ]).map((text, i) => (
                  <li key={i} className="bg-[#EDE7DC] px-5 py-3 text-foreground font-medium text-sm border-b border-border/40 last:border-b-0 text-center">
                    {text}
                  </li>
                ))}
              </ul>
              <div className="px-5 py-4 bg-[#F5F0E8] text-center border-t border-border/40">
                <p className="font-bold text-base text-foreground/80 tracking-wide">
                  {t("tradeTree", lang)}
                </p>
              </div>
            </div>

            {/* Green Promo */}
            <div className="text-white p-7 relative overflow-hidden rounded-xl flex flex-col items-center gap-3 text-center" style={{ backgroundColor: "hsl(152, 38%, 28%)" }}>
              <div>
                <h3 className="text-3xl font-black mb-0.5" style={{ fontFamily: "'Noto Sans SC', 'PingFang SC', sans-serif" }}>
                  {t("signContract", lang)}
                </h3>
                <p className="text-white/75 text-base">
                  {t("uniteWill", lang)}
                </p>
              </div>
              <p className="text-base text-white/80">
                {t("lightTradeTree", lang)}
              </p>
              <div className="flex flex-col items-center gap-1 mt-2">
                <span className="text-6xl font-black leading-none" style={{ color: "#E8A020", fontFamily: "'Noto Sans SC', 'PingFang SC', sans-serif" }}>
                  {t("light", lang)}
                </span>
                <span className="text-base font-semibold text-white/90">
                  {t("pathForward", lang)}
                </span>
              </div>
              <Link href="/dengji">
                <button className="mt-5 bg-primary hover:bg-primary/90 text-white font-black text-xl py-2.5 px-10 rounded-lg transition-all duration-200 hover:opacity-90 active:scale-95">
                  GO
                </button>
              </Link>
            </div>

            {/* WILLERS — 访谈 */}
            <Link href="/zhaopian">
              <WillersBox>
                <div className="flex flex-col items-center justify-center gap-1 py-2 cursor-pointer group">
                  <p
                    className="text-5xl font-black leading-none group-hover:opacity-80 transition-opacity"
                    style={{ color: "hsl(152, 38%, 28%)", fontFamily: "'Noto Sans SC', 'PingFang SC', sans-serif" }}
                  >
                    {t("interviews", lang)}
                  </p>
                  <p className="text-sm text-foreground/70 mt-1 font-medium">
                    {t("clickToEnter", lang)}
                  </p>
                </div>
              </WillersBox>
            </Link>

            {/* WILLERS — 社会科学 */}
            <Link href="/shuxueyuanli">
              <WillersBox>
                <div className="flex flex-col items-center justify-center gap-2 py-4 cursor-pointer group">
                  <p
                    className="text-2xl font-black text-center leading-snug group-hover:opacity-80 transition-opacity"
                    style={{ fontFamily: "'Noto Sans SC', 'PingFang SC', sans-serif" }}
                  >
                    {en ? (
                      <>Mathematical Principles<br />of Social Science</>
                    ) : (
                      <>社会科学的<br />数学原理</>
                    )}
                  </p>
                </div>
              </WillersBox>
            </Link>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function ArticleCard({
  tag, tagEn,
  title, titleEn,
  desc, descEn,
  imageUrl,
  href,
  delay,
  en,
  badge, badgeEn,
  time, timeEn,
  followed,
  onToggleFollow,
  loggedIn,
}: {
  tag: string; tagEn: string;
  title: string; titleEn: string;
  desc: string; descEn: string;
  imageUrl: string;
  href: string;
  delay: number;
  en: boolean;
  badge: string; badgeEn: string;
  time: string; timeEn: string;
  followed: boolean;
  onToggleFollow: () => void;
  loggedIn: boolean;
}) {
  const FONT_CN = "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif";
  const { lang } = useLang();
  const tLabel = en ? timeEn : time;
  return (
    <Link href={href}>
      <motion.article
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay }}
        className="flex flex-col overflow-hidden rounded-xl cursor-pointer group"
      >
        <div className="relative w-full overflow-hidden bg-muted rounded-xl" style={{ aspectRatio: "16/10" }}>
          <img
            src={imageUrl}
            alt={en ? titleEn : title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </div>
        <div className="pt-3 pb-1 flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-primary" style={{ fontFamily: FONT_CN }}>{en ? tagEn : tag}</span>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (loggedIn) onToggleFollow(); }}
              className={`text-[11px] border px-1.5 py-0.5 rounded-sm transition-colors ${
                followed
                  ? "border-primary/40 bg-primary/10 text-primary font-medium"
                  : "border-border/60 text-foreground/50 hover:border-primary/40 hover:text-primary/70"
              }`}
              style={{ fontFamily: FONT_CN }}
            >
              {followed ? `${t("saved", lang)} ✓` : `☆ ${t("save", lang)}`}
            </button>
          </div>
          <h3 className="font-black text-[15px] text-foreground leading-snug group-hover:text-primary transition-colors"
            style={{ fontFamily: FONT_CN }}>
            {en ? titleEn : title}
          </h3>
          <p className="text-xs text-foreground/60 leading-relaxed line-clamp-2" style={{ fontFamily: FONT_CN }}>
            {en ? descEn : desc}
          </p>
          {tLabel && (
            <div className="flex items-center mt-1">
              <span className="text-[11px] text-foreground/40" style={{ fontFamily: FONT_CN }}>
                {tLabel}
              </span>
            </div>
          )}
        </div>
      </motion.article>
    </Link>
  );
}

function OrangeBanner({ text, textEn, href, en }: { text: string; textEn: string; href: string; en: boolean }) {
  return (
    <Link href={href}>
      <div className="w-full border border-primary/30 bg-primary/5 py-2.5 px-5 rounded-lg text-center cursor-pointer hover:bg-primary/10 transition-colors">
        <p className="text-sm font-medium text-primary">{en ? textEn : text}</p>
      </div>
    </Link>
  );
}

function WillersBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col border border-border/50 overflow-hidden rounded-xl hover:border-primary/40 transition-colors">
      <div className="px-4 py-2 border-b border-border/40 bg-background">
        <p className="text-xs font-bold tracking-[0.3em] text-muted-foreground uppercase text-center">WILLERS</p>
      </div>
      <div className="bg-card px-5 py-5">{children}</div>
    </div>
  );
}
