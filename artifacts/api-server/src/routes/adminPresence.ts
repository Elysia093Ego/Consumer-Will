import { Router } from "express";

const router = Router();
const ADMIN_PASSWORD = "ggwl528123";
const HEARTBEAT_TIMEOUT = 20_000;

type AdminSession = {
  sessionId: string;
  lastHeartbeat: number;
};

type ArticleLock = {
  sessionId: string;
  lockedAt: number;
};

const activeSessions = new Map<string, AdminSession>();
const articleLocks = new Map<string, ArticleLock>();

function cleanStale() {
  const now = Date.now();
  for (const [id, s] of activeSessions) {
    if (now - s.lastHeartbeat > HEARTBEAT_TIMEOUT) {
      activeSessions.delete(id);
      for (const [artId, lock] of articleLocks) {
        if (lock.sessionId === id) articleLocks.delete(artId);
      }
    }
  }
}

function checkAdmin(pw: string | undefined) {
  return pw === ADMIN_PASSWORD;
}

router.post("/admin/heartbeat", (req, res) => {
  const pw = req.headers["x-admin-password"] as string | undefined;
  if (!checkAdmin(pw)) return res.status(401).json({ error: "Unauthorized" });

  const sessionId = (req.body.sessionId as string) || "";
  if (!sessionId) return res.status(400).json({ error: "sessionId required" });

  cleanStale();
  activeSessions.set(sessionId, { sessionId, lastHeartbeat: Date.now() });

  const onlineCount = activeSessions.size;
  const locks: Record<string, { sessionId: string; lockedAt: number }> = {};
  for (const [artId, lock] of articleLocks) {
    locks[artId] = lock;
  }

  res.json({ onlineCount, locks });
});

router.post("/admin/lock-article", (req, res) => {
  const pw = req.headers["x-admin-password"] as string | undefined;
  if (!checkAdmin(pw)) return res.status(401).json({ error: "Unauthorized" });

  const { sessionId, articleId } = req.body;
  if (!sessionId || !articleId) return res.status(400).json({ error: "sessionId and articleId required" });

  cleanStale();

  const existing = articleLocks.get(String(articleId));
  if (existing && existing.sessionId !== sessionId && activeSessions.has(existing.sessionId)) {
    return res.status(409).json({ error: "Article is being edited by another admin", lockedBy: existing.sessionId });
  }

  articleLocks.set(String(articleId), { sessionId, lockedAt: Date.now() });
  res.json({ ok: true });
});

router.delete("/admin/lock-article", (req, res) => {
  const pw = req.headers["x-admin-password"] as string | undefined;
  if (!checkAdmin(pw)) return res.status(401).json({ error: "Unauthorized" });

  const { sessionId, articleId } = req.body;
  if (!articleId) return res.status(400).json({ error: "articleId required" });

  const existing = articleLocks.get(String(articleId));
  if (existing && existing.sessionId === sessionId) {
    articleLocks.delete(String(articleId));
  }

  res.json({ ok: true });
});

export default router;
