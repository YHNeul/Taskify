/**
 * @file UserName.tsx
 * @description 사용자의 프로필 이미지와 이름이 보이는 컴포넌트입니다.
 *
 * ### 컴포넌트 로직
 * 1. prop으로 사용자 정보 내려받기
 * 2. UserProfileImage.tsx로 사용자 정보 내려줌
 *
 * @author 수경
 *
 */

import { ProfileOwner } from '@/shared/types/user';
import UserProfileImage from '@/shared/components/common/User/UserProfileImage';
import clsx from 'clsx';

interface Props {
  profile: ProfileOwner;
  /** @default 'typo-lg-regular' */
  fontSize?: string;
}

export default function UserName({
  profile,
  fontSize = 'typo-lg-regular',
}: Props) {
  const { nickname } = profile;

  return (
    <div className="flex items-center gap-2 py-1 rounded-2xl">
      <UserProfileImage profile={profile} />
      <p className={clsx('text-gray-700', fontSize)}>{nickname}</p>
    </div>
  );
}
