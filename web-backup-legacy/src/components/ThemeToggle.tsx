"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  return (
    <div className="flex items-center gap-1 p-1 bg-white/5 rounded-lg border border-white/10">
      <button
        onClick={() => setTheme("light")}
        className={`p-2 rounded-md transition-colors ${
          theme === "light"
            ? "bg-white/10 text-amber-400"
            : "text-zinc-500 hover:text-zinc-300"
        }`}
        title="Light mode"
      >
        <Sun className="w-4 h-4" />
      </button>
      
      <button
        onClick={() => setTheme("dark")}
        className={`p-2 rounded-md transition-colors ${
          theme === "dark"
            ? "bg-white/10 text-violet-400"
            : "text-zinc-500 hover:text-zinc-300"
        }`}
        title="Dark mode"
      >
        <Moon className="w-4 h-4" />
      </button>
      
      <button
        onClick={() => setTheme("system")}
        className={`p-2 rounded-md transition-colors ${
          theme === "system"
            ? "bg-white/10 text-blue-400"
            : "text-zinc-500 hover:text-zinc-300"
        }`}
        title="System preference"
      >
        <Monitor className="w-4 h-4" />
      </button>
    </div>
  );
}
