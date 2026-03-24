// GET — list all OpenClawVersion records
// POST { tag, imageRef, changelog, stable } — create new version
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { queueVersionUpdate } from "@/lib/command-queue";
import { NextRequest, NextResponse } from "next/server";

function isAdmin(email?: string | null) {
  const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim()).filter(Boolean);
  return adminEmails.includes(email ?? "");
}

export async function GET() {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const versions = await prisma.openClawVersion.findMany({
    orderBy: { publishedAt: "desc" },
  });

  return NextResponse.json({ versions });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tag, imageRef, changelog, stable } = await req.json();
  if (!tag || !imageRef) {
    return NextResponse.json({ error: "tag and imageRef are required" }, { status: 400 });
  }

  const version = await prisma.openClawVersion.create({
    data: {
      tag,
      imageRef,
      changelog: changelog ?? null,
      stable: stable ?? false,
    },
  });

  // Auto-queue updates for all autoUpdate=true running instances when stable version is published
  if (stable) {
    const autoUpdateInstances = await prisma.aIInstance.findMany({
      where: { autoUpdate: true, status: "running" },
      select: { id: true },
    });
    for (const inst of autoUpdateInstances) {
      await queueVersionUpdate(inst.id, tag, "auto-update").catch(console.error);
    }
  }

  return NextResponse.json({ version });
}
