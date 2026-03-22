"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { Play, Loader2, Copy, Check, Terminal, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ApiPlaygroundProps {
  instanceId?: string;
}

export function ApiPlayground({ instanceId }: ApiPlaygroundProps) {
  const [apiKey, setApiKey] = useState("");
  const [endpoint, setEndpoint] = useState("/api/v1/chat");
  const [method, setMethod] = useState("POST");
  const [requestBody, setRequestBody] = useState(JSON.stringify({
    messages: [{ role: "user", content: "Hello!" }]
  }, null, 2));
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const baseUrl = typeof window !== "undefined" 
    ? `${window.location.protocol}//${window.location.host}` 
    : "https://app.openhelixai.com";

  async function sendRequest() {
    if (!apiKey.trim()) {
      setError("Please enter your API key");
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);
    setStatusCode(null);

    try {
      const url = `${baseUrl}${endpoint}`;
      const options: RequestInit = {
        method,
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      };

      if (method !== "GET" && requestBody.trim()) {
        try {
          JSON.parse(requestBody); // Validate JSON
          options.body = requestBody;
        } catch (e) {
          setError("Invalid JSON in request body");
          setLoading(false);
          return;
        }
      }

      const res = await fetch(url, options);
      setStatusCode(res.status);

      const text = await res.text();
      try {
        // Try to parse as JSON for pretty printing
        const json = JSON.parse(text);
        setResponse(JSON.stringify(json, null, 2));
      } catch {
        // If not JSON, show as-is
        setResponse(text);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  function copyCurl() {
    const curl = `curl -X ${method} \\\n  ${baseUrl}${endpoint} \\\n  -H "Authorization: Bearer ${apiKey || "YOUR_API_KEY"}" \\\n  -H "Content-Type: application/json" \\\n  -d '${requestBody.replace(/'/g, "'\\''")}'`;
    
    navigator.clipboard.writeText(curl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const predefinedEndpoints = [
    { value: "/api/v1/chat", label: "Chat", method: "POST" },
    { value: "/api/v1/chat/completions", label: "Chat Completions", method: "POST" },
    { value: "/api/v1/chat/stream", label: "Streaming Chat", method: "POST" },
    { value: "/api/v1/instance", label: "Get Instance", method: "GET" },
  ];

  return (
    <div className="glow-border rounded-2xl bg-white/[0.02] overflow-hidden">
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
            <Terminal className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">API Playground</h3>
            <p className="text-sm text-zinc-500">Test API calls directly from the browser</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* API Key */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            API Key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="syn_..."
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
          />
          <p className="text-xs text-zinc-600 mt-1.5">
            Get your API key from the{" "}
            <Link href="/dashboard" className="text-violet-400 hover:text-violet-300">
              dashboard
            </Link>
          </p>
        </div>

        {/* Endpoint & Method */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-3">
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Endpoint
            </label>
            <select
              value={endpoint}
              onChange={(e) => {
                const selected = predefinedEndpoints.find(ep => ep.value === e.target.value);
                if (selected) {
                  setEndpoint(selected.value);
                  setMethod(selected.method);
                }
              }}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-violet-500 transition-colors"
            >
              {predefinedEndpoints.map((ep) => (
                <option key={ep.value} value={ep.value}>
                  {ep.method} {ep.value} — {ep.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Method
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className={cn(
                "w-full rounded-lg px-4 py-2.5 font-mono text-sm font-medium focus:outline-none transition-colors",
                method === "GET" && "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400",
                method === "POST" && "bg-blue-500/10 border border-blue-500/30 text-blue-400",
                method === "PATCH" && "bg-amber-500/10 border border-amber-500/30 text-amber-400",
                method === "DELETE" && "bg-red-500/10 border border-red-500/30 text-red-400",
              )}
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PATCH">PATCH</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>
        </div>

        {/* Request Body */}
        {method !== "GET" && (
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Request Body (JSON)
            </label>
            <textarea
              value={requestBody}
              onChange={(e) => setRequestBody(e.target.value)}
              rows={6}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-violet-500 transition-colors resize-y"
              spellCheck={false}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={sendRequest}
            disabled={loading}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors px-5 py-2.5 rounded-lg font-medium text-white"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Send Request
              </>
            )}
          </button>
          
          <button
            onClick={copyCurl}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors px-4 py-2.5 rounded-lg text-zinc-300"
          >
            {copied ? (
              <> <Check className="w-4 h-4" /> Copied! </>
            ) : (
              <> <Copy className="w-4 h-4" /> Copy cURL </>
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-center gap-2 text-red-400 mb-1">
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium">Error</span>
            </div>
            <pre className="text-sm text-red-300 font-mono">{error}</pre>
          </div>
        )}

        {/* Response */}
        {response && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-zinc-300">Response</span>
              {statusCode && (
                <span
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-full font-medium",
                    statusCode < 300 && "bg-emerald-500/20 text-emerald-400",
                    statusCode >= 300 && statusCode < 400 && "bg-amber-500/20 text-amber-400",
                    statusCode >= 400 && "bg-red-500/20 text-red-400",
                  )}
                >
                  Status: {statusCode}
                </span>
              )}
            </div>
            <pre className="bg-zinc-900/80 border border-white/10 rounded-lg p-4 text-sm text-zinc-300 font-mono overflow-x-auto max-h-96 overflow-y-auto">
              {response}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
