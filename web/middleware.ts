import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Minimal middleware - just pass through everything
export default function middleware(req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
