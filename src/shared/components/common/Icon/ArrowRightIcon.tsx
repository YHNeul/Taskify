/**
 * @file ArrowRightIcon.tsx
 * @description 오른쪽으로 향하는 방향 아이콘 컴포넌트입니다.
 * 내 대시보드 페이지와 페이지네이션에서 사용합니다.
 *
 * SVGProps를 확장하여 width, height, className 등의 속성을 props로 전달받아
 * 아이콘의 크기와 스타일을 유연하게 제어할 수 있습니다.
 *
 * @example
 * <ArrowRightIcon width={20} height={20} />
 * <ArrowRightIcon className="w-5 h-5 text-gray" />
 */

import { SVGProps } from 'react';
import ArrowRightSvg from '@/shared/assets/icons/ic-arrow-right.svg';

export default function ArrowRightIcon(props: SVGProps<SVGSVGElement>) {
  return <ArrowRightSvg {...props} />;
}
