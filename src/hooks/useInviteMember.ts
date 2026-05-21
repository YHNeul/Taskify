/**
 * @file useInviteMember.ts
 * @description 대시보드 멤버 초대 모달의 상태와 API 호출을 관리하는 커스텀 훅
 *
 * ### 담당 역할
 * - 초대 모달 열림/닫힘 상태 관리
 * - 이메일 입력 실시간 유효성 검사
 * - 서버 에러 메시지를 사용자 친화적 문구로 변환
 * - 초대 성공 시 `invitations` 쿼리 자동 무효화
 *
 * @notes
 * - `effectiveDashboardId`가 `null`인 경우 초대 API를 호출하지 않음
 * - 서버 에러 응답 문구는 `SERVER_ERROR_MAP`으로 관리
 */

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { inviteMember } from '@/api/dashboard';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** 서버 에러 응답 문구 → 사용자 노출 문구 매핑 */
const SERVER_ERROR_MAP: Record<string, string> = {
  '이미 대시보드에 초대된 멤버입니다.': '이미 대시보드에 초대된 멤버입니다.',
  '이메일 형식이 올바르지 않습니다': '이메일 형식으로 작성해 주세요.',
  '대시보드 초대 권한이 없습니다.': '초대 권한이 없습니다.',
  '대시보드가 존재하지 않습니다.': '대시보드를 찾을 수 없습니다.',
};

/**
 * 멤버 초대 모달 훅
 *
 * @param effectiveDashboardId - 초대 대상 대시보드 ID. `null`이면 API 호출 불가.
 * @returns
 * - `isOpen` — 모달 열림 여부
 * - `open` / `close` — 모달 열기/닫기
 * - `email` — 현재 입력된 이메일 값
 * - `error` — 유효성 검사 또는 API 에러 메시지
 * - `isSubmitting` — API 요청 진행 중 여부
 * - `isDisabled` — 초대 버튼 비활성화 여부
 * - `handleEmailChange` — 이메일 입력 핸들러 (실시간 유효성 검사 포함)
 * - `handleConfirm` — 초대 버튼 클릭 핸들러
 */
export function useInviteMember(effectiveDashboardId: number | null) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mutation = useMutation({
    mutationFn: (emailValue: string) =>
      inviteMember(effectiveDashboardId!, emailValue),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['invitations', effectiveDashboardId],
      });
      close();
    },
    onError: (err) => {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message as string | undefined;
        if (message && SERVER_ERROR_MAP[message]) {
          setError(SERVER_ERROR_MAP[message]);
          return;
        }
      }
      setError('초대에 실패했습니다. 다시 시도해 주세요.');
    },
  });

  /** 모달을 닫고 모든 입력 상태를 초기화 */
  const close = () => {
    setIsOpen(false);
    setEmail('');
    setError('');
    setIsSubmitting(false);
  };

  /**
   * 이메일 입력 변경 핸들러.
   * 입력 즉시 이메일 형식 유효성을 검사하고 에러 메시지를 업데이트
   *
   * @param value - 새로 입력된 이메일 문자열
   */
  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (!value.trim()) {
      setError('');
      return;
    }
    setError(
      EMAIL_REGEX.test(value.trim()) ? '' : '이메일 형식으로 작성해 주세요.',
    );
  };

  /**
   * 초대 확인 버튼 핸들러.
   * 유효성 검사 통과 후 초대 API를 호출
   */
  const handleConfirm = async () => {
    const trimmed = email.trim();
    if (!trimmed) return;
    if (!EMAIL_REGEX.test(trimmed)) {
      setError('이메일 형식으로 작성해 주세요.');
      return;
    }
    try {
      setIsSubmitting(true);
      setError('');
      await mutation.mutateAsync(trimmed);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isOpen,
    open: () => setIsOpen(true),
    close,
    email,
    error,
    isSubmitting,
    /** 이메일이 비어있거나, 에러가 있거나, 요청 중이면 `true` */
    isDisabled: !email.trim() || !!error || isSubmitting,
    handleEmailChange,
    handleConfirm,
  };
}
