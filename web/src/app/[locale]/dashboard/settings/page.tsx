import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { User, Shield, Zap } from "lucide-react";
import { PLANS } from "@/lib/utils";
import { ProfileForm } from "@/components/ProfileForm";
import { DashboardUpgrade } from "@/components/DashboardUpgrade";
import { getTranslations } from "next-intl/server";

export default async function SettingsPage() {
  const session = await auth();
  const userId = session!.user!.id!;
  const t = await getTranslations("dashboard.settingsPage");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { manager: true },
  });

  if (!user) return null;

  const plan = PLANS[user.plan as keyof typeof PLANS];

  return (
    <div className="p-4 pt-14 md:p-8 md:pt-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-8">{t("title")}</h1>

      <section className="glow-border rounded-2xl bg-white/[0.02] p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-5 h-5 text-violet-400" />
          <h2 className="font-semibold text-white">{t("profileSection")}</h2>
        </div>
        <ProfileForm initialName={user.name ?? ""} email={user.email} />
      </section>

      <section className="glow-border rounded-2xl bg-white/[0.02] p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <Zap className="w-5 h-5 text-blue-400" />
          <h2 className="font-semibold text-white">{t("planSection")}</h2>
        </div>
        <div className="flex items-center justify-between p-4 rounded-xl bg-violet-600/10 border border-violet-500/20">
          <div>
            <div className="font-semibold text-white">{plan.label}</div>
            <div className="text-sm text-zinc-400">
              {plan.instances === -1
                ? t("unlimitedInstances")
                : t("upToInstances", { n: plan.instances })}{" "}
              · {t("tierLabel", { tier: plan.tier })}
            </div>
          </div>
          {user.plan === "free" && (
            <div className="text-xs text-violet-300 bg-violet-600/20 border border-violet-500/30 px-3 py-1.5 rounded-lg">
              {t("upgradeByRequest")}
            </div>
          )}
        </div>
        {user.plan === "free" && user.manager && (
          <div className="mt-4 flex items-center gap-3">
            <DashboardUpgrade currentPlan={user.plan} hasManager={true} />
            <span className="text-sm text-zinc-500">or email{" "}
              <a href="mailto:hello@openhelixai.com" className="text-violet-400 hover:text-violet-300 transition-colors">
                hello@openhelixai.com
              </a>
            </span>
          </div>
        )}
        {user.plan === "free" && !user.manager && (
          <p className="text-sm text-zinc-500 mt-3">
            {t("managerWillBeAssigned")}{" "}
            <a href="mailto:hello@openhelixai.com" className="text-violet-400 hover:text-violet-300 transition-colors">
              hello@openhelixai.com
            </a>
          </p>
        )}
      </section>

      <section className="glow-border rounded-2xl bg-white/[0.02] p-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-5 h-5 text-emerald-400" />
          <h2 className="font-semibold text-white">{t("managerSection")}</h2>
        </div>
        {user.manager ? (
          <div className="grid gap-4">
            <Field label={t("nameFieldLabel")} value={user.manager.name} />
            <Field label={t("emailFieldLabel")} value={user.manager.email} />
          </div>
        ) : (
          <p className="text-sm text-zinc-400">{t("managerSoon")}</p>
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
