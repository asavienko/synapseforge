import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { insertChunkWithEmbedding, getKnowledgeBaseStorage, getStorageLimits } from '@/lib/knowledge';
import { extractText, isSupportedFileType, FileType } from '@/lib/knowledge/extract';
import { chunkText, Chunk } from '@/lib/knowledge/chunk';
import { generateEmbedding } from '@/lib/knowledge/embeddings';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  
  // Get instance with user plan info
  const instance = await prisma.aIInstance.findFirst({
    where: { id, userId: session.user.id },
    include: { user: { select: { plan: true } } },
  });
  
  if (!instance)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Parse form data
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  // Check file type support
  if (!isSupportedFileType(file.name, file.type)) {
    return NextResponse.json(
      { error: "Unsupported file type. Supported: PDF, DOCX, TXT, MD" },
      { status: 400 }
    );
  }

  // Get storage limits based on plan
  const { maxBytesPerFile, maxTotalBytes } = getStorageLimits(instance.user.plan);

  // Check file size (max 10MB per file)
  if (file.size > maxBytesPerFile) {
    return NextResponse.json(
      { error: `File too large (max ${Math.round(maxBytesPerFile / 1024 / 1024)}MB)` },
      { status: 400 }
    );
  }

  // Check total storage limit
  const currentStorage = await getKnowledgeBaseStorage(id);
  if (currentStorage.totalBytes + file.size > maxTotalBytes) {
    return NextResponse.json(
      { 
        error: "Storage limit exceeded", 
        message: `You have used ${Math.round(currentStorage.totalBytes / 1024 / 1024)}MB of your ${Math.round(maxTotalBytes / 1024 / 1024)}MB limit. Please delete some documents or upgrade your plan.` 
      },
      { status: 413 }
    );
  }

  // Determine file type
  const fileType: FileType = (() => {
    const ext = file.name.toLowerCase().split('.').pop();
    if (ext === 'pdf') return 'pdf';
    if (ext === 'docx') return 'docx';
    if (ext === 'md') return 'md';
    return 'txt';
  })();

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
      type: fileType,
      status: "processing",
    },
  });

  // Process async (don't await — return immediately)
  (async () => {
    try {
      // Read file as buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Extract text based on file type
      const extracted = await extractText(buffer, file.name, file.type);

      // Update doc with extracted content
      await prisma.knowledgeDoc.update({
        where: { id: doc.id },
        data: { 
          contentText: extracted.text.slice(0, 100000), // Store first 100KB of text
        },
      });

      // Chunk the text
      const chunks: Chunk[] = chunkText(extracted.text, 1000, 200);

      // Generate embeddings and insert chunks
      let processedChunks = 0;
      for (const chunk of chunks) {
        try {
          const embedding = await generateEmbedding(chunk.content);
          await insertChunkWithEmbedding(
            doc.id, 
            chunk.content, 
            embedding,
            chunk.metadata
          );
          processedChunks++;
        } catch (err) {
          console.error(`[knowledge] Failed to process chunk ${processedChunks}:`, err);
          // Continue with other chunks
        }
      }

      // Update doc status to ready
      await prisma.knowledgeDoc.update({
        where: { id: doc.id },
        data: { 
          status: "ready",
          chunkCount: processedChunks,
        },
      });

      console.log(`[knowledge] Processed ${file.name}: ${processedChunks} chunks created`);
    } catch (err) {
      console.error("[knowledge] processing error:", err);
      await prisma.knowledgeDoc
        .update({ where: { id: doc.id }, data: { status: "error" } })
        .catch(console.error);
    }
  })();

  return NextResponse.json({ 
    id: doc.id, 
    name: file.name,
    status: "processing",
    chunkCount: 0
  });
}
