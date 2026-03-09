import { prisma } from "@/lib/prisma";
import { Users, Bot, Activity } from "lucide-react";
import { STATUS_COLORS, PLANS, formatDate } from "@/lib/utils";

export default async function AdminPage() {
  const users = await prisma.user.findMany({
    include: { manager: true, instances: true },
    orderBy: { createdAt: "desc" },
  });

  const totalInstances = users.reduce((sum, u) => sum + u.instances.length, 0);
  const runningInstances = users.reduce(
    (sum, u) => sum + u.instances.filter((i) => i.status === "running").length,
    0
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Admin Panel</h1>
        <p className="text-zinc-400 mb-8">All users and their AI instances.</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="glow-border rounded-2xl p-5 bg-white/[0.02]">
            <Users className="w-5 h-5 text-violet-400 mb-3" />
            <div className="text-2xl font-bold">{users.length}</div>
            <div className="text-xs text-zinc-500 mt-1">Total users</div>
          </div>
          <div className="glow-border rounded-2xl p-5 bg-white/[0.02]">
            <Bot className="w-5 h-5 text-blue-400 mb-3" />
            <div className="text-2xl font-bold">{totalInstances}</div>
            <div className="text-xs text-zinc-500 mt-1">Total instances</div>
          </div>
          <div className="glow-border rounded-2xl p-5 bg-white/[0.02]">
            <Activity className="w-5 h-5 text-emerald-400 mb-3" />
            <div className="text-2xl font-bold">{runningInstances}</div>
            <div className="text-xs text-zinc-500 mt-1">Running now</div>
          </div>
        </div>

        {/* Users table */}
        <div className="glow-border rounded-2xl bg-white/[0.02] overflow-hidden">
          <div className="p-5 border-b border-white/5">
            <h2 className="font-semibold">Users</h2>
          </div>
          <div className="divide-y divide-white/5">
            {users.map((user) => (
              <div key={user.id} className="p-5 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-violet-600/30 flex items-center justify-center text-sm font-bold text-violet-300">
                      {user.name?.[0]?.toUpperCase() ?? "U"}
                    </div>
                    <div>
                      <div className="font-medium text-white">{user.name ?? "—"}</div>
                      <div className="text-sm text-zinc-500">{user.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-zinc-400">
                      {PLANS[user.plan as keyof typeof PLANS]?.label ?? user.plan} plan
                    </span>
                    <span className="text-zinc-600">·</span>
                    <span className="text-zinc-500">
                      Manager: {user.manager?.name ?? <span className="text-amber-400">Unassigned</span>}
                    </span>
                    <span className="text-zinc-600">·</span>
                    <span className="text-zinc-500">Joined {formatDate(user.createdAt)}</span>
                  </div>
                </div>

                {user.instances.length > 0 && (
                  <div className="ml-12 space-y-1.5">
                    {user.instances.map((inst) => (
                      <div key={inst.id} className="flex items-center gap-3 text-sm text-zinc-400">
                        <Bot className="w-3.5 h-3.5 text-zinc-600" />
                        <span className="truncate">{inst.name}</span>
                        <span className="text-zinc-600 capitalize">{inst.type}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[inst.status]}`}>
                          {inst.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {users.length === 0 && (
              <div className="p-12 text-center text-zinc-500 text-sm">No users yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
