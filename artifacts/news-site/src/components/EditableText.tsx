import { useState, useRef, useEffect } from "react";
import { useLang } from "@/context/LangContext";
import { useEditMode } from "@/context/EditModeContext";
import { t as baseT } from "@/i18n/ui";
import { Pencil, Check, X } from "lucide-react";

export function useT() {
  const { overrides } = useEditMode();
  return (key: string, lang: string) => {
    if (lang === "ja" && overrides[key]) return overrides[key];
    return baseT(key, lang as any);
  };
}

export function EditableText({ tKey, className }: { tKey: string; className?: string }) {
  const { lang } = useLang();
  const { editMode, overrides, saveOverride } = useEditMode();
  const [editing, setEditing] = useState(false);
  const text = lang === "ja" && overrides[tKey] ? overrides[tKey] : baseT(tKey, lang);
  const [value, setValue] = useState(text);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(text);
  }, [text]);

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  if (!editMode || lang !== "ja") {
    return <span className={className}>{text}</span>;
  }

  if (editing) {
    return (
      <span className="inline-flex items-center gap-1">
        <input
          ref={inputRef}
          className="border border-blue-400 rounded px-1 py-0.5 text-sm bg-white text-foreground min-w-[60px]"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              saveOverride(tKey, "ja", value);
              setEditing(false);
            }
            if (e.key === "Escape") {
              setValue(text);
              setEditing(false);
            }
          }}
        />
        <button
          className="p-0.5 text-green-600 hover:text-green-800"
          onClick={() => { saveOverride(tKey, "ja", value); setEditing(false); }}
        >
          <Check className="w-3 h-3" />
        </button>
        <button
          className="p-0.5 text-red-500 hover:text-red-700"
          onClick={() => { setValue(text); setEditing(false); }}
        >
          <X className="w-3 h-3" />
        </button>
      </span>
    );
  }

  return (
    <span
      className={`cursor-pointer group relative inline-flex items-center gap-0.5 ${className ?? ""}`}
      onClick={() => setEditing(true)}
      title={`编辑: ${tKey}`}
    >
      <span className="border-b border-dashed border-blue-400">{text}</span>
      <Pencil className="w-3 h-3 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
    </span>
  );
}
