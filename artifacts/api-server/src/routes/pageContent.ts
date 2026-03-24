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

const ALL_COLS = "page_id, title, title_en, description, description_en, image_url, tag, tag_en, content, content_en, updated_at";
const BATCH_COLS = "page_id, title, title_en, description, description_en, image_url, tag, tag_en, content, content_en";

function rowToJson(row: any) {
  return {
    pageId: row.page_id,
    title: row.title || "",
    titleEn: row.title_en || "",
    description: row.description || "",
    descriptionEn: row.description_en || "",
    imageUrl: row.image_url || "",
    tag: row.tag || "",
    tagEn: row.tag_en || "",
    content: row.content || "",
    contentEn: row.content_en || "",
    updatedAt: row.updated_at ?? null,
  };
}

const EMPTY = { pageId: "", title: "", titleEn: "", description: "", descriptionEn: "", imageUrl: "", tag: "", tagEn: "", content: "", contentEn: "", updatedAt: null };

router.get("/page-content/:pageId", async (req, res) => {
  try {
    const { pageId } = req.params;
    const result = await pool.query(`SELECT ${ALL_COLS} FROM page_content WHERE page_id = $1`, [pageId]);
    if (result.rows.length === 0) return res.json({ ...EMPTY, pageId });
    res.json(rowToJson(result.rows[0]));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/page-content-batch", async (req, res) => {
  try {
    res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=120");
    const ids = (req.query.ids as string || "").split(",").filter(Boolean);
    if (ids.length === 0) return res.json([]);
    const placeholders = ids.map((_, i) => `$${i + 1}`).join(",");
    const result = await pool.query(`SELECT ${BATCH_COLS} FROM page_content WHERE page_id IN (${placeholders})`, ids);
    res.json(result.rows.map(rowToJson));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/page-content/:pageId", async (req, res) => {
  if (!(await canEditContent(req))) {
    return res.status(403).json({ error: "No edit permission" });
  }
  try {
    const { pageId } = req.params;
    const { title, titleEn, description, descriptionEn, imageUrl, tag, tagEn, content, contentEn } = req.body;
    await pool.query(
      `INSERT INTO page_content (page_id, title, title_en, description, description_en, image_url, tag, tag_en, content, content_en, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
       ON CONFLICT (page_id) DO UPDATE SET title=$2, title_en=$3, description=$4, description_en=$5, image_url=$6, tag=$7, tag_en=$8, content=$9, content_en=$10, updated_at=NOW()`,
      [pageId, title||"", titleEn||"", description||"", descriptionEn||"", imageUrl||"", tag||"", tagEn||"", content||"", contentEn||""]
    );
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
