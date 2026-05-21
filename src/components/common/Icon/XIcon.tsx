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

export default function XIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M17 7L7 17"
        stroke="#6B6B6B"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M7 7L17 17"
        stroke="#6B6B6B"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
