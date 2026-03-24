import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";
import { sshSyncConfig } from "@/lib/ssh-sync";

/**
 * POST /api/instances/[id]/sync-now
 *
 * Triggers an immediate config push to the VPS via SSH.
 * Any authenticated user can call this for their own instance.
 *
 * Primary path: SSH push (requires sshPrivateKey on instance)
 * Fallback path: mark configSynced = false + syncRequested = true (VPS picks up within 5 min)
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const instance = await prisma.aIInstance.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!instance) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!instance.vpsUrl) {
    return NextResponse.json(
      { ok: false, synced: false, message: "No VPS provisioned for this instance" },
      { status: 400 }
    );
  }

  // Primary path: SSH push
  if (instance.sshPrivateKey && instance.gatewayToken) {
    let decryptedKey: string;
    try {
      decryptedKey = decrypt(instance.sshPrivateKey);
    } catch {
      // Key decryption failed — fall through to fallback
      await prisma.aIInstance.update({
        where: { id },
        data: { configSynced: false, syncRequested: true },
      });
      await prisma.activityLog.create({
        data: {
          instanceId: id,
          event: "config_sync_requested",
          details: "SSH key decryption failed — queued for next cron poll",
        },
      }).catch(() => {});
      return NextResponse.json({
        ok: true,
        synced: false,
        fallback: true,
        message: "Config queued — will sync within 5 minutes",
      });
    }

    const appUrl = process.env.NEXTAUTH_URL ?? process.env.APP_URL ?? "";

    const result = await sshSyncConfig({
      privateKey: decryptedKey,
      vpsUrl: instance.vpsUrl,
      gatewayToken: instance.gatewayToken,
      appUrl,
      instanceId: id,
    });

    if (result.success) {
      // Mark as synced
      await prisma.aIInstance.update({
        where: { id },
        data: { configSynced: true, syncRequested: false },
      });
      await prisma.activityLog.create({
        data: {
          instanceId: id,
          event: "config_synced",
          details: "Config synced by user request via SSH",
        },
      }).catch(() => {});

      return NextResponse.json({
        ok: true,
        synced: true,
        message: "Config synced! Bot is restarting...",
      });
    } else {
      // SSH failed — fall through to queued sync
      await prisma.aIInstance.update({
        where: { id },
        data: { configSynced: false, syncRequested: true },
      });
      await prisma.activityLog.create({
        data: {
          instanceId: id,
          event: "config_sync_requested",
          details: `SSH sync failed (${result.error ?? "unknown error"}) — queued for cron poll`,
        },
      }).catch(() => {});

      return NextResponse.json({
        ok: true,
        synced: false,
        fallback: true,
        message: "Config queued — will sync within 5 minutes",
      });
    }
  }

  // Fallback path: no SSH key available — mark for sync
  await prisma.aIInstance.update({
    where: { id },
    data: { configSynced: false, syncRequested: true },
  });
  await prisma.activityLog.create({
    data: {
      instanceId: id,
      event: "config_sync_requested",
      details: "Sync requested by user — no SSH key, queued for cron poll",
    },
  }).catch(() => {});

  return NextResponse.json({
    ok: true,
    synced: false,
    fallback: true,
    message: "Config queued — will sync within 5 minutes",
  });
}
