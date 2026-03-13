import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Bot, Zap, User, ArrowRight, Activity, MessageCircle, MessageSquare, CheckCircle2, Circle, Heart } from "lucide-react";
import { PLANS, STATUS_COLORS, formatDate } from "@/lib/utils";
import { DashboardUpgrade } from "@/components/DashboardUpgrade";
import { CalBookingButton } from "@/components/CalBookingButton";
import { getTranslations } from "next-intl/server";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id!;
  const t = await getTranslations("dashboard.overview");

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

  const hasManager = !!user.manager;
  const firstInstance = user.instances[0] ?? null;

  // Check: has at least one LLM credential across any instance
  const hasLLMKey = firstInstance
    ? await prisma.instanceCredential.count({
        where: {
          instanceId: firstInstance.id,
          key: { in: ["openai_api_key", "anthropic_api_key", "openrouter_api_key"] },
        },
      }) > 0
    : false;

  // Check: has a deployed (or provisioning) instance
  const hasDeployedInstance = user.instances.some(
    (i) => i.provisionStatus === "ready" || i.provisionStatus === "provisioning"
  );
  const deployedInstance = user.instances.find(
    (i) => i.provisionStatus === "ready" || i.provisionStatus === "provisioning"
  );

  // System health aggregation
  const instancesWithHealth = user.instances;
  const healthyInstances = instancesWithHealth.filter((i) => i.healthStatus === "healthy").length;
  const degradedInstances = instancesWithHealth.filter((i) => i.healthStatus === "degraded").length;
  const downInstances = instancesWithHealth.filter((i) => i.healthStatus === "down").length;
  const monitoredInstances = instancesWithHealth.filter((i) => i.healthStatus !== null).length;
  const allHealthy = monitoredInstances > 0 && degradedInstances === 0 && downInstances === 0;
  const needsAttention = degradedInstances + downInstances;

  // Aggregate chat message count across all user instances (use ChatMessage — source of truth)
  const totalChatMessages = user.instances.length > 0
    ? await prisma.chatMessage.count({
        where: { instanceId: { in: user.instances.map((i) => i.id) } },
      })
    : 0;

  // Check: has a channel integration
  const hasChannel = firstInstance
    ? await prisma.instanceCredential.count({
        where: {
          instanceId: firstInstance.id,
          key: { in: ["telegram_bot_token", "discord_bot_token", "slack_app_token", "slack_bot_token"] },
        },
      }) > 0
    : false;

  const gettingStartedSteps = [
    {
      key: "accountCreated",
      done: true,
      href: null,
    },
    {
      key: "addLLMKey",
      done: hasLLMKey,
      href: firstInstance ? `/dashboard/instances/${firstInstance.id}` : "/dashboard/instances",
    },
    {
      key: "deployInstance",
      done: hasDeployedInstance,
      href: (deployedInstance ?? firstInstance)
        ? `/dashboard/instances/${(deployedInstance ?? firstInstance)!.id}`
        : "/dashboard/instances",
    },
    {
      key: "connectChannel",
      done: hasChannel,
      href: firstInstance ? `/dashboard/instances/${firstInstance.id}` : "/dashboard/instances",
    },
    {
      key: "managerAssigned",
      done: hasManager,
      href: null,
    },
  ];
  const allDone = gettingStartedSteps.every((s) => s.done);

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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">{t("greeting", { name: user.name?.split(" ")[0] ?? "" })}</h1>
        <p className="text-zinc-400 mt-1">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <div className="glow-border rounded-2xl p-5 bg-white/[0.02]">
          <div className="flex items-center gap-3 mb-3">
            <Bot className="w-5 h-5 text-violet-400" />
            <span className="text-xs text-zinc-500 uppercase tracking-wider">{t("instancesLabel")}</span>
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
              <div className="text-xs text-zinc-500">{t("usedSlots", { used: instanceUsage, limit: instanceLimit })}</div>
            </>
          ) : (
            <div className="text-xs text-zinc-500">{t("unlimited")}</div>
          )}
        </div>

        <div className="glow-border rounded-2xl p-5 bg-white/[0.02]">
          <div className="flex items-center gap-3 mb-3">
            <Activity className="w-5 h-5 text-emerald-400" />
            <span className="text-xs text-zinc-500 uppercase tracking-wider">{t("runningLabel")}</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">{runningCount}</div>
          <div className="text-xs text-zinc-500">{t("activeNow")}</div>
        </div>

        <div className="glow-border rounded-2xl p-5 bg-white/[0.02]" data-testid="messages-stat">
          <div className="flex items-center gap-3 mb-3">
            <MessageSquare className="w-5 h-5 text-pink-400" />
            <span className="text-xs text-zinc-500 uppercase tracking-wider">{t("messagesLabel")}</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">{totalChatMessages}</div>
          <div className="text-xs text-zinc-500">{t("allTimeMessages")}</div>
        </div>

        <div className="glow-border rounded-2xl p-5 bg-white/[0.02]">
          <div className="flex items-center gap-3 mb-3">
            <Zap className="w-5 h-5 text-blue-400" />
            <span className="text-xs text-zinc-500 uppercase tracking-wider">{t("planLabel")}</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">{plan.label}</div>
          {user.plan === "free" && user.manager ? (
            <DashboardUpgrade currentPlan={user.plan} hasManager={true} />
          ) : (
            <div className="text-xs text-zinc-500">
              {user.plan === "free" ? t("managerBeingAssigned") : t("activeSubscription")}
            </div>
          )}
        </div>

        <div className="glow-border rounded-2xl p-5 bg-white/[0.02]">
          <div className="flex items-center gap-3 mb-3">
            <Heart className="w-5 h-5 text-rose-400" />
            <span className="text-xs text-zinc-500 uppercase tracking-wider">System Health</span>
          </div>
          {monitoredInstances === 0 ? (
            <>
              <div className="text-2xl font-bold text-zinc-500 mb-1">—</div>
              <div className="text-xs text-zinc-600">No data yet</div>
            </>
          ) : allHealthy ? (
            <>
              <div className="text-lg font-bold text-emerald-400 mb-1 flex items-center gap-1.5">
                <span>✅</span> Operational
              </div>
              <div className="text-xs text-zinc-500">{healthyInstances} instance{healthyInstances !== 1 ? "s" : ""} healthy</div>
            </>
          ) : (
            <>
              <div className="text-lg font-bold text-amber-400 mb-1 flex items-center gap-1.5">
                <span>⚠️</span> Attention
              </div>
              <div className="text-xs text-zinc-500">
                {needsAttention} instance{needsAttention !== 1 ? "s" : ""} need{needsAttention === 1 ? "s" : ""} attention
              </div>
            </>
          )}
        </div>
      </div>

      {user.manager ? (
        <div className="glow-border rounded-2xl p-5 bg-white/[0.02] mb-6 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-violet-600/30 border border-violet-500/30 flex items-center justify-center shrink-0">
            <User className="w-5 h-5 text-violet-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-zinc-500 mb-0.5">{t("dedicatedManager")}</div>
            <div className="font-semibold text-white">{user.manager.name}</div>
            <a href={`mailto:${user.manager.email}`} className="text-sm text-violet-400 hover:text-violet-300 transition-colors">
              {user.manager.email}
            </a>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/dashboard/messages"
              className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2.5 rounded-xl transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">{t("messageBtn")}</span>
            </Link>
            {user.manager.calLink && (
              <CalBookingButton calLink={user.manager.calLink} variant="compact" label="Book a call" />
            )}
          </div>
        </div>
      ) : (
        <div className="glow-border rounded-2xl p-5 bg-white/[0.02] mb-6 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
            <User className="w-5 h-5 text-zinc-500" />
          </div>
          <div>
            <div className="text-xs text-zinc-500 mb-0.5">{t("dedicatedManager")}</div>
            <div className="text-sm text-zinc-400">{t("managerSoon")}</div>
          </div>
        </div>
      )}

      {!allDone && (
        <div className="glow-border rounded-2xl bg-white/[0.02] mb-6 overflow-hidden">
          <div className="p-5 border-b border-white/5 flex items-center gap-3">
            <Zap className="w-4 h-4 text-violet-400" />
            <h2 className="font-semibold text-white text-sm">{t("gettingStarted")}</h2>
            <span className="ml-auto text-xs text-zinc-500">
              {t("complete", { done: gettingStartedSteps.filter((s) => s.done).length, total: gettingStartedSteps.length })}
            </span>
          </div>
          <div className="divide-y divide-white/5">
            {gettingStartedSteps.map((step) => {
              const label = t(`steps.${step.key}` as Parameters<typeof t>[0]);
              const content = (
                <div className="flex items-center gap-3 px-5 py-3">
                  {step.done ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-zinc-700 shrink-0" />
                  )}
                  <span className={`text-sm ${step.done ? "text-zinc-500 line-through" : "text-zinc-200"}`}>
                    {label}
                  </span>
                  {!step.done && step.href && (
                    <ArrowRight className="w-3.5 h-3.5 text-violet-400 ml-auto shrink-0" />
                  )}
                </div>
              );
              return step.href && !step.done ? (
                <Link key={step.key} href={step.href} className="block hover:bg-white/[0.03] transition-colors">
                  {content}
                </Link>
              ) : (
                <div key={step.key}>{content}</div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div className="glow-border rounded-2xl bg-white/[0.02]">
          <div className="flex items-center justify-between p-5 border-b border-white/5">
            <h2 className="font-semibold text-white text-sm">{t("aiInstances")}</h2>
            <Link href="/dashboard/instances" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors">
              {t("viewAll")} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {user.instances.length === 0 ? (
            <div className="p-8 text-center">
              <Bot className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
              <p className="text-zinc-500 text-sm">{t("noInstancesYet")}</p>
              <Link href="/dashboard/instances" className="text-violet-400 text-xs hover:text-violet-300 mt-1 inline-block">{t("createOne")}</Link>
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

        <div className="glow-border rounded-2xl bg-white/[0.02]">
          <div className="p-5 border-b border-white/5">
            <h2 className="font-semibold text-white text-sm">{t("recentActivity")}</h2>
          </div>
          {recentLogs.length === 0 ? (
            <div className="p-8 text-center">
              <Activity className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
              <p className="text-zinc-500 text-sm">{t("noActivityYet")}</p>
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
