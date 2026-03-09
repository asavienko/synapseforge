import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Zap, LayoutDashboard, Bot, Settings, LogOut } from "lucide-react";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 flex flex-col">
        <div className="p-6 border-b border-white/5">
          <Link href="/" className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-violet-400" />
            <span className="font-bold text-sm tracking-tight text-white">SynapseForge</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <NavItem href="/dashboard" icon={LayoutDashboard} label="Overview" />
          <NavItem href="/dashboard/instances" icon={Bot} label="Instances" />
          <NavItem href="/dashboard/settings" icon={Settings} label="Settings" />
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-xs font-bold text-white">
              {session.user.name?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">{session.user.name}</div>
              <div className="text-xs text-zinc-500 truncate">{session.user.email}</div>
            </div>
          </div>
          <Link
            href="/api/auth/signout"
            className="flex items-center gap-2 text-xs text-zinc-500 hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-white/5 w-full"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

function NavItem({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
    >
      <Icon className="w-4 h-4" />
      {label}
    </Link>
  );
}
