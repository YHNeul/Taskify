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
 * ### legacySize (기존 화면 프리셋)
 * | 값 | 설명 | 크기 |
 * |---|---|---|
 * | login_lg | 로그인 버튼 대 | 520×50 |
 * | login_sm | 로그인 버튼 소 | 351×50 |
 * | modal_lg | 모달 액션 버튼 대 | 120×48 |
 * | modal_sm | 모달 액션 버튼 소 | 138×42 |
 * | delete_lg | 삭제 버튼 대 | 84×32 |
 * | delete_sm | 삭제 버튼 소 | 52×32 |
 * | comment_lg | 댓글 입력 버튼 대 | 83×32 |
 * | comment_sm | 댓글 입력 버튼 소 | 84×28 |
 * | add_column | 컬럼 추가 버튼 (반응형) | desktop 354×70, tablet 544×70, mobile 284×66 |
 * | add_todo | 할 일 추가 버튼 (반응형) | desktop 314×40, tablet 544×40, mobile 284×32 |
 * | dashboard_card | 대시보드 카드 버튼 (반응형) | desktop 332×70, tablet 247×68, mobile 260×58 |
 * | add_board | 대시보드 추가 버튼 (반응형) | desktop 332×70, tablet 247×68, mobile 260×58 |
 * | delete_dashboard | 대시보드 삭제 버튼 (반응형) | desktop/tablet 320×62, mobile 284×52 |
 *
 * @author 하늘
 *
 * @example
 * // 로그인 버튼 (대)
 * <Button variant="primary" legacySize="login_lg">로그인</Button>
 *
 * @example
 * // 모달 취소 / 확인 버튼 (소)
 * <Button variant="secondary" legacySize="modal_sm">취소</Button>
 * <Button variant="primary" legacySize="modal_sm">확인</Button>
 *
 * @example
 * // 대시보드 삭제 버튼 (반응형)
 * <Button variant="secondary" legacySize="delete_dashboard">대시보드 삭제하기</Button>
 *
 * @example
 * // 할 일 추가 버튼 (반응형, secondary)
 * <Button variant="secondary" legacySize="add_todo">+</Button>
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
      /**
       * 기존 화면 단위 프리셋입니다.
       * 반응형 버튼은 mobile-first 기준으로 md(768px), lg(1024px) 분기를 사용합니다.
       */
      legacySize: {
        /** 로그인/회원가입 페이지 버튼 — 대 (520×50) */
        login_lg: 'w-[520px] h-[50px] rounded-[8px] text-lg-medium',
        /** 로그인/회원가입 페이지 버튼 — 소 (351×50) */
        login_sm: 'w-[351px] h-[50px] rounded-[8px] text-lg-medium',

        /** 모달 액션 버튼 — 대 (120×48) */
        modal_lg: 'w-[120px] h-[48px] rounded-[8px] px-[30px] text-lg-medium',
        /** 모달 액션 버튼 — 소 (138×42) */
        modal_sm: 'w-[138px] h-[42px] rounded-[8px] px-[40px] text-md-medium',

        /** 삭제 버튼 — 대 (84×32) */
        delete_lg:
          'w-[84px] h-[32px] rounded-[4px] px-5 text-md-medium text-brand-violet',
        /** 삭제 버튼 — 소 (52×32) */
        delete_sm:
          'w-[52px] h-[32px] rounded-[4px] px-2 text-xs-medium text-brand-violet',

        /** 댓글 입력 버튼 — 대 (83×32) */
        comment_lg:
          'w-[83px] h-[32px] rounded-[4px] px-5 text-md-medium text-brand-violet',
        /** 댓글 입력 버튼 — 소 (84×28) */
        comment_sm:
          'w-[84px] h-[28px] rounded-[4px] px-5 text-xs-medium text-brand-violet',

        /**
         * 새 컬럼 추가 버튼 — 반응형
         * mobile: 284×66 | tablet(md) ~ desktop(lg): 354×70
         * font: mobile 16px bold → tablet/desktop 18px bold
         */
        add_column:
          'w-[284px] h-[66px] rounded-[8px] md:w-[354px] md:h-[70px] text-lg-bold md:text-2lg-bold gap-3',

        /**
         * 할 일 추가(+) 버튼 — 반응형
         * mobile: 284×32 | tablet(md)~desktop(lg): 314×40 (column 354 - px-5 20×2)
         */
        add_todo:
          'w-[284px] h-[32px] rounded-[8px] md:w-[314px] md:h-[40px] text-md-medium gap-3',

        /**
         * 대시보드 카드 버튼 — 반응형
         * mobile: 260×58 | tablet(md): 247×68 | desktop(lg): 332×70
         * font: mobile 14px semibold → tablet/desktop 16px semibold
         */
        dashboard_card:
          'w-[260px] h-[58px] px-[20px] rounded-[8px] md:w-[247px] md:h-[68px] lg:w-[332px] lg:h-[70px] text-md-semibold md:text-lg-semibold',

        /**
         * 대시보드 추가(+) 버튼 — 반응형
         * mobile: 260×58 | tablet(md): 247×68 | desktop(lg): 332×70
         * font: mobile 14px semibold → tablet/desktop 16px semibold
         */
        add_board:
          'w-[260px] h-[58px] rounded-[8px] md:w-[247px] md:h-[68px] lg:w-[332px] lg:h-[70px] text-md-semibold md:text-lg-semibold gap-3',

        /**
         * 대시보드 삭제 버튼 — 반응형
         * mobile: 284×52 | desktop/tablet(md,lg): 320×62
         * font: mobile 16px medium → tablet/desktop 18px medium
         */
        delete_dashboard:
          'w-[284px] h-[52px] rounded-[8px] md:w-[320px] md:h-[62px] text-lg-medium md:text-2lg-medium',
      },
    },
    compoundVariants: [
      /**
       * 모달 취소 버튼: secondary + modal_lg/sm → gray_787486 (#787486)
       * Figma: pretendard/lg-16px-medium, gray/gray_787486
       */
      {
        variant: 'secondary',
        legacySize: 'modal_lg',
        className: 'text-gray-500',
      },
      {
        variant: 'secondary',
        legacySize: 'modal_sm',
        className: 'text-gray-500',
      },
    ],
    defaultVariants: {
      variant: 'primary',
    },
  },
);

/** {@link buttonVariants}에서 추론된 variant/size prop 타입 */
export type ButtonVariantProps = VariantProps<typeof buttonVariants>;

type SemanticButtonSize = NonNullable<ButtonVariantProps['size']>;
type LegacyButtonSize = NonNullable<ButtonVariantProps['legacySize']>;
export type ButtonSize = SemanticButtonSize | LegacyButtonSize;

const semanticButtonSizes: ReadonlyArray<SemanticButtonSize> = [
  'sm',
  'md',
  'lg',
];

function isSemanticButtonSize(size: ButtonSize): size is SemanticButtonSize {
  return semanticButtonSizes.includes(size as SemanticButtonSize);
}

/** HTML button 속성과 cva variant 타입을 결합한 Button props */
export type ButtonProps = Omit<ButtonVariantProps, 'size' | 'legacySize'> &
  ComponentPropsWithoutRef<'button'> & {
    /**
     * 공통 semantic size (sm/md/lg) 또는 기존 size preset을 모두 허용합니다.
     * 기존 preset은 하위 호환을 위해 유지되며 점진적으로 legacySize로 이전합니다.
     */
    size?: ButtonSize;
    /** 기존 화면 단위 프리셋 크기 */
    legacySize?: LegacyButtonSize;
  };

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
  legacySize,
  className,
  children,
  ...props
}: ButtonProps) {
  const resolvedSemanticSize =
    size && isSemanticButtonSize(size) ? size : undefined;
  const resolvedLegacySize =
    legacySize ??
    (!size ? 'modal_lg' : isSemanticButtonSize(size) ? undefined : size);

  return (
    <button
      className={cn(
        buttonVariants({
          variant,
          size: resolvedSemanticSize,
          legacySize: resolvedLegacySize,
        }),
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
