import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AUTH_COOKIE_KEY } from '@/shared/constants/auth';

const { cookiesMock, cookieSetMock } = vi.hoisted(() => ({
  cookiesMock: vi.fn(),
  cookieSetMock: vi.fn(),
}));

vi.mock('next/headers', () => ({
  cookies: cookiesMock,
}));

import { POST } from '@/app/api/auth/login/route';

describe('auth login route', () => {
  beforeEach(() => {
    cookieSetMock.mockClear();
    cookiesMock.mockResolvedValue({
      set: cookieSetMock,
    });
  });

  it('필수 값이 없으면 400을 반환한다', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockRejectedValue(new Error('fetch should not be called'));
    const request = new Request('https://taskify.test/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: '' }),
    });

    const response = await POST(request);
    const data = (await response.json()) as { message: string };

    expect(response.status).toBe(400);
    expect(data.message).toBe('이메일과 비밀번호를 확인해 주세요.');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('업스트림 로그인 실패를 상태 코드와 함께 전달한다', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ message: '인증 실패' }), { status: 401 }),
    );

    const request = new Request('https://taskify.test/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@test.com', password: 'wrong' }),
      headers: { 'content-type': 'application/json' },
    });

    const response = await POST(request);
    const data = (await response.json()) as { message: string };

    expect(response.status).toBe(401);
    expect(data.message).toBe('인증 실패');
    expect(cookieSetMock).not.toHaveBeenCalled();
  });

  it('로그인 성공 시 HttpOnly 쿠키를 저장한다', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ accessToken: 'abc-token' }), {
        status: 200,
      }),
    );

    const request = new Request('https://taskify.test/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@test.com',
        password: 'password123!',
      }),
      headers: { 'content-type': 'application/json' },
    });

    const response = await POST(request);
    const data = (await response.json()) as { message: string };

    expect(response.status).toBe(200);
    expect(data.message).toBe('로그인 성공');
    expect(fetchMock).toHaveBeenCalledWith(
      'https://example.com/auth/login',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({
          email: 'test@test.com',
          password: 'password123!',
        }),
      }),
    );
    expect(cookieSetMock).toHaveBeenCalledWith(
      AUTH_COOKIE_KEY,
      'abc-token',
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
      }),
    );
  });
});
