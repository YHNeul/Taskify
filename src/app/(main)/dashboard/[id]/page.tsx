/**
 * @file 대시보드 상세 페이지 - 칸반보드 ( /dashboard/{dashboardId} )
 * @description 서버 컴포넌트. 초기 데이터를 fetch로 병렬 패치한 뒤
 * DashboardBoard 클라이언트 컴포넌트에 props로 전달합니다.
 *
 * @author 하늘
 *
 * @notes
 * - 상호작용 로직(모달, 무한스크롤 등)은 DashboardBoard.tsx에서 처리합니다.
 */

import DashboardBoard from '@/components/dashboard/DashboardBoard';

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * NOTE: 서버 컴포넌트에서 인증된 API를 호출하려면 토큰을 쿠키에 저장해야 합니다.
 * 현재 토큰이 localStorage에만 저장되어 있어 서버에서 읽을 수 없습니다.
 * 로그인 구현 시 쿠키 저장 방식이 확정되면 서버 사이드 fetch를 다시 활성화할 수 있습니다.
 * 지금은 초기 데이터 없이 클라이언트에서 전부 로드하는 방식으로 동작합니다.
 */
export default async function DashboardPage({ params }: PageProps) {
  const { id } = await params;
  const dashboardId = Number(id);

  return <DashboardBoard dashboardId={dashboardId} />;
}
