'use client';

/**
 * 서버 데이터(dashboard)와 로컬 폼 상태(title, color)를 동기화하는 훅
 */
import { Dashboard } from '@/types/dashboard';
import { useEffect } from 'react';

export function useDashboardFormSync({
  dashboard,
  title,
  setTitle,
  selectedColor,
  setSelectedColor,
}: {
  dashboard: Dashboard | null | undefined;
  title: string;
  setTitle: (t: string) => void;
  selectedColor: string;
  setSelectedColor: (c: string) => void;
}) {
  useEffect(() => {
    if (!dashboard) return;
    if (title !== dashboard.title) {
      setTitle(dashboard.title);
    }
    if (selectedColor !== dashboard.color) {
      setSelectedColor(dashboard.color);
    }
  }, [dashboard?.id]);
}
