'use client';

/**
 * @file LandingPointSection.tsx
 * @description 랜딩 페이지에 표시되는 포인트 섹션 컴포넌트입니다.
 * @author 하늘
 * @notes
 * - 반응형 3단계: 모바일(flex-col, aspect-[1/2]) / sm(aspect-[664/972]) / 데스크탑(lg:flex-row, aspect-[2/1])
 * - 카드 최대 너비 max-w-[1200px], 데스크탑 기준 너비:높이 = 2:1
 * - 카드 높이는 600px로 고정되어 있습니다.
 * - 카드 미리보기 이미지는 420px x 420px로 고정되어 있습니다.
 * - 카드 미리보기 이미지는 PNG 파일로 저장되어 있습니다.
 * - 카드 미리보기 이미지는 카드 너비:높이 = 2:1 고정 비율로 저장되어 있습니다.
 */

import { useInView } from '@/hooks/useInView';

type LandingPointSectionProps = {
  point: string;
  title: string;
  /** 데스크탑에서 이미지가 왼쪽이면 true (Point 2) */
  imageFirst?: boolean;
  imageSrc: string;
  imageAlt: string;
};

export default function LandingPointSection({
  point,
  title,
  imageFirst = false,
  imageSrc,
  imageAlt,
}: LandingPointSectionProps) {
  const { ref, isVisible } = useInView(0.12);

  return (
    /*
     * py-[45px]: 두 카드 사이 간격 = 45 + 45 = 90px (Figma 스펙)
     * lg:px-[18.75vw]: 1920px 기준 360px 좌우 여백 → 카드 너비 1200px
     */
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className="bg-gray-900 px-4 py-[30px] sm:px-10 sm:py-[45px] lg:px-[18.75vw]"
    >
      {/*
       * lg:h-[600px]: Figma 스펙 1200×600 카드
       * overflow-hidden: 이미지 카드 모서리 클리핑
       */}
      {/*
       * lg:aspect-[2/1]: 카드 너비:높이 = 2:1 고정 비율
       * → 뷰포트가 좁아져도 카드 높이가 비례 축소 → 이미지 위 공백 일정하게 유지
       * 1920px 기준: 1200 × 600 (= 2:1) ✓
       */}
      <div
        className={`mx-auto flex max-w-[1200px] flex-col overflow-hidden rounded-2xl bg-gray-800 aspect-[1/2] sm:aspect-[664/972] md:aspect-auto lg:aspect-[2/1] ${
          imageFirst ? 'md:flex-row-reverse' : 'md:flex-row'
        }`}
      >
        {/*
         * 텍스트 컬럼
         * lg:pt-[123px]: Point 1/2 라벨의 card top 기준 상단 여백 123px
         * Point 1 lg:pl-[60px]  → 카드 기준 left=60px
         * Point 2 lg:pl-[44px]  → 우측 컬럼 기준 left=44px (카드 기준 left=644px)
         */}
        <div
          className={`flex min-w-0 flex-1 flex-col items-center px-6 pt-[92px] pb-8 font-main sm:items-start sm:flex-none sm:pt-[63px] sm:pb-0 sm:pl-[60px] md:px-10 md:py-10 lg:pb-0 lg:pt-[6.4vw] ${
            imageFirst ? 'lg:pl-[2.3vw]' : 'lg:pl-[3.125vw]'
          } ${imageFirst ? 'reveal-right' : 'reveal-left'} ${isVisible ? 'is-visible' : ''}`}
          style={{ transitionDelay: '0s' }}
        >
          {/* 태블릿: 22px / 데스크탑: clamp(16px,1.15vw,22px) */}
          <p className="font-medium leading-none text-center text-gray-400 text-[18px] sm:text-left sm:text-[22px] md:text-[18px] lg:text-[clamp(16px,1.15vw,22px)]">
            {point}
          </p>
          {/*
           * 태블릿: 36px / 64px line-height → 2줄 × 64px = 128px (Figma 스펙)
           * sm:mt-[104px]: 189(title top) - 63(label top) - 22(label h) = 104px
           * Point1 sm:max-w-[302px]: 664-60-302=302px bounding box
           * Point2 sm:max-w-[230px]: 664-60-374=230px bounding box
           */}
          <h2
            className={`mt-[61px] break-keep font-bold text-center text-white text-[26px] leading-[1.4] max-w-[180px] sm:text-left sm:text-[36px] sm:leading-[64px] sm:mt-[104px] md:text-[36px] md:leading-[48px] lg:mt-[5.4vw] lg:text-[clamp(34px,2.5vw,48px)] lg:leading-[clamp(46px,3.33vw,64px)] ${
              imageFirst
                ? 'sm:max-w-[230px] lg:max-w-[302px]'
                : 'sm:max-w-[302px] lg:max-w-[302px]'
            }`}
          >
            {title}
          </h2>
        </div>

        {/*
         * Point 1 (imageFirst=false): items-center + lg:p-0
         *   → 이미지가 우측 컬럼 전체 너비를 채워 오른쪽 테두리에만 붙음
         *   → items-center로 위아래 세로 중앙 정렬 (위/아래 테두리 분리)
         * Point 2 (imageFirst=true): items-end + lg:px-10 lg:pb-0
         *   → items-end로 하단 테두리에만 붙음
         *   → lg:px-10 좌우 패딩으로 좌/우 테두리 분리
         */}
        <div
          className={`flex min-w-0 flex-1 overflow-hidden md:p-8 ${
            imageFirst
              ? 'items-end justify-end px-[63px] pb-0 pt-0 sm:justify-center sm:px-8 md:pb-0 md:pt-0 lg:justify-start lg:px-10 lg:pb-0 lg:pt-0'
              : 'items-end justify-end pl-[47px] pr-0 pb-0 pt-0 sm:pl-20 sm:pr-0 md:pb-0 md:pr-0 lg:p-0'
          } ${imageFirst ? 'reveal-left' : 'reveal-right'} ${isVisible ? 'is-visible' : ''}`}
          style={{ transitionDelay: '0.2s' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- 랜딩 스크린샷 PNG */}
          <img
            src={imageSrc}
            alt={imageAlt}
            className={`h-auto w-full object-contain ${
              imageFirst
                ? 'max-w-[420px] lg:w-auto lg:max-h-[23vw]'
                : 'max-w-full'
            }`}
          />
        </div>
      </div>
    </section>
  );
}
