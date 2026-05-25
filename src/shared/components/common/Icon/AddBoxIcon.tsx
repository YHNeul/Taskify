/**
 * @file AddBoxIcon.tsx
 * @description 추가 박스 아이콘 컴포넌트입니다.
 * 좌측 사이드바에서 대시보드를 추가하는 버튼과 헤더의 초대하기 버튼에서 사용됩니다.
 *
 * SVGProps를 확장하여 width, height, className 등의 속성을 props로 전달받아
 * 아이콘의 크기와 스타일을 유연하게 제어할 수 있습니다.
 *
 * @example
 * <AddBoxIcon width={20} height={20} />
 * <AddBoxIcon className="w-5 h-5 text-gray" />
 */

import { SVGProps } from 'react';
import AddBoxSvg from '@/shared/components/common/Icon/ic-add-box.svg';

export default function AddBoxIcon(props: SVGProps<SVGSVGElement>) {
  return <AddBoxSvg {...props} />;
}
