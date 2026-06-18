import CrownIcon from '@/shared/components/common/Icon/CrownIcon';
import Skeleton from '@/shared/components/common/Skeleton/Skeleton';
import type { Dashboard } from '@/shared/types/dashboard';

interface HeaderTitleProps {
  staticTitle: string | null;
  dashboard?: Dashboard;
  isDashboardLoading: boolean;
}

export default function HeaderTitle({
  staticTitle,
  dashboard,
  isDashboardLoading,
}: HeaderTitleProps) {
  if (isDashboardLoading && !staticTitle) {
    return <Skeleton className="hidden lg:block h-6 w-36 rounded" />;
  }

  return (
    <>
      <h1 className="sr-only lg:not-sr-only lg:block truncate typo-xl-bold text-gray-700">
        {staticTitle ?? dashboard?.title ?? ''}
      </h1>
      {!staticTitle && dashboard?.createdByMe && (
        <CrownIcon className="hidden lg:block h-5 w-4 shrink-0" />
      )}
    </>
  );
}
