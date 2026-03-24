import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LogIn, Eye, EyeOff } from "lucide-react";
import { useUserAuth } from "@/context/UserAuthContext";
import { useLang } from "@/context/LangContext";
import { t } from "@/i18n/ui";

export default function LoginPage() {
  const { login, user } = useUserAuth();
  const [, navigate] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const usernameRef = useRef<HTMLInputElement>(null);
  const { lang } = useLang();

  useEffect(() => {
    if (user) navigate("/");
    else usernameRef.current?.focus();
  }, [user, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(username.trim(), password);
    setLoading(false);
    if (result.ok) {
      navigate("/");
    } else {
      setError(result.error ?? t("loginFailed", lang));
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          <div className="bg-white/70 border border-border/40 rounded-2xl shadow-lg p-8">
            <div className="flex flex-col items-center mb-7">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-3">
                <LogIn className="w-5 h-5 text-white" />
              </div>
              <h1
                className="text-xl font-black text-foreground"
                style={{ fontFamily: "'Noto Sans SC', 'PingFang SC', sans-serif" }}
              >
                {t("userLogin", lang)}
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                {t("loginSubtitle", lang)}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground/70">
                  {t("username", lang)}
                </label>
                <input
                  ref={usernameRef}
                  type="text"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setError(""); }}
                  placeholder={t("enterUsername", lang)}
                  autoComplete="username"
                  className="w-full border border-border/60 bg-white rounded-lg px-3 py-2.5 text-sm text-foreground
                    placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground/70">
                  {t("password", lang)}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    placeholder={t("enterPassword", lang)}
                    autoComplete="current-password"
                    className="w-full border border-border/60 bg-white rounded-lg px-3 py-2.5 pr-10 text-sm text-foreground
                      placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || !username || !password}
                className="w-full bg-secondary text-white text-sm font-bold py-2.5 rounded-lg
                  hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                  flex items-center justify-center gap-2 mt-1"
              >
                {loading ? t("signingIn", lang) : t("login", lang)}
              </button>
            </form>

            <div className="mt-5 text-center">
              <p className="text-xs text-muted-foreground">
                {t("noAccount", lang)}{" "}
                <Link href="/register" className="text-primary font-medium hover:underline">
                  {t("registerNow", lang)}
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
