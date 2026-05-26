/**
 * @file CrownIcon.tsx
 * @description 왕관 모양 아이콘 컴포넌트입니다.
 * 사이드 바 내 내가 만든 대시보드 타이틀 옆에 표시됩니다.
 * @author 하늘
 */

import { SVGProps } from 'react';
import CrownSvg from '@/shared/assets/icons/ic-crown.svg';

export default function CrownIcon(props: SVGProps<SVGSVGElement>) {
  return <CrownSvg {...props} />;
}
