'use client';

import { useCallback } from 'react';

export function useLogout(redirectPath: string = '/') {
  return useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      window.location.href = redirectPath;
    }
  }, [redirectPath]);
}
