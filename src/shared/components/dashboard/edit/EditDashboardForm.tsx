'use client';

import { updateDashboard } from '@/shared/apis/dashboard';
import Button from '@/shared/components/common/Button';
import ColorChip from '@/shared/components/common/Chip/ColorChip';
import { Input } from '@/shared/components/common/Input';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import { useDashboardFormSync } from '@/shared/hooks/useDashboardFormSync';
import { useDashboardQuery } from '@/shared/hooks/useDashboardQuery';
import { Dashboard } from '@/shared/types/dashboard';
import { validateDashboardName } from '@/shared/utils/validate';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

interface EditDashboardFormProps {
  dashboardId: string;
}

export default function EditDashboardForm({
  dashboardId,
}: EditDashboardFormProps) {
  const queryClient = useQueryClient();
  const dashboardIdNumber = Number(dashboardId);

  /** 초기값 세팅 */
  const { data: dashboard, isLoading } = useDashboardQuery(dashboardIdNumber);

  /** 대시보드 제목, 색상 수정 */
  const mutation = useMutation({
    mutationFn: (body: Pick<Dashboard, 'title' | 'color'>) =>
      updateDashboard(dashboardIdNumber, body),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.dashboard(dashboardIdNumber),
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboards() });
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
    setTitle,
    setSelectedColor,
  });

  const isTitleValid = validateDashboardName(title);
  const isUnchanged = title === initialName && selectedColor === initialColor;
  const isSubmitDisabled =
    isUnchanged || !isTitleValid || isLoading || mutation.isPending;
  const hasErrorMessage = title.length > 0 && !isTitleValid;

  return (
    <div className="px-4 py-5 md:px-7 md:py-8">
      <div>
        <span className="typo-xl-bold text-gray-700 md:typo-2xl-bold">
          {dashboard?.title ?? '대시보드 불러오는 중...'}
        </span>
      </div>
      <div className="pt-6">
        <span className="inline-block mb-2 typo-lg-medium text-gray-700 md:typo-2lg-medium">
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
        <div className="mt-4">
          {dashboard && (
            <ColorChip
              onSelectedColor={(hex) => setSelectedColor(hex)}
              defaultColor={dashboard.color}
            />
          )}
        </div>
        <div>
          <Button
            className="w-full h-14 mt-8 typo-lg-semibold md:mt-10"
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
