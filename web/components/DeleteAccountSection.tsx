"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";
import { useTranslations } from "next-intl";

export function DeleteAccountSection() {
  const t = useTranslations("dashboard.settings");
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    if (confirmText !== "DELETE") {
      setError(t("deleteConfirmError"));
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/user/delete", { method: "DELETE" });
      
      if (res.ok) {
        router.push("/");
      } else {
        const data = await res.json();
        setError(data.error || t("deleteError"));
      }
    } catch {
      setError(t("deleteError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="glow-border rounded-2xl bg-red-500/5 border-red-500/20 p-6 mt-6">
      <div className="flex items-center gap-3 mb-6">
        <Trash2 className="w-5 h-5 text-red-400" />
        <h2 className="font-semibold text-gray-900 dark:text-white">{t("deleteAccountTitle")}</h2>
      </div>

      <p className="text-sm text-gray-500 dark:text-zinc-400 mb-4">
        {t("deleteAccountDesc")}
      </p>

      <ul className="text-sm text-gray-500 dark:text-zinc-500 space-y-1 mb-4 list-disc list-inside">
        <li>{t("deleteAllInstances")}</li>
        <li>{t("deleteAllData")}</li>
        <li>{t("cancelSubscription")}</li>
        <li>{t("cannotUndo")}</li>
      </ul>

      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="text-sm text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-500/50 bg-red-500/10 hover:bg-red-500/20 transition-colors px-4 py-2 rounded-lg"
        >
          {t("deleteAccountButton")}
        </button>
      ) : (
        <div className="space-y-4">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-300 font-medium mb-2">
                  {t("deleteConfirmTitle")}
                </p>
                <p className="text-sm text-gray-500 dark:text-zinc-400 mb-3">
                  {t("deleteConfirmDesc")}
                </p>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleDelete}
              disabled={loading}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors px-4 py-2 rounded-lg text-gray-900 dark:text-white font-medium"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t("deleting")}
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  {t("confirmDelete")}
                </>
              )}
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                setConfirmText("");
                setError("");
              }}
              disabled={loading}
              className="flex items-center gap-2 text-gray-500 dark:text-zinc-400 hover:text-white transition-colors px-4 py-2 rounded-lg"
            >
              <X className="w-4 h-4" />
              {t("cancel")}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
