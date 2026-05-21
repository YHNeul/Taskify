'use client';

/**
 * @file Checkbox.tsx
 * @description 커스텀 디자인이 적용된 공통 체크박스 컴포넌트입니다.
 * Tailwind의 peer 클래스를 활용하여 기본 체크박스를 숨기고 커스텀 UI를 렌더링합니다.
 * @author 인영
 *
 * @example
 * <Checkbox label="이용약관에 동의합니다." />
 *
 * @example
 * <Checkbox ariaLabel="이용약관 동의" />
 */

import React, { useId } from 'react';
import clsx from 'clsx';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  ariaLabel?: string;
}

export default function Checkbox({
  label,
  ariaLabel,
  className,
  id,
  disabled,
  ...props
}: CheckboxProps) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <label
      htmlFor={inputId}
      className={clsx(
        'flex items-center gap-2 cursor-pointer select-none',
        disabled && 'cursor-not-allowed opacity-50',
      )}
    >
      <input
        id={inputId}
        type="checkbox"
        disabled={disabled}
        aria-label={!label ? ariaLabel : undefined}
        className="peer sr-only"
        {...props}
      />
      <div
        className={clsx(
          'h-4 w-4 rounded border-2 border-gray-300 bg-white transition',
          'peer-checked:border-brand-violet peer-checked:bg-brand-violet',
          'peer-focus-visible:ring-2 peer-focus-visible:ring-brand-violet peer-focus-visible:ring-offset-1',
          'flex items-center justify-center',
          className,
        )}
      >
        <svg
          className="h-2.5 w-2.5 text-white"
          viewBox="0 0 10 8"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1 4L3.5 6.5L9 1"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      {label && <span className="text-sm text-gray-700">{label}</span>}
    </label>
  );
}
