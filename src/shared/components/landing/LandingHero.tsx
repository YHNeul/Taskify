/**
 * @file LandingHero.tsx
 * @description 랜딩 페이지에 표시되는 히어로 컴포넌트입니다.
 * @author 하늘
 * @notes
 * - 반응형 3단계: 모바일(px-[44px], 이미지 w-full) / 태블릿(sm:px-[103px]) / 데스크탑(lg:px-0, 이미지 max-w-[38vw])
 */

import Link from 'next/link';
import clsx from 'clsx';

type LandingHeroProps = {
  montserratClass: string;
};

export default function LandingHero({ montserratClass }: LandingHeroProps) {
  return (
    <section className="bg-gray-900">
      {/* 일러스트 — 페이지 로드 시 위에서 내려오며 등장 */}
      <div className="mx-auto w-full max-w-6xl px-11 pt-10 sm:px-24 sm:pt-24 lg:px-0 lg:pt-24">
        <div
          className="mx-auto w-full max-w-3xl"
          style={{ animation: 'fadeInDown 0.8s ease-out both' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- 히어로 전체 이미지 */}
          <img
            src="/images/landing/illustartion.png"
            alt="Taskify 팀 협업 일러스트"
            className="h-auto w-full rounded-lg"
            fetchPriority="high"
          />
        </div>
      </div>

      {/* 제목 + CTA — 아래에서 올라오며 순차 등장 */}
      <div className="flex flex-col items-center pb-12 sm:pb-16 md:pb-20 lg:pb-24">
        <h1
          className="mt-6 flex flex-col items-center gap-2 text-center sm:mt-8 md:flex-row md:items-baseline md:gap-5 lg:mt-10"
          style={{ animation: 'fadeInUp 0.8s ease-out 0.3s both' }}
        >
          <span className="text-4xl font-bold leading-none tracking-tight text-white md:text-5xl lg:text-6xl lg:leading-tight">
            새로운 일정 관리
          </span>
          <span
            className={clsx(
              'text-4xl font-bold leading-none tracking-tight text-brand-violet',
              'md:text-5xl',
              'lg:text-7xl',
              montserratClass,
            )}
          >
            Taskify
          </span>
        </h1>

        <Link
          href="/login"
          className="mt-24 inline-flex h-12 min-w-56 items-center justify-center rounded-lg bg-brand-violet text-base font-medium text-white transition-opacity hover:opacity-90 sm:mt-8 md:h-14 md:min-w-72 lg:mt-20"
          style={{ animation: 'fadeInUp 0.8s ease-out 0.6s both' }}
        >
          로그인하기
        </Link>
      </div>
    </section>
  );
}
