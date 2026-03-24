"use client";

import { useState } from "react";
import { Copy, Check, Code, Palette, MessageSquare } from "lucide-react";

interface EmbedTabProps {
  instanceId: string;
  instanceName: string;
  referralCode?: string;
}

export function EmbedTab({ instanceId, instanceName, referralCode }: EmbedTabProps) {
  const [copied, setCopied] = useState(false);
  const [position, setPosition] = useState<"bottom-right" | "bottom-left">("bottom-right");
  const [color, setColor] = useState("#8b5cf6");
  const [greeting, setGreeting] = useState(`Hi! I'm ${instanceName}. How can I help you today?`);
  const [showBranding, setShowBranding] = useState(true);

  const embedCode = `<!-- OpenHelix AI AI Chat Widget -->
<script 
  src="${typeof window !== 'undefined' ? window.location.origin : ''}/widget.js"
  data-instance-id="${instanceId}"
  data-position="${position}"
  data-color="${color}"
  data-greeting="${greeting}"
  data-branding="${showBranding}"${referralCode ? `\n  data-ref="${referralCode}"` : ''}></script>
<!-- End OpenHelix AI AI Chat Widget -->`.trim();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glow-border rounded-2xl bg-white/[0.02] overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
              <Code className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Embed Code</h3>
              <p className="text-xs text-zinc-500">Add AI chat to any website with one line of code</p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Embed Code Block */}
          <div className="relative">
            <pre className="bg-zinc-900/50 border border-white/10 rounded-xl p-4 text-xs text-zinc-300 font-mono overflow-x-auto">
              {embedCode}
            </pre>
            <button
              onClick={copyToClipboard}
              className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-white transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Customization */}
      <div className="glow-border rounded-2xl bg-white/[0.02] overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
              <Palette className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Customize</h3>
              <p className="text-xs text-zinc-500">Match your brand</p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Position */}
          <div>
            <label className="text-xs text-zinc-400 mb-2 block">Position</label>
            <div className="flex gap-2">
              <button
                onClick={() => setPosition("bottom-right")}
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  position === "bottom-right"
                    ? "bg-violet-600 text-white"
                    : "bg-white/5 text-zinc-400 hover:bg-white/10"
                }`}
              >
                Bottom Right
              </button>
              <button
                onClick={() => setPosition("bottom-left")}
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  position === "bottom-left"
                    ? "bg-violet-600 text-white"
                    : "bg-white/5 text-zinc-400 hover:bg-white/10"
                }`}
              >
                Bottom Left
              </button>
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="text-xs text-zinc-400 mb-2 block">Brand Color</label>
            <div className="flex gap-2">
              {["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#000000"].map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-lg border-2 transition-colors ${
                    color === c ? "border-white" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Greeting */}
          <div>
            <label className="text-xs text-zinc-400 mb-2 block">Greeting Message</label>
            <input
              type="text"
              value={greeting}
              onChange={(e) => setGreeting(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors"
              placeholder="How can I help you today?"
            />
          </div>

          {/* Branding */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400">Show &quot;Powered by OpenHelix AI&quot;</span>
            <button
              onClick={() => setShowBranding(!showBranding)}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                showBranding ? "bg-violet-600" : "bg-white/10"
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  showBranding ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="glow-border rounded-2xl bg-white/[0.02] overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
              <MessageSquare className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">How to Install</h3>
              <p className="text-xs text-zinc-500">Add to your website HTML</p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-3">
          <ol className="text-sm text-zinc-400 space-y-2 list-decimal list-inside">
            <li>Copy the embed code above</li>
            <li>Paste it before the closing <code>&lt;/body&gt;</code> tag in your HTML</li>
            <li>The chat widget will appear on your site</li>
            <li>Customize colors and greeting to match your brand</li>
          </ol>

          <div className="mt-4 p-3 bg-violet-600/10 border border-violet-500/20 rounded-lg">
            <p className="text-xs text-violet-300">
              <strong>Pro tip:</strong> The widget works on any website - WordPress, Shopify, 
              React, Vue, or plain HTML. No coding required!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
