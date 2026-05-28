'use client';

import Button from '@/shared/components/common/Button';
import Pagination from '@/shared/components/common/Pagination';
import { ConfirmModal } from '@/shared/components/modal';
import { Member } from '@/shared/types/dashboard';
import Image from 'next/image';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { deleteMember } from '@/shared/apis/dashboard';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import ModalOverlay from '@/shared/components/common/ModalBase/ModalOverlay';
import { usePaginationSync } from '@/shared/hooks/usePaginationSync';
import { useDashboardMembersQuery } from '@/shared/hooks/useDashboardMembersQuery';
import { useMeQuery } from '@/shared/hooks/useMeQuery';
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
  const queryClient = useQueryClient();

  const dashboardMembers = useDashboardMembersQuery({
    dashboardId: Number(dashboardId),
    page: currentPage,
    size: ITEM_PER_PAGE,
  });

  const deleteMutation = useMutation({
    mutationFn: (memberId: number) => deleteMember(memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.members(Number(dashboardId)),
      });
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
            {totalPages} 페이지 중 {currentPage}
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
      <table className="mt-5 w-full table-fixed text-lg-regular text-gray-500 md:mt-7">
        <thead className="text-lg-regular text-gray-400">
          <tr>
            <th className="w-2/3 pl-4 font-normal text-left md:pl-7">
              이름
            </th>
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
                  className="flex items-center gap-2 pl-4 py-3 
                  font-normal text-left text-md-regular text-gray-700 
                  md:pl-7 md:py-4 md:gap-3 md:text-lg-regular"
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
                <td className="pr-4 text-right md:pr-7">
                  {!isMe && (
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

      {selectedMemberId !== null && (
        <ModalOverlay onClose={() => setSelectedMemberId(null)}>
          <ConfirmModal
            message="정말 삭제하시겠습니까?"
            cancelText="아니요"
            confirmText="네"
            onConfirm={handleDeleteConfirm}
            onCancel={() => setSelectedMemberId(null)}
          />
        </ModalOverlay>
      )}
    </div>
  );
}
