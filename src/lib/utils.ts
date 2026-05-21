/**
 * @file cn함수 정의
 */

import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * tailwind.config.ts의 커스텀 fontSize 토큰을 font-size 그룹으로 등록합니다.
 * 미등록 시 tailwind-merge가 text-gray-700 같은 색상 클래스를 제거할 수 있습니다.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        {
          text: [
            '3xl-bold',
            '3xl-semibold',
            '2xl-semibold',
            '2xl-medium',
            '2xl-regular',
            'xl-bold',
            'xl-semibold',
            'xl-medium',
            'xl-regular',
            '2lg-bold',
            '2lg-semibold',
            '2lg-medium',
            '2lg-regular',
            'lg-bold',
            'lg-semibold',
            'lg-medium',
            'lg-regular',
            'md-bold',
            'md-semibold',
            'md-medium',
            'md-regular',
            'sm-semibold',
            'sm-medium',
            'xs-semibold',
            'xs-medium',
            'xs-regular',
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
