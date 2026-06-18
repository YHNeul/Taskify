import { NextResponse } from 'next/server';

type ErrorBoundarySource = 'segment-error-boundary' | 'global-error-boundary';

type ClientRuntimeErrorPayload = {
  source: ErrorBoundarySource;
  message: string;
  digest?: string;
  stack?: string;
  pathname?: string;
  userAgent?: string;
  occurredAt: string;
};

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isErrorBoundarySource = (value: unknown): value is ErrorBoundarySource =>
  value === 'segment-error-boundary' || value === 'global-error-boundary';

const parsePayload = (value: unknown): ClientRuntimeErrorPayload | null => {
  if (!isObjectRecord(value) || !isErrorBoundarySource(value.source)) {
    return null;
  }

  if (
    typeof value.message !== 'string' ||
    typeof value.occurredAt !== 'string'
  ) {
    return null;
  }

  return {
    source: value.source,
    message: value.message,
    occurredAt: value.occurredAt,
    digest: typeof value.digest === 'string' ? value.digest : undefined,
    stack: typeof value.stack === 'string' ? value.stack : undefined,
    pathname: typeof value.pathname === 'string' ? value.pathname : undefined,
    userAgent:
      typeof value.userAgent === 'string' ? value.userAgent : undefined,
  };
};

/**
 * 클라이언트 에러 바운더리에서 전달한 런타임 에러를 수집합니다.
 * 현재는 환경별 로그 출력만 수행하며, 추후 외부 모니터링 연동 지점으로 사용합니다.
 */
export async function POST(request: Request) {
  const isProduction = process.env.NODE_ENV === 'production';

  try {
    const raw = await request.json();
    const payload = parsePayload(raw);

    if (!payload) {
      if (!isProduction) {
        console.warn('[ClientRuntimeError] 유효하지 않은 payload', raw);
      }
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    if (isProduction) {
      // 운영 환경에서는 핵심 메타 정보 위주로 출력하고, 추후 외부 모니터링 SDK로 전달합니다.
      console.error('[ClientRuntimeError]', {
        source: payload.source,
        message: payload.message,
        digest: payload.digest,
        pathname: payload.pathname,
        occurredAt: payload.occurredAt,
      });
    } else {
      console.error('[ClientRuntimeError]', payload);
    }
  } catch (error) {
    console.error('[ClientRuntimeError] payload 파싱 실패', error);
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
