/**
 * @file dashboard.fetch.ts
 * @description 서버 컴포넌트 전용 대시보드 데이터 패치 함수 모음입니다.
 * @author 하늘
 *
 * @notes
 * - Next.js의 native fetch를 사용하여 서버 캐싱을 최대한 활용합니다.
 * - 이 파일의 함수들은 서버 컴포넌트(page.tsx)에서만 호출해야 합니다.
 * - 클라이언트 컴포넌트에서의 API 호출은 src/api/dashboard.ts (axios 버전)를 사용하세요.
 */

import type {
  Dashboard,
  ColumnsResponse,
  CardsResponse,
  MembersResponse,
} from '@/types/dashboard';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

/** Authorization 헤더 포함 기본 헤더 빌더 (서버 환경용) */
const getHeaders = () => ({
  'Content-Type': 'application/json',
  // NOTE: 서버 컴포넌트에서는 쿠키나 서버 토큰으로 인증합니다.
  // TODO: [하늘] 서버 사이드 인증 토큰 처리 방식 확정 후 반영
});

/**
 * 대시보드 단건 조회 (서버 컴포넌트용)
 * @param dashboardId - 조회할 대시보드 ID
 */
export const fetchDashboard = async (
  dashboardId: number,
): Promise<Dashboard> => {
  const res = await fetch(`${BASE_URL}/dashboards/${dashboardId}`, {
    headers: getHeaders(),
    // 대시보드 정보는 자주 바뀌지 않으므로 60초 캐싱
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`대시보드 조회 실패: ${res.status}`);
  return res.json();
};

/**
 * 칼럼 목록 조회 (서버 컴포넌트용)
 * @param dashboardId - 칼럼을 조회할 대시보드 ID
 */
export const fetchColumns = async (
  dashboardId: number,
): Promise<ColumnsResponse> => {
  const res = await fetch(`${BASE_URL}/columns?dashboardId=${dashboardId}`, {
    headers: getHeaders(),
    next: { revalidate: 30 },
  });
  if (!res.ok) throw new Error(`칼럼 목록 조회 실패: ${res.status}`);
  return res.json();
};

/**
 * 할 일 카드 목록 조회 (서버 컴포넌트용, 첫 페이지만)
 * @param columnId - 카드를 조회할 칼럼 ID
 * @param size - 한 번에 불러올 카드 수 (기본값 10)
 */
export const fetchCards = async (
  columnId: number,
  size = 10,
): Promise<CardsResponse> => {
  const res = await fetch(
    `${BASE_URL}/cards?columnId=${columnId}&size=${size}`,
    {
      headers: getHeaders(),
      // 카드는 자주 바뀌므로 캐시 없이 항상 최신 데이터 사용
      cache: 'no-store',
    },
  );
  if (!res.ok) throw new Error(`카드 목록 조회 실패: ${res.status}`);
  return res.json();
};

/**
 * 대시보드 멤버 목록 조회 (서버 컴포넌트용)
 * @param dashboardId - 멤버를 조회할 대시보드 ID
 */
export const fetchMembers = async (
  dashboardId: number,
): Promise<MembersResponse> => {
  const res = await fetch(
    `${BASE_URL}/members?dashboardId=${dashboardId}&page=1&size=20`,
    {
      headers: getHeaders(),
      next: { revalidate: 60 },
    },
  );
  if (!res.ok) throw new Error(`멤버 목록 조회 실패: ${res.status}`);
  return res.json();
};
