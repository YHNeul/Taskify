/**
 * @file 내 대시보드 목록 페이지 ( /mydashboard )
 * @description 내가 생성했거나 초대받은 대시보드들의 목록을 보여주는 화면입니다.
 * @note 리스트 데이터가 많아질 경우를 대비해 페이지네이션을 적용해야 합니다.
 */
import DashboardList from '@/components/mydashboard/DashboardList';
import InvitationList from '@/components/mydashboard/InvitationList';

export default async function MyDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-100 px-[24px] md:px-[40px]">
      <div className="max-w-[1022px] flex flex-col gap-[74px]">
        <section aria-label="나의 대시보드">
          <DashboardList />
        </section>

        <section aria-label="초대받은 대시보드">
          <InvitationList />
        </section>
      </div>
    </div>
  );
}
