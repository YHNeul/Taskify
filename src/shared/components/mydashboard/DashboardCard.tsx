'use client';

import { Dashboard } from '@/shared/types/dashboard';
import Button from '@/shared/components/common/Button';
import ArrowRightIcon from '@/shared/components/common/Icon/ArrowRightIcon';
import CrownIcon from '@/shared/components/common/Icon/CrownIcon';
import { useRouter } from 'next/navigation';
import { useDashboardPrefetch } from '@/shared/hooks/useDashboardPrefetch';

interface DashboardCardProps {
  board: Dashboard;
}

export default function DashboardCard({ board }: DashboardCardProps) {
  const router = useRouter();
  const prefetchDashboard = useDashboardPrefetch();

  const handleNavigate = () => {
    router.push(`/dashboard/${board.id}`);
  };

  const handlePrefetch = () => {
    prefetchDashboard(board.id);
  };

  return (
    <Button
      variant="secondary"
      size="lg"
      className="h-58 w-full! justify-between overflow-hidden text-md-semibold md:h-68 md:text-lg-semibold lg:h-70"
      onClick={handleNavigate}
      onMouseEnter={handlePrefetch}
      onFocus={handlePrefetch}
      onTouchStart={handlePrefetch}
    >
      <div className="flex items-center min-w-0 flex-1">
        <span
          className="shrink-0 mr-3 w-2 h-2 rounded-full lg:mr-4"
          style={{ backgroundColor: board.color }}
        ></span>
        <span className="truncate pr-1 md:pr-1.5 lg:pr-2">{board.title}</span>
        {board.createdByMe && <CrownIcon className="shrink-0" />}
      </div>
      <ArrowRightIcon className="shrink-0" width={18} height={18} />
    </Button>
  );
}
