'use client';

import { usePathname, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CHIP_COLORS } from '@/shared/components/common/User/UserProfileImage';
import { useDashboardMembersQuery } from '@/shared/hooks/useDashboardMembersQuery';
import { useDashboardQuery } from '@/shared/hooks/useDashboardQuery';
import { useMeQuery } from '@/shared/hooks/useMeQuery';
import { useDashboardStore } from '@/shared/store/useDashboardStore';

const MAX_VISIBLE_DESKTOP = 4;
const MAX_VISIBLE_COMPACT = 2;

const PAGE_TITLES: Record<string, string> = {
  '/mydashboard': '내 대시보드',
  '/mypage': '계정관리',
};

export const useHeader = () => {
  const params = useParams();
  const pathname = usePathname();
  const activeDashboardId = useDashboardStore((s) => s.activeDashboardId);

  const [maxVisibleMembers, setMaxVisibleMembers] =
    useState(MAX_VISIBLE_DESKTOP);

  const staticTitle = PAGE_TITLES[pathname] ?? null;
  const dashboardId = params?.id ? Number(params.id) : null;
  const effectiveDashboardId = dashboardId ?? activeDashboardId;
  const shouldPrioritizeMyAvatar = Boolean(dashboardId);

  const { data: dashboard, isLoading: isDashboardLoading } = useDashboardQuery(
    effectiveDashboardId ?? 0,
  );

  const { data: membersData, isLoading: isMembersLoading } =
    useDashboardMembersQuery({
      dashboardId: effectiveDashboardId ?? 0,
    });

  const { data: me, isLoading: isMeLoading } = useMeQuery();

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    const update = () => {
      setMaxVisibleMembers(
        mediaQuery.matches ? MAX_VISIBLE_DESKTOP : MAX_VISIBLE_COMPACT,
      );
    };

    update();
    mediaQuery.addEventListener('change', update);

    return () => {
      mediaQuery.removeEventListener('change', update);
    };
  }, []);

  const members = membersData?.members ?? [];
  const myMemberIndex = me ? members.findIndex((m) => m.userId === me.id) : -1;
  const myChipColor =
    CHIP_COLORS[(myMemberIndex >= 0 ? myMemberIndex : 0) % CHIP_COLORS.length];

  return {
    staticTitle,
    dashboardId,
    shouldPrioritizeMyAvatar,
    effectiveDashboardId,
    maxVisibleMembers,
    dashboard,
    isDashboardLoading,
    members,
    isMembersLoading,
    me,
    isMeLoading,
    myChipColor,
  };
};
