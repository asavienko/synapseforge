"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Command, Bot, Settings, CreditCard, Gift, MessageSquare, FileText, Sparkles, Zap } from "lucide-react";
import { useAnalytics } from "@/components/AnalyticsProvider";
import { useTranslations } from "next-intl";

interface CommandItem {
  id: string;
  label: string;
  shortcut?: string;
  icon: React.ReactNode;
  action: () => void;
  keywords: string[];
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const { track } = useAnalytics();
  const t = useTranslations("commandPalette");

  const commands: CommandItem[] = [
    {
      id: "instances",
      label: t("goToInstances"),
      shortcut: "G I",
      icon: <Bot className="w-4 h-4" />,
      action: () => { router.push("/dashboard/instances"); setIsOpen(false); },
      keywords: ["instances", "bots", "agents", "ai"],
    },
    {
      id: "new-instance",
      label: t("createInstance"),
      shortcut: "N I",
      icon: <Sparkles className="w-4 h-4" />,
      action: () => { router.push("/dashboard/instances"); setIsOpen(false); },
      keywords: ["create", "new", "instance", "bot", "agent"],
    },
    {
      id: "templates",
      label: t("browseTemplates"),
      icon: <FileText className="w-4 h-4" />,
      action: () => { router.push("/templates"); setIsOpen(false); },
      keywords: ["templates", "examples", "starters"],
    },
    {
      id: "settings",
      label: t("settings"),
      shortcut: "G S",
      icon: <Settings className="w-4 h-4" />,
      action: () => { router.push("/dashboard/settings"); setIsOpen(false); },
      keywords: ["settings", "profile", "account"],
    },
    {
      id: "billing",
      label: t("billing"),
      shortcut: "G B",
      icon: <CreditCard className="w-4 h-4" />,
      action: () => { router.push("/dashboard/billing"); setIsOpen(false); },
      keywords: ["billing", "payment", "plan", "subscription", "upgrade"],
    },
    {
      id: "referrals",
      label: t("referrals"),
      icon: <Gift className="w-4 h-4" />,
      action: () => { router.push("/dashboard/referrals"); setIsOpen(false); },
      keywords: ["referrals", "invite", "credits", "rewards"],
    },
    {
      id: "messages",
      label: t("messages"),
      icon: <MessageSquare className="w-4 h-4" />,
      action: () => { router.push("/dashboard/messages"); setIsOpen(false); },
      keywords: ["messages", "chat", "support", "manager"],
    },
    {
      id: "api-docs",
      label: t("apiDocs"),
      icon: <Zap className="w-4 h-4" />,
      action: () => { router.push("/api-docs"); setIsOpen(false); },
      keywords: ["api", "docs", "documentation", "developers"],
    },
    {
      id: "home",
      label: t("goHome"),
      icon: <Command className="w-4 h-4" />,
      action: () => { router.push("/"); setIsOpen(false); },
      keywords: ["home", "landing", "website"],
    },
  ];

  const filteredCommands = commands.filter((cmd) => {
    const query = search.toLowerCase();
    return (
      cmd.label.toLowerCase().includes(query) ||
      cmd.keywords.some((k) => k.includes(query))
    );
  });

  // Reset selection when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to open
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
        track("command_palette_opened", { source: "keyboard_shortcut" });
      }

      // Escape to close
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }

      if (!isOpen) return;

      // Navigate with arrows
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filteredCommands.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      }

      // Enter to select
      if (e.key === "Enter" && filteredCommands[selectedIndex]) {
        e.preventDefault();
        const cmd = filteredCommands[selectedIndex];
        track("command_palette_selected", { command: cmd.id, label: cmd.label });
        cmd.action();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, track]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={() => setIsOpen(false)}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4">
        <div className="w-full max-w-lg bg-[#1a1a1f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-4 border-b border-white/5">
            <Search className="w-5 h-5 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("placeholder")}
              className="flex-1 bg-transparent text-white placeholder-zinc-500 outline-none text-sm"
              autoFocus
            />
            <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 bg-white/5 rounded text-xs text-zinc-500">
              <span>ESC</span>
            </kbd>
          </div>

          {/* Commands list */}
          <div className="max-h-[400px] overflow-y-auto py-2">
            {filteredCommands.length === 0 ? (
              <div className="px-4 py-8 text-center text-zinc-500 text-sm">
                {t("noResults")}
              </div>
            ) : (
              <div className="px-2">
                {filteredCommands.map((cmd, index) => (
                  <button
                    key={cmd.id}
                    onClick={() => {
                      track("command_palette_selected", { command: cmd.id, label: cmd.label, source: "click" });
                      cmd.action();
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full flex items-center justify-between gap-3 px-3 py-3 rounded-xl text-left transition-colors ${
                      index === selectedIndex
                        ? "bg-violet-500/10 border border-violet-500/20"
                        : "hover:bg-white/[0.02]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        index === selectedIndex ? "text-violet-400" : "text-zinc-500"
                      }`}>
                        {cmd.icon}
                      </div>
                      <span className={`text-sm ${
                        index === selectedIndex ? "text-white" : "text-zinc-300"
                      }`}>
                        {cmd.label}
                      </span>
                    </div>
                    {cmd.shortcut && (
                      <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 bg-white/5 rounded text-xs text-zinc-500">
                        {cmd.shortcut.split(" ").map((key, i) => (
                          <span key={i}>{i > 0 && <span className="mx-0.5">+</span>}{key}</span>
                        ))}
                      </kbd>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-white/5 flex items-center justify-between text-xs text-zinc-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white/5 rounded">↑↓</kbd> {t("navigate")}
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white/5 rounded">↵</kbd> {t("select")}
              </span>
            </div>
            <span>{filteredCommands.length} {t("commands")}</span>
          </div>
        </div>
      </div>
    </>
  );
}
