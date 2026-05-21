/**
 * @file React Query 전역 Provider
 * @description 앱 전체에서 React Query를 사용할 수 있도록 QueryClient를 생성하고 주입하는 클라이언트 컴포넌트입니다.
 * @note 서버 컴포넌트인 루트 layout.tsx에서 직접 QueryClientProvider를 사용할 수 없어 별도 파일로 분리했습니다.
 */

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
