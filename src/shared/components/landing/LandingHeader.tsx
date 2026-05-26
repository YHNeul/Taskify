/**
 * @file LandingHeader.tsx
 * @description 랜딩 페이지에 표시되는 헤더 컴포넌트입니다.
 * @author 하늘
 * @notes
 * - 반응형 3단계: 모바일(px-4) / 태블릿(md:px-10) / 데스크탑(lg:px-20)
 */

import Image from 'next/image';
import Link from 'next/link';
import { cookies } from 'next/headers';

import { AUTH_COOKIE_KEY } from '@/shared/constants/auth';
import LandingLogoutButton from '@/shared/components/landing/LandingLogoutButton';

export default async function LandingHeader() {
  const cookieStore = await cookies();
  const isLoggedIn = Boolean(cookieStore.get(AUTH_COOKIE_KEY)?.value);
  const logoHref = isLoggedIn ? '/mydashboard' : '/';

  return (
    <header className="flex h-[70px] w-full shrink-0 items-center justify-between bg-gray-900 px-4 md:px-10 lg:px-20">
      <Link
        href={logoHref}
        className="flex items-center gap-2"
        aria-label="Taskify 홈"
      >
        <Image
          src="/logo-taskify-icon-sm.svg"
          alt=""
          width={24}
          height={28}
          className="h-7 w-auto brightness-0 invert"
          priority
        />
        <span className="hidden text-xl font-bold text-white sm:inline">
          Taskify
        </span>
      </Link>
      <nav className="flex items-center gap-5 text-sm text-white md:gap-6 md:text-base">
        {isLoggedIn ? (
          <>
            <Link href="/mydashboard" className="hover:opacity-80">
              내 대시보드
            </Link>
            <LandingLogoutButton />
          </>
        ) : (
          <>
            <Link href="/login" className="hover:opacity-80">
              로그인
            </Link>
            <Link href="/signup" className="hover:opacity-80">
              회원가입
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
