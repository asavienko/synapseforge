import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';
import { migrateEmbeddings } from '@/lib/migrate-embeddings';

/**
 * Admin endpoint to migrate knowledge embeddings from JSON to pgvector.
 * Only accessible to admin users.
 *
 * POST /api/admin/instances/[id]/knowledge/migrate
 *
 * This runs the migration synchronously and returns when complete.
 * For large datasets, it may take several minutes.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check admin status
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (user?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const instance = await prisma.aIInstance.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!instance) {
    return NextResponse.json({ error: 'Instance not found' }, { status: 404 });
  }

  // Check if migration already running or completed
  const existingJob = await prisma.migrationJob.findFirst({
    where: { instanceId: id, type: 'knowledge_embeddings', status: { in: ['pending', 'queued', 'running'] } },
    orderBy: { createdAt: 'desc' },
  });

  if (existingJob) {
    return NextResponse.json({
      error: 'Migration already in progress',
      jobId: existingJob.id,
      status: existingJob.status,
    }, { status: 409 });
  }

  // Create migration job record
  const jobId = randomUUID();
  await prisma.migrationJob.create({
    data: {
      id: jobId,
      instanceId: id,
      type: 'knowledge_embeddings',
      status: 'running',
      progress: 0,
      startedAt: new Date(),
    },
  });

  try {
    // Run migration and capture output
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

    return NextResponse.json({ ok: true, jobId, status: 'completed', result });
  } catch (error) {
    await prisma.migrationJob.update({
      where: { id: jobId },
      data: {
        status: 'failed',
        error: error instanceof Error ? error.message : String(error),
        completedAt: new Date(),
      },
    });

    return NextResponse.json({
      error: 'Migration failed',
      jobId,
      message: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}

/**
 * Get migration job status
 * GET /api/admin/instances/[id]/knowledge/migrate/[jobId]
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; jobId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (user?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id, jobId } = await params;
  const job = await prisma.migrationJob.findFirst({
    where: { id: jobId, instanceId: id },
  });

  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  return NextResponse.json({
    jobId: job.id,
    type: job.type,
    status: job.status,
    progress: job.progress,
    startedAt: job.startedAt,
    completedAt: job.completedAt,
    error: job.error,
    logs: job.logs ? JSON.parse(job.logs) : null,
  });
}

/**
 * List migration jobs for an instance
 * GET /api/admin/instances/[id]/knowledge/migrate
 */
export async function listJobs(instanceId: string) {
  const jobs = await prisma.migrationJob.findMany({
    where: { instanceId, type: 'knowledge_embeddings' },
    orderBy: { startedAt: 'desc' },
    take: 10,
  });
  return jobs.map(job => ({
    jobId: job.id,
    status: job.status,
    progress: job.progress,
    startedAt: job.startedAt,
    completedAt: job.completedAt,
    error: job.error,
  }));
}