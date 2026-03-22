"use client";

import { useState } from "react";
import { RotateCcw, Check } from "lucide-react";

export function RestartTourButton() {
  const [restarted, setRestarted] = useState(false);

  function handleRestart() {
    // Clear the tour seen flag
    localStorage.removeItem("synapseforge-tour-seen");
    setRestarted(true);
    
    // Reload to trigger the tour
    setTimeout(() => {
      window.location.reload();
    }, 500);
  }

  if (restarted) {
    return (
      <div className="flex items-center gap-2 text-emerald-400 text-sm">
        <Check className="w-4 h-4" />
        Restarting tour...
      </div>
    );
  }

  return (
    <button
      onClick={handleRestart}
      className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors px-4 py-2 rounded-lg"
    >
      <RotateCcw className="w-4 h-4" />
      Restart Product Tour
    </button>
  );
}
