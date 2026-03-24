import { useState, useEffect, useCallback } from "react";

export type UserArticle = {
  id: string;
  title: string;
  titleEn?: string;
  content: string;
  contentEn?: string;
  imageUrl?: string;
  category: string;
  publishedAt: string;
  updatedAt: string;
  isPreset?: boolean;
};

const API_BASE = "/api";

function toArticle(row: Record<string, unknown>): UserArticle {
  return {
    id: row.id as string,
    title: row.title as string,
    titleEn: (row.titleEn ?? row.title_en) as string | undefined,
    content: (row.content as string) ?? "",
    contentEn: (row.contentEn ?? row.content_en) as string | undefined,
    imageUrl: ((row.imageUrl ?? row.image_url) as string | null) ?? undefined,
    category: row.category as string,
    publishedAt: row.publishedAt instanceof Date
      ? (row.publishedAt as Date).toISOString()
      : (row.publishedAt as string),
    updatedAt: row.updatedAt instanceof Date
      ? (row.updatedAt as Date).toISOString()
      : (row.updatedAt as string),
    isPreset: Boolean(row.isPreset ?? row.is_preset ?? false),
  };
}

export function compressImage(file: File, maxWidth = 1200): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const ratio = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * ratio);
        canvas.height = Math.round(img.height * ratio);
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.75));
      };
      img.src = e.target!.result as string;
    };
    reader.readAsDataURL(file);
  });
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

export function useArticles(category?: string) {
  const [articles, setArticles] = useState<UserArticle[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const qs = category ? `?category=${encodeURIComponent(category)}` : "";
      const rows = await apiFetch<Record<string, unknown>[]>(`/articles${qs}`);
      setArticles(rows.map(toArticle));
    } catch (err) {
      console.error("Failed to load articles:", err);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const publishArticle = useCallback(
    async (data: { title: string; titleEn?: string; content: string; contentEn?: string; imageUrl?: string; category: string }) => {
      const now = new Date().toISOString();
      const body = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        ...data,
        imageUrl: data.imageUrl ?? null,
        publishedAt: now,
        updatedAt: now,
      };
      const row = await apiFetch<Record<string, unknown>>("/articles", {
        method: "POST",
        body: JSON.stringify(body),
      });
      const article = toArticle(row);
      setArticles((prev) => [article, ...prev.filter((a) => a.id !== article.id)]);
      return article;
    },
    []
  );

  const updateArticle = useCallback(
    async (id: string, updates: Partial<Pick<UserArticle, "title" | "titleEn" | "content" | "contentEn" | "imageUrl">>) => {
      const body = { ...updates, updatedAt: new Date().toISOString() };
      const row = await apiFetch<Record<string, unknown>>(`/articles/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
      });
      const article = toArticle(row);
      setArticles((prev) => prev.map((a) => (a.id === id ? article : a)));
    },
    []
  );

  const deleteArticle = useCallback(
    async (id: string) => {
      await apiFetch(`/articles/${id}`, { method: "DELETE" });
      setArticles((prev) => prev.filter((a) => a.id !== id));
    },
    []
  );

  return { articles, loading, publishArticle, updateArticle, deleteArticle, refresh };
}
