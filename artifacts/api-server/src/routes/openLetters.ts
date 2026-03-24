import { Router } from "express";
import { pool } from "@workspace/db";

const router = Router();
const ADMIN_PASSWORD = "ggwl528123";

function isAdmin(req: any): boolean {
  return req.headers["x-admin-password"] === ADMIN_PASSWORD;
}

async function canEditContent(req: any): Promise<boolean> {
  if (isAdmin(req)) return true;
  const userId = req.headers["x-user-id"] as string | undefined;
  if (!userId) return false;
  const result = await pool.query("SELECT can_edit FROM site_users WHERE id = $1", [userId]);
  return result.rows.length > 0 && !!result.rows[0].can_edit;
}

router.get("/open-letters/:letterId", async (req, res) => {
  try {
    const { letterId } = req.params;
    const result = await pool.query(
      "SELECT letter_id, title, subtitle, content, title_en, subtitle_en, content_en, updated_at FROM open_letter_content WHERE letter_id = $1",
      [letterId]
    );
    if (result.rows.length === 0) {
      return res.json({ letterId, title: "", subtitle: "", content: "", titleEn: "", subtitleEn: "", contentEn: "", updatedAt: null });
    }
    const row = result.rows[0];
    res.json({
      letterId: row.letter_id,
      title: row.title || "",
      subtitle: row.subtitle || "",
      content: row.content || "",
      titleEn: row.title_en || "",
      subtitleEn: row.subtitle_en || "",
      contentEn: row.content_en || "",
      updatedAt: row.updated_at,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/open-letters/:letterId", async (req, res) => {
  if (!(await canEditContent(req))) {
    return res.status(403).json({ error: "No edit permission" });
  }
  try {
    const { letterId } = req.params;
    const { content, title, subtitle, titleEn, subtitleEn, contentEn } = req.body;
    await pool.query(
      `INSERT INTO open_letter_content (letter_id, title, subtitle, content, title_en, subtitle_en, content_en, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       ON CONFLICT (letter_id) DO UPDATE SET title = $2, subtitle = $3, content = $4, title_en = $5, subtitle_en = $6, content_en = $7, updated_at = NOW()`,
      [letterId, title || "", subtitle || "", content || "", titleEn || "", subtitleEn || "", contentEn || ""]
    );
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
