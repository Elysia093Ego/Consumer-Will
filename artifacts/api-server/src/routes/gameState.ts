import { Router } from "express";
import { pool } from "@workspace/db";

const router = Router();

router.get("/game-state", async (req, res) => {
  const { userId } = req.query as { userId?: string };
  if (!userId) return res.status(400).json({ error: "userId required" });
  try {
    const result = await pool.query(
      "SELECT state FROM game_state WHERE user_id = $1",
      [userId]
    );
    if (result.rows.length === 0) return res.json({ state: null });
    res.json({ state: result.rows[0].state });
  } catch {
    res.status(500).json({ error: "Failed to load game state" });
  }
});

router.put("/game-state", async (req, res) => {
  const { userId, state } = req.body;
  if (!userId || !state) return res.status(400).json({ error: "userId and state required" });
  try {
    await pool.query(
      `INSERT INTO game_state (user_id, state, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (user_id)
       DO UPDATE SET state = $2, updated_at = NOW()`,
      [userId, JSON.stringify(state)]
    );
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to save game state" });
  }
});

export default router;
