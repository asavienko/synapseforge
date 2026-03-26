import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import type { NextRequest } from 'next/server';

const intlMiddleware = createIntlMiddleware(routing);

export default function middleware(req: NextRequest) {
  // Skip i18n middleware for API routes (especially /api/auth/*)
  if (req.nextUrl.pathname.startsWith('/api/')) {
    return;
  }
  return intlMiddleware(req);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};