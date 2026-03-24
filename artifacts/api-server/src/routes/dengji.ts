import { Router } from "express";
import { pool } from "@workspace/db";

const router = Router();

/* 查询总登记人数 */
router.get("/dengji/count", async (_req, res) => {
  try {
    const result = await pool.query("SELECT COUNT(*)::int AS count FROM dengji_records");
    res.json({ count: result.rows[0].count as number });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "查询失败" });
  }
});

/* 查询某账号是否已登记 */
router.get("/dengji/status", async (req, res) => {
  try {
    const userId = req.query.userId as string | undefined;
    if (!userId) return res.status(400).json({ error: "缺少 userId" });
    const result = await pool.query(
      "SELECT id, full_name, birth_date, country, created_at FROM dengji_records WHERE user_id = $1",
      [userId]
    );
    if (result.rows.length > 0) {
      const r = result.rows[0];
      res.json({ registered: true, fullName: r.full_name, birthDate: r.birth_date, country: r.country, registeredAt: r.created_at });
    } else {
      res.json({ registered: false });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "查询失败" });
  }
});

/* 提交登记（每个账号只能登记一次） */
router.post("/dengji", async (req, res) => {
  try {
    const { userId, fullName, birthDate, country } = req.body as {
      userId?: string;
      fullName?: string;
      birthDate?: string;
      country?: string;
    };
    if (!userId) {
      return res.status(400).json({ error: "请先登录后再登记" });
    }

    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const insert = await pool.query(
      `INSERT INTO dengji_records (id, user_id, full_name, birth_date, country)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id) DO NOTHING
       RETURNING id`,
      [id, userId, fullName ?? null, birthDate ?? null, country ?? null]
    );

    const alreadyRegistered = insert.rows.length === 0;
    const countResult = await pool.query(
      "SELECT COUNT(*)::int AS count FROM dengji_records"
    );

    res.status(alreadyRegistered ? 200 : 201).json({
      count: countResult.rows[0].count as number,
      alreadyRegistered,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "登记失败，请稍后再试" });
  }
});

export default router;
