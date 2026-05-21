'use client';

import { useRouter } from 'next/navigation';
import FormModal from './FormModal';
import { useMemo, useState } from 'react';
import ColorChip, { COLORS } from '../common/Chip/ColorChip';
import api from '@/api/axios';
import { Dashboard } from '@/types/dashboard';
import { validateDashboardName } from '@/utils/validate';
import ModalOverlay from '../common/ModalBase/ModalOverlay';
import { useQueryClient } from '@tanstack/react-query';

interface DashboardCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  dashboards: Dashboard[];
  onSuccess?: (newId: number) => void;
}

function isDuplicateDashboard(
  existingDashboards: Dashboard[],
  newTitle: string,
  newColor: string,
): boolean {
  return existingDashboards.some(
    (db) =>
      db.createdByMe && db.title === newTitle.trim() && db.color === newColor,
  );
}

export default function DashboardCreateModal({
  isOpen,
  onClose,
  dashboards,
  onSuccess,
}: DashboardCreateModalProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [dashboardName, setDashboardName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0].hex);
  const [isLoading, setIsLoading] = useState(false);

  const isDuplicate = useMemo(() => {
    return isDuplicateDashboard(dashboards, dashboardName, selectedColor);
  }, [dashboards, dashboardName, selectedColor]);

  const isTitleValid = validateDashboardName(dashboardName);
  const isSubmitDisabled = !isTitleValid || isLoading || isDuplicate;

  const handleCreate = async () => {
    if (!isTitleValid) return;
    setIsLoading(true);

    try {
      const response = await api.post('/dashboards', {
        title: dashboardName,
        color: selectedColor,
      });

      const createdData = response.data;

      if (createdData?.id) {
        await queryClient.invalidateQueries({
          queryKey: ['dashboards'],
          exact: false,
        });
        const newId = createdData.id;
        onSuccess?.(newId);
        setTimeout(() => {
          router.push(`/dashboard/${newId}`);
          onClose();
        }, 200);
      }
    } catch {
      alert('대시보드 생성에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setDashboardName('');
    setSelectedColor(COLORS[0].hex);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClose={handleClose}>
      <div
        className="w-full max-w-[568px] [&>div]:w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <FormModal
          title="새로운 대시보드"
          label="대시보드 이름"
          placeholder="뉴 프로젝트"
          confirmText="생성"
          value={dashboardName}
          onChange={setDashboardName}
          onConfirm={handleCreate}
          onCancel={handleClose}
          errorText={
            !isTitleValid ? '한글·영문·숫자 조합 2자 이상 입력해 주세요.' : ''
          }
          disabled={isSubmitDisabled}
        >
          <ColorChip
            onSelectedColor={(hex) => setSelectedColor(hex)}
            defaultColor={selectedColor}
          />
        </FormModal>
      </div>
    </ModalOverlay>
  );
}
