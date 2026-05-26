import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { AUTH_COOKIE_KEY } from '@/shared/constants/auth';

async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_KEY);
}

export async function POST() {
  await clearAuthCookie();

  return NextResponse.json({ message: '로그아웃 성공' }, { status: 200 });
}
