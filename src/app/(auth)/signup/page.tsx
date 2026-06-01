/**
 * @file 회원가입 페이지 ( /signup )
 * @description 신규 유저의 정보(이메일, 이름, 비밀번호 등)를 입력받는 화면입니다.
 * @note 폼 제출 전, 각 인풋의 유효성 검사(정규식 등) 및 에러 메시지 처리가 핵심입니다.
 */

'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, EyeOff } from 'lucide-react';

import { Input } from '@/shared/components/common/Input';
import Button from '@/shared/components/common/Button';
import Checkbox from '@/shared/components/common/Checkbox';
import AlertModal from '@/shared/components/modal/AlertModal';
import { useSignupForm } from '@/shared/hooks/useSignupForm';

function SignupPageContent() {
  const {
    loginHref,
    email,
    nickname,
    password,
    passwordConfirm,
    agree,
    showPassword,
    showPasswordConfirm,
    errors,
    isButtonDisabled,
    isSubmitting,
    isAlertOpen,
    alertMessage,
    setEmail,
    setNickname,
    setPassword,
    setPasswordConfirm,
    setAgree,
    setShowPassword,
    setShowPasswordConfirm,
    setFocusedField,
    handleSubmit,
    handleAlertConfirm,
  } = useSignupForm();

  return (
    <main className="min-h-screen bg-gray-100 px-4 sm:px-6">
      <div className="mx-auto flex min-h-screen w-full items-center justify-center py-10">
        <div className="flex w-full max-w-auth-form flex-col items-center gap-6 sm:gap-space-30">
          <Link href="/">
            <div className="flex cursor-pointer flex-col items-center gap-2.5">
              <div className="flex flex-col items-center justify-center gap-5 sm:gap-space-30">
                <Image
                  src="/logo-taskify-icon-main.svg"
                  alt="Taskify icon"
                  width={200}
                  height={190}
                  className="h-auto w-logo-icon-mobile sm:w-logo-icon-desktop"
                  priority
                />
                <Image
                  src="/logo-taskify-text-main.svg"
                  alt="Taskify"
                  width={198}
                  height={55}
                  className="h-auto w-logo-text-mobile sm:w-logo-text-desktop"
                  priority
                />
              </div>

              <h1 className="text-center text-base text-gray-700 sm:text-xl-medium">
                첫 방문을 환영합니다!
              </h1>
            </div>
          </Link>

          <div className="flex w-full flex-col items-center gap-5 sm:gap-6">
            <form
              onSubmit={handleSubmit}
              noValidate
              className="flex w-full flex-col gap-5 sm:gap-6"
            >
              <div className="flex w-full flex-col gap-4">
                <Input
                  label="이메일"
                  type="text"
                  floatingLabel
                  showErrorStyle={false}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  isError={!!errors.email}
                  errorMessage={errors.email || undefined}
                  className="h-auth-input"
                />

                <Input
                  label="닉네임"
                  type="text"
                  floatingLabel
                  showErrorStyle={false}
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  onFocus={() => setFocusedField('nickname')}
                  onBlur={() => setFocusedField(null)}
                  isError={!!errors.nickname}
                  errorMessage={errors.nickname || undefined}
                  className="h-auth-input"
                />

                <Input
                  label="비밀번호"
                  type={showPassword ? 'text' : 'password'}
                  floatingLabel
                  showErrorStyle={false}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  isError={!!errors.password}
                  errorMessage={errors.password || undefined}
                  className="h-auth-input"
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="flex items-center justify-center text-gray-400 hover:text-gray-600"
                      aria-label={
                        showPassword ? '비밀번호 숨기기' : '비밀번호 보기'
                      }
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  }
                />

                <Input
                  label="비밀번호 확인"
                  type={showPasswordConfirm ? 'text' : 'password'}
                  floatingLabel
                  showErrorStyle={false}
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  onFocus={() => setFocusedField('passwordConfirm')}
                  onBlur={() => setFocusedField(null)}
                  isError={!!errors.passwordConfirm}
                  errorMessage={errors.passwordConfirm || undefined}
                  className="h-auth-input"
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPasswordConfirm((prev) => !prev)}
                      className="flex items-center justify-center text-gray-400 hover:text-gray-600"
                      aria-label={
                        showPasswordConfirm
                          ? '비밀번호 확인 숨기기'
                          : '비밀번호 확인 보기'
                      }
                    >
                      {showPasswordConfirm ? <EyeOff /> : <Eye />}
                    </button>
                  }
                />
              </div>

              <div>
                <Checkbox
                  label="이용약관에 동의합니다."
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                />
                {errors.agree && (
                  <p className="mt-1 text-xs text-red">{errors.agree}</p>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isButtonDisabled}
                className="h-auth-input w-full"
              >
                {isSubmitting ? '가입 중...' : '가입하기'}
              </Button>
            </form>

            <p className="w-full text-center text-base leading-19 text-gray-700">
              이미 회원이신가요?{' '}
              <Link href={loginHref} className="text-brand-violet underline">
                로그인하기
              </Link>
            </p>
          </div>
        </div>
      </div>

      {isAlertOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <AlertModal message={alertMessage} onConfirm={handleAlertConfirm} />
        </div>
      )}
    </main>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-gray-100" />}>
      <SignupPageContent />
    </Suspense>
  );
}
