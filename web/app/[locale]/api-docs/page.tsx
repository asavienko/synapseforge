import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { FadeInView } from "@/components/animations/FadeInView";
import { Code } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("apiDocs");
  return { title: t("metaTitle"), description: t("metaDescription") };
}

const endpoints = [
  {
    method: "POST",
    path: "/api/v1/chat",
    description: "Send a message to your AI agent",
    auth: "API Key required",
    request: `{
  "instanceId": "your-instance-id",
  "message": "Hello, how can you help me?"
}`,
    response: `{
  "response": "I'd be happy to help! I can assist with...",
  "messageId": "msg_1234567890"
}`,
  },
  {
    method: "GET",
    path: "/api/v1/instances",
    description: "List all your AI instances",
    auth: "Session or API Key",
    request: null,
    response: `[
  {
    "id": "instance-id",
    "name": "My AI Agent",
    "status": "running",
    "type": "assistant"
  }
]`,
  },
  {
    method: "POST",
    path: "/api/instances/{id}/credentials",
    description: "Add credentials to an instance",
    auth: "Session required",
    request: `{
  "key": "openai_api_key",
  "value": "sk-..."
}`,
    response: `{
  "success": true,
  "key": "openai_api_key"
}`,
  },
];

export default async function ApiDocsPage() {
  const t = await getTranslations("footer");

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0f] text-gray-900 dark:text-[#f5f5f7]">
      <SiteHeader />

      {/* Hero */}
      <section className="relative mesh-gradient grid-bg py-16 sm:py-24 md:py-32">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <FadeInView direction="up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-500/20 text-[12px] text-blue-600 dark:text-blue-400 mb-6">
              <Code className="w-3.5 h-3.5" />
              REST API
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
              <span className="gradient-text">API Documentation</span>
            </h1>
            <p className="text-lg text-gray-500 dark:text-white/50 max-w-xl mx-auto">
              Integrate OpenHelix AI into your applications with our REST API.
            </p>
          </FadeInView>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 sm:py-24 md:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">

          {/* Base URL */}
          <FadeInView direction="up">
            <div className="glass-card glow-border rounded-xl p-4 sm:p-6 mb-8 sm:mb-12">
              <h2 className="text-lg sm:text-xl font-semibold mb-4">Base URL</h2>
              <code className="block p-3 sm:p-4 bg-gray-50 dark:bg-black/50 rounded-lg font-mono text-xs sm:text-sm text-blue-600 dark:text-blue-400 overflow-x-auto">
                https://openhelixai.com/api/v1
              </code>
            </div>
          </FadeInView>

          {/* Authentication */}
          <FadeInView direction="up" delay={100}>
            <div className="mb-8 sm:mb-12">
              <h2 className="text-xl font-semibold mb-4">Authentication</h2>
              <div className="glass-card glow-border rounded-xl p-4 sm:p-6">
                <p className="text-gray-500 dark:text-white/50 mb-4">
                  Include your API key in the request headers:
                </p>
                <pre className="p-4 bg-gray-50 dark:bg-black/50 rounded-lg overflow-x-auto">
                  <code className="font-mono text-sm text-gray-600 dark:text-white/55">{
`X-API-Key: your_api_key_here`}
                  </code>
                </pre>
                <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg">
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    Generate API keys from your{" "}
                    <Link href="/dashboard/instances" className="underline">dashboard</Link>.
                    Keep your API keys secure and never share them.
                  </p>
                </div>
              </div>
            </div>
          </FadeInView>

          {/* Endpoints */}
          <FadeInView direction="up" delay={200}>
            <div className="mb-8 sm:mb-12">
              <h2 className="text-xl font-semibold mb-6">Endpoints</h2>
              <div className="space-y-6">
                {endpoints.map((endpoint, index) => (
                  <div
                    key={index}
                    className={`glass-card glow-border rounded-xl overflow-hidden stagger-${(index % 6) + 1}`}
                  >
                    <div className="p-4 sm:p-6">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-mono font-bold ${
                            endpoint.method === "GET"
                              ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                          }`}
                        >
                          {endpoint.method}
                        </span>
                        <code className="font-mono text-sm text-gray-600 dark:text-white/55">
                          {endpoint.path}
                        </code>
                      </div>
                      <p className="text-gray-500 dark:text-white/50 mb-2">{endpoint.description}</p>
                      <p className="text-xs text-gray-500 dark:text-white/50">{endpoint.auth}</p>
                    </div>

                    <div className="p-4 sm:p-6 border-t border-gray-100 dark:border-white/[0.06]">
                      {endpoint.request && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-600 dark:text-white/55 mb-2">Request Body</p>
                          <pre className="p-3 bg-gray-50 dark:bg-black/50 rounded-lg overflow-x-auto">
                            <code className="font-mono text-xs text-gray-600 dark:text-white/55">{endpoint.request}</code>
                          </pre>
                        </div>
                      )}

                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-white/55 mb-2">Response</p>
                        <pre className="p-3 bg-gray-50 dark:bg-black/50 rounded-lg overflow-x-auto">
                          <code className="font-mono text-xs text-gray-600 dark:text-white/55">{endpoint.response}</code>
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeInView>

          {/* Example */}
          <FadeInView direction="up" delay={300}>
            <div className="mb-12">
              <h2 className="text-xl font-semibold mb-4">Example: cURL</h2>
              <div className="glass-card glow-border rounded-xl p-4 sm:p-6">
                <pre className="p-4 bg-gray-50 dark:bg-black/50 rounded-lg overflow-x-auto">
                  <code className="font-mono text-xs text-gray-600 dark:text-white/55">{
`curl -X POST "https://openhelixai.com/api/v1/chat" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: your_api_key_here" \\
  -d '{
    "instanceId": "your-instance-id",
    "message": "Hello, how can you help me?"
  }'`}
                  </code>
                </pre>
              </div>
            </div>
          </FadeInView>

          {/* Help */}
          <FadeInView direction="up" delay={400}>
            <div className="text-center py-12 border-t border-gray-100 dark:border-white/[0.06]">
              <p className="text-gray-500 dark:text-white/50">
                Need help?{" "}
                <Link href="/contact" className="text-blue-600 dark:text-blue-400 hover:text-blue-500 transition-colors">
                  Contact our support team
                </Link>
              </p>
            </div>
          </FadeInView>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
