'use client';

import { getMyInvitations } from '@/api/dashboard';
import EmptyInvitation from './EmptyInvitation';
import InvitationTable from './InvitationTable';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import Skeleton from '../common/Skeleton/Skeleton';

export default function InvitationList() {
  const observerRef = useRef<HTMLDivElement>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending } =
    useInfiniteQuery({
      queryKey: ['myInvitations'],
      queryFn: ({ pageParam }) => getMyInvitations(10, pageParam),
      initialPageParam: null as number | null,
      getNextPageParam: (lastPage) => lastPage.cursorId ?? null,
    });

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
    <div className="flex flex-col gap-4 p-6 bg-white rounded-[16px]">
      <Skeleton className="h-8 w-40 mb-4" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0"
        >
          <Skeleton className="h-5 w-1/4" />
          <Skeleton className="h-5 w-1/4" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-16 rounded-md" />
            <Skeleton className="h-8 w-16 rounded-md" />
          </div>
        </div>
      ))}
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
