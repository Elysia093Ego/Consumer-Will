import { Router } from "express";
import { pool } from "@workspace/db";

const router = Router();

async function ensureStats(articleId: string) {
  await pool.query(
    `INSERT INTO article_stats (article_id, views, likes)
     VALUES ($1, 0, 0)
     ON CONFLICT (article_id) DO NOTHING`,
    [articleId]
  );
}

router.get("/articles/:id/stats", async (req, res) => {
  try {
    const { id } = req.params;
    await ensureStats(id);
    const result = await pool.query(
      "SELECT views, likes FROM article_stats WHERE article_id = $1",
      [id]
    );
    res.json(result.rows[0] ?? { views: 0, likes: 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "查询失败" });
  }
});

router.post("/articles/:id/view", async (req, res) => {
  try {
    const { id } = req.params;
    await ensureStats(id);
    const result = await pool.query(
      "UPDATE article_stats SET views = views + 1 WHERE article_id = $1 RETURNING views",
      [id]
    );
    res.json({ views: result.rows[0].views });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "更新失败" });
  }
});

router.post("/articles/:id/like", async (req, res) => {
  try {
    const { id } = req.params;
    const { delta } = req.body as { delta?: number };
    const d = delta === -1 ? -1 : 1;
    await ensureStats(id);
    const result = await pool.query(
      "UPDATE article_stats SET likes = GREATEST(0, likes + $1) WHERE article_id = $2 RETURNING likes",
      [d, id]
    );
    res.json({ likes: result.rows[0].likes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "更新失败" });
  }
});

export default router;
