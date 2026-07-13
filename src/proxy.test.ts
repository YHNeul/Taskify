import { NextResponse, type NextRequest } from 'next/server';
import { describe, expect, it, vi } from 'vitest';

import { proxy } from '@/proxy';
import { AUTH_COOKIE_KEY } from '@/shared/constants/auth';

const createRequest = ({
  pathname,
  token,
}: {
  pathname: string;
  token?: string;
}) =>
  ({
    nextUrl: { pathname },
    url: `https://taskify.test${pathname}`,
    cookies: {
      get: vi
        .fn()
        .mockReturnValue(
          token ? { name: AUTH_COOKIE_KEY, value: token } : undefined,
        ),
    },
  }) as unknown as NextRequest;

describe('proxy route guard', () => {
  it('비로그인 사용자의 보호 라우트 접근을 로그인으로 리다이렉트한다', () => {
    const redirectSpy = vi
      .spyOn(NextResponse, 'redirect')
      .mockReturnValue(new NextResponse(null, { status: 307 }));
    const nextSpy = vi.spyOn(NextResponse, 'next');

    proxy(createRequest({ pathname: '/dashboard/1' }));

    expect(nextSpy).not.toHaveBeenCalled();
    expect(redirectSpy).toHaveBeenCalledTimes(1);

    const [redirectUrl] = redirectSpy.mock.calls[0];
    expect(redirectUrl.toString()).toBe(
      'https://taskify.test/login?next=%2Fdashboard%2F1',
    );
  });

  it('로그인 사용자가 인증 페이지 접근 시 마이대시보드로 보낸다', () => {
    const redirectSpy = vi
      .spyOn(NextResponse, 'redirect')
      .mockReturnValue(new NextResponse(null, { status: 307 }));

    proxy(createRequest({ pathname: '/login', token: 'token' }));

    const [redirectUrl] = redirectSpy.mock.calls[0];
    expect(redirectUrl.toString()).toBe('https://taskify.test/mydashboard');
  });

  it('허용된 요청은 next로 통과시킨다', () => {
    const redirectSpy = vi.spyOn(NextResponse, 'redirect');
    const nextSpy = vi
      .spyOn(NextResponse, 'next')
      .mockReturnValue(new NextResponse(null, { status: 200 }));

    proxy(createRequest({ pathname: '/mydashboard', token: 'token' }));

    expect(redirectSpy).not.toHaveBeenCalled();
    expect(nextSpy).toHaveBeenCalledTimes(1);
  });
});
