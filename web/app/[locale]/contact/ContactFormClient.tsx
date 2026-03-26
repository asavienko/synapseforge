"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { Loader2, CheckCircle2, Send } from "lucide-react";
import { useTranslations } from "next-intl";

export function ContactFormClient() {
  const t = useTranslations("contact");
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const SUBJECT_OPTIONS = [
    { value: "", label: t("subjectSelect") },
    { value: "general", label: t("subjectGeneral") },
    { value: "sales", label: t("subjectSales") },
    { value: "support", label: t("subjectSupport") },
    { value: "partnership", label: t("subjectPartnership") },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? t("errorGeneric"));
    } else {
      setSuccess(true);
    }
  }

  if (success) {
    return (
      <div className="glow-border rounded-2xl bg-white dark:bg-white/[0.02] p-8 md:p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{t("successTitle")}</h2>
        <p className="text-gray-500 dark:text-zinc-400 mb-6 max-w-sm mx-auto">{t("successDesc")}</p>
        <button
          onClick={() => {
            setSuccess(false);
            setForm({ name: "", email: "", subject: "", message: "" });
          }}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors text-sm"
        >
          {t("successReset")}
        </button>
      </div>
    );
  }

  return (
    <div className="glow-border rounded-2xl bg-white dark:bg-white/[0.02] p-5 sm:p-8 md:p-10">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t("formTitle")}</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
              {t("nameLabel")} *
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={t("namePlaceholder")}
              className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
              {t("emailLabel")} *
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder={t("emailPlaceholder")}
              className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
            {t("subjectLabel")} *
          </label>
          <select
            required
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors appearance-none cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 12px center",
              backgroundSize: "20px",
            }}
          >
            {SUBJECT_OPTIONS.map((option) => (
              <option
                key={option.value}
                value={option.value}
                className="bg-white dark:bg-[#0a0a0f] text-gray-900 dark:text-white"
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
            {t("messageLabel")} *
          </label>
          <textarea
            required
            rows={5}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder={t("messagePlaceholder")}
            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
          />
        </div>

        {error && (
          <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white font-semibold px-6 py-4 rounded-xl text-sm"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {t("sending")}
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              {t("send")}
            </>
          )}
        </button>

        <p className="text-center text-xs text-gray-500 dark:text-zinc-500">
          {t.rich("privacyNote", {
            privacy: (chunks) => (
              <Link href="/privacy" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                {chunks}
              </Link>
            ),
            terms: (chunks) => (
              <Link href="/terms" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                {chunks}
              </Link>
            ),
          })}
        </p>
      </form>
    </div>
  );
}
