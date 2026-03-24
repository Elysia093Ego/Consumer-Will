import { useRef, useState, useEffect, useCallback } from "react";
import {
  X, Upload, ImagePlus, Bold, Italic, Strikethrough,
  List, ListOrdered, Link2, Quote, Minus, Eye, ChevronDown, Image, Trash2
} from "lucide-react";
import { compressImage, UserArticle } from "@/hooks/useArticles";

type Props = {
  category: string;
  categoryName: string;
  editing?: UserArticle | null;
  onPublish: (data: { title: string; titleEn?: string; content: string; contentEn?: string; imageUrl?: string; category: string }) => void;
  onUpdate: (id: string, data: { title: string; titleEn?: string; content: string; contentEn?: string; imageUrl?: string }) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
};

type TextFormat = "p" | "h1" | "h2" | "h3";

const FORMAT_LABELS: Record<TextFormat, string> = {
  p: "正文",
  h1: "标题一",
  h2: "标题二",
  h3: "标题三",
};

function ToolBtn({
  onClick, active, title, children,
}: {
  onClick: (e: React.MouseEvent) => void;
  active?: boolean;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => { e.preventDefault(); onClick(e); }}
      className={`flex items-center justify-center w-8 h-8 rounded text-sm transition-colors ${
        active
          ? "bg-primary/15 text-primary font-bold"
          : "text-foreground/60 hover:bg-foreground/8 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-border mx-1" />;
}

export function ArticleEditor({
  category, categoryName, editing, onPublish, onUpdate, onDelete, onClose,
}: Props) {
  const titleRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const enTitleRef = useRef<HTMLDivElement>(null);
  const enEditorRef = useRef<HTMLDivElement>(null);
  const inlineImgRef = useRef<HTMLInputElement>(null);
  const coverImgRef = useRef<HTMLInputElement>(null);
  const savedRange = useRef<Range | null>(null);
  const [charCount, setCharCount] = useState(0);
  const [textFormat, setTextFormat] = useState<TextFormat>("p");
  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const [preview, setPreview] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isStrike, setIsStrike] = useState(false);
  const [coverImageUrl, setCoverImageUrl] = useState<string>(editing?.imageUrl ?? "");
  const [activeTab, setActiveTab] = useState<"zh" | "en">("zh");

  useEffect(() => {
    if (titleRef.current) titleRef.current.innerHTML = editing?.title ?? "";
    if (editorRef.current) {
      editorRef.current.innerHTML = editing?.content ?? "";
      updateCharCount();
    }
    if (enTitleRef.current) enTitleRef.current.innerText = editing?.titleEn ?? "";
    if (enEditorRef.current) enEditorRef.current.innerHTML = editing?.contentEn ?? "";
    setCoverImageUrl(editing?.imageUrl ?? "");
  }, [editing?.id]);

  function updateCharCount() {
    const text = editorRef.current?.innerText ?? "";
    setCharCount(text.replace(/\s/g, "").length);
  }

  function updateFormatState() {
    setIsBold(document.queryCommandState("bold"));
    setIsItalic(document.queryCommandState("italic"));
    setIsStrike(document.queryCommandState("strikeThrough"));
  }

  function execCmd(command: string, value?: string) {
    document.execCommand(command, false, value ?? "");
    editorRef.current?.focus();
    updateFormatState();
  }

  function applyFormat(fmt: TextFormat) {
    setTextFormat(fmt);
    setShowFormatMenu(false);
    execCmd("formatBlock", fmt === "p" ? "p" : fmt);
  }

  function saveSelection() {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) savedRange.current = sel.getRangeAt(0).cloneRange();
  }

  function restoreSelection() {
    if (!savedRange.current || !editorRef.current) return;
    editorRef.current.focus();
    const sel = window.getSelection();
    if (sel) { sel.removeAllRanges(); sel.addRange(savedRange.current); }
  }

  function handleInsertImage() {
    saveSelection();
    inlineImgRef.current?.click();
  }

  const handleInlineImageChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const src = await compressImage(file, 1000);
      restoreSelection();
      document.execCommand(
        "insertHTML", false,
        `<figure style="margin:16px 0;"><img src="${src}" style="max-width:100%;border-radius:4px;display:block;" /></figure>`
      );
      updateCharCount();
    } catch { /* ignore */ }
    e.target.value = "";
  }, []);

  function handleInsertDivider() {
    execCmd("insertHTML", `<hr style="border:none;border-top:1px solid #e5e5e5;margin:24px 0;" />`);
  }

  function handleInsertLink() {
    const url = window.prompt("输入链接地址：", "https://");
    if (url) execCmd("createLink", url);
  }

  const handleCoverImageChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const src = await compressImage(file, 1200);
      setCoverImageUrl(src);
    } catch { /* ignore */ }
    e.target.value = "";
  }, []);

  function getTitle() { return titleRef.current?.innerText.trim() ?? (editing?.title || ""); }
  function getContent() { return editorRef.current?.innerHTML ?? (editing?.content || ""); }

  function handleSubmit() {
    const title = getTitle();
    const content = getContent();
    const titleEn = enTitleRef.current ? enTitleRef.current.innerText.trim() : (editing?.titleEn ?? undefined);
    const contentEn = enEditorRef.current ? enEditorRef.current.innerHTML.trim() : (editing?.contentEn ?? undefined);
    if (!title) { titleRef.current?.focus(); return; }
    if (editing) {
      onUpdate(editing.id, { title, titleEn, content, contentEn, imageUrl: coverImageUrl || undefined });
    } else {
      onPublish({ title, titleEn, content, contentEn, imageUrl: coverImageUrl || undefined, category });
    }
    onClose();
  }

  function handleDelete() {
    if (!editing) return;
    if (window.confirm("确认删除此文章？")) { onDelete(editing.id); onClose(); }
  }

  const previewTitle = getTitle() || "（无标题）";
  const previewContent = getContent();

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* ── Top Bar ── */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-border bg-card/80 backdrop-blur-sm">
        <span className="text-xs text-muted-foreground font-medium">
          {editing ? "编辑文章" : "草稿"}
          <span className="ml-2 text-muted-foreground/60">· {categoryName}</span>
        </span>

        {/* Language tabs */}
        <div className="flex border border-border rounded-md overflow-hidden text-xs font-medium">
          <button type="button" onClick={() => setActiveTab("zh")} className={`px-3 py-1.5 transition-colors ${activeTab === "zh" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"}`}>中文</button>
          <button type="button" onClick={() => setActiveTab("en")} className={`px-3 py-1.5 border-l border-border transition-colors ${activeTab === "en" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"}`}>English</button>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPreview((v) => !v)}
            className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded transition-colors ${
              preview ? "text-primary" : "text-muted-foreground hover:text-primary"
            }`}
          >
            <Eye className="w-4 h-4" />
            预览
          </button>

          {editing && (
            <button
              onClick={handleDelete}
              className="text-xs text-red-500 border border-red-200 px-2.5 py-1.5 rounded-md hover:bg-red-50 transition-colors"
            >
              删除
            </button>
          )}

          <button
            onClick={handleSubmit}
            className="flex items-center gap-1.5 bg-primary text-white text-sm font-black px-5 py-1.5 rounded-full hover:bg-primary/90 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            {editing ? "保存修改" : "发布"}
          </button>

          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors ml-1">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ── Format Toolbar (Chinese tab only) ── */}
      {!preview && activeTab === "zh" && (
        <div className="flex items-center gap-0.5 px-4 py-2 border-b border-border bg-card/60 flex-wrap">
          {/* Bold / Italic / Strike */}
          <ToolBtn onClick={() => execCmd("bold")} active={isBold} title="加粗 (Ctrl+B)">
            <Bold className="w-4 h-4" />
          </ToolBtn>
          <ToolBtn onClick={() => execCmd("italic")} active={isItalic} title="斜体 (Ctrl+I)">
            <Italic className="w-4 h-4" />
          </ToolBtn>
          <ToolBtn onClick={() => execCmd("strikeThrough")} active={isStrike} title="删除线">
            <Strikethrough className="w-4 h-4" />
          </ToolBtn>

          <Divider />

          {/* Format dropdown */}
          <div className="relative">
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); setShowFormatMenu((v) => !v); }}
              className="flex items-center gap-1 text-xs font-medium text-foreground/70 hover:text-foreground px-2.5 h-8 rounded hover:bg-foreground/8 transition-colors"
            >
              {FORMAT_LABELS[textFormat]}
              <ChevronDown className="w-3 h-3" />
            </button>
            {showFormatMenu && (
              <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-10 py-1 min-w-[120px]">
                {(Object.keys(FORMAT_LABELS) as TextFormat[]).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); applyFormat(fmt); }}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-primary/10 transition-colors ${
                      textFormat === fmt ? "text-primary font-bold" : "text-foreground/80"
                    }`}
                  >
                    {FORMAT_LABELS[fmt]}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Divider />

          {/* Lists */}
          <ToolBtn onClick={() => execCmd("insertUnorderedList")} title="无序列表">
            <List className="w-4 h-4" />
          </ToolBtn>
          <ToolBtn onClick={() => execCmd("insertOrderedList")} title="有序列表">
            <ListOrdered className="w-4 h-4" />
          </ToolBtn>

          <Divider />

          {/* Blockquote */}
          <ToolBtn onClick={() => execCmd("formatBlock", "blockquote")} title="引用">
            <Quote className="w-4 h-4" />
          </ToolBtn>

          {/* Divider line */}
          <ToolBtn onClick={handleInsertDivider} title="插入分割线">
            <Minus className="w-4 h-4" />
          </ToolBtn>

          {/* Link */}
          <ToolBtn onClick={handleInsertLink} title="插入链接">
            <Link2 className="w-4 h-4" />
          </ToolBtn>

          <Divider />

          {/* Image insert */}
          <button
            type="button"
            title="在光标处插入图片"
            onMouseDown={(e) => { e.preventDefault(); handleInsertImage(); }}
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 px-2.5 h-8 rounded transition-colors"
          >
            <ImagePlus className="w-4 h-4" />
            插入图片
          </button>

          <Divider />

          {/* Cover image */}
          <button
            type="button"
            title="设置文章封面图"
            onMouseDown={(e) => { e.preventDefault(); coverImgRef.current?.click(); }}
            className={`flex items-center gap-1.5 text-xs font-medium px-2.5 h-8 rounded transition-colors ${
              coverImageUrl
                ? "text-primary bg-primary/10 hover:bg-primary/20"
                : "text-muted-foreground hover:text-primary hover:bg-primary/10"
            }`}
          >
            <Image className="w-4 h-4" />
            {coverImageUrl ? "更换封面" : "封面设置"}
          </button>
          {coverImageUrl && (
            <button
              type="button"
              title="删除封面"
              onMouseDown={(e) => { e.preventDefault(); setCoverImageUrl(""); }}
              className="flex items-center justify-center w-6 h-6 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          <span className="ml-auto text-xs text-muted-foreground tabular-nums">{charCount} 字</span>
        </div>
      )}

      {/* ── Editor / Preview ── */}
      <div className="flex-1 overflow-y-auto">
        {/* English editor tab — always mounted, hidden via CSS */}
        <div style={{ display: activeTab === "en" ? undefined : "none" }}>
          <div className="max-w-2xl mx-auto px-6 py-8 flex flex-col gap-4">
            <p className="text-xs text-muted-foreground">English translation — fill in the English title and body below.</p>
            <div
              ref={enTitleRef}
              contentEditable
              suppressContentEditableWarning
              data-placeholder="English Title"
              className="article-title-input text-3xl font-black text-foreground leading-tight focus:outline-none"
              style={{ minHeight: "48px" }}
            />
            <div className="w-full h-px bg-border" />
            <div
              ref={enEditorRef}
              contentEditable
              suppressContentEditableWarning
              data-placeholder="English body…"
              className="article-editor-body text-base text-foreground leading-[1.8] focus:outline-none min-h-[400px]"
            />
          </div>
        </div>

        {activeTab === "zh" && preview ? (
          /* Preview */
          <div className="max-w-2xl mx-auto px-6 py-10">
            <h1 className="text-3xl font-black text-foreground mb-6 leading-tight" style={{ fontFamily: "'Noto Sans SC', 'PingFang SC', sans-serif" }}>
              {previewTitle}
            </h1>
            {previewContent ? (
              <div
                className="article-content text-base text-foreground leading-relaxed"
                style={{ fontFamily: "'Noto Sans SC', 'PingFang SC', sans-serif" }}
                dangerouslySetInnerHTML={{ __html: previewContent }}
              />
            ) : (
              <p className="text-muted-foreground italic">（暂无正文内容）</p>
            )}
          </div>
        ) : null}

        {/* Chinese Editor — always mounted, hidden when not active */}
        {!preview && (
          <div className="max-w-2xl mx-auto px-6 py-8 flex flex-col gap-4" style={{ display: activeTab === "zh" ? undefined : "none" }}>
            {/* Cover image preview */}
            {coverImageUrl && (
              <div className="relative w-full aspect-[2/1] overflow-hidden rounded-lg bg-muted group">
                <img src={coverImageUrl} alt="封面" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); coverImgRef.current?.click(); }}
                    className="bg-white text-foreground text-xs font-medium px-3 py-1.5 rounded-md shadow hover:bg-foreground hover:text-white transition-colors"
                  >
                    更换封面
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); setCoverImageUrl(""); }}
                    className="bg-white text-red-500 text-xs font-medium px-3 py-1.5 rounded-md shadow hover:bg-red-500 hover:text-white transition-colors"
                  >
                    删除封面
                  </button>
                </div>
              </div>
            )}

            {/* Title */}
            <div
              ref={titleRef}
              contentEditable
              suppressContentEditableWarning
              data-placeholder="添加标题"
              className="article-title-input text-3xl font-black text-foreground leading-tight focus:outline-none"
              style={{ fontFamily: "'Noto Sans SC', 'PingFang SC', sans-serif", minHeight: "48px" }}
            />

            <div className="w-full h-px bg-border" />

            {/* Body */}
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              data-placeholder="开始写作……"
              className="article-editor-body text-base text-foreground leading-[1.8] focus:outline-none min-h-[400px]"
              style={{ fontFamily: "'Noto Sans SC', 'PingFang SC', sans-serif" }}
              onInput={() => { updateCharCount(); updateFormatState(); }}
              onKeyUp={updateFormatState}
              onMouseUp={updateFormatState}
            />
          </div>
        )}
      </div>

      <input ref={inlineImgRef} type="file" accept="image/*" className="hidden" onChange={handleInlineImageChange} />
      <input ref={coverImgRef} type="file" accept="image/*" className="hidden" onChange={handleCoverImageChange} />
    </div>
  );
}
