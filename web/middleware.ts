import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimit } from './lib/ratelimit';

const intlMiddleware = createIntlMiddleware(routing);

const LOCALES = routing.locales as readonly string[];
const PROTECTED = ['/dashboard', '/onboarding', '/manager'];
const AUTH_ONLY = ['/sign-in', '/sign-up'];

function stripLocale(pathname: string): string {
  const parts = pathname.split('/');
  if (parts.length > 1 && LOCALES.includes(parts[1])) {
    return '/' + parts.slice(2).join('/');
  }
  return pathname;
}

function getLocaleFromPathname(pathname: string): string {
  const parts = pathname.split('/');
  if (parts.length > 1 && LOCALES.includes(parts[1])) {
    return parts[1];
  }
  return routing.defaultLocale;
}

// Combined middleware: auth + i18n + rate limiting
export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // API routes: rate limiting only (skip i18n + auth redirects)
  if (pathname.startsWith('/api/')) {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    if (!rateLimit(ip, 100, 60_000)) {
      return new NextResponse('Too many requests', { status: 429 });
    }
    return NextResponse.next();
  }

  // Let next-intl handle locale routing first
  const intlResponse = intlMiddleware(req);
  
  // If next-intl redirects or rewrites, respect that
  if (intlResponse.status !== 200 || intlResponse.headers.get('x-middleware-rewrite') || intlResponse.headers.get('location')) {
    return intlResponse;
  }

  // Determine locale and path without locale
  const locale = getLocaleFromPathname(pathname);
  const bare = stripLocale(pathname);

  // Check auth status from cookie
  const hasValidSession = req.cookies.has('next-auth.session-token') || req.cookies.has('__Secure-next-auth.session-token');

  const isProtected = PROTECTED.some(p => bare === p || bare.startsWith(p + '/'));
  const isAuthOnly  = AUTH_ONLY.some(p => bare === p || bare.startsWith(p + '/'));

  if (isProtected && !hasValidSession) {
    return NextResponse.redirect(new URL(`/${locale}/sign-in`, req.url));
  }
  if (isAuthOnly && hasValidSession) {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, req.url));
  }

  return intlResponse;
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
