import AddIcon from '@/shared/components/common/Icon/AddIcon';
import Skeleton from '@/shared/components/common/Skeleton/Skeleton';

interface HeaderInviteButtonProps {
  dashboardId: number | null;
  isDashboardLoading: boolean;
  onInviteClick: () => void;
}

export default function HeaderInviteButton({
  dashboardId,
  isDashboardLoading,
  onInviteClick,
}: HeaderInviteButtonProps) {
  if (dashboardId && isDashboardLoading) {
    return (
      <Skeleton className="ml-2 h-profile-desktop w-profile-desktop rounded-full shrink-0" />
    );
  }

  if (!dashboardId) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={onInviteClick}
      aria-label="멤버 초대"
      className="group relative ml-2 flex h-profile-desktop w-profile-desktop items-center justify-center rounded-full bg-white hover:bg-gray-200 transition-colors shrink-0 cursor-pointer"
    >
      <AddIcon className="h-5 w-5 md:h-6 md:w-6 lg:h-7 lg:w-7" />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-full z-10 mt-1 -translate-x-1/2 whitespace-nowrap rounded-xl bg-gray-600 px-2 py-1 text-xs-medium text-white opacity-0 transition-opacity group-hover:opacity-100"
      >
        멤버 초대
      </span>
    </button>
  );
}
