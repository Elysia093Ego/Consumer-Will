import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Link, useParams } from "wouter";
import { ArrowLeft, Edit3, Save, X } from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { useLang } from "@/context/LangContext";

const FONT_CN = "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif";

const MILESTONE_META: Record<string, { label: string; labelEn: string; people: string; peopleEn: string }> = {
  "1qian": { label: "1千人", labelEn: "1,000 People", people: "1,000", peopleEn: "1,000" },
  "100wan": { label: "100万人", labelEn: "1 Million People", people: "1,000,000", peopleEn: "1,000,000" },
  "10yi": { label: "10亿人", labelEn: "1 Billion People", people: "1,000,000,000", peopleEn: "1,000,000,000" },
};

export default function MilestonePage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug || "";
  const { isAdmin, password } = useAdminAuth();
  const { lang } = useLang();
  const en = lang === "en";

  const meta = MILESTONE_META[slug] || { label: slug, labelEn: slug, people: "", peopleEn: "" };

  const [title, setTitle] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [content, setContent] = useState("");
  const [contentEn, setContentEn] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftTitleEn, setDraftTitleEn] = useState("");
  const [draftContent, setDraftContent] = useState("");
  const [draftContentEn, setDraftContentEn] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/milestones/${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((data) => {
        setTitle(data.title || "");
        setTitleEn(data.titleEn || "");
        setContent(data.content || "");
        setContentEn(data.contentEn || "");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  function startEdit() {
    setDraftTitle(title);
    setDraftTitleEn(titleEn);
    setDraftContent(content);
    setDraftContentEn(contentEn);
    setEditing(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/milestones/${encodeURIComponent(slug)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-admin-password": password },
        body: JSON.stringify({ title: draftTitle, titleEn: draftTitleEn, content: draftContent, contentEn: draftContentEn }),
      });
      if (!res.ok) {
        alert(en ? "Save failed" : "保存失败");
        setSaving(false);
        return;
      }
      setTitle(draftTitle);
      setTitleEn(draftTitleEn);
      setContent(draftContent);
      setContentEn(draftContentEn);
      setEditing(false);
    } catch {
      alert(en ? "Save failed" : "保存失败");
    }
    setSaving(false);
  }

  const displayTitle = en ? (titleEn || title || meta.labelEn) : (title || meta.label);
  const displayContent = en ? (contentEn || content) : (content || contentEn);

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: FONT_CN, backgroundColor: "hsl(36, 40%, 96%)" }}>
      <Header />
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8">
        <Link href="/dengji" className="inline-flex items-center gap-1 text-sm mb-6 hover:underline" style={{ color: "hsl(22, 80%, 50%)" }}>
          <ArrowLeft size={16} />
          {en ? "Back to Registration" : "返回登记页"}
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-border/30 overflow-hidden">
          <div className="px-6 py-8 sm:px-10 sm:py-10" style={{ backgroundColor: "hsl(22, 80%, 50%)", color: "white" }}>
            <div className="text-sm font-medium opacity-80 mb-2">
              {en ? `When we reach ${meta.peopleEn} Willers` : `当我们达到 ${meta.people} 名 Willers`}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">{displayTitle}</h1>
            {isAdmin && !editing && (
              <button onClick={startEdit} className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">
                <Edit3 size={14} />
                {en ? "Edit" : "编辑"}
              </button>
            )}
          </div>

          <div className="px-6 py-8 sm:px-10 sm:py-10">
            {loading ? (
              <div className="text-center py-12 text-foreground/50">{en ? "Loading..." : "加载中..."}</div>
            ) : editing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground/70 mb-1">{en ? "Title (Chinese)" : "标题（中文）"}</label>
                  <input value={draftTitle} onChange={(e) => setDraftTitle(e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/70 mb-1">{en ? "Title (English)" : "标题（英文）"}</label>
                  <input value={draftTitleEn} onChange={(e) => setDraftTitleEn(e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/70 mb-1">{en ? "Content (Chinese)" : "内容（中文）"}</label>
                  <textarea value={draftContent} onChange={(e) => setDraftContent(e.target.value)} rows={12} className="w-full border border-border rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/70 mb-1">{en ? "Content (English)" : "内容（英文）"}</label>
                  <textarea value={draftContentEn} onChange={(e) => setDraftContentEn(e.target.value)} rows={12} className="w-full border border-border rounded-lg px-3 py-2 text-sm" />
                </div>
                <div className="flex gap-3">
                  <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ backgroundColor: "hsl(22, 80%, 50%)" }}>
                    <Save size={14} />
                    {saving ? (en ? "Saving..." : "保存中...") : (en ? "Save" : "保存")}
                  </button>
                  <button onClick={() => setEditing(false)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-gray-50">
                    <X size={14} />
                    {en ? "Cancel" : "取消"}
                  </button>
                </div>
              </div>
            ) : displayContent ? (
              <div className="prose prose-sm max-w-none text-foreground/80 leading-relaxed whitespace-pre-wrap">{displayContent}</div>
            ) : (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">🌟</div>
                <h2 className="text-xl font-bold text-foreground mb-2">
                  {en ? `What can ${meta.peopleEn} people do?` : `${meta.people} 人能做什么？`}
                </h2>
                <p className="text-foreground/60 text-sm max-w-md mx-auto">
                  {en
                    ? "Content is being prepared. Stay tuned!"
                    : "内容正在准备中，敬请期待！"}
                </p>
                {isAdmin && (
                  <button onClick={startEdit} className="mt-6 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ backgroundColor: "hsl(22, 80%, 50%)" }}>
                    <Edit3 size={14} />
                    {en ? "Add Content" : "添加内容"}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
