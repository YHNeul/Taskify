'use client';

import { useRouter } from 'next/navigation';

export default function LandingLogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
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
