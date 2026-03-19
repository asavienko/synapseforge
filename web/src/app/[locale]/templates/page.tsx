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
  Sparkles,
  Zap,
  Users,
  Bot,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "AI Agent Templates | OpenHelix AI",
  description:
    "Browse 10+ pre-built AI agent templates. Deploy customer support bots, sales assistants, content creators, and more in minutes. No coding required.",
  keywords: [
    "AI agent templates",
    "chatbot templates",
    "customer support bot",
    "sales assistant AI",
    "AI automation",
  ],
  openGraph: {
    title: "AI Agent Templates | OpenHelix AI",
    description:
      "Deploy pre-built AI agents in minutes. Browse our template gallery.",
    type: "website",
  },
};

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
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* ── Hero Section ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-violet-600/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 pt-20 pb-16 relative">
          <div className="text-center max-w-3xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-medium mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              10+ Pre-Built Templates
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Deploy AI Agents{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-blue-400">
                in Minutes
              </span>
            </h1>

            <p className="text-lg md:text-xl text-zinc-400 mb-8 leading-relaxed">
              Browse our library of pre-built agent templates. From customer
              support to sales automation — deploy production-ready AI agents
              without writing a single line of code.
            </p>

            {!isLoggedIn && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/sign-up"
                  className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 transition-all px-6 py-3 rounded-xl font-semibold shadow-lg shadow-violet-500/20"
                >
                  Get Started Free
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <p className="text-sm text-zinc-500">
                  No credit card required
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Stats Bar ─────────────────────────────────────────────────── */}
      <section className="border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 text-sm">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-violet-400" />
              <span className="text-zinc-400">
                <span className="text-white font-semibold">10+</span> Templates
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-violet-400" />
              <span className="text-zinc-400">
                <span className="text-white font-semibold">500+</span> Deployed
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-violet-400" />
              <span className="text-zinc-400">
                <span className="text-white font-semibold">24/7</span> Ready
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Search & Filter ───────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <form className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              name="q"
              defaultValue={searchQuery}
              placeholder="Search templates..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
            />
          </form>

          {/* Category Filter */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            <Filter className="w-4 h-4 text-zinc-500 shrink-0" />
            <Link
              href="/templates"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                !selectedCategory
                  ? "bg-violet-600 text-white"
                  : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
              }`}
            >
              All
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/templates?category=${cat.id}`}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? "bg-violet-600 text-white"
                    : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Active filters */}
        {(searchQuery || selectedCategory) && (
          <div className="flex items-center gap-2 mt-4 text-sm">
            <span className="text-zinc-500">Active filters:</span>
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-violet-500/10 text-violet-300 border border-violet-500/20">
                Search: &ldquo;{searchQuery}&rdquo;
                <Link
                  href={
                    selectedCategory
                      ? `/templates?category=${selectedCategory}`
                      : "/templates"
                  }
                  className="hover:text-white"
                >
                  ×
                </Link>
              </span>
            )}
            {selectedCategory && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-violet-500/10 text-violet-300 border border-violet-500/20">
                Category: {selectedCategory}
                <Link
                  href={searchQuery ? `/templates?q=${searchQuery}` : "/templates"}
                  className="hover:text-white"
                >
                  ×
                </Link>
              </span>
            )}
            <Link
              href="/templates"
              className="text-zinc-500 hover:text-zinc-300 underline"
            >
              Clear all
            </Link>
          </div>
        )}
      </section>

      {/* ── Templates Grid ────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        {displayedTemplates.length === 0 ? (
          <div className="text-center py-20">
            <Bot className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              No templates found
            </h3>
            <p className="text-zinc-400 text-sm">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedTemplates.map((template) => {
              const IconComponent = getIconComponent(template.iconComponent);
              return (
                <Link
                  key={template.id}
                  href={`/templates/${template.id}`}
                  className="group relative"
                >
                  <div className="glow-border rounded-2xl p-6 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300 h-full flex flex-col">
                    {/* Badges */}
                    <div className="flex items-center gap-2 mb-4">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium border ${
                          categoryColors[template.category]
                        }`}
                      >
                        {template.category}
                      </span>
                      {template.popular && (
                        <span className="text-xs px-2 py-1 rounded-full font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Popular
                        </span>
                      )}
                    </div>

                    {/* Icon */}
                    <div className="w-12 h-12 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-2xl">{template.icon}</span>
                    </div>

                    {/* Content */}
                    <h3 className="font-semibold text-white mb-2 group-hover:text-violet-300 transition-colors">
                      {template.name}
                    </h3>
                    <p className="text-sm text-zinc-400 mb-4 flex-1 line-clamp-2">
                      {template.shortDescription}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium border ${
                          difficultyColors[template.difficulty]
                        }`}
                      >
                        {template.difficulty}
                      </span>
                      <span className="text-sm text-violet-400 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                        Use Template
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Results count */}
        <p className="text-center text-sm text-zinc-500 mt-8">
          Showing {displayedTemplates.length} of {agentTemplates.length}{" "}
          templates
        </p>
      </section>

      {/* ── CTA Section ───────────────────────────────────────────────── */}
      {!isLoggedIn && (
        <section className="max-w-7xl mx-auto px-6 pb-20">
          <div className="rounded-2xl border border-violet-500/30 bg-violet-600/10 p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-transparent pointer-events-none" />

            <h2 className="text-2xl md:text-3xl font-bold mb-4 relative">
              Ready to deploy your first AI agent?
            </h2>
            <p className="text-zinc-400 mb-8 max-w-lg mx-auto relative">
              Join thousands of businesses using OpenHelix AI to automate their
              workflows with AI agents.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative">
              <Link
                href="/sign-up"
                className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 transition-colors px-8 py-4 rounded-xl font-semibold"
              >
                Start Building Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="text-zinc-400 hover:text-white transition-colors"
              >
                Talk to Sales →
              </Link>
            </div>

            <p className="text-zinc-600 text-sm mt-4 relative">
              Free tier includes 1 agent, 1,000 messages/month
            </p>
          </div>
        </section>
      )}

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-violet-400" />
            <span className="font-semibold text-zinc-400">OpenHelix AI</span>
            <span>© 2026</span>
          </div>
          <div className="flex gap-6">
            <Link
              href="/privacy"
              className="hover:text-white transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="hover:text-white transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/contact"
              className="hover:text-white transition-colors"
            >
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
