/**
 * @file 대시보드 수정 페이지 ( /dashboard/{id}/edit )
 * @description 대시보드 이름/색상 변경, 구성원 삭제, 새로운 유저 초대 기능을 다루는 화면입니다.
 * @note 구성원 목록과 초대 내역 각각에 대한 페이지네이션 처리가 필요합니다.
 */

import { Suspense } from 'react';
import ArrowRightIcon from '@/shared/components/common/Icon/ArrowRightIcon';
import DeleteDashboardButton from '@/shared/components/dashboard/edit/DeleteDashboardButton';
import EditDashboardForm from '@/shared/components/dashboard/edit/EditDashboardForm';
import ManageInvitations from '@/shared/components/dashboard/edit/ManageInvitations';
import ManageMembers from '@/shared/components/dashboard/edit/ManageMembers';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DashboardEditPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="w-full bg-gray-100 min-h-screen-dvh-without-header overflow-y-auto">
      <div className="w-full max-w-dashboard-edit px-3 md:px-5">
        <Link
          href={`/dashboard/${id}`}
          className="pt-4 flex items-center gap-1.5 md:gap-2"
        >
          <ArrowRightIcon className="w-back-icon-mobile rotate-180 md:w-5" />
          <span className="text-md-medium text-gray-700 md:text-lg-medium mt-px">
            돌아가기
          </span>
        </Link>

        <div className="mt-2.5 bg-white rounded-lg md:mt-space-19 lg:mt-space-34">
          <EditDashboardForm dashboardId={id} />
        </div>

        <div className="mt-4 h-members-panel-mobile bg-white rounded-lg md:h-members-panel-desktop">
          <Suspense fallback={<div className="h-full" />}>
            <ManageMembers dashboardId={id} />
          </Suspense>
        </div>

        <div className="mt-4 h-invites-panel-mobile bg-white rounded-lg md:h-invites-panel-desktop">
          <Suspense fallback={<div className="h-full" />}>
            <ManageInvitations dashboardId={Number(id)} />
          </Suspense>
        </div>

        <div className="mt-6 mb-space-57">
          <DeleteDashboardButton dashboardId={id} />
        </div>
      </div>
    </div>
  );
}
