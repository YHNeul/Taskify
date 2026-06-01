'use client';

import Button from '@/shared/components/common/Button';
import Pagination from '@/shared/components/common/Pagination';
import { ConfirmModal } from '@/shared/components/modal';
import { Member } from '@/shared/types/dashboard';
import Image from 'next/image';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { deleteMember } from '@/shared/apis/dashboard';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import ModalOverlay from '@/shared/components/common/ModalBase/ModalOverlay';
import { usePaginationSync } from '@/shared/hooks/usePaginationSync';
import { useDashboardMembersQuery } from '@/shared/hooks/useDashboardMembersQuery';
import { useMeQuery } from '@/shared/hooks/useMeQuery';
import { useDashboardQuery } from '@/shared/hooks/useDashboardQuery';
import {
  useQueryParamState,
  parsePositiveIntParam,
} from '@/shared/hooks/useQueryParamState';

const ITEM_PER_PAGE = 4;

interface MembersTableProps {
  dashboardId: string;
}

export default function ManageMembers({ dashboardId }: MembersTableProps) {
  const [currentPage, setCurrentPage] = useQueryParamState<number>({
    key: 'memberPage',
    defaultValue: 1,
    parse: (rawValue) => parsePositiveIntParam(rawValue, 1),
    serialize: (value) => (value > 1 ? String(value) : null),
  });
  const [isImageError, setIsImageError] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const dashboardIdNumber = Number(dashboardId);

  const dashboardMembers = useDashboardMembersQuery({
    dashboardId: dashboardIdNumber,
    page: currentPage,
    size: ITEM_PER_PAGE,
  });
  const { data: dashboard } = useDashboardQuery(dashboardIdNumber);
  const isDashboardOwner = dashboard?.createdByMe ?? false;

  const deleteMutation = useMutation({
    mutationFn: (memberId: number) => deleteMember(memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.members(dashboardIdNumber),
      });
      setToastMessage('구성원이 삭제되었습니다.');
    },
    onError: () => {
      alert('멤버 삭제에 실패했습니다.');
    },
  });

  const { data: me } = useMeQuery();

  const members: Member[] = dashboardMembers.data?.members ?? [];
  const totalCount = dashboardMembers.data?.totalCount ?? 0;
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalCount / ITEM_PER_PAGE)),
    [totalCount],
  );

  usePaginationSync(totalPages, setCurrentPage);

  useEffect(() => {
    if (!toastMessage) return;

    const timerId = window.setTimeout(() => {
      setToastMessage(null);
    }, 2500);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [toastMessage]);

  const handleDeleteConfirm = () => {
    if (selectedMemberId) {
      deleteMutation.mutate(selectedMemberId);
      setSelectedMemberId(null);
    }
  };

  return (
    <div className="pt-space-22 md:pt-space-26">
      <div className="flex items-center justify-between">
        <span className="pl-4 text-xl-bold text-gray-700 md:pl-7 md:text-2xl-bold">
          구성원
        </span>
        <div className="pr-4 flex justify-end items-center gap-4 md:pr-7">
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
        </div>
      </div>
      <div className="mt-5 px-4 md:mt-7 md:px-7">
        <table className="w-full table-fixed text-lg-regular text-gray-500">
          <thead className="text-lg-regular text-gray-400">
            <tr>
              <th className="w-2/3 font-normal text-left">이름</th>
              <th className="w-1/3"></th>
            </tr>
          </thead>

          <tbody>
            {members.map((item, index) => {
              const isLastRow = index === members.length - 1;
              const isMe = item.userId === me?.id;

              return (
                <tr
                  key={item.id}
                  className={`border-gray-200 border-b ${isLastRow ? 'border-b-0' : ''}`}
                >
                  <td
                    className="flex items-center gap-2 py-3 
                    font-normal text-left text-md-regular text-gray-700 
                    md:py-4 md:gap-3 md:text-lg-regular"
                  >
                    <div className="shrink-0 relative w-profile-mobile h-profile-mobile md:w-profile-desktop md:h-profile-desktop rounded-full overflow-hidden">
                      {item.profileImageUrl && !isImageError ? (
                        <Image
                          src={item.profileImageUrl}
                          alt={item.nickname}
                          fill
                          unoptimized
                          className="object-cover"
                          onError={() => setIsImageError(true)}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-green text-white">
                          {(item.nickname?.[0] ?? '?').toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span className="truncate min-w-0 flex-1">
                      {item.nickname}
                    </span>
                  </td>
                  <td className="text-right">
                    {isDashboardOwner && !isMe && (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="px-3.5 py-2 w-action-button-mobile h-8 text-xs-medium
                                md:px-5 md:py-1 md:w-action-button-desktop md:h-8 md:text-md-medium"
                        onClick={() => setSelectedMemberId(item.id)}
                      >
                        삭제
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedMemberId !== null && (
        <ModalOverlay onClose={() => setSelectedMemberId(null)}>
          <ConfirmModal
            message="해당 구성원을 삭제하시겠습니까?"
            cancelText="취소"
            confirmText="확인"
            onConfirm={handleDeleteConfirm}
            onCancel={() => setSelectedMemberId(null)}
          />
        </ModalOverlay>
      )}

      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-gray-700 px-4 py-3 text-sm-medium text-white shadow-lg md:bottom-auto md:top-6">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
