/**
 * @file XIcon.tsx
 * @description 엑스 모양 아이콘 컴포넌트입니다. 모달을 닫을 때 사용합니다.
 *
 * SVGProps를 확장하여 width, height, className 등의 속성을 props로 전달받아
 * 아이콘의 크기와 스타일을 유연하게 제어할 수 있습니다.
 *
 * @example
 * <XIcon width={20} height={20} />
 * <XIcon className="w-5 h-5 text-gray" />
 */

import { SVGProps } from 'react';
import XSvg from '@/shared/assets/icons/ic-x.svg';

export default function XIcon(props: SVGProps<SVGSVGElement>) {
  return <XSvg {...props} />;
}
