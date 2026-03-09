import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { User, Shield, Zap } from "lucide-react";
import { PLANS } from "@/lib/utils";

export default async function SettingsPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { manager: true },
  });

  if (!user) return null;

  const plan = PLANS[user.plan as keyof typeof PLANS];

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-8">Settings</h1>

      {/* Profile */}
      <section className="glow-border rounded-2xl bg-white/[0.02] p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-5 h-5 text-violet-400" />
          <h2 className="font-semibold text-white">Profile</h2>
        </div>
        <div className="grid gap-4">
          <Field label="Name" value={user.name ?? "—"} />
          <Field label="Email" value={user.email} />
        </div>
      </section>

      {/* Plan */}
      <section className="glow-border rounded-2xl bg-white/[0.02] p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <Zap className="w-5 h-5 text-blue-400" />
          <h2 className="font-semibold text-white">Plan</h2>
        </div>
        <div className="flex items-center justify-between p-4 rounded-xl bg-violet-600/10 border border-violet-500/20">
          <div>
            <div className="font-semibold text-white">{plan.label}</div>
            <div className="text-sm text-zinc-400">
              {plan.instances === -1 ? "Unlimited instances" : `Up to ${plan.instances} instance(s)`} · {plan.tier} tier
            </div>
          </div>
          {user.plan === "free" && (
            <div className="text-xs text-violet-300 bg-violet-600/20 border border-violet-500/30 px-3 py-1.5 rounded-lg">
              Upgrade by request
            </div>
          )}
        </div>
        {user.plan === "free" && (
          <p className="text-sm text-zinc-500 mt-3">
            To upgrade your plan, contact your assigned manager or reach out at{" "}
            <a href="mailto:hello@synapseforge.ai" className="text-violet-400 hover:text-violet-300 transition-colors">
              hello@synapseforge.ai
            </a>
          </p>
        )}
      </section>

      {/* Manager */}
      <section className="glow-border rounded-2xl bg-white/[0.02] p-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-5 h-5 text-emerald-400" />
          <h2 className="font-semibold text-white">Your Manager</h2>
        </div>
        {user.manager ? (
          <div className="grid gap-4">
            <Field label="Name" value={user.manager.name} />
            <Field label="Email" value={user.manager.email} />
          </div>
        ) : (
          <p className="text-sm text-zinc-400">
            A dedicated manager will be assigned to your account shortly. They&apos;ll reach out to help you get started.
          </p>
        )}
      </section>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">{label}</div>
      <div className="text-sm text-zinc-300 bg-white/5 border border-white/10 rounded-lg px-4 py-3">{value}</div>
    </div>
  );
}
