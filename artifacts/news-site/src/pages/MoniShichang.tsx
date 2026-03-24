import { useState, useCallback, useRef, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useUserAuth } from "@/context/UserAuthContext";
import { useLocation } from "wouter";

const FONT_CN = "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif";
const AMOUNT = 1000;

function BlueArrowRight({ onClick, disabled, color = "#1565C0" }: { onClick?: (e: React.MouseEvent) => void; disabled?: boolean; color?: string }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex-shrink-0 transition-transform ${disabled ? "opacity-30 cursor-not-allowed" : "hover:scale-110 cursor-pointer active:scale-95"}`}
    >
      <svg width="36" height="20" viewBox="0 0 36 20" fill="none" className="hidden md:block">
        <rect x="0" y="6" width="22" height="8" rx="2" fill={color} />
        <polygon points="20,2 36,10 20,18" fill={color} />
      </svg>
      <svg width="20" height="28" viewBox="0 0 20 28" fill="none" className="md:hidden">
        <rect x="6" y="0" width="8" height="18" rx="2" fill={color} />
        <polygon points="2,16 10,28 18,16" fill={color} />
      </svg>
    </button>
  );
}

export default function MoniShichang() {
  const { user } = useUserAuth();
  const [, navigate] = useLocation();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [oweHumanity, setOweHumanity] = useState(0);
  const [humanityOwes, setHumanityOwes] = useState(0);
  const [gameDay, setGameDay] = useState(1);
  const [showDetail, setShowDetail] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const [inviteEffect, setInviteEffect] = useState<{ x: number; y: number; id: number } | null>(null);

  const [invested, setInvested] = useState(false);
  const [equity, setEquity] = useState(0);
  const [dividendDays, setDividendDays] = useState(0);
  const [showAccountTip, setShowAccountTip] = useState(false);
  const [showNetWorthTip, setShowNetWorthTip] = useState(false);
  const [showMarketTip, setShowMarketTip] = useState(false);
  const [showAccelTip, setShowAccelTip] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [goalOpen, setGoalOpen] = useState(true);
  const [accelTickets, setAccelTickets] = useState(0);
  const [dividendConfetti, setDividendConfetti] = useState(false);
  const [investTimestamp, setInvestTimestamp] = useState<number | null>(null);
  const [autoDividend, setAutoDividend] = useState(0);
  const [spentDividend, setSpentDividend] = useState(0);

  const [gameLoaded, setGameLoaded] = useState(false);
  const hasGameData = invested || oweHumanity > 0 || humanityOwes > 0 || gameDay > 1;

  useEffect(() => {
    if (!invested || !investTimestamp) return;
    const DIVIDEND_RATE = 0.0001;
    const EQUITY = 20000;
    const DAY_MS = 24 * 60 * 60 * 1000;

    const updateDividend = () => {
      const elapsed = Date.now() - investTimestamp;
      const days = Math.floor(elapsed / DAY_MS);
      setAutoDividend(days * EQUITY * DIVIDEND_RATE);
    };

    updateDividend();
    const interval = setInterval(updateDividend, 60000);
    return () => clearInterval(interval);
  }, [invested, investTimestamp]);

  const [showBigConfetti, setShowBigConfetti] = useState(false);
  const [showFlyText, setShowFlyText] = useState(false);

  const INDUSTRY_LIST = [
    { key: "edu", name: "智能教育", defaultPost: "什么是智能教育？", postContent: "智能教育是利用人工智能、大数据等技术，为每个人提供个性化、高效的学习体验。通过股权开放共享模式，让全球80亿人都能享受到最优质的教育资源。", investText: "智能教育平台", techStart: 0 },
    { key: "social", name: "新社交", defaultPost: "什么是新社交？", postContent: "新社交是以消费者主导的社交平台，通过股权开放共享模式，让全球80亿人共同参与建设和受益。打破传统社交平台的垄断模式，实现真正的用户所有、用户治理。", investText: "新社交平台", techStart: 0 },
    { key: "clothing", name: "服装行业", defaultPost: "什么是新服装？", postContent: "新服装行业通过股权开放共享模式，让消费者主导服装产业链，实现从设计到生产的全民参与，打造真正属于人民的时尚产业。", investText: "服装行业平台", techStart: 0 },
    { key: "beverage", name: "酒水行业", defaultPost: "什么是新酒水？", postContent: "新酒水行业通过股权开放共享模式，让消费者主导酒水产业链，从酿造到销售全民参与，打造真正属于人民的酒水产业。", investText: "酒水行业平台", techStart: 0 },
    { key: "auto", name: "汽车行业", defaultPost: "什么是新汽车？", postContent: "新汽车行业通过股权开放共享模式，让消费者主导汽车产业链，从研发到制造全民参与，打造真正属于人民的汽车产业。", investText: "汽车行业平台", techStart: 0 },
    { key: "electrical", name: "电气行业", defaultPost: "什么是新电气？", postContent: "新电气行业通过股权开放共享模式，让消费者主导电气产业链，从发电到输配全民参与，打造真正属于人民的电气产业。", investText: "电气行业平台", techStart: 0 },
    { key: "appliance", name: "电器行业", defaultPost: "什么是新电器？", postContent: "新电器行业通过股权开放共享模式，让消费者主导电器产业链，从设计到生产全民参与，打造真正属于人民的电器产业。", investText: "电器行业平台", techStart: 0 },
    { key: "chip", name: "芯片行业", defaultPost: "什么是新芯片？", postContent: "新芯片行业通过股权开放共享模式，让消费者主导芯片产业链，从设计到制造全民参与，打造真正属于人民的芯片产业。", investText: "芯片行业平台", techStart: 0 },
    { key: "grain", name: "粮油副食行业", defaultPost: "什么是新粮油副食？", postContent: "新粮油副食行业通过股权开放共享模式，让消费者主导粮油副食产业链，从种植到加工全民参与，打造真正属于人民的粮油副食产业。", investText: "粮油副食行业平台", techStart: 0 },
    { key: "water", name: "自来水行业", defaultPost: "什么是新自来水？", postContent: "新自来水行业通过股权开放共享模式，让消费者主导供水产业链，从水源保护到管网建设全民参与，打造真正属于人民的自来水产业。", investText: "自来水行业平台", techStart: 0 },
    { key: "energy", name: "能源燃气行业", defaultPost: "什么是新能源燃气？", postContent: "新能源燃气行业通过股权开放共享模式，让消费者主导能源燃气产业链，从开采到输送全民参与，打造真正属于人民的能源燃气产业。", investText: "能源燃气行业平台", techStart: 0 },
    { key: "textile", name: "纺织服装行业", defaultPost: "什么是新纺织服装？", postContent: "新纺织服装行业通过股权开放共享模式，让消费者主导纺织服装产业链，从原料到成衣全民参与，打造真正属于人民的纺织服装产业。", investText: "纺织服装行业平台", techStart: 0 },
    { key: "medical", name: "医疗卫生行业", defaultPost: "什么是新医疗卫生？", postContent: "新医疗卫生行业通过股权开放共享模式，让消费者主导医疗卫生产业链，从药品研发到医疗服务全民参与，打造真正属于人民的医疗卫生产业。", investText: "医疗卫生行业平台", techStart: 0 },
    { key: "realestate", name: "房地产建筑行业", defaultPost: "什么是新房地产建筑？", postContent: "新房地产建筑行业通过股权开放共享模式，让消费者主导房地产建筑产业链，从设计到施工全民参与，打造真正属于人民的房地产建筑产业。", investText: "房地产建筑行业平台", techStart: 0 },
  ];

  type IndustryState = {
    applied: boolean;
    capitalRegistered: boolean;
    techRegistered: boolean;
    techCount: number;
    techAnswer: "yes" | "no" | null;
    expanded: boolean;
    modal: string | null;
    forumPosts: ForumPost[];
  };

  type ForumPost = { id: number; title: string; content: string; author: string; time: string; replies: { author: string; content: string; time: string }[] };

  const [industries, setIndustries] = useState<Record<string, IndustryState>>(() => {
    const init: Record<string, IndustryState> = {};
    INDUSTRY_LIST.forEach(ind => {
      init[ind.key] = {
        applied: false,
        capitalRegistered: false,
        techRegistered: false,
        techCount: ind.techStart,
        techAnswer: null,
        expanded: ind.key === "edu" || ind.key === "social",
        modal: null,
        forumPosts: [{ id: 1, title: ind.defaultPost, content: ind.postContent, author: "系统", time: "2026-01-01", replies: [] }],
      };
    });
    return init;
  });

  const updateIndustry = (key: string, updates: Partial<IndustryState>) => {
    setIndustries(prev => ({ ...prev, [key]: { ...prev[key], ...updates } }));
  };

  const updateIndustryForum = (key: string, updater: (posts: ForumPost[]) => ForumPost[]) => {
    setIndustries(prev => ({ ...prev, [key]: { ...prev[key], forumPosts: updater(prev[key].forumPosts) } }));
  };

  useEffect(() => {
    if (!user) { setGameLoaded(true); return; }
    fetch(`/api/game-state?userId=${encodeURIComponent(user.id)}`)
      .then(r => r.json())
      .then(data => {
        if (data.state) {
          const s = data.state;
          if (s.invested !== undefined) setInvested(s.invested);
          if (s.equity !== undefined) setEquity(s.equity);
          if (s.dividendDays !== undefined) setDividendDays(s.dividendDays);
          if (s.accelTickets !== undefined) setAccelTickets(s.accelTickets);
          if (s.investTimestamp !== undefined) setInvestTimestamp(s.investTimestamp);
          if (s.autoDividend !== undefined) setAutoDividend(s.autoDividend);
          if (s.spentDividend !== undefined) setSpentDividend(s.spentDividend);
          if (s.oweHumanity !== undefined) setOweHumanity(s.oweHumanity);
          if (s.humanityOwes !== undefined) setHumanityOwes(s.humanityOwes);
          if (s.gameDay !== undefined) setGameDay(s.gameDay);
          if (s.industries) {
            setIndustries(prev => {
              const merged = { ...prev };
              INDUSTRY_LIST.forEach(ind => {
                if (s.industries[ind.key]) {
                  merged[ind.key] = { ...s.industries[ind.key], expanded: ind.key === "edu" || ind.key === "social" };
                }
              });
              return merged;
            });
          }
        }
        setGameLoaded(true);
      })
      .catch(() => setGameLoaded(true));
  }, [user?.id]);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!user || !gameLoaded) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      const state = {
        invested, equity, dividendDays, accelTickets, investTimestamp,
        autoDividend, spentDividend, oweHumanity, humanityOwes, gameDay, industries,
      };
      fetch("/api/game-state", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, state }),
      }).catch(() => {});
    }, 1000);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [user, gameLoaded, invested, equity, dividendDays, accelTickets, investTimestamp, autoDividend, spentDividend, oweHumanity, humanityOwes, gameDay, industries]);

  useEffect(() => {
    if (user) return;
    const handler = (e: BeforeUnloadEvent) => {
      if (hasGameData) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [user, hasGameData]);

  const playCongratsSound = useCallback(() => {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 0.4);
    });
  }, []);

  const totalDividend = dividendDays * 2 + autoDividend;
  const availableDividend = totalDividend - spentDividend;
  const [activeForumSection, setActiveForumSection] = useState<string | null>(null);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [viewingPost, setViewingPost] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");

  const maxDay = 33;

  const MAX_AMOUNT = 10000;

  const peopleAtDay = (d: number) => Math.pow(2, d - 1);
  const currentPeople = peopleAtDay(gameDay);

  const totalLoans = Array.from({ length: gameDay }, (_, i) => peopleAtDay(i + 1) * MAX_AMOUNT).reduce((a, b) => a + b, 0);
  const totalDeposits = totalLoans;

  const audioCtxRef = useRef<AudioContext | null>(null);
  const getAudioCtx = () => {
    if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
      audioCtxRef.current = new AudioContext();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const playHappySound = () => {
    try {
      const ctx = getAudioCtx();
      const play = (freq: number, start: number, dur: number) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = "triangle";
        o.frequency.value = freq;
        g.gain.setValueAtTime(0.12, ctx.currentTime + start);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
        o.connect(g); g.connect(ctx.destination);
        o.start(ctx.currentTime + start);
        o.stop(ctx.currentTime + start + dur);
      };
      play(440, 0, 0.1);
      play(554, 0.08, 0.1);
      play(659, 0.16, 0.15);
    } catch {}
  };

  const playSadSound = () => {
    try {
      const ctx = getAudioCtx();
      const play = (freq: number, start: number, dur: number) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = "sine";
        o.frequency.value = freq;
        g.gain.setValueAtTime(0.12, ctx.currentTime + start);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
        o.connect(g); g.connect(ctx.destination);
        o.start(ctx.currentTime + start);
        o.stop(ctx.currentTime + start + dur);
      };
      play(440, 0, 0.15);
      play(370, 0.12, 0.15);
      play(311, 0.24, 0.25);
    } catch {}
  };

  const handleApply = useCallback(() => {
    setOweHumanity(v => Math.min(MAX_AMOUNT, v + AMOUNT));
    setHumanityOwes(v => Math.min(MAX_AMOUNT, v + AMOUNT));
    playHappySound();
  }, []);

  const handleReverse = useCallback(() => {
    setOweHumanity(v => Math.max(0, v - AMOUNT));
    setHumanityOwes(v => Math.max(0, v - AMOUNT));
    playSadSound();
  }, []);

  const handleNextDay = useCallback(() => {
    setGameDay(d => {
      const next = Math.min(maxDay, d + 1);
      if (next === maxDay) {
        setTimeout(() => {
          setShowCongrats(true);
          try {
            const ctx = getAudioCtx();
            const playTone = (freq: number, start: number, dur: number) => {
              const o = ctx.createOscillator();
              const g = ctx.createGain();
              o.type = "sine";
              o.frequency.value = freq;
              g.gain.setValueAtTime(0.15, ctx.currentTime + start);
              g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
              o.connect(g);
              g.connect(ctx.destination);
              o.start(ctx.currentTime + start);
              o.stop(ctx.currentTime + start + dur);
            };
            playTone(523, 0, 0.15);
            playTone(659, 0.1, 0.15);
            playTone(784, 0.2, 0.15);
            playTone(1047, 0.3, 0.4);
          } catch {}
        }, 2500);
      }
      return next;
    });
  }, []);

  const days = Array.from({ length: gameDay }, (_, i) => i + 1);

  return (
    <div className="min-h-screen flex flex-col w-full overflow-x-hidden bg-background">
      <Header />
      <main className="flex-grow w-full max-w-3xl mx-auto px-4 md:px-8 pt-8 pb-20" style={{ fontFamily: FONT_CN }}>

        <div className="mb-8">
          <h1
            className="inline-block text-2xl md:text-3xl font-black"
            style={{ letterSpacing: "0.05em", color: "#8B1A1A", fontFamily: "'Noto Sans SC', 'PingFang SC', sans-serif" }}
          >
            模拟市场游戏
          </h1>
        </div>

        {!user && hasGameData && (
          <div className="bg-amber-50 border border-amber-300 rounded-xl px-4 py-3 mb-4 flex items-center gap-3">
            <span className="text-amber-600 text-lg">⚠</span>
            <div className="flex-1">
              <p className="text-sm text-amber-800 font-bold">您尚未登录，游戏数据不会保存</p>
              <p className="text-xs text-amber-700">刷新页面或退出网站后数据将清零，登录后可永久保存进度。</p>
            </div>
            <button
              onClick={() => navigate("/login")}
              className="px-3 py-1.5 rounded-lg text-white text-xs font-bold cursor-pointer hover:brightness-110 transition-all"
              style={{ background: "#F59E0B" }}
            >
              去登录
            </button>
          </div>
        )}

        <section className="mb-10 rounded-2xl bg-white/70 border border-foreground/10 shadow-md p-6 md:p-8">
          <h2 className="text-lg md:text-xl font-bold text-foreground mb-6">1、把劳动承诺转化为资本（游戏）</h2>

          <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6 mb-8">
            <button
              onClick={handleApply}
              disabled={oweHumanity >= MAX_AMOUNT}
              className={`flex-shrink-0 px-6 py-4 rounded-lg font-bold text-white text-lg transition-all ${oweHumanity >= MAX_AMOUNT ? "opacity-40 cursor-not-allowed" : "hover:brightness-110 active:scale-95"}`}
              style={{ background: "#4CAF50", minWidth: 160 }}
            >
              <span className="text-2xl font-black block">申请</span>
              <span className="text-sm block mt-1">和人类兑换欠条</span>
            </button>

            <div className="flex-shrink-0 text-xl md:text-2xl leading-relaxed">
              <p>自己欠人类：<span className="font-mono font-bold">{oweHumanity.toFixed(2)}</span></p>
              <p>人类欠自己：<span className="font-mono font-bold">{humanityOwes.toFixed(2)}</span></p>
            </div>

            <button
              onClick={handleReverse}
              disabled={oweHumanity <= 0}
              className={`flex-shrink-0 px-6 py-4 rounded-lg font-bold text-foreground text-lg transition-all ${oweHumanity <= 0 ? "opacity-40 cursor-not-allowed" : "hover:brightness-110 active:scale-95"}`}
              style={{ background: "#FFC107", minWidth: 120 }}
            >
              <span className="text-xl font-black block">申请</span>
              <span className="text-xs block mt-1">反向兑换</span>
            </button>
          </div>

          <div className="text-base leading-relaxed text-foreground mb-2">
            <p>Σ你=人类</p>
            <p>Σ你的欠条是欠条，以劳动支付！</p>
            <p>人类的欠条是货币，以劳动支付！</p>
          </div>

          <button
            onClick={() => setShowDetail(v => !v)}
            className="px-5 py-1.5 rounded-md text-white font-bold text-sm transition-all hover:brightness-110 active:scale-95 mt-2"
            style={{ background: "#2196F3" }}
          >
            详情
          </button>

          {showDetail && (
            <div className="mt-4 p-4 bg-white/60 border border-border/40 rounded-lg text-sm leading-relaxed text-foreground/80">
              <p className="font-bold mb-2">兑换原理：</p>
              <p>当你申请"和人类兑换欠条"时，你向人类出具一张欠条（承诺用劳动偿还），同时人类也向你出具一张等额欠条。</p>
              <p className="mt-2">你的欠条只是个人信用（欠条），但人类的欠条因为有所有人的劳动做担保，所以它就是货币。</p>
              <p className="mt-2">这就是<span className="font-bold text-primary">把劳动承诺转化为资本</span>的过程。</p>
            </div>
          )}
          <div className="mt-8 pt-6 border-t border-foreground/10">
          <h2 className="text-xl md:text-2xl font-black text-foreground mb-5 flex items-center gap-3">
            <span className="w-1.5 h-7 rounded-full bg-primary inline-block" />
            游戏日历
          </h2>

          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-1.5">
            {days.map((d, i) => {
              const from = peopleAtDay(d);
              const to = peopleAtDay(d + 1);
              const isPast = d < gameDay;
              const isCurrent = d === gameDay;
              const bgColor = isCurrent ? "rgba(0,0,0,0.06)" : isPast ? "rgba(22,163,74,0.04)" : "rgba(0,0,0,0.02)";
              const textColor = isPast ? "#16a34a" : isCurrent ? "#eab308" : "#d97706";
              const borderLeft = isCurrent ? "3px solid #eab308" : isPast ? "3px solid #16a34a" : "3px solid transparent";
              const arrowColor = isPast ? "#16a34a" : isCurrent ? "#eab308" : "#1565C0";
              const isLastDay = d === maxDay;
              return (
                <div key={d} className={`flex items-center rounded-lg px-2.5 py-1.5 ${isLastDay ? "md:col-span-2 md:justify-center md:py-3 py-2.5 justify-center" : ""}`} style={{ background: bgColor, borderLeft }}>
                  <span className={`font-bold mr-2 flex-shrink-0 ${isLastDay ? "text-sm md:text-base" : "text-xs"}`} style={{ color: isCurrent ? "#16a34a" : textColor, minWidth: isLastDay ? undefined : 36 }}>第{d}日</span>
                  <span className={`font-mono font-bold truncate ${isLastDay ? "text-sm md:text-base flex-initial" : "text-xs flex-1"}`}>
                    {isCurrent ? (
                      <><span style={{ color: "#16a34a" }}>{from.toLocaleString()}</span><span style={{ color: "#16a34a" }}>→</span><span style={{ color: "#eab308" }}>{to.toLocaleString()}</span></>
                    ) : (
                      <span style={{ color: textColor }}>{from.toLocaleString()}→{to.toLocaleString()}</span>
                    )}
                  </span>
                  <span className="flex-shrink-0 ml-1">
                    {i < days.length - 1 && (
                      <BlueArrowRight
                        onClick={(e: React.MouseEvent) => {
                          setGameDay(d);
                          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                          setInviteEffect({ x: rect.left + rect.width / 2, y: rect.top, id: Date.now() });
                          playHappySound();
                          setTimeout(() => setInviteEffect(null), 1800);
                        }}
                        color={arrowColor}
                      />
                    )}
                    {i === days.length - 1 && d < maxDay && (
                      <BlueArrowRight
                        onClick={(e: React.MouseEvent) => {
                          handleNextDay();
                          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                          setInviteEffect({ x: rect.left + rect.width / 2, y: rect.top, id: Date.now() });
                          playHappySound();
                          setTimeout(() => setInviteEffect(null), 1800);
                        }}
                        color={arrowColor}
                      />
                    )}
                  </span>
                </div>
              );
            })}
          </div>

          <style>{`
            @keyframes confetti-burst {
              0% { opacity: 1; transform: translate(0, 0) scale(1); }
              100% { opacity: 0; transform: translate(var(--dx), var(--dy)) scale(0.3); }
            }
            @keyframes num-sparkle {
              0% { opacity: 1; transform: translate(0,0) scale(1); }
              100% { opacity: 0; transform: translate(var(--sx), var(--sy)) scale(0); }
            }
            .num-sparkle-wrap { position: relative; display: inline-block; }
            .num-sparkle-dot {
              position: absolute;
              border-radius: 50%;
              animation: num-sparkle 0.9s ease-out forwards;
              pointer-events: none;
            }
          `}</style>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 px-5 py-4 shadow-sm">
              <h3 className="text-base font-bold text-primary mb-2 flex items-center gap-2">
                <span className="w-1 h-4 rounded-full bg-primary inline-block" />
                全球模拟市场
              </h3>
              <p className="text-sm text-foreground/80 leading-relaxed mb-1">全球推动人数：<span className="num-sparkle-wrap font-mono font-bold text-foreground" key={`people-${gameDay}`}>{currentPeople.toLocaleString()}人{Array.from({length:8}).map((_,i)=><span key={i} className="num-sparkle-dot" style={{"--sx":`${(Math.random()-0.5)*40}px`,"--sy":`${(Math.random()-0.5)*30}px`,left:`${Math.random()*100}%`,top:`${Math.random()*100}%`,width:4+Math.random()*4,height:4+Math.random()*4,backgroundColor:["#E65100","#FF9800","#FFD54F","#4CAF50","#2196F3","#F44336"][i%6],animationDelay:`${Math.random()*0.3}s`} as React.CSSProperties} />)}</span></p>
              <p className="text-sm text-foreground/80 leading-relaxed mb-1">每人兑换上限：<span className="font-mono font-bold text-foreground">10,000.00</span></p>
              <p className="text-sm text-foreground/80 leading-relaxed">当前游戏日：<span className="num-sparkle-wrap font-mono font-bold text-primary" key={`day-${gameDay}`}>{gameDay}{Array.from({length:6}).map((_,i)=><span key={i} className="num-sparkle-dot" style={{"--sx":`${(Math.random()-0.5)*30}px`,"--sy":`${(Math.random()-0.5)*24}px`,left:`${Math.random()*100}%`,top:`${Math.random()*100}%`,width:3+Math.random()*3,height:3+Math.random()*3,backgroundColor:["#E65100","#FF9800","#4CAF50","#2196F3"][i%4],animationDelay:`${Math.random()*0.2}s`} as React.CSSProperties} />)}</span></p>
            </div>
            <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 px-5 py-4 shadow-sm">
              <h3 className="text-base font-bold text-primary mb-2 flex items-center gap-2">
                <span className="w-1 h-4 rounded-full bg-primary inline-block" />
                资金统计
              </h3>
              <p className="text-sm text-foreground/80 leading-relaxed mb-1">总借款（1——{gameDay}游戏日）：<span className="num-sparkle-wrap font-mono font-bold text-primary" key={`loan-${gameDay}`}>{totalLoans.toFixed(2)}{Array.from({length:10}).map((_,i)=><span key={i} className="num-sparkle-dot" style={{"--sx":`${(Math.random()-0.5)*50}px`,"--sy":`${(Math.random()-0.5)*30}px`,left:`${Math.random()*100}%`,top:`${Math.random()*100}%`,width:4+Math.random()*4,height:4+Math.random()*4,backgroundColor:["#E65100","#FF9800","#FFD54F","#4CAF50","#2196F3","#F44336"][i%6],animationDelay:`${Math.random()*0.3}s`} as React.CSSProperties} />)}</span></p>
              <p className="text-sm text-foreground/80 leading-relaxed">总存款（1——{gameDay}游戏日）：<span className="num-sparkle-wrap font-mono font-bold text-primary" key={`dep-${gameDay}`}>{totalDeposits.toFixed(2)}{Array.from({length:10}).map((_,i)=><span key={i} className="num-sparkle-dot" style={{"--sx":`${(Math.random()-0.5)*50}px`,"--sy":`${(Math.random()-0.5)*30}px`,left:`${Math.random()*100}%`,top:`${Math.random()*100}%`,width:4+Math.random()*4,height:4+Math.random()*4,backgroundColor:["#E65100","#FF9800","#FFD54F","#4CAF50","#2196F3","#F44336"][i%6],animationDelay:`${Math.random()*0.3}s`} as React.CSSProperties} />)}</span></p>
            </div>
          </div>
          </div>
        </section>


        <section className="mb-10 rounded-2xl bg-white/70 border border-foreground/10 shadow-md p-6 md:p-8">
          <h2 className="text-lg md:text-xl font-black text-foreground mb-5 whitespace-nowrap">
            2、存款投资公共市场<span className="hidden md:inline">，</span><span className="md:hidden">｜</span>锁定流动性（游戏）
          </h2>

          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            <div className="flex-1 space-y-4 w-full md:w-auto text-center md:text-left flex flex-col items-center md:items-start">
              <div className="text-sm text-foreground leading-relaxed">
                <p className="font-bold mb-2">个人演示</p>
                <p>投入：<span className="font-mono font-bold">10000.00</span>存款</p>
                <p>获得：<span className="font-mono font-bold">20000.00</span>股权</p>
                <p>股息：<span className="font-mono font-bold">2.00</span>/日</p>
              </div>

              <button
                onClick={() => {
                  if (!invested) {
                    setInvested(true);
                    setEquity(20000);
                    setAccelTickets(3);
                    setInvestTimestamp(Date.now());
                    playHappySound();
                  }
                }}
                disabled={invested}
                className={`px-8 py-4 rounded-lg font-bold text-white text-lg transition-all ${invested ? "opacity-40 cursor-not-allowed" : "hover:brightness-110 active:scale-95 cursor-pointer"}`}
                style={{ background: "#4CAF50" }}
              >
                <span className="text-xl font-black block">申请投资</span>
                <span className="text-xs block mt-1">公共市场</span>
              </button>

              <div
                className="mt-4 bg-background/50 rounded-lg border border-border/30 overflow-hidden md:max-w-[13rem]"
                onMouseEnter={() => setGoalOpen(true)}
              >
                <button
                  onClick={() => setGoalOpen(v => !v)}
                  className="w-full flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-foreground/5 transition-all"
                >
                  <span className="font-bold text-primary text-sm">整体目标</span>
                  <span className={`text-foreground/50 text-xs transition-transform ${goalOpen ? "rotate-180" : ""}`}>▼</span>
                </button>
                {goalOpen && (
                  <div className="px-3 pb-3 text-sm text-foreground leading-relaxed">
                    <p>投入：80万亿存款</p>
                    <p>获得：160万亿股权</p>
                    <p>收益率：100%</p>
                    <p className="text-primary font-bold text-xs mt-1">让所有人受益！</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 space-y-4 w-full md:w-auto text-center md:text-left flex flex-col items-center md:items-start">
              <div className="relative text-sm text-foreground leading-relaxed bg-background/50 rounded-lg p-3 border border-border/30 md:max-w-xs w-full text-left">
                <p className="font-bold text-primary text-sm mb-2">你的模拟账号</p>
                <button onMouseEnter={() => setShowAccountTip(true)} onMouseLeave={() => setShowAccountTip(false)} onClick={() => setShowAccountTip(true)} className="w-5 h-5 rounded bg-green-700 text-white text-xs font-bold flex items-center justify-center cursor-pointer hover:bg-green-600 absolute top-2 right-2">?</button>
                {showAccountTip && <span className="absolute top-2 right-9 text-xs text-foreground/60 bg-white border border-border rounded px-2 py-1 shadow z-10">模拟数据，仅供演示</span>}
                <p>借款：<span className="font-mono font-bold">{invested ? "10000.00" : "0.00"}</span></p>
                <p>股权：<span className="font-mono font-bold">{invested ? "20000.00" : "0.00"}</span></p>
                <p className="relative inline-block">股息：<span className="font-mono font-bold text-primary">{invested ? `+${availableDividend.toFixed(2)}` : "0.00"}</span>
                  {dividendConfetti && (
                    <>
                      {Array.from({ length: 12 }).map((_, i) => {
                        const colors = ["#E65100", "#FFD600", "#4CAF50", "#1565C0", "#E91E63", "#9C27B0"];
                        const angle = (i / 12) * 360;
                        const dist = 18 + Math.random() * 16;
                        const dx = Math.cos((angle * Math.PI) / 180) * dist;
                        const dy = Math.sin((angle * Math.PI) / 180) * dist;
                        return (
                          <span
                            key={i}
                            className="absolute rounded-full pointer-events-none"
                            style={{
                              width: 5 + Math.random() * 3,
                              height: 5 + Math.random() * 3,
                              background: colors[i % colors.length],
                              left: "50%",
                              top: "50%",
                              opacity: 0,
                              animation: `confetti-burst 0.8s ease-out ${i * 0.03}s forwards`,
                              ["--dx" as string]: `${dx}px`,
                              ["--dy" as string]: `${dy}px`,
                            }}
                          />
                        );
                      })}
                    </>
                  )}
                </p>
              </div>


              <div className="mt-4 w-full">
                <p className="font-bold text-sm mb-2">时间加速器</p>
                <div className="flex items-center gap-2 md:justify-start justify-center">
                  <button
                    onClick={() => {
                      if (invested && accelTickets > 0) {
                        setDividendDays(d => d + 1);
                        setAccelTickets(t => t - 1);
                        setDividendConfetti(false);
                        requestAnimationFrame(() => setDividendConfetti(true));
                        setTimeout(() => setDividendConfetti(false), 1200);
                        playHappySound();
                      }
                    }}
                    disabled={!invested || accelTickets <= 0}
                    className={`px-6 py-3 rounded-lg font-bold text-white text-base transition-all ${!invested || accelTickets <= 0 ? "opacity-40 cursor-not-allowed" : "hover:brightness-110 active:scale-95 cursor-pointer"}`}
                    style={{ background: "#4CAF50" }}
                  >
                    加速1天
                  </button>
                  <button onMouseEnter={() => setShowAccelTip(true)} onMouseLeave={() => setShowAccelTip(false)} onClick={() => setShowAccelTip(true)} className="w-5 h-5 rounded bg-green-700 text-white text-xs font-bold flex items-center justify-center cursor-pointer hover:bg-green-600">?</button>
                  {showAccelTip && <span className="text-xs text-foreground/60 bg-white border border-border rounded px-2 py-1 shadow">每次点击消耗一张加速券</span>}
                </div>
                {invested && (
                  <p className="text-sm text-foreground/70 mt-1">剩余加速券：<span className="font-mono font-bold text-primary">{accelTickets}</span> 张</p>
                )}
              </div>

              {invested && (
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="mt-14 px-4 py-2 rounded-lg border border-foreground/30 text-foreground text-sm font-bold hover:bg-foreground/5 transition-all cursor-pointer active:scale-95"
                >
                  不玩了
                </button>
              )}
            </div>
          </div>

          <div className="mt-6 border-t border-border/30 pt-4 text-center md:text-left">
            <div className="flex items-center gap-2 mb-2 md:justify-start justify-center">
              <a href="https://registered-contract.replit.app/article/preset-jiuye-0" target="_blank" rel="noopener noreferrer" className="font-bold text-primary text-sm hover:underline">什么是公共市场？</a>
              <button onClick={() => setShowMarketTip(v => !v)} className="w-5 h-5 rounded bg-green-700 text-white text-xs font-bold flex items-center justify-center cursor-pointer hover:bg-green-600">?</button>
            </div>
            {showMarketTip && (
              <div className="text-sm text-foreground/80 leading-relaxed bg-background/50 rounded-lg p-3 border border-border/30 whitespace-nowrap">
                <p>原理：用我们人类的消费整合企业、机构和商户！</p>
                <p>价值=人类年消费×N%分销佣金×无限时间</p>
              </div>
            )}
          </div>
        </section>

        <section className="mb-10 bg-white/80 rounded-2xl shadow-sm border border-border/40 p-6" style={{ fontFamily: FONT_CN }}>
          <h2 className="text-xl font-black text-foreground mb-6">3、股息投资（游戏）</h2>

          {INDUSTRY_LIST.map(ind => {
            const st = industries[ind.key];
            if (!st) return null;
            return (
              <div className="mb-6" key={ind.key}>
                <h3
                  className="text-lg font-bold text-foreground mb-4 cursor-pointer select-none flex items-center gap-2 hover:text-primary transition-colors"
                  onClick={() => updateIndustry(ind.key, { expanded: !st.expanded })}
                >
                  <span className="inline-block transition-transform" style={{ transform: st.expanded ? "rotate(0deg)" : "rotate(-90deg)" }}>＋</span>
                  {ind.name} <span className="text-sm font-normal text-foreground/60">（股权开放共享80%）</span>
                </h3>

                {st.expanded && <>
                  <div className="bg-background/50 rounded-xl border border-border/30 p-5 mb-4">
                    <div className="flex flex-col md:flex-row gap-6 items-start mb-6">
                      <div className="bg-amber-50 border-2 border-amber-300 rounded-lg px-6 py-4 text-center">
                        <p className="font-bold text-foreground text-sm">需求</p>
                        <p className="text-2xl font-black text-amber-600">320亿美元</p>
                        <p className="text-xs text-foreground/60">人均限额4美元</p>
                      </div>
                      <div className="flex-1 text-sm text-foreground leading-relaxed space-y-1">
                        <p>试想如果80亿人愿意投资{ind.investText}</p>
                        <p>那么，运维的工作不就是纯技术问题吗？</p>
                        <p>纯技术问题，还有问题吗？</p>
                        <p>流程颠倒，消费者主导，创业就变得无风险！</p>
                        <p className="font-bold">创业无风险，投资就是权力！</p>
                      </div>
                    </div>

                    <div className="border border-foreground/20 rounded-lg overflow-hidden">
                      <div className="bg-gray-100 px-4 py-3 text-center text-sm text-foreground leading-relaxed">
                        <p>剩余20%股权，即可以募集真实市场中的美元，还可以调动最牛的技术</p>
                        <p>因为股权是可以自由拆分的！所以，最牛的技术，来吧，先报名吧！</p>
                      </div>
                      <div className="divide-y divide-foreground/10">
                        <div className="flex items-center px-4 py-3">
                          <span className="flex-1 text-sm text-foreground">80亿人：320亿美元劳动承诺＋市场保障</span>
                          <span className="px-3 py-1 rounded text-white text-xs font-bold mr-2" style={{ background: "#4CAF50" }}>80%</span>
                          <button
                            onClick={() => {
                              if (!invested) {
                                updateIndustry(ind.key, { modal: "no-account" });
                              } else if (availableDividend < 4) {
                                updateIndustry(ind.key, { modal: "insufficient" });
                              } else {
                                updateIndustry(ind.key, { modal: "confirm-apply" });
                              }
                            }}
                            disabled={st.applied}
                            className={`px-4 py-1.5 rounded text-sm font-bold text-white transition-all ${st.applied ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:brightness-110 active:scale-95"}`}
                            style={{ background: "#F59E0B" }}
                          >
                            {st.applied ? "已申请" : "申请"}
                          </button>
                        </div>
                        <div className="flex items-center px-4 py-3">
                          <span className="flex-1 text-sm text-foreground">全球资本竞标，比谁出的美元多！</span>
                          <span className="px-3 py-1 rounded text-white text-xs font-bold mr-2" style={{ background: "#F59E0B" }}>10%</span>
                          <button
                            onClick={() => { updateIndustry(ind.key, { modal: "capital", capitalRegistered: true }); playHappySound(); }}
                            disabled={st.capitalRegistered}
                            className={`px-4 py-1.5 rounded text-sm font-bold text-white transition-all ${st.capitalRegistered ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:brightness-110 active:scale-95"}`}
                            style={{ background: st.capitalRegistered ? "#9CA3AF" : "#F59E0B" }}
                          >
                            {st.capitalRegistered ? "看过了" : "登记"}
                          </button>
                        </div>
                        <div className="flex items-center px-4 py-3">
                          <span className="flex-1 text-sm text-foreground">全球技术竞标，比谁的技术厉害！</span>
                          <span className="px-3 py-1 rounded text-white text-xs font-bold mr-2" style={{ background: "#F59E0B" }}>10%</span>
                          <button
                            onClick={() => { updateIndustry(ind.key, { modal: "tech", techRegistered: true, techAnswer: null }); }}
                            disabled={st.techRegistered}
                            className={`px-4 py-1.5 rounded text-sm font-bold text-white transition-all ${st.techRegistered ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:brightness-110 active:scale-95"}`}
                            style={{ background: st.techRegistered ? "#9CA3AF" : "#F59E0B" }}
                          >
                            {st.techRegistered ? "看过了" : "登记"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border/30 pt-3">
                    {st.forumPosts.map((post) => (
                      <div key={post.id} className="mb-2">
                        <button
                          onClick={() => { setActiveForumSection(ind.key); setViewingPost(post.id); }}
                          className="text-left w-full px-3 py-2 rounded-lg hover:bg-foreground/5 transition-all cursor-pointer"
                        >
                          <span className="text-sm font-bold text-foreground">{post.id}、{post.title}</span>
                          <span className="text-xs text-foreground/50 ml-2">{post.replies.length} 回复</span>
                        </button>
                      </div>
                    ))}
                    <div className="flex justify-center mt-3">
                      <button
                        onClick={() => { if (!user) { setShowLoginPrompt(true); return; } setActiveForumSection(ind.key); setShowNewPost(true); }}
                        className="w-10 h-10 rounded-full border-2 border-primary/40 text-primary text-2xl flex items-center justify-center cursor-pointer hover:bg-primary/10 transition-all active:scale-90"
                      >
                        ＋
                      </button>
                    </div>
                  </div>
                </>}
              </div>
            );
          })}

        </section>

        <section className="bg-white/80 rounded-2xl shadow-sm border border-border/40 p-6" style={{ fontFamily: FONT_CN }}>
          <h2 className="text-xl font-black text-foreground mb-6">4、模式市场的目的（游戏）<br className="md:hidden" /><span className="md:hidden block text-right">——给休闲时间装上眼睛</span><span className="hidden md:inline">——给休闲时间装上眼睛</span></h2>

          <div className="mb-6">
            <svg viewBox="0 0 560 320" className="w-full max-w-lg mx-auto" style={{ fontFamily: FONT_CN }}>
              <defs>
                <linearGradient id="greenArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#059669" stopOpacity="0.95" />
                </linearGradient>
                <linearGradient id="yellowArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#eab308" stopOpacity="0.9" />
                </linearGradient>
              </defs>

              <line x1="60" y1="20" x2="60" y2="270" stroke="#333" strokeWidth="2" />
              <line x1="60" y1="270" x2="530" y2="270" stroke="#333" strokeWidth="2" />
              <polygon points="60,15 56,25 64,25" fill="#333" />
              <polygon points="535,270 525,266 525,274" fill="#333" />

              <text x="25" y="60" textAnchor="middle" fontSize="13" fill="#333" fontWeight="bold">人</text>
              <text x="25" y="78" textAnchor="middle" fontSize="13" fill="#333" fontWeight="bold">类</text>
              <text x="25" y="96" textAnchor="middle" fontSize="13" fill="#333" fontWeight="bold">年</text>
              <text x="25" y="114" textAnchor="middle" fontSize="13" fill="#333" fontWeight="bold">消</text>
              <text x="25" y="132" textAnchor="middle" fontSize="13" fill="#333" fontWeight="bold">费</text>
              <text x="530" y="295" textAnchor="middle" fontSize="14" fill="#333" fontWeight="bold">时间</text>

              <path d="M60,270 L60,40 L480,40 L480,270 Z" fill="url(#yellowArea)" />
              <path d="M60,270 L60,140 L160,140 L380,230 L480,230 L480,270 Z" fill="url(#greenArea)" />

              <text x="270" y="120" textAnchor="middle" fontSize="20" fill="#fff" fontWeight="900">利润可计算</text>
              <text x="140" y="210" textAnchor="middle" fontSize="15" fill="#fff" fontWeight="900">股权开放共享80%</text>
              <text x="140" y="230" textAnchor="middle" fontSize="15" fill="#fff" fontWeight="900">成本可计算</text>
            </svg>
          </div>

          <div className="bg-background/50 rounded-xl border border-border/30 p-5">
            <h3 className="text-lg font-black text-foreground mb-3">估算</h3>
            <div className="text-sm text-foreground leading-relaxed space-y-1">
              <p>未来100年人类消费总额大于6000万亿美元</p>
              <p>未来100年，股权开放共享80%</p>
              <p>去掉分销、金融和盲目投资成本</p>
              <p className="font-bold text-primary">利润总额大于3000万亿美元</p>
              <p className="font-bold text-primary">会转化为人类的股权资产！</p>
              <p className="mt-2">全球智力的休闲时间可以精确计算各个领域的成本，</p>
              <p>实现去掉分销、金融和盲目投资成本。</p>
            </div>
          </div>
        </section>

      </main>
      <Footer />

      {(() => {
        const activeInd = INDUSTRY_LIST.find(ind => industries[ind.key]?.modal);
        if (!activeInd) return null;
        const st = industries[activeInd.key];
        const modal = st.modal;
        const closeModal = () => updateIndustry(activeInd.key, { modal: null });
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={closeModal}>
            <div className="bg-white rounded-2xl shadow-2xl px-6 py-5 max-w-sm mx-4 w-full" onClick={e => e.stopPropagation()}>
              {modal === "no-account" && (
                <>
                  <h3 className="font-bold text-lg text-foreground mb-3">暂无模拟账号</h3>
                  <p className="text-sm text-foreground/80 leading-relaxed mb-2">您还没有模拟账号。</p>
                  <p className="text-sm text-foreground/80 leading-relaxed mb-2">请先到上方"存款投资公共市场"板块，点击<span className="font-bold text-green-600">「申请投资」</span>获得股权。</p>
                  <p className="text-sm text-primary font-bold">股权产股息，有股息才能投资！</p>
                </>
              )}
              {modal === "insufficient" && (
                <>
                  <h3 className="font-bold text-lg text-foreground mb-3">股息不足</h3>
                  <p className="text-sm text-foreground/80 leading-relaxed mb-2">申请需要 <span className="font-bold text-primary">4.00</span> 股息，您当前可用股息为 <span className="font-bold text-primary">{availableDividend.toFixed(2)}</span>。</p>
                  <p className="text-sm text-foreground/80 leading-relaxed mb-2">请使用<span className="font-bold text-green-600">「加速券」</span>或等待24小时自动产生股息。</p>
                  <p className="text-sm text-primary font-bold">股权日产股息比例：万分之一</p>
                </>
              )}
              {modal === "confirm-apply" && (
                <>
                  <h3 className="font-bold text-lg text-foreground mb-3">确认申请投资</h3>
                  <p className="text-sm text-foreground/80 leading-relaxed mb-2">将扣除 <span className="font-bold text-primary">4.00</span> 股息。</p>
                  <p className="text-sm text-foreground/80 leading-relaxed mb-2">您当前可用股息：<span className="font-bold text-primary">{availableDividend.toFixed(2)}</span></p>
                  <p className="text-sm text-foreground/80 leading-relaxed mb-3">您将与人类共享80%的股权，享受劳动承诺和市场保障。</p>
                  <div className="flex gap-2">
                    <button
                      onClick={closeModal}
                      className="flex-1 py-2 rounded-lg border border-foreground/20 text-foreground text-sm font-bold cursor-pointer hover:bg-foreground/5 transition-all"
                    >
                      取消
                    </button>
                    <button
                      onClick={() => {
                        setSpentDividend(prev => prev + 4);
                        updateIndustry(activeInd.key, { applied: true, modal: "apply" });
                      }}
                      className="flex-1 py-2 rounded-lg text-white text-sm font-bold cursor-pointer hover:brightness-110 transition-all"
                      style={{ background: "#4CAF50" }}
                    >
                      确认申请投资
                    </button>
                  </div>
                </>
              )}
              {modal === "apply" && (
                <>
                  <h3 className="font-bold text-lg text-foreground mb-3">申请成功！</h3>
                  <p className="text-sm text-foreground/80 leading-relaxed mb-2">已扣除 <span className="font-bold text-primary">4.00</span> 股息。</p>
                  <p className="text-sm text-foreground/80 leading-relaxed mb-2">80亿人每人投入4美元，共320亿美元。</p>
                  <p className="text-sm text-foreground/80 leading-relaxed mb-2">您将与人类共享80%的股权，享受劳动承诺和市场保障。</p>
                  <p className="text-sm text-primary font-bold">这是属于全人类的投资！</p>
                </>
              )}
              {modal === "capital" && (
                <>
                  <h3 className="font-bold text-lg text-foreground mb-3">登记 — 全球资本竞标</h3>
                  <p className="text-sm text-foreground/80 leading-relaxed mb-2">亲爱的投资人，等人类搞明白了，你再来，投资就无风险了。</p>
                  <div className="relative flex justify-center my-3">
                    {Array.from({ length: 16 }).map((_, i) => {
                      const colors = ["#E65100", "#FFD600", "#4CAF50", "#1565C0", "#E91E63", "#9C27B0"];
                      const angle = (i / 16) * 360;
                      const dist = 25 + Math.random() * 20;
                      const dx = Math.cos((angle * Math.PI) / 180) * dist;
                      const dy = Math.sin((angle * Math.PI) / 180) * dist;
                      return (
                        <span
                          key={i}
                          className="absolute rounded-full pointer-events-none"
                          style={{
                            width: 6 + Math.random() * 4,
                            height: 6 + Math.random() * 4,
                            background: colors[i % colors.length],
                            left: "50%",
                            top: "50%",
                            opacity: 0,
                            animation: `confetti-burst 1s ease-out ${i * 0.04}s forwards`,
                            ["--dx" as string]: `${dx}px`,
                            ["--dy" as string]: `${dy}px`,
                          }}
                        />
                      );
                    })}
                    <span className="text-4xl">🎉</span>
                  </div>
                </>
              )}
              {modal === "tech" && (
                <>
                  <h3 className="font-bold text-lg text-foreground mb-3">登记 — 全球技术竞标</h3>
                  <p className="text-sm text-foreground/80 leading-relaxed mb-3">你是厉害的技术吗？</p>
                  {st.techAnswer === null && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => { updateIndustry(activeInd.key, { techAnswer: "yes", techCount: st.techCount + 1 }); playHappySound(); }}
                        className="flex-1 py-2 rounded-lg text-white text-sm font-bold cursor-pointer hover:brightness-110 transition-all"
                        style={{ background: "#4CAF50" }}
                      >
                        是
                      </button>
                      <button
                        onClick={() => { updateIndustry(activeInd.key, { techAnswer: "no" }); playSadSound(); }}
                        className="flex-1 py-2 rounded-lg border border-foreground/20 text-foreground text-sm font-bold cursor-pointer hover:bg-foreground/5 transition-all"
                      >
                        否
                      </button>
                    </div>
                  )}
                  {st.techAnswer === "yes" && (
                    <div className="text-center mt-3">
                      <p className="text-5xl mb-2">👍</p>
                      <p className="text-sm text-foreground/80 mb-1">技术登记人数：</p>
                      <p className="text-3xl font-black text-primary">{st.techCount}</p>
                    </div>
                  )}
                  {st.techAnswer === "no" && (
                    <div className="text-center mt-3">
                      <p className="text-5xl mb-2">😢</p>
                      <p className="text-sm text-primary font-bold">继续努力去吧</p>
                    </div>
                  )}
                </>
              )}
              {modal !== "tech" && modal !== "confirm-apply" && (
                <div>
                  <button
                    onClick={() => {
                      const wasApply = modal === "apply";
                      closeModal();
                      if (wasApply) {
                        setShowBigConfetti(true);
                        setShowFlyText(true);
                        playCongratsSound();
                        setTimeout(() => setShowBigConfetti(false), 4000);
                        setTimeout(() => setShowFlyText(false), 3000);
                      }
                    }}
                    className="mt-4 w-full py-2 rounded-lg bg-primary text-white font-bold text-sm cursor-pointer hover:brightness-110 transition-all"
                  >
                    知道了
                  </button>
                  {modal === "capital" && (
                    <p className="text-center text-sm font-bold text-primary mt-2">投资无风险👍</p>
                  )}
                </div>
              )}
              {modal === "tech" && st.techAnswer !== null && (
                <button
                  onClick={closeModal}
                  className="mt-4 w-full py-2 rounded-lg bg-primary text-white font-bold text-sm cursor-pointer hover:brightness-110 transition-all"
                >
                  知道了
                </button>
              )}
            </div>
          </div>
        );
      })()}

      {showNewPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowNewPost(false)}>
          <div className="bg-white rounded-2xl shadow-2xl px-6 py-5 max-w-md mx-4 w-full" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg text-foreground mb-4">发布新帖</h3>
            <input
              value={newPostTitle}
              onChange={e => setNewPostTitle(e.target.value)}
              placeholder="帖子标题"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm mb-3 outline-none focus:border-primary"
            />
            <textarea
              value={newPostContent}
              onChange={e => setNewPostContent(e.target.value)}
              placeholder="帖子内容..."
              rows={4}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm mb-3 outline-none focus:border-primary resize-none"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowNewPost(false)}
                className="px-4 py-2 rounded-lg border border-foreground/30 text-foreground text-sm font-bold hover:bg-foreground/5 transition-all cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={() => {
                  if (newPostTitle.trim() && newPostContent.trim()) {
                    if (activeForumSection) updateIndustryForum(activeForumSection, prev => [...prev, {
                      id: prev.length + 1,
                      title: newPostTitle.trim(),
                      content: newPostContent.trim(),
                      author: user?.username ?? "匿名用户",
                      time: new Date().toISOString().slice(0, 10),
                      replies: [],
                    }]);
                    setNewPostTitle("");
                    setNewPostContent("");
                    setShowNewPost(false);
                  }
                }}
                disabled={!newPostTitle.trim() || !newPostContent.trim()}
                className={`px-4 py-2 rounded-lg text-white text-sm font-bold transition-all ${!newPostTitle.trim() || !newPostContent.trim() ? "opacity-40 cursor-not-allowed" : "hover:brightness-110 cursor-pointer"}`}
                style={{ background: "#4CAF50" }}
              >
                发布
              </button>
            </div>
          </div>
        </div>
      )}

      {viewingPost !== null && (() => {
        const activePosts = activeForumSection ? industries[activeForumSection]?.forumPosts ?? [] : [];
        const post = activePosts.find(p => p.id === viewingPost);
        if (!post) return null;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => { setViewingPost(null); setReplyContent(""); }}>
            <div className="bg-white rounded-2xl shadow-2xl px-6 py-5 max-w-lg mx-4 w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <h3 className="font-bold text-lg text-foreground mb-1">{post.title}</h3>
              <p className="text-xs text-foreground/50 mb-3">{post.author} · {post.time}</p>
              <p className="text-sm text-foreground/80 leading-relaxed mb-4">{post.content}</p>

              {post.replies.length > 0 && (
                <div className="border-t border-border/30 pt-3 mb-3">
                  <p className="text-xs font-bold text-foreground/60 mb-2">回复 ({post.replies.length})</p>
                  {post.replies.map((r, i) => (
                    <div key={i} className="bg-gray-50 rounded-lg px-3 py-2 mb-2 text-sm">
                      <p className="font-bold text-xs text-foreground/60">{r.author} · {r.time}</p>
                      <p className="text-foreground/80">{r.content}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  value={replyContent}
                  onChange={e => setReplyContent(e.target.value)}
                  placeholder="写回复..."
                  className="flex-1 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                  onKeyDown={e => {
                    if (e.key === "Enter" && replyContent.trim() && activeForumSection) {
                      if (!user) { setViewingPost(null); setReplyContent(""); setShowLoginPrompt(true); return; }
                      updateIndustryForum(activeForumSection, prev => prev.map(p => p.id === post.id ? { ...p, replies: [...p.replies, { author: user.username, content: replyContent.trim(), time: new Date().toISOString().slice(0, 10) }] } : p));
                      setReplyContent("");
                    }
                  }}
                />
                <button
                  onClick={() => {
                    if (replyContent.trim() && activeForumSection) {
                      if (!user) { setViewingPost(null); setReplyContent(""); setShowLoginPrompt(true); return; }
                      updateIndustryForum(activeForumSection, prev => prev.map(p => p.id === post.id ? { ...p, replies: [...p.replies, { author: user.username, content: replyContent.trim(), time: new Date().toISOString().slice(0, 10) }] } : p));
                      setReplyContent("");
                    }
                  }}
                  disabled={!replyContent.trim()}
                  className={`px-4 py-2 rounded-lg text-white text-sm font-bold transition-all ${!replyContent.trim() ? "opacity-40 cursor-not-allowed" : "hover:brightness-110 cursor-pointer"}`}
                  style={{ background: "#4CAF50" }}
                >
                  回复
                </button>
              </div>

              <button
                onClick={() => { setViewingPost(null); setReplyContent(""); }}
                className="mt-3 w-full py-2 rounded-lg border border-foreground/20 text-foreground/60 text-sm font-bold cursor-pointer hover:bg-foreground/5 transition-all"
              >
                关闭
              </button>
            </div>
          </div>
        );
      })()}

      {inviteEffect && (
        <div key={inviteEffect.id} className="fixed z-50 pointer-events-none" style={{ left: inviteEffect.x - 80, top: inviteEffect.y - 40 }}>
          <style>{`
            @keyframes invite-float {
              0% { opacity: 0; transform: translateY(0) scale(0.7); }
              20% { opacity: 1; transform: translateY(-10px) scale(1); }
              35% { opacity: 0.65; transform: translateY(-18px) scale(1); }
              80% { opacity: 0.65; transform: translateY(-40px) scale(1); }
              100% { opacity: 0; transform: translateY(-60px) scale(0.9); }
            }
            @keyframes mini-confetti {
              0% { opacity: 1; transform: translateY(0) rotate(0deg); }
              100% { opacity: 0; transform: translateY(40px) rotate(360deg); }
            }
          `}</style>
          <div style={{ animation: "invite-float 1.6s ease-out forwards", fontFamily: FONT_CN }} className="text-primary font-bold text-lg whitespace-nowrap text-center">
            股东邀请股东
          </div>
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                left: `${30 + Math.random() * 100}px`,
                top: `${10 + Math.random() * 20}px`,
                width: `${4 + Math.random() * 5}px`,
                height: `${4 + Math.random() * 5}px`,
                backgroundColor: ["#E65100", "#FF9800", "#FFD54F", "#4CAF50", "#2196F3", "#F44336"][i % 6],
                borderRadius: Math.random() > 0.5 ? "50%" : "1px",
                animation: `mini-confetti ${0.8 + Math.random() * 0.8}s ease-out ${Math.random() * 0.3}s forwards`,
              }}
            />
          ))}
        </div>
      )}

      {showCongrats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowCongrats(false)}>
          <style>{`
            @keyframes confetti-fall {
              0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
              100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
            }
            .confetti-piece {
              position: fixed;
              top: -20px;
              animation: confetti-fall linear forwards;
            }
          `}</style>
          {Array.from({ length: 400 }).map((_, i) => (
            <div
              key={i}
              className="confetti-piece"
              style={{
                left: `${Math.random() * 100}%`,
                width: `${5 + Math.random() * 10}px`,
                height: `${5 + Math.random() * 10}px`,
                backgroundColor: ["#E65100", "#FF9800", "#FFD54F", "#F44336", "#4CAF50", "#2196F3", "#9C27B0", "#FF4081"][i % 8],
                borderRadius: Math.random() > 0.5 ? "50%" : "2px",
                animationDuration: `${1.5 + Math.random() * 2.5}s`,
                animationDelay: `${Math.random() * 0.5}s`,
              }}
            />
          ))}
          <div
            className="bg-white rounded-2xl shadow-2xl px-8 py-10 max-w-md mx-4 text-center animate-in fade-in zoom-in duration-300 relative z-10"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-4xl mb-4">🎉</div>
            <h3 className="text-xl font-bold text-primary mb-3" style={{ fontFamily: FONT_CN }}>
              恭喜你终于看到了市场的全貌，<br />变成了市场的主人！
            </h3>
            <button
              onClick={() => setShowCongrats(false)}
              className="mt-4 px-6 py-2 rounded-lg bg-primary text-white font-bold hover:opacity-90 transition-opacity cursor-pointer"
            >
              关闭
            </button>
          </div>
        </div>
      )}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowResetConfirm(false)}>
          <div
            className="bg-white rounded-2xl shadow-2xl px-8 py-8 max-w-sm mx-4 text-center"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-3xl mb-3">⚠️</div>
            <h3 className="text-lg font-bold text-foreground mb-2" style={{ fontFamily: FONT_CN }}>
              确认归零？
            </h3>
            <p className="text-sm text-foreground/70 mb-5">所有账号数据将被清零，包括投资、股权和股息。此操作不可撤销。</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-5 py-2 rounded-lg border border-foreground/30 text-foreground text-sm font-bold hover:bg-foreground/5 transition-all cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={() => {
                  setInvested(false);
                  setEquity(0);
                  setDividendDays(0);
                  setAccelTickets(0);
                  setInvestTimestamp(null);
                  setAutoDividend(0);
                  setSpentDividend(0);
                  setIndustries(() => {
                    const init: Record<string, IndustryState> = {};
                    INDUSTRY_LIST.forEach(ind => {
                      init[ind.key] = {
                        applied: false, capitalRegistered: false, techRegistered: false,
                        techCount: ind.techStart, techAnswer: null, expanded: false, modal: null,
                        forumPosts: [{ id: 1, title: ind.defaultPost, content: ind.postContent, author: "系统", time: "2026-01-01", replies: [] }],
                      };
                    });
                    return init;
                  });
                  setOweHumanity(0);
                  setHumanityOwes(0);
                  setGameDay(1);
                  setShowResetConfirm(false);
                  playSadSound();
                }}
                className="px-5 py-2 rounded-lg bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-all cursor-pointer"
              >
                确认归零
              </button>
            </div>
          </div>
        </div>
      )}

      {showFlyText && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center pointer-events-none">
          <style>{`
            @keyframes fly-in-text {
              0% { opacity: 0; transform: scale(0.3) translateY(60px); }
              30% { opacity: 1; transform: scale(1.1) translateY(-10px); }
              50% { transform: scale(1) translateY(0); }
              80% { opacity: 1; }
              100% { opacity: 0; transform: scale(0.9) translateY(-30px); }
            }
          `}</style>
          <div
            className="bg-white/95 rounded-2xl shadow-2xl px-8 py-6 border-2 border-primary/30"
            style={{ animation: "fly-in-text 3s ease-out forwards" }}
          >
            <p className="text-xl font-black text-primary text-center">你的一大步，是人类的一小步👍</p>
          </div>
        </div>
      )}

      {showBigConfetti && (
        <div className="fixed inset-0 z-[100] pointer-events-none">
          <style>{`
            @keyframes big-confetti-fall {
              0% { transform: translateY(-100vh) rotate(0deg) scale(1); opacity: 1; }
              50% { opacity: 1; }
              100% { transform: translateY(100vh) rotate(1080deg) scale(0.5); opacity: 0; }
            }
          `}</style>
          {Array.from({ length: 300 }).map((_, i) => {
            const colors = ["#E65100", "#FFD600", "#4CAF50", "#1565C0", "#E91E63", "#9C27B0", "#FF5722", "#00BCD4", "#FF9800", "#8BC34A"];
            return (
              <div
                key={i}
                style={{
                  position: "fixed",
                  top: -20,
                  left: `${Math.random() * 100}%`,
                  width: `${6 + Math.random() * 12}px`,
                  height: `${6 + Math.random() * 12}px`,
                  background: colors[i % colors.length],
                  borderRadius: Math.random() > 0.5 ? "50%" : "2px",
                  animation: `big-confetti-fall ${2 + Math.random() * 2}s linear ${Math.random() * 0.8}s forwards`,
                }}
              />
            );
          })}
        </div>
      )}
      {showLoginPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowLoginPrompt(false)}>
          <div className="bg-white rounded-2xl shadow-2xl px-6 py-5 max-w-sm mx-4 w-full" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg text-foreground mb-3">请先登录</h3>
            <p className="text-sm text-foreground/80 leading-relaxed mb-4">发布帖子和回复需要登录账号，请先登录或注册。</p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="flex-1 py-2 rounded-lg border border-foreground/20 text-foreground text-sm font-bold cursor-pointer hover:bg-foreground/5 transition-all"
              >
                取消
              </button>
              <button
                onClick={() => { setShowLoginPrompt(false); navigate("/login"); }}
                className="flex-1 py-2 rounded-lg text-white text-sm font-bold cursor-pointer hover:brightness-110 transition-all"
                style={{ background: "#F59E0B" }}
              >
                去登录
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
