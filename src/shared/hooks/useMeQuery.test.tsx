import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

const { getMeMock } = vi.hoisted(() => ({
  getMeMock: vi.fn(),
}));

vi.mock('@/shared/apis/auth', () => ({
  getMe: getMeMock,
}));

import { useMeQuery } from '@/shared/hooks/useMeQuery';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'TestQueryClientProvider';

  return Wrapper;
};

describe('useMeQuery', () => {
  it('조회 성공 시 success 상태와 사용자 정보를 반환한다', async () => {
    getMeMock.mockResolvedValue({
      id: 1,
      email: 'test@test.com',
      nickname: 'taskify',
      profileImageUrl: null,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    });

    const { result } = renderHook(() => useMeQuery(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isPending).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(result.current.data?.email).toBe('test@test.com');
  });

  it('조회 실패 시 error 상태를 반환한다', async () => {
    getMeMock.mockRejectedValue(new Error('unauthorized'));

    const { result } = renderHook(() => useMeQuery(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(result.current.error?.message).toBe('unauthorized');
  });
});
