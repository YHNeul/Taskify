import { create } from 'zustand';

interface DashboardStore {
  /** 마지막으로 방문한 대시보드 ID (헤더 멤버 칩에 사용) */
  activeDashboardId: number | null;
  setActiveDashboardId: (id: number) => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  activeDashboardId: null,
  setActiveDashboardId: (id) => set({ activeDashboardId: id }),
}));
