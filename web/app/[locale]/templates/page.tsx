import { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import {
  agentTemplates,
  categories,
  difficultyColors,
  categoryColors,
  searchTemplates,
  type AgentTemplate,
  type Category,
  getIconComponent,
} from "@/lib/templates";
import {
  Search,
  Filter,
  ArrowRight,
  Bot,
} from "lucide-react";
import {
  ArrowRightIcon,
  SparklesIcon,
} from "@/components/icons/BrandIcons";
import { FadeInView } from "@/components/animations/FadeInView";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("templatesPage");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDescription"),
      type: "website",
    },
  };
}

export default async function TemplatesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const t = await getTranslations();
  const session = await auth().catch(() => null);
  const isLoggedIn = !!session?.user;

  const params = await searchParams;
  const searchQuery = typeof params.q === "string" ? params.q : "";
  const selectedCategory =
    typeof params.category === "string" ? (params.category as Category) : null;

  let displayedTemplates: AgentTemplate[] = agentTemplates;

  if (searchQuery) {
    displayedTemplates = searchTemplates(searchQuery);
  }

  if (selectedCategory) {
    displayedTemplates = displayedTemplates.filter(
      (t) => t.category === selectedCategory
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0f] text-gray-900 dark:text-[#f5f5f7]">
      <SiteHeader />

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Ambient glow orbs */}
        <div className="glow-orb absolute -top-20 left-1/4 w-72 h-72 bg-blue-500/20 dark:bg-blue-500/10" />
        <div className="glow-orb absolute -top-10 right-1/4 w-56 h-56 bg-violet-500/15 dark:bg-violet-500/8" style={{ animationDelay: "5s" }} />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20 md:pt-28 pb-12 text-center">
          <div className="glass-badge mb-6 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20 bg-blue-50/80 dark:bg-blue-500/10">
            <SparklesIcon className="w-3.5 h-3.5" size={14} />
            <span className="text-[12px] font-medium">10+ Pre-Built Templates</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-[56px] font-bold tracking-tight mb-5 leading-[1.1]">
            Deploy AI Agents{" "}
            <span className="gradient-text">in Minutes</span>
          </h1>

          <p className="text-[17px] text-gray-500 dark:text-white/55 max-w-lg mx-auto mb-8 leading-relaxed">
            Browse our library of pre-built agent templates. From customer
            support to sales automation — deploy production-ready AI agents
            without writing a single line of code.
          </p>

          {!isLoggedIn && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
              <Link
                href="/sign-up"
                className="glass-btn-primary w-full sm:w-auto flex items-center justify-center gap-2 text-white px-7 py-3.5 font-semibold text-[15px]"
              >
                Get Started Free <ArrowRightIcon className="w-4 h-4" />
              </Link>
              <p className="text-[12px] text-gray-400 dark:text-white/30">
                No credit card required
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── Trust Bar ─────────────────────────────────────────────────── */}
      <section className="border-y border-gray-100 dark:border-white/[0.06] py-5 bg-gray-50/50 dark:bg-white/[0.01]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-[13px]">
            {[
              { value: "10+", label: "Templates" },
              { value: "500+", label: "Deployed" },
              { value: "24/7", label: "Ready" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-lg font-bold text-gray-900 dark:text-white">{item.value}</span>
                <span className="text-gray-400 dark:text-white/35">{item.label}</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-500 text-sm">{"\u2713"}</span>
              <span className="text-gray-400 dark:text-white/35">No code required</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Search & Filter ───────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <FadeInView direction="up">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <form className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/30" />
              <input
                type="text"
                name="q"
                defaultValue={searchQuery}
                placeholder="Search templates..."
                className="w-full glass-surface rounded-xl pl-10 pr-4 py-2.5 text-[13px] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
              />
            </form>

            {/* Category Filter */}
            <div className="flex items-center gap-1.5 flex-wrap md:flex-nowrap overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
              <Filter className="w-3.5 h-3.5 text-gray-400 dark:text-white/30 shrink-0 mr-1" />
              <Link
                href="/templates"
                className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap transition-all ${
                  !selectedCategory
                    ? "glass-btn-primary text-white shadow-sm"
                    : "glass-btn-secondary text-gray-500 dark:text-white/45"
                }`}
              >
                All
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/templates?category=${cat.id}`}
                  className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? "glass-btn-primary text-white shadow-sm"
                      : "glass-btn-secondary text-gray-500 dark:text-white/45"
                  }`}
                >
                  {cat.label}
                </Link>
              ))}
            </div>
          </div>
        </FadeInView>

        {/* Active filters */}
        {(searchQuery || selectedCategory) && (
          <div className="flex flex-wrap items-center gap-2 mt-4 text-[12px]">
            <span className="text-gray-400 dark:text-white/30">Filters:</span>
            {searchQuery && (
              <span className="glass-badge text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20 bg-blue-50/80 dark:bg-blue-500/10 py-1 px-2.5">
                &ldquo;{searchQuery}&rdquo;
                <Link
                  href={
                    selectedCategory
                      ? `/templates?category=${selectedCategory}`
                      : "/templates"
                  }
                  className="hover:text-blue-800 dark:hover:text-white ml-1"
                >
                  &times;
                </Link>
              </span>
            )}
            {selectedCategory && (
              <span className="glass-badge text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20 bg-blue-50/80 dark:bg-blue-500/10 py-1 px-2.5">
                {selectedCategory}
                <Link
                  href={searchQuery ? `/templates?q=${searchQuery}` : "/templates"}
                  className="hover:text-blue-800 dark:hover:text-white ml-1"
                >
                  &times;
                </Link>
              </span>
            )}
            <Link
              href="/templates"
              className="text-gray-400 dark:text-white/30 hover:text-gray-600 dark:hover:text-white/60 underline"
            >
              Clear all
            </Link>
          </div>
        )}
      </section>

      {/* ── Templates Grid ────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        {displayedTemplates.length === 0 ? (
          <FadeInView direction="up">
            <div className="glass-card text-center py-20 px-6">
              <Bot className="w-10 h-10 text-gray-300 dark:text-white/20 mx-auto mb-4" />
              <h3 className="text-[16px] font-semibold text-gray-900 dark:text-white mb-2">
                No templates found
              </h3>
              <p className="text-gray-500 dark:text-white/45 text-[13px] mb-6">
                Try adjusting your search or filters
              </p>
              <Link
                href="/templates"
                className="glass-btn-secondary inline-flex items-center gap-2 px-5 py-2.5 text-[13px] font-medium text-gray-600 dark:text-white/60"
              >
                Clear Filters
              </Link>
            </div>
          </FadeInView>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {displayedTemplates.map((template, i) => {
              const IconComponent = getIconComponent(template.iconComponent);
              return (
                <FadeInView key={template.id} direction="up" delay={i * 50}>
                  <Link
                    href={`/templates/${template.id}`}
                    className="group block h-full"
                  >
                    <div className="glass-card glow-border p-5 h-full flex flex-col">
                      {/* Header: Icon + Badges */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200/50 dark:border-blue-500/15 flex items-center justify-center">
                          <span className="text-xl">{template.icon}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[11px] px-2 py-0.5 rounded-full font-medium border ${
                              categoryColors[template.category]
                            }`}
                          >
                            {template.category}
                          </span>
                          {template.popular && (
                            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/15">
                              Popular
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <h3 className="font-semibold text-[14px] mb-1.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {template.name}
                      </h3>
                      <p className="text-[12px] text-gray-500 dark:text-white/45 flex-1 line-clamp-2">
                        {template.shortDescription}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-white/[0.06]">
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded-full font-medium border ${
                            difficultyColors[template.difficulty]
                          }`}
                        >
                          {template.difficulty}
                        </span>
                        <span className="text-[12px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                          Use <ArrowRightIcon className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </FadeInView>
              );
            })}
          </div>
        )}

        {/* Results count */}
        <p className="text-center text-[12px] text-gray-400 dark:text-white/30 mt-8">
          Showing {displayedTemplates.length} of {agentTemplates.length}{" "}
          templates
        </p>
      </section>

      {/* ── CTA Section ───────────────────────────────────────────────── */}
      {!isLoggedIn && (
        <section className="relative overflow-hidden bg-gray-50/60 dark:bg-white/[0.015] py-20">
          {/* Subtle ambient glow */}
          <div className="glow-orb absolute bottom-0 left-1/3 w-64 h-64 bg-blue-500/15 dark:bg-blue-500/8" />
          <div className="glow-orb absolute top-0 right-1/4 w-48 h-48 bg-violet-500/10 dark:bg-violet-500/5" style={{ animationDelay: "7s" }} />

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
            <FadeInView direction="up">
              <div className="glass-card p-10 sm:p-14 text-center max-w-2xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
                  Ready to deploy your first{" "}
                  <span className="gradient-text">AI agent</span>?
                </h2>
                <p className="text-gray-500 dark:text-white/45 text-[15px] mb-8">
                  Join thousands of businesses using OpenHelix AI to automate their
                  workflows with AI agents.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    href="/sign-up"
                    className="glass-btn-primary w-full sm:w-auto flex items-center justify-center gap-2 text-white px-7 py-3.5 font-semibold text-[15px]"
                  >
                    Start Building Free <ArrowRightIcon className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/contact"
                    className="glass-btn-secondary flex items-center justify-center gap-2 px-5 py-3.5 font-medium text-[14px] text-gray-600 dark:text-white/60"
                  >
                    Talk to Sales <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <p className="text-[12px] text-gray-400 dark:text-white/30 mt-5">
                  Free tier includes 1 agent, 1,000 messages/month
                </p>
              </div>
            </FadeInView>
          </div>
        </section>
      )}

      <SiteFooter />
    </div>
  );
}
