import { useState, useEffect, useCallback } from "react";
import { useUserAuth } from "@/context/UserAuthContext";

export function useFollows() {
  const { user } = useUserAuth();
  const [followedTags, setFollowedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFollows = useCallback(async () => {
    if (!user) {
      setFollowedTags([]);
      return;
    }
    try {
      const res = await fetch(`/api/follows?userId=${encodeURIComponent(user.id)}`);
      if (res.ok) {
        const data = await res.json();
        setFollowedTags(data.map((r: { tag: string }) => r.tag));
      }
    } catch {
    }
  }, [user]);

  useEffect(() => {
    fetchFollows();
  }, [fetchFollows]);

  const toggleFollow = useCallback(async (tag: string) => {
    if (!user) return false;
    setLoading(true);
    const isFollowed = followedTags.includes(tag);
    try {
      const res = await fetch("/api/follows", {
        method: isFollowed ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, tag }),
      });
      if (res.ok) {
        setFollowedTags(prev =>
          isFollowed ? prev.filter(t => t !== tag) : [...prev, tag]
        );
      }
    } catch {
    }
    setLoading(false);
    return !isFollowed;
  }, [user, followedTags]);

  const isFollowing = useCallback((tag: string) => followedTags.includes(tag), [followedTags]);

  return { followedTags, toggleFollow, isFollowing, loading, refetch: fetchFollows };
}
