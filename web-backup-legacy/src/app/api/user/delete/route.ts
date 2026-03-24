import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * DELETE /api/user/delete
 * 
 * Permanently deletes the user's account and all associated data.
 * Required for GDPR compliance.
 */
export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    // Get user to check for Stripe subscription
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        stripeSubscriptionId: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Cancel Stripe subscription if exists
    if (user.stripeSubscriptionId) {
      try {
        const Stripe = (await import("stripe")).default;
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
          apiVersion: "2026-02-25.clover",
        });
        await stripe.subscriptions.cancel(user.stripeSubscriptionId);
      } catch (stripeError) {
        console.error("[delete-account] Failed to cancel Stripe subscription:", stripeError);
        // Continue with deletion even if Stripe cancellation fails
      }
    }

    // Delete all user data in correct order (respecting foreign keys)
    await prisma.$transaction([
      // 1. Delete webhook deliveries
      prisma.webhookDelivery.deleteMany({
        where: { webhook: { userId } },
      }),

      // 2. Delete webhooks
      prisma.webhook.deleteMany({
        where: { userId },
      }),

      // 3. Delete usage events
      prisma.usageEvent.deleteMany({
        where: { userId },
      }),

      // 4. Delete credentials
      prisma.userCredential.deleteMany({
        where: { userId },
      }),

      // 5. Delete feedback
      prisma.feedback.deleteMany({
        where: { userId },
      }),

      // 6. Delete manager notes
      prisma.clientNote.deleteMany({
        where: { userId },
      }),

      // 7. Delete referral conversions for this user
      prisma.referralConversion.deleteMany({
        where: { referredUserId: userId },
      }),

      // 8. Delete referrals created by this user
      prisma.referral.deleteMany({
        where: { referrerId: userId },
      }),

      // 9. Delete API keys (via instances)
      prisma.apiKey.deleteMany({
        where: { instance: { userId } },
      }),

      // 10. Delete instances (this cascades to chat messages, knowledge, etc.)
      prisma.aIInstance.deleteMany({
        where: { userId },
      }),

      // 11. Finally, delete the user
      prisma.user.delete({
        where: { id: userId },
      }),
    ]);

    console.log(`[delete-account] Successfully deleted user ${userId}`);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[delete-account] Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete account. Please contact support." },
      { status: 500 }
    );
  }
}
