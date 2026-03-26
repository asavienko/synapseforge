import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import type { NextRequest } from 'next/server';

const intlMiddleware = createIntlMiddleware(routing);

export default function middleware(req: NextRequest) {
  return intlMiddleware(req);
}

export const config = {
  matcher: [
    // Match all pathnames except for:
    // - /api/* (API routes)
    // - /_next/* (Next.js internals)
    // - /_vercel/* (Vercel internals)
    // - /static/* (static files)
    // - /favicon.ico, /robots.txt (static files)
    // - all root files with extensions (.jpg, .png, etc.)
    '/((?!api|_next|_vercel|static|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)',
  ],
};