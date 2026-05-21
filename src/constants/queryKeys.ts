/**
 * @file React Query 키 상수 모음
 * @description 데이터 캐싱과 무효화(invalidateQueries)에 사용되는 쿼리 키(Query Key)를 오타 없이 관리하기 위한 파일입니다.
 *
 * @notes
 * - 팀원 모두가 이 파일을 통해 쿼리 키를 사용해야 합니다.
 * - 함수형으로 작성하면 인자에 따라 고유한 키가 생성되어 캐시 분리가 됩니다.
 *
 * @example
 * // 특정 대시보드 카드 목록 캐시 무효화
 * queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cards(columnId) });
 */

export const QUERY_KEYS = {
  // 대시보드
  dashboard: (dashboardId: number) => ['dashboard', dashboardId] as const,
  dashboards: () => ['dashboards'] as const,

  // 칼럼
  columns: (dashboardId: number) => ['columns', dashboardId] as const,

  // 카드 (칼럼별, 무한스크롤)
  cards: (columnId: number) => ['cards', columnId] as const,

  // 멤버
  members: (dashboardId: number) => ['members', dashboardId] as const,

  // 내 정보
  me: () => ['me'] as const,
};
