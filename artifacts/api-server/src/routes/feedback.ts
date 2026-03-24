import { Router } from "express";
import { pool } from "@workspace/db";

const router = Router();
const ADMIN_PASSWORD = "ggwl528123";

router.post("/feedback", async (req, res) => {
  try {
    const { userId, username, email, subject, message } = req.body;
    if (!email || !message) {
      return res.status(400).json({ error: "Email and message are required" });
    }
    await pool.query(
      `INSERT INTO feedback (user_id, username, email, subject, message) VALUES ($1, $2, $3, $4, $5)`,
      [userId || null, username || "", email, subject || "", message]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error("Error submitting feedback:", err);
    res.status(500).json({ error: "Failed to submit feedback" });
  }
});

router.get("/feedback", async (req, res) => {
  const pw = req.headers["x-admin-password"];
  if (pw !== ADMIN_PASSWORD) return res.status(401).json({ error: "Unauthorized" });
  try {
    const { rows } = await pool.query(`SELECT * FROM feedback ORDER BY created_at DESC`);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching feedback:", err);
    res.status(500).json({ error: "Failed to fetch feedback" });
  }
});

router.delete("/feedback/:id", async (req, res) => {
  const pw = req.headers["x-admin-password"];
  if (pw !== ADMIN_PASSWORD) return res.status(401).json({ error: "Unauthorized" });
  try {
    await pool.query(`DELETE FROM feedback WHERE id = $1`, [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete feedback" });
  }
});

export default router;
