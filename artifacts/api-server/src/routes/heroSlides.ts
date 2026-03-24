import { Router } from "express";
import { pool } from "@workspace/db";

const router = Router();
const ADMIN_PASSWORD = "ggwl528123";

function isAdmin(req: any): boolean {
  return req.headers["x-admin-password"] === ADMIN_PASSWORD;
}

router.get("/hero-slides", async (_req, res) => {
  try {
    res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=120");
    const result = await pool.query(
      "SELECT id, kind, title, title_en, subtitle, subtitle_en, label, label_en, image_url, href, sort_order FROM hero_slides ORDER BY sort_order ASC"
    );
    res.json(result.rows.map((r: any) => ({
      id: r.id,
      kind: r.kind,
      title: r.title,
      titleEn: r.title_en,
      subtitle: r.subtitle || "",
      subtitleEn: r.subtitle_en || "",
      label: r.label || "",
      labelEn: r.label_en || "",
      imageUrl: r.image_url || "",
      href: r.href || "",
      sortOrder: r.sort_order,
    })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/hero-slides", async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: "Admin only" });
  try {
    const slides: any[] = req.body.slides;
    if (!Array.isArray(slides)) return res.status(400).json({ error: "slides array required" });

    await pool.query("DELETE FROM hero_slides");
    for (let i = 0; i < slides.length; i++) {
      const s = slides[i];
      await pool.query(
        `INSERT INTO hero_slides (kind, title, title_en, subtitle, subtitle_en, label, label_en, image_url, href, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          s.kind || "article",
          s.title || "",
          s.titleEn || "",
          s.subtitle || "",
          s.subtitleEn || "",
          s.label || "",
          s.labelEn || "",
          s.imageUrl || "",
          s.href || "",
          i,
        ]
      );
    }
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
