import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

/**
 * POST /api/billing/portal
 * Creates a Stripe Customer Portal session and redirects the user.
 *
 * Body: { returnUrl: string } (optional, defaults to dashboard billing page)
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { stripeCustomerId: true, email: true, name: true },
  });

  if (!user?.stripeCustomerId) {
    return NextResponse.json(
      { error: 'No Stripe customer found. Please subscribe first.' },
      { status: 400 }
    );
  }

  // Determine return URL (default back to billing page)
  const { returnUrl } = (await req.json()) as { returnUrl?: string };
  const defaultReturnUrl = `${process.env.NEXTAUTH_URL}/dashboard/billing`;
  const safeReturnUrl = returnUrl && returnUrl.startsWith(process.env.NEXTAUTH_URL!)
    ? returnUrl
    : defaultReturnUrl;

  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: safeReturnUrl,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error('[Stripe Portal] Error creating session:', error);
    return NextResponse.json(
      { error: 'Failed to create portal session. Please contact support.' },
      { status: 500 }
    );
  }
}