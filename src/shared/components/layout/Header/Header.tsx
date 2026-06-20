'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MemberAvatars from '@/shared/components/layout/Header/MemberAvatars';
import HeaderTitle from '@/shared/components/layout/Header/HeaderTitle';
import HeaderManageButton from '@/shared/components/layout/Header/HeaderManageButton';
import HeaderInviteButton from '@/shared/components/layout/Header/HeaderInviteButton';
import HeaderMyProfileButton from '@/shared/components/layout/Header/HeaderMyProfileButton';
import HeaderInviteModal from '@/shared/components/layout/Header/HeaderInviteModal';
import { useHeader } from '@/shared/hooks/useHeader';
import { useInviteMember } from '@/shared/hooks/useInviteMember';
import clsx from 'clsx';

export default function Header() {
  const router = useRouter();
  const {
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
  } = useHeader();

  const invite = useInviteMember(effectiveDashboardId);
  const showOwnerControls = Boolean(dashboardId && dashboard?.createdByMe);

  useEffect(() => {
    router.prefetch('/mypage');
  }, [router]);

  useEffect(() => {
    if (!dashboardId || !dashboard?.createdByMe) return;
    router.prefetch(`/dashboard/${dashboardId}/edit`);
  }, [dashboard?.createdByMe, dashboardId, router]);

  return (
    <>
      <header className="flex h-16 w-full items-center justify-between shrink-0 border-b border-gray-200 bg-white px-3 md:px-5 lg:px-8">
        <div className="flex min-w-0 items-center gap-2">
          <HeaderTitle
            staticTitle={staticTitle}
            dashboard={dashboard}
            isDashboardLoading={isDashboardLoading}
          />
        </div>

        <div className="flex min-w-0 items-center gap-2 md:gap-3 lg:gap-4">
          <HeaderManageButton
            dashboardId={dashboardId}
            dashboard={dashboard}
            isDashboardLoading={isDashboardLoading}
            onManageClick={(id) => router.push(`/dashboard/${id}/edit`)}
          />

          <div
            className={clsx(
              'ml-1 flex min-w-0 items-center gap-0',
              showOwnerControls && 'border-gray-300 border-l pl-3 md:pl-4',
            )}
          >
            <MemberAvatars
              members={members}
              maxVisibleMembers={maxVisibleMembers}
              isLoading={isMembersLoading}
              hasDashboard={!!dashboardId}
            />
            <HeaderInviteButton
              dashboardId={dashboardId}
              isDashboardLoading={isDashboardLoading}
              onInviteClick={invite.open}
            />

            <HeaderMyProfileButton
              me={me}
              isMeLoading={isMeLoading}
              myChipColor={myChipColor}
              shouldPrioritizeMyAvatar={shouldPrioritizeMyAvatar}
              onProfileClick={() => router.push('/mypage')}
            />
          </div>
        </div>
      </header>

      <HeaderInviteModal
        isOpen={invite.isOpen}
        email={invite.email}
        error={invite.error}
        isDisabled={invite.isDisabled}
        onChange={invite.handleEmailChange}
        onClose={invite.close}
        onConfirm={invite.handleConfirm}
      />
    </>
  );
}
