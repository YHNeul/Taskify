/**
 * @file 로그인 페이지 ( /login )
 * @description 이메일과 비밀번호를 입력받아 유저 인증을 처리하는 화면입니다.
 * @note 로그인 성공 시 토큰을 저장하고 `/mydashboard`로 리다이렉트 합니다.
 */

'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import Input from '@/shared/components/common/Input/Input';
import Button from '@/shared/components/common/Button';
import AlertModal from '@/shared/components/modal/AlertModal';
import { useDashboardStore } from '@/shared/store/useDashboardStore';

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, '이메일을 입력해 주세요.')
    .email('이메일 형식으로 작성해 주세요.'),
  password: z
    .string()
    .min(1, '비밀번호를 입력해 주세요.')
    .min(8, '8자 이상 입력해 주세요.'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginPageContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setActiveDashboardId = useDashboardStore(
    (state) => state.setActiveDashboardId,
  );
  const searchParams = useSearchParams();
  const nextRaw = searchParams.get('next');
  const nextPath = nextRaw?.startsWith('/') ? nextRaw : '/mydashboard';

  const [showPassword, setShowPassword] = useState(false);

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const isButtonDisabled = !isValid || isSubmitting;

  const handleLogin = async ({ email, password }: LoginFormValues) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const rawText = await res.text();

      let data: { message?: string } | null = null;

      try {
        data = rawText ? JSON.parse(rawText) : null;
      } catch {
        data = null;
      }

      if (!res.ok) {
        setAlertMessage(data?.message || '비밀번호가 일치하지 않습니다.');
        setIsAlertOpen(true);
        return;
      }

      // 계정 전환 직후 이전 사용자 캐시가 보이지 않도록 로그인 성공 시 세션 상태를 초기화한다.
      queryClient.clear();
      setActiveDashboardId(null);
      router.push(nextPath);
      router.refresh();
    } catch {
      setAlertMessage('서버 오류가 발생했습니다.');
      setIsAlertOpen(true);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 px-4 sm:px-6">
      <div className="mx-auto flex min-h-screen w-full items-center justify-center py-10">
        <div className="flex w-full max-w-auth-form flex-col items-center gap-6">
          <Link href="/">
            <div className="flex cursor-pointer flex-col items-center gap-3">
              <Image
                src="/logo-taskify-icon-main.svg"
                alt="Taskify icon"
                width={200}
                height={190}
                className="h-auto w-auto"
              />
              <Image
                src="/logo-taskify-text-main.svg"
                alt="Taskify"
                width={198}
                height={55}
                className="h-auto w-auto"
              />
              <p className="text-lg-medium text-gray-900">
                오늘도 만나서 반가워요!
              </p>
            </div>
          </Link>

          <form
            onSubmit={handleSubmit(handleLogin)}
            noValidate
            className="w-full flex flex-col gap-4"
          >
            <Input
              label="이메일"
              type="text"
              placeholder="이메일을 입력해 주세요"
              {...register('email')}
              isError={!!errors.email}
              errorMessage={errors.email?.message}
            />

            <Input
              label="비밀번호"
              type={showPassword ? 'text' : 'password'}
              placeholder="비밀번호를 입력해 주세요"
              {...register('password')}
              isError={!!errors.password}
              errorMessage={errors.password?.message}
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

          <p className="w-full text-center text-base leading-19 text-gray-700">
            회원이 아니신가요?{' '}
            <Link
              href={
                nextRaw
                  ? `/signup?next=${encodeURIComponent(nextRaw)}`
                  : '/signup'
              }
              className="text-brand-violet underline"
            >
              회원가입하기
            </Link>
          </p>
        </div>
      </div>

      {isAlertOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <AlertModal
            message={alertMessage}
            onConfirm={() => setIsAlertOpen(false)}
          />
        </div>
      )}
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-gray-100" />}>
      <LoginPageContent />
    </Suspense>
  );
}
