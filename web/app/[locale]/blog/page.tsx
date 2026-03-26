import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import NextLink from "next/link";
import { ArrowRight, Clock, Calendar } from "lucide-react";
import { HelixLogo } from "@/components/icons/BrandIcons";

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
    categoryColor: "text-blue-400 bg-blue-400/10",
  },
  {
    slug: "ai-customer-support-roi-guide",
    title: "AI Customer Support ROI: Calculate Your Cost Savings",
    excerpt: "Data-driven guide to measuring AI support ROI. Real benchmarks, cost formulas, deflection rates, and what to expect in your first 90 days.",
    date: "March 23, 2026",
    readTime: "10 min read",
    category: "ROI Guide",
    categoryColor: "text-emerald-400 bg-emerald-400/10",
  },
  {
    slug: "how-to-build-telegram-chatbot",
    title: "How to Build a Telegram AI Chatbot in 10 Minutes",
    excerpt: "Step-by-step guide to deploying a GPT-4 powered support bot on Telegram. No coding required.",
    date: "March 23, 2026",
    readTime: "8 min read",
    category: "Tutorial",
    categoryColor: "text-blue-400 bg-blue-400/10",
  },
  {
    slug: "best-ai-models-for-customer-support",
    title: "Best AI Models for Customer Support in 2026: GPT-4o vs Claude vs Gemini vs Mistral",
    excerpt: "Practical breakdown of the top LLMs for customer support chatbots — accuracy, tone, cost, and which fits your use case.",
    date: "March 23, 2026",
    readTime: "10 min read",
    category: "Comparison",
    categoryColor: "text-blue-400 bg-blue-400/10",
  },
  {
    slug: "reduce-customer-support-costs-with-ai",
    title: "How to Reduce Customer Support Costs by 60% with AI",
    excerpt: "Real numbers on AI support ROI. How businesses cut per-ticket costs while improving customer satisfaction — with a built-in calculator.",
    date: "March 23, 2026",
    readTime: "9 min read",
    category: "ROI Guide",
    categoryColor: "text-emerald-400 bg-emerald-400/10",
  },
  {
    slug: "how-to-automate-ecommerce-customer-support",
    title: "How to Automate Ecommerce Customer Support with AI (2026 Playbook)",
    excerpt: "Step-by-step playbook: audit your tickets, build your knowledge base, configure AI, pick channels, and reach 80% automation in 2 weeks.",
    date: "March 23, 2026",
    readTime: "11 min read",
    category: "Playbook",
    categoryColor: "text-blue-400 bg-blue-400/10",
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0f] text-gray-900 dark:text-[#f5f5f7]">
      <nav className="border-b border-gray-200/50 dark:border-white/[0.06] bg-white/80 dark:bg-[#0a0a0f]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
            <HelixLogo className="w-7 h-7 text-blue-600 dark:text-blue-400" size={28} />OpenHelix<span className="text-blue-600 dark:text-blue-400">.</span>
          </Link>
          <Link href="/sign-up" className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 transition-colors px-4 py-2 rounded-lg text-sm font-semibold text-white">
            Try Free <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-16">
        <div className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">Blog</h1>
          <p className="text-gray-500 dark:text-white/50 max-w-xl">
            Guides, tutorials, and insights on AI customer support, chatbot deployment, and business automation.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <NextLink
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 hover:border-blue-200 dark:hover:border-blue-500/30 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-all rounded-xl overflow-hidden"
            >
              {/* Thumbnail placeholder */}
              <div className="h-40 bg-gradient-to-br from-blue-500/20 to-blue-900/10 border-b border-gray-100 dark:border-white/[0.06] flex items-center justify-center">
                <HelixLogo className="w-10 h-10 text-blue-400/40" size={40} />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${post.categoryColor}`}>
                    {post.category}
                  </span>
                </div>
                <h2 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-300 transition-colors mb-2 leading-snug">
                  {post.title}
                </h2>
                <p className="text-sm text-gray-500 dark:text-white/50 mb-4 leading-relaxed line-clamp-2">{post.excerpt}</p>
                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-white/40">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{post.date}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.readTime}</span>
                </div>
              </div>
            </NextLink>
          ))}
        </div>
      </main>
    </div>
  );
}
