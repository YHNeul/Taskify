'use client';

import { Dashboard } from '@/shared/types/dashboard';

import Button from '@/shared/components/common/Button';
import AddItemChip from '@/shared/components/common/Chip/AddItemChip';
import DashboardCard from '@/shared/components/mydashboard/DashboardCard';
import Pagination from '@/shared/components/common/Pagination';
import DashboardCreateModal from '@/shared/components/modal/DashboardCreateModal';
import Skeleton from '@/shared/components/common/Skeleton/Skeleton';
import { useDashboardsPageQuery } from '@/shared/hooks/useDashboardsPageQuery';
import {
  useQueryParamState,
  parsePositiveIntParam,
} from '@/shared/hooks/useQueryParamState';

const DASHBOARD_LIMIT = 6;

export default function DashboardList() {
  const [currentPage, setCurrentPage] = useQueryParamState<number>({
    key: 'dashboardPage',
    defaultValue: 1,
    parse: (rawValue) => parsePositiveIntParam(rawValue, 1),
    serialize: (value) => (value > 1 ? String(value) : null),
  });
  const [isModalOpen, setIsModalOpen] = useQueryParamState<boolean>({
    key: 'createDashboard',
    defaultValue: false,
    parse: (rawValue) => rawValue === '1',
    serialize: (value) => (value ? '1' : null),
  });

  const { data, isPending } = useDashboardsPageQuery({
    page: currentPage,
    size: DASHBOARD_LIMIT,
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
        className="flex h-58 items-center gap-2.5 border border-gray-200 rounded-lg px-5 md:h-68 lg:h-70 animate-pulse"
      >
        <Skeleton className="h-2 w-2 rounded-full bg-gray-300" />
        <Skeleton className="h-4 w-24 bg-gray-200" />
        <Skeleton className="ml-auto h-4 w-4 bg-gray-200" />
      </div>
    ));
  };

  return (
    <div className="pt-10 flex flex-col w-full">
      <div
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 content-start 
          md:gap-2.5 lg:gap-3 
          ${dashboards.length > 0 ? 'min-h-40 md:min-h-56 lg:min-h-40' : 'min-h-0'}`}
      >
        {isFirstPage && (
          <Button
            variant="secondary"
            size="lg"
            className="h-58 w-full text-md-semibold md:h-68 md:text-lg-semibold lg:h-70"
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
        <div className="mt-2 flex justify-end items-center gap-4">
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
