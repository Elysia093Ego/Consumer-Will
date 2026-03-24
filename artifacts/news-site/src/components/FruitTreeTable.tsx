import { Link } from "wouter";
import { useLang } from "@/context/LangContext";
import { t } from "@/i18n/ui";

const FONT_CN = "'Noto Sans SC', 'PingFang SC', sans-serif";

interface GridTableProps {
  row1: string[];
  row2Left: React.ReactNode;
  row2Rest: string[];
  fruitLabel: string;
  treeLabel: string;
  caption: string;
  size?: "sm" | "lg";
}

function GridTable({ row1, row2Left, row2Rest, fruitLabel, treeLabel, caption, size = "lg" }: GridTableProps) {
  const textSize = size === "sm" ? "text-base md:text-lg" : "text-lg md:text-xl";
  const py = size === "sm" ? "py-3" : "py-5";
  const fruitTextSize = size === "sm" ? "text-lg" : "text-xl md:text-2xl";
  const colW = size === "sm" ? "w-16 md:w-20" : "w-20 md:w-24";

  return (
    <div>
      <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-0">
        <div className="flex flex-col">
          <div className={`bg-[#FAF6F0] px-4 ${py} flex items-center justify-center border-b border-[#E8E0D4]`}>
            <span className={`font-bold ${textSize} text-foreground/90`}>{row1[0]}</span>
          </div>
          <div className={`bg-white px-4 ${py} flex items-center justify-center`}>
            <span className={`font-bold ${textSize} text-foreground/90`}>{row2Left}</span>
          </div>
        </div>
        <div className="flex flex-col border-x border-[#E8E0D4]">
          <div className={`bg-[#FAF6F0] px-4 ${py} flex items-center justify-center border-b border-[#E8E0D4]`}>
            <span className={`font-bold ${textSize} text-foreground/90`}>{row1[1]}</span>
          </div>
          <div className={`bg-white px-4 ${py} flex items-center justify-center`}>
            <span className={`font-bold ${textSize} text-foreground/90`}>{row2Rest[0]}</span>
          </div>
        </div>
        <div className="flex flex-col border-r border-[#E8E0D4]">
          <div className={`bg-[#FAF6F0] px-4 ${py} flex items-center justify-center border-b border-[#E8E0D4]`}>
            <span className={`font-bold ${textSize} text-foreground/90`}>{row1[2]}</span>
          </div>
          <div className={`bg-white px-4 ${py} flex items-center justify-center`}>
            <span className={`font-bold ${textSize} text-foreground/90`}>{row2Rest[1]}</span>
          </div>
        </div>
        <div className={`flex flex-col ${colW}`}>
          <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: "#E8A020" }}>
            <span className={`font-black text-white ${fruitTextSize} ${py}`}>{fruitLabel}</span>
          </div>
          <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: "#2D6A4F" }}>
            <span className={`font-black text-white ${fruitTextSize} ${py}`}>{treeLabel}</span>
          </div>
        </div>
      </div>
      <div className="px-5 py-4 bg-gradient-to-r from-[#FAF6F0] to-[#F5EDE2] border-t border-[#E8E0D4]">
        <p className="text-sm md:text-base font-medium text-foreground/80 leading-relaxed text-center">
          {caption}
        </p>
      </div>
    </div>
  );
}

function DevicesCell({ lang }: { lang: string }) {
  if (lang === "en") return <>Devices</>;
  if (lang === "ja") return <>デバイス</>;
  if (lang === "zh-tw") return <><span className="hidden md:inline">電腦 | 智慧手機</span><span className="md:hidden text-center"><span className="underline underline-offset-4">電腦</span><br/>智慧手機</span></>;
  return <><span className="hidden md:inline">电脑 | 智能手机</span><span className="md:hidden text-center"><span className="underline underline-offset-4">电脑</span><br/>智能手机</span></>;
}

export function FruitTreeTable({ bilingual, forceEnglish }: { bilingual?: boolean; forceEnglish?: boolean }) {
  const { lang } = useLang();
  const en = forceEnglish || lang === "en";

  const zhCaption = "股权开放共享80%取代免费共享，是科学技术造福人类的保障。";
  const enCaption = "80% open equity sharing replaces free sharing — the guarantee that science and technology serve humanity.";

  return (
    <Link href="/dengji">
      <div className="mt-6 mb-8 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-shadow border border-[#C8B99A]" style={{ fontFamily: FONT_CN }}>
        {bilingual ? (
          <div className="grid grid-cols-2 gap-0">
            <div className="border-r border-[#C8B99A]">
              <GridTable
                row1={["软件", "AI", "利润"]}
                row2Left={<><span className="hidden md:inline">电脑 | 智能手机</span><span className="md:hidden text-center"><span className="underline underline-offset-4">电脑</span><br/>智能手机</span></>}
                row2Rest={["休闲时间", "消费"]}
                fruitLabel="果"
                treeLabel="树"
                caption={zhCaption}
                size="sm"
              />
            </div>
            <div>
              <GridTable
                row1={["Software", "AI", "Profit"]}
                row2Left="Devices"
                row2Rest={["Leisure Time", "Spending"]}
                fruitLabel="Fruit"
                treeLabel="Tree"
                caption={enCaption}
                size="sm"
              />
            </div>
          </div>
        ) : (
          <GridTable
            row1={en ? ["Software", "AI", "Profit"] : ["软件", "AI", "利润"]}
            row2Left={<DevicesCell lang={lang} />}
            row2Rest={en ? ["Leisure Time", "Spending"] : ["休闲时间", "消费"]}
            fruitLabel={t("fruit", lang)}
            treeLabel={t("tree", lang)}
            caption={en ? enCaption : zhCaption}
          />
        )}
      </div>
    </Link>
  );
}
