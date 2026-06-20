/**
 * @file 대시보드 상세 페이지 - 칸반보드 ( /dashboard/{dashboardId} )
 * @description 서버 컴포넌트. 라우트 전환 체감 속도를 우선하기 위해
 * 데이터를 서버에서 선조회하지 않고 DashboardBoard를 즉시 렌더링합니다.
 *
 * @author 하늘
 *
 * @notes
 * - 상호작용 로직(모달, 무한스크롤 등)은 DashboardBoard.tsx에서 처리합니다.
 */

import { Suspense } from 'react';
import DashboardBoard from '@/shared/components/dashboard/DashboardBoard';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DashboardPage({ params }: PageProps) {
  const { id } = await params;
  const dashboardId = Number(id);

  return (
    <Suspense
      fallback={<div className="min-h-screen-without-header bg-gray-100" />}
    >
      <DashboardBoard dashboardId={dashboardId} />
    </Suspense>
  );
}
