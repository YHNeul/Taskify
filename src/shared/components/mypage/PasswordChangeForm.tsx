import { Eye, EyeOff } from 'lucide-react';
import type { ChangeEvent, FocusEvent } from 'react';
import type { UseFormRegister, UseFormRegisterReturn } from 'react-hook-form';

import Button from '@/shared/components/common/Button';
import Input from '@/shared/components/common/Input/Input';
import type { PasswordFormValues } from '@/shared/hooks/useMyPageForm';

interface PasswordChangeFormProps {
  currentPasswordRegister: UseFormRegisterReturn<'currentPassword'>;
  registerPassword: UseFormRegister<PasswordFormValues>;
  onCurrentPasswordChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onCurrentPasswordBlur: (event: FocusEvent<HTMLInputElement>) => void;
  currentPasswordErrorMessage?: string;
  newPasswordErrorMessage?: string;
  confirmPasswordErrorMessage?: string;
  showCurrentPassword: boolean;
  showNewPassword: boolean;
  showConfirmPassword: boolean;
  toggleShowCurrentPassword: () => void;
  toggleShowNewPassword: () => void;
  toggleShowConfirmPassword: () => void;
  isPasswordFormValid: boolean;
  isPasswordSubmitting: boolean;
  onSubmit: () => void;
}

const renderPasswordToggleButton = (
  isVisible: boolean,
  onToggle: () => void,
) => (
  <button
    type="button"
    onClick={onToggle}
    aria-label="비밀번호 표시 전환"
    className="flex items-center justify-center h-full"
  >
    {isVisible ? <EyeOff size={20} /> : <Eye size={20} />}
  </button>
);

export default function PasswordChangeForm({
  currentPasswordRegister,
  registerPassword,
  onCurrentPasswordChange,
  onCurrentPasswordBlur,
  currentPasswordErrorMessage,
  newPasswordErrorMessage,
  confirmPasswordErrorMessage,
  showCurrentPassword,
  showNewPassword,
  showConfirmPassword,
  toggleShowCurrentPassword,
  toggleShowNewPassword,
  toggleShowConfirmPassword,
  isPasswordFormValid,
  isPasswordSubmitting,
  onSubmit,
}: PasswordChangeFormProps) {
  return (
    <section className="rounded-2xl bg-white px-4 py-5 md:p-6">
      <h2 className="mb-6 text-lg-bold leading-none text-gray-700">
        비밀번호 변경
      </h2>

      <div className="flex flex-col gap-4">
        <Input
          label="현재 비밀번호"
          labelClassName="text-md-medium"
          type={showCurrentPassword ? 'text' : 'password'}
          placeholder="비밀번호 입력"
          {...currentPasswordRegister}
          onChange={onCurrentPasswordChange}
          onBlur={onCurrentPasswordBlur}
          isError={!!currentPasswordErrorMessage}
          errorMessage={currentPasswordErrorMessage}
          className="text-md-regular md:text-lg-regular"
          rightIcon={renderPasswordToggleButton(
            showCurrentPassword,
            toggleShowCurrentPassword,
          )}
        />

        <Input
          label="새 비밀번호"
          labelClassName="text-md-medium"
          type={showNewPassword ? 'text' : 'password'}
          placeholder="새 비밀번호 입력"
          {...registerPassword('newPassword')}
          isError={!!newPasswordErrorMessage}
          errorMessage={newPasswordErrorMessage}
          className="text-md-regular md:text-lg-regular"
          rightIcon={renderPasswordToggleButton(
            showNewPassword,
            toggleShowNewPassword,
          )}
        />

        <div>
          <Input
            label="새 비밀번호 확인"
            labelClassName="text-md-medium"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="새 비밀번호 입력"
            {...registerPassword('confirmPassword')}
            isError={!!confirmPasswordErrorMessage}
            errorMessage={confirmPasswordErrorMessage}
            className="text-md-regular md:text-lg-regular"
            rightIcon={renderPasswordToggleButton(
              showConfirmPassword,
              toggleShowConfirmPassword,
            )}
          />
          <div className="mt-1 h-5" />
        </div>

        <Button
          size="lg"
          className="h-12 w-full"
          disabled={!isPasswordFormValid || isPasswordSubmitting}
          onClick={onSubmit}
        >
          변경
        </Button>
      </div>
    </section>
  );
}
