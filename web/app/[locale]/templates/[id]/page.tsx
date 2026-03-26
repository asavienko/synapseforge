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
  Check,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import {
  ArrowRightIcon,
  SparklesIcon,
} from "@/components/icons/BrandIcons";
import { HelixLogo } from "@/components/icons/BrandIcons";
import { CopyButton } from "@/components/CopyButton";
import { FadeInView } from "@/components/animations/FadeInView";
import { auth } from "@/lib/auth";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

// Skip static generation to avoid next-intl config issues during build
export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string; locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const template = getTemplateById(id);

  if (!template) {
    return {
      title: "Template Not Found | OpenHelix AI",
    };
  }

  return {
    title: `${template.name} | AI Agent Template | OpenHelix AI`,
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
  // Generate static params for all templates across all supported locales
  const params: { id: string; locale: string }[] = [];
  for (const locale of routing.locales) {
    for (const template of agentTemplates) {
      params.push({ id: template.id, locale });
    }
  }
  return params;
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
    <div className="min-h-screen bg-white dark:bg-[#0a0a0f] text-gray-900 dark:text-[#f5f5f7]">
      <SiteHeader />

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-10">
        <div className="max-w-4xl">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-[12px] text-gray-400 dark:text-white/35 mb-6">
            <Link href="/templates" className="hover:text-gray-700 dark:hover:text-white/70 transition-colors">
              Templates
            </Link>
            <span className="text-gray-300 dark:text-white/20">/</span>
            <Link
              href={`/templates?category=${template.category}`}
              className="hover:text-gray-700 dark:hover:text-white/70 transition-colors"
            >
              {template.category}
            </Link>
            <span className="text-gray-300 dark:text-white/20">/</span>
            <span className="text-gray-600 dark:text-white/60">{template.name}</span>
          </div>

          {/* Badges */}
          <div className="flex items-center gap-2 mb-6">
            <span
              className={`text-[11px] px-2.5 py-1 rounded-full font-medium border ${
                categoryColors[template.category]
              }`}
            >
              {template.category}
            </span>
            <span
              className={`text-[11px] px-2.5 py-1 rounded-full font-medium border ${
                difficultyColors[template.difficulty]
              }`}
            >
              {template.difficulty}
            </span>
            {template.popular && (
              <span className="text-[11px] px-2.5 py-1 rounded-full font-medium bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/15 flex items-center gap-1">
                <SparklesIcon className="w-3 h-3" size={12} />
                Popular
              </span>
            )}
          </div>

          {/* Title & Icon */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-14 h-14 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center shrink-0">
              <span className="text-3xl">{template.icon}</span>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-2">
                {template.name}
              </h1>
              <p className="text-[15px] text-gray-500 dark:text-white/50">{template.shortDescription}</p>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-8">
            {template.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] px-2.5 py-1 rounded-full bg-gray-50 dark:bg-white/[0.03] text-gray-500 dark:text-white/45 border border-gray-200 dark:border-white/[0.08]"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={
                isLoggedIn
                  ? `/dashboard/instances?template=${template.id}`
                  : `/sign-up?template=${template.id}`
              }
              className="inline-flex items-center justify-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-7 py-3.5 rounded-lg font-semibold text-[15px] hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-sm"
            >
              <HelixLogo className="w-4 h-4" size={16} />
              Deploy This Template
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
            {!isLoggedIn && (
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-lg font-medium text-[14px] text-gray-600 dark:text-white/60 border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 transition-colors"
              >
                Talk to Sales
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ── Main Content ───────────────────────────────────────────────── */}
      <section className="bg-gray-50/60 dark:bg-white/[0.015] py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Description & Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <FadeInView direction="up">
                <div className="bg-white dark:bg-white/[0.03] rounded-xl border border-gray-200/60 dark:border-white/[0.06] p-6 sm:p-8">
                  <h2 className="text-[16px] font-semibold mb-4">About This Template</h2>
                  <p className="text-gray-500 dark:text-white/50 text-[14px] leading-relaxed whitespace-pre-line">
                    {template.description}
                  </p>
                </div>
              </FadeInView>

              {/* Use Cases */}
              <FadeInView direction="up" delay={100}>
                <div className="bg-white dark:bg-white/[0.03] rounded-xl border border-gray-200/60 dark:border-white/[0.06] p-6 sm:p-8">
                  <h2 className="text-[16px] font-semibold mb-5">Common Use Cases</h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {template.useCases.map((useCase, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-3.5 rounded-lg bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.04]"
                      >
                        <div className="w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-gray-600 dark:text-white/55 text-[13px]">{useCase}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeInView>

              {/* System Prompt Preview */}
              <FadeInView direction="up" delay={200}>
                <div className="bg-white dark:bg-white/[0.03] rounded-xl border border-gray-200/60 dark:border-white/[0.06] p-6 sm:p-8">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-[16px] font-semibold">System Prompt Preview</h2>
                    <span className="text-[11px] text-gray-400 dark:text-white/30">
                      {template.systemPrompt.length} chars
                    </span>
                  </div>
                  <p className="text-[12px] text-gray-400 dark:text-white/35 mb-4">
                    This is the instruction that defines how your AI agent behaves.
                    You can customize it after deployment.
                  </p>
                  <div className="relative">
                    <div className="rounded-lg border border-gray-100 dark:border-white/[0.06] overflow-hidden">
                      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]">
                        <span className="w-2 h-2 rounded-full bg-red-300 dark:bg-red-400/30" />
                        <span className="w-2 h-2 rounded-full bg-amber-300 dark:bg-amber-400/30" />
                        <span className="w-2 h-2 rounded-full bg-emerald-300 dark:bg-emerald-400/30" />
                        <span className="ml-2 text-[10px] text-gray-400 dark:text-white/25 font-mono">system-prompt.txt</span>
                      </div>
                      <pre className="px-4 py-4 text-[12px] text-gray-600 dark:text-white/50 overflow-x-auto max-h-56 font-mono bg-white dark:bg-transparent leading-relaxed">
                        {promptPreview}
                      </pre>
                    </div>
                    <CopyButton text={template.systemPrompt} />
                  </div>
                </div>
              </FadeInView>

              {/* Suggested Channels */}
              <FadeInView direction="up" delay={300}>
                <div className="bg-white dark:bg-white/[0.03] rounded-xl border border-gray-200/60 dark:border-white/[0.06] p-6 sm:p-8">
                  <h2 className="text-[16px] font-semibold mb-3">Suggested Channels</h2>
                  <p className="text-[12px] text-gray-400 dark:text-white/35 mb-4">
                    This agent works great on these platforms:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {template.suggestedChannels.map((channel) => (
                      <span
                        key={channel}
                        className="inline-flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-full border border-gray-200 dark:border-white/[0.08] text-gray-500 dark:text-white/45 hover:border-blue-300 dark:hover:border-blue-500/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        <span>{getChannelEmoji(channel)}</span>
                        {channel}
                      </span>
                    ))}
                  </div>
                </div>
              </FadeInView>

              {/* Model Recommendation */}
              <FadeInView direction="up" delay={400}>
                <div className="bg-white dark:bg-white/[0.03] rounded-xl border border-gray-200/60 dark:border-white/[0.06] p-6 sm:p-8">
                  <h2 className="text-[16px] font-semibold mb-4">Recommended Model</h2>
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.04]">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/15 flex items-center justify-center">
                      <SparklesIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" size={20} />
                    </div>
                    <div>
                      <div className="font-semibold text-[14px] text-gray-900 dark:text-white">{template.suggestedModel}</div>
                      <p className="text-[12px] text-gray-400 dark:text-white/35">
                        Optimized for {template.difficulty} complexity
                      </p>
                    </div>
                  </div>
                </div>
              </FadeInView>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-5">
              {/* Deploy Card */}
              <div className="bg-white dark:bg-white/[0.03] rounded-xl border border-gray-200/60 dark:border-white/[0.06] p-5">
                <h3 className="font-semibold text-[14px] mb-3">Ready to deploy?</h3>
                <p className="text-[12px] text-gray-500 dark:text-white/45 mb-5">
                  Get this agent up and running in under 3 minutes.
                </p>
                <Link
                  href={
                    isLoggedIn
                      ? `/dashboard/instances?template=${template.id}`
                      : `/sign-up?template=${template.id}`
                  }
                  className="block w-full text-center bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-3 rounded-lg font-semibold text-[14px] hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-sm"
                >
                  Deploy Now
                </Link>
                {!isLoggedIn && (
                  <p className="text-[11px] text-center text-gray-400 dark:text-white/30 mt-3">
                    Free tier available
                  </p>
                )}
              </div>

              {/* Quick Stats */}
              <div className="bg-white dark:bg-white/[0.03] rounded-xl border border-gray-200/60 dark:border-white/[0.06] p-5">
                <h3 className="font-semibold text-[14px] mb-4">Template Stats</h3>
                <div className="space-y-3 text-[13px]">
                  {[
                    { label: "Difficulty", value: template.difficulty },
                    { label: "Category", value: template.category },
                    { label: "Model", value: template.suggestedModel },
                    { label: "Tags", value: String(template.tags.length) },
                  ].map((stat) => (
                    <div key={stat.label} className="flex justify-between">
                      <span className="text-gray-400 dark:text-white/35">{stat.label}</span>
                      <span className="text-gray-700 dark:text-white/70 capitalize">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Related Templates */}
              {relatedTemplates.length > 0 && (
                <div className="bg-white dark:bg-white/[0.03] rounded-xl border border-gray-200/60 dark:border-white/[0.06] p-5">
                  <h3 className="font-semibold text-[14px] mb-4">Related Templates</h3>
                  <div className="space-y-2.5">
                    {relatedTemplates.map((related) => (
                      <Link
                        key={related.id}
                        href={`/templates/${related.id}`}
                        className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.04] hover:border-blue-200 dark:hover:border-blue-500/20 transition-colors group"
                      >
                        <span className="text-xl">{related.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-[13px] text-gray-700 dark:text-white/70 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {related.name}
                          </div>
                          <div className="text-[11px] text-gray-400 dark:text-white/30 truncate">
                            {related.shortDescription.slice(0, 40)}...
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-300 dark:text-white/20" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Help Card */}
              <div className="bg-white dark:bg-white/[0.03] rounded-xl border border-gray-200/60 dark:border-white/[0.06] p-5">
                <h3 className="font-semibold text-[14px] mb-2">Need Help?</h3>
                <p className="text-[12px] text-gray-500 dark:text-white/45 mb-4">
                  Our team can help you customize this template for your specific
                  needs.
                </p>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1.5 text-[13px] text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                  Contact Support
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── More Templates ────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
        <FadeInView direction="up">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Explore More Templates</h2>
            <Link
              href="/templates"
              className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium text-[13px] transition-colors hover:gap-3"
            >
              View All <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
        </FadeInView>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {agentTemplates
            .filter((t) => t.id !== template.id)
            .slice(0, 4)
            .map((t, i) => (
              <FadeInView key={t.id} direction="up" delay={i * 75}>
                <Link href={`/templates/${t.id}`} className="group block h-full">
                  <div className="bg-white dark:bg-white/[0.03] rounded-xl border border-gray-200/60 dark:border-white/[0.06] p-5 h-full flex flex-col hover:border-blue-200 dark:hover:border-blue-500/20 hover:shadow-sm transition-all duration-300 hover:-translate-y-0.5">
                    <div className="flex items-start justify-between mb-4">
                      <span className="text-2xl">{t.icon}</span>
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full font-medium border ${
                          categoryColors[t.category]
                        }`}
                      >
                        {t.category}
                      </span>
                    </div>
                    <h3 className="font-semibold text-[14px] mb-1.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {t.name}
                    </h3>
                    <p className="text-[12px] text-gray-500 dark:text-white/45 flex-1 line-clamp-2">
                      {t.shortDescription}
                    </p>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-white/[0.06]">
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium border ${
                        t.difficulty === "beginner" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/15"
                        : t.difficulty === "intermediate" ? "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/15"
                        : "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 border-red-200 dark:border-red-500/15"
                      }`}>{t.difficulty}</span>
                      <span className="text-[12px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                        Use <ArrowRightIcon className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              </FadeInView>
            ))}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}

function getChannelEmoji(channel: string): string {
  const emojis: Record<string, string> = {
    "Website Chat": "\u{1F4AC}",
    WhatsApp: "\u{1F4F1}",
    Telegram: "\u2708\uFE0F",
    Email: "\u{1F4E7}",
    Slack: "\u{1F4BC}",
    Discord: "\u{1F3AE}",
    "LinkedIn": "\u{1F4BC}",
    API: "\u26A1",
    Teams: "\u{1F465}",
    Intranet: "\u{1F3E2}",
    "Web Chat": "\u{1F310}",
  };
  return emojis[channel] || "\u{1F4AC}";
}
