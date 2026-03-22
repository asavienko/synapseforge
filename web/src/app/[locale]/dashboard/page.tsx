import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  InstancesIcon,
  HelixLogo,
  UserIcon,
  ArrowRightIcon,
  AnalyticsIcon,
  MessagesIcon,
  CheckIcon,
  CircleIcon,
  HeartIcon,
  GiftIcon,
  RocketLaunchIcon,
  KeyIcon,
  AIBrainIcon,
  BotIcon,
} from "@/components/icons/BrandIcons";
import { PLANS, STATUS_COLORS, formatDate } from "@/lib/utils";
import { DashboardUpgrade } from "@/components/DashboardUpgrade";
import { CalBookingButton } from "@/components/CalBookingButton";
import { DashboardRefresher } from "@/components/DashboardRefresher";
import { UsageDashboard } from "@/components/UsageDashboard";
import { RecentActivity } from "@/components/RecentActivity";
import { QuickSetupGuide } from "@/components/QuickSetupGuide";
import { getTranslations } from "next-intl/server";
import { captureServerEvent } from "@/lib/posthog-server";
import { OnboardingToast } from "@/components/OnboardingToast";
import { OnboardingChecklist } from "@/components/OnboardingChecklist";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id!;
  const t = await getTranslations("dashboard.overview");

  captureServerEvent(userId, "dashboard_visited").catch(() => {});

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

  // Get message counts per instance for the last 7 days
  // Using a fixed timestamp approach to avoid impure Date.now() during render
  const now = new Date();
  const sevenDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
  const msgCounts = user.instances.length > 0
    ? await prisma.chatMessage.groupBy({
        by: ['instanceId'],
        where: {
          instanceId: { in: user.instances.map(i => i.id) },
          createdAt: { gte: sevenDaysAgo },
          role: 'user', // count user messages = conversations
        },
        _count: { id: true },
      })
    : [];
  const msgCountMap = Object.fromEntries(msgCounts.map(r => [r.instanceId, r._count.id]));
  const weeklyConversations = msgCounts.reduce((sum, r) => sum + r._count.id, 0);

  // Check: has a channel integration
  const hasChannel = firstInstance
    ? await prisma.instanceCredential.count({
        where: {
          instanceId: firstInstance.id,
          key: { in: ["telegram_bot_token", "discord_bot_token", "slack_app_token", "slack_bot_token", "whatsapp_business_token"] },
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
    <div className="p-6 pt-14 md:p-8 md:pt-6">
      {/* Onboarding completion toast */}
      <OnboardingToast />
      
      {/* Live stats — refreshes every 30s and on window focus */}
      <DashboardRefresher />
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">{t("greeting", { name: user.name?.split(" ")[0] ?? "" })}</h1>
        <p className="text-zinc-400 mt-1">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <div className="glow-border rounded-2xl p-5 bg-white/[0.02]">
          <div className="flex items-center gap-3 mb-3">
            <InstancesIcon className="w-5 h-5 text-violet-400" />
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
            <AnalyticsIcon className="w-5 h-5 text-emerald-400" />
            <span className="text-xs text-zinc-500 uppercase tracking-wider">{t("runningLabel")}</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">{runningCount}</div>
          <div className="text-xs text-zinc-500">{t("activeNow")}</div>
        </div>

        <div className="glow-border rounded-2xl p-5 bg-white/[0.02]" data-testid="messages-stat">
          <div className="flex items-center gap-3 mb-3">
            <MessagesIcon className="w-5 h-5 text-pink-400" />
            <span className="text-xs text-zinc-500 uppercase tracking-wider">{t("messagesLabel")}</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">{totalChatMessages}</div>
          <div className="text-xs text-zinc-500">{t("allTimeMessages")}</div>
        </div>

        <div className="glow-border rounded-2xl p-5 bg-white/[0.02]">
          <div className="flex items-center gap-3 mb-3">
            <RocketLaunchIcon className="w-5 h-5 text-blue-400" />
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
            <HeartIcon className="w-5 h-5 text-rose-400" />
            <span className="text-xs text-zinc-500 uppercase tracking-wider">{t("systemHealth")}</span>
          </div>
          {monitoredInstances === 0 ? (
            <>
              <div className="text-2xl font-bold text-zinc-500 mb-1">—</div>
              <div className="text-xs text-zinc-600">{t("noHealthData")}</div>
            </>
          ) : allHealthy ? (
            <>
              <div className="text-lg font-bold text-emerald-400 mb-1 flex items-center gap-1.5">
                <span>✅</span> {t("operational")}
              </div>
              <div className="text-xs text-zinc-500">{t("instancesHealthy", { count: healthyInstances })}</div>
            </>
          ) : (
            <>
              <div className="text-lg font-bold text-amber-400 mb-1 flex items-center gap-1.5">
                <span>⚠️</span> {t("attention")}
              </div>
              <div className="text-xs text-zinc-500">
                {t("instancesNeedAttention", { count: needsAttention })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Weekly Summary Row */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <AnalyticsIcon className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs font-medium text-emerald-400">{runningCount} running</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20">
          <MessagesIcon className="w-3.5 h-3.5 text-violet-400" />
          <span className="text-xs font-medium text-violet-400">{weeklyConversations} msgs this week</span>
        </div>
      </div>

      {/* Quick Setup Guide for new users */}
      <QuickSetupGuide instances={instances} credentials={user.credentials || []} />

      <UsageDashboard />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <RecentActivity />
        {/* Placeholder for another widget */}
      </div>

      {user.manager ? (
        <div className="glow-border rounded-2xl p-5 bg-white/[0.02] mb-6 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-violet-600/30 border border-violet-500/30 flex items-center justify-center shrink-0">
            <UserIcon className="w-5 h-5 text-violet-400" />
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
              <MessagesIcon className="w-4 h-4" />
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
            <UserIcon className="w-5 h-5 text-zinc-500" />
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
            <HelixLogo className="w-4 h-4 text-violet-400" size={16} />
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
                    <CheckIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <CircleIcon className="w-4 h-4 text-zinc-700 shrink-0" />
                  )}
                  <span className={`text-sm ${step.done ? "text-zinc-500 line-through" : "text-zinc-200"}`}>
                    {label}
                  </span>
                  {!step.done && step.href && (
                    <ArrowRightIcon className="w-3.5 h-3.5 text-violet-400 ml-auto shrink-0" />
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glow-border rounded-2xl bg-white/[0.02]">
          <div className="flex items-center justify-between p-5 border-b border-white/5">
            <h2 className="font-semibold text-white text-sm">{t("aiInstances")}</h2>
            <Link href="/dashboard/instances" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors">
              {t("viewAll")} <ArrowRightIcon className="w-3 h-3" />
            </Link>
          </div>
          {user.instances.length === 0 ? (
            <div className="p-8 text-center">
              <BotIcon className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
              <p className="text-zinc-500 text-sm">{t("noInstancesYet")}</p>
              <Link href="/dashboard/instances" className="text-violet-400 text-xs hover:text-violet-300 mt-1 inline-block">{t("createOne")}</Link>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {user.instances.map((instance) => (
                <Link key={instance.id} href={`/dashboard/instances/${instance.id}`}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
                  <BotIcon className="w-4 h-4 text-zinc-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white truncate">{instance.name}</div>
                    <div className="text-xs text-zinc-500">{msgCountMap[instance.id] ?? 0} msgs this week · {instance.type}</div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[instance.status]}`}>{instance.status}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Referral CTA */}
        <Link href="/dashboard/referral" className="glow-border rounded-2xl p-5 bg-white/[0.02] flex items-center gap-4 hover:bg-white/[0.04] transition-colors group">
          <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/20 flex items-center justify-center shrink-0">
            <GiftIcon className="w-5 h-5 text-violet-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-white">{t("referralTitle")}</div>
            <div className="text-xs text-zinc-500 mt-0.5">{t("referralDesc")}</div>
          </div>
          <ArrowRightIcon className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-colors shrink-0" />
        </Link>

        <div className="glow-border rounded-2xl bg-white/[0.02]">
          <div className="p-5 border-b border-white/5">
            <h2 className="font-semibold text-white text-sm">{t("recentActivity")}</h2>
          </div>
          {recentLogs.length === 0 ? (
            <div className="p-8 text-center">
              <AnalyticsIcon className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
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
