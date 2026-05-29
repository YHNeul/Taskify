'use client';

import { useLogout } from '@/shared/hooks/useLogout';

export default function LandingLogoutButton() {
  const handleLogout = useLogout('/');

  return (
    <button type="button" onClick={handleLogout} className="hover:opacity-80">
      로그아웃
    </button>
  );
}
