"use client";

import { useState, useRef } from "react";
import { Download, Upload, Copy, Check, FileJson, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfigImportExportProps {
  config: Record<string, unknown>;
  onImport?: (config: Record<string, unknown>) => void;
  readOnly?: boolean;
}

export function ConfigImportExport({ config, onImport, readOnly = false }: ConfigImportExportProps) {
  const [copied, setCopied] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const configJson = JSON.stringify(config, null, 2);

  function handleCopy() {
    navigator.clipboard.writeText(configJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    const blob = new Blob([configJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `synapseforge-config-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setImportSuccess(false);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        
        // Basic validation
        if (typeof parsed !== "object" || parsed === null) {
          throw new Error("Invalid config format");
        }

        onImport?.(parsed);
        setImportSuccess(true);
        setTimeout(() => setImportSuccess(false), 3000);
      } catch (err) {
        setImportError(err instanceof Error ? err.message : "Failed to parse config file");
      }
    };
    reader.readAsText(file);

    // Reset input
    e.target.value = "";
  }

  return (
    <div className="space-y-3">
      {/* Export Section */}
      <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-sm text-zinc-300">
            <FileJson className="w-4 h-4 text-violet-400" />
            <span>Export Configuration</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 px-2 py-1.5 rounded-lg transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy"}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 px-2 py-1.5 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </button>
          </div>
        </div>
        <pre className="text-xs text-zinc-500 bg-black/30 rounded-lg p-2 max-h-32 overflow-auto font-mono">
          {configJson.slice(0, 500)}{configJson.length > 500 ? "..." : ""}
        </pre>
      </div>

      {/* Import Section */}
      {!readOnly && onImport && (
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm text-zinc-300">
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>Import Configuration</span>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors",
                importSuccess
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white"
              )}
            >
              {importSuccess ? <Check className="w-3.5 h-3.5" /> : <Upload className="w-3.5 h-3.5" />}
              {importSuccess ? "Imported!" : "Upload JSON"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
          <p className="text-xs text-zinc-500">
            Upload a previously exported config file to restore settings
          </p>
          {importError && (
            <div className="flex items-center gap-2 mt-2 text-xs text-red-400">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{importError}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
