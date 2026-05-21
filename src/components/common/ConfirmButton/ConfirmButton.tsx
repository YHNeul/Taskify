/**
 * @file ConfirmButton.tsx
 * @description 수락/거절 버튼 쌍 컴포넌트입니다.
 *
 * Figma의 `button` 컴포넌트(Property 2 = confirm)를 구현합니다.
 * 수락(primary)과 거절(secondary) 버튼이 `gap: 10px`으로 묶인 하나의 유닛입니다.
 *
 * ### 반응형 크기
 * | 브레이크포인트 | 전체 크기 | 개별 버튼 |
 * |---|---|---|
 * | mobile (기본) | 228×32 | 109×32 |
 * | tablet (md, 768px+) | 154×30 | 72×30 |
 * | desktop (lg, 1024px+) | 178×32 | 84×32 |
 *
 * @author 하늘
 *
 * @example
 * <ConfirmButton
 *   onAccept={() => handleAccept(invitationId)}
 *   onReject={() => handleReject(invitationId)}
 * />
 *
 * @example
 * // 거절 버튼만 로딩 중 비활성화
 * <ConfirmButton
 *   onAccept={handleAccept}
 *   onReject={handleReject}
 *   rejectDisabled={isLoading}
 * />
 */

import { cn } from '@/lib/utils';

/** ConfirmButton 컴포넌트의 props 타입 */
export interface ConfirmButtonProps {
  /** 수락 버튼 클릭 핸들러 */
  onAccept: () => void;

  /** 거절 버튼 클릭 핸들러 */
  onReject: () => void;

  /**
   * 거절 버튼 비활성화 여부
   * @default false
   */
  rejectDisabled?: boolean;

  /** 추가 클래스명 */
  className?: string;
}

/**
 * 수락/거절 버튼 쌍 컴포넌트입니다.
 * 두 버튼이 `gap: 10px`으로 묶인 하나의 유닛으로 반응형 크기도 적용됐습니다.
 *
 * @param props - {@link ConfirmButtonProps}
 */
export default function ConfirmButton({
  onAccept,
  onReject,
  rejectDisabled = false,
  className,
}: ConfirmButtonProps) {
  const btnBase =
    'inline-flex items-center justify-center rounded-[4px] text-md-medium transition-colors disabled:cursor-not-allowed';

  /** 개별 버튼 크기 — mobile: 109×32, tablet: 72×30, desktop: 84×32 */
  const btnSize =
    'w-[109px] h-[32px] md:w-[72px] md:h-[30px] lg:w-[84px] lg:h-[32px]';

  return (
    <div className={cn('inline-flex items-center gap-[10px]', className)}>
      {/* 수락 버튼 — 항상 primary(보라색) */}
      <button
        type="button"
        onClick={onAccept}
        className={cn(
          btnBase,
          btnSize,
          'bg-brand-violet text-white hover:bg-[#4a2dc0]',
        )}
      >
        수락
      </button>

      {/* 거절 버튼 — secondary */}
      <button
        type="button"
        onClick={onReject}
        disabled={rejectDisabled}
        className={cn(
          btnBase,
          btnSize,
          'border border-gray-300 bg-white text-brand-violet hover:bg-brand-violet-light disabled:text-gray-400',
        )}
      >
        거절
      </button>
    </div>
  );
}
