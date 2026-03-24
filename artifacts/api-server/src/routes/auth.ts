import { Router } from "express";
import bcrypt from "bcryptjs";
import { pool } from "@workspace/db";

const router = Router();

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

router.post("/auth/send-code", async (req, res) => {
  try {
    const { target, type } = req.body as { target?: string; type?: string };
    if (!target || !type || !["email", "phone"].includes(type)) {
      return res.status(400).json({ error: "参数错误" });
    }
    const recent = await pool.query(
      "SELECT id FROM verification_codes WHERE target = $1 AND type = $2 AND created_at > NOW() - INTERVAL '1 minute'",
      [target, type]
    );
    if (recent.rows.length > 0) {
      return res.status(429).json({ error: "请求过于频繁，请1分钟后再试" });
    }
    const code = generateCode();
    await pool.query(
      "INSERT INTO verification_codes (target, type, code) VALUES ($1, $2, $3)",
      [target, type, code]
    );
    console.log(`[验证码] ${type}=${target}, code=${code}`);
    res.json({ success: true, message: "验证码已发送" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "发送验证码失败" });
  }
});

router.post("/auth/register", async (req, res) => {
  try {
    const { username, password, email, phone, emailCode, phoneCode } = req.body as {
      username?: string; password?: string; email?: string; phone?: string;
      emailCode?: string; phoneCode?: string;
    };
    if (!username || !password) {
      return res.status(400).json({ error: "用户名和密码不能为空" });
    }
    if (username.length < 2 || username.length > 20) {
      return res.status(400).json({ error: "用户名长度须在 2-20 个字符之间" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "密码长度至少 6 位" });
    }

    if (emailCode && email) {
      const codeResult = await pool.query(
        "SELECT id FROM verification_codes WHERE target = $1 AND type = 'email' AND code = $2 AND used = false AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1",
        [email, emailCode]
      );
      if (codeResult.rows.length === 0) {
        return res.status(400).json({ error: "邮箱验证码无效或已过期" });
      }
      await pool.query("UPDATE verification_codes SET used = true WHERE id = $1", [codeResult.rows[0].id]);
    }

    if (phoneCode && phone) {
      const codeResult = await pool.query(
        "SELECT id FROM verification_codes WHERE target = $1 AND type = 'phone' AND code = $2 AND used = false AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1",
        [phone, phoneCode]
      );
      if (codeResult.rows.length === 0) {
        return res.status(400).json({ error: "手机验证码无效或已过期" });
      }
      await pool.query("UPDATE verification_codes SET used = true WHERE id = $1", [codeResult.rows[0].id]);
    }

    const existing = await pool.query("SELECT id FROM site_users WHERE username = $1", [username]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "该用户名已被注册" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const numIdResult = await pool.query("SELECT nextval('site_users_numeric_id_seq') as nid");
    const numericId = parseInt(numIdResult.rows[0].nid);
    await pool.query(
      "INSERT INTO site_users (id, username, password_hash, numeric_id, email, phone) VALUES ($1, $2, $3, $4, $5, $6)",
      [id, username, passwordHash, numericId, email || "", phone || ""]
    );

    const displayId = String(numericId).padStart(11, "0");
    res.status(201).json({ id, username, numericId: displayId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "注册失败，请稍后再试" });
  }
});

router.post("/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body as { username?: string; password?: string };
    if (!username || !password) {
      return res.status(400).json({ error: "用户名和密码不能为空" });
    }

    const result = await pool.query(
      "SELECT id, username, password_hash, numeric_id, avatar_url, can_edit FROM site_users WHERE username = $1",
      [username]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "用户名或密码错误" });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: "用户名或密码错误" });
    }

    const displayId = user.numeric_id ? String(user.numeric_id).padStart(11, "0") : user.id;
    res.json({ id: user.id, username: user.username, numericId: displayId, avatarUrl: user.avatar_url || null, canEdit: !!user.can_edit });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "登录失败，请稍后再试" });
  }
});

router.post("/auth/avatar", async (req, res) => {
  try {
    const { userId, avatarData } = req.body as { userId?: string; avatarData?: string };
    if (!userId || !avatarData) {
      return res.status(400).json({ error: "Missing userId or avatarData" });
    }
    if (!avatarData.startsWith("data:image/")) {
      return res.status(400).json({ error: "Invalid image data" });
    }
    if (avatarData.length > 2 * 1024 * 1024) {
      return res.status(400).json({ error: "头像文件过大，请选择小于1.5MB的图片" });
    }

    await pool.query("UPDATE site_users SET avatar_url = $1 WHERE id = $2", [avatarData, userId]);
    res.json({ success: true, avatarUrl: avatarData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "上传头像失败" });
  }
});

router.get("/auth/profile", async (req, res) => {
  try {
    const userId = req.query.userId as string;
    if (!userId) return res.status(400).json({ error: "Missing userId" });

    const result = await pool.query(
      "SELECT id, username, numeric_id, avatar_url, created_at FROM site_users WHERE id = $1",
      [userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const u = result.rows[0];
    const displayId = u.numeric_id ? String(u.numeric_id).padStart(11, "0") : u.id;
    res.json({
      id: u.id,
      username: u.username,
      numericId: displayId,
      avatarUrl: u.avatar_url || null,
      createdAt: u.created_at,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get profile" });
  }
});

export default router;
