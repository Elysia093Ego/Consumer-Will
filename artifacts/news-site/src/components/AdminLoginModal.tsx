import { useState, useEffect, useRef } from "react";
import { X, Lock, ShieldCheck } from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";

export function AdminLoginModal() {
  const { showLoginModal, closeLoginModal, login } = useAdminAuth();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [shaking, setShaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showLoginModal) {
      setPassword("");
      setError("");
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [showLoginModal]);

  if (!showLoginModal) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok = login(password);
    if (!ok) {
      setError("密码错误，请重试");
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      setPassword("");
      inputRef.current?.focus();
    }
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) closeLoginModal(); }}
    >
      <div
        className={`bg-background rounded-2xl shadow-2xl border border-border/40 w-full max-w-sm mx-4 p-8 relative
          ${shaking ? "animate-shake" : ""}`}
        style={{ animation: shaking ? "shake 0.4s ease-in-out" : undefined }}
      >
        <button
          onClick={closeLoginModal}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-3">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <h2
            className="text-lg font-black text-foreground"
            style={{ fontFamily: "'Noto Sans SC', 'PingFang SC', sans-serif" }}
          >
            管理员登录
          </h2>
          <p className="text-xs text-muted-foreground mt-1">仅供内容管理使用</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-foreground/70">管理员密码</label>
            <input
              ref={inputRef}
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              placeholder="请输入管理员密码"
              className="w-full border border-border/60 bg-white/80 rounded-lg px-3 py-2 text-sm text-foreground
                placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            />
            {error && (
              <p className="text-xs text-red-500 mt-0.5">{error}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-secondary text-white text-sm font-bold py-2.5 rounded-lg hover:bg-secondary/90
              transition-colors flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            确认登录
          </button>
        </form>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}
