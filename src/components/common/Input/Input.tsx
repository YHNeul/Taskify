'use client';

/**
 * @file Input.tsx
 * @description 프로젝트 전반에서 사용되는 공통 텍스트 입력 폼 컴포넌트입니다.
 * 텍스트 입력, 라벨 표시, 에러 상태(빨간 테두리 및 메시지) 처리를 지원합니다.
 * 아이콘이 필요한 상세 입력(Input-2) 형태도 함께 지원합니다.
 * @author 인영
 *
 * @example
 * <Input label="이메일" errorMessage="이메일 형식으로 작성해 주세요." />
 *
 * @example
 * <Input
 *   label="마감일"
 *   placeholder="날짜를 입력해 주세요"
 *   rightIcon={<CalendarIcon />}
 * />
 */

import { InputHTMLAttributes, ReactNode, useId } from 'react';
import clsx from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  isError?: boolean;
  errorMessage?: string;
  rightIcon?: ReactNode;
  required?: boolean;
}

export default function Input({
  label,
  isError = false,
  errorMessage,
  className,
  id,
  rightIcon,
  required = false,
  ...props
}: InputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const hasError = isError || !!errorMessage;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-2 block text-2lg-medium text-gray-700"
        >
          {label}
          {required && <span className="text-brand-violet pl-[2px]">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          {...props}
          className={clsx(
            'w-full h-[48px] px-4 py-[11px] text-lg-regular rounded-md border outline-none transition',
            'placeholder:text-gray-400',
            'bg-white',
            'text-gray-800',
            rightIcon && 'pr-10',
            hasError
              ? 'border-red focus:border-red'
              : 'border-gray-300 focus:border-brand-violet',
            className,
          )}
          aria-invalid={hasError}
          aria-describedby={errorMessage ? `${inputId}-error` : undefined}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {rightIcon}
          </div>
        )}
      </div>
      {errorMessage && (
        <p id={`${inputId}-error`} className="mt-1 text-xs text-red">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
