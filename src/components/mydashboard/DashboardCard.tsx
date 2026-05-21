'use client';

import { Dashboard } from '@/types/dashboard';
import Button from '../common/Button';
import ArrowRightIcon from '../common/Icon/ArrowRightIcon';
import CrownIcon from '../common/Icon/CrownIcon';
import { useRouter } from 'next/navigation';

interface DashboardCardProps {
  board: Dashboard;
}

export default function DashboardCard({ board }: DashboardCardProps) {
  const router = useRouter();

  const handleNavigate = () => {
    router.push(`/dashboard/${board.id}`);
  };

  return (
    <Button
      variant="secondary"
      size="dashboard_card"
      className="!w-full flex items-center justify-between overflow-hidden"
      onClick={handleNavigate}
    >
      <div className="flex items-center min-w-0 flex-1">
        <span
          className="shrink-0 mr-[12px] w-[8px] h-[8px] rounded-full lg:mr-[16px]"
          style={{ backgroundColor: board.color }}
        ></span>
        <span className="truncate pr-[4px] md:pr-[6px] lg:pr-[8px]">
          {board.title}
        </span>
        {board.createdByMe && <CrownIcon className="shrink-0" />}
      </div>
      <ArrowRightIcon className="shrink-0" width={18} height={18} />
    </Button>
  );
}
