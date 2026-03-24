import { Router } from "express";
import { pool } from "@workspace/db";

const ADMIN_PASSWORD = "ggwl528123";

const router = Router();

function checkAdmin(req: any, res: any): boolean {
  if (req.headers["x-admin-password"] !== ADMIN_PASSWORD) {
    res.status(403).json({ error: "Unauthorized" });
    return false;
  }
  return true;
}

router.get("/admin/stats", async (req, res) => {
  if (!checkAdmin(req, res)) return;

  try {
    const client = await pool.connect();
    try {
      const usersResult = await client.query("SELECT COUNT(*) as count FROM site_users");
      const dengjiResult = await client.query("SELECT COUNT(*) as count FROM dengji_records");
      const articlesResult = await client.query("SELECT COUNT(*) as count FROM user_articles");
      const followsResult = await client.query("SELECT COUNT(*) as count FROM user_follows");

      const recentUsers = await client.query(
        "SELECT id, username, numeric_id, avatar_url, created_at FROM site_users ORDER BY created_at DESC LIMIT 20"
      );

      const recentDengji = await client.query(
        "SELECT d.id, d.full_name, d.country, d.created_at, u.username FROM dengji_records d LEFT JOIN site_users u ON d.user_id = u.id ORDER BY d.created_at DESC LIMIT 20"
      );

      res.json({
        counts: {
          users: parseInt(usersResult.rows[0].count),
          dengji: parseInt(dengjiResult.rows[0].count),
          articles: parseInt(articlesResult.rows[0].count),
          follows: parseInt(followsResult.rows[0].count),
        },
        recentUsers: recentUsers.rows.map((r: any) => ({
          id: r.id,
          username: r.username,
          numericId: r.numeric_id ? String(r.numeric_id).padStart(11, "0") : null,
          avatarUrl: r.avatar_url || null,
          createdAt: r.created_at,
        })),
        recentDengji: recentDengji.rows.map((r: any) => ({
          id: r.id,
          fullName: r.full_name,
          country: r.country,
          createdAt: r.created_at,
          username: r.username,
        })),
      });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Admin stats error:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

router.get("/admin/users-edit-perms", async (req, res) => {
  if (!checkAdmin(req, res)) return;
  try {
    const result = await pool.query(
      "SELECT id, username, numeric_id, avatar_url, can_edit, created_at FROM site_users ORDER BY can_edit DESC, created_at DESC"
    );
    res.json(result.rows.map((r: any) => ({
      id: r.id,
      username: r.username,
      numericId: r.numeric_id ? String(r.numeric_id).padStart(11, "0") : null,
      avatarUrl: r.avatar_url || null,
      canEdit: !!r.can_edit,
      createdAt: r.created_at,
    })));
  } catch (err) {
    console.error("Fetch users edit perms error:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

router.put("/admin/users-edit-perms/:userId", async (req, res) => {
  if (!checkAdmin(req, res)) return;
  try {
    const { userId } = req.params;
    const { canEdit } = req.body as { canEdit: boolean };
    await pool.query("UPDATE site_users SET can_edit = $1 WHERE id = $2", [!!canEdit, userId]);
    res.json({ ok: true });
  } catch (err) {
    console.error("Update user edit perm error:", err);
    res.status(500).json({ error: "Failed to update permission" });
  }
});

export default router;
