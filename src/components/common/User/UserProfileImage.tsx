/**
 * @file UserProfileImage.tsx
 * @description 사용자의 프로필 이미지를 렌더링하는 컴포넌트입니다.
 *
 * ### 컴포넌트 로직
 * 1. 이미지 URL이 있으면 → 프로필 이미지 표시
 * 2. 없으면 → 이니셜 UI 표시
 * 3. 공통 사이즈 / 스타일 유지
 *
 * @author 수경
 */

import { ProfileOwner } from '@/types/user';
import Image from 'next/image';

/** 프로필 이미지 없을 때 순서에 따라 순환하는 배경색 */
export const CHIP_COLORS = [
  '#FFC85A',
  '#FDD446',
  '#9DD7ED',
  '#C4B1A2',
  '#A3C4A2',
  '#C4A3BD',
];

interface Props {
  profile: ProfileOwner | null;
  /** @default 26px */
  size?: number;
  /** 색상 순환 및 위치 계산에 사용되는 인덱스 */
  index?: number;
}

export default function UserProfileImage({
  profile,
  size = 26,
  index = 0,
}: Props) {
  if (!profile) return null; // null이면 렌더링 안함

  const { nickname, profileImageUrl } = profile;

  /**
   * 이미지 존재 여부
   * - src 값이 있으면 true, 없으면 false
   */
  const hasImage = !!profileImageUrl;

  /**
   * 이니셜 생성 로직
   * - 이름 첫 글자 추출
   */
  const initial = nickname?.[0] ?? '?';

  return (
    <>
      <div
        style={{
          width: size,
          height: size,
          backgroundColor: CHIP_COLORS[index % CHIP_COLORS.length],
        }}
        className="rounded-full border-white border-2 overflow-hidden flex items-center justify-center"
      >
        {hasImage ? (
          <Image
            src={profileImageUrl}
            alt="담당자 프로필"
            width={size}
            height={size}
            className="object-cover"
            unoptimized
          />
        ) : (
          <span className="text-white text-xs-semibold">{initial}</span>
        )}
      </div>
    </>
  );
}
