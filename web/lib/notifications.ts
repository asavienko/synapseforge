import { prisma } from "@/lib/prisma";

export async function createNotification({
  userId,
  type,
  title,
  body,
  href,
}: {
  userId: string;
  type: string;
  title: string;
  body?: string;
  href?: string;
}) {
  return prisma.notification.create({
    data: { userId, type, title, body: body ?? null, href: href ?? null },
  });
}
