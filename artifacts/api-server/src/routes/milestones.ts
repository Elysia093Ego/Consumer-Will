import { Router } from "express";
import { pool } from "@workspace/db";

const router = Router();
const ADMIN_PASSWORD = "ggwl528123";

function isAdmin(req: any): boolean {
  return req.headers["x-admin-password"] === ADMIN_PASSWORD;
}

router.get("/milestones/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await pool.query(
      `SELECT slug, title, title_en, content, content_en, updated_at FROM milestone_pages WHERE slug = $1`,
      [slug]
    );
    if (result.rows.length === 0) {
      return res.json({ slug, title: "", titleEn: "", content: "", contentEn: "", updatedAt: null });
    }
    const r = result.rows[0];
    res.json({
      slug: r.slug,
      title: r.title || "",
      titleEn: r.title_en || "",
      content: r.content || "",
      contentEn: r.content_en || "",
      updatedAt: r.updated_at ?? null,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/milestones/:slug", async (req, res) => {
  if (!isAdmin(req)) {
    return res.status(403).json({ error: "Admin only" });
  }
  try {
    const { slug } = req.params;
    const { title, titleEn, content, contentEn } = req.body;
    await pool.query(
      `INSERT INTO milestone_pages (slug, title, title_en, content, content_en, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (slug) DO UPDATE SET title=$2, title_en=$3, content=$4, content_en=$5, updated_at=NOW()`,
      [slug, title || "", titleEn || "", content || "", contentEn || ""]
    );
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
