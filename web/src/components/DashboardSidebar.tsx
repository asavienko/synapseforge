"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, LayoutDashboard, Bot, Settings, LogOut, Menu, X } from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  userName?: string | null;
  userEmail?: string | null;
}

function NavItem({ href, icon: Icon, label, onClick }: { href: string; icon: React.ElementType; label: string; onClick?: () => void }) {
  const pathname = usePathname();
  const isActive = href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
        isActive
          ? "bg-violet-600/20 text-white border border-violet-500/20"
          : "text-zinc-400 hover:text-white hover:bg-white/5"
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
    </Link>
  );
}

function SidebarContent({ userName, userEmail, onClose }: SidebarProps & { onClose?: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2" onClick={onClose}>
          <Zap className="w-5 h-5 text-violet-400" />
          <span className="font-bold text-sm tracking-tight text-white">SynapseForge</span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors md:hidden">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-1">
        <NavItem href="/dashboard" icon={LayoutDashboard} label="Overview" onClick={onClose} />
        <NavItem href="/dashboard/instances" icon={Bot} label="Instances" onClick={onClose} />
        <NavItem href="/dashboard/settings" icon={Settings} label="Settings" onClick={onClose} />
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-xs font-bold text-white">
            {userName?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">{userName}</div>
            <div className="text-xs text-zinc-500 truncate">{userEmail}</div>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-2 text-xs text-zinc-500 hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-white/5 w-full"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign out
        </button>
      </div>
    </div>
  );
}

export function DashboardSidebar({ userName, userEmail }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between px-4 h-14 border-b border-white/5 bg-[#0a0a0f] fixed top-0 left-0 right-0 z-40">
        <Link href="/" className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-violet-400" />
          <span className="font-bold text-sm tracking-tight text-white">SynapseForge</span>
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          className="text-zinc-400 hover:text-white transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={cn(
          "md:hidden fixed top-0 left-0 bottom-0 w-64 bg-[#0a0a0f] border-r border-white/5 z-50 transition-transform duration-200",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent userName={userName} userEmail={userEmail} onClose={() => setMobileOpen(false)} />
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 border-r border-white/5 flex-col shrink-0">
        <SidebarContent userName={userName} userEmail={userEmail} />
      </aside>
    </>
  );
}
