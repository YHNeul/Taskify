'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDashboards } from '@/api/dashboard';
import { Dashboard } from '@/types/dashboard';

import Button from '@/components/common/Button';
import AddItemChip from '../common/Chip/AddItemChip';
import DashboardCard from './DashboardCard';
import Pagination from '../common/Pagination';
import DashboardCreateModal from '../modal/DashboardCreateModal';
import Skeleton from '../common/Skeleton/Skeleton';

const DASHBOARD_LIMIT = 6;

export default function DashboardList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isPending } = useQuery({
    queryKey: ['dashboards', currentPage],
    queryFn: () => getDashboards(currentPage, DASHBOARD_LIMIT),
    placeholderData: (previousData) => previousData,
  });

  const isFirstPage = currentPage === 1;
  const rawDashboards = data?.dashboards || [];

  const uniqueDashboards = rawDashboards.filter(
    (board, index, self) => index === self.findIndex((b) => b.id === board.id),
  );

  const dashboards = isFirstPage
    ? uniqueDashboards.slice(0, 5)
    : uniqueDashboards;

  const totalCount = data?.totalCount || 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / DASHBOARD_LIMIT));

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const renderSkeletons = () => {
    return Array.from({ length: DASHBOARD_LIMIT }).map((_, i) => (
      <div
        key={`skeleton-${i}`}
        className="flex h-[58px] items-center gap-[10px] border border-gray-200 rounded-lg px-5 md:h-[68px] lg:h-[70px] animate-pulse"
      >
        <Skeleton className="h-2 w-2 rounded-full bg-gray-300" />
        <Skeleton className="h-4 w-24 bg-gray-200" />
        <Skeleton className="ml-auto h-4 w-4 bg-gray-200" />
      </div>
    ));
  };

  return (
    <div className="pt-[40px] flex flex-col w-full">
      <div
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[8px] content-start 
          md:gap-[10px] lg:gap-[13px] 
          ${dashboards.length > 0 ? 'min-h-[160px] md:min-h-[235px] lg:min-h-[160px]' : 'min-h-0'}`}
      >
        {isFirstPage && (
          <Button
            variant="secondary"
            size="add_board"
            className="!w-full"
            onClick={openModal}
          >
            <span className="text-gray-700">새로운 대시보드</span>
            <AddItemChip asIcon={true} />
          </Button>
        )}

        {isPending
          ? renderSkeletons().slice(isFirstPage ? 1 : 0)
          : dashboards.map((board: Dashboard) => (
              <DashboardCard key={board.id} board={board} />
            ))}

        <DashboardCreateModal
          isOpen={isModalOpen}
          onClose={closeModal}
          dashboards={data?.dashboards || []}
        />
      </div>

      {!isPending && dashboards.length > 0 && (
        <div className="mt-[8px] flex justify-end items-center gap-[16px]">
          <span className="text-xs-regular text-gray-500 md:text-md-regular">
            {totalPages} 페이지 중 {currentPage}
          </span>
          <Pagination
            size="sm"
            currentPage={currentPage}
            totalPages={totalPages}
            onPrev={() => setCurrentPage((p) => Math.max(1, p - 1))}
            onNext={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          />
        </div>
      )}
    </div>
  );
}
