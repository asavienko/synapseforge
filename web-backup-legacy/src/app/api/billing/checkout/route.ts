import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { STRIPE_PLANS, PlanKey, getSelfServicePlans, getManagedPlans } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Graceful degradation: if Stripe is not configured, return a flag so the
  // client can show a "contact us" fallback instead of a crash.
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ stripeUnavailable: true }, { status: 200 });
  }

  const { plan } = (await req.json()) as { plan: PlanKey };

  // Validate plan exists
  if (!STRIPE_PLANS[plan]) {
    return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

  // Free plan — no Stripe needed
  if (plan === "free") {
    await prisma.user.update({
      where: { id: user.id },
      data: { plan: "free", stripeSubscriptionId: null, stripePriceId: null, stripeCurrentPeriodEnd: null },
    });
    return NextResponse.json({ success: true, downgradedToFree: true });
  }

  // Check if plan has a valid price ID configured
  const planConfig = STRIPE_PLANS[plan];
  if (!planConfig.priceId) {
    // For managed plans without Stripe price IDs, redirect to contact
    if (getManagedPlans().includes(plan)) {
      return NextResponse.json({ 
        managedPlanContact: true, 
        message: "Managed plans require setup. Please contact us." 
      }, { status: 200 });
    }
    return NextResponse.json({ error: "Plan not available for purchase at this time." }, { status: 400 });
  }

  // Lazy-import stripe only when key is available
  const { getStripe } = await import("@/lib/stripe");
  const stripe = getStripe();

  // Get or create Stripe customer
  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name ?? undefined,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const baseUrl = process.env.NEXTAUTH_URL!;

  // Build checkout session metadata
  const metadata: Record<string, string> = {
    userId: user.id,
    plan,
  };

  // Add support hours info for managed plans
  if (getManagedPlans().includes(plan)) {
    metadata.supportHours = String(planConfig.supportHours);
    metadata.isManaged = "true";
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: planConfig.priceId, quantity: 1 }],
    success_url: `${baseUrl}/dashboard/billing?success=1&plan=${plan}`,
    cancel_url: `${baseUrl}/dashboard/billing?cancelled=1`,
    subscription_data: {
      metadata,
    },
    allow_promotion_codes: true,
    metadata,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
