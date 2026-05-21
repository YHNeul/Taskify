import { useEffect } from 'react';

/**
 * 전체 페이지 수 변경에 따라 현재 페이지 번호를 보정하는 훅
 */
export function usePaginationSync(
  totalPages: number,
  setCurrentPage: (page: ((p: number) => number) | number) => void,
) {
  useEffect(() => {
    if (totalPages > 0) {
      setCurrentPage((p) => Math.min(p, totalPages));
    }
  }, [totalPages]);
}
