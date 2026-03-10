import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { auth } from './lib/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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

// Use NextAuth's auth() wrapper so it reads the session correctly
export default auth(function middleware(req) {
  const { pathname } = req.nextUrl;
  const bare = stripLocale(pathname);
  const locale = getLocaleFromPath(pathname);
  // NextAuth v5 attaches auth to the request
  const session = (req as unknown as { auth: unknown }).auth;

  const isProtected = PROTECTED.some(p => bare === p || bare.startsWith(p + '/'));
  const isAuthOnly  = AUTH_ONLY.some(p => bare === p || bare.startsWith(p + '/'));

  if (isProtected && !session) {
    return NextResponse.redirect(new URL(`/${locale}/sign-in`, req.url));
  }
  if (isAuthOnly && session) {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, req.url));
  }

  return intlMiddleware(req as unknown as NextRequest);
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
