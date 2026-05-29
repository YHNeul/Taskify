'use client';

import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useDashboardStore } from '@/shared/store/useDashboardStore';

export default function LandingLogoutButton() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setActiveDashboardId = useDashboardStore(
    (state) => state.setActiveDashboardId,
  );

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      queryClient.clear();
      setActiveDashboardId(null);
      router.replace('/');
      router.refresh();
    }
  };

  return (
    <button type="button" onClick={handleLogout} className="hover:opacity-80">
      로그아웃
    </button>
  );
}
