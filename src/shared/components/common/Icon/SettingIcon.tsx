/**
 * @file SettingIcon.tsx
 * @description 설정 아이콘 컴포넌트입니다.
 * 상단 헤더의 관리 버튼에 사용됩니다.
 *
 * SVGProps를 확장하여 width, height, className 등의 속성을 props로 전달받아
 * 아이콘의 크기와 스타일을 유연하게 제어할 수 있습니다.
 *
 * @example
 * <SettingIcon width={20} height={20} />
 * <SettingIcon className="w-5 h-5 text-gray" />
 */

import { SVGProps } from 'react';
import SettingSvg from '@/shared/components/common/Icon/ic-setting.svg';

export default function SettingIcon(props: SVGProps<SVGSVGElement>) {
  return <SettingSvg {...props} />;
}
