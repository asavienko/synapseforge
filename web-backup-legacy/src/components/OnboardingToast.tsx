"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export function OnboardingToast() {
  useEffect(() => {
    // Check if user just completed onboarding
    const onboardingComplete = sessionStorage.getItem("onboardingComplete");
    if (onboardingComplete === "true") {
      // Show the toast notification
      toast.success("Welcome! Your manager will contact you soon.", {
        duration: 6000,
        icon: "👋",
      });
      // Clear the flag so it doesn't show again on refresh
      sessionStorage.removeItem("onboardingComplete");
    }
  }, []);

  return null; // This component doesn't render anything
}
