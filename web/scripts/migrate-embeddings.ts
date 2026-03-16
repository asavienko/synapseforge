#!/usr/bin/env tsx
import { prisma } from '../src/lib/prisma';
import { migrateEmbeddings } from '../src/lib/migrate-embeddings';

async function main() {
  console.log('='.repeat(60));
  console.log('Knowledge Embedding Migration');
  console.log('Convert JSON embeddings to pgvector format');
  console.log('='.repeat(60));
  console.log();

  // Pre-flight checks
  console.log('[1/3] Pre-flight checks...');

  const dbStatus = await prisma.$queryRaw<Array<{ name: string }>>`
    SELECT extensionname FROM pg_extension WHERE extensionname = 'vector'
  `;
  if (dbStatus.length === 0) {
    console.error('❌ pgvector extension is not installed in the database.');
    console.error('   Run: CREATE EXTENSION IF NOT EXISTS vector;');
    process.exit(1);
  }
  console.log('   ✅ pgvector extension is available');

  const totalChunks = await prisma.$queryRaw<Array<{ count: bigint }>>`
    SELECT COUNT(*) as "count" FROM "KnowledgeChunk"
  `;
  const total = Number(totalChunks[0]?.count ?? 0);
  console.log(`   ✅ Total chunks in database: ${total}`);

  const jsonEmbeddings = await prisma.$queryRaw<Array<{ count: bigint }>>`
    SELECT COUNT(*) as "count" FROM "KnowledgeChunk" WHERE "embedding" IS NOT NULL AND "embedding" NOT LIKE '[%'
  `;
  const jsonCount = Number(jsonEmbeddings[0]?.count ?? 0);
  if (jsonCount === 0) {
    console.log('   ✅ No JSON embeddings found. Migration may have already run.');
  } else {
    console.log(`   ⚠️  Found ${jsonCount} chunks with JSON embeddings to migrate`);
  }

  console.log();
  console.log('[2/3] Running migration...');
  console.log();

  const result = await migrateEmbeddings();

  console.log();
  console.log('[3/3] Verification...');
  console.log();

  const afterStatus = await prisma.$queryRaw<Array<{ count: bigint }>>`
    SELECT COUNT(*) as "count" FROM "KnowledgeChunk" WHERE "embedding" IS NOT NULL
  `;
  const afterTotal = Number(afterStatus[0]?.count ?? 0);
  console.log(`   Total chunks with embedding: ${afterTotal}`);

  const sample = await prisma.$queryRaw<any[]>`
    SELECT "id", pg_typeof("embedding") as "type"
    FROM "KnowledgeChunk"
    WHERE "embedding" IS NOT NULL
    LIMIT 1
  `;
  if (sample[0]) {
    console.log(`   Sample embedding column type: ${sample[0].type}`);
  }

  console.log();
  console.log('='.repeat(60));
  console.log('Migration complete!');
  console.log(`Migrated: ${result.migrated} chunks`);
  console.log(`Skipped: ${result.skipped} chunks`);
  console.log('='.repeat(60));
}

main().catch((err) => {
  console.error();
  console.error('❌ Migration failed:', err);
  process.exit(1);
});