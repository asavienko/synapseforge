import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { enforcePlanLimits } from "@/lib/plan-enforcement";
import { email as emailService } from "@/lib/email";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("[Stripe webhook] Invalid signature", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") break;

        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan as string;
        if (!userId || !plan) break;

        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        const periodEnd = subscription.items.data[0]?.current_period_end ?? null;
        await prisma.user.update({
          where: { id: userId },
          data: {
            plan,
            stripeSubscriptionId: subscription.id,
            stripePriceId: subscription.items.data[0].price.id,
            stripeCurrentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
            stripeCustomerId: session.customer as string,
          },
        });
        console.log(`[Stripe] User ${userId} upgraded to ${plan}`);
        
        // Immediately enforce plan limits if user upgraded to a paid plan
        if (plan !== "free") {
          const result = await enforcePlanLimits(userId, plan);
          if (result) {
            emailService.planUpgraded(
              result.userEmail,
              result.userName,
              "free",
              plan,
              result.allowedInstances
            ).catch(console.error);
          }
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        // In Stripe SDK v20+, subscription moved to invoice.parent.subscription_details.subscription
        const subRef = invoice.parent?.subscription_details?.subscription;
        const invoiceSubscriptionId = typeof subRef === "string" ? subRef : subRef?.id ?? null;
        if (!invoiceSubscriptionId) break;

        const subscription = await stripe.subscriptions.retrieve(invoiceSubscriptionId);
        const userId = subscription.metadata?.userId;
        if (!userId) break;

        const periodEnd = subscription.items.data[0]?.current_period_end ?? null;
        await prisma.user.update({
          where: { id: userId },
          data: {
            stripeCurrentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
          },
        });
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;
        if (!userId) break;

        const previousAttributes = (event.data as Stripe.Event.Data & { previous_attributes?: Record<string, unknown> }).previous_attributes ?? {};
        const prevPlan: string = (previousAttributes.plan as string) ?? "unknown";

        const newPlan = subscription.metadata?.plan ?? "free";
        const status = subscription.status;
        const effectivePlan = status === "active" ? newPlan : "free";
        const updatedPeriodEnd = subscription.items.data[0]?.current_period_end ?? null;
        await prisma.user.update({
          where: { id: userId },
          data: {
            plan: effectivePlan,
            stripeSubscriptionId: subscription.id,
            stripePriceId: subscription.items.data[0].price.id,
            stripeCurrentPeriodEnd: updatedPeriodEnd ? new Date(updatedPeriodEnd * 1000) : null,
          },
        });

        // If plan was downgraded (or subscription became non-active), enforce limits
        if (effectivePlan !== prevPlan && effectivePlan === "free") {
          const result = await enforcePlanLimits(userId, effectivePlan);
          if (result) {
            emailService.planDowngraded(
              result.userEmail,
              result.userName,
              prevPlan,
              effectivePlan,
              result.stoppedInstances
            ).catch(console.error);
          }
        } else if (effectivePlan !== prevPlan && effectivePlan !== "free") {
          // If upgraded to paid plan, enforce limits immediately
          const result = await enforcePlanLimits(userId, effectivePlan);
          if (result) {
            emailService.planUpgraded(
              result.userEmail,
              result.userName,
              prevPlan,
              effectivePlan,
              result.allowedInstances
            ).catch(console.error);
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;
        if (!userId) break;

        // Fetch current plan before overwriting (for the email)
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { plan: true },
        });
        const fromPlan = user?.plan ?? "unknown";

        await prisma.user.update({
          where: { id: userId },
          data: {
            plan: "free",
            stripeSubscriptionId: null,
            stripePriceId: null,
            stripeCurrentPeriodEnd: null,
          },
        });

        // Stop instances that exceed the free plan limit and notify the user
        const result = await enforcePlanLimits(userId, "free");
        if (result) {
          emailService.planDowngraded(
            result.userEmail,
            result.userName,
            fromPlan,
            "free",
            result.stoppedInstances
          ).catch(console.error);
        }

        console.log(`[Stripe] User ${userId} downgraded to free (subscription deleted); stopped ${result?.stoppedInstances.length ?? 0} instances`);
        break;
      }
    }
  } catch (err) {
    console.error("[Stripe webhook] Handler error", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
