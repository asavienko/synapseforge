import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Bot, Zap, User, ArrowRight, Activity, MessageCircle, CheckCircle2, Circle } from "lucide-react";
import { PLANS, STATUS_COLORS, formatDate } from "@/lib/utils";
import { DashboardUpgrade } from "@/components/DashboardUpgrade";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      manager: true,
      instances: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });

  if (!user) return null;

  const plan = PLANS[user.plan as keyof typeof PLANS];
  const runningCount = user.instances.filter((i) => i.status === "running").length;
  const instanceLimit = plan.instances === -1 ? null : plan.instances;
  const instanceUsage = user.instances.length;
  const usagePct = instanceLimit ? Math.min((instanceUsage / instanceLimit) * 100, 100) : 0;

  // Check "getting started" steps
  const hasManager = !!user.manager;
  const hasConfiguredInstance = user.instances.some((i) => i.config);
  const hasApiKey = hasConfiguredInstance
    ? await prisma.apiKey.count({ where: { instance: { userId } } }) > 0
    : false;
  const hasMessage = hasManager
    ? await prisma.message.count({ where: { userId, senderType: "user" } }) > 0
    : false;
  const gettingStartedSteps = [
    { label: "Complete onboarding", done: true, href: null },
    { label: "Manager assigned to your account", done: hasManager, href: null },
    { label: "Configure your AI instance", done: hasConfiguredInstance, href: user.instances[0] ? `/dashboard/instances/${user.instances[0].id}` : "/dashboard/instances" },
    { label: "Generate an API key", done: hasApiKey, href: user.instances[0] ? `/dashboard/instances/${user.instances[0].id}?tab=keys` : "/dashboard/instances" },
    { label: "Message your manager", done: hasMessage, href: "/dashboard/messages" },
  ];
  const allDone = gettingStartedSteps.every((s) => s.done);

  // Recent activity across all instances
  const recentLogs = await prisma.activityLog.findMany({
    where: { instance: { userId } },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { instance: { select: { name: true } } },
  });

  const LOG_COLORS: Record<string, string> = {
    started: "text-emerald-400",
    stopped: "text-zinc-400",
    config_changed: "text-blue-400",
    key_generated: "text-violet-400",
    key_revoked: "text-red-400",
    created: "text-violet-400",
  };

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Good to see you, {user.name?.split(" ")[0]} 👋</h1>
        <p className="text-zinc-400 mt-1">Here&apos;s what&apos;s happening with your AI instances.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {/* Instances with progress bar */}
        <div className="glow-border rounded-2xl p-5 bg-white/[0.02]">
          <div className="flex items-center gap-3 mb-3">
            <Bot className="w-5 h-5 text-violet-400" />
            <span className="text-xs text-zinc-500 uppercase tracking-wider">Instances</span>
          </div>
          <div className="text-2xl font-bold text-white mb-2">{instanceUsage}</div>
          {instanceLimit ? (
            <>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-1">
                <div
                  className={`h-full rounded-full transition-all ${usagePct >= 100 ? "bg-red-500" : usagePct >= 75 ? "bg-amber-500" : "bg-violet-500"}`}
                  style={{ width: `${usagePct}%` }}
                />
              </div>
              <div className="text-xs text-zinc-500">{instanceUsage}/{instanceLimit} used</div>
            </>
          ) : (
            <div className="text-xs text-zinc-500">Unlimited</div>
          )}
        </div>

        <div className="glow-border rounded-2xl p-5 bg-white/[0.02]">
          <div className="flex items-center gap-3 mb-3">
            <Activity className="w-5 h-5 text-emerald-400" />
            <span className="text-xs text-zinc-500 uppercase tracking-wider">Running</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">{runningCount}</div>
          <div className="text-xs text-zinc-500">Active right now</div>
        </div>

        {/* Plan card with upgrade CTA */}
        <div className="glow-border rounded-2xl p-5 bg-white/[0.02]">
          <div className="flex items-center gap-3 mb-3">
            <Zap className="w-5 h-5 text-blue-400" />
            <span className="text-xs text-zinc-500 uppercase tracking-wider">Plan</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">{plan.label}</div>
          {user.plan === "free" && user.manager ? (
            <DashboardUpgrade currentPlan={user.plan} hasManager={true} />
          ) : (
            <div className="text-xs text-zinc-500">
              {user.plan === "free" ? "Manager being assigned…" : "Active subscription"}
            </div>
          )}
        </div>
      </div>

      {/* Manager card */}
      {user.manager ? (
        <div className="glow-border rounded-2xl p-5 bg-white/[0.02] mb-6 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-violet-600/30 border border-violet-500/30 flex items-center justify-center shrink-0">
            <User className="w-5 h-5 text-violet-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-zinc-500 mb-0.5">Your dedicated manager</div>
            <div className="font-semibold text-white">{user.manager.name}</div>
            <a href={`mailto:${user.manager.email}`} className="text-sm text-violet-400 hover:text-violet-300 transition-colors">
              {user.manager.email}
            </a>
          </div>
          <Link
            href="/dashboard/messages"
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2.5 rounded-xl transition-colors shrink-0"
          >
            <MessageCircle className="w-4 h-4" />
            Message
          </Link>
        </div>
      ) : (
        <div className="glow-border rounded-2xl p-5 bg-white/[0.02] mb-6 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
            <User className="w-5 h-5 text-zinc-500" />
          </div>
          <div>
            <div className="text-xs text-zinc-500 mb-0.5">Your dedicated manager</div>
            <div className="text-sm text-zinc-400">A manager will be assigned to your account soon.</div>
          </div>
        </div>
      )}

      {/* Getting started checklist — hide once all done */}
      {!allDone && (
        <div className="glow-border rounded-2xl bg-white/[0.02] mb-6 overflow-hidden">
          <div className="p-5 border-b border-white/5 flex items-center gap-3">
            <Zap className="w-4 h-4 text-violet-400" />
            <h2 className="font-semibold text-white text-sm">Getting started</h2>
            <span className="ml-auto text-xs text-zinc-500">
              {gettingStartedSteps.filter((s) => s.done).length}/{gettingStartedSteps.length} complete
            </span>
          </div>
          <div className="divide-y divide-white/5">
            {gettingStartedSteps.map((step) => {
              const content = (
                <div className="flex items-center gap-3 px-5 py-3">
                  {step.done ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-zinc-700 shrink-0" />
                  )}
                  <span className={`text-sm ${step.done ? "text-zinc-500 line-through" : "text-zinc-200"}`}>
                    {step.label}
                  </span>
                  {!step.done && step.href && (
                    <ArrowRight className="w-3.5 h-3.5 text-violet-400 ml-auto shrink-0" />
                  )}
                </div>
              );
              return step.href && !step.done ? (
                <Link key={step.label} href={step.href} className="block hover:bg-white/[0.03] transition-colors">
                  {content}
                </Link>
              ) : (
                <div key={step.label}>{content}</div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {/* Recent instances */}
        <div className="glow-border rounded-2xl bg-white/[0.02]">
          <div className="flex items-center justify-between p-5 border-b border-white/5">
            <h2 className="font-semibold text-white text-sm">AI Instances</h2>
            <Link href="/dashboard/instances" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {user.instances.length === 0 ? (
            <div className="p-8 text-center">
              <Bot className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
              <p className="text-zinc-500 text-sm">No instances yet.</p>
              <Link href="/dashboard/instances" className="text-violet-400 text-xs hover:text-violet-300 mt-1 inline-block">Create one →</Link>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {user.instances.map((instance) => (
                <Link key={instance.id} href={`/dashboard/instances/${instance.id}`}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
                  <Bot className="w-4 h-4 text-zinc-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white truncate">{instance.name}</div>
                    <div className="text-xs text-zinc-600">{instance.type}</div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[instance.status]}`}>{instance.status}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent activity */}
        <div className="glow-border rounded-2xl bg-white/[0.02]">
          <div className="p-5 border-b border-white/5">
            <h2 className="font-semibold text-white text-sm">Recent Activity</h2>
          </div>
          {recentLogs.length === 0 ? (
            <div className="p-8 text-center">
              <Activity className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
              <p className="text-zinc-500 text-sm">No activity yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {recentLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 px-5 py-3.5">
                  <span className={`text-sm mt-0.5 shrink-0 ${LOG_COLORS[log.event] ?? "text-zinc-400"}`}>●</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-zinc-200 capitalize">{log.event.replace(/_/g, " ")}</div>
                    <div className="text-xs text-zinc-600">{log.instance.name}</div>
                  </div>
                  <div className="text-xs text-zinc-600 shrink-0">{formatDate(log.createdAt)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
