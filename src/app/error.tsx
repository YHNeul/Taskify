'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import ErrorPageView from '@/shared/components/common/error-page/ErrorPageView';
import Button from '@/shared/components/common/Button/Button';
import { reportRuntimeError } from '@/shared/utils/errorReporter';

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    void reportRuntimeError({ error, source: 'segment-error-boundary' });
  }, [error]);

  return (
    <ErrorPageView
      statusCode="500"
      title="문제가 발생했어요"
      description="일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."
      actions={
        <>
          <Button size="lg" onClick={reset} className="min-w-40">
            다시 시도
          </Button>
          <Link
            href="/"
            className="inline-flex h-12 min-w-40 items-center justify-center rounded-full border border-gray-300 bg-white px-6 text-lg-medium text-gray-700 transition-colors hover:bg-brand-violet-light"
          >
            홈으로 이동
          </Link>
        </>
      }
    />
  );
}
