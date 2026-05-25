import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { API_BASE_URL } from '@/constants/api';
import { AUTH_COOKIE_KEY } from '@/constants/auth';

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

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
  upstreamHeaders.set(
    'Content-Type',
    request.headers.get('content-type') ?? 'application/json',
  );
  if (token) {
    upstreamHeaders.set('Authorization', `Bearer ${token}`);
  }

  const method = request.method.toUpperCase();
  const shouldSendBody = method !== 'GET' && method !== 'HEAD';
  const upstream = await fetch(targetUrl.toString(), {
    method,
    headers: upstreamHeaders,
    body: shouldSendBody ? request.body : undefined,
    duplex: shouldSendBody ? 'half' : undefined,
  });

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
