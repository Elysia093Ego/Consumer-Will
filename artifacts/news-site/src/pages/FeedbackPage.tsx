import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useLang } from "@/context/LangContext";
import { t } from "@/i18n/ui";
import { useUserAuth } from "@/context/UserAuthContext";
import { Link } from "wouter";
import { MessageSquare, Send, CheckCircle, ArrowLeft } from "lucide-react";

const FONT_CN = "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif";
const API = "/api";

const SUBJECT_OPTIONS = [
  { zh: "功能建议", en: "Feature Suggestion" },
  { zh: "问题报告", en: "Bug Report" },
  { zh: "内容反馈", en: "Content Feedback" },
  { zh: "合作咨询", en: "Partnership Inquiry" },
  { zh: "其他", en: "Other" },
];

export default function FeedbackPage() {
  const { lang } = useLang();
  const en = lang === "en";
  const { user } = useUserAuth();

  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState(SUBJECT_OPTIONS[0].zh);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !message.trim()) {
      setError(t("fillEmailAndMessage", lang));
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`${API}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          username: user?.username || "",
          email: email.trim(),
          subject,
          message: message.trim(),
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setSubmitted(true);
    } catch {
      setError(t("submitFailed", lang));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow w-full max-w-[700px] mx-auto px-4 md:px-6 py-8">
        <Link href="/">
          <span className="inline-flex items-center gap-1 text-sm text-primary hover:underline cursor-pointer mb-6">
            <ArrowLeft className="w-4 h-4" />
            {t("backHome", lang)}
          </span>
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-primary" />
          </div>
          <h1
            className="text-2xl md:text-3xl font-black text-foreground"
            style={{ fontFamily: FONT_CN }}
          >
            {t("feedbackTitle", lang)}
          </h1>
        </div>
        <p className="text-sm text-foreground/60 mb-8 ml-[52px]" style={{ fontFamily: FONT_CN }}>
          {t("feedbackDrives", lang)}
        </p>

        {!user ? (
          <div className="bg-card border border-border/50 rounded-xl p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-border/20 flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-7 h-7 text-muted-foreground/40" />
            </div>
            <p className="text-lg font-bold text-foreground/60 mb-2" style={{ fontFamily: FONT_CN }}>
              {t("pleaseLoginFirst", lang)}
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              {t("loginToSubmitFeedback", lang)}
            </p>
            <Link href="/login">
              <button className="bg-primary text-white font-bold px-6 py-2.5 rounded-lg hover:bg-primary/90 transition-colors">
                {t("goLogin", lang)}
              </button>
            </Link>
          </div>
        ) : submitted ? (
          <div className="bg-card border border-border/50 rounded-xl p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2" style={{ fontFamily: FONT_CN }}>
              {t("thankYouFeedback", lang)}
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              {t("willReviewFeedback", lang)}
            </p>
            <button
              onClick={() => { setSubmitted(false); setEmail(""); setMessage(""); setSubject(SUBJECT_OPTIONS[0].zh); }}
              className="text-primary font-bold text-sm hover:underline"
            >
              {t("submitAnother", lang)}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-card border border-border/50 rounded-xl p-6 md:p-8 space-y-5">
            <div>
              <label className="block text-sm font-bold text-foreground mb-1.5" style={{ fontFamily: FONT_CN }}>
                {t("yourEmail", lang)} <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="consumer-will@ggwl.com"
                className="w-full border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-foreground mb-1.5" style={{ fontFamily: FONT_CN }}>
                {t("feedbackType", lang)}
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              >
                {SUBJECT_OPTIONS.map((opt) => (
                  <option key={opt.zh} value={opt.zh}>
                    {en ? opt.en : opt.zh}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-foreground mb-1.5" style={{ fontFamily: FONT_CN }}>
                {t("yourMessage", lang)} <span className="text-red-500">*</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t("feedbackDetailPlaceholder", lang)}
                rows={6}
                className="w-full border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none"
                required
              />
            </div>

            {user && (
              <div className="bg-background/60 border border-border/30 rounded-lg px-4 py-3 text-xs text-muted-foreground">
                {t("submittingAs", lang)}
                <span className="font-bold text-foreground">{user.username}</span>
                {user.numericId && (
                  <span className="ml-2 text-muted-foreground">ID: {user.numericId}</span>
                )}
              </div>
            )}

            {error && (
              <p className="text-sm text-red-500 font-medium">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {submitting ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {submitting
                ? t("submitting", lang)
                : t("submitFeedback", lang)}
            </button>
          </form>
        )}
      </main>
      <Footer />
    </div>
  );
}
