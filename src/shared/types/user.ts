/**
 * @file 유저 도메인 타입 정의
 * @description 로그인한 유저 정보 및 구성원(Member), 초대(Invitation) 관련 데이터 구조를 정의합니다.
 */

/** UserName.tsx, UserProfileIamge.tsx 공통 유저 타입 정의 */
export interface ProfileOwner {
  // prop으로 넘어오는 데이터에 profileImageUrl, nickname을 가지고 있으면 자동으로 통과
  profileImageUrl?: string | null;
  nickname: string;
  id?: number;
}

/**
 * 로그인한 유저 정보
 */
export interface User {
  id: number;
  email: string;
  nickname: string;
  profileImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}
