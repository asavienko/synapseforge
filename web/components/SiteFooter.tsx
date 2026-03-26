import { Link } from "@/i18n/navigation";
import { HelixLogo } from "@/components/icons/BrandIcons";
import { useTranslations } from "next-intl";

export function SiteFooter() {
  const t = useTranslations();

  return (
    <footer className="border-t border-gray-100 dark:border-white/[0.06] pt-12 pb-8 bg-white dark:bg-[#0a0a0f]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 mb-10">
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <HelixLogo className="w-5 h-5 text-blue-600 dark:text-blue-400" size={20} />
              <span className="font-bold text-[13px]">OpenHelix<span className="text-blue-600 dark:text-blue-400">.</span></span>
            </div>
            <p className="text-[12px] text-gray-400 dark:text-white/30 leading-relaxed max-w-xs">{t("footer.tagline")}</p>
          </div>
          {[
            { title: t("footer.colProduct"), links: [{ href: "/pricing", label: t("footer.pricing") }, { href: "/templates", label: t("footer.templates") }, { href: "/changelog", label: t("footer.changelog") }, { href: "/status", label: t("footer.status") }, { href: "/api-docs", label: t("footer.api") }] },
            { title: t("footer.colIntegrations"), links: [{ href: "/integrations/telegram", label: "Telegram" }, { href: "/integrations/whatsapp", label: "WhatsApp" }, { href: "/integrations/discord", label: "Discord" }, { href: "/integrations", label: t("footer.allIntegrations") }] },
            { title: t("footer.colUseCases"), links: [{ href: "/use-cases/ecommerce", label: t("footer.ecommerce") }, { href: "/use-cases/saas", label: t("footer.saas") }, { href: "/use-cases/healthcare", label: t("footer.healthcare") }, { href: "/use-cases", label: t("footer.allUseCases") }] },
            { title: t("footer.colResources"), links: [{ href: "/blog", label: t("nav.blog") }, { href: "/compare", label: t("footer.comparisons") }, { href: "/contact", label: t("nav.contact") }, { href: "/privacy", label: t("footer.privacy") }, { href: "/terms", label: t("footer.terms") }] },
          ].map((col) => (
            <div key={col.title}>
              <div className="text-[11px] font-medium text-gray-400 dark:text-white/30 uppercase tracking-[0.1em] mb-4">{col.title}</div>
              <ul className="space-y-2.5 text-[13px] text-gray-500 dark:text-white/45">
                {col.links.map((link) => (
                  <li key={link.href}><Link href={link.href} className="hover:text-gray-700 dark:hover:text-white/70 transition-colors">{link.label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 dark:border-white/[0.06] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-gray-400 dark:text-white/25">
          <span>{t("footer.copyright", { year: new Date().getFullYear() })}</span>
          <Link href="/status" className="flex items-center gap-1.5 hover:text-gray-500 dark:hover:text-white/40 transition-colors">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {t("footer.systemStatus")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
