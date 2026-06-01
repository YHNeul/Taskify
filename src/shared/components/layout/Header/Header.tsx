'use client';

import { useParams, useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import CrownIcon from '@/shared/components/common/Icon/CrownIcon';
import SettingIcon from '@/shared/components/common/Icon/SettingIcon';
import AddCircleIcon from '@/shared/components/common/Icon/AddCircleIcon';
import { useDashboardStore } from '@/shared/store/useDashboardStore';
import { CHIP_COLORS } from '@/shared/components/common/User/UserProfileImage';
import Skeleton from '@/shared/components/common/Skeleton/Skeleton';
import FormModal from '@/shared/components/modal/FormModal';
import ModalOverlay from '@/shared/components/common/ModalBase/ModalOverlay';
import MemberAvatars from '@/shared/components/layout/Header/MemberAvatars';
import { useInviteMember } from '@/shared/hooks/useInviteMember';
import { useMeQuery } from '@/shared/hooks/useMeQuery';
import { useDashboardMembersQuery } from '@/shared/hooks/useDashboardMembersQuery';
import { useDashboardQuery } from '@/shared/hooks/useDashboardQuery';

const MAX_VISIBLE_DESKTOP = 4;
const MAX_VISIBLE_COMPACT = 2;

const PAGE_TITLES: Record<string, string> = {
  '/mydashboard': '내 대시보드',
  '/mypage': '계정관리',
};

export default function Header() {
  const params = useParams();
  const router = useRouter();
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
    const update = () =>
      setMaxVisibleMembers(
        window.innerWidth < 1024 ? MAX_VISIBLE_COMPACT : MAX_VISIBLE_DESKTOP,
      );
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const members = membersData?.members ?? [];
  const myMemberIndex = me ? members.findIndex((m) => m.userId === me.id) : -1;
  const myChipColor =
    CHIP_COLORS[(myMemberIndex >= 0 ? myMemberIndex : 0) % CHIP_COLORS.length];

  const invite = useInviteMember(effectiveDashboardId);

  return (
    <>
      <header className="flex h-16 w-full items-center justify-between shrink-0 border-b border-gray-200 bg-white px-3 md:px-5 lg:px-8">
        <div className="flex min-w-0 items-center gap-2">
          {isDashboardLoading && !staticTitle ? (
            <Skeleton className="hidden lg:block h-6 w-36 rounded" />
          ) : (
            <>
              <h1 className="hidden lg:block truncate text-xl-bold text-gray-700">
                {staticTitle ?? dashboard?.title ?? ''}
              </h1>
              {!staticTitle && dashboard?.createdByMe && (
                <CrownIcon className="hidden lg:block h-5 w-4 shrink-0" />
              )}
            </>
          )}
        </div>

        <div className="flex min-w-0 items-center gap-2 md:gap-3 lg:gap-4">
          {isDashboardLoading && dashboardId ? (
            <Skeleton className="h-10 w-18 rounded-lg" />
          ) : (
            <>
              {dashboardId && dashboard?.createdByMe && (
                <button
                  type="button"
                  onClick={() => router.push(`/dashboard/${dashboardId}/edit`)}
                  className="flex h-8 md:h-9 lg:h-10 items-center gap-1.5 md:gap-2 rounded-lg bg-white px-2 md:px-3 lg:px-4 text-xs-medium md:text-md-medium text-gray-500 shrink-0 cursor-pointer hover:bg-brand-violet-light transition-colors"
                >
                  <SettingIcon className="h-4.5 w-4.5 md:h-5 md:w-5 lg:h-5 lg:w-5" />
                  <span className="hidden md:inline md:text-lg-medium lg:text-lg-medium">
                    관리
                  </span>
                </button>
              )}
            </>
          )}

          <div
            className={`ml-1 flex min-w-0 items-center gap-0 ${
              dashboardId && dashboard?.createdByMe
                ? 'pl-3 md:pl-4 border-l border-gray-300'
                : ''
            }`}
          >
            <MemberAvatars
              members={members}
              maxVisibleMembers={maxVisibleMembers}
              isLoading={isMembersLoading}
              hasDashboard={!!dashboardId}
            />
            {dashboardId && isDashboardLoading ? (
              <Skeleton className="ml-2 h-profile-desktop w-profile-desktop rounded-full shrink-0" />
            ) : (
              dashboardId && (
              <button
                type="button"
                onClick={invite.open}
                aria-label="멤버 초대"
                className="group relative ml-2 flex h-profile-desktop w-profile-desktop items-center justify-center rounded-full bg-white hover:bg-gray-200 transition-colors shrink-0 cursor-pointer"
              >
                <AddCircleIcon className="h-5 w-5 md:h-6 md:w-6 lg:h-7 lg:w-7" />
                <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-1 -translate-x-1/2 whitespace-nowrap rounded-xl bg-gray-600 px-2 py-1 text-xs-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                  멤버 초대
                </span>
              </button>
              )
            )}

            {isMeLoading ? (
              <div className="ml-2 md:ml-4 lg:ml-6 flex items-center gap-2 md:gap-3 border-l border-gray-300 pl-2 md:pl-4 lg:pl-6 shrink-0">
                <Skeleton className="w-profile-desktop h-profile-desktop rounded-full shrink-0" />
                <Skeleton className="h-4 w-20 rounded hidden lg:block" />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => router.push('/mypage')}
                className="ml-2 md:ml-4 lg:ml-6 flex items-center gap-2 md:gap-3 border-l border-gray-300 pl-2 md:pl-4 lg:pl-6 hover:opacity-80 transition-opacity shrink-0 cursor-pointer"
              >
                <div
                  className="flex h-profile-desktop w-profile-desktop items-center justify-center rounded-full overflow-hidden text-lg-medium text-white shrink-0"
                  style={{ backgroundColor: myChipColor }}
                >
                  {me?.profileImageUrl ? (
                    <Image
                      src={me.profileImageUrl}
                      alt={me.nickname}
                      width={38}
                      height={38}
                      priority={shouldPrioritizeMyAvatar}
                      className="object-cover w-full h-full"
                      unoptimized
                    />
                  ) : (
                    (me?.nickname?.[0]?.toUpperCase() ?? 'U')
                  )}
                </div>
                <span className="hidden lg:inline text-lg-medium text-gray-700">
                  {me?.nickname ?? ''}
                </span>
              </button>
            )}
          </div>
        </div>
      </header>

      {invite.isOpen && (
        <ModalOverlay onClose={invite.close}>
          <FormModal
            title="멤버 초대"
            label="이메일"
            value={invite.email}
            placeholder="이메일을 입력해 주세요"
            cancelText="취소"
            confirmText="초대"
            errorText={invite.error}
            showCloseButton
            disabled={invite.isDisabled}
            onChange={invite.handleEmailChange}
            onCancel={invite.close}
            onClose={invite.close}
            onConfirm={invite.handleConfirm}
          />
        </ModalOverlay>
      )}
    </>
  );
}
