import { Router } from "express";
import { pool } from "@workspace/db";

const router = Router();
const ADMIN_PASSWORD = "ggwl528123";

router.get("/notifications/:userId", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [req.params.userId]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

router.get("/notifications/:userId/unread-count", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = false`,
      [req.params.userId]
    );
    res.json({ count: parseInt(rows[0].count) });
  } catch (err) {
    res.status(500).json({ error: "Failed" });
  }
});

router.put("/notifications/:id/read", async (req, res) => {
  try {
    await pool.query(`UPDATE notifications SET is_read = true WHERE id = $1`, [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed" });
  }
});

router.put("/notifications/read-all/:userId", async (req, res) => {
  try {
    await pool.query(`UPDATE notifications SET is_read = true WHERE user_id = $1`, [req.params.userId]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed" });
  }
});

router.post("/notifications/reply-feedback", async (req, res) => {
  const pw = req.headers["x-admin-password"];
  if (pw !== ADMIN_PASSWORD) return res.status(401).json({ error: "Unauthorized" });

  try {
    const { feedbackId, userId, message } = req.body;
    if (!userId || !message) return res.status(400).json({ error: "userId and message required" });

    await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, feedback_id) VALUES ($1, $2, $3, $4, $5)`,
      [userId, "feedback_reply", "反馈回复", message, feedbackId || null]
    );

    if (feedbackId) {
      await pool.query(
        `UPDATE feedback SET admin_reply = $1, replied_at = NOW() WHERE id = $2`,
        [message, feedbackId]
      );
    }

    res.json({ ok: true });
  } catch (err) {
    console.error("Error replying to feedback:", err);
    res.status(500).json({ error: "Failed" });
  }
});

router.post("/notifications/broadcast", async (req, res) => {
  const pw = req.headers["x-admin-password"];
  if (pw !== ADMIN_PASSWORD) return res.status(401).json({ error: "Unauthorized" });

  try {
    const { title, message } = req.body;
    if (!message) return res.status(400).json({ error: "message required" });

    const { rows: users } = await pool.query(`SELECT id FROM site_users`);
    if (users.length === 0) return res.json({ ok: true, sent: 0 });

    const values: string[] = [];
    const params: any[] = [];
    let idx = 1;
    for (const u of users) {
      values.push(`($${idx}, $${idx + 1}, $${idx + 2}, $${idx + 3})`);
      params.push(u.id, "broadcast", title || "系统通知", message);
      idx += 4;
    }

    await pool.query(
      `INSERT INTO notifications (user_id, type, title, message) VALUES ${values.join(",")}`,
      params
    );

    res.json({ ok: true, sent: users.length });
  } catch (err) {
    console.error("Error broadcasting:", err);
    res.status(500).json({ error: "Failed" });
  }
});

router.delete("/notifications/:id", async (req, res) => {
  try {
    await pool.query(`DELETE FROM notifications WHERE id = $1`, [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed" });
  }
});

export default router;
