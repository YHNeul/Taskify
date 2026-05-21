/**
 * @file LandingHero.tsx
 * @description 랜딩 페이지에 표시되는 히어로 컴포넌트입니다.
 * @author 하늘
 * @notes
 * - 반응형 3단계: 모바일(px-[44px], 이미지 w-full) / 태블릿(sm:px-[103px]) / 데스크탑(lg:px-0, 이미지 max-w-[38vw])
 */

import Link from 'next/link';

type LandingHeroProps = {
  montserratClass: string;
};

export default function LandingHero({ montserratClass }: LandingHeroProps) {
  return (
    <section className="bg-gray-900">
      {/* 일러스트 — 페이지 로드 시 위에서 내려오며 등장 */}
      <div className="px-[44px] pt-[42px] sm:px-[103px] sm:pt-[94px] lg:px-0 lg:pt-[94px]">
        <div
          className="mx-auto w-full lg:max-w-[38vw]"
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
      <div className="flex flex-col items-center pb-[46px] sm:pb-16 md:pb-20 lg:pb-[5.2vw]">
        <h1
          className="mt-[26px] flex flex-col items-center gap-2 text-center sm:mt-8 md:flex-row md:items-baseline md:gap-5 lg:mt-[clamp(24px,2.5vw,48px)]"
          style={{ animation: 'fadeInUp 0.8s ease-out 0.3s both' }}
        >
          <span className="text-[40px] font-bold leading-none tracking-[-0.02em] text-white md:text-[48px] lg:text-[clamp(40px,3.125vw,60px)] lg:leading-[1.3]">
            새로운 일정 관리
          </span>
          <span
            className={`text-[40px] font-bold leading-none tracking-[-1px] text-brand-violet md:text-[52px] lg:text-[clamp(48px,3.958vw,76px)] ${montserratClass}`}
          >
            Taskify
          </span>
        </h1>

        <Link
          href="/login"
          className="mt-[101px] inline-flex h-[46px] min-w-[235px] items-center justify-center rounded-lg bg-brand-violet text-base font-medium text-white transition-opacity hover:opacity-90 sm:mt-8 md:h-[54px] md:min-w-[280px] lg:mt-[clamp(48px,5.78vw,111px)]"
          style={{ animation: 'fadeInUp 0.8s ease-out 0.6s both' }}
        >
          로그인하기
        </Link>
      </div>
    </section>
  );
}
