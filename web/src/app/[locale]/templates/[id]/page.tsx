import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import {
  getTemplateById,
  agentTemplates,
  difficultyColors,
  categoryColors,
  getIconComponent,
} from "@/lib/templates";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  Sparkles,
  Zap,
  ExternalLink,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { getTranslations } from "next-intl/server";

interface Props {
  params: Promise<{ id: string; locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const template = getTemplateById(id);

  if (!template) {
    return {
      title: "Template Not Found | SynapseForge",
    };
  }

  return {
    title: `${template.name} | AI Agent Template | SynapseForge`,
    description: template.description,
    keywords: [...template.tags, "AI agent", "template", "chatbot"],
    openGraph: {
      title: template.name,
      description: template.shortDescription,
      type: "article",
    },
  };
}

export async function generateStaticParams() {
  return agentTemplates.map((t) => ({
    id: t.id,
    locale: "en",
  }));
}

export default async function TemplateDetailPage({ params }: Props) {
  const { id, locale } = await params;
  const template = getTemplateById(id);
  const t = await getTranslations();
  const session = await auth().catch(() => null);
  const isLoggedIn = !!session?.user;

  if (!template) {
    notFound();
  }

  const IconComponent = getIconComponent(template.iconComponent);

  // Get related templates (same category, excluding current)
  const relatedTemplates = agentTemplates
    .filter((t) => t.category === template.category && t.id !== template.id)
    .slice(0, 3);

  // Truncate system prompt for preview
  const promptPreview =
    template.systemPrompt.slice(0, 500) +
    (template.systemPrompt.length > 500 ? "..." : "");

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* ── Navigation ────────────────────────────────────────────────── */}
      <nav className="border-b border-white/5 backdrop-blur-sm sticky top-0 z-50 bg-[#0a0a0f]/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/templates"
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Templates
          </Link>

          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-violet-400" />
            <span className="font-bold">SynapseForge</span>
          </div>

          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="text-sm bg-violet-600 hover:bg-violet-500 transition-colors px-4 py-2 rounded-lg font-medium"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/sign-up"
              className="text-sm bg-violet-600 hover:bg-violet-500 transition-colors px-4 py-2 rounded-lg font-medium"
            >
              Get Started
            </Link>
          )}
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-600/10 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 pt-16 pb-12">
          <div className="max-w-4xl">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm text-zinc-500 mb-6">
              <Link href="/templates" className="hover:text-white transition-colors">
                Templates
              </Link>
              <span>/</span>
              <Link
                href={`/templates?category=${template.category}`}
                className="hover:text-white transition-colors"
              >
                {template.category}
              </Link>
              <span>/</span>
              <span className="text-white">{template.name}</span>
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2 mb-6">
              <span
                className={`text-xs px-3 py-1.5 rounded-full font-medium border ${
                  categoryColors[template.category]
                }`}
              >
                {template.category}
              </span>
              <span
                className={`text-xs px-3 py-1.5 rounded-full font-medium border ${
                  difficultyColors[template.difficulty]
                }`}
              >
                {template.difficulty}
              </span>
              {template.popular && (
                <span className="text-xs px-3 py-1.5 rounded-full font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Popular
                </span>
              )}
            </div>

            {/* Title & Icon */}
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                <span className="text-4xl">{template.icon}</span>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  {template.name}
                </h1>
                <p className="text-lg text-zinc-400">{template.shortDescription}</p>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-8">
              {template.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-3 py-1 rounded-full bg-white/5 text-zinc-400 border border-white/10"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={
                  isLoggedIn
                    ? `/dashboard/instances?template=${template.id}`
                    : `/sign-up?template=${template.id}`
                }
                className="inline-flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 transition-all px-8 py-4 rounded-xl font-semibold text-lg shadow-lg shadow-violet-500/20"
              >
                <Zap className="w-5 h-5" />
                Deploy This Template
                <ArrowRight className="w-5 h-5" />
              </Link>
              {!isLoggedIn && (
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 border border-white/10 hover:border-white/20 transition-colors px-8 py-4 rounded-xl font-semibold text-lg text-zinc-300"
                >
                  Talk to Sales
                  <ExternalLink className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Content ───────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Description & Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="glow-border rounded-2xl p-8 bg-white/[0.02]">
              <h2 className="text-xl font-semibold mb-4">About This Template</h2>
              <p className="text-zinc-300 leading-relaxed whitespace-pre-line">
                {template.description}
              </p>
            </div>

            {/* Use Cases */}
            <div className="glow-border rounded-2xl p-8 bg-white/[0.02]">
              <h2 className="text-xl font-semibold mb-6">Common Use Cases</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {template.useCases.map((useCase, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/5"
                  >
                    <div className="w-6 h-6 rounded-full bg-violet-600/20 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 text-violet-400" />
                    </div>
                    <span className="text-zinc-300 text-sm">{useCase}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* System Prompt Preview */}
            <div className="glow-border rounded-2xl p-8 bg-white/[0.02]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">System Prompt Preview</h2>
                <span className="text-xs text-zinc-500">
                  {template.systemPrompt.length} characters
                </span>
              </div>
              <p className="text-sm text-zinc-500 mb-4">
                This is the instruction that defines how your AI agent behaves.
                You can customize it after deployment.
              </p>
              <div className="relative">
                <pre className="bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-zinc-300 overflow-x-auto max-h-64 font-mono">
                  {promptPreview}
                </pre>
                <button
                  className="absolute top-3 right-3 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                  title="Copy to clipboard"
                  onClick={() => {
                    navigator.clipboard.writeText(template.systemPrompt);
                  }}
                >
                  <Copy className="w-4 h-4 text-zinc-400" />
                </button>
              </div>
            </div>

            {/* Suggested Channels */}
            <div className="glow-border rounded-2xl p-8 bg-white/[0.02]">
              <h2 className="text-xl font-semibold mb-4">Suggested Channels</h2>
              <p className="text-sm text-zinc-500 mb-4">
                This agent works great on these platforms:
              </p>
              <div className="flex flex-wrap gap-3">
                {template.suggestedChannels.map((channel) => (
                  <span
                    key={channel}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600/10 text-violet-300 border border-violet-500/20 text-sm"
                  >
                    <span>{getChannelEmoji(channel)}</span>
                    {channel}
                  </span>
                ))}
              </div>
            </div>

            {/* Model Recommendation */}
            <div className="glow-border rounded-2xl p-8 bg-white/[0.02]">
              <h2 className="text-xl font-semibold mb-4">Recommended Model</h2>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="w-12 h-12 rounded-xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <div className="font-semibold text-white">{template.suggestedModel}</div>
                  <p className="text-sm text-zinc-500">
                    Optimized for {template.difficulty} complexity
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Deploy Card */}
            <div className="glow-border rounded-2xl p-6 bg-gradient-to-b from-violet-600/10 to-transparent">
              <h3 className="font-semibold mb-4">Ready to deploy?</h3>
              <p className="text-sm text-zinc-400 mb-6">
                Get this agent up and running in under 3 minutes.
              </p>
              <Link
                href={
                  isLoggedIn
                    ? `/dashboard/instances?template=${template.id}`
                    : `/sign-up?template=${template.id}`
                }
                className="block w-full text-center bg-violet-600 hover:bg-violet-500 transition-colors px-6 py-3 rounded-xl font-semibold"
              >
                Deploy Now
              </Link>
              {!isLoggedIn && (
                <p className="text-xs text-center text-zinc-500 mt-3">
                  Free tier available
                </p>
              )}
            </div>

            {/* Quick Stats */}
            <div className="glow-border rounded-2xl p-6 bg-white/[0.02]">
              <h3 className="font-semibold mb-4">Template Stats</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Difficulty</span>
                  <span className="text-white capitalize">{template.difficulty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Category</span>
                  <span className="text-white">{template.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Model</span>
                  <span className="text-white">{template.suggestedModel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Tags</span>
                  <span className="text-white">{template.tags.length}</span>
                </div>
              </div>
            </div>

            {/* Related Templates */}
            {relatedTemplates.length > 0 && (
              <div className="glow-border rounded-2xl p-6 bg-white/[0.02]">
                <h3 className="font-semibold mb-4">Related Templates</h3>
                <div className="space-y-3">
                  {relatedTemplates.map((related) => (
                    <Link
                      key={related.id}
                      href={`/templates/${related.id}`}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-colors"
                    >
                      <span className="text-2xl">{related.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-white truncate">
                          {related.name}
                        </div>
                        <div className="text-xs text-zinc-500">
                          {related.shortDescription.slice(0, 40)}...
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-zinc-600" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Help Card */}
            <div className="rounded-2xl p-6 bg-gradient-to-b from-blue-600/10 to-transparent border border-blue-500/20">
              <h3 className="font-semibold mb-2">Need Help?</h3>
              <p className="text-sm text-zinc-400 mb-4">
                Our team can help you customize this template for your specific
                needs.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300"
              >
                Contact Support
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── More Templates ────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Explore More Templates</h2>
          <Link
            href="/templates"
            className="text-sm text-violet-400 hover:text-violet-300 flex items-center gap-1"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {agentTemplates
            .filter((t) => t.id !== template.id)
            .slice(0, 4)
            .map((t) => (
              <Link key={t.id} href={`/templates/${t.id}`} className="group">
                <div className="glow-border rounded-2xl p-5 bg-white/[0.02] hover:bg-white/[0.04] transition-all h-full">
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-2xl">{t.icon}</span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium border ${
                        categoryColors[t.category]
                      }`}
                    >
                      {t.category}
                    </span>
                  </div>
                  <h3 className="font-semibold text-white mb-2 group-hover:text-violet-300 transition-colors">
                    {t.name}
                  </h3>
                  <p className="text-sm text-zinc-400 line-clamp-2">
                    {t.shortDescription}
                  </p>
                </div>
              </Link>
            ))}
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-violet-400" />
            <span className="font-semibold text-zinc-400">SynapseForge</span>
            <span>© 2026</span>
          </div>
          <div className="flex gap-6">
            <Link
              href="/privacy"
              className="hover:text-white transition-colors"
            >
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
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

function getChannelEmoji(channel: string): string {
  const emojis: Record<string, string> = {
    "Website Chat": "💬",
    WhatsApp: "📱",
    Telegram: "✈️",
    Email: "📧",
    Slack: "💼",
    Discord: "🎮",
    "LinkedIn": "💼",
    API: "⚡",
    Teams: "👥",
    Intranet: "🏢",
    "Web Chat": "🌐",
  };
  return emojis[channel] || "💬";
}
