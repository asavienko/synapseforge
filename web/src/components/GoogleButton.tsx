"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { analytics } from "@/lib/analytics";
import { useTranslations } from "next-intl";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.556 2.684-3.849 2.684-6.615z"/>
    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
    <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z"/>
  </svg>
);

interface GoogleButtonProps {
  callbackUrl?: string;
  /** Referral code to link after OAuth completes */
  referralCode?: string;
}

export function GoogleButton({ callbackUrl = "/dashboard", referralCode }: GoogleButtonProps) {
  const t = useTranslations("auth");
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    analytics.signupCompleted("google");
    // Encode referral code in the callbackUrl so the post-auth page can pick it up
    let finalCallbackUrl = callbackUrl;
    if (referralCode) {
      const sep = callbackUrl.includes("?") ? "&" : "?";
      finalCallbackUrl = `${callbackUrl}${sep}_ref=${encodeURIComponent(referralCode)}`;
    }
    await signIn("google", { callbackUrl: finalCallbackUrl });
    // Note: signIn with redirect will navigate away; loading resets if it stays
    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 bg-white hover:bg-zinc-100 disabled:opacity-50 transition-colors py-3 rounded-xl text-sm font-semibold text-zinc-800 border border-zinc-200"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin text-zinc-600" /> : <GoogleIcon />}
      {t("continueWithGoogle")}
    </button>
  );
}
