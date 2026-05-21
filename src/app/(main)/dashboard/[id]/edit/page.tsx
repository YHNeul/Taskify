/**
 * @file 대시보드 수정 페이지 ( /dashboard/{id}/edit )
 * @description 대시보드 이름/색상 변경, 구성원 삭제, 새로운 유저 초대 기능을 다루는 화면입니다.
 * @note 구성원 목록과 초대 내역 각각에 대한 페이지네이션 처리가 필요합니다.
 */

import ArrowRightIcon from '@/components/common/Icon/ArrowRightIcon';
import DeleteDashboardButton from '@/components/dashboard/edit/DeleteDashboardButton';
import EditDashboardForm from '@/components/dashboard/edit/EditDashboardForm';
import ManageInvitations from '@/components/dashboard/edit/ManageInvitations';
import ManageMembers from '@/components/dashboard/edit/ManageMembers';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DashboardEditPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="w-full bg-gray-100 h-[calc(100dvh-64px)] overflow-y-auto">
      <div className="w-full max-w-[620px] px-[12px] md:px-[20px]">
        <Link
          href={`/dashboard/${id}`}
          className="pt-[16px] flex items-center gap-[6px] md:gap-[8px]"
        >
          <ArrowRightIcon className="w-[18px] rotate-180 md:w-[20px]" />
          <span className="text-md-medium text-gray-700 md:text-lg-medium mt-[1px]">
            돌아가기
          </span>
        </Link>

        <div className="mt-[10px] bg-white rounded-[8px] md:mt-[19px] lg:mt-[34px]">
          <EditDashboardForm dashboardId={id} />
        </div>

        <div className="mt-[16px] h-[337px] bg-white rounded-[8px] md:h-[404px]">
          <ManageMembers dashboardId={id} />
        </div>

        <div className="mt-[16px] h-[407px] bg-white rounded-[8px] md:h-[477px]">
          <ManageInvitations dashboardId={Number(id)} />
        </div>

        <div className="mt-[24px] mb-[57px]">
          <DeleteDashboardButton dashboardId={id} />
        </div>
      </div>
    </div>
  );
}
