/**
 * @file 로그인 페이지 ( /login )
 * @description 이메일과 비밀번호를 입력받아 유저 인증을 처리하는 화면입니다.
 * @note 로그인 성공 시 토큰을 저장하고 `/mydashboard`로 리다이렉트 합니다.
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Eye, EyeOff } from 'lucide-react';
import Input from '@/components/common/Input/Input';
import Button from '@/components/common/Button';
import AlertModal from '@/components/modal/AlertModal';
import { setToken } from '@/lib/auth';

// 팀 ID
const TEAM_ID = '22-2';

// BASE URL
const BASE_URL = 'https://sp-taskify-api.vercel.app';

// 이메일 정규식
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isEmailError, setIsEmailError] = useState(false);
  const [isPasswordError, setIsPasswordError] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const isButtonDisabled =
    !email.trim() ||
    !password.trim() ||
    isEmailError ||
    isPasswordError ||
    isSubmitting;

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);

    if (!value) {
      setIsEmailError(false);
      return;
    }

    setIsEmailError(!emailRegex.test(value));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);

    if (!value) {
      setIsPasswordError(false);
      return;
    }

    setIsPasswordError(value.length < 8);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let hasError = false;

    if (!emailRegex.test(email)) {
      setIsEmailError(true);
      hasError = true;
    }

    if (password.length < 8) {
      setIsPasswordError(true);
      hasError = true;
    }

    if (hasError || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const res = await fetch(`${BASE_URL}/${TEAM_ID}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const rawText = await res.text();

      let data: { accessToken?: string; message?: string } | null = null;

      try {
        data = rawText ? JSON.parse(rawText) : null;
      } catch {
        data = null;
      }

      if (!res.ok || !data?.accessToken) {
        setAlertMessage(data?.message || '비밀번호가 일치하지 않습니다.');
        setIsAlertOpen(true);
        return;
      }

      setToken(data.accessToken);
      router.push('/mydashboard');
    } catch {
      setAlertMessage('서버 오류가 발생했습니다.');
      setIsAlertOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 px-4 sm:px-6">
      <div className="mx-auto flex min-h-screen w-full items-center justify-center py-10">
        <div className="flex w-full max-w-[520px] flex-col items-center gap-6">
          <Link href="/">
            <div className="flex cursor-pointer flex-col items-center gap-3">
              <Image
                src="/logo-taskify-icon-main.svg"
                alt="Taskify icon"
                width={200}
                height={190}
              />
              <Image
                src="/logo-taskify-text-main.svg"
                alt="Taskify"
                width={198}
                height={55}
              />
              <p className="text-lg-medium text-gray-900">
                오늘도 만나서 반가워요!
              </p>
            </div>
          </Link>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="w-full flex flex-col gap-4"
          >
            <Input
              label="이메일"
              type="text"
              value={email}
              onChange={handleEmailChange}
              isError={isEmailError}
              errorMessage={
                isEmailError ? '이메일 형식으로 작성해 주세요.' : undefined
              }
            />

            <Input
              label="비밀번호"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={handlePasswordChange}
              isError={isPasswordError}
              errorMessage={
                isPasswordError ? '8자 이상 입력해 주세요.' : undefined
              }
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="flex h-full items-center justify-center px-2"
                  aria-label={
                    showPassword ? '비밀번호 숨기기' : '비밀번호 보기'
                  }
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              }
            />

            <Button
              type="submit"
              disabled={isButtonDisabled}
              className="mt-4 w-full"
            >
              {isSubmitting ? '로그인 중...' : '로그인'}
            </Button>
          </form>

          <p className="w-full text-center text-[16px] leading-[19px] text-gray-700">
            회원이 아니신가요?{' '}
            <Link href="/signup" className="text-brand-violet underline">
              회원가입하기
            </Link>
          </p>
        </div>
      </div>

      {isAlertOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <AlertModal
            message={alertMessage}
            onConfirm={() => setIsAlertOpen(false)}
          />
        </div>
      )}
    </main>
  );
}
