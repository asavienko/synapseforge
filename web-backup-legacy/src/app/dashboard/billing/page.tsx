import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { BillingClient } from "./BillingClient";

export default async function BillingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      plan: true,
      stripeCustomerId: true,
      stripeSubscriptionId: true,
      stripeCurrentPeriodEnd: true,
    },
  });

  if (!user) redirect("/sign-in");

  return (
    <BillingClient
      plan={user.plan}
      hasSubscription={!!user.stripeSubscriptionId}
      periodEnd={user.stripeCurrentPeriodEnd?.toISOString() ?? null}
    />
  );
}
