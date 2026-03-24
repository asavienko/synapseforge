import { prisma } from "@/lib/prisma";
export { healthScoreLabel } from "@/lib/health-score-utils";

export interface HealthFactors {
  hasRunningInstance: boolean;
  hasCredentials: boolean;
  messageCountLast7d: number;
  daysSinceLastMessage: number;
  activatedAt: Date | null;
}

export function computeHealthScore(factors: HealthFactors): number {
  let score = 0;

  // Running instance: 30 points
  if (factors.hasRunningInstance) score += 30;

  // Has credentials: 20 points
  if (factors.hasCredentials) score += 20;

  // Activity: up to 30 points based on messages last 7 days
  const activityScore = Math.min(30, factors.messageCountLast7d * 3);
  score += activityScore;

  // Recency: up to 20 points
  if (factors.daysSinceLastMessage === 0) score += 20;
  else if (factors.daysSinceLastMessage <= 1) score += 15;
  else if (factors.daysSinceLastMessage <= 3) score += 10;
  else if (factors.daysSinceLastMessage <= 7) score += 5;
  // else: 0 points (inactive > 7 days)

  return Math.min(100, score);
}

export async function computeUserHealthScore(userId: string): Promise<number> {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [instances, credentials, recentMessages, lastMessage, user] = await Promise.all([
    prisma.aIInstance.findMany({ where: { userId, status: "running" } }),
    prisma.instanceCredential.findMany({ where: { instance: { userId } }, take: 1 }),
    prisma.chatMessage.count({
      where: { instance: { userId }, createdAt: { gte: oneWeekAgo } },
    }),
    prisma.chatMessage.findFirst({
      where: { instance: { userId } },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),
    prisma.user.findUnique({ where: { id: userId }, select: { activatedAt: true } }),
  ]);

  const daysSinceLastMessage = lastMessage
    ? Math.floor((Date.now() - lastMessage.createdAt.getTime()) / 86400000)
    : 999;

  return computeHealthScore({
    hasRunningInstance: instances.length > 0,
    hasCredentials: credentials.length > 0,
    messageCountLast7d: recentMessages,
    daysSinceLastMessage,
    activatedAt: user?.activatedAt ?? null,
  });
}
