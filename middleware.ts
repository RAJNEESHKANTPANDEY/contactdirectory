import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth';

const PUBLIC_ADMIN_PATHS = ['/admin/login'];
const PROTECTED_API_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(SESSION_COOKIE)?.value;

  const isAdminPage = pathname.startsWith('/admin');
  const isPublicAdminPath = PUBLIC_ADMIN_PATHS.some((p) => pathname.startsWith(p));

  if (isAdminPage && !isPublicAdminPath) {
    const valid = await verifySessionToken(token);
    if (!valid) {
      const loginUrl = new URL('/admin/login', req.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  const isMutatingContactsApi =
    (pathname.startsWith('/api/contacts') || pathname.startsWith('/api/upload')) &&
    PROTECTED_API_METHODS.has(req.method);

  if (isMutatingContactsApi) {
    const valid = await verifySessionToken(token);
    if (!valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/contacts/:path*', '/api/upload/:path*'],
};
