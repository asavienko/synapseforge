import { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import NextLink from "next/link";
import { ArrowRight, Zap, Clock, Calendar } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog — AI Customer Support Guides & Tutorials",
  description:
    "Tutorials, guides, and insights on AI customer support, chatbot deployment, and business automation. Practical content from the OpenHelix team.",
  openGraph: {
    title: "Blog — OpenHelix AI",
    description: "Tutorials, guides, and insights on AI customer support.",
    type: "website",
  },
};

const posts = [
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
    categoryColor: "text-violet-400 bg-violet-400/10",
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
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <nav className="border-b border-white/5 bg-[#0a0a0f]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-white">
            <Zap className="w-5 h-5 text-violet-400" />OpenHelix AI
          </Link>
          <Link href="/sign-up" className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 transition-colors px-4 py-2 rounded-lg text-sm font-semibold">
            Try Free <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-16">
        <div className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">Blog</h1>
          <p className="text-zinc-400 max-w-xl">
            Guides, tutorials, and insights on AI customer support, chatbot deployment, and business automation.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <NextLink
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group bg-white/[0.02] border border-white/10 hover:border-violet-500/30 hover:bg-white/[0.04] transition-all rounded-xl overflow-hidden"
            >
              {/* Thumbnail placeholder */}
              <div className="h-40 bg-gradient-to-br from-violet-500/20 to-violet-900/10 border-b border-white/5 flex items-center justify-center">
                <Zap className="w-10 h-10 text-violet-400/40" />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${post.categoryColor}`}>
                    {post.category}
                  </span>
                </div>
                <h2 className="font-semibold text-white group-hover:text-violet-300 transition-colors mb-2 leading-snug">
                  {post.title}
                </h2>
                <p className="text-sm text-zinc-400 mb-4 leading-relaxed line-clamp-2">{post.excerpt}</p>
                <div className="flex items-center gap-3 text-xs text-zinc-500">
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
