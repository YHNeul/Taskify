'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { deleteDashboard } from '@/api/dashboard';
import Button from '@/components/common/Button';
import { useState } from 'react';
import ModalOverlay from '@/components/common/ModalBase/ModalOverlay';
import { ConfirmModal } from '@/components/modal';

interface Props {
  dashboardId: string;
}

export default function DeleteDashboardButton({ dashboardId }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: () => deleteDashboard(Number(dashboardId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboards'] });
      setIsModalOpen(false);
      router.push('/mydashboard');
    },
    onError: () => {
      alert('삭제 권한이 없거나 오류가 발생했습니다.');
      setIsModalOpen(false);
    },
  });

  const handleDeleteConfirm = () => {
    mutate();
  };

  return (
    <>
      <Button
        variant="secondary"
        size="delete_dashboard"
        className="bg-gray-100 w-full md:w-auto md:min-w-[320px]"
        onClick={() => setIsModalOpen(true)}
        disabled={isPending}
      >
        대시보드 삭제하기
      </Button>

      {isModalOpen && (
        <ModalOverlay onClose={() => setIsModalOpen(false)}>
          <ConfirmModal
            message="대시보드를 정말 삭제하시겠습니까?"
            cancelText="아니요"
            confirmText="네"
            onConfirm={handleDeleteConfirm}
            onCancel={() => setIsModalOpen(false)}
          />
        </ModalOverlay>
      )}
    </>
  );
}
