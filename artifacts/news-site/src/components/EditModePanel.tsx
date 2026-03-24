import { useState, useEffect } from "react";
import { useLang } from "@/context/LangContext";
import { useEditMode } from "@/context/EditModeContext";
import { t as baseT } from "@/i18n/ui";
import { X, Save, Search } from "lucide-react";

const ALL_KEYS = [
  "home", "principle", "openLetter", "simMarket", "topics", "login", "register",
  "logout", "adminLogin", "adminDashboard", "profile", "save", "saved", "share",
  "like", "views", "readFull", "readMore", "backHome", "feedback", "siteTitle",
  "employment", "education", "finance", "elderCare", "life", "tech", "innovation",
  "environment", "humanAI", "UBI", "searchPlaceholder", "noArticles", "loading",
  "error", "submit", "cancel", "confirm", "delete", "edit", "beingEdited",
  "loginRequired", "loginToSave", "confirmDelete", "ourPillars", "smartphoneLand",
  "leisureLabor", "spendingOxygen", "tradeTree", "contractTitle", "contractSub",
  "contractLight", "contractBtn", "totalRegistered", "articleTitle", "articleContent",
  "categoryLabel", "imageUrl", "enterTitle", "enterContent", "selectCategory",
  "pasteImageUrl", "englishTitle", "englishContent", "contentCN", "contentEN",
  "profileTitle", "accountInfo", "userId", "registeredAt", "registrationStatus",
  "registered", "notRegistered", "goRegister", "myBookmarks", "noBookmarks",
  "removeBookmark", "categoryAll", "newspaper", "latestArticles", "publishedBy",
  "admin", "feedbackTitle", "feedbackPlaceholder", "feedbackEmpty",
  "feedbackThanks", "submitFeedback", "submittingAs",
  "tree", "fruit", "devices", "leisureTime", "spending",
  "questionCN", "enterQuestion", "answerCN", "enterAnswer",
  "questionEN", "englishQuestion", "answerEN", "englishAnswer",
  "openLetterLabel", "sortOrder", "smallerHigher",
  "expandAll", "collapseAll", "addQA", "noQAYet", "noAnswerYet",
  "deleteQAConfirm", "qaTitle",
];

export function EditModePanel() {
  const { lang } = useLang();
  const { editMode, overrides, saveOverride, disableEditMode } = useEditMode();
  const [search, setSearch] = useState("");
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    setEdits({});
  }, [editMode]);

  if (!editMode || lang !== "ja") return null;

  const filtered = ALL_KEYS.filter((k) => {
    if (!search) return true;
    const lower = search.toLowerCase();
    const defaultVal = baseT(k, "ja");
    const overrideVal = overrides[k] || "";
    return k.toLowerCase().includes(lower) || defaultVal.toLowerCase().includes(lower) || overrideVal.toLowerCase().includes(lower);
  });

  async function handleSave(key: string) {
    const val = edits[key];
    if (val === undefined) return;
    setSaving(key);
    await saveOverride(key, "ja", val);
    setEdits((prev) => { const n = { ...prev }; delete n[key]; return n; });
    setSaving(null);
  }

  return (
    <div className="fixed bottom-0 right-0 w-[380px] max-h-[60vh] bg-white border border-gray-200 shadow-2xl rounded-tl-xl z-[9999] flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 bg-blue-500 text-white rounded-tl-xl">
        <span className="font-bold text-sm">日本語 UI 編集パネル</span>
        <button onClick={disableEditMode} className="hover:bg-blue-600 rounded p-1">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="px-3 py-2 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            className="w-full text-xs border rounded pl-7 pr-2 py-1.5"
            placeholder="検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="overflow-y-auto flex-1 divide-y divide-gray-100">
        {filtered.map((key) => {
          const defaultVal = baseT(key, "ja");
          const currentVal = overrides[key] || defaultVal;
          const editVal = edits[key];
          const changed = editVal !== undefined && editVal !== currentVal;
          return (
            <div key={key} className="px-3 py-2 hover:bg-gray-50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono text-gray-400">{key}</span>
                {changed && (
                  <button
                    onClick={() => handleSave(key)}
                    disabled={saving === key}
                    className="text-[10px] flex items-center gap-0.5 text-blue-500 hover:text-blue-700"
                  >
                    <Save className="w-3 h-3" />
                    {saving === key ? "..." : "保存"}
                  </button>
                )}
              </div>
              <div className="text-[10px] text-gray-400 mb-1">既定: {defaultVal}</div>
              <input
                className="w-full text-xs border rounded px-2 py-1 focus:border-blue-400 focus:outline-none"
                value={editVal !== undefined ? editVal : currentVal}
                onChange={(e) => setEdits((prev) => ({ ...prev, [key]: e.target.value }))}
                onKeyDown={(e) => { if (e.key === "Enter") handleSave(key); }}
              />
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="px-3 py-6 text-center text-xs text-gray-400">該当なし</div>
        )}
      </div>
    </div>
  );
}
