'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { deleteDashboard } from '@/shared/apis/dashboard';
import Button from '@/shared/components/common/Button';
import { useState } from 'react';
import ModalOverlay from '@/shared/components/common/ModalBase/ModalOverlay';
import { ConfirmModal } from '@/shared/components/modal';

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
        size="lg"
        className="h-delete-dashboard-mobile w-full bg-gray-100 text-lg-medium md:h-delete-dashboard-desktop md:w-auto md:min-w-delete-dashboard md:text-2lg-medium"
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
