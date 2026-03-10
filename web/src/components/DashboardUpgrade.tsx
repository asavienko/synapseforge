"use client";

import { useState } from "react";
import { X, Loader2, CheckCircle2, ArrowUpRight } from "lucide-react";

export function DashboardUpgrade({ currentPlan, hasManager }: { currentPlan: string; hasManager: boolean }) {
  const [open, setOpen] = useState(false);
  const [plan, setPlan] = useState("pro");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function submit() {
    setLoading(true);
    await fetch("/api/upgrade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestedPlan: plan, note }),
    });
    setLoading(false);
    setDone(true);
    setTimeout(() => { setDone(false); setOpen(false); setNote(""); }, 2500);
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="text-xs text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1 mt-0.5">
        Upgrade plan <ArrowUpRight className="w-3 h-3" />
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111118] border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-white">Request plan upgrade</h2>
              <button onClick={() => setOpen(false)} className="text-zinc-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            {done ? (
              <div className="text-center py-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                <p className="text-white font-semibold">Request sent!</p>
                <p className="text-zinc-400 text-sm mt-1">Your manager will reach out to you shortly.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">Upgrade to</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: "pro", label: "Pro", desc: "Up to 5 instances" },
                      { value: "enterprise", label: "Enterprise", desc: "Unlimited + SLA" },
                    ].map((p) => (
                      <button key={p.value} onClick={() => setPlan(p.value)}
                        className={`p-3 rounded-xl border text-left transition-all ${plan === p.value ? "border-violet-500 bg-violet-600/10" : "border-white/10 bg-white/[0.02] hover:border-white/20"}`}>
                        <div className="text-sm font-semibold text-white">{p.label}</div>
                        <div className="text-xs text-zinc-500">{p.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">Note for your manager (optional)</label>
                  <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3}
                    placeholder="Any specific requirements or questions..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors resize-none" />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setOpen(false)} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors px-4 py-3 rounded-xl text-sm font-semibold text-zinc-300">
                    Cancel
                  </button>
                  <button onClick={submit} disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 transition-colors px-4 py-3 rounded-xl text-sm font-semibold text-white">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Send request
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
