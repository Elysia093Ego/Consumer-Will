import { Router } from "express";
import { pool } from "@workspace/db";

const router = Router();

router.get("/bookmarks", async (req, res) => {
  const { userId } = req.query as { userId?: string };
  if (!userId) return res.status(400).json({ error: "userId required" });
  try {
    const result = await pool.query(
      `SELECT b.article_id, b.created_at, b.article_title,
              COALESCE(NULLIF(a.title, ''), b.article_title) AS title,
              a.title_en,
              COALESCE(NULLIF(a.image_url, ''), b.article_image) AS image_url,
              a.category
       FROM article_bookmarks b
       LEFT JOIN user_articles a ON a.id = b.article_id
       WHERE b.user_id = $1
       ORDER BY b.created_at DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: "Failed to fetch bookmarks" });
  }
});

router.get("/bookmarks/check", async (req, res) => {
  const { userId, articleId } = req.query as { userId?: string; articleId?: string };
  if (!userId || !articleId) return res.status(400).json({ error: "userId and articleId required" });
  try {
    const result = await pool.query(
      "SELECT 1 FROM article_bookmarks WHERE user_id = $1 AND article_id = $2",
      [userId, articleId]
    );
    res.json({ bookmarked: result.rows.length > 0 });
  } catch {
    res.status(500).json({ error: "Failed to check bookmark" });
  }
});

router.post("/bookmarks", async (req, res) => {
  const { userId, articleId, title, imageUrl } = req.body;
  if (!userId || !articleId) return res.status(400).json({ error: "userId and articleId required" });
  try {
    await pool.query(
      "INSERT INTO article_bookmarks (user_id, article_id, article_title, article_image) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING",
      [userId, articleId, title || "", imageUrl || ""]
    );
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to add bookmark" });
  }
});

router.delete("/bookmarks", async (req, res) => {
  const { userId, articleId } = req.body;
  if (!userId || !articleId) return res.status(400).json({ error: "userId and articleId required" });
  try {
    await pool.query(
      "DELETE FROM article_bookmarks WHERE user_id = $1 AND article_id = $2",
      [userId, articleId]
    );
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to remove bookmark" });
  }
});

export default router;
