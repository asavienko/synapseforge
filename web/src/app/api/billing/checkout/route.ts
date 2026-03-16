import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { STRIPE_PLANS, PlanKey } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Graceful degradation: if Stripe is not configured, return a flag so the
  // client can show a "contact us" fallback instead of a crash.
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ stripeUnavailable: true }, { status: 200 });
  }

  const { plan } = (await req.json()) as { plan: PlanKey };
  if (!STRIPE_PLANS[plan]) return NextResponse.json({ error: "Invalid plan." }, { status: 400 });

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

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: STRIPE_PLANS[plan].priceId, quantity: 1 }],
    success_url: `${baseUrl}/dashboard/billing?success=1`,
    cancel_url: `${baseUrl}/dashboard/billing?cancelled=1`,
    subscription_data: {
      metadata: { userId: user.id, plan },
    },
    allow_promotion_codes: true,
    metadata: { userId: user.id, plan },
  });

  return NextResponse.json({ url: checkoutSession.url });
}