import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

// GET /api/instances/[id]/api-keys - List API keys
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify instance ownership
    const instance = await prisma.aIInstance.findFirst({
      where: { id, user: { email: session.user.email } },
      select: { id: true },
    });

    if (!instance) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Get API keys from ApiKey table
    const apiKeys = await prisma.apiKey.findMany({
      where: { instanceId: id },
      select: {
        id: true,
        name: true,
        preview: true,
        createdAt: true,
        lastUsedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Format keys for response
    const keys = apiKeys.map((k) => ({
      id: k.id,
      name: k.name,
      key: k.preview, // Use preview (masked) for display
      createdAt: k.createdAt,
      lastUsedAt: k.lastUsedAt,
    }));

    return NextResponse.json({ keys });
  } catch (error) {
    console.error("[api-keys] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch API keys" },
      { status: 500 }
    );
  }
}

// POST /api/instances/[id]/api-keys - Create API key
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { name } = await req.json();

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Verify instance ownership
    const instance = await prisma.aIInstance.findFirst({
      where: { id, userId: session.user.id },
      select: { id: true },
    });

    if (!instance) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Generate API key
    const keyValue = `sf_${randomBytes(32).toString("hex")}`;
    const preview = `sf_${keyValue.slice(3, 11)}...${keyValue.slice(-4)}`;

    // Store in database
    const apiKey = await prisma.apiKey.create({
      data: {
        instanceId: id,
        name: name.trim(),
        key: keyValue,
        preview,
      },
    });

    return NextResponse.json({
      key: {
        id: apiKey.id,
        name: apiKey.name,
        key: keyValue, // Return full key only on creation
        createdAt: apiKey.createdAt,
        lastUsedAt: null,
      },
    });
  } catch (error) {
    console.error("[api-keys] Error:", error);
    return NextResponse.json(
      { error: "Failed to create API key" },
      { status: 500 }
    );
  }
}
