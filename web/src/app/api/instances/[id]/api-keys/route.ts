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

    // Get API keys from UserCredential table
    const credentials = await prisma.userCredential.findMany({
      where: { 
        userId: session.user.id,
        key: { startsWith: `api_key_${id}_` }
      },
      select: {
        id: true,
        key: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Format keys for response
    const keys = credentials.map((cred) => {
      // Extract name from key (api_key_instanceId_name)
      const parts = cred.key.split("_");
      const name = parts.slice(3).join("_") || "API Key";
      
      return {
        id: cred.id,
        name: name,
        key: cred.key.replace(`api_key_${id}_`, "sf_"), // Mask the full key
        createdAt: cred.createdAt,
        lastUsedAt: cred.updatedAt,
      };
    });

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
    const storageKey = `api_key_${id}_${name.trim()}`;

    // Store in database
    const credential = await prisma.userCredential.create({
      data: {
        userId: session.user.id,
        key: storageKey,
        value: keyValue,
      },
    });

    return NextResponse.json({
      key: {
        id: credential.id,
        name: name.trim(),
        key: keyValue,
        createdAt: credential.createdAt,
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
