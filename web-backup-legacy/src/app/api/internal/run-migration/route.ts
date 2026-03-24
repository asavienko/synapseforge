import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { migrateEmbeddings } from '@/lib/migrate-embeddings';

const INTERNAL_SECRET = process.env.INTERNAL_API_KEY;

export async function POST(req: NextRequest) {
  // Auth via shared secret header
  const authHeader = req.headers.get('x-internal-api-key');
  if (!INTERNAL_SECRET || authHeader !== INTERNAL_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { jobId, instanceId } = (await req.json()) as { jobId: string; instanceId: string };

  if (!jobId || !instanceId) {
    return NextResponse.json({ error: 'Missing jobId or instanceId' }, { status: 400 });
  }

  // Mark job as running
  await prisma.migrationJob.update({
    where: { id: jobId },
    data: { status: 'running', progress: 1 },
  });

  try {
    const result = await migrateEmbeddings();

    await prisma.migrationJob.update({
      where: { id: jobId },
      data: {
        status: 'completed',
        progress: 100,
        completedAt: new Date(),
        logs: JSON.stringify(result),
      },
    });

    return NextResponse.json({ ok: true, jobId, result });
  } catch (error) {
    await prisma.migrationJob.update({
      where: { id: jobId },
      data: {
        status: 'failed',
        error: error instanceof Error ? error.message : String(error),
        completedAt: new Date(),
      },
    });

    return NextResponse.json(
      { error: 'Migration failed', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
