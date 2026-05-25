import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { AUTH_COOKIE_KEY } from '@/constants/auth';

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_KEY);

  return NextResponse.json({ message: '로그아웃 성공' }, { status: 200 });
}

export async function GET(request: Request) {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_KEY);

  return NextResponse.redirect(new URL('/', request.url));
}
