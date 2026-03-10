import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const intlMiddleware = createMiddleware(routing);

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

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const bare = stripLocale(pathname);
  const locale = getLocaleFromPath(pathname);

  const isProtected = PROTECTED.some(p => bare === p || bare.startsWith(p + '/'));
  const isAuthOnly  = AUTH_ONLY.some(p => bare === p || bare.startsWith(p + '/'));

  if (isProtected || isAuthOnly) {
    const token = await getToken({
      req,
      secret: process.env.AUTH_SECRET,
    });

    if (isProtected && !token) {
      return NextResponse.redirect(new URL(`/${locale}/sign-in`, req.url));
    }
    if (isAuthOnly && token) {
      return NextResponse.redirect(new URL(`/${locale}/dashboard`, req.url));
    }
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
