"use client";

import { useEffect, useState } from "react";
import { Command, X, Search, Bell, Plus, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface Shortcut {
  keys: string[];
  description: string;
  icon?: React.ElementType;
}

const SHORTCUTS: Shortcut[] = [
  { keys: ["⌘", "K"], description: "Open command palette", icon: Search },
  { keys: ["?"], description: "Show keyboard shortcuts" },
  { keys: ["Esc"], description: "Close modal / Cancel" },
  { keys: ["N"], description: "New instance" },
  { keys: ["M"], description: "Open messages" },
  { keys: ["B"], description: "Open billing" },
  { keys: [","], description: "Open settings", icon: Settings },
];

export function KeyboardShortcutsModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Show modal on "?" press (but not when typing in inputs)
      if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
          return;
        }
        e.preventDefault();
        setIsOpen(true);
      }

      // Close on Escape
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#12121a] border border-white/10 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
              <Command className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h2 className="font-semibold text-white">Keyboard Shortcuts</h2>
              <p className="text-xs text-zinc-500">Press ? anytime to show this</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">
          <div className="space-y-3">
            {SHORTCUTS.map((shortcut) => (
              <div
                key={shortcut.description}
                className="flex items-center justify-between py-2"
              >
                <div className="flex items-center gap-3">
                  {shortcut.icon && (
                    <shortcut.icon className="w-4 h-4 text-zinc-500" />
                  )}
                  <span className="text-sm text-zinc-300">{shortcut.description}</span>
                </div>
                <div className="flex items-center gap-1">
                  {shortcut.keys.map((key) => (
                    <kbd
                      key={key}
                      className={cn(
                        "px-2 py-1 text-xs font-medium rounded",
                        key.length > 1
                          ? "bg-white/10 text-zinc-300"
                          : "bg-white/5 text-zinc-400 border border-white/10"
                      )}
                    >
                      {key}
                    </kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-5 py-4 border-t border-white/5 bg-white/[0.02] rounded-b-2xl">
          <p className="text-xs text-zinc-500 text-center">
            Tip: Shortcuts work anywhere except when typing in text fields
          </p>
        </div>
      </div>
    </div>
  );
}
