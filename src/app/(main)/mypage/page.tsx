/**
 * @file 계정 관리 페이지 ( /mypage )
 * @description 서버 컴포넌트. 마이페이지 UI를 렌더링합니다.
 *
 * @note
 * - 현재 토큰이 localStorage에 있어 서버에서 접근 불가
 * - 데이터 조회 및 상호작용은 클라이언트 컴포넌트에서 처리합니다.
 */

import MyPageContent from '@/components/mypage/MyPageContent';

export default function MyPage() {
  return <MyPageContent />;
}
