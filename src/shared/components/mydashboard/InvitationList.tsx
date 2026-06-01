'use client';

import EmptyInvitation from '@/shared/components/mydashboard/EmptyInvitation';
import InvitationTable from '@/shared/components/mydashboard/InvitationTable';
import { useEffect, useRef } from 'react';
import Skeleton from '@/shared/components/common/Skeleton/Skeleton';
import { useMyInvitationsInfiniteQuery } from '@/shared/hooks/useMyInvitationsInfiniteQuery';

export default function InvitationList() {
  const observerRef = useRef<HTMLDivElement>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending } =
    useMyInvitationsInfiniteQuery({ size: 10 });

  const invitations = data?.pages.flatMap((page) => page.invitations) || [];

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 0, rootMargin: '0px 0px 80px 0px' },
    );

    const el = observerRef.current;
    if (el) {
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, invitations.length]);

  const renderTableSkeleton = () => (
    <div className="py-6 bg-white rounded-card-sm md:py-4.5 md:rounded-card-md lg:py-8 lg:rounded-card-lg">
      <div className="px-5 md:px-10">
        <Skeleton className="h-7 w-40" />
      </div>
      <div className="mt-4 px-4 md:mt-17 md:px-7 lg:px-10 lg:mt-8">
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
      <div className="mt-3 md:mt-6 md:px-7 lg:px-10">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="hidden md:flex items-center justify-between py-5 border-b border-gray-100 last:border-0"
          >
            <Skeleton className="h-5 w-2/5" />
            <div className="flex items-center gap-2 w-1/4">
              <Skeleton className="h-6 w-6 rounded-full shrink-0" />
              <Skeleton className="h-5 w-28" />
            </div>
            <div className="flex justify-end w-[176px] gap-2.5">
              <Skeleton className="h-8 w-20 rounded-xl" />
              <Skeleton className="h-8 w-20 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      {isPending ? (
        renderTableSkeleton()
      ) : invitations.length > 0 ? (
        <div>
          <InvitationTable data={invitations} observerRef={observerRef} />
          {isFetchingNextPage && (
            <div className="py-4 text-center">불러오는 중...</div>
          )}
        </div>
      ) : (
        <EmptyInvitation />
      )}
    </div>
  );
}
