'use client';

import Button from '@/components/common/Button';
import Pagination from '@/components/common/Pagination';
import { ConfirmModal } from '@/components/modal';
import { Member } from '@/types/dashboard';
import Image from 'next/image';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { deleteMember, getMembers } from '@/api/dashboard';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { getMe } from '@/api/auth';
import ModalOverlay from '@/components/common/ModalBase/ModalOverlay';
import { usePaginationSync } from '@/hooks/usePaginationSync';

const ITEM_PER_PAGE = 4;

interface MembersTableProps {
  dashboardId: string;
}

export default function ManageMembers({ dashboardId }: MembersTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [isImageError, setIsImageError] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const dashboardMembers = useQuery({
    queryKey: ['dashboardMembers', dashboardId, currentPage],
    queryFn: () => getMembers(Number(dashboardId), currentPage, ITEM_PER_PAGE),
    enabled: !!dashboardId,
  });

  const deleteMutation = useMutation({
    mutationFn: (memberId: number) => deleteMember(memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardMembers'] });
    },
    onError: () => {
      alert('멤버 삭제에 실패했습니다.');
    },
  });

  const { data: me } = useQuery({
    queryKey: QUERY_KEYS.me(),
    queryFn: getMe,
  });

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
    <div className="pt-[22px] md:pt-[26px]">
      <div className="flex items-center justify-between">
        <span className="pl-[16px] text-xl-bold text-gray-700 md:pl-[28px] md:text-2xl-bold">
          구성원
        </span>
        <div className="pr-[16px] flex justify-end items-center gap-[16px] md:pr-[28px]">
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
      <table className="mt-[18px] w-full table-fixed text-lg-regular text-gray-500 md:mt-[27px]">
        <thead className="text-lg-regular text-gray-400">
          <tr>
            <th className="w-[70%] pl-[16px] font-normal text-left md:pl-[28px]">
              이름
            </th>
            <th className="w-[30%]"></th>
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
                  className="flex items-center gap-[8px] pl-[16px] py-[12px] 
                  font-normal text-left text-md-regular text-gray-700 
                  md:pl-[28px] md:py-[16px] md:gap-[12px] md:text-lg-regular"
                >
                  <div className="flex-shrink-0 relative w-[34px] h-[34px] md:w-[38px] md:h-[38px] rounded-full overflow-hidden">
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
                <td className="pr-[16px] text-right md:pr-[28px]">
                  {!isMe && (
                    <Button
                      variant="secondary"
                      size="delete_lg"
                      className="px-[14px] py-[7px] w-[52px] h-[32px] text-xs-medium
                              md:px-[20px] md:py-[4px] md:w-[84px] md:h-[32px] md:text-md-medium"
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
