/**
 * @file 서비스 랜딩 페이지 ( / )
 * @description Taskify 서비스에 처음 접속했을 때 보이는 소개 화면입니다.
 * @note 비로그인 유저도 접근할 수 있어야 하며, 서비스의 장점을 어필하는 UI 위주로 구성됩니다.
 */

import { Montserrat } from 'next/font/google';
import LandingFeatureGrid from '@/components/landing/LandingFeatureGrid';
import LandingFooter from '@/components/landing/LandingFooter';
import LandingHeader from '@/components/landing/LandingHeader';
import LandingHero from '@/components/landing/LandingHero';
import LandingPointSection from '@/components/landing/LandingPointSection';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-landing-montserrat',
});

export default function Home() {
  return (
    <div
      className={`${montserrat.variable} min-h-screen bg-gray-900 text-white`}
    >
      <LandingHeader />
      <main>
        <LandingHero montserratClass="font-[family-name:var(--font-landing-montserrat)]" />
        <LandingPointSection
          point="Point 1"
          title="일의 우선순위를 관리하세요"
          imageSrc="/images/landing/landing01.png"
          imageAlt="칸반 보드로 일의 우선순위를 관리하는 화면"
        />
        <LandingPointSection
          point="Point 2"
          title="해야 할 일을 등록하세요"
          imageFirst
          imageSrc="/images/landing/landing02.png"
          imageAlt="할 일을 생성하는 폼 화면"
        />
        <LandingFeatureGrid />
      </main>
      <LandingFooter />
    </div>
  );
}
