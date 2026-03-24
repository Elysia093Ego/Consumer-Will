import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { UserPlus, Eye, EyeOff, CheckCircle2, Mail } from "lucide-react";
import { useUserAuth } from "@/context/UserAuthContext";
import { useLang } from "@/context/LangContext";
import { t } from "@/i18n/ui";

const INPUT_CLS = `w-full border border-border/60 bg-white rounded-lg px-3 py-2.5 text-sm text-foreground
  placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary`;

export default function RegisterPage() {
  const { register, user } = useUserAuth();
  const [, navigate] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [email, setEmail] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailCd, setEmailCd] = useState(0);
  const usernameRef = useRef<HTMLInputElement>(null);
  const { lang } = useLang();
  const en = lang === "en";

  useEffect(() => {
    if (user) navigate("/");
    else usernameRef.current?.focus();
  }, [user, navigate]);

  useEffect(() => {
    if (emailCd <= 0) return;
    const timer = setTimeout(() => setEmailCd(emailCd - 1), 1000);
    return () => clearTimeout(timer);
  }, [emailCd]);

  const passwordStrength = (() => {
    if (password.length === 0) return null;
    if (password.length < 6) return { label: t("pwTooShort", lang), color: "bg-red-400" };
    if (password.length < 10) return { label: t("pwFair", lang), color: "bg-yellow-400" };
    return { label: t("pwStrong", lang), color: "bg-green-500" };
  })();

  async function sendCode(type: "email" | "phone") {
    const target = email.trim();
    if (!target) return;
    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target, type }),
      });
      const data = await res.json();
      if (res.ok) {
        setEmailCd(60);
      } else {
        setError(data.error || "发送失败");
      }
    } catch {
      setError("发送验证码失败");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError(t("passwordMismatch", lang));
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password,
          email: email.trim(),
          emailCode: emailCode.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("user", JSON.stringify(data));
        window.location.href = "/";
      } else {
        setError(data.error || t("registerFailed", lang));
      }
    } catch {
      setError(t("registerFailed", lang));
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          <div className="bg-white/70 border border-border/40 rounded-2xl shadow-lg p-8">
            <div className="flex flex-col items-center mb-7">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center mb-3">
                <UserPlus className="w-5 h-5 text-white" />
              </div>
              <h1
                className="text-xl font-black text-foreground"
                style={{ fontFamily: "'Noto Sans SC', 'PingFang SC', sans-serif" }}
              >
                {t("createAccount", lang)}
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                {t("registerSubtitle", lang)}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground/70">
                  {t("username", lang)}{" "}
                  <span className="text-muted-foreground/50">{t("usernameHint", lang)}</span>
                </label>
                <input
                  ref={usernameRef}
                  type="text"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setError(""); }}
                  placeholder={t("setUsername", lang)}
                  autoComplete="username"
                  maxLength={20}
                  className={INPUT_CLS}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground/70 flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {en ? "Email" : "邮箱"}
                  <span className="text-muted-foreground/50">{en ? "(optional)" : "（选填）"}</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={en ? "Email address" : "请输入邮箱地址"}
                    className={INPUT_CLS + " flex-1"}
                  />
                  <button
                    type="button"
                    disabled={!email.trim() || emailCd > 0}
                    onClick={() => sendCode("email")}
                    className="flex-shrink-0 px-3 py-2 text-xs font-medium rounded-lg bg-primary/10 text-primary
                      hover:bg-primary/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {emailCd > 0 ? `${emailCd}s` : (en ? "Send Code" : "发送验证码")}
                  </button>
                </div>
                {email.trim() && (
                  <input
                    type="text"
                    value={emailCode}
                    onChange={(e) => setEmailCode(e.target.value)}
                    placeholder={en ? "Email verification code (optional)" : "邮箱验证码（选填）"}
                    maxLength={6}
                    className={INPUT_CLS}
                  />
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground/70">{t("password", lang)}</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    placeholder={t("atLeast6", lang)}
                    autoComplete="new-password"
                    className={INPUT_CLS + " pr-10"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordStrength && (
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className={`h-1 w-8 rounded-full transition-colors ${
                            password.length === 0 ? "bg-border" :
                            password.length < 6 && i === 0 ? "bg-red-400" :
                            password.length < 10 && i <= 1 ? "bg-yellow-400" :
                            i <= 2 ? "bg-green-500" : "bg-border"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {t("pwStrength", lang)}: {passwordStrength.label}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground/70">{t("confirmPassword", lang)}</label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => { setConfirm(e.target.value); setError(""); }}
                    placeholder={t("repeatPassword", lang)}
                    autoComplete="new-password"
                    className={INPUT_CLS + " pr-10"}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    {confirm && password && confirm === password && (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    )}
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || !username || !password || !confirm}
                className="w-full bg-primary text-white text-sm font-bold py-2.5 rounded-lg
                  hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                  flex items-center justify-center gap-2 mt-1"
              >
                {loading ? t("creating", lang) : t("createAccount", lang)}
              </button>
            </form>

            <div className="mt-5 text-center">
              <p className="text-xs text-muted-foreground">
                {t("alreadyHaveAccount", lang)}{" "}
                <Link href="/login" className="text-primary font-medium hover:underline">
                  {t("signInNow", lang)}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
