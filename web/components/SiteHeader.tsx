import { Link } from "@/i18n/navigation";
import { HelixLogo } from "@/components/icons/BrandIcons";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MobileNav } from "@/components/MobileNav";
import { auth } from "@/lib/auth";
import { getTranslations } from "next-intl/server";

export async function SiteHeader() {
  const t = await getTranslations();
  const session = await auth().catch(() => null);
  const isLoggedIn = !!session?.user;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-white/[0.06] shadow-sm shadow-black/[0.02] dark:shadow-none">
      <div className="relative max-w-6xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
        {/* Left — Logo */}
        <Link href="/" className="flex items-center gap-2.5 h-9 shrink-0 group">
          <HelixLogo className="w-7 h-7 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-200" size={28} />
          <span className="font-bold text-[16px] tracking-tight hidden sm:block">OpenHelix<span className="text-blue-600 dark:text-blue-400">.</span></span>
        </Link>

        {/* Center — Nav links */}
        <div className="hidden lg:flex items-center h-10 gap-0.5 text-[13px] font-medium bg-gray-100/60 dark:bg-white/[0.04] rounded-full px-1.5 border border-gray-200/40 dark:border-white/[0.04] mx-auto whitespace-nowrap">
          <Link href="/pricing" className="flex items-center h-7 px-3.5 rounded-full text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/[0.08] hover:shadow-sm transition-all duration-200">{t("nav.pricing")}</Link>
          <Link href="/templates" className="flex items-center h-7 px-3.5 rounded-full text-gray-500 dark:text-white/45 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/[0.08] hover:shadow-sm transition-all duration-200">{t("nav.templates")}</Link>
          <Link href="/use-cases" className="flex items-center h-7 px-3.5 rounded-full text-gray-500 dark:text-white/45 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/[0.08] hover:shadow-sm transition-all duration-200">{t("nav.useCases")}</Link>
          <div className="w-px h-3.5 bg-gray-300/60 dark:bg-white/10 mx-1" />
          <Link href="/blog" className="flex items-center h-7 px-3.5 rounded-full text-gray-500 dark:text-white/45 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/[0.08] hover:shadow-sm transition-all duration-200">{t("nav.blog")}</Link>
          <Link href="/contact" className="flex items-center h-7 px-3.5 rounded-full text-gray-500 dark:text-white/45 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/[0.08] hover:shadow-sm transition-all duration-200">{t("nav.contact")}</Link>
        </div>

        {/* Right — Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <LocaleSwitcher />
          <ThemeToggle className="hover:bg-gray-100 dark:hover:bg-white/[0.08]" />
          <div className="hidden sm:block w-px h-4 bg-gray-200 dark:bg-white/10 mx-0.5" />
          {isLoggedIn ? (
            <Link href="/dashboard" className="flex items-center justify-center h-9 text-[13px] bg-blue-600 hover:bg-blue-700 text-white px-5 rounded-full font-semibold transition-colors shadow-sm shadow-blue-600/25">
              {t("nav.dashboard")}
            </Link>
          ) : (
            <>
              <Link href="/sign-in" className="hidden md:flex items-center justify-center h-9 text-[13px] text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white px-4 rounded-full hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-all font-medium">
                {t("nav.signIn")}
              </Link>
              <Link href="/sign-up" className="flex items-center justify-center h-9 text-[13px] bg-blue-600 hover:bg-blue-700 text-white px-5 rounded-full font-semibold transition-colors shadow-sm shadow-blue-600/25">
                <span className="hidden sm:inline">{t("nav.getStarted")}</span>
                <span className="sm:hidden">{t("nav.start")}</span>
              </Link>
            </>
          )}
          <MobileNav labels={{ services: t("nav.services"), pricing: t("nav.pricing"), about: t("nav.about"), contact: t("nav.contact"), signIn: t("nav.signIn"), demo: t("nav.demo"), templates: t("nav.templates"), useCases: t("nav.useCases"), blog: t("nav.blog") }} />
        </div>
      </div>
    </nav>
  );
}
