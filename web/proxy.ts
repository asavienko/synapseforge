import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { auth } from './lib/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimit } from './lib/ratelimit';

const intlMiddleware = createIntlMiddleware(routing);

const LOCALES = routing.locales as readonly string[];
const PROTECTED = ['/dashboard', '/onboarding', '/manager'];
const AUTH_ONLY = ['/sign-in', '/sign-up'];

function stripLocale(pathname: string): string {
  const parts = pathname.split('/');
  if (parts[1] && LOCALES.includes(parts[1])) {
    return '/' + parts.slice(2).join('/') || '/';
  }
  return pathname;
}

function getLocaleFromPath(pathname: string): string {
  const parts = pathname.split('/');
  return parts[1] && LOCALES.includes(parts[1]) ? parts[1] : routing.defaultLocale;
}

// Rate limiting configuration for API routes
const routeLimits: Record<string, { max: number; windowMs: number }> = {
  '/api/chat': { max: 30, windowMs: 60_000 },
  '/api/billing': { max: 30, windowMs: 60_000 },
  '/api/instances': { max: 60, windowMs: 60_000 },
  '/api/knowledge': { max: 60, windowMs: 60_000 },
  '/api/internal': { max: 100, windowMs: 60_000 },
  '/api/admin': { max: 100, windowMs: 60_000 },
  '/api/webhooks': { max: 100, windowMs: 60_000 },
  '/api/cron': { max: 120, windowMs: 60_000 },
  '/api/messages': { max: 120, windowMs: 60_000 },
  '/api/notifications': { max: 120, windowMs: 60_000 },
};

function getLimitForPath(pathname: string): { max: number; windowMs: number } {
  const sorted = Object.keys(routeLimits).sort((a, b) => b.length - a.length);
  for (const prefix of sorted) {
    if (pathname.startsWith(prefix)) return routeLimits[prefix];
  }
  return { max: 60, windowMs: 60_000 };
}

// Combined middleware: auth + i18n + rate limiting
export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // API routes: rate limiting only (skip i18n + auth redirects)
  if (pathname.startsWith('/api/')) {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
               req.headers.get('x-real-ip') ?? 'unknown';
    const key = `${ip}:${pathname}`;
    const { max, windowMs } = getLimitForPath(pathname);

    try {
      const allowed = await rateLimit(key, max, windowMs);
      if (!allowed) {
        return NextResponse.json(
          { error: 'Too many requests. Please slow down.' },
          { status: 429, headers: { 'Retry-After': Math.ceil(windowMs / 1000).toString() } }
        );
      }
    } catch (error) {
      console.error('[Rate limit] Error:', error);
      // Continue even if rate limit fails (Redis down, etc.)
    }
    return NextResponse.next();
  }

  // Page routes: i18n + auth
  const bare = stripLocale(pathname);
  const locale = getLocaleFromPath(pathname);
  const session = (req as unknown as { auth: { user?: { id?: string } } | null }).auth;
  const hasValidSession = !!(session?.user?.id);

  const isProtected = PROTECTED.some(p => bare === p || bare.startsWith(p + '/'));
  const isAuthOnly  = AUTH_ONLY.some(p => bare === p || bare.startsWith(p + '/'));

  if (isProtected && !hasValidSession) {
    return NextResponse.redirect(new URL(`/${locale}/sign-in`, req.url));
  }
  if (isAuthOnly && hasValidSession) {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, req.url));
  }

  return intlMiddleware(req as unknown as NextRequest);
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
