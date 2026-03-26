import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import NextLink from "next/link";
import { Clock, Calendar } from "lucide-react";
import { BlogImage } from "@/components/BlogImages";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { FadeInView } from "@/components/animations/FadeInView";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("blog");
  const title = t("metaTitle");
  const description = t("metaDescription");
  return {
    title,
    description,
    openGraph: {
      title: t("ogTitle"),
      description: t("ogDescription"),
      type: "website",
    },
  };
}

const posts = [
  {
    slug: "how-to-add-ai-chatbot-to-your-website",
    title: "How to Add an AI Chatbot to Your Website (Step-by-Step Guide)",
    excerpt: "Complete guide to embedding AI chat on any website. Widget, iframe, and API options with code examples for WordPress, Shopify, React, and more.",
    date: "March 23, 2026",
    readTime: "12 min read",
    category: "Implementation",
    categoryColor: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10",
  },
  {
    slug: "ai-customer-support-roi-guide",
    title: "AI Customer Support ROI: Calculate Your Cost Savings",
    excerpt: "Data-driven guide to measuring AI support ROI. Real benchmarks, cost formulas, deflection rates, and what to expect in your first 90 days.",
    date: "March 23, 2026",
    readTime: "10 min read",
    category: "ROI Guide",
    categoryColor: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10",
  },
  {
    slug: "how-to-build-telegram-chatbot",
    title: "How to Build a Telegram AI Chatbot in 10 Minutes",
    excerpt: "Step-by-step guide to deploying a GPT-4 powered support bot on Telegram. No coding required.",
    date: "March 23, 2026",
    readTime: "8 min read",
    category: "Tutorial",
    categoryColor: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10",
  },
  {
    slug: "best-ai-models-for-customer-support",
    title: "Best AI Models for Customer Support in 2026: GPT-4o vs Claude vs Gemini vs Mistral",
    excerpt: "Practical breakdown of the top LLMs for customer support chatbots — accuracy, tone, cost, and which fits your use case.",
    date: "March 23, 2026",
    readTime: "10 min read",
    category: "Comparison",
    categoryColor: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10",
  },
  {
    slug: "reduce-customer-support-costs-with-ai",
    title: "How to Reduce Customer Support Costs by 60% with AI",
    excerpt: "Real numbers on AI support ROI. How businesses cut per-ticket costs while improving customer satisfaction — with a built-in calculator.",
    date: "March 23, 2026",
    readTime: "9 min read",
    category: "ROI Guide",
    categoryColor: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10",
  },
  {
    slug: "how-to-automate-ecommerce-customer-support",
    title: "How to Automate Ecommerce Customer Support with AI (2026 Playbook)",
    excerpt: "Step-by-step playbook: audit your tickets, build your knowledge base, configure AI, pick channels, and reach 80% automation in 2 weeks.",
    date: "March 23, 2026",
    readTime: "11 min read",
    category: "Playbook",
    categoryColor: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10",
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0f] text-gray-900 dark:text-[#f5f5f7]">
      <SiteHeader />

      {/* Hero */}
      <section className="relative mesh-gradient grid-bg py-16 sm:py-24 md:py-32">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <FadeInView direction="up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-500/20 text-[12px] text-blue-600 dark:text-blue-400 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              Guides & Insights
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
              <span className="gradient-text">Blog</span>
            </h1>
            <p className="text-lg text-gray-500 dark:text-white/50 max-w-xl mx-auto">
              Guides, tutorials, and insights on AI customer support, chatbot deployment, and business automation.
            </p>
          </FadeInView>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="py-16 sm:py-24 md:py-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, i) => (
              <FadeInView key={post.slug} direction="up" delay={i * 60}>
                <NextLink
                  href={`/blog/${post.slug}`}
                  className={`group glass-card rounded-xl overflow-hidden h-full flex flex-col hover:-translate-y-0.5 transition-all duration-300 stagger-${(i % 6) + 1}`}
                >
                  {/* Blog post illustration */}
                  <div className="h-40 border-b border-gray-100 dark:border-white/[0.06] flex items-center justify-center overflow-hidden">
                    <BlogImage slug={post.slug} className="w-full h-full" />
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${post.categoryColor}`}>
                        {post.category}
                      </span>
                    </div>
                    <h2 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2 leading-snug">
                      {post.title}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-white/50 mb-4 leading-relaxed line-clamp-2 flex-1">{post.excerpt}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-white/40">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{post.date}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.readTime}</span>
                    </div>
                  </div>
                </NextLink>
              </FadeInView>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
