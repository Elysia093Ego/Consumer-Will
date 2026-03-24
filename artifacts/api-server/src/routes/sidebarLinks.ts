import { Router } from "express";
import { pool } from "@workspace/db";

const ADMIN_PASSWORD = "ggwl528123";
const router = Router();

router.get("/sidebar-links/:category", async (req, res) => {
  try {
    const { category } = req.params;
    const result = await pool.query(
      "SELECT position, title, url FROM sidebar_links WHERE category = $1 ORDER BY position ASC",
      [category]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "查询失败" });
  }
});

router.put("/sidebar-links/:category/:position", async (req, res) => {
  try {
    const adminPwd = req.headers["x-admin-password"] as string | undefined;
    if (adminPwd !== ADMIN_PASSWORD) {
      return res.status(403).json({ error: "无权限" });
    }
    const { category, position } = req.params;
    const { title, url } = req.body as { title?: string; url?: string };
    if (!title) return res.status(400).json({ error: "缺少标题" });
    await pool.query(
      `UPDATE sidebar_links SET title = $1, url = $2
       WHERE category = $3 AND position = $4`,
      [title, url ?? "", category, Number(position)]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "更新失败" });
  }
});

export default router;
