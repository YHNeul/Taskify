'use client';

import { deleteInvitation, inviteMember } from '@/shared/apis/dashboard';
import Button from '@/shared/components/common/Button';
import AddBoxIcon from '@/shared/components/common/Icon/AddBoxIcon';
import ModalOverlay from '@/shared/components/common/ModalBase/ModalOverlay';
import Pagination from '@/shared/components/common/Pagination';
import FormModal from '@/shared/components/modal/FormModal';
import { ConfirmModal } from '@/shared/components/modal';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import { useDashboardInvitationsQuery } from '@/shared/hooks/useDashboardInvitationsQuery';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import axios from 'axios';
import {
  useQueryParamState,
  parsePositiveIntParam,
} from '@/shared/hooks/useQueryParamState';
import { QUERY_PARAM_KEYS } from '@/shared/constants/queryParams';

const EMAIL_PER_PAGE = 5;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface EmailTableProps {
  dashboardId: number;
}

export default function ManageInvitations({ dashboardId }: EmailTableProps) {
  const [currentPage, setCurrentPage] = useQueryParamState<number>({
    key: QUERY_PARAM_KEYS.INVITE_PAGE,
    defaultValue: 1,
    parse: (rawValue) => parsePositiveIntParam(rawValue, 1),
    serialize: (value) => (value > 1 ? String(value) : null),
  });
  const [selectedInviterEmail, setSelectedInviterEmail] = useState<
    number | null
  >(null);

  // 초대하기 모달용 state
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [errorText, setErrorText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useDashboardInvitationsQuery({
    dashboardId,
    page: currentPage,
    size: EMAIL_PER_PAGE,
  });

  const deleteMutation = useMutation({
    mutationFn: (invitationId: number) =>
      deleteInvitation(dashboardId, invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.invitationsBase(dashboardId),
      });
      setSelectedInviterEmail(null);
    },
    onError: () => {
      alert('초대 취소에 실패했습니다. 다시 시도해 주세요.');
    },
  });

  // 초대하기 API 호출 함수
  const inviteMutation = useMutation({
    mutationFn: (inviteeEmail: string) =>
      inviteMember(dashboardId, inviteeEmail),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.invitationsBase(dashboardId),
      });
      setCurrentPage(1);
      closeInviteModal();
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message;

        if (message === '이미 대시보드에 초대된 멤버입니다.') {
          setErrorText('이미 대시보드에 초대된 멤버입니다.');
          return;
        }

        if (message === '이메일 형식이 올바르지 않습니다') {
          setErrorText('이메일 형식으로 작성해 주세요.');
          return;
        }

        if (message === '대시보드 초대 권한이 없습니다.') {
          setErrorText('초대 권한이 없습니다.');
          return;
        }

        if (message === '대시보드가 존재하지 않습니다.') {
          setErrorText('대시보드를 찾을 수 없습니다.');
          return;
        }
      }

      setErrorText('초대에 실패했습니다. 다시 시도해 주세요.');
    },
  });

  const invitations = data?.invitations ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / EMAIL_PER_PAGE) || 1;

  if (isLoading) return <div>초대 내역 로딩 중...</div>;
  if (isError) return <div>데이터를 불러오는 중 에러가 발생했습니다.</div>;

  const resetInviteModal = () => {
    setEmail('');
    setErrorText('');
    setIsSubmitting(false);
  };

  const closeInviteModal = () => {
    resetInviteModal();
    setIsInviteModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (selectedInviterEmail) {
      deleteMutation.mutate(selectedInviterEmail);
    }
  };

  // 이메일 입력값을 state에 저장하고 유효성 검사를 수행하는 함수
  const handleEmailChange = (value: string) => {
    setEmail(value);

    if (!value.trim()) {
      setErrorText('');
      return;
    }

    if (!emailRegex.test(value.trim())) {
      setErrorText('이메일 형식으로 작성해 주세요.');
      return;
    }

    setErrorText('');
  };

  // 초대하기 버튼 클릭 시 실제 초대 로직을 실행하는 함수
  const handleInviteConfirm = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) return;

    if (!emailRegex.test(trimmedEmail)) {
      setErrorText('이메일 형식으로 작성해 주세요.');
      return;
    }
    const isAlreadyInvited = invitations.some(
      (item) => item.invitee.email === trimmedEmail,
    );
    if (isAlreadyInvited) {
      setErrorText('이미 초대 목록에 있는 이메일입니다.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorText('');

      await inviteMutation.mutateAsync(trimmedEmail);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 초대하기 버튼 활성화 여부 결정
  const isInviteButtonDisabled = !email.trim() || !!errorText || isSubmitting;

  return (
    <div className="relative pt-space-22 md:pt-space-26">
      <div className="flex items-center justify-between">
        <span className="pl-4 text-xl-bold text-gray-700 md:pl-7 md:text-2xl-bold">
          초대 내역
        </span>

        <div className="pr-4 flex items-center gap-3 md:pr-7 md:gap-4">
          <span className="text-xs-regular text-gray-500 md:text-md-regular">
            {currentPage} / {totalPages}
          </span>

          <Pagination
            size="sm"
            currentPage={currentPage}
            totalPages={totalPages}
            onPrev={() => setCurrentPage((p) => Math.max(1, p - 1))}
            onNext={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          />

          <Button
            variant="primary"
            onClick={() => setIsInviteModalOpen(true)}
            className="absolute right-4 top-invite-button-top
            px-0 w-invite-button-mobile h-invite-button-mobile justify-center text-white text-xs-medium gap-1.5
            md:static md:w-invite-button-desktop md:h-8 md:text-md-medium md:gap-2"
          >
            <AddBoxIcon className="w-3.5 h-3.5 md:w-4 md:h-4 brightness-0 invert" />
            초대하기
          </Button>
        </div>
      </div>

      <table className="table-fixed mt-5 w-full text-lg-regular text-gray-500 md:mt-7">
        <thead>
          <tr className="text-left text-gray-400 text-md-regular md:text-lg-regular">
            <th className="w-3/5 pl-5 pb-6 font-normal md:pl-7 md:pb-px md:w-2/3">
              이메일
            </th>
            <th className="w-2/5 pr-5 pb-6 md:pr-7 md:pb-px md:w-1/3"></th>
          </tr>
        </thead>
        <tbody>
          {invitations.map((item, index) => {
            const overallIndex = (currentPage - 1) * EMAIL_PER_PAGE + index + 1;
            const isPageEnd = overallIndex % EMAIL_PER_PAGE === 0;

            return (
              <tr
                key={item.id}
                className={`border-gray-200 border-b ${isPageEnd ? 'border-b-0' : ''}`}
              >
                <td className="pl-5 py-4 md:pl-7 md:py-6">
                  <div className="truncate">{item.invitee.email}</div>
                </td>

                <td className="pl-5 pr-5 text-right md:pr-7">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="px-3.5 py-2 w-action-button-mobile h-8 text-xs-medium
                            md:px-5 md:py-1 md:w-action-button-desktop md:h-8 md:text-md-medium"
                    onClick={() => setSelectedInviterEmail(item.id)}
                  >
                    취소
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {selectedInviterEmail !== null && (
        <ModalOverlay onClose={() => setSelectedInviterEmail(null)}>
          <ConfirmModal
            message="정말 초대를 취소하시겠습니까?"
            cancelText="아니요"
            confirmText="네"
            onConfirm={handleDeleteConfirm}
            onCancel={() => setSelectedInviterEmail(null)}
          />
        </ModalOverlay>
      )}

      {isInviteModalOpen && (
        <ModalOverlay onClose={closeInviteModal}>
          <FormModal
            title="멤버 초대"
            label="이메일"
            value={email}
            placeholder="이메일을 입력해 주세요"
            cancelText="취소"
            confirmText="초대"
            errorText={errorText}
            showCloseButton
            disabled={isInviteButtonDisabled}
            onChange={handleEmailChange}
            onCancel={closeInviteModal}
            onClose={closeInviteModal}
            onConfirm={handleInviteConfirm}
          />
        </ModalOverlay>
      )}
    </div>
  );
}
