import { NextRequest, NextResponse } from 'next/server';

import { AUTH_COOKIE_KEY } from '@/shared/constants/auth';

const PROTECTED_PATHS = ['/mydashboard', '/mypage', '/dashboard'];
const AUTH_PAGES = ['/login', '/signup'];

/**
 * 인증 쿠키 유무에 따라 주요 라우트 접근 제어
 * 비인증 사용자의 보호 라우트 접근은 로그인으로 보냄,
 * 인증 사용자의 인증 페이지 접근은 대시보드로 보냄.
 * @param request 현재 Next.js 요청 객체
 * @returns 요청 통과 또는 리다이렉트를 위한 NextResponse
 */
export const proxy = (request: NextRequest) => {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_KEY)?.value;

  const isProtectedPath = PROTECTED_PATHS.some((path) =>
    pathname.startsWith(path),
  );
  const isAuthPage = AUTH_PAGES.some((path) => pathname.startsWith(path));

  if (!token && isProtectedPath) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/mydashboard', request.url));
  }

  return NextResponse.next();
};

export const config = {
  matcher: [
    '/mydashboard/:path*',
    '/mypage/:path*',
    '/dashboard/:path*',
    '/login',
    '/signup',
  ],
};
