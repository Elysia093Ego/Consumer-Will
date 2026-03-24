import { useState, useEffect, useCallback } from "react";
import { useUserAuth } from "@/context/UserAuthContext";

export interface Bookmark {
  article_id: string;
  created_at: string;
  title: string | null;
  title_en: string | null;
  image_url: string | null;
  category: string | null;
}

export function useBookmarks() {
  const { user } = useUserAuth();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBookmarks = useCallback(async () => {
    if (!user) {
      setBookmarks([]);
      return;
    }
    try {
      const res = await fetch(`/api/bookmarks?userId=${encodeURIComponent(user.id)}`);
      if (res.ok) {
        setBookmarks(await res.json());
      }
    } catch {}
  }, [user]);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  const isBookmarked = useCallback(
    (articleId: string) => bookmarks.some((b) => b.article_id === articleId),
    [bookmarks]
  );

  const toggleBookmark = useCallback(
    async (articleId: string, title?: string, imageUrl?: string) => {
      if (!user) return false;
      setLoading(true);
      const already = bookmarks.some((b) => b.article_id === articleId);
      try {
        const body: Record<string, string> = { userId: user.id, articleId };
        if (!already && title) body.title = title;
        if (!already && imageUrl) body.imageUrl = imageUrl;
        const res = await fetch("/api/bookmarks", {
          method: already ? "DELETE" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          if (already) {
            setBookmarks((prev) => prev.filter((b) => b.article_id !== articleId));
          } else {
            await fetchBookmarks();
          }
        }
      } catch {}
      setLoading(false);
      return !already;
    },
    [user, bookmarks, fetchBookmarks]
  );

  return { bookmarks, isBookmarked, toggleBookmark, loading, refetch: fetchBookmarks };
}
