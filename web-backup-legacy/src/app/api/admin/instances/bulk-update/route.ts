// POST { tag: string, instanceIds: string[] }
// Queues update_version commands for multiple instances at once
import { auth } from "@/lib/auth";
import { queueVersionUpdate } from "@/lib/command-queue";
import { NextRequest, NextResponse } from "next/server";

function isAdmin(email?: string | null) {
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
  return adminEmails.includes(email ?? "");
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tag, instanceIds } = await req.json() as { tag: string; instanceIds: string[] };

  if (!tag || !Array.isArray(instanceIds) || instanceIds.length === 0) {
    return NextResponse.json({ error: "tag and instanceIds are required" }, { status: 400 });
  }

  let queued = 0;
  for (const instanceId of instanceIds) {
    await queueVersionUpdate(instanceId, tag, session.user.email ?? "admin");
    queued++;
  }

  return NextResponse.json({ ok: true, queued });
}
