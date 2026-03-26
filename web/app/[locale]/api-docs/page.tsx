import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import { HelixLogo } from "@/components/icons/BrandIcons";
import { ArrowLeft, Code, Terminal, Copy, Check } from "lucide-react";

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
      {/* Nav */}
      <nav className="border-b border-gray-200/50 dark:border-white/[0.06] backdrop-blur-sm sticky top-0 z-50 bg-white/80 dark:bg-[#0a0a0f]/80">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <HelixLogo className="w-7 h-7 text-blue-600 dark:text-blue-400" size={28} />
            <span className="font-bold text-lg tracking-tight text-gray-900 dark:text-white">OpenHelix<span className="text-blue-600 dark:text-blue-400">.</span></span>
          </Link>
          <Link
            href="/dashboard"
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
          >
            Go to Dashboard →
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center">
              <Code className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold">API Documentation</h1>
          </div>
          <p className="text-gray-500 dark:text-white/50 text-lg">
            Integrate OpenHelix AI into your applications with our REST API.
          </p>
        </div>

        {/* Base URL */}
        <section className="mb-12 p-6 bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.06] rounded-xl">
          <h2 className="text-xl font-semibold mb-4">Base URL</h2>
          <code className="block p-4 bg-gray-50 dark:bg-black/50 rounded-lg font-mono text-sm text-blue-600 dark:text-blue-300">
            https://openhelixai.com/api/v1
          </code>
        </section>

        {/* Authentication */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Authentication</h2>
          <div className="p-6 bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.06] rounded-xl">
            <p className="text-gray-500 dark:text-white/50 mb-4">
              Include your API key in the request headers:
            </p>
            <pre className="p-4 bg-gray-50 dark:bg-black/50 rounded-lg overflow-x-auto">
              <code className="font-mono text-sm text-gray-600 dark:text-zinc-300">{
`X-API-Key: your_api_key_here`}
              </code>
            </pre>
            <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <p className="text-sm text-amber-400">
                💡 Generate API keys from your{" "}
                <Link href="/dashboard/instances" className="underline">dashboard</Link>.
                Keep your API keys secure and never share them.
              </p>
            </div>
          </div>
        </section>

        {/* Endpoints */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-6">Endpoints</h2>
          <div className="space-y-6">
            {endpoints.map((endpoint, index) => (
              <div
                key={index}
                className="border border-gray-100 dark:border-white/[0.06] rounded-xl overflow-hidden"
              >
                <div className="p-6 bg-white dark:bg-white/[0.02]">
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-mono font-bold ${
                        endpoint.method === "GET"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      }`}
                    >
                      {endpoint.method}
                    </span>
                    <code className="font-mono text-sm text-gray-600 dark:text-zinc-300">
                      {endpoint.path}
                    </code>
                  </div>
                  <p className="text-gray-500 dark:text-white/50 mb-2">{endpoint.description}</p>
                  <p className="text-xs text-gray-500 dark:text-white/50">🔒 {endpoint.auth}</p>
                </div>

                <div className="p-6 border-t border-gray-100 dark:border-white/[0.06]">
                  {endpoint.request && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-zinc-300 mb-2">Request Body</p>
                      <pre className="p-3 bg-gray-50 dark:bg-black/50 rounded-lg overflow-x-auto">
                        <code className="font-mono text-xs text-gray-600 dark:text-zinc-300">{endpoint.request}</code>
                      </pre>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-zinc-300 mb-2">Response</p>
                    <pre className="p-3 bg-gray-50 dark:bg-black/50 rounded-lg overflow-x-auto">
                      <code className="font-mono text-xs text-gray-600 dark:text-zinc-300">{endpoint.response}</code>
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Example */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Example: cURL</h2>
          <div className="p-6 bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.06] rounded-xl">
            <pre className="p-4 bg-gray-50 dark:bg-black/50 rounded-lg overflow-x-auto">
              <code className="font-mono text-xs text-gray-600 dark:text-zinc-300">{
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
        </section>

        {/* Help */}
        <section className="text-center py-12 border-t border-gray-100 dark:border-white/[0.06]">
          <p className="text-gray-500 dark:text-white/50">
            Need help?{" "}
            <Link href="/contact" className="text-blue-400 hover:underline">
              Contact our support team
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}
