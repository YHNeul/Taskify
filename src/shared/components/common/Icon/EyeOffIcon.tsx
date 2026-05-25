/**
 * @file EyeOffIcon.tsx
 * @description 눈 감고있는 아이콘 컴포넌트입니다. 비밀번호 인풋에서 사용합니다.
 *
 * SVGProps를 확장하여 width, height, className 등의 속성을 props로 전달받아
 * 아이콘의 크기와 스타일을 유연하게 제어할 수 있습니다.
 *
 * @example
 * <EyeOffIcon width={20} height={20} />
 * <EyeOffIcon className="w-5 h-5 text-gray" />
 */

import { SVGProps } from 'react';
import EyeOffSvg from '@/shared/assets/icons/ic-eye-off.svg';

export default function EyeOffIcon(props: SVGProps<SVGSVGElement>) {
  return <EyeOffSvg {...props} />;
}
