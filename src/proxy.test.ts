import { type NextRequest } from 'next/server';
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
    const response = proxy(createRequest({ pathname: '/dashboard/1' }));

    expect(response).toBeDefined();
    expect(response?.status).toBe(307);
    expect(response?.headers.get('location')).toBe(
      'https://taskify.test/login?next=%2Fdashboard%2F1',
    );
  });

  it('로그인 사용자가 인증 페이지 접근 시 마이대시보드로 보낸다', () => {
    const response = proxy(
      createRequest({ pathname: '/login', token: 'token' }),
    );

    expect(response).toBeDefined();
    expect(response?.status).toBe(307);
    expect(response?.headers.get('location')).toBe(
      'https://taskify.test/mydashboard',
    );
  });

  it('허용된 요청은 next로 통과시킨다', () => {
    const response = proxy(
      createRequest({ pathname: '/mydashboard', token: 'token' }),
    );

    expect(response).toBeDefined();
    expect(response?.headers.get('x-middleware-next')).toBe('1');
  });
});
