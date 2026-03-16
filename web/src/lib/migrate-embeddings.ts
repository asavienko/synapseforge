import { prisma } from '@/lib/prisma';

/**
 * Migrate all knowledge chunk embeddings from JSON strings to pgvector vectors.
 * Run this once against the production database after schema migration.
 */
export async function migrateEmbeddings() {
  console.log('Starting embedding migration...');

  // Find all chunks with embedding != null (using raw SQL to bypass Prisma type limitations)
  const chunks = await prisma.$queryRaw<
    Array<{ id: string; embedding: string }>
  >`SELECT "id", "embedding" FROM "KnowledgeChunk" WHERE "embedding" IS NOT NULL`;

  console.log(`Found ${chunks.length} chunks with embeddings to migrate`);

  let migrated = 0;
  let skipped = 0;

  for (const chunk of chunks) {
    try {
      const vector = JSON.parse(chunk.embedding) as number[];
      if (!Array.isArray(vector) || vector.length !== 1536) {
        console.warn(`Chunk ${chunk.id}: invalid embedding vector length ${vector?.length}, skipping`);
        skipped++;
        continue;
      }

      const vectorStr = `[${vector.join(',')}]`;
      await prisma.$executeRaw`
        UPDATE "KnowledgeChunk"
        SET "embedding" = ${vectorStr}::vector
        WHERE "id" = ${chunk.id}
      `;
      migrated++;
      if (migrated % 100 === 0) {
        console.log(`Migrated ${migrated}/${chunks.length}...`);
      }
    } catch (err) {
      console.error(`Failed to migrate chunk ${chunk.id}:`, err);
      skipped++;
    }
  }

  console.log(`Migration complete: ${migrated} migrated, ${skipped} skipped`);
  return { migrated, skipped };
}

/**
 * Verify migration: check if any embeddings are still stored as JSON strings.
 */
export async function verifyMigration() {
  const totalResult = await prisma.$queryRaw<Array<{ count: bigint }>>`SELECT COUNT(*) as "count" FROM "KnowledgeChunk"`;
  const total = Number(totalResult[0]?.count ?? 0);

  const nullResult = await prisma.$queryRaw<Array<{ count: bigint }>>`SELECT COUNT(*) as "count" FROM "KnowledgeChunk" WHERE "embedding" IS NULL`;
  const vectorNull = Number(nullResult[0]?.count ?? 0);

  const sample = await prisma.$queryRaw<any[]>`
    SELECT "id", pg_typeof("embedding") as type
    FROM "KnowledgeChunk"
    WHERE "embedding" IS NOT NULL
    LIMIT 1
  `;

  console.log(`Total chunks: ${total}`);
  console.log(`Chunks without embedding: ${vectorNull}`);
  console.log(`Sample embedding type: ${sample[0]?.type}`);

  return {
    total,
    withoutEmbedding: vectorNull,
    sampleType: sample[0]?.type,
  };
}

// If run directly: `npx tsx src/lib/migrate-embeddings.ts`
if (require.main === module) {
  migrateEmbeddings()
    .then(() => verifyMigration())
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}