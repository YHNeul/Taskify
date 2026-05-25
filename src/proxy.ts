import { NextRequest, NextResponse } from 'next/server';

import { AUTH_COOKIE_KEY } from '@/constants/auth';

const PROTECTED_PATHS = ['/mydashboard', '/mypage', '/dashboard'];
const AUTH_PAGES = ['/login', '/signup'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_KEY)?.value;

  const isProtectedPath = PROTECTED_PATHS.some((path) =>
    pathname.startsWith(path),
  );
  const isAuthPage = AUTH_PAGES.some((path) => pathname.startsWith(path));

  if (!token && isProtectedPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/mydashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/mydashboard/:path*',
    '/mypage/:path*',
    '/dashboard/:path*',
    '/login',
    '/signup',
  ],
};
