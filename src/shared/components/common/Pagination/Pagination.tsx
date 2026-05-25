/**
 * @file Pagination.tsx
 * @description `< >`  두 화살표가 하나의 유닛으로 묶인 페이지네이션 컴포넌트입니다.
 *
 * - `size="sm"` : 전체 72×36, 각 버튼 36×36
 * - `size="lg"` : 전체 80×40, 각 버튼 40×40
 * - 각 방향(`prev` / `next`)을 개별 disabled 처리 가능
 * @author 하늘
 *
 * @example
 * <Pagination
 *   size="sm"
 *   currentPage={page}
 *   totalPages={totalPages}
 *   onPrev={() => setPage(p => p - 1)}
 *   onNext={() => setPage(p => p + 1)}
 * />
 */

import { cn } from '@/lib/utils';

/** Pagination 컴포넌트의 props 타입 */
export interface PaginationProps {
  /**
   * 페이지네이션 크기
   * - `sm` : 72×36 (소형, 사이드메뉴 등)
   * - `lg` : 80×40 (대형)
   * @default 'sm'
   */
  size?: 'sm' | 'lg';

  /** 현재 페이지 번호 (1-indexed) */
  currentPage: number;

  /** 전체 페이지 수 */
  totalPages: number;

  /** 이전(`<`) 버튼 클릭 핸들러 */
  onPrev: () => void;

  /** 다음(`>`) 버튼 클릭 핸들러 */
  onNext: () => void;

  /** 추가 클래스명 */
  className?: string;
}

/** `<` 아이콘 */
function ChevronLeft({ disabled }: { disabled: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M10 12L6 8L10 4"
        stroke={disabled ? '#D9D9D9' : '#333236'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** `>` 아이콘 */
function ChevronRight({ disabled }: { disabled: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M6 4L10 8L6 12"
        stroke={disabled ? '#D9D9D9' : '#333236'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * 페이지네이션 컴포넌트입니다.
 * `< >`가 하나의 유닛으로 묶여 있으며, 가운데 구분선을 포함합니다.
 *
 * @param props - {@link PaginationProps}
 */
export default function Pagination({
  size = 'sm',
  currentPage,
  totalPages,
  onPrev,
  onNext,
  className,
}: PaginationProps) {
  const isPrevDisabled = currentPage <= 1;
  const isNextDisabled = currentPage >= totalPages;

  const containerSize =
    size === 'sm' ? 'w-[72px] h-[36px]' : 'w-[80px] h-[40px]';
  const btnSize = size === 'sm' ? 'w-[36px] h-[36px]' : 'w-[40px] h-[40px]';

  return (
    <div
      className={cn(
        'inline-flex items-center overflow-hidden rounded-[4px] border border-gray-300',
        containerSize,
        className,
      )}
    >
      {/* 이전 버튼 */}
      <button
        type="button"
        onClick={onPrev}
        disabled={isPrevDisabled}
        aria-label="이전 페이지"
        className={cn(
          'flex items-center justify-center transition-colors',
          'hover:bg-brand-violet-light disabled:cursor-not-allowed disabled:bg-white',
          btnSize,
        )}
      >
        <ChevronLeft disabled={isPrevDisabled} />
      </button>

      {/* 가운데 구분선 */}
      <div className="h-full w-px shrink-0 bg-gray-300" aria-hidden="true" />

      {/* 다음 버튼 */}
      <button
        type="button"
        onClick={onNext}
        disabled={isNextDisabled}
        aria-label="다음 페이지"
        className={cn(
          'flex items-center justify-center transition-colors',
          'hover:bg-brand-violet-light disabled:cursor-not-allowed disabled:bg-white',
          btnSize,
        )}
      >
        <ChevronRight disabled={isNextDisabled} />
      </button>
    </div>
  );
}
