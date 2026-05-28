/**
 * @file 내 대시보드 목록 페이지 ( /mydashboard )
 * @description 내가 생성했거나 초대받은 대시보드들의 목록을 보여주는 화면입니다.
 * @note 리스트 데이터가 많아질 경우를 대비해 페이지네이션을 적용해야 합니다.
 */
import { Suspense } from 'react';
import DashboardList from '@/shared/components/mydashboard/DashboardList';
import InvitationList from '@/shared/components/mydashboard/InvitationList';

export default async function MyDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-100 px-6 md:px-10">
      <div className="max-w-5xl flex flex-col gap-18">
        <section aria-label="나의 대시보드">
          <Suspense fallback={<div className="h-40" />}>
            <DashboardList />
          </Suspense>
        </section>

        <section aria-label="초대받은 대시보드">
          <InvitationList />
        </section>
      </div>
    </div>
  );
}
