'use client';

/**
 * @file LandingFeatureGrid.tsx
 * @description 랜딩 페이지에 표시되는 기능 카드 그리드 컴포넌트입니다.
 * @author 하늘
 * @notes
 * - 반응형 3단계: 모바일(flex-col, 카드 max-w-[378px]) / 데스크탑(lg:flex-row, 카드 max-w-none 균등 분배)
 * - 이미지 영역 높이: 모바일 236px / sm 260px
 * - 카드 미리보기 이미지는 236px x 236px로 고정되어 있습니다.
 * - 카드 미리보기 이미지는 PNG 파일로 저장되어 있습니다.
 * - 카드 미리보기 이미지는 카드 너비:높이 = 2:1 고정 비율로 저장되어 있습니다.
 */

import { useInView } from '@/shared/hooks/useInView';
import clsx from 'clsx';

const CARDS = [
  {
    image: '/images/landing/landing03.png',
    title: '대시보드 설정',
    description: '대시보드 사진과 이름을 변경할 수 있어요.',
    alt: '대시보드 설정 화면',
  },
  {
    image: '/images/landing/landing04.png',
    title: '초대',
    description: '새로운 팀원을 초대할 수 있어요.',
    alt: '초대 내역 화면',
  },
  {
    image: '/images/landing/landing05.png',
    title: '구성원',
    description: '구성원을 초대하고 내보낼 수 있어요.',
    alt: '구성원 관리 화면',
  },
] as const;

const CARD_DELAYS = ['0s', '0.15s', '0.3s'] as const;

export default function LandingFeatureGrid() {
  const { ref, isVisible } = useInView(0.1);

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className="bg-gray-900 px-4 pt-14 pb-14 md:px-10 md:py-20"
    >
      <div className="mx-auto max-w-6xl">
        {/* 타이틀 — 섹션 진입 시 위로 올라오며 등장 */}
        <h2
          className={clsx(
            'reveal-up mb-10 typo-2xl-bold text-center text-white',
            'sm:typo-3xl-bold',
            'lg:text-left lg:typo-3xl-bold',
            isVisible && 'is-visible',
          )}
        >
          생산성을 높이는 다양한 설정 ⚡
        </h2>

        <div className="flex flex-col items-stretch gap-10 md:gap-12 lg:flex-row lg:gap-8">
          {CARDS.map((card, i) => (
            <article
              key={card.title}
              className={clsx(
                'reveal-up mx-auto flex w-full max-w-sm flex-col overflow-hidden rounded-lg',
                'lg:mx-0 lg:max-w-none lg:flex-1',
                isVisible && 'is-visible',
              )}
              style={{ transitionDelay: CARD_DELAYS[i] }}
            >
              <div className="flex h-56 shrink-0 items-center justify-center bg-gray-600 p-4 sm:h-64">
                {/* eslint-disable-next-line @next/next/no-img-element -- 카드 미리보기 PNG */}
                <img
                  src={card.image}
                  alt={card.alt}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div className="flex flex-1 flex-col justify-center bg-gray-800 px-8 py-5 sm:px-6">
                <h3 className="typo-md-bold text-white sm:typo-lg-bold lg:typo-lg-bold">
                  {card.title}
                </h3>
                <p className="mt-4 typo-xs-medium text-white sm:mt-3 sm:typo-lg-medium lg:typo-lg-medium">
                  {card.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
