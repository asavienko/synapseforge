import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { email as emailService } from "@/lib/email";
import { createNotification } from "@/lib/notifications";

function isAdmin(email?: string | null) {
  const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim()).filter(Boolean);
  return adminEmails.includes(email ?? "");
}

async function getManagerRecord(email?: string | null) {
  if (!email) return null;
  return prisma.manager.findUnique({ where: { email } });
}

// GET: user fetches their own messages; admin/manager fetches by ?userId=
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const queryUserId = url.searchParams.get("userId");

  let userId = session.user.id;

  if (queryUserId) {
    const admin = isAdmin(session.user.email);
    const manager = admin ? null : await getManagerRecord(session.user.email);

    if (admin) {
      userId = queryUserId;
    } else if (manager) {
      // Verify this client belongs to the requesting manager
      const client = await prisma.user.findFirst({ where: { id: queryUserId, managerId: manager.id } });
      if (!client) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      userId = queryUserId;
    }
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { manager: { select: { calLink: true } } },
  });
  if (!user?.managerId) return NextResponse.json({ noManager: true }, { status: 200 });

  // Mark messages sent by manager as read (when manager opens the thread)
  if (queryUserId && userId !== session.user.id) {
    await prisma.message.updateMany({
      where: { userId, senderType: "user", read: false },
      data: { read: true },
    });
  } else {
    await prisma.message.updateMany({
      where: { userId, senderType: "manager", read: false },
      data: { read: true },
    });
  }

  const messages = await prisma.message.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ messages, calLink: user.manager?.calLink ?? null });
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

  const managerRecord = (!isAdmin(session.user.email) && asManager && queryUserId)
    ? await getManagerRecord(session.user.email)
    : null;

  if (asManager && queryUserId && (isAdmin(session.user.email) || managerRecord)) {
    // Admin or manager replying to a client
    const user = await prisma.user.findUnique({ where: { id: queryUserId } });
    if (!user?.managerId) return NextResponse.json({ error: "User has no manager assigned." }, { status: 400 });

    // Managers can only message their own clients
    if (managerRecord && user.managerId !== managerRecord.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const msg = await prisma.message.create({
      data: { body: body.trim(), senderType: "manager", userId: queryUserId, managerId: user.managerId },
    });

    // Notify the user that their manager replied
    const manager = await prisma.manager.findUnique({ where: { id: user.managerId } });
    if (manager && user.email) {
      emailService
        .newMessageFromManager(user.email, user.name ?? user.email, manager.name, body.trim().slice(0, 200))
        .catch(console.error);
    }

    // In-app notification for the client
    createNotification({
      userId: queryUserId,
      type: "manager.message",
      title: "New message from your manager",
      body: body.trim().substring(0, 100),
      href: "/en/dashboard/messages",
    }).catch(console.error);

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
