"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import {
  Database,
  FileText,
  Trash2,
  Loader2,
  Upload,
  File,
  X,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface KnowledgeDoc {
  id: string;
  filename: string;
  fileSize: number;
  type: string;
  status: "processing" | "ready" | "error";
  chunkCount: number;
  createdAt: string;
  updatedAt: string;
}

interface StorageInfo {
  used: number;
  limit: number;
  percentage: number;
}

interface KnowledgeBaseManagerProps {
  instanceId: string;
}

const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/markdown",
];

const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".txt", ".md"];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getFileIcon(type: string, filename: string): string {
  if (type === "pdf" || filename.toLowerCase().endsWith(".pdf")) return "📄";
  if (type === "docx" || filename.toLowerCase().endsWith(".docx")) return "📝";
  if (type === "md" || filename.toLowerCase().endsWith(".md")) return "📑";
  return "📃";
}

export function KnowledgeBaseManager({ instanceId }: KnowledgeBaseManagerProps) {
  const t = useTranslations("instanceDetail");
  const [documents, setDocuments] = useState<KnowledgeDoc[]>([]);
  const [storage, setStorage] = useState<StorageInfo>({ used: 0, limit: 50 * 1024 * 1024, percentage: 0 });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ filename: string; status: "uploading" | "processing" | "done" | "error" } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await fetch(`/api/instances/${instanceId}/knowledge`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setDocuments(data.documents ?? []);
      setStorage(data.storage ?? { used: 0, limit: 50 * 1024 * 1024, percentage: 0 });
    } catch (err) {
      console.error("[knowledge] fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [instanceId]);

  // Initial load
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Poll for processing documents
  useEffect(() => {
    const hasProcessing = documents.some((d) => d.status === "processing");
    if (hasProcessing && !pollingRef.current) {
      pollingRef.current = setInterval(fetchDocuments, 3000);
    } else if (!hasProcessing && pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [documents, fetchDocuments]);

  function validateFile(file: File): string | null {
    if (file.size > MAX_FILE_SIZE) {
      return t("knowledge.errorFileTooLarge", { max: "10MB" });
    }
    
    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return t("knowledge.errorInvalidType", { types: "PDF, DOCX, TXT, MD" });
    }
    
    return null;
  }

  async function uploadFile(file: File) {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setTimeout(() => setError(null), 5000);
      return;
    }

    // Check storage limit
    if (storage.used + file.size > storage.limit) {
      setError(t("knowledge.errorStorageLimit"));
      setTimeout(() => setError(null), 5000);
      return;
    }

    setUploading(true);
    setUploadProgress({ filename: file.name, status: "uploading" });
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/instances/${instanceId}/knowledge/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Upload failed" }));
        throw new Error(data.error || "Upload failed");
      }

      const result = await res.json();
      setUploadProgress({ filename: file.name, status: "processing" });
      
      // Refresh documents to show new upload
      await fetchDocuments();
      setUploadProgress(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setError(message);
      setUploadProgress({ filename: file.name, status: "error" });
      setTimeout(() => {
        setUploadProgress(null);
        setError(null);
      }, 5000);
    } finally {
      setUploading(false);
    }
  }

  async function deleteDocument(docId: string, filename: string) {
    if (!confirm(t("knowledge.deleteConfirm", { filename }))) {
      return;
    }

    try {
      const res = await fetch(`/api/instances/${instanceId}/knowledge/${docId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Delete failed");
      
      // Remove from list optimistically
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
      
      // Refresh to get updated storage
      await fetchDocuments();
    } catch (err) {
      console.error("[knowledge] delete error:", err);
      setError(t("knowledge.deleteFailed"));
      setTimeout(() => setError(null), 3000);
    }
  }

  function handleDrag(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0]);
    }
    e.target.value = "";
  }

  const storageColor = storage.percentage > 90 ? "bg-red-500" : storage.percentage > 70 ? "bg-amber-500" : "bg-violet-500";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Storage usage bar */}
      <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-zinc-400" />
            <span className="text-sm text-zinc-300">{t("knowledge.storageUsed")}</span>
          </div>
          <span className="text-sm text-zinc-400">
            {formatFileSize(storage.used)} / {formatFileSize(storage.limit)} ({storage.percentage}%)
          </span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-500", storageColor)}
            style={{ width: `${Math.min(storage.percentage, 100)}%` }}
          />
        </div>
        {storage.percentage > 80 && (
          <p className="text-xs text-amber-400 mt-2 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {storage.percentage >= 100 
              ? t("knowledge.storageFull") 
              : t("knowledge.storageWarning")}
          </p>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span className="text-sm text-red-300 flex-1">{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload progress */}
      {uploadProgress && (
        <div className="flex items-center gap-3 bg-violet-500/10 border border-violet-500/20 rounded-xl px-4 py-3">
          {uploadProgress.status === "error" ? (
            <AlertCircle className="w-4 h-4 text-red-400" />
          ) : uploadProgress.status === "done" ? (
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          ) : (
            <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
          )}
          <div className="flex-1">
            <p className="text-sm text-zinc-300 truncate">{uploadProgress.filename}</p>
            <p className="text-xs text-zinc-500">
              {uploadProgress.status === "uploading" && t("knowledge.statusUploading")}
              {uploadProgress.status === "processing" && t("knowledge.statusProcessing")}
              {uploadProgress.status === "done" && t("knowledge.statusDone")}
              {uploadProgress.status === "error" && t("knowledge.statusError")}
            </p>
          </div>
        </div>
      )}

      {/* Drag & drop zone */}
      <div
        className={cn(
          "relative border-2 border-dashed rounded-2xl p-8 transition-all duration-200",
          dragActive
            ? "border-violet-500 bg-violet-500/10"
            : "border-white/10 bg-white/[0.02] hover:border-white/20",
          storage.percentage >= 100 && "opacity-50 pointer-events-none"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt,.md"
          className="hidden"
          onChange={handleFileSelect}
          disabled={uploading || storage.percentage >= 100}
        />
        
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4">
            <Upload className="w-8 h-8 text-violet-400" />
          </div>
          
          <h3 className="text-white font-medium mb-2">
            {storage.percentage >= 100 
              ? t("knowledge.storageFullTitle") 
              : t("knowledge.dropzoneTitle")}
          </h3>
          
          <p className="text-sm text-zinc-500 mb-4 max-w-sm">
            {storage.percentage >= 100 
              ? t("knowledge.storageFullDesc")
              : t("knowledge.dropzoneDesc", { max: "10MB" })}
          </p>
          
          {storage.percentage < 100 && (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-sm font-medium text-white transition-colors"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t("knowledge.uploading")}
                </>
              ) : (
                <>
                  <File className="w-4 h-4" />
                  {t("knowledge.selectFile")}
                </>
              )}
            </button>
          )}
          
          <p className="text-xs text-zinc-600 mt-4">
            {t("knowledge.supportedTypes", { types: "PDF, DOCX, TXT, MD" })}
          </p>
        </div>
      </div>

      {/* Documents list */}
      {documents.length > 0 ? (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-zinc-300 mb-3">
            {t("knowledge.documentsTitle")} ({documents.length})
          </h3>
          
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 hover:border-white/20 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-2xl shrink-0">{getFileIcon(doc.type, doc.filename)}</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{doc.filename}</p>
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <span>{formatFileSize(doc.fileSize)}</span>
                    <span>·</span>
                    <span>{formatDate(doc.createdAt)}</span>
                    {doc.chunkCount > 0 && (
                      <>
                        <span>·</span>
                        <span>{doc.chunkCount} chunks</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1",
                    doc.status === "ready"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : doc.status === "error"
                      ? "bg-red-500/10 text-red-400"
                      : "bg-amber-500/10 text-amber-400"
                  )}
                >
                  {doc.status === "processing" && (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  )}
                  {doc.status === "ready"
                    ? t("knowledge.ready")
                    : doc.status === "error"
                    ? t("knowledge.error")
                    : t("knowledge.processing")}
                </span>
                
                <button
                  onClick={() => deleteDocument(doc.id, doc.filename)}
                  className="text-zinc-500 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-white/5"
                  title={t("knowledge.delete")}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed border-white/10 rounded-xl">
          <FileText className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500 text-sm">{t("knowledge.empty")}</p>
          <p className="text-zinc-600 text-xs mt-1">{t("knowledge.emptyHint")}</p>
        </div>
      )}
    </div>
  );
}
