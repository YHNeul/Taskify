/**
 * @file Button.tsx
 * @description Taskify의 공통 버튼 컴포넌트
 *
 * ### variant (시각적 스타일)
 * - primary — 보라색 채움 버튼 (로그인, 모달 확인 등)
 * - secondary — 흰색 배경 + 회색 테두리 버튼 (모달 취소, 삭제 등)
 *
 * ### size (공통 semantic 크기)
 * - sm — 작은 공통 버튼
 * - md — 기본 공통 버튼
 * - lg — 큰 공통 버튼
 *
 * @author 하늘
 *
 * @example
 * // 기본 버튼
 * <Button variant="primary" size="md">저장</Button>
 *
 * @example
 * // 작은 보조 버튼
 * <Button variant="secondary" size="sm">취소</Button>
 */

import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentPropsWithoutRef } from 'react';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-[10px] transition-colors cursor-pointer disabled:cursor-not-allowed',
  {
    variants: {
      /**
       * - primary: 보라색 채움 (#5534DA), 비활성화 시 회색
       * - secondary: 흰색 배경 + 회색 테두리 (#D9D9D9), 비활성화 시 텍스트 연하게
       */
      variant: {
        primary:
          'bg-brand-violet text-white hover:bg-[#4a2dc0] disabled:bg-gray-400',
        secondary:
          'bg-white text-gray-700 border border-gray-300 hover:bg-brand-violet-light disabled:text-gray-400',
      },
      /**
       * 공통 semantic 크기입니다.
       */
      size: {
        sm: 'h-[32px] rounded-[6px] px-3 text-md-medium',
        md: 'h-[40px] rounded-[8px] px-4 text-md-medium',
        lg: 'h-[48px] rounded-[8px] px-6 text-lg-medium',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

/** {@link buttonVariants}에서 추론된 variant/size prop 타입 */
export type ButtonVariantProps = VariantProps<typeof buttonVariants>;
/** HTML button 속성과 cva variant 타입을 결합한 Button props */
export type ButtonProps = ComponentPropsWithoutRef<'button'> &
  ButtonVariantProps;

/**
 * 공통 버튼 컴포넌트입니다.
 *
 * variant로 시각적 스타일을, size로 크기/레이아웃을 제어합니다.
 * 반응형 버튼(add_column, add_todo, dashboard_card, add_board, delete_dashboard, accept_reject)은
 * Tailwind의 md/lg 브레이크포인트로 자동 대응됩니다.
 *
 * @param props - {@link ButtonProps}
 */
export default function Button({
  variant,
  size,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        buttonVariants({
          variant,
          size,
        }),
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
