import { Router } from "express";
import { pool } from "@workspace/db";

const router = Router();

const EDIT_KEY = "Elysia";

router.get("/ui-translations", async (req, res) => {
  const lang = (req.query.lang as string) || "ja";
  const { rows } = await pool.query(
    `SELECT key, value FROM ui_translations WHERE lang = $1`,
    [lang]
  );
  const map: Record<string, string> = {};
  for (const r of rows) map[r.key] = r.value;
  res.json(map);
});

router.put("/ui-translations", async (req, res) => {
  const editKey = req.headers["x-edit-key"] as string;
  if (editKey !== EDIT_KEY) {
    res.status(403).json({ error: "Invalid edit key" });
    return;
  }
  const { key, lang, value } = req.body as { key: string; lang: string; value: string };
  if (!key || !lang || typeof value !== "string") {
    res.status(400).json({ error: "key, lang, value required" });
    return;
  }
  await pool.query(
    `INSERT INTO ui_translations (key, lang, value, updated_at)
     VALUES ($1, $2, $3, NOW())
     ON CONFLICT (key, lang) DO UPDATE SET value = $3, updated_at = NOW()`,
    [key, lang, value]
  );
  res.json({ ok: true });
});

router.put("/ui-translations/batch", async (req, res) => {
  const editKey = req.headers["x-edit-key"] as string;
  if (editKey !== EDIT_KEY) {
    res.status(403).json({ error: "Invalid edit key" });
    return;
  }
  const { lang, translations } = req.body as { lang: string; translations: Record<string, string> };
  if (!lang || !translations) {
    res.status(400).json({ error: "lang and translations required" });
    return;
  }
  for (const [key, value] of Object.entries(translations)) {
    await pool.query(
      `INSERT INTO ui_translations (key, lang, value, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (key, lang) DO UPDATE SET value = $3, updated_at = NOW()`,
      [key, lang, value]
    );
  }
  res.json({ ok: true });
});

export default router;
