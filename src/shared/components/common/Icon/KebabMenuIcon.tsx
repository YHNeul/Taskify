/**
 * @file KebabMenuIcon.tsx
 * @description 점 세개가 세로로 있는 메뉴 아이콘 컴포넌트입니다.
 * 할 일 카드 내 메뉴 버튼에서 사용합니다.
 *
 * SVGProps를 확장하여 width, height, className 등의 속성을 props로 전달받아
 * 아이콘의 크기와 스타일을 유연하게 제어할 수 있습니다.
 *
 * @example
 * <KebabMenuIcon width={20} height={20} />
 * <KebabMenuIcon className="w-5 h-5 text-gray" />
 */

import { SVGProps } from 'react';
import KebabMenuSvg from '@/shared/assets/icons/ic-kebab-menu.svg';

export default function KebabMenuIcon(props: SVGProps<SVGSVGElement>) {
  return <KebabMenuSvg {...props} />;
}
