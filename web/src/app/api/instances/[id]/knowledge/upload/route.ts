import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { insertChunkWithEmbedding } from '@/lib/knowledge';
import { randomUUID } from 'crypto';

// Inline text chunker (no external dep required)
function chunkText(text: string, chunkSize = 1000, overlap = 200): string[] {
  const chunks: string[] = [];
  let i = 0;
  while (i < text.length) {
    chunks.push(text.slice(i, i + chunkSize));
    i += chunkSize - overlap;
  }
  return chunks;
}

async function getEmbedding(text: string): Promise<number[] | null> {
  if (!process.env.OPENAI_API_KEY) return null;
  try {
    const res = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({ input: text, model: "text-embedding-3-small" }),
    });
    const data = await res.json();
    return data.data?.[0]?.embedding ?? null;
  } catch {
    return null;
  }
}

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const instance = await prisma.aIInstance.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!instance)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Parse form data
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  // Size limit: 10MB
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json(
      { error: "File too large (max 10MB)" },
      { status: 400 }
    );
  }

  // Only text/plain and text/markdown for now
  const allowedTypes = ["text/plain", "text/markdown", "application/json"];
  if (
    !allowedTypes.includes(file.type) &&
    !file.name.endsWith(".txt") &&
    !file.name.endsWith(".md")
  ) {
    return NextResponse.json(
      { error: "Only .txt and .md files supported" },
      { status: 400 }
    );
  }

  // Ensure KnowledgeBase exists
  let kb = await prisma.knowledgeBase.findUnique({ where: { instanceId: id } });
  if (!kb) {
    kb = await prisma.knowledgeBase.create({ data: { instanceId: id } });
  }

  // Create doc record
  const doc = await prisma.knowledgeDoc.create({
    data: {
      knowledgeBaseId: kb.id,
      filename: file.name,
      fileSize: file.size,
      status: "processing",
    },
  });

  // Process async (don't await — return immediately)
  (async () => {
    try {
      const text = await file.text();
      const chunks = chunkText(text);

      for (const chunk of chunks) {
        const embedding = await getEmbedding(chunk);
        if (embedding) {
          await insertChunkWithEmbedding(doc.id, chunk, embedding);
        } else {
          // Fallback: skip embedding, still store chunk without vector (for degraded search)
          await prisma.knowledgeChunk.create({
            data: {
              docId: doc.id,
              content: chunk,
            },
          });
        }
      }

      await prisma.knowledgeDoc.update({
        where: { id: doc.id },
        data: { status: "ready" },
      });
    } catch (err) {
      console.error("[knowledge] processing error:", err);
      await prisma.knowledgeDoc
        .update({ where: { id: doc.id }, data: { status: "error" } })
        .catch(console.error);
    }
  })();

  return NextResponse.json({ ok: true, docId: doc.id, status: "processing" });
}