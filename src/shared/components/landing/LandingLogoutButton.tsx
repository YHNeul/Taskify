'use client';

export default function LandingLogoutButton() {
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      window.location.href = '/';
    }
  };

  return (
    <button type="button" onClick={handleLogout} className="hover:opacity-80">
      로그아웃
    </button>
  );
}
