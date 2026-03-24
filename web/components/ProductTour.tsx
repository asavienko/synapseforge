"use client";

import { useEffect, useState } from "react";
import { X, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface TourStep {
  target: string;
  title: string;
  content: string;
  position: "top" | "bottom" | "left" | "right";
}

const TOUR_STEPS: TourStep[] = [
  {
    target: "[data-tour=\"instances\"]",
    title: "Your AI Instances",
    content: "Create and manage AI agents here. Each instance can handle conversations across multiple channels.",
    position: "bottom",
  },
  {
    target: "[data-tour=\"messages\"]",
    title: "Manager Messages",
    content: "Communicate with your dedicated AI manager for support and strategic guidance.",
    position: "bottom",
  },
  {
    target: "[data-tour=\"billing\"]",
    title: "Plan & Usage",
    content: "Monitor your usage and upgrade your plan as you grow.",
    position: "bottom",
  },
  {
    target: "[data-tour=\"command-palette\"]",
    title: "Quick Navigation",
    content: "Press Cmd+K (or Ctrl+K) anytime to jump between features instantly.",
    position: "bottom",
  },
];

export function ProductTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenTour, setHasSeenTour] = useState(true);

  useEffect(() => {
    // Check if user has seen the tour
    const seen = localStorage.getItem("synapseforge-tour-seen");
    if (!seen) {
      // Small delay to let the page render
      const timer = setTimeout(() => {
        setHasSeenTour(false);
        setIsOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  function closeTour() {
    setIsOpen(false);
    localStorage.setItem("synapseforge-tour-seen", "true");
  }

  function nextStep() {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      closeTour();
    }
  }

  function prevStep() {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }

  function skipTour() {
    closeTour();
  }

  if (!isOpen || hasSeenTour) return null;

  const step = TOUR_STEPS[currentStep];
  const isLastStep = currentStep === TOUR_STEPS.length - 1;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={skipTour} />

      {/* Spotlight (simplified - in production would highlight specific element) */}
      <div className="fixed inset-0 z-50 pointer-events-none">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 pointer-events-auto">
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6 w-80 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-violet-400" />
                </div>
                <span className="text-xs text-zinc-500">
                  Step {currentStep + 1} of {TOUR_STEPS.length}
                </span>
              </div>
              <button
                onClick={skipTour}
                className="p-1.5 text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
            <p className="text-sm text-zinc-400 mb-6">{step.content}</p>

            {/* Progress dots */}
            <div className="flex items-center justify-center gap-1.5 mb-6">
              {TOUR_STEPS.map((_, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    idx === currentStep ? "bg-violet-500" : "bg-white/20"
                  )}
                />
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className="flex items-center gap-1 text-sm text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>

              <button
                onClick={nextStep}
                className="flex items-center gap-1 bg-violet-600 hover:bg-violet-500 transition-colors px-4 py-2 rounded-lg text-sm font-semibold text-white"
              >
                {isLastStep ? "Get Started" : "Next"}
                {!isLastStep && <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
