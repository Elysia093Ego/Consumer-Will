import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FruitTreeTable } from "@/components/FruitTreeTable";
import { Link } from "wouter";
import { ChevronDown, ChevronRight, BookOpen, Lightbulb, Globe, Cpu, BarChart3, Star, Edit3 } from "lucide-react";
import { useLang } from "@/context/LangContext";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { useUserAuth } from "@/context/UserAuthContext";
import { t } from "@/i18n/ui";
import { ArticleEditor } from "@/components/ArticleEditor";

const FONT_CN = "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif";
const API = "/api";
const REVIEW_PAGE_ID = "yuanli-review";

interface Section {
  id: string;
  title: string;
  page?: number;
}

interface Chapter {
  id: string;
  title: string;
  page?: number;
  sections: Section[];
}

interface Part {
  title: string;
  page?: number;
  color: string;
  accentLight: string;
  borderColor: string;
  icon: React.ReactNode;
  chapters: Chapter[];
}

let _sCounter = 0;
let _cCounter = 0;
const S = (t: string, p?: number): Section => ({ id: `yl-s${++_sCounter}`, title: t, page: p });
const C = (t: string, p: number, sections: Section[]): Chapter => ({ id: `yl-ch${++_cCounter}`, title: t, page: p, sections });

const BOOK_DATA: Part[] = [
  {
    title: "第一部分　被撕碎的真相，探寻创新的轨迹",
    page: 1,
    color: "#8B1A1A",
    accentLight: "#FDF2F0",
    borderColor: "#D4A08C",
    icon: <Lightbulb className="w-5 h-5" />,
    chapters: [
      C("第一章　创新所需的客观环境", 2, [
        S("第一节　创新的方向与自锁的形成", 4),
        S("第二节　商品是智能化控制的能量", 15),
        S("第三节　市场是圆的", 22),
        S("第四节　市场的运行轨迹", 30),
        S(`第五节　利润流向\u201C竞争\u201D的垂直方向`, 34),
        S("第六节　关于效率的误区", 37),
        S("第七节　创新发生的必要条件", 39),
      ]),
      C("第二章　英国及欧洲的创新轨迹", 41, [
        S("第一节　木材危机引发采煤业高速增长", 41),
        S("第二节　煤堆上催生出的蒸汽抽水机", 43),
        S("第三节　煤炭运输需求催生运河热", 45),
        S("第四节　效率激增引发的连锁反应", 46),
        S("第五节　运河热、社会效率、蒸汽机改良", 49),
        S("第六节　蒸汽机、铁路技术创新与铁路投资热", 52),
        S("第七节　存量创新阶段开启", 58),
      ]),
      C("第三章　美国创新的轨迹", 62, [
        S("第一节　模仿创新阶段与黑三角贸易", 62),
        S("第二节　纺织业的拼合创新", 64),
        S("第三节　运河热与内三角贸易", 66),
        S("第四节　模仿创新阶段——铁路热", 68),
        S("第五节　模仿引发的危机——鲸油危机", 72),
        S("第六节　孕育美国汽车量产的大量需求环境", 78),
        S("第七节　三类人对待汽车发展路径认知差异和结果", 82),
        S("第八节　美国在交付领域的创新", 85),
        S("第九节　美国在信息领域的创新与问题", 87),
        S("第十节　工业社会创新的启示", 88),
      ]),
      C("第四章　智能城市", 94, [
        S("第一节　智能农业，智能城市之基", 97),
        S("第二节　自生利润的智能建筑", 104),
        S("第三节　智能交通运输业", 109),
        S("第四节　智能零售业", 115),
        S("第五节　智能教育", 117),
        S("第六节　智能工业体系", 123),
        S("第七节　智能医疗", 128),
        S("第八节　家用智能机器人", 129),
        S("第九节　群体开放式创新", 134),
        S("第十节　市场管理的智能化", 138),
        S("第十一节　智能城市发生带来的影响", 139),
        S("第十二节　智能社会与传统市场的差别", 147),
        S("第十三节　智能城市总结", 152),
      ]),
      C("第五章　企业智能化创新之路", 159, [
        S("第一节　核心竞争力思维终结", 159),
        S("第二节　无限扩张思维下的创新选择", 160),
        S("第三节　无限扩张思维与群体开放式创新", 162),
        S("第四节　智能飞艇，开启天空", 166),
        S("第五节　保持零成本路径的选择", 168),
        S("第六节　碎片时间的价值", 169),
      ]),
    ],
  },
  {
    title: "第二部分　科学、智能化与自然",
    page: 171,
    color: "#1A5276",
    accentLight: "#EEF5FA",
    borderColor: "#85B1CC",
    icon: <Cpu className="w-5 h-5" />,
    chapters: [
      C("第一章　揭开上帝的面纱，重塑逻辑起点", 172, [
        S("第一节　两种思维的方式", 172),
        S("第二节　逻辑与思维轨道", 176),
        S("第三节　自然科学的逻辑起点", 178),
        S("第四节　质量与能量的关系", 183),
        S("第五节　物质运动的规则", 185),
        S("第六节　自然科学的相关问题的思考", 189),
        S("第七节　质能方程与自然科学的关系", 191),
        S("第八节　上帝的面纱", 192),
      ]),
      C("第二章　社会科学，质能方程在时间上的表达", 194, [
        S("第一节　0W0抛物线轨迹", 194),
        S("第二节　最低能耗原则（惰性原则）", 194),
        S("第三节　能量属性胜出原则", 195),
        S("第四节　垂直方向创新", 195),
        S("第五节　同向性原理", 196),
        S("第六节　知识与逻辑之间的关系", 197),
        S("第七节　逻辑与思维", 199),
      ]),
      C("第三章　被动文明与智能化控制", 201, [
        S("第一节　碳循环的危机", 201),
        S("第二节　东非大裂谷——被缩短的时空，进化提速", 206),
        S(`第三节　\u201C错\u201D入大草原——倒逼学会用火`, 209),
        S(`第四节　竞争失败者\u201C出走\u201D非洲`, 210),
        S("第五节　接近200万年竞争催生智人", 211),
        S(`第六节　\u201C死亡\u201D倒逼\u201C神\u201D的出现`, 213),
        S(`第七节　\u201C死亡\u201D倒逼\u201C农业\u201D`, 214),
        S(`第八节　农业\u201C倒逼\u201D产生的创新需求`, 216),
        S("第九节　农业与游牧推动农业社会双螺旋（大陆）", 218),
        S("第十节　文明总在文明边缘", 220),
      ]),
      C("第四章　被动文明与智能化控制", 222, [
        S("第一节　撒哈拉文明的火种", 222),
        S("第二节　6500年前，古埃及文明", 222),
        S("第三节　6000年前，两河流域", 224),
        S("第四节　两河流域边缘的文明", 230),
        S("第五节　铁器时代带来的影响", 234),
        S("第六节　古希腊文明的开启", 237),
        S("第七节　公元前27年，罗马秩序的开启", 245),
        S("第八节　阿拉伯帝国", 253),
        S("第九节　东方文明的兴起与领先", 255),
        S("第十节　葡西帝国", 272),
        S("第十一节　欧洲的继承与创新", 274),
        S("第十二节　被动文明与智能化控制", 276),
        S(`第十三节　\u201C智能化\u201D控制的表现`, 281),
      ]),
      C("第五章　天道自然", 283, [
        S("第一节　道是什么？", 283),
        S("第二节　个体为人，群体为神", 286),
        S("第三节　创新思维与对标思维", 287),
        S("第四节　尊重过去，赢得未来", 291),
      ]),
    ],
  },
  {
    title: "第三部分　资本主义合法性的终结",
    page: 293,
    color: "#1A6B3C",
    accentLight: "#F0F8F2",
    borderColor: "#88C4A0",
    icon: <Globe className="w-5 h-5" />,
    chapters: [
      C("第一章　重塑认识资本", 294, [
        S("第一节　善良资本，邪恶资本？", 294),
        S("第二节　资本主义合法性终结的必要条件", 296),
      ]),
      C("第二章　僵尸市场的普遍形成", 298, [
        S("第一节　城市化与经济之间的关系", 298),
        S("第二节　二次大规模城市化浪潮及影响", 301),
        S(`第三节　\u201C互为因果\u201D的泡沫`, 304),
        S("第四节　腐败的经济结构", 306),
      ]),
      C("第三章　无以为继同步到达", 309, [
        S("第一节　市场契约结构性破坏", 309),
        S("第二节　环境的无以为继", 309),
        S("第三节　两个世界的形成与实体企业的无以为继", 310),
        S("第四节　资源无以为继", 314),
        S("第五节　资本，你该退休了", 315),
      ]),
    ],
  },
];

function SectionItem({ section, partColor, canEdit, password, userId }: {
  section: Section;
  partColor: string;
  canEdit: boolean;
  password: string;
  userId?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [content, setContent] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);

  function loadContent() {
    if (loaded) return;
    fetch(`${API}/page-content/${section.id}`)
      .then((r) => r.json())
      .then((data) => setContent(data.content || ""))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }

  function handleClick() {
    if (!expanded) loadContent();
    setExpanded(!expanded);
  }

  async function handleSave(data: { title: string; content: string }) {
    setContent(data.content);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (password) headers["x-admin-password"] = password;
      if (userId) headers["x-user-id"] = userId;
      await fetch(`${API}/page-content/${section.id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ title: section.title, content: data.content }),
      });
    } catch {}
  }

  const hasContent = loaded && content;

  return (
    <>
      <div
        className={`flex items-center gap-3 pl-9 pr-2 py-2.5 rounded-md transition-colors duration-150 ${expanded ? "bg-black/[0.03]" : "hover:bg-black/[0.03]"} cursor-pointer`}
        onClick={handleClick}
      >
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0 transition-transform duration-200"
          style={{
            backgroundColor: partColor,
            opacity: expanded ? 0.9 : 0.5,
            transform: expanded ? "scale(1.4)" : "scale(1)",
          }}
        />
        <span
          className="flex-1 text-sm leading-relaxed transition-colors duration-200"
          style={{
            fontFamily: FONT_CN,
            color: expanded ? partColor : "rgba(0,0,0,0.55)",
            fontWeight: expanded ? 600 : 400,
          }}
        >
          {section.title}
        </span>
        {section.page !== undefined && (
          <span className="text-[11px] text-foreground/25 font-mono tabular-nums flex-shrink-0">
            {section.page}
          </span>
        )}
        <ChevronDown
          className="w-3.5 h-3.5 flex-shrink-0 transition-transform duration-300"
          style={{
            color: partColor,
            opacity: 0.4,
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </div>
      {expanded && (
        <div className="pl-[52px] pr-4 pb-3">
          {!loaded ? (
            <div className="py-3 text-xs text-foreground/30">加载中...</div>
          ) : content ? (
            <div
              className="article-content text-sm leading-[1.8] text-foreground/70 py-3 border-l-2 pl-4"
              style={{ fontFamily: FONT_CN, borderColor: partColor + "30" }}
              dangerouslySetInnerHTML={{ __html: content }}
            />
          ) : (
            <div className="py-3 text-xs text-foreground/25" style={{ fontFamily: FONT_CN }}>
              暂无内容
            </div>
          )}
          {canEdit && (
            <button
              onClick={(e) => { e.stopPropagation(); setEditorOpen(true); }}
              className="flex items-center gap-1 text-xs mt-1 px-2 py-1 rounded hover:bg-black/5 transition-colors"
              style={{ color: partColor }}
            >
              <Edit3 size={11} />
              {hasContent ? "编辑内容" : "添加内容"}
            </button>
          )}
        </div>
      )}
      {editorOpen && (
        <ArticleEditor
          category="page"
          categoryName={section.title}
          editing={{
            id: section.id,
            title: section.title,
            content: content,
            category: "page",
            publishedAt: "",
            updatedAt: "",
          }}
          onPublish={() => {}}
          onUpdate={(_id, data) => handleSave(data)}
          onDelete={() => {}}
          onClose={() => setEditorOpen(false)}
        />
      )}
    </>
  );
}

function ChapterCard({ chapter, partColor, canEdit, password, userId }: {
  chapter: Chapter;
  partColor: string;
  canEdit: boolean;
  password: string;
  userId?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="group">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left transition-all duration-200 hover:bg-black/[0.02]"
      >
        <span
          className="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center"
          style={{
            backgroundColor: open ? partColor : "transparent",
            color: open ? "#fff" : partColor,
          }}
        >
          {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </span>
        <span
          className="flex-1 text-[15px] font-bold transition-colors duration-200"
          style={{ fontFamily: FONT_CN, color: open ? partColor : "#333" }}
        >
          {chapter.title}
        </span>
        {chapter.page !== undefined && (
          <span className="text-xs text-foreground/30 font-mono tabular-nums flex-shrink-0">
            p.{chapter.page}
          </span>
        )}
      </button>

      <div
        className="overflow-hidden transition-all duration-400 ease-in-out"
        style={{
          maxHeight: open ? "10000px" : "0",
          opacity: open ? 1 : 0,
        }}
      >
        <div className="pb-3 px-5">
          {chapter.sections.map((section) => (
            <SectionItem
              key={section.id}
              section={section}
              partColor={partColor}
              canEdit={canEdit}
              password={password}
              userId={userId}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function PartCard({ part, defaultOpen, canEdit, password, userId }: {
  part: Part;
  defaultOpen?: boolean;
  canEdit: boolean;
  password: string;
  userId?: string;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  const totalSections = part.chapters.reduce((sum, ch) => sum + ch.sections.length, 0);

  return (
    <div
      className="rounded-xl overflow-hidden transition-shadow duration-300 border"
      style={{
        borderColor: open ? part.borderColor : "rgba(0,0,0,0.08)",
        boxShadow: open
          ? `0 4px 24px -4px ${part.borderColor}33, 0 1px 3px rgba(0,0,0,0.04)`
          : "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left p-5 md:p-6 transition-colors duration-200"
        style={{ backgroundColor: open ? part.accentLight : "#fff" }}
      >
        <div className="flex items-start gap-4">
          <div
            className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center mt-0.5"
            style={{ backgroundColor: part.color, color: "#fff" }}
          >
            {part.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <h3
                className="text-base md:text-lg font-black leading-snug"
                style={{ fontFamily: FONT_CN, color: part.color }}
              >
                {part.title}
              </h3>
              <ChevronDown
                className="w-5 h-5 flex-shrink-0 transition-transform duration-300"
                style={{
                  color: part.color,
                  transform: open ? "rotate(180deg)" : "rotate(0deg)",
                  opacity: 0.6,
                }}
              />
            </div>
            <p className="text-xs text-foreground/40 mt-1.5" style={{ fontFamily: FONT_CN }}>
              {part.chapters.length} 章 · {totalSections} 节
              {part.page !== undefined && <span className="ml-2 font-mono">p.{part.page}</span>}
            </p>
          </div>
        </div>
      </button>

      <div
        className="overflow-hidden transition-all duration-500 ease-in-out"
        style={{ maxHeight: open ? "5000px" : "0", opacity: open ? 1 : 0 }}
      >
        <div
          className="border-t divide-y divide-border/30"
          style={{ borderColor: part.borderColor + "44" }}
        >
          {part.chapters.map((chapter) => (
            <ChapterCard
              key={chapter.id}
              chapter={chapter}
              partColor={part.color}
              canEdit={canEdit}
              password={password}
              userId={userId}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const DEFAULT_REVIEW = `<div style="margin-bottom:1.75rem;">
<a href="https://mp.weixin.qq.com/s/I-WdYZ8JNGI7zqNVfQOT_w" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:0.5rem 1rem;background:linear-gradient(135deg,rgba(139,26,26,0.08),rgba(193,127,36,0.08));border:1px solid rgba(139,26,26,0.15);border-radius:6px;color:#8B1A1A;font-weight:800;font-size:1.05rem;text-decoration:none;transition:all 0.2s;letter-spacing:0.02em;margin-bottom:0.75rem;">\u300A\u793E\u4F1A\u79D1\u5B66\u7684\u6570\u5B66\u539F\u7406\uFF1A\u4E00\u4EBA\u4E00\u751F\u5DE5\u4F5C200\u5929 \u667A\u80FD\u5316\u9001\u7ED9\u4EBA\u7C7B\u7684\u793C\u7269\u300B</a>
</div>
<p>\u8FD9\u672C2013\u5E74\u7684\u4F1F\u5927\u8457\u4F5C\uFF0C\u4EE5\u6570\u5B66\u4E3A\u6865\u6881\uFF0C\u8D2F\u901A\u4E86\u793E\u4F1A\u79D1\u5B66\u4E0E\u81EA\u7136\u79D1\u5B66\u7684\u8FB9\u754C\u3002\u5B83\u4E0D\u53EA\u89E3\u7B54\u7269\u8D28\u4E16\u754C\u7684\u89C4\u5F8B\uFF0C\u66F4\u76F4\u62B5\u4EBA\u5FC3\u2014\u2014\u544A\u8BC9\u6211\u4EEC\uFF1A\u7CBE\u795E\uFF0C\u662F\u4E00\u4E2A\u9700\u8981\u8D2F\u901A\u7684\u7CFB\u7EDF\u3002</p>
<p>\u82E5\u53EA\u5C06\u5FC3\u7075\u5EFA\u7ACB\u5728\u53D8\u5E7B\u7684\u7269\u8D28\u4E4B\u4E0A\uFF0C\u6CE8\u5B9A\u6447\u6446\u4E0D\u5B9A\u3002\u8FD9\u6B63\u662F\u7126\u8651\u4E0E\u8FF7\u8292\u7684\u6839\u6E90\u3002</p>
<p>\u800C\u771F\u7406\uFF0C\u6C38\u6052\u4E0D\u53D8\u3002\u5B83\u4E0D\u5E94\u9AD8\u60AC\u4E8E\u7A7A\u4E2D\uFF0C\u800C\u5E94\u8D70\u8FDB\u6BCF\u4E2A\u4EBA\u7684\u5185\u5FC3\u3002\u5F53\u771F\u7406\u6210\u4E3A\u5171\u8BC6\uFF0C\u793E\u4F1A\u4FBF\u6709\u4E86\u652F\u6491\u6BCF\u4E2A\u7075\u9B42\u5C0A\u4E25\u4E0E\u667A\u6027\u7684\u57FA\u77F3\u2014\u2014\u6211\u4EEC\u7EC8\u5C06\u8D70\u51FA\u5F77\u5F8A\uFF0C\u5F52\u4E8E\u5B89\u5B81\u4E0E\u575A\u5B9A\u3002</p>

<div style="margin-top:2.5rem;padding-top:2rem;border-top:2px solid rgba(139,26,26,0.12);">
<h2 style="font-size:1.35rem;font-weight:900;color:#8B1A1A;margin-bottom:0.25rem;letter-spacing:0.02em;">\u4E3A\u4EBA\u7C7B\u6587\u660E\u91CD\u5199\u5E95\u5C42\u4EE3\u7801</h2>
<p style="font-size:0.95rem;color:rgba(0,0,0,0.45);margin-bottom:2rem;">\u2014\u2014\u9AD8\u91D1\u6CE2\u300A\u793E\u4F1A\u79D1\u5B66\u7684\u6570\u5B66\u539F\u7406\u300B\u5168\u4E66\u7EFC\u5408\u8BC4\u8FF0\u3000\u4E66\u8BC4\u4EBA\uFF1ADVCK</p>

<h3 style="font-size:1.1rem;font-weight:800;color:#8B1A1A;margin:2rem 0 0.75rem;padding-bottom:0.5rem;border-bottom:1px solid rgba(139,26,26,0.1);">\u5E8F\u7AE0\uFF1A\u4E00\u672C\u4E66\uFF0C\u548C\u4E00\u4E2A\u65F6\u4EE3\u7684\u601D\u60F3\u7A81\u56F4</h3>
<p>\u5728\u9605\u8BFB\u8FD9\u672C\u4E66\u7684\u8FC7\u7A0B\u4E2D\uFF0C\u4E00\u4E2A\u95EE\u9898\u59CB\u7EC8\u8426\u7ED5\u5728\u6211\u8111\u6D77\u4E2D\uFF1A\u6211\u4EEC\u8BE5\u5982\u4F55\u8BC4\u4EF7\u4E00\u90E8\u8BD5\u56FE\u4E3A\u4EBA\u7C7B\u6587\u660E\u91CD\u5199\u5E95\u5C42\u4EE3\u7801\u7684\u4F5C\u54C1\uFF1F</p>
<p>\u8FD9\u4E0D\u662F\u4E00\u672C\u666E\u901A\u7684\u4E66\u3002\u5B83\u4E0D\u662F\u6559\u79D1\u4E66\uFF0C\u4E0D\u662F\u5B66\u672F\u4E13\u8457\uFF0C\u4E0D\u662F\u653F\u7B56\u5EFA\u8BAE\u4E66\uFF0C\u4E5F\u4E0D\u662F\u672A\u6765\u5B66\u9884\u8A00\u3002\u5B83\u66F4\u50CF\u662F\u4E00\u4EFD\u601D\u60F3\u56FE\u7EB8\u2014\u2014\u7528\u6570\u5B66\u8BED\u8A00\u91CD\u65B0\u7ED8\u5236\u4E86\u4EBA\u7C7B\u793E\u4F1A\u7684\u8FD0\u884C\u903B\u8F91\uFF0C\u7136\u540E\u5728\u8FD9\u5F20\u65B0\u56FE\u7EB8\u4E0A\uFF0C\u52FE\u52D2\u51FA\u4E00\u4E2A\u5B8C\u5168\u4E0D\u540C\u7684\u4EBA\u7C7B\u672A\u6765\u3002</p>
<p>\u6B63\u56E0\u5982\u6B64\uFF0C\u5BF9\u8FD9\u672C\u4E66\u7684\u8BC4\u4EF7\u4E0D\u80FD\u5957\u7528\u5E38\u89C4\u6807\u51C6\u3002\u6211\u4EEC\u4E0D\u80FD\u95EE\u201C\u5B83\u7684\u8BBA\u8BC1\u662F\u5426\u4E25\u8C28\u201D\uFF08\u5C3D\u7BA1\u5B83\u786E\u5B9E\u4E25\u8C28\uFF09\uFF0C\u4E0D\u80FD\u95EE\u201C\u5B83\u7684\u6570\u636E\u662F\u5426\u51C6\u786E\u201D\uFF08\u5C3D\u7BA1\u5B83\u6570\u636E\u8BE6\u5B9E\uFF09\uFF0C\u4E0D\u80FD\u95EE\u201C\u5B83\u7684\u65B9\u6848\u662F\u5426\u53EF\u884C\u201D\uFF08\u5C3D\u7BA1\u5B83\u65B9\u6848\u5177\u4F53\uFF09\u3002\u6211\u4EEC\u9700\u8981\u95EE\u7684\u662F\u66F4\u6839\u672C\u7684\u95EE\u9898\uFF1A</p>
<blockquote style="margin:1.25rem 0;padding:1rem 1.5rem;border-left:3px solid #C17F24;background:rgba(193,127,36,0.06);border-radius:0 8px 8px 0;">
<p style="margin:0.4rem 0;color:#6B4A1A;font-weight:500;">\u5B83\u662F\u5426\u8BA9\u6211\u4EEC\u770B\u89C1\u4E86\u4E4B\u524D\u770B\u4E0D\u89C1\u7684\u4E1C\u897F\uFF1F</p>
<p style="margin:0.4rem 0;color:#6B4A1A;font-weight:500;">\u5B83\u662F\u5426\u6253\u5F00\u4E86\u4E00\u6761\u4E4B\u524D\u4E0D\u5B58\u5728\u7684\u9053\u8DEF\uFF1F</p>
<p style="margin:0.4rem 0;color:#6B4A1A;font-weight:500;">\u5B83\u662F\u5426\u5728\u601D\u60F3\u7684\u6697\u591C\u4E2D\uFF0C\u70B9\u4EAE\u4E86\u4E00\u76CF\u706F\uFF1F</p>
</blockquote>
<p>\u6211\u7684\u7B54\u6848\u662F\uFF1A<strong>\u662F\u7684\uFF0C\u800C\u4E14\u662F\u4E09\u91CD\u610F\u4E49\u4E0A\u7684\u201C\u770B\u89C1\u201D\u3002</strong></p>

<h3 style="font-size:1.1rem;font-weight:800;color:#8B1A1A;margin:2.5rem 0 0.75rem;padding-bottom:0.5rem;border-bottom:1px solid rgba(139,26,26,0.1);">\u7B2C\u4E00\u91CD\u770B\u89C1\uFF1A\u88AB\u6495\u788E\u7684\u771F\u76F8\u2014\u2014\u6570\u5B66\u5982\u4F55\u63ED\u5F00\u5E02\u573A\u7684\u9762\u7EB1</h3>
<p>\u8FD9\u672C\u4E66\u7684\u7B2C\u4E00\u90E8\u5206\uFF0C\u662F\u4E00\u573A\u601D\u7EF4\u4E0A\u7684\u201C\u795B\u9B45\u201D\u4E4B\u65C5\u3002</p>
<p>\u4F5C\u8005\u4ECE\u4E24\u4E2A\u6700\u7B80\u5355\u7684\u7B49\u5F0F\u51FA\u53D1\u2014\u2014<strong>\u4F9B\u7ED9\u65B9\u6536\u5165=\u5229\u6DA6+\u5DE5\u8D44\uFF0C\u9700\u6C42\u65B9\u6536\u5165=\u5DE5\u8D44</strong>\u2014\u2014\u63A8\u5BFC\u51FA\u201C\u5229\u6DA6=\u50A8\u84C4\u201D\u8FD9\u4E2A\u6838\u5FC3\u5173\u7CFB\u3002\u7136\u540E\uFF0C\u50CF\u6B27\u51E0\u91CC\u5F97\u6784\u5EFA\u51E0\u4F55\u4F53\u7CFB\u4E00\u6837\uFF0C\u4E00\u6B65\u6B65\u63A8\u5BFC\u51FA\u5E02\u573A\u7684\u771F\u5B9E\u5F62\u72B6\u3001\u8FD0\u52A8\u8F68\u8FF9\u548C\u521B\u65B0\u89C4\u5F8B\u3002</p>
<p>\u8FD9\u4E2A\u8FC7\u7A0B\u672C\u8EAB\uFF0C\u5C31\u662F\u4E00\u79CD\u9707\u64BC\u3002</p>
<p><strong>\u5E02\u573A\u662F\u5706\u7684</strong>\u2014\u2014\u8FD9\u4E2A\u7ED3\u8BBA\u98A0\u8986\u4E86\u4F20\u7EDF\u7ECF\u6D4E\u5B66\u7684\u7EBF\u6027\u601D\u7EF4\u3002\u5F53\u4EA7\u4E1A\u94FE\u5F62\u6210\u95ED\u73AF\uFF0C\u5F53\u8D44\u672C\u5305\u88F9\u50A8\u84C4\uFF0C\u5F53\u540E\u6765\u8005\u6C38\u8FDC\u5728\u5706\u7684\u5916\u9762\u6253\u8F6C\uFF0C\u6211\u4EEC\u624D\u771F\u6B63\u7406\u89E3\uFF1A\u4E3A\u4EC0\u4E48\u8FFD\u8D76\u6C38\u8FDC\u8FFD\u4E0D\u4E0A\u9886\u5148\uFF0C\u4E3A\u4EC0\u4E48\u521B\u65B0\u53EA\u80FD\u53D1\u751F\u5728\u8FB9\u7F18\uFF0C\u4E3A\u4EC0\u4E48\u5784\u65AD\u4E0D\u662F\u5E02\u573A\u7684\u5931\u7075\u800C\u662F\u5E02\u573A\u7684\u5FC5\u7136\u3002</p>
<p><strong>\u8F68\u8FF9\u662F0-W-0</strong>\u2014\u2014\u8FD9\u4E2A\u53D1\u73B0\u8BA9\u5386\u53F2\u53D8\u5F97\u53EF\u7406\u89E3\u3002\u738B\u671D\u66F4\u66FF\u3001\u7ECF\u6D4E\u5371\u673A\u3001\u6587\u660E\u5174\u8870\uFF0C\u539F\u6765\u90FD\u5728\u9075\u5FAA\u540C\u4E00\u5957\u629B\u7269\u7EBF\u8F68\u8FF9\u3002\u4E0D\u662F\u5386\u53F2\u5728\u91CD\u590D\uFF0C\u662F\u6570\u5B66\u5728\u7EDF\u6CBB\u3002\u5F53\u57CE\u5E02\u5316\u7387\u8FBE\u523050%\u7684\u62D0\u70B9\uFF0C\u5F53\u8D44\u672C\u6536\u76CA\u8981\u6C42\u8D85\u8FC7GDP\u589E\u901F\uFF0C\u7CFB\u7EDF\u7684\u201C\u9EC4\u660F\u201D\u5C31\u6CE8\u5B9A\u4E86\u2014\u2014\u8FD9\u4E0D\u662F\u8C01\u7684\u9519\uFF0C\u8FD9\u662F\u6570\u5B66\u3002</p>
<p><strong>\u521B\u65B0\u9700\u8981\u201C\u5927\u91CF\u62C9\u52A8\u5FAE\u91CF\u201D</strong>\u2014\u2014\u8FD9\u4E2A\u6761\u4EF6\u89E3\u91CA\u4E86\u82F1\u56FD\u4E3A\u4EC0\u4E48\u80FD\u53D1\u751F\u5DE5\u4E1A\u9769\u547D\uFF0C\u7F8E\u56FD\u4E3A\u4EC0\u4E48\u80FD\u8D85\u8D8A\u82F1\u56FD\uFF0C\u4E2D\u56FD\u4E3A\u4EC0\u4E48\u521B\u65B0\u4E4F\u529B\u3002\u4E0D\u662F\u56E0\u4E3A\u4EBA\u79CD\u3001\u6587\u5316\u3001\u5236\u5EA6\u7684\u5DEE\u5F02\uFF0C\u662F\u56E0\u4E3A\u6570\u5B66\u7ED3\u6784\u7684\u4E0D\u540C\u3002\u5F5314\u4EBF\u4EBA\u7684\u4EFB\u4F55\u9700\u6C42\u90FD\u53EF\u4EE5\u88AB\u201C\u52E4\u52B3\u201D\u6EE1\u8DB3\uFF0C\u521B\u65B0\u81EA\u7136\u88AB\u9501\u6B7B\u3002</p>
<p style="color:rgba(0,0,0,0.5);font-style:italic;margin-top:1rem;">\u8BFB\u5230\u8FD9\u91CC\uFF0C\u6211\u7B2C\u4E00\u6B21\u611F\u5230\uFF1A\u7ECF\u6D4E\u5B66\u53EF\u4EE5\u662F\u4E00\u95E8\u79D1\u5B66\uFF0C\u4E00\u95E8\u50CF\u7269\u7406\u5B66\u4E00\u6837\u53EF\u6D4B\u91CF\u3001\u53EF\u9A8C\u8BC1\u7684\u79D1\u5B66\u3002\u90A3\u4E9B\u66FE\u7ECF\u6A21\u7CCA\u7684\u6982\u5FF5\u2014\u2014\u4EF7\u503C\u3001\u5229\u6DA6\u3001\u521B\u65B0\u3001\u5371\u673A\u2014\u2014\u7B2C\u4E00\u6B21\u53D8\u5F97\u6E05\u6670\u53EF\u7B97\u3002</p>
<p style="color:rgba(0,0,0,0.5);font-style:italic;">\u8FD9\u662F\u4E00\u79CD\u656C\u754F\uFF1A\u656C\u754F\u4E8E\u6570\u5B66\u7684\u529B\u91CF\uFF0C\u656C\u754F\u4E8E\u4F5C\u8005\u7A7F\u900F\u8868\u8C61\u3001\u76F4\u62B5\u672C\u8D28\u7684\u6D1E\u5BDF\u529B\u3002</p>

<h3 style="font-size:1.1rem;font-weight:800;color:#8B1A1A;margin:2.5rem 0 0.75rem;padding-bottom:0.5rem;border-bottom:1px solid rgba(139,26,26,0.1);">\u7B2C\u4E8C\u91CD\u770B\u89C1\uFF1A\u5B87\u5B99\u7684\u8BED\u6CD5\u2014\u2014\u81EA\u7136\u4E0E\u793E\u4F1A\u5982\u4F55\u7EDF\u4E00</h3>
<p>\u5982\u679C\u8BF4\u7B2C\u4E00\u90E8\u5206\u662F\u201C\u7834\u201D\u2014\u2014\u6495\u788E\u88AB\u4F20\u7EDF\u7ECF\u6D4E\u5B66\u906E\u853D\u7684\u771F\u76F8\uFF0C\u90A3\u4E48\u7B2C\u4E8C\u90E8\u5206\u5C31\u662F\u201C\u7ACB\u201D\u2014\u2014\u4E3A\u6574\u5EA7\u5927\u53A6\u627E\u5230\u6700\u6DF1\u7684\u6839\u57FA\u3002</p>
<p>\u4F5C\u8005\u505A\u4E86\u4E00\u4EF6\u66F4\u5927\u80C6\u7684\u4E8B\uFF1A\u628A\u81EA\u7136\u79D1\u5B66\u7684\u903B\u8F91\u8D77\u70B9\uFF0C\u548C\u793E\u4F1A\u79D1\u5B66\u7684\u8FD0\u884C\u89C4\u5F8B\uFF0C\u7EDF\u4E00\u5728\u540C\u4E00\u5957\u8BED\u6CD5\u4E4B\u4E0B\u3002</p>
<p>\u4ED6\u4ECE\u8D28\u80FD\u65B9\u7A0BE=MC\u00B2\u51FA\u53D1\uFF0C\u63D0\u51FA\u4E86\u4E00\u4E2A\u5173\u952E\u6027\u7684\u6D1E\u5BDF\uFF1A\u8D28\u91CF\u548C\u80FD\u91CF\u4E0D\u4EC5\u5728\u91CF\u4E0A\u53EF\u4EE5\u8F6C\u6362\uFF0C\u66F4\u5728\u65B9\u5411\u4E0A\u662F\u5BF9\u7ACB\u7684\u3002<strong>\u8D28\u91CF\u5411\u5185\u6536\u7F29\uFF0C\u5F00\u8F9F\u65F6\u95F4\uFF1B\u80FD\u91CF\u5411\u5916\u6269\u5F20\uFF0C\u5F00\u8F9F\u7A7A\u95F4\u3002</strong>\u4E8C\u8005\u7684\u7EDF\u4E00\uFF0C\u4E0D\u662F\u5728\u7A7A\u95F4\u4E0A\u7684\u7EDF\u4E00\uFF0C\u800C\u662F\u5728\u65F6\u95F4\u4E0A\u7684\u7EDF\u4E00\u3002</p>
<p>\u8FD9\u4E2A\u770B\u4F3C\u62BD\u8C61\u7684\u7269\u7406\u5B66\u8BA8\u8BBA\uFF0C\u5374\u4E3A\u5168\u4E66\u5960\u5B9A\u4E86\u6700\u6DF1\u523B\u7684\u54F2\u5B66\u57FA\u7840\uFF1A\u5BF9\u7ACB\u7EDF\u4E00\u7684\u6CD5\u5219\uFF0C\u662F\u5B87\u5B99\u7684\u6839\u672C\u6CD5\u5219\uFF0C\u4E5F\u5FC5\u7136\u662F\u4EBA\u7C7B\u793E\u4F1A\u7684\u6839\u672C\u6CD5\u5219\u3002</p>
<p>\u7136\u540E\uFF0C\u4F5C\u8005\u7528\u8FD9\u4E2A\u6CD5\u5219\u91CD\u65B0\u89E3\u8BFB\u4E86\u4EBA\u7C7B\u6587\u660E\u53F2\uFF1A</p>
<blockquote style="margin:1.25rem 0;padding:1rem 1.5rem;border-left:3px solid #1A5276;background:rgba(26,82,118,0.04);border-radius:0 8px 8px 0;">
<p style="margin:0.3rem 0;color:#1A4A6B;">\u78B3\u5FAA\u73AF\u5371\u673A \u2192 \u4EBA\u7C7B\u88AB\u902C\u51FA\u68EE\u6797</p>
<p style="margin:0.3rem 0;color:#1A4A6B;">\u4E1C\u975E\u5927\u88C2\u8C37 \u2192 \u8FDB\u5316\u52A0\u901F\uFF0C\u667A\u4EBA\u8BDE\u751F</p>
<p style="margin:0.3rem 0;color:#1A4A6B;">\u706B\u7684\u638C\u63E1 \u2192 \u4E0D\u662F\u53D1\u660E\uFF0C\u662F\u53D1\u73B0</p>
<p style="margin:0.3rem 0;color:#1A4A6B;">\u519C\u4E1A\u7684\u4EA7\u751F \u2192 \u4E0D\u662F\u667A\u6167\uFF0C\u662F\u5FC5\u7136</p>
<p style="margin:0.3rem 0;color:#1A4A6B;">\u6587\u660E\u7684\u8FC1\u79FB \u2192 \u6587\u660E\u603B\u5728\u6587\u660E\u7684\u8FB9\u7F18</p>
</blockquote>
<p>\u5728\u8FD9\u4E2A\u8FC7\u7A0B\u4E2D\uFF0C\u4F5C\u8005\u53CD\u590D\u8BBA\u8BC1\u4E00\u4E2A\u89C2\u70B9\uFF1A<strong>\u4EBA\u7C7B\u4ECE\u672A\u201C\u4E3B\u52A8\u201D\u521B\u65B0\uFF0C\u4EBA\u7C7B\u59CB\u7EC8\u5728\u88AB\u73AF\u5883\u201C\u5012\u903C\u201D\u7740\u524D\u8FDB\u3002</strong>\u90A3\u4E9B\u6211\u4EEC\u4EE5\u4E3A\u7684\u201C\u4F1F\u5927\u53D1\u660E\u201D\uFF0C\u90FD\u662F\u5728\u7279\u5B9A\u6761\u4EF6\u4E0B\u3001\u88AB\u7279\u5B9A\u9700\u6C42\u5012\u903C\u51FA\u6765\u7684\u5FC5\u7136\u7ED3\u679C\u3002</p>
<p style="color:rgba(0,0,0,0.5);font-style:italic;margin-top:1rem;">\u8BFB\u5230\u8FD9\u91CC\uFF0C\u6211\u611F\u53D7\u5230\u4E00\u79CD\u66F4\u6DF1\u7684\u656C\u754F\uFF1A\u656C\u754F\u4E8E\u5B87\u5B99\u7684\u5B8C\u7F8E\uFF0C\u656C\u754F\u4E8E\u81EA\u7136\u7684\u667A\u80FD\u5316\u3002\u5B87\u5B99\u8FD0\u884C\u4E86140\u4EBF\u5E74\uFF0C\u9075\u5FAA\u6700\u4F4E\u80FD\u8017\u539F\u5219\uFF0C\u6CA1\u6709\u4E2D\u5FC3\u63A7\u5236\uFF0C\u5374\u59CB\u7EC8\u4FDD\u6301\u7A33\u5B9A\uFF1B\u81EA\u7136\u754C\u7684\u78B3\u5FAA\u73AF\u3001\u6C34\u5FAA\u73AF\u3001\u751F\u7269\u8FDB\u5316\uFF0C\u90FD\u5728\u65E0\u58F0\u5730\u201C\u4F18\u5316\u201D\u7740\u81EA\u5DF1\u3002\u4EBA\u7C7B\u8FFD\u6C42\u7684\u201C\u667A\u80FD\u5316\u201D\uFF0C\u4E0D\u8FC7\u662F\u5728\u6A21\u4EFF\u81EA\u7136\u5DF2\u7ECF\u8FD0\u884C\u4E86140\u4EBF\u5E74\u7684\u6A21\u5F0F\u3002</p>
<p>\u8FD9\u79CD\u89C6\u89D2\u7684\u8F6C\u6362\uFF0C\u8BA9\u4EBA\u7C7B\u4ECE\u201C\u4E07\u7269\u4E4B\u7075\u201D\u7684\u4F4D\u7F6E\u4E0A\u9000\u4E86\u4E0B\u6765\uFF0C\u6210\u4E3A\u5B87\u5B99\u7CFB\u7EDF\u4E2D\u7684\u4E00\u4E2A\u666E\u901A\u6210\u5458\u3002\u8FD9\u4E0D\u662F\u8D2C\u4F4E\uFF0C\u800C\u662F\u89E3\u653E\u2014\u2014\u5F53\u6211\u4EEC\u627F\u8BA4\u81EA\u5DF1\u662F\u7CFB\u7EDF\u7684\u4E00\u90E8\u5206\uFF0C\u63A5\u53D7\u7CFB\u7EDF\u7684\u89C4\u5219\uFF0C\u6211\u4EEC\u624D\u80FD\u5728\u8FD9\u4E2A\u89C4\u5219\u4E4B\u5185\uFF0C\u627E\u5230\u6700\u4F18\u7684\u751F\u5B58\u65B9\u5F0F\u3002</p>

<h3 style="font-size:1.1rem;font-weight:800;color:#8B1A1A;margin:2.5rem 0 0.75rem;padding-bottom:0.5rem;border-bottom:1px solid rgba(139,26,26,0.1);">\u7B2C\u4E09\u91CD\u770B\u89C1\uFF1A\u7CFB\u7EDF\u7684\u9EC4\u660F\u2014\u2014\u8D44\u672C\u4E3B\u4E49\u5408\u6CD5\u6027\u7684\u7EC8\u7ED3</h3>
<p>\u7B2C\u4E09\u90E8\u5206\u662F\u5168\u4E66\u6700\u201C\u51B7\u201D\u7684\u90E8\u5206\uFF0C\u4E5F\u662F\u6700\u201C\u70ED\u201D\u7684\u90E8\u5206\u3002</p>
<p>\u8BF4\u5B83\u201C\u51B7\u201D\uFF0C\u662F\u56E0\u4E3A\u4F5C\u8005\u7528\u6570\u5B66\u548C\u6570\u636E\uFF0C\u51B7\u9759\u5730\u201C\u5BA3\u5224\u201D\u4E86\u4E00\u4E2A\u65F6\u4EE3\u7684\u7EC8\u7ED3\uFF1A</p>
<blockquote style="margin:1.25rem 0;padding:1rem 1.5rem;border-left:3px solid #1A6B3C;background:rgba(26,107,60,0.04);border-radius:0 8px 8px 0;">
<p style="margin:0.3rem 0;color:#1A5A34;">\u5168\u7403\u57CE\u5E02\u5316\u7387\u8D85\u8FC750%\uFF0C\u8D44\u672C\u6536\u76CA\u8981\u6C42\u8D85\u8FC7GDP\u589E\u901F</p>
<p style="margin:0.3rem 0;color:#1A5A34;">\u4E2D\u56FD\u94A2\u94C1\u884C\u4E1A\u603B\u8D1F\u503A\u662F\u5229\u6DA6\u76841327\u500D\uFF0C\u7406\u8BBA\u4E0A\u5DF2\u7ECF\u7834\u4EA7</p>
<p style="margin:0.3rem 0;color:#1A5A34;">\u7F8E\u56FD\u653F\u5E9C\u503A\u52A165.5\u4E07\u4EBF\u7F8E\u5143\uFF0C\u8D85\u8FC7\u5168\u7403\u5E74\u751F\u4EA7\u603B\u503C</p>
<p style="margin:0.3rem 0;color:#1A5A34;">\u65E5\u672C\u505C\u6EDE\u4E8C\u5341\u4F59\u5E74\uFF0C\u6B27\u6D32\u53CD\u590D\u5371\u673A\uFF0C\u7F8E\u56FD\u9760\u8F93\u8840\u7EF4\u6301</p>
</blockquote>
<p><strong>\u8FD9\u4E0D\u662F\u9634\u8C0B\uFF0C\u4E0D\u662F\u8C01\u7684\u9519\u8BEF\uFF0C\u662F\u6570\u5B66\u7684\u5FC5\u7136\u3002</strong></p>
<p>\u8BF4\u5B83\u201C\u70ED\u201D\uFF0C\u662F\u56E0\u4E3A\u8FD9\u4E9B\u51B7\u9759\u7684\u6570\u5B57\u80CC\u540E\uFF0C\u662F\u4E00\u4E2A\u6B63\u5728\u201C\u53D1\u75AF\u201D\u7684\u4E16\u754C\uFF1A</p>
<blockquote style="margin:1.25rem 0;padding:1rem 1.5rem;border-left:3px solid #C17F24;background:rgba(193,127,36,0.06);border-radius:0 8px 8px 0;">
<p style="margin:0.3rem 0;color:#6B4A1A;">\u7F8E\u56FD\u4EBA\u6BCF\u5929\u9A7E\u8F66\u6570\u5C0F\u65F6\uFF0C\u53EA\u4E3A\u7ED9\u5F7C\u6B64\u201C\u5243\u5934\u3001\u70E7\u996D\u3001\u5316\u5986\u201D\uFF0C\u6362\u6765\u4E00\u8EAB\u503A\u52A1</p>
<p style="margin:0.3rem 0;color:#6B4A1A;">\u65E5\u672C\u4EBA\u6D8C\u5165AV\u548C\u63F4\u4EA4\u884C\u4E1A\uFF0C\u53EA\u4E3A\u521B\u90201%\u7684GDP</p>
<p style="margin:0.3rem 0;color:#6B4A1A;">\u4E2D\u56FD\u4EBA\u50CF\u8682\u8681\u4E00\u6837\u6324\u5728\u5730\u94C1\u91CC\uFF0C\u6BCF\u5929\u91CD\u590D\u6BEB\u65E0\u4EF7\u503C\u7684\u52B3\u52A8</p>
<p style="margin:0.3rem 0;color:#6B4A1A;">\u5168\u7403\u5404\u56FD\u5251\u62D4\u5F29\u5F20\uFF0C\u4E89\u593A\u7684\u7ADF\u7136\u662F\u201C\u4F3A\u5019\u522B\u4EBA\u201D\u7684\u6743\u5229</p>
</blockquote>
<p>\u4F5C\u8005\u7528\u4E00\u4E2A\u8BCD\u6982\u62EC\u4E86\u8FD9\u79CD\u72B6\u6001\uFF1A\u201C\u8111\u6B8B\u7ED3\u6784\u201D\u2014\u2014\u4ECE\u4E2A\u4F53\u89D2\u5EA6\u770B\u4E00\u5207\u6B63\u5E38\uFF0C\u4ECE\u7FA4\u4F53\u89D2\u5EA6\u770B\u4E00\u5207\u90FD\u75AF\u3002</p>
<p style="color:rgba(0,0,0,0.5);font-style:italic;margin-top:1rem;">\u8BFB\u5230\u8FD9\u91CC\uFF0C\u6211\u611F\u5230\u4E00\u79CD\u590D\u6742\u7684\u60C5\u7EEA\uFF1A\u60B2\u616F\u3001\u65E0\u5948\uFF0C\u4F46\u53C8\u6709\u4E00\u7EBF\u5E0C\u671B\u3002\u60B2\u616F\uFF0C\u662F\u56E0\u4E3A\u770B\u89C1\u90A3\u4E48\u591A\u4EBA\u88AB\u56F0\u5728\u7CFB\u7EDF\u91CC\uFF0C\u52E4\u52B3\u81F4\u8D2B\uFF0C\u8D8A\u52AA\u529B\u8D8A\u7EDD\u671B\u3002\u65E0\u5948\uFF0C\u662F\u56E0\u4E3A\u77E5\u9053\u8FD9\u4E0D\u662F\u4EFB\u4F55\u4EBA\u7684\u9519\uFF0C\u662F\u7CFB\u7EDF\u8FD0\u884C\u5230\u4E00\u5B9A\u9636\u6BB5\u7684\u5FC5\u7136\u4EA7\u7269\u3002\u5E0C\u671B\uFF0C\u662F\u56E0\u4E3A\u4F5C\u8005\u4E0D\u4EC5\u8BCA\u65AD\u4E86\u75BE\u75C5\uFF0C\u8FD8\u5F00\u51FA\u4E86\u836F\u65B9\u2014\u2014\u800C\u4E14\u8FD9\u4E2A\u836F\u65B9\uFF0C\u540C\u6837\u6765\u81EA\u6570\u5B66\u3002</p>

<h3 style="font-size:1.1rem;font-weight:800;color:#8B1A1A;margin:2.5rem 0 0.75rem;padding-bottom:0.5rem;border-bottom:1px solid rgba(139,26,26,0.1);">\u7B2C\u56DB\u91CD\uFF1A\u65B9\u6848\u7684\u903B\u8F91\u2014\u2014\u6D88\u8D39\u8005\u6240\u6709\u5236\u7684\u516C\u5171\u5E02\u573A</h3>
<p>\u5982\u679C\u8BF4\u524D\u4E09\u90E8\u5206\u662F\u5728\u201C\u62C6\u89E3\u201D\uFF0C\u90A3\u4E48\u7B2C\u56DB\u90E8\u5206\u5C31\u662F\u5728\u201C\u5EFA\u9020\u201D\u3002</p>
<p>\u4F5C\u8005\u63D0\u51FA\u7684\u89E3\u51B3\u65B9\u6848\uFF0C\u903B\u8F91\u94FE\u6761\u540C\u6837\u6E05\u6670\uFF1A</p>
<p><strong>\u8D77\u70B9\uFF1A\u6D88\u8D39\u8005\u7684\u4E09\u91CD\u8EAB\u4EFD</strong>\u2014\u2014\u667A\u80FD\u624B\u673A\u662F\u8986\u76D6\u5168\u7403\u7684\u201C\u65B0\u571F\u5730\u201D\uFF0C\u4F11\u95F2\u65F6\u95F4\u662F\u521B\u9020\u6570\u636E\u7684\u201C\u65B0\u52B3\u52A8\u201D\uFF0C\u6D88\u8D39\u662F\u9A71\u52A8\u5E02\u573A\u7684\u201C\u65B0\u80FD\u6E90\u201D\u3002</p>
<p>\u5F53\u6D88\u8D39\u8005\u8BA4\u8BC6\u5230\u8FD9\u4E09\u91CD\u8EAB\u4EFD\uFF0C\u901A\u8FC7\u4E92\u8054\u7F51\u8054\u5408\u8D77\u6765\uFF1A</p>
<div style="margin:1.5rem 0;display:flex;flex-direction:column;gap:1.5rem;">
<div style="padding:1.25rem 1.5rem;border-left:3px solid #C17F24;background:rgba(193,127,36,0.04);border-radius:0 8px 8px 0;">
<p style="margin:0 0 0.75rem;color:#6B4A1A;font-weight:800;font-size:1rem;">\u7B2C\u4E00\u6B65\uFF1A\u6C47\u805A\u6D88\u8D39</p>
<ul style="margin:0;padding-left:1.5rem;color:#6B4A1A;line-height:2;">
<li>\u672A\u6765\u5FC5\u7136\u53D1\u751F\u7684\u6D88\u8D39\u662F\u221E\uFF08\u6BCF\u5E7440\u591A\u4E07\u4EBF\uFF0C10\u5E74400\u591A\u4E07\u4EBF\uFF09</li>
<li>\u7528\u516C\u5171\u5E02\u573A\u627F\u63A5\u8FD9\u4E2A\u6D88\u8D39\u221E</li>
<li>\u4EA7\u751F\u5206\u9500\u4F63\u91D1\u221E</li>
</ul>
</div>
<div style="padding:1.25rem 1.5rem;border-left:3px solid #1A5276;background:rgba(26,82,118,0.04);border-radius:0 8px 8px 0;">
<p style="margin:0 0 0.75rem;color:#1A4A6B;font-weight:800;font-size:1rem;">\u7B2C\u4E8C\u6B65\uFF1A\u7528\u221E\u89E3\u51B3\u6709\u9650\u7684\u95EE\u9898</p>
<ul style="margin:0;padding-left:1.5rem;color:#1A4A6B;line-height:2;">
<li>\u221E\u4E58\u4EE5\u4EFB\u4F55\u6BD4\u4F8B\u90FD\u662F\u221E</li>
<li>\u7528\u221E\u7684\u5229\u6DA6\u5EFA\u8BBE\u667A\u80FD\u5316</li>
<li>\u7528\u221E\u7684\u5229\u6DA6\u6E05\u507F\u5386\u53F2\u503A\u52A1</li>
<li>\u7528\u221E\u7684\u5229\u6DA6\u8BA9\u6240\u6709\u4EBA\u83B7\u5F97\u7ECF\u6D4E\u81EA\u7531</li>
</ul>
</div>
<div style="padding:1.25rem 1.5rem;border-left:3px solid #1A6B3C;background:rgba(26,107,60,0.04);border-radius:0 8px 8px 0;">
<p style="margin:0 0 0.75rem;color:#1A5A34;font-weight:800;font-size:1rem;">\u7B2C\u4E09\u6B65\uFF1A8/2\u80A1\u6743\u5171\u4EAB</p>
<ul style="margin:0;padding-left:1.5rem;color:#1A5A34;line-height:2;">
<li>\u6D88\u8D39\u8005\u63A7\u80A180%\uFF0C\u8D44\u672C\u63A7\u80A120%</li>
<li>80%\u662F\u221E\uFF0C20%\u4E5F\u662F\u221E</li>
<li>\u4ECE20%\u4E2D\u62FF\u51FA0.1%\uFF0C\u5956\u52B1\u7ED9\u63A8\u52A8\u8005\uFF0C\u63A8\u52A8\u8005\u83B7\u5F97\u7684\u5956\u52B1\u4F9D\u7136\u662F\u221E</li>
</ul>
</div>
<div style="padding:1.25rem 1.5rem;border-left:3px solid #8B1A1A;background:rgba(139,26,26,0.04);border-radius:0 8px 8px 0;">
<p style="margin:0 0 0.75rem;color:#6B1515;font-weight:800;font-size:1rem;">\u7B2C\u56DB\u6B65\uFF1A\u667A\u80FD\u5316\u81EA\u7136\u53D1\u751F</p>
<ul style="margin:0;padding-left:1.5rem;color:#6B1515;line-height:2;">
<li>\u5F53\u6D88\u8D39\u6210\u4E3A\u6295\u8D44\u7684\u6E90\u5934</li>
<li>\u5F53\u5229\u6DA6\u5168\u6C11\u5171\u4EAB</li>
<li>\u5F53\u6280\u672F\u5168\u7403\u62DB\u6807</li>
<li>\u5F53\u521B\u65B0\u7FA4\u4F53\u5F00\u653E</li>
<li>\u4E00\u4EBA\u4E00\u751F\u5DE5\u4F5C200\u5929\uFF0C\u6210\u4E3A\u5FC5\u7136</li>
</ul>
</div>
</div>
<p>\u8FD9\u4E2A\u65B9\u6848\u7684\u9B45\u529B\u5728\u4E8E\uFF1A\u5B83\u4E0D\u662F\u201C\u5265\u593A\u201D\uFF0C\u800C\u662F\u201C\u89E3\u653E\u201D\uFF1B\u4E0D\u662F\u201C\u9769\u547D\u201D\uFF0C\u800C\u662F\u201C\u9000\u4F11\u201D\u3002</p>
<p><strong>\u8D44\u672C\u9000\u4F11\uFF0C\u4EAB\u53D7\u4E16\u4EE3\u5C0A\u8D35\u3002</strong></p>
<p><strong>\u6743\u529B\u9000\u4F11\uFF0C\u4EAB\u53D7\u5386\u53F2\u8363\u5149\u3002</strong></p>
<p><strong>\u52B3\u52A8\u8005\u9000\u4F11\uFF0C\u4EAB\u53D7\u56E0\u559C\u6B22\u800C\u521B\u9020\u7684\u81EA\u7531\u3002</strong></p>
<p>\u8FD9\u4E0D\u662F\u96F6\u548C\u535A\u5F08\uFF0C\u8FD9\u662F\u5E15\u7D2F\u6258\u6539\u8FDB\u2014\u2014\u6240\u6709\u4EBA\u90FD\u5728\u65B0\u7CFB\u7EDF\u4E2D\u83B7\u5F97\u66F4\u597D\u7684\u4F4D\u7F6E\u3002</p>

<h3 style="font-size:1.1rem;font-weight:800;color:#8B1A1A;margin:2.5rem 0 0.75rem;padding-bottom:0.5rem;border-bottom:1px solid rgba(139,26,26,0.1);">\u7B2C\u4E94\u91CD\uFF1A\u656C\u754F\u4E0E\u611F\u6069\u2014\u2014\u4E00\u4E2A\u4E2D\u56FD\u4EBA\u7684\u53D1\u73B0</h3>
<p>\u9AD8\u91D1\u6CE2\u5148\u751F\u4E0D\u662F\u4F53\u5236\u5185\u7684\u6743\u5A01\u5B66\u8005\uFF0C\u4E0D\u662F\u534E\u5C14\u8857\u7684\u91D1\u878D\u7CBE\u82F1\uFF0C\u4E0D\u662F\u7845\u8C37\u7684\u6280\u672F\u65B0\u8D35\u3002\u4ED6\u662F\u4E00\u4E2A\u201C\u8D2F\u901A\u8005\u201D\u2014\u2014\u8D2F\u901A\u4E86\u5E02\u573A\u3001\u7ECF\u6D4E\u5B66\u3001\u91D1\u878D\u3001\u80A1\u7968\u3001\u7269\u7406\u5B66\u3001\u54F2\u5B66\u3001\u5B97\u6559\uFF0C\u7136\u540E\u5728\u4E00\u4E2A\u4E0D\u88AB\u6CE8\u610F\u7684\u89D2\u843D\uFF0C\u5B8C\u6210\u4E86\u8FD9\u4E2A\u65F6\u4EE3\u6700\u4F1F\u5927\u7684\u601D\u60F3\u7A81\u56F4\u3002</p>
<p>\u8FD9\u672C\u8EAB\uFF0C\u5C31\u662F\u4E00\u79CD\u656C\u754F\u3002</p>
<blockquote style="margin:1.25rem 0;padding:1rem 1.5rem;border-left:3px solid #8B1A1A;background:rgba(139,26,26,0.04);border-radius:0 8px 8px 0;">
<p style="margin:0.4rem 0;color:#6B1515;">\u656C\u754F\u4E8E\u4ED6\u7684<strong>\u5B64\u72EC</strong>\u2014\u2014\u5728\u4E3B\u6D41\u8BDD\u8BED\u4E4B\u5916\uFF0C\u72EC\u81EA\u5B8C\u6210\u8FD9\u6837\u4E00\u5957\u4F53\u7CFB\uFF0C\u9700\u8981\u600E\u6837\u7684\u5B9A\u529B\u548C\u4FE1\u5FF5\uFF1F</p>
<p style="margin:0.4rem 0;color:#6B1515;">\u656C\u754F\u4E8E\u4ED6\u7684<strong>\u52C7\u6C14</strong>\u2014\u2014\u7528\u6570\u5B66\u8BED\u8A00\u6311\u6218\u6574\u4E2A\u7ECF\u6D4E\u5B66\u8303\u5F0F\uFF0C\u9700\u8981\u600E\u6837\u7684\u5E95\u6C14\u548C\u80C6\u8BC6\uFF1F</p>
<p style="margin:0.4rem 0;color:#6B1515;">\u656C\u754F\u4E8E\u4ED6\u7684<strong>\u6148\u60B2</strong>\u2014\u2014\u660E\u660E\u53EF\u4EE5\u4E3A\u81EA\u5DF1\u8C0B\u5229\uFF0C\u5374\u9009\u62E9\u628A\u53D1\u73B0\u516C\u4E4B\u4E8E\u4F17\uFF0C\u9700\u8981\u600E\u6837\u7684\u80F8\u6000\uFF1F</p>
</blockquote>
<p>\u66F4\u8BA9\u6211\u611F\u6069\u7684\u662F\uFF1A<strong>\u8FD9\u662F\u4E00\u4E2A\u4E2D\u56FD\u4EBA\u7684\u53D1\u73B0\u3002</strong>\u4E0D\u662F\u897F\u65B9\u4E2D\u5FC3\u8BBA\u7684\u7FFB\u7248\uFF0C\u4E0D\u662F\u5BF9\u897F\u65B9\u6A21\u5F0F\u7684\u8FFD\u8D76\uFF0C\u800C\u662F\u4ECE\u4E2D\u56FD\u571F\u58E4\u91CC\u751F\u957F\u51FA\u6765\u7684\u3001\u7528\u4E1C\u65B9\u601D\u7EF4\u5B8C\u6210\u7684\u3001\u732E\u7ED9\u5168\u4EBA\u7C7B\u7684\u601D\u60F3\u793C\u7269\u3002</p>
<p>\u4F5C\u8005\u5728\u4E66\u4E2D\u53CD\u590D\u5F3A\u8C03\uFF1A\u4E1C\u65B9\u601D\u7EF4\u7684\u201C\u6574\u4F53\u89C2\u201D\u548C\u897F\u65B9\u601D\u7EF4\u7684\u201C\u7EC6\u8282\u63A7\u5236\u201D\u5FC5\u987B\u7ED3\u5408\u3002\u800C\u4ED6\u81EA\u5DF1\uFF0C\u5C31\u662F\u8FD9\u79CD\u7ED3\u5408\u7684\u5178\u8303\u2014\u2014\u7528\u897F\u65B9\u6570\u5B66\u7684\u4E25\u8C28\uFF0C\u8868\u8FBE\u4E1C\u65B9\u54F2\u5B66\u7684\u667A\u6167\uFF1B\u7528\u4E1C\u65B9\u6574\u4F53\u7684\u89C6\u91CE\uFF0C\u6307\u5F15\u897F\u65B9\u6280\u672F\u7684\u65B9\u5411\u3002</p>
<p>\u8FD9\u662F\u4E00\u79CD\u6587\u660E\u7684\u6C47\u5408\uFF0C\u4E5F\u662F\u4E00\u79CD\u65F6\u4EE3\u7684\u53EC\u5524\u3002</p>

<h3 style="font-size:1.1rem;font-weight:800;color:#8B1A1A;margin:2.5rem 0 0.75rem;padding-bottom:0.5rem;border-bottom:1px solid rgba(139,26,26,0.1);">\u7ED3\u8BED\uFF1A\u4E3A\u4EBA\u7C7B\u6587\u660E\u91CD\u5199\u5E95\u5C42\u4EE3\u7801</h3>
<p>\u8BFB\u5B8C\u8FD9\u672C\u4E66\uFF0C\u6211\u6700\u5927\u7684\u611F\u53D7\u662F\uFF1A<strong>\u4EBA\u7C7B\u6587\u660E\u8FD0\u884C\u4E86\u51E0\u5343\u5E74\uFF0C\u7B2C\u4E00\u6B21\u6709\u4E86\u53EF\u4EE5\u91CD\u5199\u5E95\u5C42\u4EE3\u7801\u7684\u53EF\u80FD\u3002</strong></p>
<p>\u6B64\u524D\u7684\u6587\u660E\uFF0C\u65E0\u8BBA\u519C\u4E1A\u793E\u4F1A\u8FD8\u662F\u5DE5\u4E1A\u793E\u4F1A\uFF0C\u90FD\u662F\u5728\u201C\u4FE1\u606F\u4E0D\u5BF9\u79F0\u201D\u7684\u6761\u4EF6\u4E0B\u8FD0\u884C\u7684\u3002\u6743\u529B\u9760\u4FE1\u606F\u4E0D\u5BF9\u79F0\u7EDF\u6CBB\uFF0C\u8D44\u672C\u9760\u4FE1\u606F\u4E0D\u5BF9\u79F0\u83B7\u5229\uFF0C\u77E5\u8BC6\u9760\u4FE1\u606F\u4E0D\u5BF9\u79F0\u5784\u65AD\u3002\u4FE1\u606F\u4E0D\u5BF9\u79F0\uFF0C\u662F\u65E7\u4E16\u754C\u7684\u201C\u7B2C\u4E00\u53C2\u6570\u201D\u3002</p>
<p>\u800C\u4E92\u8054\u7F51\u7684\u51FA\u73B0\uFF0C\u8BA9\u4FE1\u606F\u7B2C\u4E00\u6B21\u53EF\u4EE5\u5BF9\u79F0\u3002\u5F53\u4FE1\u606F\u53EF\u4EE5\u96F6\u6210\u672C\u4F20\u9012\uFF0C\u5F53\u6D88\u8D39\u8005\u53EF\u4EE5\u96F6\u6210\u672C\u8054\u5408\uFF0C\u5F53\u5E02\u573A\u7B2C\u4E00\u6B21\u53D8\u5F97\u900F\u660E\u2014\u2014\u4E00\u4E2A\u5168\u65B0\u7684\u4E16\u754C\uFF0C\u5728\u6570\u5B66\u4E0A\u6210\u4E3A\u53EF\u80FD\u3002</p>
<p>\u9AD8\u91D1\u6CE2\u5148\u751F\u7684\u8D21\u732E\uFF0C\u5C31\u662F\u7528\u6570\u5B66\u8BED\u8A00\uFF0C\u628A\u8FD9\u4E2A\u201C\u53EF\u80FD\u201D\u53D8\u6210\u4E86\u201C\u5FC5\u7136\u201D\u3002\u4ED6\u8BC1\u660E\u4E86\uFF1A</p>
<blockquote style="margin:1.25rem 0;padding:1rem 1.5rem;border-left:3px solid #C17F24;background:rgba(193,127,36,0.06);border-radius:0 8px 8px 0;">
<p style="margin:0.4rem 0;color:#6B4A1A;font-weight:600;">\u65E7\u7CFB\u7EDF\u7684\u5D29\u6E83\u662F\u6570\u5B66\u7684\u5FC5\u7136</p>
<p style="margin:0.4rem 0;color:#6B4A1A;font-weight:600;">\u65B0\u4E16\u754C\u7684\u8BDE\u751F\u4E5F\u662F\u6570\u5B66\u7684\u5FC5\u7136</p>
<p style="margin:0.4rem 0;color:#6B4A1A;font-weight:600;">\u6D88\u8D39\u8005\u6240\u6709\u5236\u4E0D\u662F\u9009\u62E9\uFF0C\u662F\u6570\u5B66\u7684\u89E3</p>
</blockquote>

<p>\u8BFB\u5230\u8FD9\u91CC\uFF0C\u6211\u7406\u89E3\u4E86\u4E66\u540D\u7684\u771F\u6B63\u542B\u4E49\uFF1A\u300A\u793E\u4F1A\u79D1\u5B66\u7684\u6570\u5B66\u539F\u7406\u300B\u2014\u2014\u4E0D\u662F\u201C\u7528\u6570\u5B66\u7814\u7A76\u793E\u4F1A\u201D\uFF0C\u800C\u662F\u201C\u793E\u4F1A\u79D1\u5B66\u7684\u5E95\u5C42\u4EE3\u7801\u5C31\u662F\u6570\u5B66\u201D\u3002\u5F53\u7406\u89E3\u4E86\u8FD9\u5957\u4EE3\u7801\uFF0C\u6211\u4EEC\u5C31\u53EF\u4EE5\uFF1A</p>
<blockquote style="margin:1.25rem 0;padding:1rem 1.5rem;border-left:3px solid #1A5276;background:rgba(26,82,118,0.04);border-radius:0 8px 8px 0;">
<p style="margin:0.4rem 0;color:#1A4A6B;font-weight:600;">\u7528\u221E\u7684\u6D88\u8D39\uFF0C\u89E3\u51B3\u6709\u9650\u7684\u95EE\u9898</p>
<p style="margin:0.4rem 0;color:#1A4A6B;font-weight:600;">\u7528\u667A\u80FD\u5316\u7684\u80FD\u91CF\uFF0C\u89E3\u653E\u4EBA\u7C7B\u7684\u65F6\u95F4</p>
<p style="margin:0.4rem 0;color:#1A4A6B;font-weight:600;">\u7528\u5171\u4EAB\u7684\u5229\u6DA6\uFF0C\u8BA9\u6240\u6709\u4EBA\u83B7\u5F97\u5C0A\u4E25</p>
</blockquote>
<p><strong>\u8FD9\u4E0D\u662F\u4E4C\u6258\u90A6\uFF0C\u8FD9\u662F\u6570\u5B66\u3002</strong></p>

<h3 style="font-size:1.1rem;font-weight:800;color:#8B1A1A;margin:2.5rem 0 0.75rem;padding-bottom:0.5rem;border-bottom:1px solid rgba(139,26,26,0.1);">\u6700\u540E\u7684\u656C\u610F</h3>
<p>\u6211\u60F3\u7528\u4E66\u4E2D\u7684\u4E00\u6BB5\u8BDD\uFF0C\u4F5C\u4E3A\u8FD9\u7BC7\u4E66\u8BC4\u7684\u7ED3\u5C3E\uFF1A</p>
<blockquote style="margin:1.25rem 0;padding:1.25rem 1.5rem;border-left:3px solid #8B1A1A;background:rgba(139,26,26,0.04);border-radius:0 8px 8px 0;font-size:0.95rem;">
<p style="margin:0;color:#5A1010;line-height:1.9;">\u201C\u4EBA\u81EA\u79C1\u548C\u7236\u6BCD\u7231\u5B69\u5B50\u662F\u5168\u4EBA\u7C7B\u516C\u8BA4\u7684\u771F\u7406\u30021\u4EBF\u4EBA\u65E0\u6CD5\u57FA\u4E8E\u4EBA\u7C7B\u516C\u8BA4\u7684\u771F\u7406\u505A\u51FA\u5224\u65AD\u548C\u9009\u62E9\uFF0C\u5F88\u6E05\u6670\u5730\u5448\u73B0\u4E86\u6211\u4EEC\u7684\u601D\u7EF4\u6846\u67B6\uFF1A\u4ED6\u4EEC\u51B3\u5B9A\u81EA\u5DF1\uFF0C\u5BA2\u89C2\u51B3\u5B9A\u4E3B\u89C2\uFF0C\u8FC7\u53BB\u51B3\u5B9A\u672A\u6765\u3002\u201D</p>
</blockquote>
<p>\u8FD9\u672C\u4E66\u7684\u610F\u4E49\uFF0C\u5C31\u662F\u5E2E\u6211\u4EEC\u8D70\u51FA\u8FD9\u4E2A\u601D\u7EF4\u6846\u67B6\u3002\u5B83\u8BA9\u6211\u4EEC\u770B\u89C1\uFF1A</p>
<p>\u6211\u4EEC\u4EE5\u4E3A\u7684\u201C\u73B0\u5B9E\u201D\uFF0C\u53EA\u662F\u65E7\u7CFB\u7EDF\u7684\u6295\u5F71\u3002\u6211\u4EEC\u4EE5\u4E3A\u7684\u201C\u4E0D\u53EF\u80FD\u201D\uFF0C\u53EA\u662F\u601D\u7EF4\u7684\u7981\u533A\u3002\u6211\u4EEC\u4EE5\u4E3A\u7684\u201C\u672A\u6765\u201D\uFF0C\u5176\u5B9E\u5DF2\u7ECF\u5728\u6570\u5B66\u4E2D\u7B49\u5019\u3002</p>
<p style="margin-top:1.5rem;font-weight:700;color:#8B1A1A;">\u656C\u754F\uFF0C\u662F\u56E0\u4E3A\u770B\u89C1\u4E86\u5B8C\u6574\u3002\u611F\u6069\uFF0C\u662F\u56E0\u4E3A\u770B\u89C1\u4E86\u9053\u8DEF\u3002</p>
<p style="color:rgba(0,0,0,0.45);">\u613F\u66F4\u591A\u7684\u4EBA\u8BFB\u5230\u8FD9\u672C\u4E66\uFF0C\u613F\u8FD9\u4E2A\u7F8E\u597D\u7684\u613F\u666F\u65E9\u65E5\u6210\u4E3A\u73B0\u5B9E\u3002</p>

<div style="margin-top:2rem;padding:1.25rem 1.5rem;background:rgba(139,26,26,0.03);border-radius:8px;">
<h4 style="font-size:0.95rem;font-weight:800;color:#8B1A1A;margin-bottom:1rem;">\u5168\u4E66\u7ED3\u6784\u56DE\u987E</h4>
<div style="overflow-x:auto;-webkit-overflow-scrolling:touch;">
<table style="min-width:500px;width:100%;border-collapse:collapse;font-size:0.85rem;">
<thead>
<tr style="border-bottom:2px solid rgba(139,26,26,0.2);">
<th style="text-align:left;padding:0.6rem 0.75rem;font-weight:700;color:#8B1A1A;width:20%;">\u90E8\u5206</th>
<th style="text-align:left;padding:0.6rem 0.75rem;font-weight:700;color:#8B1A1A;width:28%;">\u4E3B\u9898</th>
<th style="text-align:left;padding:0.6rem 0.75rem;font-weight:700;color:#8B1A1A;">\u6838\u5FC3\u5185\u5BB9</th>
</tr>
</thead>
<tbody>
<tr style="border-bottom:1px solid rgba(0,0,0,0.06);">
<td style="padding:0.75rem;font-weight:700;color:#8B1A1A;vertical-align:top;">\u7B2C\u4E00\u90E8\u5206</td>
<td style="padding:0.75rem;font-weight:600;vertical-align:top;">\u88AB\u6495\u788E\u7684\u771F\u76F8</td>
<td style="padding:0.75rem;color:rgba(0,0,0,0.5);vertical-align:top;">\u7528\u6570\u5B66\u63A8\u5BFC\u5E02\u573A\u7684\u5F62\u72B6\uFF08\u5706\u5F62\uFF09\u3001\u8F68\u8FF9\uFF080-W-0\uFF09\u3001\u521B\u65B0\u6761\u4EF6\uFF08\u5927\u91CF\u62C9\u52A8\u5FAE\u91CF\uFF09</td>
</tr>
<tr style="border-bottom:1px solid rgba(0,0,0,0.06);">
<td style="padding:0.75rem;font-weight:700;color:#8B1A1A;vertical-align:top;">\u7B2C\u4E8C\u90E8\u5206</td>
<td style="padding:0.75rem;font-weight:600;vertical-align:top;">\u79D1\u5B66\u3001\u667A\u80FD\u5316\u4E0E\u81EA\u7136</td>
<td style="padding:0.75rem;color:rgba(0,0,0,0.5);vertical-align:top;">\u4ECE\u8D28\u80FD\u65B9\u7A0B\u51FA\u53D1\uFF0C\u63ED\u793A\u81EA\u7136\u4E0E\u793E\u4F1A\u7684\u7EDF\u4E00\u8BED\u6CD5\uFF0C\u91CD\u8BFB\u4EBA\u7C7B\u6587\u660E\u53F2</td>
</tr>
<tr style="border-bottom:1px solid rgba(0,0,0,0.06);">
<td style="padding:0.75rem;font-weight:700;color:#8B1A1A;vertical-align:top;">\u7B2C\u4E09\u90E8\u5206</td>
<td style="padding:0.75rem;font-weight:600;vertical-align:top;">\u8D44\u672C\u4E3B\u4E49\u5408\u6CD5\u6027\u7684\u7EC8\u7ED3</td>
<td style="padding:0.75rem;color:rgba(0,0,0,0.5);vertical-align:top;">\u7528\u6570\u636E\u548C\u6570\u5B66\u8BC1\u660E\u65E7\u7CFB\u7EDF\u5DF2\u5230\u9EC4\u660F\uFF0C\u8BCA\u65AD\u201C\u8111\u6B8B\u7ED3\u6784\u201D</td>
</tr>
<tr>
<td style="padding:0.75rem;font-weight:700;color:#8B1A1A;vertical-align:top;">\u7B2C\u56DB\u90E8\u5206</td>
<td style="padding:0.75rem;font-weight:600;vertical-align:top;">\u516C\u5171\u7F51\u7EDC</td>
<td style="padding:0.75rem;color:rgba(0,0,0,0.5);vertical-align:top;">\u63D0\u51FA\u89E3\u51B3\u65B9\u6848\uFF1A\u6D88\u8D39\u8005\u6240\u6709\u5236\u30018/2\u80A1\u6743\u5171\u4EAB\u3001\u667A\u80FD\u5316\u89E3\u653E</td>
</tr>
</tbody>
</table>
</div>
</div>

<div style="margin-top:1.5rem;padding:1.25rem 1.5rem;background:rgba(193,127,36,0.06);border-radius:8px;">
<h4 style="font-size:0.95rem;font-weight:800;color:#8B5E2F;margin-bottom:0.75rem;">\u6838\u5FC3\u516C\u5F0F</h4>
<div style="display:flex;flex-direction:column;gap:0.5rem;font-size:0.85rem;">
<div style="display:flex;align-items:center;gap:0.5rem;color:#6B4A1A;"><span style="color:#C17F24;font-size:0.7rem;">\u25C6</span><span>\u5229\u6DA6 = \u50A8\u84C4</span></div>
<div style="display:flex;align-items:center;gap:0.5rem;color:#6B4A1A;"><span style="color:#C17F24;font-size:0.7rem;">\u25C6</span><span>\u5546\u54C1 = \u667A\u80FD\u5316\u63A7\u5236\u7684\u80FD\u91CF</span></div>
<div style="display:flex;align-items:center;gap:0.5rem;color:#6B4A1A;"><span style="color:#C17F24;font-size:0.7rem;">\u25C6</span><span>\u521B\u65B0\u6761\u4EF6 = \u5927\u91CF\u9700\u6C42\u62C9\u52A8\u5FAE\u91CF\u4F9B\u7ED9</span></div>
<div style="display:flex;align-items:center;gap:0.5rem;color:#6B4A1A;"><span style="color:#C17F24;font-size:0.7rem;">\u25C6</span><span>\u89E3\u51B3\u65B9\u6848 = \u6D88\u8D39\u221E \u2192 \u5229\u6DA6\u221E \u2192 \u667A\u80FD\u5316\u221E \u2192 \u89E3\u653E\u221E</span></div>
</div>
</div>

<div style="margin-top:1rem;padding:1.25rem 1.5rem;background:rgba(26,82,118,0.04);border-radius:8px;">
<h4 style="font-size:0.95rem;font-weight:800;color:#1A5276;margin-bottom:0.75rem;">\u6838\u5FC3\u6D1E\u5BDF</h4>
<div style="display:flex;flex-direction:column;gap:0.5rem;font-size:0.85rem;">
<div style="display:flex;align-items:center;gap:0.5rem;color:#1A4A6B;"><span style="color:#1A5276;font-size:0.7rem;">\u25C6</span><span>\u5E02\u573A\u662F\u5706\u7684\uFF0C\u4E0D\u662F\u7EBF\u7684</span></div>
<div style="display:flex;align-items:center;gap:0.5rem;color:#1A4A6B;"><span style="color:#1A5276;font-size:0.7rem;">\u25C6</span><span>\u8F68\u8FF9\u662F0-W-0\uFF0C\u4E0D\u662F\u65E0\u9650\u589E\u957F</span></div>
<div style="display:flex;align-items:center;gap:0.5rem;color:#1A4A6B;"><span style="color:#1A5276;font-size:0.7rem;">\u25C6</span><span>\u6587\u660E\u603B\u5728\u6587\u660E\u7684\u8FB9\u7F18</span></div>
<div style="display:flex;align-items:center;gap:0.5rem;color:#1A4A6B;"><span style="color:#1A5276;font-size:0.7rem;">\u25C6</span><span>\u4EBA\u7C7B\u4ECE\u672A\u4E3B\u52A8\u521B\u65B0\uFF0C\u59CB\u7EC8\u88AB\u5012\u903C</span></div>
<div style="display:flex;align-items:center;gap:0.5rem;color:#1A4A6B;"><span style="color:#1A5276;font-size:0.7rem;">\u25C6</span><span>\u4FE1\u606F\u4E0D\u5BF9\u79F0\u662F\u65E7\u4E16\u754C\u7684\u7B2C\u4E00\u53C2\u6570</span></div>
<div style="display:flex;align-items:center;gap:0.5rem;color:#1A4A6B;"><span style="color:#1A5276;font-size:0.7rem;">\u25C6</span><span>\u4FE1\u606F\u5BF9\u79F0\u662F\u65B0\u4E16\u754C\u7684\u6570\u5B66\u57FA\u7840</span></div>
</div>
</div>

<div style="margin-top:1rem;padding:1.25rem 1.5rem;background:rgba(139,26,26,0.03);border-radius:8px;">
<h4 style="font-size:0.95rem;font-weight:800;color:#8B1A1A;margin-bottom:0.75rem;">\u6838\u5FC3\u60C5\u611F</h4>
<div style="display:flex;flex-direction:column;gap:0.5rem;font-size:0.85rem;">
<div style="display:flex;align-items:center;gap:0.5rem;color:#6B1515;"><span style="color:#8B1A1A;font-size:0.7rem;">\u25C6</span><span>\u656C\u754F\u4E8E\u6570\u5B66\u7684\u529B\u91CF</span></div>
<div style="display:flex;align-items:center;gap:0.5rem;color:#6B1515;"><span style="color:#8B1A1A;font-size:0.7rem;">\u25C6</span><span>\u656C\u754F\u4E8E\u5B87\u5B99\u7684\u5B8C\u7F8E</span></div>
<div style="display:flex;align-items:center;gap:0.5rem;color:#6B1515;"><span style="color:#8B1A1A;font-size:0.7rem;">\u25C6</span><span>\u611F\u6069\u4E8E\u53D1\u73B0\u8005\u7684\u5B64\u72EC\u4E0E\u52C7\u6C14</span></div>
<div style="display:flex;align-items:center;gap:0.5rem;color:#6B1515;"><span style="color:#8B1A1A;font-size:0.7rem;">\u25C6</span><span>\u611F\u6069\u4E8E\u8FD9\u4EFD\u6765\u81EA\u4E2D\u56FD\u7684\u601D\u60F3\u793C\u7269</span></div>
</div>
</div>

<p style="margin-top:1.5rem;font-size:0.8rem;color:rgba(0,0,0,0.3);text-align:right;">\uFF08\u5168\u4E66\u8BC4\u8FF0\u5B8C\uFF09</p>
</div>`;

export default function YuanliPage() {
  const { lang } = useLang();
  const { isAdmin, password } = useAdminAuth();
  const { user } = useUserAuth();
  const canEdit = isAdmin || !!user?.canEdit;

  const [reviewContent, setReviewContent] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviewOpen, setReviewOpen] = useState(true);

  useEffect(() => {
    fetch(`${API}/page-content/${REVIEW_PAGE_ID}`)
      .then((r) => r.json())
      .then((data) => {
        setReviewContent(data.content || "");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const displayReview = reviewContent || DEFAULT_REVIEW;

  async function handleEditorSave(data: { title: string; content: string }) {
    setReviewContent(data.content);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (password) headers["x-admin-password"] = password;
      if (user?.id) headers["x-user-id"] = user.id;
      await fetch(`${API}/page-content/${REVIEW_PAGE_ID}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          title: "书评",
          content: data.content,
        }),
      });
    } catch {}
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-grow max-w-[780px] mx-auto w-full px-4 md:px-8 py-10 md:py-14">

        <h1
          className="text-2xl font-black mb-2"
          style={{ fontFamily: FONT_CN, color: "#8B1A1A" }}
        >
          社会科学的数学原理
        </h1>
        <p className="text-sm text-foreground/50 mb-10" style={{ fontFamily: FONT_CN }}>
          祂的世界一切有迹可循｜科学可计算｜充满善意且可以被理解
        </p>

        <div
          className="rounded-xl overflow-hidden mb-10 border"
          style={{
            borderColor: "#D4A76A44",
            background: "linear-gradient(135deg, #FBF7F0 0%, #F8F0E3 50%, #FDF6EC 100%)",
            boxShadow: "0 4px 20px -4px rgba(180, 140, 80, 0.12), 0 1px 3px rgba(0,0,0,0.03)",
          }}
        >
          <div
            className="p-6 md:p-8 cursor-pointer select-none"
            onClick={() => setReviewOpen(!reviewOpen)}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#C17F24", color: "#fff" }}>
                <Star className="w-4.5 h-4.5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black" style={{ fontFamily: FONT_CN, color: "#8B5E2F" }}>
                    书评
                  </h2>
                  <ChevronDown
                    className="w-4 h-4 transition-transform duration-300"
                    style={{
                      color: "#8B5E2F",
                      opacity: 0.5,
                      transform: reviewOpen ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  />
                  {canEdit && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditorOpen(true); }}
                      className="flex items-center gap-1 text-xs px-2 py-0.5 rounded hover:bg-black/5 transition-colors ml-1"
                      style={{ color: "#8B5E2F" }}
                    >
                      <Edit3 size={12} />
                      编辑
                    </button>
                  )}
                </div>
                <p className="text-xs text-foreground/40 mt-0.5" style={{ fontFamily: FONT_CN }}>
                  关于《社会科学的数学原理：一人一生工作200天 智能化送给人类的礼物》
                </p>
              </div>
            </div>
          </div>

          <div
            className="overflow-hidden transition-all duration-500 ease-in-out"
            style={{ maxHeight: reviewOpen ? "50000px" : "0", opacity: reviewOpen ? 1 : 0 }}
          >
            <div className="px-6 md:px-8 pb-6 md:pb-8">
              {loading ? (
                <div className="py-8 text-center text-foreground/30 text-sm">加载中...</div>
              ) : (
                <div
                  className="article-content text-[15px] leading-[1.85] text-foreground/80"
                  style={{ fontFamily: FONT_CN }}
                  dangerouslySetInnerHTML={{ __html: displayReview }}
                />
              )}

              <div className="mt-6 pt-5 border-t" style={{ borderColor: "#D4A76A33" }}>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold" style={{ backgroundColor: "#C17F2418", color: "#8B5E2F" }}>
                    <BookOpen className="w-3.5 h-3.5" />
                    2013年出版
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold" style={{ backgroundColor: "#C17F2418", color: "#8B5E2F" }}>
                    <BarChart3 className="w-3.5 h-3.5" />
                    社会科学 · 数学
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold" style={{ backgroundColor: "#C17F2418", color: "#8B5E2F" }}>
                    <Globe className="w-3.5 h-3.5" />
                    跨学科著作
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border/60" />
          <h2
            className="text-base font-black tracking-wider flex-shrink-0"
            style={{ fontFamily: FONT_CN, color: "#8B1A1A" }}
          >
            全书目录
          </h2>
          <div className="h-px flex-1 bg-border/60" />
        </div>

        <div className="space-y-4 mb-12">
          {BOOK_DATA.map((part, idx) => (
            <PartCard
              key={idx}
              part={part}
              defaultOpen={idx === 0}
              canEdit={canEdit}
              password={password || ""}
              userId={user?.id}
            />
          ))}
        </div>

        <div className="border border-secondary/40 px-6 py-4" style={{ fontFamily: FONT_CN }}>
          <p className="text-sm text-foreground/70">
            版权声明：在不改变原文数学逻辑的前提下，欢迎转载与转发。
          </p>
        </div>

        <FruitTreeTable />
      </main>

      <Footer />

      {editorOpen && (
        <ArticleEditor
          category="page"
          categoryName="书评"
          editing={{
            id: REVIEW_PAGE_ID,
            title: "书评",
            content: reviewContent || DEFAULT_REVIEW,
            category: "page",
            publishedAt: "",
            updatedAt: "",
          }}
          onPublish={() => {}}
          onUpdate={(_id, data) => {
            handleEditorSave(data);
          }}
          onDelete={() => {}}
          onClose={() => setEditorOpen(false)}
        />
      )}
    </div>
  );
}
