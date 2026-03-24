import { Fragment, useState, useEffect, useCallback, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { X, ChevronLeft, ChevronRight, CheckCircle2, Users, LogIn, ShieldCheck } from "lucide-react";
import { useUserAuth } from "@/context/UserAuthContext";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { useLang } from "@/context/LangContext";

const MILESTONE_UNITS: Record<number, { slug: string; label: string; labelEn: string }> = {
  10: { slug: "1qian", label: "1千人能做什么？\n我们有什么能力？", labelEn: "What can 1,000 people do?\nWhat are our capabilities?" },
  20: { slug: "100wan", label: "100万人能做什么？\n我们有什么能力？", labelEn: "What can 1 million people do?\nWhat are our capabilities?" },
  30: { slug: "10yi", label: "10亿人能做什么？\n我们有什么能力？", labelEn: "What can 1 billion people do?\nWhat are our capabilities?" },
};

/* ─────────────── 表格数据 ─────────────── */
const TABLE_ROWS: { unit: number; willers: string; willersEn: string; threshold: number }[] = [
  { unit: 0,  willers: "1",     willersEn: "1",     threshold: 1            },
  { unit: 1,  willers: "2",     willersEn: "2",     threshold: 2            },
  { unit: 2,  willers: "4",     willersEn: "4",     threshold: 4            },
  { unit: 3,  willers: "8",     willersEn: "8",     threshold: 8            },
  { unit: 4,  willers: "16",    willersEn: "16",    threshold: 16           },
  { unit: 5,  willers: "32",    willersEn: "32",    threshold: 32           },
  { unit: 6,  willers: "64",    willersEn: "64",    threshold: 64           },
  { unit: 7,  willers: "128",   willersEn: "128",   threshold: 128          },
  { unit: 8,  willers: "256",   willersEn: "256",   threshold: 256          },
  { unit: 9,  willers: "512",   willersEn: "512",   threshold: 512          },
  { unit: 10, willers: "1千",   willersEn: "1K",    threshold: 1024         },
  { unit: 11, willers: "2K",    willersEn: "2K",    threshold: 2048         },
  { unit: 12, willers: "4K",    willersEn: "4K",    threshold: 4096         },
  { unit: 13, willers: "8K",    willersEn: "8K",    threshold: 8192         },
  { unit: 14, willers: "16K",   willersEn: "16K",   threshold: 16384        },
  { unit: 15, willers: "32K",   willersEn: "32K",   threshold: 32768        },
  { unit: 16, willers: "64K",   willersEn: "64K",   threshold: 65536        },
  { unit: 17, willers: "128K",  willersEn: "128K",  threshold: 131072       },
  { unit: 18, willers: "256K",  willersEn: "256K",  threshold: 262144       },
  { unit: 19, willers: "512K",  willersEn: "512K",  threshold: 524288       },
  { unit: 20, willers: "100万", willersEn: "1M",    threshold: 1048576      },
  { unit: 21, willers: "2M",    willersEn: "2M",    threshold: 2097152      },
  { unit: 22, willers: "4M",    willersEn: "4M",    threshold: 4194304      },
  { unit: 23, willers: "8M",    willersEn: "8M",    threshold: 8388608      },
  { unit: 24, willers: "16M",   willersEn: "16M",   threshold: 16777216     },
  { unit: 25, willers: "32M",   willersEn: "32M",   threshold: 33554432     },
  { unit: 26, willers: "64M",   willersEn: "64M",   threshold: 67108864     },
  { unit: 27, willers: "128M",  willersEn: "128M",  threshold: 134217728    },
  { unit: 28, willers: "256M",  willersEn: "256M",   threshold: 268435456    },
  { unit: 29, willers: "512M",  willersEn: "512M",   threshold: 536870912    },
  { unit: 30, willers: "10亿",  willersEn: "1B",    threshold: 1000000000   },
  { unit: 31, willers: "20亿",  willersEn: "2B",    threshold: 2000000000   },
  { unit: 32, willers: "40亿",  willersEn: "4B",    threshold: 4000000000   },
  { unit: 33, willers: "80亿",  willersEn: "8B",    threshold: 8000000000   },
  { unit: 34, willers: "全人类", willersEn: "All", threshold: Infinity     },
];

const COLS_MOBILE = 6;

const PC_RANGES = [
  [0, 10],
  [11, 20],
  [21, 30],
  [31, 34],
] as const;
const PC_COLS = 11;

type DisplayRow = { units: number[]; willers: string[]; willersEn: string[]; thresholds: number[] };

function buildDisplayRows(cols: number): DisplayRow[] {
  const rows: DisplayRow[] = [];
  for (let i = 0; i < TABLE_ROWS.length; i += cols) {
    const chunk = TABLE_ROWS.slice(i, i + cols);
    rows.push({
      units:      chunk.map((r) => r.unit),
      willers:    chunk.map((r) => r.willers),
      willersEn:  chunk.map((r) => r.willersEn),
      thresholds: chunk.map((r) => r.threshold),
    });
  }
  return rows;
}

function buildPcRows(): DisplayRow[] {
  return PC_RANGES.map(([start, end]) => {
    const chunk = TABLE_ROWS.filter((r) => r.unit >= start && r.unit <= end);
    return {
      units:      chunk.map((r) => r.unit),
      willers:    chunk.map((r) => r.willers),
      willersEn:  chunk.map((r) => r.willersEn),
      thresholds: chunk.map((r) => r.threshold),
    };
  });
}

const mobileRows = buildDisplayRows(COLS_MOBILE);
const pcRows = buildPcRows();

const ORANGE    = "#D2691E";
const GREEN     = "hsl(152, 38%, 28%)";
const GREEN_LIT = "hsl(152, 44%, 22%)";
const FONT_CN   = "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif";

function formatCount(n: number, en = false): string {
  if (en) {
    if (n >= 1000000000) return `${(n / 1000000000).toFixed(1)}B`;
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toLocaleString("en-US");
  }
  if (n >= 100000000) return `${(n / 100000000).toFixed(1)}亿`;
  if (n >= 10000000)  return `${(n / 10000000).toFixed(0)}千万`;
  if (n >= 10000)     return `${(n / 10000).toFixed(0)}万`;
  return n.toLocaleString("zh-CN");
}

/* ─────────────── 弹窗页面内容 ─────────────── */
function Page1() {
  const { lang } = useLang();
  const en = lang === "en";
  return (
    <div className="space-y-4 text-foreground/85 leading-relaxed" style={{ fontFamily: FONT_CN }}>
      <h3 className="text-xl font-black text-foreground mb-4">{en ? "1. What Is the Registration Contract?" : "1、什么是登记合约？"}</h3>
      <p>{en ? "We consumers decide the past, present, and future!" : "我们消费者，选择决定过去、现在和未来！"}</p>
      <p>
        {en ? (<>Our computers and smartphones are the land of the internet world;<br />Our leisure time creates the ocean of knowledge on the internet, enlightening AI;<br />Our consumption exceeds $60 trillion per year — the oxygen of the market;<br />All of the above are public resources belonging to all consumers;<br />In the past, tech companies dominated the rules, defining free sharing!<br />Today, tech companies have grown into commercial empires,<br />We consumers need to re-sign contracts with tech companies,<br />Led by us consumers — a win-win contract led by the market.</>) : (<>我们的电脑、智能手机是互联网世界的土地；<br />我们的休闲时间在互联网创造知识海洋，启蒙AI；<br />我们的消费每年60多万亿美元，是市场的氧气；<br />以上属于我们全体消费者的公共资源；<br />过去，科技公司主导规则，定义免费共享！<br />今天，科技公司已经成长为商业帝国，<br />我们消费者需要与科技公司重新签署合约，<br />由我们消费者主导，也就是由市场主导的共赢合约。</>)}
      </p>
      <p>
        {en ? (<>To sign a new contract with tech companies,<br />we need to register first, unite, and form a collective will based on mathematical consensus,<br />i.e. the will of the market, leading commerce into a new era of democracy guided by the principle of minimum cost (physics) + mathematics.</>) : (<>我们要与科技公司签署新合约<br />需要我们先登记，汇聚，形成基于数学共识的共同意志，<br />即市场的意志，使商业走向由最低成本原则（物理）+数学领导的民主新时代。</>)}
      </p>
    </div>
  );
}

function Page2() {
  const { lang } = useLang();
  const en = lang === "en";
  return (
    <div className="space-y-4 text-foreground/85 leading-relaxed" style={{ fontFamily: FONT_CN }}>
      <h3 className="text-xl font-black text-foreground mb-4">{en ? "2. What Does Registration Achieve?" : "2、完成登记有什么用？"}</h3>
      <p>
        {en ? (<>Market information symmetry, direct supply-demand matching,<br />eliminates 3 cost items: distribution, finance, and blind investment,<br />leaving only 2 calculable cost items: production and transportation,<br />thus minimizing costs and maximizing efficiency.</>) : (<>市场信息对称，供求直接对接，<br />会去掉分销、金融和盲目投资3项成本开支<br />只剩下可以计算的生产和运输2项成本开支<br />成本因此降至最低，效率因此提升至最高。</>)}
      </p>
      <p>
        {en ? (<>Low cost replaces high cost,<br />high efficiency replaces low efficiency —<br />this is the inevitable trend of market development, the Market Economy 2.0.</>) : (<>低成本取代高成本<br />高效率取代低效率<br />是市场发展的必然趋势，这是市场经济的2.0版本。</>)}
      </p>
      <p>
        {en ? (<>Over the past 20 years, small tech companies<br />rose to become commercial empires, proving: profit leadership is the cause, technological leadership is the result.</>) : (<>过去20年弱小的科技公司<br />逆袭为商业科技帝国，证明：利润领先是原因，技术领先是结果。</>)}
      </p>
      <p>
        {en ? (<>Equity-sharing public market<br />= Consumer-owned (all of humanity) public market<br />[Itself] lowest cost, highest efficiency<br />All global producers must join, because consumption is the oxygen of the market.<br />This is a commercial leap that no government or enterprise can achieve alone.<br />[Profit] = Total human consumption × 5% distribution commission = $3+ trillion/year<br />Mobilize social intelligence to build consumer-owned intelligent systems — victory is inevitable!<br />The past 20 years of tech company growth proves it. 2 costs &lt; 5 costs — a mathematical truth regardless of who calculates it.<br />Therefore, tech companies will proactively cooperate with us: 80|20 equity sharing.<br />Consumers hold 80%, entrepreneurs and capitalists hold 20%.<br />Global productivity will be linked into one super-factory; production, transportation, transactions — all market information 100% traceable.<br />All market issues will be exposed in the "sunlight."</>) : (<>股权共享公共市场<br />=消费者所有制（全人类所有）公共市场<br />[自身]成本最低，效率最高<br />全球生产者必须入驻，因为消费是市场的氧气。<br />这是任何政府和企业都不能完成的商业飞跃。<br />[利润]=人类消费总额×5%分销佣金＝3万多亿美元/年<br />调动社会智力，建设消费者所有制的智能化，必然胜利！<br />科技公司过去20年发展路径是证明。2项成本＜5项成本，是谁计算都一样的数学问题，<br />因此，科技公司会主动与我们合作，80|20股权共享。<br />消费者控股80%，企业家、资本家持股20%。<br />全球生产力会被链接成一家超级工厂，生产、运输、交易等一切市场信息100%可追溯。<br />一切市场问题将被曝光在"阳光下"。</>)}
      </p>
    </div>
  );
}

function Page3() {
  const { lang } = useLang();
  const en = lang === "en";
  return (
    <div className="space-y-4 text-foreground/85 leading-relaxed" style={{ fontFamily: FONT_CN }}>
      <h3 className="text-xl font-black text-foreground mb-4">{en ? "3. How to Complete Registration?" : "3、怎么完成登记？"}</h3>
      <p>
        {en ? (<>Register yourself, then tell those you love.<br />The entire market knows —<br />No one can stop the upgrade of the human market,<br />No one dares to oppose the collective will of the market;<br />No one dares to oppose the happiness of humanity;<br />No one has the power to resist natural law.</>) : (<>自己登记，然后告知所爱之人。<br />整个市场都知道，<br />谁也不能阻挡人类市场的升级，<br />谁也不敢与市场的共同意志为敌；<br />谁也不敢与人类的幸福为敌；<br />谁也没有能力与自然法抗衡；</>)}
      </p>
      <p>
        {en ? (<>We are spreading the beautiful path preset by natural law.<br />We are spreading a path for humanity toward inevitable victory.<br />We are spreading a path that ensures our descendants achieve beauty and happiness.<br />We hope truth can flow freely in everyone's heart.</>) : (<>我们在传播遵循自然法预设的美好道路。<br />我们在传播一条人类如何走向必然赢的道路。<br />我们在传播一条保障我们后代获得美好与幸福的道路。<br />我们希望真理能够在每个人的内心自由流动。</>)}
      </p>
      <p>
        {en ? (<>Today,<br />we humans can spread tabloid news around the globe overnight;<br />we humans can spread bad news around the globe overnight!<br />Today,<br />we humans think "they" will block the path to a better world,<br />but who are "they"? We haven't thought about it — this is the root cause of humanity's crisis.<br />Dear friend, beauty begins when we can let truth flow freely;<br />the free flow of truth begins when we let truth flow freely within our hearts!</>) : (<>今天，<br />我们人类能够将花边新闻一夜之间传遍全球；<br />我们人类能够将坏消息一夜之间传遍全球！<br />今天<br />我们人类认为通往美好的道路他们会阻挡，<br />他们是谁呢？我们没有思考，这是我们人类陷入危机的根源。<br />亲爱的，美好始于我们能够让真理自由流动；<br />真理自由流动，始于我们能够让真理在内心自由流动！</>)}
      </p>
    </div>
  );
}

const YEARS = Array.from({ length: 2010 - 1920 + 1 }, (_, i) => 1920 + i).reverse();
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

const inputCls = "w-full border border-border/60 rounded-lg px-3 py-2 text-sm bg-white/80 focus:outline-none focus:border-primary transition-colors";
const selectCls = "border border-border/60 rounded-lg px-2 py-2 text-sm bg-white/80 focus:outline-none focus:border-primary transition-colors";

/* 第4页：根据登录状态和是否已登记显示不同内容 */
function Page4({
  userId,
  isLoggedIn,
  alreadyRegistered,
  onConfirm,
  confirming,
  justConfirmed,
  fullName, setFullName,
  birthYear, setBirthYear,
  birthMonth, setBirthMonth,
  birthDay, setBirthDay,
  country, setCountry,
}: {
  userId: string | null;
  isLoggedIn: boolean;
  alreadyRegistered: boolean;
  onConfirm: () => void;
  confirming: boolean;
  justConfirmed: boolean;
  fullName: string; setFullName: (v: string) => void;
  birthYear: string; setBirthYear: (v: string) => void;
  birthMonth: string; setBirthMonth: (v: string) => void;
  birthDay: string; setBirthDay: (v: string) => void;
  country: string; setCountry: (v: string) => void;
}) {
  const { lang } = useLang();
  const en = lang === "en";
  const formComplete = fullName.trim() !== "" && birthYear !== "" && birthMonth !== "" && birthDay !== "" && country.trim() !== "";

  return (
    <div className="space-y-5" style={{ fontFamily: FONT_CN }}>
      <h3 className="text-xl font-black text-foreground">{en ? "Register" : "登记"}</h3>
      <p className="flex items-center gap-2 text-sm text-foreground/70">
        <span className="inline-flex items-center justify-center w-5 h-5 border border-foreground/40 rounded-sm text-xs flex-shrink-0">&nbsp;</span>
        {en ? (<>Map of Human Love<span className="hidden sm:inline">｜</span><br className="sm:hidden" />Only love can light the way forward for humanity</>) : (<>人类爱的地图<span className="hidden sm:inline">｜</span><br className="sm:hidden" />唯有爱能照亮人类前行的脚步</>)}
      </p>
      {/* 迷你表格 — 移动端 */}
      <div className="md:hidden border border-border/40 overflow-x-auto rounded-xl text-xs">
        <table className="w-full border-collapse" style={{ minWidth: 360 }}>
          <tbody>
            {mobileRows.map((row, ri) => (
              <Fragment key={ri}>
                <tr>
                  <td className="px-2 py-1 font-bold text-white text-center border border-white/20 whitespace-nowrap sticky left-0 z-10"
                    style={{ backgroundColor: ORANGE }}>{en ? "Time Unit" : "时间单位"}</td>
                  {row.units.map((u, ci) => (
                    <td key={ci} className="px-2 py-1 font-bold text-white text-center border border-white/20"
                      style={{ backgroundColor: ri === 0 && ci === 0 ? GREEN : ORANGE }}>{u === 34 ? "34+" : u}</td>
                  ))}
                  {Array.from({ length: COLS_MOBILE - row.units.length }).map((_, ci) => (
                    <td key={ci} className="border border-border/20 bg-white/50" />
                  ))}
                </tr>
                <tr>
                  <td className="px-2 py-1 font-semibold text-foreground text-center border border-border/30 bg-white whitespace-nowrap sticky left-0 z-10">Willers</td>
                  {row.units.map((u, ci) => {
                    const w = en ? row.willersEn[ci] : row.willers[ci];
                    const isMilestone = u in MILESTONE_UNITS;
                    if (isMilestone) {
                      return <MilestoneWillerCell key={ci} unit={u} label={w} en={en} className="px-2 py-1 text-foreground text-center border border-border/30 bg-white" />;
                    }
                    return <td key={ci} className="px-2 py-1 text-foreground text-center border border-border/30 bg-white">{w}</td>;
                  })}
                  {Array.from({ length: COLS_MOBILE - row.willers.length }).map((_, ci) => (
                    <td key={ci} className="border border-border/20 bg-white/50" />
                  ))}
                </tr>
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
      {/* 迷你表格 — PC端 */}
      <div className="hidden md:block border border-border/40 overflow-x-auto rounded-xl text-xs">
        <table className="w-full border-collapse" style={{ minWidth: 600 }}>
          <colgroup>
            <col style={{ width: 72 }} />
            {Array.from({ length: PC_COLS }).map((_, i) => (
              <col key={i} style={i < PC_COLS - 1 ? { width: `${(100 - 12) / (PC_COLS - 1)}%` } : undefined} />
            ))}
          </colgroup>
          <tbody>
            {pcRows.map((row, ri) => {
              const pad = PC_COLS - row.units.length;
              return (
                <Fragment key={ri}>
                  <tr>
                    <td className="px-2 py-1 font-bold text-white text-center border border-white/20 whitespace-nowrap sticky left-0 z-10"
                      style={{ backgroundColor: ORANGE }}>{en ? "Time Unit" : "时间单位"}</td>
                    {Array.from({ length: pad }).map((_, ci) => (
                      <td key={`ep-${ci}`} className="border border-border/20 bg-white/50" />
                    ))}
                    {row.units.map((u, ci) => (
                      <td key={ci} className="px-2 py-1 font-bold text-white text-center border border-white/20"
                        style={{ backgroundColor: ri === 0 && ci === 0 ? GREEN : ORANGE }}>{u === 34 ? "34+" : u}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-2 py-1 font-semibold text-foreground text-center border border-border/30 bg-white whitespace-nowrap sticky left-0 z-10">Willers</td>
                    {Array.from({ length: pad }).map((_, ci) => (
                      <td key={`ewp-${ci}`} className="border border-border/20 bg-white/50" />
                    ))}
                    {row.units.map((u, ci) => {
                      const w = en ? row.willersEn[ci] : row.willers[ci];
                      const isMilestone = u in MILESTONE_UNITS;
                      if (isMilestone) {
                        return <MilestoneWillerCell key={ci} unit={u} label={w} en={en} className="px-2 py-1 text-foreground text-center border border-border/30 bg-white" />;
                      }
                      return <td key={ci} className="px-2 py-1 text-foreground text-center border border-border/30 bg-white">{w}</td>;
                    })}
                  </tr>
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 登记状态区域 */}
      {!isLoggedIn ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <LogIn className="w-5 h-5 text-primary" />
          </div>
          <p className="text-sm font-bold text-foreground/70">{en ? "Please sign in first to complete registration" : "请先登录后再完成登记"}</p>
          <div className="flex gap-3">
            <Link href="/login">
              <button className="px-5 py-2 text-sm font-bold text-white rounded-lg" style={{ backgroundColor: GREEN }}>{en ? "Sign In" : "立即登录"}</button>
            </Link>
            <Link href="/register">
              <button className="px-5 py-2 text-sm font-medium border border-border/50 rounded-lg hover:border-primary/50 transition-colors">{en ? "Register" : "注册账号"}</button>
            </Link>
          </div>
        </div>
      ) : alreadyRegistered || justConfirmed ? (
        <div className="flex items-center justify-center gap-2 py-4 text-green-700 font-bold text-sm sm:text-base whitespace-nowrap">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          {justConfirmed
            ? (en ? "Registered! Welcome to Willers" : "登记成功！欢迎加入 Willers")
            : (en ? "You are already registered | Equity Sharing | Community of Destiny" : "您已完成登记｜股权共享｜命运1体")}
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-foreground/70 mb-1">{en ? "Full Name" : "姓名"} <span className="text-red-500">*</span></label>
            <input
              className={inputCls}
              placeholder={en ? "Enter your full name" : "请输入您的姓名"}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-foreground/70 mb-1">{en ? "Date of Birth" : "出生年月日"} <span className="text-red-500">*</span></label>
            <div className="flex gap-2">
              <select className={`${selectCls} flex-1`} value={birthYear} onChange={(e) => setBirthYear(e.target.value)}>
                <option value="">{en ? "Year" : "年"}</option>
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              <select className={`${selectCls} w-20`} value={birthMonth} onChange={(e) => setBirthMonth(e.target.value)}>
                <option value="">{en ? "Mo." : "月"}</option>
                {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              <select className={`${selectCls} w-20`} value={birthDay} onChange={(e) => setBirthDay(e.target.value)}>
                <option value="">{en ? "Day" : "日"}</option>
                {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-foreground/70 mb-1">{en ? "Country" : "国家"} <span className="text-red-500">*</span></label>
            <input
              className={inputCls}
              placeholder={en ? "Enter your country" : "请输入您所在的国家"}
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
          </div>
          <button
            onClick={onConfirm}
            disabled={confirming || !formComplete}
            className="w-full py-3 text-lg font-black text-white rounded-lg transition-all duration-200 hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed mt-2"
            style={{ backgroundColor: GREEN }}
          >
            {confirming ? (en ? "Registering…" : "登记中…") : (en ? "Confirm Registration" : "确认登记")}
          </button>
          {!formComplete && (
            <p className="text-xs text-center text-foreground/40">{en ? "Please fill in all required fields" : "请填写完整信息后方可登记"}</p>
          )}
        </div>
      )}
    </div>
  );
}

/* ─────────────── 弹窗 ─────────────── */
const TOTAL_PAGES = 4;

function DengjiModal({
  onClose,
  onConfirm,
  userId,
  isLoggedIn,
  alreadyRegistered,
}: {
  onClose: () => void;
  onConfirm: (data: { fullName: string; birthDate: string; country: string }) => Promise<void>;
  userId: string | null;
  isLoggedIn: boolean;
  alreadyRegistered: boolean;
}) {
  const { lang: modalLang } = useLang();
  const modalEn = modalLang === "en";
  const [page, setPage] = useState(1);
  const [confirming, setConfirming] = useState(false);
  const [justConfirmed, setJustConfirmed] = useState(false);
  const [fullName, setFullName] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [country, setCountry] = useState("");

  async function handleConfirm() {
    const birthDate = birthYear && birthMonth && birthDay
      ? `${birthYear}-${String(birthMonth).padStart(2, "0")}-${String(birthDay).padStart(2, "0")}`
      : "";
    setConfirming(true);
    await onConfirm({ fullName, birthDate, country });
    setConfirming(false);
    setJustConfirmed(true);
    setTimeout(onClose, 1800);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-[#FAF6EE] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部进度 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/30 flex-shrink-0">
          <div className="flex items-center gap-2">
            {Array.from({ length: TOTAL_PAGES }).map((_, i) => (
              <div key={i} className="h-1.5 rounded-full transition-all duration-300"
                style={{ width: page === i + 1 ? 28 : 10, backgroundColor: page > i ? GREEN : "#D4C9B0" }} />
            ))}
          </div>
          <button onClick={onClose} className="text-foreground/50 hover:text-foreground transition-colors p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 内容 */}
        <div className="flex-grow overflow-y-auto px-6 py-6">
          {page === 1 && <Page1 />}
          {page === 2 && <Page2 />}
          {page === 3 && <Page3 />}
          {page === 4 && (
            <Page4
              userId={userId}
              isLoggedIn={isLoggedIn}
              alreadyRegistered={alreadyRegistered}
              onConfirm={handleConfirm}
              confirming={confirming}
              justConfirmed={justConfirmed}
              fullName={fullName} setFullName={setFullName}
              birthYear={birthYear} setBirthYear={setBirthYear}
              birthMonth={birthMonth} setBirthMonth={setBirthMonth}
              birthDay={birthDay} setBirthDay={setBirthDay}
              country={country} setCountry={setCountry}
            />
          )}
        </div>

        {/* 底部导航 */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border/30 flex-shrink-0">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            className="flex items-center gap-1 text-sm font-medium text-foreground/60 hover:text-foreground
              disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            <ChevronLeft className="w-4 h-4" /> {modalEn ? "Previous" : "上一页"}
          </button>
          <span className="text-xs text-foreground/40 font-medium tracking-widest">{page} / {TOTAL_PAGES}</span>
          {page < TOTAL_PAGES ? (
            <button onClick={() => setPage((p) => Math.min(TOTAL_PAGES, p + 1))}
              className="flex items-center gap-1 text-sm font-bold text-white px-4 py-1.5 rounded-lg transition-all hover:opacity-90"
              style={{ backgroundColor: GREEN }}>
              {modalEn ? "Next" : "下一页"} <ChevronRight className="w-4 h-4" />
            </button>
          ) : <div className="w-20" />}
        </div>
      </div>
    </div>
  );
}

/* ─────────────── 里程碑单元格（悬浮卡片+点击跳转） ─────────────── */
function MilestoneWillerCell({ unit, label, en, className }: { unit: number; label: string; en: boolean; className?: string }) {
  const [hover, setHover] = useState(false);
  const [, navigate] = useLocation();
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const ms = MILESTONE_UNITS[unit];
  const cellRef = useRef<HTMLTableCellElement>(null);
  if (!ms) return <td className={className}>{label}</td>;

  function handleEnter() {
    setHover(true);
    if (cellRef.current) {
      const rect = cellRef.current.getBoundingClientRect();
      const tooltipW = 150;
      let cx = rect.left + rect.width / 2;
      if (cx + tooltipW / 2 > window.innerWidth - 16) {
        cx = window.innerWidth - 16 - tooltipW / 2;
      }
      if (cx - tooltipW / 2 < 16) {
        cx = 16 + tooltipW / 2;
      }
      setTooltipPos({ x: cx, y: rect.top });
    }
  }

  return (
    <td
      ref={cellRef}
      className={`${className} cursor-pointer transition-all duration-200 whitespace-nowrap`}
      style={hover ? { backgroundColor: "hsl(22, 80%, 50%)", color: "white", fontWeight: 700 } : {}}
      onMouseEnter={handleEnter}
      onMouseLeave={() => setHover(false)}
      onClick={() => navigate(`/milestone/${ms.slug}`)}
    >
      ⭐{label}
      {hover && tooltipPos && (
        <div className="fixed z-[9999] bg-white border border-border/40 rounded-xl shadow-lg px-3 py-2 text-center pointer-events-none"
          style={{ fontFamily: FONT_CN, left: tooltipPos.x, top: tooltipPos.y, transform: "translate(-50%, -100%) translateY(-8px)", width: 150 }}>
          <div className="text-xs font-bold text-foreground mb-1 whitespace-pre-line" style={{ color: "hsl(22, 80%, 50%)" }}>
            {en ? ms.labelEn : ms.label}
          </div>
          <div className="text-[10px] text-foreground/60">
            {en ? "Click to learn more →" : "点击查看详情 →"}
          </div>
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-white" />
        </div>
      )}
    </td>
  );
}

/* ─────────────── 主表格（带点亮效果） ─────────────── */
function LitTableInner({ rows, cols, totalCount, tblEn, alignRight }: { rows: DisplayRow[]; cols: number; totalCount: number; tblEn: boolean; alignRight?: boolean }) {
  return (
    <table className="w-full border-collapse text-sm" style={{ fontFamily: FONT_CN, minWidth: cols > 6 ? 700 : 480 }}>
      <colgroup>
        <col style={{ width: 80 }} />
        {Array.from({ length: cols }).map((_, i) => (
          <col key={i} style={i < cols - 1 ? { width: `${(100 - 12) / (cols - 1)}%` } : undefined} />
        ))}
      </colgroup>
      <tbody>
        {rows.map((row, ri) => {
          const pad = cols - row.units.length;
          return (
            <Fragment key={ri}>
              <tr>
                <td className="px-3 py-2 font-bold text-white text-center border border-white/20 whitespace-nowrap sticky left-0 z-10"
                  style={{ backgroundColor: ORANGE, minWidth: 72 }}>
                  {tblEn ? "Time Unit" : "时间单位"}
                </td>
                {alignRight && Array.from({ length: pad }).map((_, ci) => (
                  <td key={`eu-${ci}`} className="border border-border/20 bg-white/50" />
                ))}
                {row.units.map((u, ci) => {
                  const threshold = row.thresholds[ci];
                  const lit = totalCount >= threshold;
                  const isFirst = ri === 0 && ci === 0;
                  return (
                    <td key={ci}
                      className="px-3 py-2 font-bold text-white text-center border border-white/20 transition-colors duration-500"
                      style={{ backgroundColor: lit || isFirst ? GREEN_LIT : ORANGE }}>
                      {u === 34 ? "34+" : u}
                    </td>
                  );
                })}
                {!alignRight && Array.from({ length: pad }).map((_, ci) => (
                  <td key={`eu-${ci}`} className="border border-border/20 bg-white/50" />
                ))}
              </tr>
              <tr>
                <td className="px-3 py-2 font-semibold text-foreground text-center border border-border/30 whitespace-nowrap bg-white sticky left-0 z-10">
                  Willers
                </td>
                {alignRight && Array.from({ length: pad }).map((_, ci) => (
                  <td key={`ew-${ci}`} className="border border-border/20 bg-white/50" />
                ))}
                {row.units.map((u, ci) => {
                  const w = tblEn ? row.willersEn[ci] : row.willers[ci];
                  const isMilestone = u in MILESTONE_UNITS;
                  if (isMilestone) {
                    return <MilestoneWillerCell key={ci} unit={u} label={w} en={tblEn} className="px-3 py-2 text-foreground text-center border border-border/30 bg-white" />;
                  }
                  return <td key={ci} className="px-3 py-2 text-foreground text-center border border-border/30 bg-white">{w}</td>;
                })}
                {!alignRight && Array.from({ length: pad }).map((_, ci) => (
                  <td key={`ew-${ci}`} className="border border-border/20 bg-white/50" />
                ))}
              </tr>
            </Fragment>
          );
        })}
      </tbody>
    </table>
  );
}

function LitTable({ totalCount }: { totalCount: number }) {
  const { lang: tblLang } = useLang();
  const tblEn = tblLang === "en";
  return (
    <>
      <div className="md:hidden overflow-x-auto">
        <LitTableInner rows={mobileRows} cols={COLS_MOBILE} totalCount={totalCount} tblEn={tblEn} />
      </div>
      <div className="hidden md:block overflow-x-auto">
        <LitTableInner rows={pcRows} cols={PC_COLS} totalCount={totalCount} tblEn={tblEn} alignRight />
      </div>
    </>
  );
}

/* ─────────────── 主页面 ─────────────── */
export default function DengjiPage() {
  const { user } = useUserAuth();
  const { isAdmin } = useAdminAuth();

  /* 当前账号的唯一 ID：普通用户用数据库 ID，管理员固定为 "admin" */
  const userId = isAdmin ? "admin" : user ? user.id : null;
  const isLoggedIn = isAdmin || !!user;

  const [showModal, setShowModal] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [loadingCount, setLoadingCount] = useState(true);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);

  const fetchCount = useCallback(async () => {
    try {
      const res = await fetch("/api/dengji/count");
      const data = await res.json();
      setTotalCount(data.count ?? 0);
    } catch { /* silent */ }
    finally { setLoadingCount(false); }
  }, []);

  /* 检查当前账号是否已登记 */
  const checkStatus = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/dengji/status?userId=${encodeURIComponent(userId)}`);
      const data = await res.json();
      setAlreadyRegistered(data.registered ?? false);
    } catch { /* silent */ }
  }, [userId]);

  useEffect(() => {
    fetchCount();
  }, [fetchCount]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  async function handleConfirmRegister(formData: { fullName: string; birthDate: string; country: string }) {
    if (!userId) return;
    try {
      const res = await fetch("/api/dengji", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, fullName: formData.fullName, birthDate: formData.birthDate, country: formData.country }),
      });
      const result = await res.json();
      setTotalCount(result.count ?? totalCount);
      if (!result.alreadyRegistered) {
        setAlreadyRegistered(true);
      }
    } catch {
      /* silent */
    }
  }

  const { lang: pgLang } = useLang();
  const pgEn = pgLang === "en";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow max-w-[680px] md:max-w-[960px] mx-auto w-full px-4 md:px-8 py-12">
        <h2 className="text-3xl font-black mb-6" style={{ fontFamily: FONT_CN }}>{pgEn ? "Sign the Contract" : "登记"}</h2>

        <p className="text-base text-foreground/80 mb-6" style={{ fontFamily: FONT_CN }}>
          {pgEn ? "Map of Human Love | Only love can light the way forward for humanity" : "·人类爱的地图｜唯有爱能照亮人类前行的脚步"}
        </p>

        {isLoggedIn && alreadyRegistered && (
          <div className="flex items-center gap-2 mb-6 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-medium"
            style={{ fontFamily: FONT_CN }}>
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            {isAdmin ? (
              <><ShieldCheck className="w-4 h-4" /> {pgEn ? "Admin account is registered" : "管理员账号已完成登记"}</>
            ) : (
              <>{pgEn ? "Account" : "账号"} <span className="font-bold">{user?.username}</span> {pgEn ? "is registered. Thank you!" : "已完成登记，感谢您的支持！"}</>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-stretch gap-3 mb-10">
          <div className="flex-grow border border-border/50 overflow-x-auto rounded-xl">
            <LitTable totalCount={totalCount} />
          </div>
          <div className="flex flex-row sm:flex-col items-center justify-center gap-2 rounded-xl px-4 py-4 sm:py-5 text-white sm:min-w-[90px] flex-shrink-0"
            style={{ backgroundColor: GREEN_LIT }}>
            <Users className="w-5 h-5 opacity-80" />
            <p className="text-xs font-medium opacity-75 text-center leading-tight" style={{ fontFamily: FONT_CN }}>
              {pgEn ? "Total Willers" : "登记总人数"}
            </p>
            <p className="text-2xl font-black leading-none" style={{ fontFamily: FONT_CN }}>
              {loadingCount ? "…" : formatCount(totalCount, pgEn)}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-4 sm:gap-6 bg-[#E8DFD0] border border-border/40 rounded-xl px-6 py-5 text-center sm:text-left">
          <div style={{ fontFamily: FONT_CN }}>
            {pgEn ? (
              <>
                <p className="text-base font-bold text-foreground leading-relaxed">Free registration. No cost.</p>
                <p className="text-base text-foreground/80">Simply show your support for shared ownership</p>
                <p className="text-base text-foreground/80">and shared value for everyone</p>
              </>
            ) : (
              <>
                <p className="text-base font-bold text-foreground leading-relaxed">免费登记，无需任何费用，</p>
                <p className="text-base text-foreground/80">仅表达您支持人人持股，</p>
                <p className="text-base text-foreground/80">价值共享的意愿</p>
              </>
            )}
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex-shrink-0 px-10 py-3 text-lg font-black text-white rounded-lg transition-all duration-200 hover:brightness-110 active:scale-95 active:shadow-sm"
            style={{ backgroundColor: alreadyRegistered && isLoggedIn ? GREEN_LIT : GREEN, fontFamily: FONT_CN, boxShadow: "0 4px 0 rgba(0,0,0,0.25), 0 6px 12px rgba(0,0,0,0.15)", transform: "translateY(-2px)" }}
          >
            {alreadyRegistered && isLoggedIn ? (pgEn ? "Registered ✓" : "已登记 ✓") : (pgEn ? "Register" : "登记")}
          </button>
        </div>
      </main>
      <Footer />
      {showModal && (
        <DengjiModal
          onClose={() => setShowModal(false)}
          onConfirm={handleConfirmRegister}
          userId={userId}
          isLoggedIn={isLoggedIn}
          alreadyRegistered={alreadyRegistered}
        />
      )}
    </div>
  );
}
