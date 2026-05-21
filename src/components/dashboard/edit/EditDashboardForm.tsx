'use client';

import { getDashboard, updateDashboard } from '@/api/dashboard';
import Button from '@/components/common/Button';
import ColorChip from '@/components/common/Chip/ColorChip';
import { Input } from '@/components/common/Input';
import { useDashboardFormSync } from '@/hooks/useDashboardFormSync';
import { Dashboard } from '@/types/dashboard';
import { validateDashboardName } from '@/utils/validate';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

interface EditDashboardFormProps {
  dashboardId: string;
}

export default function EditDashboardForm({
  dashboardId,
}: EditDashboardFormProps) {
  const queryClient = useQueryClient();

  /** 초기값 세팅 */
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['dashboard', dashboardId],
    queryFn: () => getDashboard(Number(dashboardId)),
    enabled: !!dashboardId,
  });

  /** 대시보드 제목, 색상 수정 */
  const mutation = useMutation({
    mutationFn: (body: Pick<Dashboard, 'title' | 'color'>) =>
      updateDashboard(Number(dashboardId), body),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard', dashboardId] });
      queryClient.invalidateQueries({ queryKey: ['dashboards'] });
    },
    onError: () => {
      alert('수정에 실패했습니다. 다시 시도해주세요.');
    },
  });
  const initialName = dashboard?.title ?? '';
  const initialColor = dashboard?.color ?? '';

  const [title, setTitle] = useState(initialName);
  const [selectedColor, setSelectedColor] = useState(initialColor);

  /** 초기값 채우기 */
  useDashboardFormSync({
    dashboard,
    title,
    setTitle,
    selectedColor,
    setSelectedColor,
  });

  const isTitleValid = validateDashboardName(title);
  const isUnchanged = title === initialName && selectedColor === initialColor;
  const isSubmitDisabled =
    isUnchanged || !isTitleValid || isLoading || mutation.isPending;
  const hasErrorMessage = title.length > 0 && !isTitleValid;

  return (
    <div className="px-[16px] py-[20px] md:px-[28px] md:py-[32px]">
      <div>
        <span className="text-xl-bold text-gray-700 md:text-2xl-bold">
          {dashboard?.title ?? '대시보드 불러오는 중...'}
        </span>
      </div>
      <div className="pt-[24px]">
        <span className="inline-block mb-[8px] text-lg-medium text-gray-700 md:text-2lg-medium">
          대시보드 이름
        </span>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="수정할 이름을 입력하세요"
          isError={hasErrorMessage || !isTitleValid}
          errorMessage={
            hasErrorMessage ? '한글·영문·숫자 조합 2자 이상 입력해 주세요.' : ''
          }
        />
        <div className="mt-[16px]">
          {dashboard && (
            <ColorChip
              onSelectedColor={(hex) => setSelectedColor(hex)}
              defaultColor={dashboard.color}
            />
          )}
        </div>
        <div>
          <Button
            className="w-full h-[54px] mt-[32px] text-lg-semibold md:mt-[40px]"
            variant="primary"
            disabled={isSubmitDisabled}
            onClick={() => {
              if (!dashboard) return;
              mutation.mutate({ title, color: selectedColor });
            }}
          >
            변경
          </Button>
        </div>
      </div>
    </div>
  );
}
