"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export function OnboardingToast() {
  const t = useTranslations("onboarding");

  useEffect(() => {
    const onboardingComplete = sessionStorage.getItem("onboardingComplete");
    if (onboardingComplete === "true") {
      toast.success(t("welcomeToast"), {
        duration: 6000,
        icon: "👋",
      });
      sessionStorage.removeItem("onboardingComplete");
    }
  }, [t]);

  return null;
}
