import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AUTH_COOKIE_KEY } from '@/shared/constants/auth';

const { cookiesMock } = vi.hoisted(() => ({
  cookiesMock: vi.fn(),
}));

vi.mock('next/headers', () => ({
  cookies: cookiesMock,
}));

import { GET, POST } from '@/app/api/proxy/[...path]/route';

describe('BFF proxy route', () => {
  beforeEach(() => {
    cookiesMock.mockResolvedValue({
      get: vi
        .fn()
        .mockReturnValue({ name: AUTH_COOKIE_KEY, value: 'token-value' }),
    });
  });

  it('쿠키 토큰을 Authorization 헤더로 업스트림에 전달한다', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    const request = new Request(
      'https://taskify.test/api/proxy/users/me?size=10&page=2',
      { method: 'GET' },
    );
    const response = await GET(request, {
      params: Promise.resolve({ path: ['users', 'me'] }),
    });

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [targetUrl, options] = fetchMock.mock.calls[0];
    expect(targetUrl).toBe('https://example.com/users/me?size=10&page=2');
    expect((options?.headers as Headers).get('Authorization')).toBe(
      'Bearer token-value',
    );
  });

  it.each([401, 403, 500])(
    '업스트림 에러 상태 %i를 그대로 전달한다',
    async (status) => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({ message: 'upstream error' }), {
          status,
          headers: { 'content-type': 'application/json' },
        }),
      );

      const request = new Request('https://taskify.test/api/proxy/users/me', {
        method: 'GET',
      });
      const response = await GET(request, {
        params: Promise.resolve({ path: ['users', 'me'] }),
      });

      expect(response.status).toBe(status);
    },
  );

  it('업스트림 호출 실패 시 502를 반환한다', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network'));

    const request = new Request('https://taskify.test/api/proxy/users/me', {
      method: 'GET',
    });
    const response = await GET(request, {
      params: Promise.resolve({ path: ['users', 'me'] }),
    });
    const data = (await response.json()) as { message: string };

    expect(response.status).toBe(502);
    expect(data.message).toBe('업스트림 API 요청에 실패했습니다.');
  });

  it('POST 요청 본문을 업스트림으로 전달한다', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ id: 1 }), {
        status: 201,
        headers: { 'content-type': 'application/json' },
      }),
    );

    const request = new Request('https://taskify.test/api/proxy/cards', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title: 'new card' }),
    });

    const response = await POST(request, {
      params: Promise.resolve({ path: ['cards'] }),
    });

    expect(response.status).toBe(201);
    const [, options] = fetchMock.mock.calls[0];
    expect((options?.headers as Headers).get('Content-Type')).toBe(
      'application/json',
    );
    expect(options?.body).toBeInstanceOf(ArrayBuffer);
  });
});
