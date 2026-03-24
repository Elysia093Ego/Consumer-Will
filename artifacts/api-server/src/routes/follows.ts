import { Router } from "express";
import { pool } from "@workspace/db";

const router = Router();

router.get("/follows", async (req, res) => {
  try {
    const userId = req.query.userId as string | undefined;
    if (!userId) return res.status(400).json({ error: "userId required" });

    const result = await pool.query(
      "SELECT tag, created_at FROM user_follows WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch follows" });
  }
});

router.post("/follows", async (req, res) => {
  try {
    const { userId, tag } = req.body as { userId?: string; tag?: string };
    if (!userId || !tag) return res.status(400).json({ error: "userId and tag required" });

    await pool.query(
      "INSERT INTO user_follows (user_id, tag) VALUES ($1, $2) ON CONFLICT (user_id, tag) DO NOTHING",
      [userId, tag]
    );
    res.json({ ok: true, followed: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to follow" });
  }
});

router.delete("/follows", async (req, res) => {
  try {
    const { userId, tag } = req.body as { userId?: string; tag?: string };
    if (!userId || !tag) return res.status(400).json({ error: "userId and tag required" });

    await pool.query(
      "DELETE FROM user_follows WHERE user_id = $1 AND tag = $2",
      [userId, tag]
    );
    res.json({ ok: true, followed: false });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to unfollow" });
  }
});

export default router;
