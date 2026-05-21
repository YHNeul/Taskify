/**
 * @file 전역 레이아웃 (Root Layout)
 * @description 애플리케이션 전체에 공통으로 적용되는 레이아웃입니다.
 * @note 전역 스타일, 공통 폰트, 상태 관리 Provider(React Query 등)가 세팅되는 곳입니다.
 */

import type { Metadata } from 'next';
import QueryProvider from '@/lib/QueryProvider';
import './globals.css';
import localFont from 'next/font/local';

const pretendard = localFont({
  src: [
    {
      path: '../fonts/Pretendard-Regular.woff2',
      weight: '400',
    },
    {
      path: '../fonts/Pretendard-Medium.woff2',
      weight: '500',
    },
    {
      path: '../fonts/Pretendard-SemiBold.woff2',
      weight: '600',
    },
    {
      path: '../fonts/Pretendard-Bold.woff2',
      weight: '700',
    },
  ],
  variable: '--font-pretendard',
});

export const metadata: Metadata = {
  title: {
    default: 'Taskify',
    template: '%s | Taskify', // 하위 페이지에서 적용되는 템플릿 (e.g. "로그인 | Taskify ")
  },
  description: '새로운 일정관리, Taskify',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={pretendard.variable}>
      <body className="font-main">
        <QueryProvider>{children}</QueryProvider>
        <div id="modal-root" /> {/* 모달 */}
      </body>
    </html>
  );
}
