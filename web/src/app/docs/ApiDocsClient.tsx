"use client";

import { useEffect, useState } from "react";
import { Code, Copy, Check, Terminal, Webhook, Globe } from "lucide-react";
import { Link } from "@/i18n/navigation";

interface ApiDocs {
  name: string;
  version: string;
  description: string;
  baseUrl: string;
  authentication: {
    type: string;
    header: string;
    description: string;
  };
  endpoints: Array<{
    method: string;
    path: string;
    description: string;
    headers?: Record<string, string>;
    body?: Record<string, string>;
    response?: Record<string, string>;
    example?: {
      request: string;
      response: string;
    };
    note?: string;
  }>;
  widget: {
    description: string;
    usage: string;
    code: string;
  };
  rateLimits: {
    description: string;
    free: string;
    pro: string;
    enterprise: string;
  };
  support: {
    email: string;
    docs: string;
    status: string;
  };
}

export function ApiDocsClient() {
  const [docs, setDocs] = useState<ApiDocs | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/docs")
      .then((res) => res.json())
      .then((data) => {
        setDocs(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load docs:", err);
        setLoading(false);
      });
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!docs) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-zinc-500">
        Failed to load API documentation
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center gap-2 mb-4">
            <Link href="/" className="text-zinc-500 hover:text-white transition-colors">
              ← Back to home
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
              <Code className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{docs.name}</h1>
              <p className="text-zinc-500">{docs.description}</p>
            </div>
            <span className="ml-auto px-3 py-1 rounded-full bg-white/5 text-xs text-zinc-400">
              v{docs.version}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block">
            <nav className="sticky top-8 space-y-1">
              <a href="#auth" className="block px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">
                Authentication
              </a>
              <a href="#endpoints" className="block px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">
                Endpoints
              </a>
              <a href="#widget" className="block px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">
                Web Widget
              </a>
              <a href="#limits" className="block px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">
                Rate Limits
              </a>
              <a href="#support" className="block px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">
                Support
              </a>
            </nav>
          </aside>

          {/* Content */}
          <div className="space-y-8">
            {/* Authentication */}
            <section id="auth" className="glow-border rounded-2xl bg-white/[0.02] overflow-hidden">
              <div className="p-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <Terminal className="w-5 h-5 text-violet-400" />
                  <h2 className="text-lg font-semibold">Authentication</h2>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-zinc-400">{docs.authentication.description}</p>
                <div className="bg-zinc-900/50 rounded-lg p-4 border border-white/10">
                  <code className="text-sm text-violet-300">{docs.authentication.header}</code>
                </div>
                <p className="text-sm text-zinc-500">
                  Get your API key from the{" "}
                  <Link href="/en/dashboard" className="text-violet-400 hover:text-violet-300">
                    dashboard
                  </Link>
                  .
                </p>
              </div>
            </section>

            {/* Endpoints */}
            <section id="endpoints">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Webhook className="w-5 h-5 text-violet-400" />
                Endpoints
              </h2>

              <div className="space-y-4">
                {docs.endpoints.map((endpoint, i) => (
                  <div key={i} className="glow-border rounded-2xl bg-white/[0.02] overflow-hidden">
                    <div className="p-4 border-b border-white/5 flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-xs font-mono font-medium ${
                        endpoint.method === "GET" ? "bg-emerald-500/20 text-emerald-400" :
                        endpoint.method === "POST" ? "bg-blue-500/20 text-blue-400" :
                        "bg-amber-500/20 text-amber-400"
                      }`}>
                        {endpoint.method}
                      </span>
                      <code className="text-sm text-zinc-300">{endpoint.path}</code>
                    </div>
                    <div className="p-4 space-y-4">
                      <p className="text-zinc-400">{endpoint.description}</p>

                      {endpoint.note && (
                        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-sm text-amber-300">
                          {endpoint.note}
                        </div>
                      )}

                      {endpoint.example && (
                        <div className="space-y-2">
                          <p className="text-xs text-zinc-500 font-medium">Example Request:</p>
                          <div className="relative">
                            <pre className="bg-zinc-900/50 rounded-lg p-3 text-xs text-zinc-300 font-mono overflow-x-auto">
                              {endpoint.example.request}
                            </pre>
                            <button
                              onClick={() => copyToClipboard(endpoint.example!.request, `req-${i}`)}
                              className="absolute top-2 right-2 p-1.5 rounded bg-white/10 hover:bg-white/20 transition-colors"
                            >
                              {copied === `req-${i}` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Widget */}
            <section id="widget" className="glow-border rounded-2xl bg-white/[0.02] overflow-hidden">
              <div className="p-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-violet-400" />
                  <h2 className="text-lg font-semibold">Web Widget</h2>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-zinc-400">{docs.widget.description}</p>
                <div className="relative">
                  <pre className="bg-zinc-900/50 rounded-lg p-4 text-xs text-zinc-300 font-mono overflow-x-auto">
                    {docs.widget.code.trim()}
                  </pre>
                  <button
                    onClick={() => copyToClipboard(docs.widget.code, "widget")}
                    className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs transition-colors"
                  >
                    {copied === "widget" ? (
                      <><Check className="w-3.5 h-3.5" /> <span>Copied!</span></>
                    ) : (
                      <><Copy className="w-3.5 h-3.5" /> <span>Copy</span></>
                    )}
                  </button>
                </div>
              </div>
            </section>

            {/* Rate Limits */}
            <section id="limits" className="glow-border rounded-2xl bg-white/[0.02] overflow-hidden">
              <div className="p-6 border-b border-white/5">
                <h2 className="text-lg font-semibold">Rate Limits</h2>
              </div>
              <div className="p-6">
                <p className="text-zinc-400 mb-4">{docs.rateLimits.description}</p>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-white/5 rounded-xl">
                    <div className="text-2xl font-bold text-zinc-300">Free</div>
                    <div className="text-sm text-zinc-500 mt-1">{docs.rateLimits.free}</div>
                  </div>
                  <div className="text-center p-4 bg-violet-500/10 border border-violet-500/20 rounded-xl">
                    <div className="text-2xl font-bold text-violet-400">Pro</div>
                    <div className="text-sm text-zinc-500 mt-1">{docs.rateLimits.pro}</div>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-xl">
                    <div className="text-2xl font-bold text-zinc-300">Enterprise</div>
                    <div className="text-sm text-zinc-500 mt-1">{docs.rateLimits.enterprise}</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Support */}
            <section id="support" className="glow-border rounded-2xl bg-white/[0.02] overflow-hidden">
              <div className="p-6 border-b border-white/5">
                <h2 className="text-lg font-semibold">Support</h2>
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-4">
                  <a
                    href={`mailto:${docs.support.email}`}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    {docs.support.email}
                  </a>
                  <a
                    href={docs.support.status}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    System Status
                  </a>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
