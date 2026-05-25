import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { API_BASE_URL } from '@/constants/api';
import { AUTH_COOKIE_KEY } from '@/constants/auth';

type LoginRequestBody = {
  email: string;
  password: string;
};

type LoginResponse = {
  accessToken?: string;
  message?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<LoginRequestBody>;
    if (!body.email || !body.password) {
      return NextResponse.json(
        { message: '이메일과 비밀번호를 확인해 주세요.' },
        { status: 400 },
      );
    }

    const upstream = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: body.email,
        password: body.password,
      }),
    });

    let data: LoginResponse | null = null;
    try {
      data = (await upstream.json()) as LoginResponse;
    } catch {
      data = null;
    }

    if (!upstream.ok || !data?.accessToken) {
      return NextResponse.json(
        { message: data?.message ?? '로그인에 실패했습니다.' },
        { status: upstream.status || 401 },
      );
    }

    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_KEY, data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({ message: '로그인 성공' }, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
