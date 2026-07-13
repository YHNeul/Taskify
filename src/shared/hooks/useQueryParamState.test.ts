import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  parsePositiveIntParam,
  useQueryParamState,
} from '@/shared/hooks/useQueryParamState';

const routerReplaceMock = vi.fn();
const routerPushMock = vi.fn();
let currentPathname = '/dashboard';
let currentSearchParams = new URLSearchParams('');

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: routerReplaceMock,
    push: routerPushMock,
  }),
  usePathname: () => currentPathname,
  useSearchParams: () => currentSearchParams,
}));

describe('useQueryParamState', () => {
  beforeEach(() => {
    routerReplaceMock.mockClear();
    routerPushMock.mockClear();
    currentPathname = '/dashboard';
    currentSearchParams = new URLSearchParams('');
  });

  it('parse 함수로 쿼리 값을 읽는다', () => {
    currentPathname = '/dashboard';
    currentSearchParams = new URLSearchParams('page=2');

    const { result } = renderHook(() =>
      useQueryParamState<number>({
        key: 'page',
        defaultValue: 1,
        parse: (raw) => parsePositiveIntParam(raw, 1),
      }),
    );

    expect(result.current[0]).toBe(2);
  });

  it('값을 바꾸면 기본적으로 replace를 호출한다', () => {
    currentPathname = '/dashboard';
    currentSearchParams = new URLSearchParams('page=1');

    const { result } = renderHook(() =>
      useQueryParamState<number>({
        key: 'page',
        defaultValue: 1,
        parse: (raw) => parsePositiveIntParam(raw, 1),
      }),
    );

    act(() => {
      const [, setPage] = result.current;
      setPage(3);
    });

    expect(routerReplaceMock).toHaveBeenCalledWith('/dashboard?page=3', {
      scroll: false,
    });
  });

  it('serialize 결과가 null이면 쿼리에서 제거한다', () => {
    currentPathname = '/dashboard';
    currentSearchParams = new URLSearchParams('tag=frontend');

    const { result } = renderHook(() =>
      useQueryParamState<string | null>({
        key: 'tag',
        defaultValue: null,
        serialize: (value) => value,
      }),
    );

    act(() => {
      const [, setTag] = result.current;
      setTag(null);
    });

    expect(routerReplaceMock).toHaveBeenCalledWith('/dashboard', {
      scroll: false,
    });
  });

  it('다른 쿼리 매개변수가 있을 때 특정 매개변수만 제거해도 기존 값은 유지한다', () => {
    currentPathname = '/dashboard';
    currentSearchParams = new URLSearchParams('page=1&tag=frontend');

    const { result } = renderHook(() =>
      useQueryParamState<string | null>({
        key: 'tag',
        defaultValue: null,
        serialize: (value) => value,
      }),
    );

    act(() => {
      const [, setTag] = result.current;
      setTag(null);
    });

    expect(routerReplaceMock).toHaveBeenCalledWith('/dashboard?page=1', {
      scroll: false,
    });
  });

  it('history가 push면 push를 사용한다', () => {
    currentPathname = '/dashboard';
    currentSearchParams = new URLSearchParams('page=1');

    const { result } = renderHook(() =>
      useQueryParamState<number>({
        key: 'page',
        defaultValue: 1,
        history: 'push',
      }),
    );

    act(() => {
      const [, setPage] = result.current;
      setPage(4);
    });

    expect(routerPushMock).toHaveBeenCalledWith('/dashboard?page=4', {
      scroll: false,
    });
  });

  it('쿼리 문자열이 동일하면 라우터를 호출하지 않는다', () => {
    currentPathname = '/dashboard';
    currentSearchParams = new URLSearchParams('page=1');

    const { result } = renderHook(() =>
      useQueryParamState<number>({
        key: 'page',
        defaultValue: 1,
        parse: (raw) => parsePositiveIntParam(raw, 1),
      }),
    );

    act(() => {
      const [, setPage] = result.current;
      setPage(1);
    });

    expect(routerReplaceMock).not.toHaveBeenCalled();
    expect(routerPushMock).not.toHaveBeenCalled();
  });
});
