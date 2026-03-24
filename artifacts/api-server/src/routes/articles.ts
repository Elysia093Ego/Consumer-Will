import { Router } from "express";
import { db, articlesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { pool } from "@workspace/db";

const router = Router();

router.get("/articles/search", async (req, res) => {
  try {
    const q = (req.query.q as string || "").trim();
    if (!q) return res.json([]);
    const pattern = `%${q}%`;

    const articlesResult = await pool.query(
      `SELECT id, title, title_en, content, content_en, image_url, category, published_at, updated_at, is_preset
       FROM user_articles
       WHERE title ILIKE $1 OR title_en ILIKE $1 OR content ILIKE $1 OR content_en ILIKE $1
       ORDER BY published_at DESC
       LIMIT 20`,
      [pattern]
    );
    const articles = articlesResult.rows.map(r => ({
      id: r.id, title: r.title, content: r.content,
      imageUrl: r.image_url, category: r.category, type: "article" as const,
    }));

    const pagesResult = await pool.query(
      `SELECT page_id, title, title_en, description, description_en, content, content_en
       FROM page_content
       WHERE title ILIKE $1 OR title_en ILIKE $1 OR description ILIKE $1 OR description_en ILIKE $1
         OR content ILIKE $1 OR content_en ILIKE $1
       LIMIT 20`,
      [pattern]
    );
    const PAGE_ROUTES: Record<string, string> = {
      "qingnian-jiuye-nan": "/qingnian/jiuye-nan",
      "qingnian-xuedai": "/qingnian/xuedai",
      "qingnian-ai-xuexi": "/qingnian/ai-xuexi",
      "zhengfu-zhaiwu-weiji": "/zhengfu/zhaiwu-weiji",
      "zhengfu-yanglao-nan": "/zhengfu/yanglao-nan",
      "zhengfu-jiuye-nan": "/zhengfu/jiuye-nan",
      "zhaopian": "/zhaopian",
      "shuxueyuanli": "/shuxueyuanli",
      "lilun": "/lilun",
      "guanyu": "/guanyu",
      "jiaru": "/jiaru",
      "fuwutiaokuan": "/fuwutiaokuan",
    };
    const pages = pagesResult.rows.map(r => ({
      id: r.page_id,
      route: PAGE_ROUTES[r.page_id] || `/${r.page_id}`,
      title: r.title || r.title_en || r.page_id,
      content: r.description || r.content || r.description_en || "",
      type: "page" as const,
    }));

    res.json([...articles, ...pages].slice(0, 20));
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Search failed" });
  }
});

router.get("/articles", async (req, res) => {
  try {
    const { category } = req.query as { category?: string };
    const rows = category
      ? await db.select().from(articlesTable).where(eq(articlesTable.category, category)).orderBy(articlesTable.publishedAt)
      : await db.select().from(articlesTable).orderBy(articlesTable.publishedAt);
    rows.reverse();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch articles" });
  }
});

router.get("/articles/:id", async (req, res) => {
  try {
    const rows = await db.select().from(articlesTable).where(eq(articlesTable.id, req.params.id));
    if (rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch {
    res.status(500).json({ error: "Failed to fetch article" });
  }
});

router.post("/articles", async (req, res) => {
  try {
    const { id, title, content, imageUrl, category, publishedAt, updatedAt } = req.body;
    if (!id || !title || !category) return res.status(400).json({ error: "Missing required fields" });
    const row = await db.insert(articlesTable).values({
      id,
      title,
      content: content ?? "",
      imageUrl: imageUrl ?? null,
      category,
      publishedAt: new Date(publishedAt),
      updatedAt: new Date(updatedAt),
    }).returning();
    res.status(201).json(row[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to create article" });
  }
});

router.put("/articles/:id", async (req, res) => {
  try {
    const { title, titleEn, content, contentEn, imageUrl, updatedAt } = req.body;
    const row = await db.update(articlesTable)
      .set({
        title,
        titleEn: titleEn ?? null,
        content,
        contentEn: contentEn ?? null,
        imageUrl: imageUrl ?? null,
        updatedAt: new Date(updatedAt),
      })
      .where(eq(articlesTable.id, req.params.id))
      .returning();
    if (row.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(row[0]);
  } catch {
    res.status(500).json({ error: "Failed to update article" });
  }
});

router.delete("/articles/:id", async (req, res) => {
  try {
    await db.delete(articlesTable).where(eq(articlesTable.id, req.params.id));
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to delete article" });
  }
});

export default router;
