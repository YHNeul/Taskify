import SettingIcon from '@/shared/components/common/Icon/SettingIcon';
import Skeleton from '@/shared/components/common/Skeleton/Skeleton';
import type { Dashboard } from '@/shared/types/dashboard';

interface HeaderManageButtonProps {
  dashboardId: number | null;
  dashboard?: Dashboard;
  isDashboardLoading: boolean;
  onManageClick: () => void;
}

export default function HeaderManageButton({
  dashboardId,
  dashboard,
  isDashboardLoading,
  onManageClick,
}: HeaderManageButtonProps) {
  if (isDashboardLoading && dashboardId) {
    return <Skeleton className="h-10 w-18 rounded-lg" />;
  }

  if (!dashboardId || !dashboard?.createdByMe) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={onManageClick}
      aria-label="관리"
      className="flex h-8 md:h-9 lg:h-10 items-center gap-1.5 md:gap-2 rounded-lg bg-white px-2 md:px-3 lg:px-4 text-xs-medium md:text-md-medium text-gray-500 shrink-0 cursor-pointer hover:bg-brand-violet-light transition-colors"
    >
      <SettingIcon className="h-4.5 w-4.5 md:h-5 md:w-5 lg:h-5 lg:w-5" />
      <span className="hidden md:inline md:text-lg-medium lg:text-lg-medium">
        관리
      </span>
    </button>
  );
}
