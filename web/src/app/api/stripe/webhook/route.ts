import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import Stripe from "stripe";

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

// Plan mapping from Stripe price IDs to our plan keys
const PRICE_TO_PLAN: Record<string, string> = {
  [process.env.STRIPE_STARTER_10K_PRICE_ID || "prod_starter_10k"]: "starter_10k",
  [process.env.STRIPE_GROWTH_30K_PRICE_ID || "prod_growth_30k"]: "growth_30k",
  [process.env.STRIPE_SCALE_100K_PRICE_ID || "prod_scale_100k"]: "scale_100k",
  [process.env.STRIPE_BUSINESS_200K_PRICE_ID || "prod_business_200k"]: "business_200k",
  [process.env.STRIPE_MANAGED_STARTER_PRICE_ID || "prod_managed_starter"]: "managed_starter",
  [process.env.STRIPE_MANAGED_GROWTH_PRICE_ID || "prod_managed_growth"]: "managed_growth",
  [process.env.STRIPE_MANAGED_SCALE_PRICE_ID || "prod_managed_scale"]: "managed_scale",
};

export async function POST(req: NextRequest) {
  try {
    if (!STRIPE_WEBHOOK_SECRET) {
      console.error("[stripe/webhook] STRIPE_WEBHOOK_SECRET not set");
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
    }

    const stripe = getStripe();
    const payload = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(payload, signature, STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error("[stripe/webhook] Signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    console.log(`[stripe/webhook] Received event: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed": {
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      }

      case "invoice.paid": {
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;
      }

      case "invoice.payment_failed": {
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      }

      case "customer.subscription.updated": {
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      }

      case "customer.subscription.deleted": {
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      }

      case "customer.subscription.trial_will_end": {
        await handleTrialWillEnd(event.data.object as Stripe.Subscription);
        break;
      }

      default: {
        console.log(`[stripe/webhook] Unhandled event type: ${event.type}`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[stripe/webhook] Error processing webhook:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * Handle checkout.session.completed
 * User completed checkout and is now subscribed
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  if (!customerId || !subscriptionId) {
    console.error("[stripe/webhook] Missing customer or subscription ID in checkout");
    return;
  }

  // Get subscription details
  const stripe = getStripe();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subscription = await stripe.subscriptions.retrieve(subscriptionId) as any;
  const priceId = subscription.items.data[0]?.price.id;
  const planKey = priceId ? PRICE_TO_PLAN[priceId] : null;

  if (!planKey) {
    console.error(`[stripe/webhook] Unknown price ID: ${priceId}`);
    return;
  }

  // Find user by Stripe customer ID
  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!user) {
    console.error(`[stripe/webhook] User not found for customer: ${customerId}`);
    return;
  }

  // Update user with subscription details
  await prisma.user.update({
    where: { id: user.id },
    data: {
      plan: planKey,
      stripeSubscriptionId: subscriptionId,
      stripePriceId: priceId,
      stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  });

  console.log(`[stripe/webhook] User ${user.id} upgraded to ${planKey}`);

  // Revalidate billing page
  revalidatePath("/dashboard/billing");
}

/**
 * Handle invoice.paid
 * Recurring payment succeeded
 */
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subscriptionId = (invoice as any).subscription as string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const customerId = (invoice as any).customer as string;

  if (!subscriptionId || !customerId) return;

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!user) return;

  // Update period end and ensure plan is active
  const stripe = getStripe();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subscription = await stripe.subscriptions.retrieve(subscriptionId) as any;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
      // Clear any payment failure flags
      stripePaymentFailedAt: null,
    },
  });

  console.log(`[stripe/webhook] Payment succeeded for user ${user.id}`);
}

/**
 * Handle invoice.payment_failed
 * Recurring payment failed
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subscriptionId = (invoice as any).subscription as string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const customerId = (invoice as any).customer as string;

  if (!subscriptionId || !customerId) return;

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!user) return;

  // Mark payment as failed but keep subscription active for now
  // Stripe will retry according to its retry schedule
  await prisma.user.update({
    where: { id: user.id },
    data: {
      stripePaymentFailedAt: new Date(),
      stripePaymentFailedInvoiceId: invoice.id,
    },
  });

  console.log(`[stripe/webhook] Payment failed for user ${user.id}`);
}

/**
 * Handle customer.subscription.updated
 * Subscription changed (plan change, cancellation scheduled, etc.)
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sub = subscription as any;
  const customerId = sub.customer as string;
  const priceId = sub.items.data[0]?.price.id;
  const planKey = priceId ? PRICE_TO_PLAN[priceId] : null;

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!user) return;

  const updateData: Record<string, unknown> = {
    stripeCurrentPeriodEnd: new Date(sub.current_period_end * 1000),
  };

  // Handle cancellation
  if (sub.cancel_at_period_end) {
    console.log(`[stripe/webhook] User ${user.id} scheduled cancellation`);
    updateData.stripeCancelAtPeriodEnd = true;
  } else {
    updateData.stripeCancelAtPeriodEnd = false;
  }

  // Handle plan change
  if (planKey && planKey !== user.plan) {
    console.log(`[stripe/webhook] User ${user.id} changed plan to ${planKey}`);
    updateData.plan = planKey;
    updateData.stripePriceId = priceId;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: updateData,
  });

  revalidatePath("/dashboard/billing");
}

/**
 * Handle customer.subscription.deleted
 * Subscription ended (cancelled or expired)
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!user) return;

  // Downgrade to free plan
  await prisma.user.update({
    where: { id: user.id },
    data: {
      plan: "free",
      stripeSubscriptionId: null,
      stripePriceId: null,
      stripeCurrentPeriodEnd: null,
      stripeCancelAtPeriodEnd: false,
    },
  });

  console.log(`[stripe/webhook] User ${user.id} downgraded to free (subscription ended)`);

  // Trigger plan enforcement to stop excess instances
  await fetch(`${process.env.NEXTAUTH_URL}/api/internal/plan-enforcement`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.INTERNAL_API_KEY}`,
    },
  }).catch(() => {
    // Non-blocking - enforcement will run on schedule
  });

  revalidatePath("/dashboard/billing");
}

/**
 * Handle customer.subscription.trial_will_end
 * Trial ending soon - send reminder
 */
async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!user || !user.email) return;

  // Send trial ending email (implement with your email service)
  console.log(`[stripe/webhook] Trial ending soon for user ${user.id}`);

  // TODO: Send email notification
  // await emailService.sendTrialEndingEmail(user.email, user.name);
}
