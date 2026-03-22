"use client";

import { useState, useEffect } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { NotificationCenter } from "@/components/NotificationCenter";
import { getInstances, getUnreadCount } from "@/lib/api";
import {
  HelixLogo,
  DashboardIcon,
  InstancesIcon,
  MessagesIcon,
  BillingIcon,
  SettingsIcon,
  IntegrationsIcon,
  ReferralsIcon,
  ShieldCheckIcon,
  UserIcon,
  BookOpenIcon,
  MenuIcon,
  CloseIcon,
  LogoutIcon,
} from "@/components/icons/BrandIcons";
import { Search } from "lucide-react";

interface SidebarProps {
  userName?: string | null;
  userEmail?: string | null;
  isAdmin?: boolean;
  isManager?: boolean;
}

interface InstanceHealth {
  id: string;
  healthStatus: string | null;
}

function HealthIndicator({ instances }: { instances: InstanceHealth[] }) {
  if (instances.length === 0) return null;
  
  const hasDown = instances.some(i => i.healthStatus === "down");
  const hasDegraded = instances.some(i => i.healthStatus === "degraded");
  const allHealthy = instances.every(i => i.healthStatus === "healthy");
  
  if (hasDown) {
    return <span className="w-2 h-2 rounded-full bg-red-500" title="Some instances are down" />;
  }
  if (hasDegraded) {
    return <span className="w-2 h-2 rounded-full bg-yellow-400" title="Some instances are degraded" />;
  }
  if (allHealthy) {
    return <span className="w-2 h-2 rounded-full bg-emerald-400" title="All instances healthy" />;
  }
  return null;
}

function NavItem({ href, icon: Icon, label, badge, healthIndicator, onClick }: { 
  href: string; 
  icon: React.ElementType; 
  label: string; 
  badge?: number; 
  healthIndicator?: React.ReactNode;
  onClick?: () => void 
}) {
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
      <span className="flex-1">{label}</span>
      {healthIndicator}
      {badge != null && badge > 0 && (
        <span className="bg-violet-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </Link>
  );
}

function ExternalNavItem({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-zinc-400 hover:text-white hover:bg-white/5"
    >
      <Icon className="w-4 h-4" />
      <span className="flex-1">{label}</span>
    </a>
  );
}

function SidebarContent({ userName, userEmail, unreadCount, isAdmin, isManager, onClose }: SidebarProps & { unreadCount: number; onClose?: () => void }) {
  const t = useTranslations("dashboard.nav");
  const [instanceHealth, setInstanceHealth] = useState<InstanceHealth[]>([]);

  // Fetch instance health for sidebar indicator
  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await getInstances();
        if (response.data) {
          setInstanceHealth(response.data.map((i: { id: string; healthStatus?: string | null }) => ({ 
            id: i.id, 
            healthStatus: i.healthStatus ?? null
          })));
        }
      } catch {
        // silently fail - health indicator is non-critical
      }
    };

    fetchHealth();
    // Poll every 30s to keep health status fresh
    const interval = setInterval(fetchHealth, 30_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2" onClick={onClose}>
          <HelixLogo className="w-5 h-5 text-violet-400" size={20} />
          <span className="font-bold text-sm tracking-tight text-white">OpenHelix AI</span>
        </Link>
        <div className="flex items-center gap-1">
          {!onClose && <NotificationCenter />}
          {onClose && (
            <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors md:hidden">
              <CloseIcon className="w-5 h-5" size={20} />
            </button>
          )}
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        <NavItem href="/dashboard" icon={DashboardIcon} label={t("overview")} onClick={onClose} />
        <NavItem 
          href="/dashboard/instances" 
          icon={InstancesIcon} 
          label={t("instances")} 
          healthIndicator={<HealthIndicator instances={instanceHealth} />}
          onClick={onClose} 
        />
        <NavItem href="/dashboard/messages" icon={MessagesIcon} label={t("messages")} badge={unreadCount} onClick={onClose} />
        <NavItem href="/dashboard/billing" icon={BillingIcon} label={t("billing")} onClick={onClose} />
        <NavItem href="/dashboard/integrations" icon={IntegrationsIcon} label={t("integrations")} onClick={onClose} />
        <NavItem href="/dashboard/referrals" icon={ReferralsIcon} label={t("referral")} onClick={onClose} />
        <NavItem href="/dashboard/settings" icon={SettingsIcon} label={t("settings")} onClick={onClose} />
        <ExternalNavItem href="/docs" icon={BookOpenIcon} label={t("apiDocs")} />
        {isManager && (
          <div className="pt-2 mt-2 border-t border-white/5">
            <NavItem href="/manager" icon={UserIcon} label={t("managerPortal")} onClick={onClose} />
          </div>
        )}
        {isAdmin && (
          <div className={isManager ? "mt-1" : "pt-2 mt-2 border-t border-white/5"}>
            <NavItem href="/admin" icon={ShieldCheckIcon} label={t("adminPanel")} onClick={onClose} />
          </div>
        )}
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
          <LogoutIcon className="w-3.5 h-3.5" />
          {t("signOut")}
        </button>

        {/* Command Palette Hint */}
        <button
          onClick={() => {
            // Dispatch custom event to open command palette
            window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));
          }}
          className="mt-2 flex items-center justify-between text-xs text-zinc-600 hover:text-zinc-400 transition-colors py-2 px-3 rounded-lg hover:bg-white/5 w-full border border-white/5 border-dashed"
        >
          <span>Command Palette</span>
          <kbd className="flex items-center gap-0.5 px-1.5 py-0.5 bg-white/5 rounded text-[10px]">
            <span>⌘</span><span>K</span>
          </kbd>
        </button>
      </div>
    </div>
  );
}

export function DashboardSidebar({ userName, userEmail, isAdmin, isManager }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Initial fetch of unread count
    getUnreadCount()
      .then((response: { data?: { count: number }; error?: string; status: number }) => 
        setUnreadCount(response.data?.count ?? 0)
      )
      .catch(() => {});

    // SSE: increment badge on new manager messages in real-time
    const es = new EventSource("/api/messages/stream");
    es.addEventListener("message", (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.senderType === "manager") {
          setUnreadCount((c) => c + 1);
        }
      } catch {
        // ignore parse errors
      }
    });
    return () => es.close();
  }, []);

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between px-4 h-14 border-b border-white/5 bg-[#0a0a0f] fixed top-0 left-0 right-0 z-40 safe-area-inset">
        <Link href="/" className="flex items-center gap-2">
          <HelixLogo className="w-5 h-5 text-violet-400" size={20} />
          <span className="font-bold text-sm tracking-tight text-white">OpenHelix AI</span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              // Dispatch custom event to open command palette
              window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));
            }}
            className="p-2 text-zinc-400 hover:text-white transition-colors"
            title="Command palette (Cmd+K)"
          >
            <Search className="w-5 h-5" />
          </button>
          <NotificationCenter />
          <button onClick={() => setMobileOpen(true)} className="text-zinc-400 hover:text-white transition-colors p-2 -mr-2">
            <MenuIcon className="w-5 h-5" size={20} />
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile drawer */}
      <div className={cn(
        "md:hidden fixed top-0 left-0 bottom-0 w-64 bg-[#0a0a0f] border-r border-white/5 z-50 transition-transform duration-200 safe-area-inset",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarContent userName={userName} userEmail={userEmail} unreadCount={unreadCount} isAdmin={isAdmin} isManager={isManager} onClose={() => setMobileOpen(false)} />
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 border-r border-white/5 flex-col shrink-0">
        <SidebarContent userName={userName} userEmail={userEmail} unreadCount={unreadCount} isAdmin={isAdmin} isManager={isManager} />
      </aside>
    </>
  );
}
