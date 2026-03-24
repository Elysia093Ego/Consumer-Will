import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { useLang } from "@/context/LangContext";
import { t } from "@/i18n/ui";
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp, X, Save, ImagePlus } from "lucide-react";

type QAItem = {
  id: number;
  question: string;
  question_en: string;
  answer: string;
  answer_en: string;
  sort_order: number;
};

function AnswerField({ label, value, onChange, placeholder, en }: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string; en: boolean;
}) {
  const { lang } = useLang();
  const editorRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const onChangeRef = useRef(onChange);
  const lastSetHtml = useRef("");
  const isFocused = useRef(false);
  const mounted = useRef(false);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (editorRef.current && !isFocused.current) {
      if (!mounted.current || lastSetHtml.current !== value) {
        editorRef.current.innerHTML = value;
        lastSetHtml.current = value;
        mounted.current = true;
      }
    }
  }, [value]);

  const debounceTimer = useRef<ReturnType<typeof setTimeout>>();

  function handleInput() {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      if (editorRef.current) {
        const html = editorRef.current.innerHTML;
        lastSetHtml.current = html;
        onChangeRef.current(html);
      }
    }, 300);
  }

  function flushInput() {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      lastSetHtml.current = html;
      onChangeRef.current(html);
    }
  }

  function compressImage(file: File): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const MAX = 1600;
        let w = img.width, h = img.height;
        if (w > MAX || h > MAX) {
          const ratio = Math.min(MAX / w, MAX / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        const isPng = file.type === "image/png";
        resolve(isPng ? canvas.toDataURL("image/png") : canvas.toDataURL("image/jpeg", 0.92));
      };
      img.src = url;
    });
  }

  function insertImage(dataUrl: string) {
    const img = document.createElement("img");
    img.src = dataUrl;
    img.alt = "";
    img.style.maxWidth = "100%";
    img.style.margin = "8px 0";
    img.style.borderRadius = "4px";

    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editorRef.current?.contains(sel.anchorNode)) {
      const range = sel.getRangeAt(0);
      range.deleteContents();
      range.insertNode(img);
      range.setStartAfter(img);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    } else {
      editorRef.current?.appendChild(img);
    }
    flushInput();
  }

  function handlePaste(e: React.ClipboardEvent) {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/")) {
        e.preventDefault();
        const file = items[i].getAsFile();
        if (!file) continue;
        compressImage(file).then(insertImage);
        return;
      }
    }
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    compressImage(file).then((dataUrl) => {
      insertImage(dataUrl);
      editorRef.current?.focus();
    });
    e.target.value = "";
  }

  function execCmd(cmd: string, val?: string) {
    document.execCommand(cmd, false, val);
    editorRef.current?.focus();
    handleInput();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="block text-xs font-bold text-foreground/60">{label}</label>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => execCmd("bold")} className="text-xs text-foreground/50 hover:text-foreground font-bold px-1.5 py-0.5 rounded hover:bg-muted transition-colors" title={t("bold", lang)}>B</button>
          <button type="button" onClick={() => execCmd("italic")} className="text-xs text-foreground/50 hover:text-foreground italic px-1.5 py-0.5 rounded hover:bg-muted transition-colors" title={t("italic", lang)}>I</button>
          <button type="button" onClick={() => execCmd("underline")} className="text-xs text-foreground/50 hover:text-foreground underline px-1.5 py-0.5 rounded hover:bg-muted transition-colors" title={t("underlineText", lang)}>U</button>
          <span className="w-px h-4 bg-border" />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
          >
            <ImagePlus size={13} />
            {t("image", lang)}
          </button>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onPaste={handlePaste}
        onFocus={() => { isFocused.current = true; }}
        onBlur={() => { isFocused.current = false; flushInput(); }}
        data-placeholder={placeholder}
        className="w-full border border-border rounded-sm px-3 py-2 text-sm bg-background min-h-[140px] max-h-[400px] overflow-y-auto focus:outline-none focus:ring-1 focus:ring-primary/40 empty:before:content-[attr(data-placeholder)] empty:before:text-foreground/30"
        style={{ fontFamily: "'Noto Sans SC', 'PingFang SC', sans-serif", lineHeight: 1.7, wordBreak: "break-word" }}
      />
    </div>
  );
}

function QAEditorModal({ item, onClose, onSave, onChange, en }: {
  item: QAItem;
  onClose: () => void;
  onSave: () => void;
  onChange: (item: QAItem) => void;
  en: boolean;
}) {
  const { lang } = useLang();
  const [tab, setTab] = useState<"zh" | "en">("zh");
  const isNew = !item.id;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-2xl w-full max-w-[700px] max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
          <h3 className="font-bold text-lg" style={{ fontFamily: "'Noto Sans SC', 'PingFang SC', sans-serif" }}>
            {isNew ? t("newQA", lang) : t("editQA", lang)}
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={20} />
          </button>
        </div>

        <div className="flex border-b border-border flex-shrink-0">
          <button
            onClick={() => setTab("zh")}
            className={`flex-1 py-2.5 text-sm font-bold transition-colors ${tab === "zh" ? "text-primary border-b-2 border-primary bg-primary/5" : "text-foreground/50 hover:text-foreground/70"}`}
          >
            {t("chinese", lang)}
          </button>
          <button
            onClick={() => setTab("en")}
            className={`flex-1 py-2.5 text-sm font-bold transition-colors ${tab === "en" ? "text-primary border-b-2 border-primary bg-primary/5" : "text-foreground/50 hover:text-foreground/70"}`}
          >
            {t("english", lang)}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {tab === "zh" ? (
            <>
              <div>
                <label className="block text-xs font-bold text-foreground/60 mb-1">
                  {t("questionCN", lang)} *
                </label>
                <input
                  value={item.question || ""}
                  onChange={(e) => onChange({ ...item, question: e.target.value })}
                  className="w-full border border-border rounded-sm px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary/40"
                  placeholder={t("enterQuestion", lang)}
                />
              </div>
              <AnswerField
                label={t("answerCN", lang)}
                value={item.answer || ""}
                onChange={(v) => onChange({ ...item, answer: v })}
                placeholder={t("enterAnswer", lang)}
                en={en}
              />
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-bold text-foreground/60 mb-1">
                  {t("questionEN", lang)}
                </label>
                <input
                  value={item.question_en || ""}
                  onChange={(e) => onChange({ ...item, question_en: e.target.value })}
                  className="w-full border border-border rounded-sm px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary/40"
                  placeholder={t("englishQuestion", lang)}
                />
              </div>
              <AnswerField
                label={t("answerEN", lang)}
                value={item.answer_en || ""}
                onChange={(v) => onChange({ ...item, answer_en: v })}
                placeholder={t("englishAnswer", lang)}
                en={en}
              />
            </>
          )}
          <div>
            <label className="block text-xs font-bold text-foreground/60 mb-1">
              {t("sortOrder", lang)} ({t("smallerHigher", lang)})
            </label>
            <input
              type="number"
              value={item.sort_order ?? 0}
              onChange={(e) => onChange({ ...item, sort_order: parseInt(e.target.value) || 0 })}
              className="w-24 border border-border rounded-sm px-3 py-2 text-sm bg-background"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 p-4 border-t border-border flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-border rounded-sm hover:bg-muted transition-colors"
          >
            {t("cancel", lang)}
          </button>
          <button
            onClick={onSave}
            disabled={!item.question}
            className="flex items-center gap-1.5 px-4 py-2 text-sm bg-primary text-white rounded-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Save size={14} />
            {t("saveDone", lang)}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function QAPage() {
  const { isAdmin, password } = useAdminAuth();
  const { lang } = useLang();
  const en = lang === "en";
  const [items, setItems] = useState<QAItem[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [editingItem, setEditingItem] = useState<Partial<QAItem> | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch("/api/qa");
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (err) {
      console.error("Failed to fetch QA items:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  function toggleExpand(id: number) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function expandAll() {
    setExpandedIds(new Set(items.map((i) => i.id)));
  }

  function collapseAll() {
    setExpandedIds(new Set());
  }

  function openNew() {
    setEditingItem({ question: "", question_en: "", answer: "", answer_en: "", sort_order: items.length });
  }

  function openEdit(item: QAItem) {
    setEditingItem({ ...item });
  }

  async function handleSave() {
    if (!editingItem || !editingItem.question) return;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-admin-password": password || "",
    };
    const body = {
      question: editingItem.question,
      questionEn: editingItem.question_en,
      answer: editingItem.answer,
      answerEn: editingItem.answer_en,
      sortOrder: editingItem.sort_order || 0,
    };

    try {
      if (editingItem.id) {
        await fetch(`/api/qa/${editingItem.id}`, { method: "PUT", headers, body: JSON.stringify(body) });
      } else {
        await fetch("/api/qa", { method: "POST", headers, body: JSON.stringify(body) });
      }
      setEditingItem(null);
      fetchItems();
    } catch (err) {
      console.error("Failed to save QA item:", err);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm(t("deleteQAConfirm", lang))) return;
    try {
      await fetch(`/api/qa/${id}`, {
        method: "DELETE",
        headers: { "x-admin-password": password || "" },
      });
      fetchItems();
    } catch (err) {
      console.error("Failed to delete QA item:", err);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow w-full max-w-[900px] mx-auto px-4 md:px-6 py-8">
        <Link href="/">
          <span className="text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer">
            ← {t("backHome", lang)}
          </span>
        </Link>

        <div className="flex items-center gap-3 mt-4 mb-2">
          <h1
            className="text-2xl font-black text-foreground"
            style={{ fontFamily: "'Noto Sans SC', 'PingFang SC', sans-serif" }}
          >
            {t("qaTitle", lang)}
          </h1>
          {items.length > 0 && (
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={expandAll}
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                {t("expandAll", lang)}
              </button>
              <span className="text-xs text-border">|</span>
              <button
                onClick={collapseAll}
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                {t("collapseAll", lang)}
              </button>
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          {en
            ? "Frequently asked questions to help you know us better"
            : "常见问题解答，帮助您更好地了解我们"}
        </p>

        {isAdmin && (
          <button
            onClick={openNew}
            className="flex items-center gap-1.5 bg-primary text-white text-sm font-bold px-4 py-2 rounded-sm hover:bg-primary/90 transition-colors mb-6"
          >
            <Plus size={14} />
            {t("addQA", lang)}
          </button>
        )}

        {loading ? (
          <div className="py-12 text-center text-foreground/40">
            {t("loading", lang)}
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-foreground/30 text-base border border-dashed border-border/40 rounded-sm">
            {t("noQAYet", lang)}
          </div>
        ) : (
          <div className="flex flex-col gap-0">
            {items.map((item, idx) => {
              const isExpanded = expandedIds.has(item.id);
              const q = en && item.question_en ? item.question_en : item.question;
              const a = en && item.answer_en ? item.answer_en : item.answer;
              return (
                <div
                  key={item.id}
                  className={`border-b border-border/40 ${idx === 0 ? "border-t" : ""}`}
                >
                  <button
                    onClick={() => toggleExpand(item.id)}
                    className="w-full flex items-center gap-3 py-4 px-2 text-left hover:bg-muted/30 transition-colors group"
                  >
                    <span
                      className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold"
                    >
                      Q
                    </span>
                    <span
                      className="flex-1 font-bold text-base text-foreground"
                      style={{ fontFamily: "'Noto Sans SC', 'PingFang SC', sans-serif" }}
                    >
                      {q}
                    </span>
                    <span className="flex-shrink-0 text-muted-foreground">
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </span>
                  </button>
                  {isExpanded && (
                    <div className="pl-12 pr-4 pb-4">
                      <div className="flex items-start gap-3">
                        <span
                          className="flex-shrink-0 w-7 h-7 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-bold mt-0.5"
                        >
                          A
                        </span>
                        {a ? (
                          <div
                            className="flex-1 text-sm text-foreground/80 leading-relaxed qa-answer"
                            style={{ fontFamily: "'Noto Sans SC', 'PingFang SC', sans-serif" }}
                            dangerouslySetInnerHTML={{ __html: a.includes("<") ? a : a.replace(/\n/g, "<br/>") }}
                          />
                        ) : (
                          <div className="flex-1 text-sm text-foreground/40">
                            {t("noAnswerYet", lang)}
                          </div>
                        )}
                      </div>
                      {isAdmin && (
                        <div className="flex items-center gap-2 mt-3 ml-10">
                          <button
                            onClick={() => openEdit(item)}
                            className="flex items-center gap-1 text-xs text-primary border border-primary/40 px-2 py-1 rounded-sm hover:bg-primary hover:text-white transition-colors"
                          >
                            <Pencil size={12} />
                            {t("edit", lang)}
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="flex items-center gap-1 text-xs text-red-500 border border-red-300 px-2 py-1 rounded-sm hover:bg-red-500 hover:text-white transition-colors"
                          >
                            <Trash2 size={12} />
                            {t("delete", lang)}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />

      {editingItem && <QAEditorModal
        item={editingItem}
        onClose={() => setEditingItem(null)}
        onSave={handleSave}
        onChange={setEditingItem}
        en={en}
      />}
    </div>
  );
}
