'use client';

import { useParams, useRouter, usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import CrownIcon from '@/components/common/Icon/CrownIcon';
import SettingIcon from '@/components/common/Icon/SettingIcon';
import AddBoxIcon from '@/components/common/Icon/AddBoxIcon';
import { getDashboard, getMembers } from '@/api/dashboard';
import { getMe } from '@/api/auth';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { useDashboardStore } from '@/store/useDashboardStore';
import { CHIP_COLORS } from '@/components/common/User/UserProfileImage';
import Skeleton from '@/components/common/Skeleton/Skeleton';
import FormModal from '@/components/modal/FormModal';
import ModalOverlay from '@/components/common/ModalBase/ModalOverlay';
import MemberAvatars from './MemberAvatars';
import { useInviteMember } from '@/hooks/useInviteMember';

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

  const { data: dashboard, isLoading: isDashboardLoading } = useQuery({
    queryKey: QUERY_KEYS.dashboard(effectiveDashboardId!),
    queryFn: () => getDashboard(effectiveDashboardId!),
    enabled: !!effectiveDashboardId,
  });

  const { data: membersData, isLoading: isMembersLoading } = useQuery({
    queryKey: QUERY_KEYS.members(effectiveDashboardId!),
    queryFn: () => getMembers(effectiveDashboardId!),
    enabled: !!effectiveDashboardId,
  });

  const { data: me, isLoading: isMeLoading } = useQuery({
    queryKey: QUERY_KEYS.me(),
    queryFn: getMe,
  });

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
      <header className="flex h-[64px] w-full items-center justify-between shrink-0 border-b border-gray-200 bg-white px-3 md:px-5 lg:px-8">
        <div className="flex min-w-0 items-center gap-2">
          {isDashboardLoading && !staticTitle ? (
            <Skeleton className="hidden lg:block h-6 w-36 rounded" />
          ) : (
            <>
              <h1 className="hidden lg:block truncate text-xl-bold text-gray-700">
                {staticTitle ?? dashboard?.title ?? ''}
              </h1>
              {!staticTitle && dashboard?.createdByMe && (
                <CrownIcon className="hidden lg:block h-[20px] w-[16px] shrink-0" />
              )}
            </>
          )}
        </div>

        <div className="flex min-w-0 items-center gap-2 md:gap-3 lg:gap-4">
          {isDashboardLoading && dashboardId ? (
            <>
              <Skeleton className="h-[40px] w-[72px] rounded-[8px]" />
              <Skeleton className="h-[40px] w-[88px] rounded-[8px]" />
            </>
          ) : (
            <>
              {dashboardId && dashboard?.createdByMe && (
                <button
                  type="button"
                  onClick={() => router.push(`/dashboard/${dashboardId}/edit`)}
                  className="flex h-[32px] md:h-[36px] lg:h-[40px] items-center gap-1.5 md:gap-2 rounded-[8px] border border-gray-300 bg-white px-2 md:px-3 lg:px-4 text-xs-medium md:text-md-medium text-gray-500 shrink-0"
                >
                  <SettingIcon className="h-[16px] w-[16px] md:h-[18px] md:w-[18px] lg:h-[20px] lg:w-[20px]" />
                  <span className="hidden md:inline">관리</span>
                </button>
              )}
              <button
                type="button"
                onClick={invite.open}
                className="flex h-[32px] md:h-[36px] lg:h-[40px] items-center gap-1.5 md:gap-2 rounded-[8px] border border-gray-300 bg-white px-2 md:px-3 lg:px-4 text-xs-medium md:text-md-medium text-gray-500 shrink-0"
              >
                <AddBoxIcon className="h-[16px] w-[16px] md:h-[18px] md:w-[18px] lg:h-[20px] lg:w-[20px]" />
                <span className="hidden md:inline">초대하기</span>
              </button>
            </>
          )}

          <div className="ml-1 flex min-w-0 items-center gap-0">
            <MemberAvatars
              members={members}
              maxVisibleMembers={maxVisibleMembers}
              isLoading={isMembersLoading}
              hasDashboard={!!dashboardId}
            />

            {isMeLoading ? (
              <div className="ml-2 md:ml-4 lg:ml-6 flex items-center gap-2 md:gap-3 border-l border-gray-300 pl-2 md:pl-4 lg:pl-6 shrink-0">
                <Skeleton className="w-[38px] h-[38px] rounded-full shrink-0" />
                <Skeleton className="h-4 w-20 rounded hidden lg:block" />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => router.push('/mypage')}
                className="ml-2 md:ml-4 lg:ml-6 flex items-center gap-2 md:gap-3 border-l border-gray-300 pl-2 md:pl-4 lg:pl-6 hover:opacity-80 transition-opacity shrink-0"
              >
                <div
                  className="flex h-[38px] w-[38px] items-center justify-center rounded-full overflow-hidden text-lg-medium text-white shrink-0"
                  style={{ backgroundColor: myChipColor }}
                >
                  {me?.profileImageUrl ? (
                    <Image
                      src={me.profileImageUrl}
                      alt={me.nickname}
                      width={38}
                      height={38}
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
