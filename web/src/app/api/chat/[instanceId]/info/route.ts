import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

/**
 * GET /api/chat/[instanceId]/info
 *
 * Returns public metadata for the chat widget (name, status).
 * No auth required.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ instanceId: string }> }
) {
  const { instanceId } = await params;

  const instance = await prisma.aIInstance.findUnique({
    where: { id: instanceId },
    select: { name: true, status: true },
  });

  if (!instance) {
    return NextResponse.json(
      { error: "Not found" },
      { status: 404, headers: CORS_HEADERS }
    );
  }

  return NextResponse.json(
    {
      name: instance.name,
      offline: instance.status !== "running",
    },
    { headers: CORS_HEADERS }
  );
}
