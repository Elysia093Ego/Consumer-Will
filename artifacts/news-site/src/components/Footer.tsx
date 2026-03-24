import { Link } from "wouter";
import { useLang } from "@/context/LangContext";
import type { Lang } from "@/i18n/ui";

const FONT_CN = "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif";

const footerLinks: { labels: Record<Lang, string>; href: string }[] = [
  { labels: { zh: "关于我们", en: "About Us", ja: "私たちについて", "zh-tw": "關於我們" }, href: "/guanyu" },
  { labels: { zh: "问题反馈", en: "Feedback", ja: "フィードバック", "zh-tw": "問題回饋" }, href: "/fankui" },
  { labels: { zh: "问&答", en: "Q&A", ja: "Q&A", "zh-tw": "問&答" }, href: "/wenda" },
  { labels: { zh: "服务条款", en: "Terms", ja: "利用規約", "zh-tw": "服務條款" }, href: "/fuwutiaokuan" },
];

export function Footer() {
  const { lang } = useLang();

  return (
    <footer className="w-full bg-background mt-20" style={{ fontFamily: FONT_CN }}>
      <div className="max-w-[1200px] mx-auto px-4 md:px-8">
        <div className="border-t border-border/50" />
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 py-6">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-foreground/45 hover:text-primary transition-colors duration-200"
            >
              {link.labels[lang]}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
