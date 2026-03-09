import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Bot, Zap, User, ArrowRight, Activity, MessageCircle } from "lucide-react";
import { PLANS, STATUS_COLORS, formatDate } from "@/lib/utils";

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

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          Good to see you, {user.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-zinc-400 mt-1">Here&apos;s what&apos;s happening with your AI instances.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          icon={Bot}
          label="Total Instances"
          value={user.instances.length}
          sub={plan.instances === -1 ? "Unlimited" : `${plan.instances - user.instances.length} remaining`}
          color="text-violet-400"
        />
        <StatCard
          icon={Activity}
          label="Running"
          value={runningCount}
          sub="Active right now"
          color="text-emerald-400"
        />
        <StatCard
          icon={Zap}
          label="Plan"
          value={plan.label}
          sub={
            user.plan === "free"
              ? "Contact manager to upgrade"
              : "Active subscription"
          }
          color="text-blue-400"
        />
      </div>

      {/* Manager card */}
      {user.manager ? (
        <div className="glow-border rounded-2xl p-5 bg-white/[0.02] mb-8 flex items-center gap-4">
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
        <div className="glow-border rounded-2xl p-5 bg-white/[0.02] mb-8 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
            <User className="w-5 h-5 text-zinc-500" />
          </div>
          <div>
            <div className="text-xs text-zinc-500 mb-0.5">Your dedicated manager</div>
            <div className="text-sm text-zinc-400">A manager will be assigned to your account soon.</div>
          </div>
        </div>
      )}

      {/* Recent instances */}
      <div className="glow-border rounded-2xl bg-white/[0.02]">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="font-semibold text-white">Your AI Instances</h2>
          <Link
            href="/dashboard/instances"
            className="text-sm text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {user.instances.length === 0 ? (
          <div className="p-12 text-center">
            <Bot className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-400 text-sm">No instances yet.</p>
            <Link href="/dashboard/instances" className="text-violet-400 text-sm hover:text-violet-300 transition-colors mt-1 inline-block">
              Create your first instance →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {user.instances.map((instance) => (
              <Link
                key={instance.id}
                href={`/dashboard/instances/${instance.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-zinc-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white text-sm truncate">{instance.name}</div>
                  <div className="text-xs text-zinc-500">{instance.type} · {instance.tier}</div>
                </div>
                <div className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[instance.status]}`}>
                  {instance.status}
                </div>
                <div className="text-xs text-zinc-600 hidden sm:block">{formatDate(instance.createdAt)}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub: string;
  color: string;
}) {
  return (
    <div className="glow-border rounded-2xl p-5 bg-white/[0.02]">
      <div className="flex items-center gap-3 mb-3">
        <Icon className={`w-5 h-5 ${color}`} />
        <span className="text-xs text-zinc-500 uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-xs text-zinc-500">{sub}</div>
    </div>
  );
}
