/**
 * Public API key authentication helper.
 * Validates `Authorization: Bearer sf-live-*` headers.
 */
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export interface ApiKeyContext {
  keyId: string;
  instanceId: string;
  keyName: string;
}

export async function validateApiKey(req: NextRequest): Promise<ApiKeyContext | null> {
  const auth = req.headers.get("authorization") ?? "";
  if (!auth.startsWith("Bearer ")) return null;
  const rawKey = auth.slice(7).trim();
  if (!rawKey.startsWith("sf-live-")) return null;

  const record = await prisma.apiKey.findUnique({
    where: { key: rawKey },
    select: { id: true, instanceId: true, name: true },
  });

  if (!record) return null;

  // Update lastUsedAt (fire-and-forget)
  prisma.apiKey.update({
    where: { id: record.id },
    data: { lastUsedAt: new Date() },
  }).catch(() => {});

  return { keyId: record.id, instanceId: record.instanceId, keyName: record.name };
}

export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
};
