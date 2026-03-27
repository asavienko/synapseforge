import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(
  _req: NextRequest,
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
    return NextResponse.json({ error: "Instance not found" }, { status: 404 });

  // Count embeddings needing migration (JSON strings)
  const result = await prisma.$queryRaw<Array<{ count: bigint }>>`
    SELECT COUNT(*) as "count"
    FROM "KnowledgeChunk" k
    JOIN "KnowledgeDoc" d ON k."docId" = d."id"
    JOIN "knowledge_base" b ON d."knowledgeBaseId" = b."id"
    JOIN "AIInstance" i ON b."instanceId" = i."id"
    WHERE i."id" = ${id}
      AND k."embedding" IS NOT NULL
      AND pg_typeof(k."embedding") = 'text'::regtype
  `;

  const total = Number(result[0]?.count ?? 0);
  if (total === 0) {
    return NextResponse.json({ ok: true, migrated: 0, message: "No legacy embeddings found" });
  }

  // Process in batches
  const batchSize = 50;
  let migrated = 0;

  for (let offset = 0; offset < total; offset += batchSize) {
    const chunks = await prisma.$queryRaw<
      Array<{ id: string; embedding: string }>
    >`
      SELECT k."id", k."embedding"
      FROM "KnowledgeChunk" k
      JOIN "KnowledgeDoc" d ON k."docId" = d."id"
      JOIN "knowledge_base" b ON d."knowledgeBaseId" = b."id"
      JOIN "AIInstance" i ON b."instanceId" = i."id"
      WHERE i."id" = ${id}
        AND k."embedding" IS NOT NULL
        AND pg_typeof(k."embedding") = 'text'::regtype
      LIMIT ${batchSize}
      OFFSET ${offset}
    `;

    for (const chunk of chunks) {
      try {
        const vector = JSON.parse(chunk.embedding) as number[];
        if (Array.isArray(vector) && vector.length === 1536) {
          const vectorStr = `[${vector.join(',')}]`;
          await prisma.$executeRaw`
            UPDATE "KnowledgeChunk"
            SET "embedding" = ${vectorStr}::vector
            WHERE "id" = ${chunk.id}
          `;
          migrated++;
        }
      } catch {
        // Skip malformed
      }
    }
  }

  return NextResponse.json({ ok: true, migrated, total });
}