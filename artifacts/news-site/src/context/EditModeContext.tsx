import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import type { Lang } from "@/i18n/ui";

const EDIT_KEY = "Elysia";

interface EditModeContextValue {
  editMode: boolean;
  enableEditMode: (key: string) => boolean;
  disableEditMode: () => void;
  overrides: Record<string, string>;
  saveOverride: (key: string, lang: string, value: string) => Promise<void>;
  refreshOverrides: (lang: string) => Promise<void>;
}

const EditModeContext = createContext<EditModeContextValue>({
  editMode: false,
  enableEditMode: () => false,
  disableEditMode: () => {},
  overrides: {},
  saveOverride: async () => {},
  refreshOverrides: async () => {},
});

export function EditModeProvider({ children }: { children: ReactNode }) {
  const [editMode, setEditMode] = useState(false);
  const [overrides, setOverrides] = useState<Record<string, string>>({});

  const fetchOverrides = useCallback(async (lang: string) => {
    try {
      const res = await fetch(`/api/ui-translations?lang=${lang}`);
      if (res.ok) {
        const data = await res.json();
        setOverrides(data);
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchOverrides("ja");
  }, [fetchOverrides]);

  function enableEditMode(key: string): boolean {
    if (key === EDIT_KEY) {
      setEditMode(true);
      return true;
    }
    return false;
  }

  function disableEditMode() {
    setEditMode(false);
  }

  async function saveOverride(key: string, lang: string, value: string) {
    try {
      const res = await fetch("/api/ui-translations", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-edit-key": EDIT_KEY },
        body: JSON.stringify({ key, lang, value }),
      });
      if (res.ok) {
        setOverrides((prev) => ({ ...prev, [key]: value }));
      }
    } catch {}
  }

  return (
    <EditModeContext.Provider value={{ editMode, enableEditMode, disableEditMode, overrides, saveOverride, refreshOverrides: fetchOverrides }}>
      {children}
    </EditModeContext.Provider>
  );
}

export function useEditMode() {
  return useContext(EditModeContext);
}
