'use client';

/**
 * 서버 데이터(dashboard)와 로컬 폼 상태(title, color)를 동기화하는 훅
 */
import { Dashboard } from '@/types/dashboard';
import { useEffect } from 'react';

export const useDashboardFormSync = ({
  dashboard,
  setTitle,
  setSelectedColor,
}: {
  dashboard: Dashboard | null | undefined;
  setTitle: (t: string) => void;
  setSelectedColor: (c: string) => void;
}) => {
  useEffect(() => {
    if (!dashboard) return;
    // 서버에서 받은 대시보드 값이 바뀔 때만 폼 상태를 동기화한다.
    setTitle(dashboard.title);
    setSelectedColor(dashboard.color);
  }, [
    dashboard,
    dashboard?.id,
    dashboard?.title,
    dashboard?.color,
    setTitle,
    setSelectedColor,
  ]);
};
