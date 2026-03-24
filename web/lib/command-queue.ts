import { prisma } from "@/lib/prisma";

export type CommandType =
  | "update_version"
  | "rollback_restic"
  | "take_restic_snapshot"
  | "rollback_machine"
  | "restart";

export async function queueCommand(
  instanceId: string,
  type: CommandType,
  payload?: Record<string, unknown>,
  requestedBy?: string,
  note?: string
) {
  return prisma.instanceCommand.create({
    data: {
      instanceId,
      type,
      payload: payload ? JSON.stringify(payload) : null,
      requestedBy: requestedBy ?? "system",
      note: note ?? null,
      status: "pending",
    },
  });
}

export async function getNextPendingCommand(instanceId: string) {
  return prisma.instanceCommand.findFirst({
    where: { instanceId, status: "pending" },
    orderBy: { createdAt: "asc" },
  });
}

// Safety rule: update_version commands require a recent successful snapshot
export async function queueVersionUpdate(
  instanceId: string,
  tag: string,
  requestedBy: string
) {
  // Queue snapshot first, then update
  await queueCommand(
    instanceId,
    "take_restic_snapshot",
    {},
    requestedBy,
    `pre-update:${tag}`
  );
  await queueCommand(
    instanceId,
    "update_version",
    { tag },
    requestedBy,
    `Update to ${tag}`
  );
}
