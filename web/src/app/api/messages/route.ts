import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { email as emailService } from "@/lib/email";

function isAdmin(email?: string | null) {
  const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim()).filter(Boolean);
  return adminEmails.includes(email ?? "");
}

// GET: user fetches their own messages; admin fetches by ?userId=
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const queryUserId = url.searchParams.get("userId");

  let userId = session.user.id;

  if (queryUserId && isAdmin(session.user.email)) {
    userId = queryUserId;
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.managerId) return NextResponse.json({ noManager: true }, { status: 200 });

  // Mark messages sent by manager as read
  await prisma.message.updateMany({
    where: { userId, senderType: "manager", read: false },
    data: { read: true },
  });

  const messages = await prisma.message.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(messages);
}

// POST: user sends a message; admin sends as manager (with ?asManager=true&userId=)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const asManager = url.searchParams.get("asManager") === "true";
  const queryUserId = url.searchParams.get("userId");

  const { body } = await req.json();
  if (!body?.trim()) return NextResponse.json({ error: "Message cannot be empty." }, { status: 400 });

  if (asManager && isAdmin(session.user.email) && queryUserId) {
    // Admin replying as manager
    const user = await prisma.user.findUnique({ where: { id: queryUserId } });
    if (!user?.managerId) return NextResponse.json({ error: "User has no manager assigned." }, { status: 400 });

    const msg = await prisma.message.create({
      data: { body: body.trim(), senderType: "manager", userId: queryUserId, managerId: user.managerId },
    });
    return NextResponse.json(msg, { status: 201 });
  }

  // Regular user sending to their manager
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.managerId) return NextResponse.json({ error: "No manager assigned yet." }, { status: 400 });

  const msg = await prisma.message.create({
    data: { body: body.trim(), senderType: "user", userId: session.user.id, managerId: user.managerId },
  });

  // Notify manager by email
  const manager = await prisma.manager.findUnique({ where: { id: user.managerId } });
  if (manager) {
    emailService.newMessage(manager.email, manager.name, user.name ?? user.email, body.trim().slice(0, 200)).catch(console.error);
  }

  return NextResponse.json(msg, { status: 201 });
}
