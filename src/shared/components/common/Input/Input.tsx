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

import {
  ChangeEvent,
  FocusEvent,
  InputHTMLAttributes,
  ReactNode,
  useId,
  useState,
} from 'react';
import clsx from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  isError?: boolean;
  errorMessage?: string;
  rightIcon?: ReactNode;
  required?: boolean;
  floatingLabel?: boolean;
  showErrorStyle?: boolean;
}

export default function Input({
  label,
  isError = false,
  errorMessage,
  className,
  id,
  rightIcon,
  required = false,
  floatingLabel = false,
  showErrorStyle = true,
  value,
  defaultValue,
  onFocus,
  onBlur,
  onChange,
  ...props
}: InputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const hasError = isError || !!errorMessage;
  const shouldShowErrorStyle = hasError && showErrorStyle;
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(
    String(defaultValue ?? ''),
  );
  const [isFocused, setIsFocused] = useState(false);
  const currentValue = isControlled ? String(value ?? '') : internalValue;
  const shouldFloatLabel = isFocused || currentValue.length > 0;

  const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(event);
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    onBlur?.(event);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) {
      setInternalValue(event.target.value);
    }
    onChange?.(event);
  };

  return (
    <div className="w-full">
      {label && !floatingLabel && (
        <label
          htmlFor={inputId}
          className="mb-2 block text-2lg-medium text-gray-700"
        >
          {label}
          {required && <span className="text-brand-violet pl-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          {...props}
          value={value}
          defaultValue={defaultValue}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          placeholder={floatingLabel ? ' ' : props.placeholder}
          className={clsx(
            'w-full rounded-md border outline-none transition',
            floatingLabel ? 'h-13' : 'h-12',
            floatingLabel
              ? 'px-4 pb-2 pt-6 text-lg-regular placeholder:text-transparent'
              : 'px-4 py-2.5 text-lg-regular placeholder:text-gray-400',
            'bg-white',
            'text-gray-800',
            rightIcon && 'pr-10',
            shouldShowErrorStyle
              ? 'border-red focus:border-red'
              : 'border-gray-300 focus:border-brand-violet',
            className,
          )}
          aria-invalid={hasError}
          aria-describedby={errorMessage ? `${inputId}-error` : undefined}
        />
        {label && floatingLabel && (
          <label
            htmlFor={inputId}
            className={clsx(
              'pointer-events-none absolute left-4 origin-left bg-white px-1 text-gray-400 transition-all duration-200',
              shouldFloatLabel
                ? 'top-0.5 translate-y-0 scale-[0.68]'
                : 'top-1/2 -translate-y-1/2 scale-100',
              shouldShowErrorStyle && 'text-red',
            )}
          >
            {label}
            {required && <span className="text-brand-violet pl-0.5">*</span>}
          </label>
        )}
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
