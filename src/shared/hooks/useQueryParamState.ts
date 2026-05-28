'use client';

import { useCallback, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

type SetStateAction<T> = T | ((prev: T) => T);

interface UseQueryParamStateOptions<T> {
  key: string;
  defaultValue: T;
  parse?: (rawValue: string | null) => T;
  serialize?: (value: T) => string | null;
  history?: 'push' | 'replace';
}

/**
 * 쿼리 파라미터 문자열을 양의 정수로 파싱
 * 값이 없거나 숫자가 아니면 fallback을 반환
 */
export const parsePositiveIntParam = (
  rawValue: string | null,
  fallback = 1,
): number => {
  if (!rawValue) return fallback;

  const parsed = Number(rawValue);
  if (!Number.isFinite(parsed)) return fallback;

  const normalized = Math.floor(parsed);
  return normalized > 0 ? normalized : fallback;
};

/**
 * URL 쿼리 파라미터를 React 상태처럼 읽고/쓰기 위한 훅
 * parse/serialize를 통해 타입별 변환 규칙 주입 가능
 */
export const useQueryParamState = <T>({
  key,
  defaultValue,
  parse,
  serialize,
  history = 'replace',
}: UseQueryParamStateOptions<T>): [T, (action: SetStateAction<T>) => void] => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();

  const value = useMemo(() => {
    const params = new URLSearchParams(searchParamsString);
    const rawValue = params.get(key);
    if (parse) return parse(rawValue);
    return (rawValue ?? defaultValue) as T;
  }, [defaultValue, key, parse, searchParamsString]);

  const setValue = useCallback(
    (action: SetStateAction<T>) => {
      const params = new URLSearchParams(searchParamsString);
      const rawValue = params.get(key);
      const prevValue = parse
        ? parse(rawValue)
        : ((rawValue ?? defaultValue) as T);
      const nextValue =
        typeof action === 'function'
          ? (action as (prev: T) => T)(prevValue)
          : action;

      const serialized = serialize
        ? serialize(nextValue)
        : nextValue === null || nextValue === undefined
          ? null
          : String(nextValue);

      if (!serialized) {
        params.delete(key);
      } else {
        params.set(key, serialized);
      }

      const query = params.toString();
      if (query === searchParamsString) return;

      const url = query ? `${pathname}?${query}` : pathname;

      if (history === 'push') {
        router.push(url, { scroll: false });
        return;
      }

      router.replace(url, { scroll: false });
    },
    [
      defaultValue,
      history,
      key,
      parse,
      pathname,
      router,
      searchParamsString,
      serialize,
    ],
  );

  return [value, setValue];
};
