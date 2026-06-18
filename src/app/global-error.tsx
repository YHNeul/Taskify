'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import ErrorPageView from '@/shared/components/common/ErrorPage/ErrorPageView';
import { reportRuntimeError } from '@/utils/errorReporter';

type GlobalErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalErrorPage({
  error,
  reset,
}: GlobalErrorPageProps) {
  useEffect(() => {
    void reportRuntimeError({ error, source: 'global-error-boundary' });
  }, [error]);

  return (
    <html lang="ko">
      <body className="font-main">
        <ErrorPageView
          statusCode="500"
          title="예상치 못한 오류가 발생했어요"
          description="서비스 이용에 불편을 드려 죄송합니다. 잠시 후 다시 시도해 주세요."
          actions={
            <>
              <button
                type="button"
                onClick={reset}
                className="inline-flex h-12 min-w-40 items-center justify-center rounded-full bg-brand-violet px-6 text-lg-medium text-white! transition-opacity hover:opacity-90"
              >
                다시 시도
              </button>
              <Link
                href="/"
                className="inline-flex h-12 min-w-40 items-center justify-center rounded-full border border-gray-300 bg-white px-6 text-lg-medium text-gray-700 transition-colors hover:bg-brand-violet-light"
              >
                홈으로 이동
              </Link>
            </>
          }
        />
      </body>
    </html>
  );
}
