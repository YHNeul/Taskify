/**
 * @file ErrorPageView.tsx
 * @description 404/500 등 공통 에러 페이지 레이아웃 컴포넌트입니다.
 */

import type { ReactNode } from 'react';

type ErrorPageViewProps = {
  statusCode: string;
  title: string;
  description: string;
  actions?: ReactNode;
};

export default function ErrorPageView({
  statusCode,
  title,
  description,
  actions,
}: ErrorPageViewProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-6 py-12">
      <section className="w-full max-w-lg rounded-card-md border border-gray-200 bg-white p-8 text-center shadow-sm sm:p-10">
        <p className="text-3xl-bold text-brand-violet">{statusCode}</p>
        <h1 className="mt-3 text-2xl-bold text-gray-700">{title}</h1>
        <p className="mt-4 whitespace-pre-line text-md-regular text-gray-500">
          {description}
        </p>

        {actions ? (
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {actions}
          </div>
        ) : null}
      </section>
    </main>
  );
}
