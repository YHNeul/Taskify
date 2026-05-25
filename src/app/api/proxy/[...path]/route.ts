import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { API_BASE_URL } from '@/constants/api';
import { AUTH_COOKIE_KEY } from '@/constants/auth';

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

/**
 * 클라이언트 요청을 업스트림 API로 프록시
 * 경로/쿼리/본문을 그대로 전달하고, 쿠키 기반 토큰을 Authorization 헤더로 변환
 * @param request Next.js Route Handler의 요청 객체
 * @param context 동적 경로 세그먼트(`path`)를 포함한 컨텍스트
 * @returns 업스트림 응답 바디/상태/콘텐츠 타입을 전달한 NextResponse
 */
async function handleProxy(request: Request, context: RouteContext) {
  const { path } = await context.params;
  const token = (await cookies()).get(AUTH_COOKIE_KEY)?.value;
  const targetPath = path.join('/');
  const targetUrl = new URL(`${API_BASE_URL}/${targetPath}`);

  const sourceUrl = new URL(request.url);
  sourceUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.append(key, value);
  });

  const upstreamHeaders = new Headers();
  const requestContentType = request.headers.get('content-type');
  if (requestContentType) {
    upstreamHeaders.set('Content-Type', requestContentType);
  }
  if (token) {
    upstreamHeaders.set('Authorization', `Bearer ${token}`);
  }

  const method = request.method.toUpperCase();
  const shouldSendBody = method !== 'GET' && method !== 'HEAD';
  const requestBodyBuffer = shouldSendBody ? await request.arrayBuffer() : null;
  const body =
    requestBodyBuffer && requestBodyBuffer.byteLength > 0
      ? requestBodyBuffer
      : undefined;

  let upstream: Response;
  try {
    upstream = await fetch(targetUrl.toString(), {
      method,
      headers: upstreamHeaders,
      body,
    });
  } catch {
    return NextResponse.json(
      { message: '업스트림 API 요청에 실패했습니다.' },
      { status: 502 },
    );
  }

  const responseHeaders = new Headers();
  const contentType = upstream.headers.get('content-type');
  if (contentType) {
    responseHeaders.set('content-type', contentType);
  }

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

export async function GET(request: Request, context: RouteContext) {
  return handleProxy(request, context);
}

export async function POST(request: Request, context: RouteContext) {
  return handleProxy(request, context);
}

export async function PUT(request: Request, context: RouteContext) {
  return handleProxy(request, context);
}

export async function PATCH(request: Request, context: RouteContext) {
  return handleProxy(request, context);
}

export async function DELETE(request: Request, context: RouteContext) {
  return handleProxy(request, context);
}
