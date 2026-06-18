type ErrorBoundarySource = 'segment-error-boundary' | 'global-error-boundary';

type ReportRuntimeErrorParams = {
  error: Error & { digest?: string };
  source: ErrorBoundarySource;
};

type RuntimeErrorPayload = {
  source: ErrorBoundarySource;
  message: string;
  digest?: string;
  stack?: string;
  pathname?: string;
  userAgent?: string;
  occurredAt: string;
};

const buildPayload = ({
  error,
  source,
}: ReportRuntimeErrorParams): RuntimeErrorPayload => {
  const pathname =
    typeof window !== 'undefined' ? window.location.pathname : undefined;
  const userAgent =
    typeof navigator !== 'undefined' ? navigator.userAgent : undefined;

  return {
    source,
    message: error.message,
    digest: error.digest,
    stack: error.stack,
    pathname,
    userAgent,
    occurredAt: new Date().toISOString(),
  };
};

/**
 * 런타임 에러를 서버 라우트로 전달하는 공통 리포터입니다.
 * 추후 Sentry/Datadog 연동 시 이 함수 내부만 교체하면 됩니다.
 */
export const reportRuntimeError = async ({
  error,
  source,
}: ReportRuntimeErrorParams) => {
  const payload = buildPayload({ error, source });

  try {
    await fetch('/api/client-errors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch (reportError) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[ErrorReporter] 전송 실패', reportError);
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    console.error('[ErrorReporter] 런타임 에러', payload);
  }
};
