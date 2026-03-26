import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const VALID_COMMAND_TYPES = ["start", "stop", "restart", "update_version", "rollback_restic", "take_restic_snapshot", "rollback_machine"] as const;
type CommandType = typeof VALID_COMMAND_TYPES[number];

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const instance = await prisma.aIInstance.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!instance) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const commands = await prisma.instanceCommand.findMany({
    where: { instanceId: id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json({ commands });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  // Validate command type
  const type = body.type as CommandType;
  if (!VALID_COMMAND_TYPES.includes(type)) {
    return NextResponse.json(
      { error: `Invalid command type. Must be one of: ${VALID_COMMAND_TYPES.join(", ")}` },
      { status: 400 }
    );
  }

  // Verify instance ownership
  const instance = await prisma.aIInstance.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!instance) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // For start/stop commands, check if there's already a pending command
  if (type === "start" || type === "stop") {
    const existingPending = await prisma.instanceCommand.findFirst({
      where: { 
        instanceId: id, 
        type: { in: ["start", "stop"] },
        status: "pending" 
      },
    });
    
    if (existingPending) {
      return NextResponse.json(
        { error: `A ${existingPending.type} command is already pending` },
        { status: 409 }
      );
    }
  }

  // Create the command
  const command = await prisma.instanceCommand.create({
    data: {
      instanceId: id,
      type,
      status: "pending",
      payload: body.payload ? JSON.stringify(body.payload) : JSON.stringify({ requestedBy: session.user.id }),
      requestedBy: session.user.id,
      note: body.note ?? null,
    },
  });

  return NextResponse.json({ command }, { status: 201 });
}
