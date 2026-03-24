import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { Lang } from "@/i18n/ui";
import { t } from "@/i18n/ui";

interface LangContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
}

const LangContext = createContext<LangContextValue>({ lang: "zh", setLang: () => {} });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("site-lang");
      if (saved === "en" || saved === "ja" || saved === "zh-tw" || saved === "zh") return saved;
    }
    return "zh";
  });

  function setLang(l: Lang) {
    setLangState(l);
    localStorage.setItem("site-lang", l);
  }

  useEffect(() => {
    document.title = t("siteTitle", lang);
  }, [lang]);

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}
