'use client';

import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { API_BASE_URL } from '@/shared/constants/api';

type SignupErrors = {
  email: string;
  nickname: string;
  password: string;
  passwordConfirm: string;
  agree: string;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function useSignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextRaw = searchParams.get('next');
  const loginHref = nextRaw
    ? `/login?next=${encodeURIComponent(nextRaw)}`
    : '/login';

  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [agree, setAgree] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const [signupError, setSignupError] = useState('');
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errors, setErrors] = useState<SignupErrors>({
    email: '',
    nickname: '',
    password: '',
    passwordConfirm: '',
    agree: '',
  });

  const clearTransientErrorState = () => {
    if (signupError) setSignupError('');
    if (isAlertOpen) setIsAlertOpen(false);
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    clearTransientErrorState();

    setErrors((prev) => ({
      ...prev,
      email: !value
        ? ''
        : !emailRegex.test(value)
          ? '이메일 형식으로 작성해 주세요.'
          : '',
    }));
  };

  const handleNicknameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNickname(value);
    clearTransientErrorState();

    setErrors((prev) => ({
      ...prev,
      nickname: !value
        ? ''
        : value.length > 10
          ? '열 자 이하로 작성해주세요.'
          : '',
    }));
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    clearTransientErrorState();

    setErrors((prev) => ({
      ...prev,
      password: !value ? '' : value.length < 8 ? '8자 이상 입력해 주세요.' : '',
      passwordConfirm:
        passwordConfirm && value !== passwordConfirm
          ? '비밀번호가 일치하지 않습니다.'
          : '',
    }));
  };

  const handlePasswordConfirmChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPasswordConfirm(value);
    clearTransientErrorState();

    setErrors((prev) => ({
      ...prev,
      passwordConfirm: !value
        ? ''
        : value !== password
          ? '비밀번호가 일치하지 않습니다.'
          : '',
    }));
  };

  const handleAgreeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setAgree(checked);
    clearTransientErrorState();

    setErrors((prev) => ({
      ...prev,
      agree: checked ? '' : prev.agree,
    }));
  };

  const validate = () => {
    const nextErrors: SignupErrors = {
      email: '',
      nickname: '',
      password: '',
      passwordConfirm: '',
      agree: '',
    };

    if (!email.trim()) {
      nextErrors.email = '이메일을 입력해 주세요.';
    } else if (!emailRegex.test(email)) {
      nextErrors.email = '이메일 형식으로 작성해 주세요.';
    }

    if (!nickname.trim()) {
      nextErrors.nickname = '닉네임을 입력해 주세요.';
    } else if (nickname.length > 10) {
      nextErrors.nickname = '열 자 이하로 작성해주세요.';
    }

    if (!password) {
      nextErrors.password = '비밀번호를 입력해 주세요.';
    } else if (password.length < 8) {
      nextErrors.password = '8자 이상 입력해 주세요.';
    }

    if (!passwordConfirm) {
      nextErrors.passwordConfirm = '비밀번호를 한 번 더 입력해 주세요.';
    } else if (password !== passwordConfirm) {
      nextErrors.passwordConfirm = '비밀번호가 일치하지 않습니다.';
    }

    if (!agree) {
      nextErrors.agree = '이용약관에 동의해 주세요.';
    }

    setErrors(nextErrors);
    return !Object.values(nextErrors).some(Boolean);
  };

  const isButtonDisabled =
    !email.trim() ||
    !nickname.trim() ||
    !password.trim() ||
    !passwordConfirm.trim() ||
    !agree ||
    Object.values(errors).some((error) => error !== '') ||
    isSubmitting;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validate() || isSubmitting) return;

    setSignupError('');
    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          nickname,
          password,
        }),
      });

      const rawText = await res.text();

      let data: { message?: string } | null = null;
      try {
        data = rawText ? JSON.parse(rawText) : null;
      } catch {
        data = null;
      }

      if (!res.ok) {
        setIsSuccess(false);
        setAlertMessage(data?.message || rawText || '회원가입에 실패했습니다.');
        setIsAlertOpen(true);
        return;
      }

      setAlertMessage('가입이 완료되었습니다.');
      setIsSuccess(true);
      setIsAlertOpen(true);
    } catch {
      setIsSuccess(false);
      setAlertMessage('서버 오류가 발생했습니다.');
      setIsAlertOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAlertConfirm = () => {
    setIsAlertOpen(false);
    if (isSuccess) {
      router.push(loginHref);
    }
  };

  return {
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
    handleEmailChange,
    handleNicknameChange,
    handlePasswordChange,
    handlePasswordConfirmChange,
    handleAgreeChange,
    setShowPassword,
    setShowPasswordConfirm,
    handleSubmit,
    handleAlertConfirm,
  };
}
