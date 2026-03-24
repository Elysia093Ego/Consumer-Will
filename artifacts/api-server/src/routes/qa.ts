import { Router } from "express";
import { pool } from "@workspace/db";

const router = Router();
const ADMIN_PASSWORD = "ggwl528123";

router.get("/qa", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM qa_items ORDER BY sort_order ASC, created_at ASC`
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching QA items:", err);
    res.status(500).json({ error: "Failed to fetch QA items" });
  }
});

router.post("/qa", async (req, res) => {
  const pw = req.headers["x-admin-password"];
  if (pw !== ADMIN_PASSWORD) return res.status(401).json({ error: "Unauthorized" });
  try {
    const { question, questionEn, answer, answerEn, sortOrder } = req.body;
    if (!question) return res.status(400).json({ error: "Question is required" });
    const { rows } = await pool.query(
      `INSERT INTO qa_items (question, question_en, answer, answer_en, sort_order)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [question, questionEn || "", answer || "", answerEn || "", sortOrder || 0]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error("Error creating QA item:", err);
    res.status(500).json({ error: "Failed to create QA item" });
  }
});

router.put("/qa/:id", async (req, res) => {
  const pw = req.headers["x-admin-password"];
  if (pw !== ADMIN_PASSWORD) return res.status(401).json({ error: "Unauthorized" });
  try {
    const { question, questionEn, answer, answerEn, sortOrder } = req.body;
    const { rows } = await pool.query(
      `UPDATE qa_items SET question=$1, question_en=$2, answer=$3, answer_en=$4, sort_order=$5, updated_at=NOW()
       WHERE id=$6 RETURNING *`,
      [question, questionEn || "", answer || "", answerEn || "", sortOrder || 0, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("Error updating QA item:", err);
    res.status(500).json({ error: "Failed to update QA item" });
  }
});

router.delete("/qa/:id", async (req, res) => {
  const pw = req.headers["x-admin-password"];
  if (pw !== ADMIN_PASSWORD) return res.status(401).json({ error: "Unauthorized" });
  try {
    await pool.query(`DELETE FROM qa_items WHERE id = $1`, [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error("Error deleting QA item:", err);
    res.status(500).json({ error: "Failed to delete QA item" });
  }
});

export default router;
